#!/usr/bin/env bash

# TODO: réfléchir aux étapes à faire lors d'un hotfix: premièrement mettre en preprod? Alors il faudrait que ce soit dans
#   preprod qu'on fasse le build. Possibilité de faire un build sans passer par preprod? Ensuite pour hotfix on ne build
#   pas l'image, on fait juste mettre les tags?

# Various utilities related the deployment of the Portal.
#
# See how to use this tool on the Confluence page related to the Portal and
# its deployments.
#
# USAGE: use the `help` command to see usage.

set -e

PORTAL_DOCKER_IMAGE_BASE_NAME="registry.gitlab.com/crim.ca/clients/ccdp/portal/deployment/portal"

function _show_help {
  echo "Various utilities related the deployment of the Portal."
  echo ""
  echo "Usage: $(basename "$0") <command>"
  echo ""
  echo "Available commands:"
  echo "  help            Show help and usage."
  # TODO: revoir les descriptions
  echo "  release-minor   Creates a MINOR release of the current Git commit (incrementing the MINOR version) and pushed the Docker image."
  echo "  release-hotfix  Builds and push a Docker image for the current Git commit and creates a 'hot fix' release (incrementing the HOTFIX version)."
  echo "  deploy-uat      Deploy to UAT the current Git commit."
  echo "  deploy-preprod  Deploy to Pre-prod the current Git commit."
}

# Switch to the real directory of the script, so it still works when used from
# $PATH
if [[ "$OSTYPE" == "darwin"* ]]; then
  SCRIPT_PATH=$(dirname $(greadlink -f $0 || realpath $0))
else
  SCRIPT_PATH=$(dirname $(readlink -f $0 || realpath $0))
fi

cd "${SCRIPT_PATH}/.." || exit

function _docker_compose {
  USER_ID=$(id -u) GROUP_ID=$(id -g) docker compose "$@"
}

function compose {
  _docker_compose "$@"
}

function _validate_with_user {
  msg="$1"
  [ -z "$msg" ] && msg="Do you want to continue?"

  echo -n "$msg [y/N]: "
    read -r ans

    if [[ "$ans" != "y" ]]; then
      echo "ABORTED"
      exit 1
    fi
}

function _validate_is_latest_commit {
  current_branch=$(git branch --show-current)
  local_sha="$(git rev-parse HEAD)"
  remote_sha="$(git ls-remote --heads origin "refs/heads/$current_branch" | awk '{print $1}')"

  if [[ -z "$remote_sha" ]]; then
    echo "The branch '$current_branch' doesn't exist on origin"
    exit 1
  fi

  if [[ "$local_sha" != "$remote_sha" ]]; then
    echo "WARNING: The current commit is not the latest commit of the branch '$current_branch' on the remote."
    echo "  If this is not what you want, you need to do a git push or git pull."
    _validate_with_user "Do you still want to continue with the current commit?"
    echo ""
  fi
}

# Validate with the user that the current commit is the one they want to process
function _validate_current_commit {
  action="$1"
  [ -z "$action" ] && action="do the operation"

  current_branch=$(git branch --show-current)
  latest_commit_message=$(git log -1 --pretty=%B)
  commit_sha=$(git rev-parse --short HEAD)

  if [[ -z "$commit_sha" ]]; then
    echo "ERROR: Could not determine the commit's sha."
    exit 1
  fi

  echo "The current commit is: $commit_sha (on branch '$current_branch')"
  echo "It has the following log message:"
  # shellcheck disable=SC2001
  echo "$latest_commit_message" | sed 's/^/>  /'
  echo ""
  _validate_with_user "Do you confirm it's for this commit you want to $action?"

}

# Do a "Git tag" deployment: add a specific tag to the current commit.
#
# Arguments:
#  - The tag to add
function _git_tag_deploy {
  tag="$1"

  if [[ -z "$tag" ]]; then
    echo "Tag must be supplied as first argument"
    exit 1
  fi

  _validate_is_latest_commit
  _validate_current_commit "do the deployment"

  echo ""

  echo "The following actions will be done:"
  echo "  - Git: Add the '$tag' tag to the current commit (deleting any existing '$tag' tag)"
  echo "  - Git: Push the '$tag' tag"
  echo ""
  _validate_with_user "Do you wish to execute the changes (cannot be reverted)?"

  echo ""

  echo "Executing the changes"
  echo "-> Git: deleting any existing '$tag' tag..."
  git tag -d "$tag"
  echo "-> Git: adding the '$tag' tag to the current commit..."
  git tag "$tag"
  echo "-> Git: pushing the '$tag' tag..."
  git push --force origin "$tag"

  echo ""
  echo "DONE"
  echo "The GitLab CI/CD pipeline will now automatically deploy in a few minutes (up to 20 minutes)."
}

function release-hotfix {
  current_branch=$(git branch --show-current)
  commit_sha=$(git rev-parse --short HEAD)

  if [[ ! ("$current_branch" =~ ^release/v([0-9]+)\.([0-9]+)\.x$) ]]; then
    echo "ERROR: A hotfix release can only be done on a version branch (the current branch is '$current_branch')."
    echo "  A version branch has a name like 'release/v[MAJOR].[MINOR].x' where [MAJOR] and [MINOR] are numbers."
    echo "  See the Confluence documentation about Portal releases."
    exit 1
  fi

  major="${BASH_REMATCH[1]}"
  minor="${BASH_REMATCH[2]}"

  _validate_is_latest_commit
  _validate_current_commit "do a 'hotfix' release"

  echo ""
  echo "Making a plan (no changes are being done)"

  echo "-> Checking if the Task Runner is running"

  tr_container_id="$(./dev.sh compose ps -q task-runner)"

  if [ -z "$tr_container_id" ] || \
     [ "$(docker inspect -f '{{.State.Running}}' "$tr_container_id" 2>/dev/null)" != "true" ]; \
  then
    echo "ERROR: The Task runner is not running. It's required to build the Docker image."
    echo "  You can start it with:"
    echo "  ./dev.sh compose up -d task-runner"
    exit 1
  fi

  echo "-> Checking if the current branch is the latest"

  possible_next_minor=$((minor + 1))
  possible_next_version_branch="release/v${major}.${possible_next_minor}.x"

  if git ls-remote --exit-code --heads origin "$possible_next_version_branch" > /dev/null 2>&1; then
    echo ""
    echo "    WARNING: The current release branch ($current_branch) is not the latest (there is at least a branch '$possible_next_version_branch')."
    _validate_with_user "    Do you really want to create a hotfix for the current (older) version?"
    echo ""
  fi

  echo "-> Retrieving the last version of the current version branch (${major}.${minor}.*) ..."
  latest_version_tag=$(git ls-remote --tags origin "v${major}.${minor}.*" | cut -f2 | cut -d'/' -f3 | sort -r | head -n 1)

  if [[ ! ("$latest_version_tag" =~ ^v[0-9]+\.[0-9]+\.([0-9]+)$) ]]; then
    echo "ERROR: Was expecting latest version tag to be v${major}.${minor}.[HOTFIX] where [HOTFIX] is a number. Instead received: '$latest_version_tag'"
    exit 1
  fi

  echo "    The last version tag is: $latest_version_tag"

  hotfix="${BASH_REMATCH[1]}"
  hotfix=$((hotfix + 1))

  new_version_tag="v${major}.${minor}.${hotfix}"

  echo "    The NEW version tag will be: $new_version_tag"

  echo ""
  echo "The following actions will be done (in order):"
  echo "  - Docker: A Portal image will be built for the current commit"
  echo "  - Docker: This image will be tagged with '${new_version_tag}' and the current commit's SHA '${commit_sha}'"
  echo "  - Git: A tag '${new_version_tag}' will be added to the current commit"
  echo "  - Git: The tag will be pushed"
  echo "  - Docker: The image will be pushed"
  echo ""
  _validate_with_user "Do you wish to execute the changes (cannot be canceled or reverted)?"

  echo ""

  echo "Executing the changes..."

  echo "-> Docker: building and tagging the image..."
  echo docker build \
      --target production \
      --build-arg TASK_RUNNER_IMAGE=climatedata-task-runner:dev \
      --build-arg LOCAL_WP_PLUGINS_DIR=dockerfiles/mounts/wp-plugins \
      -t "registry.gitlab.com/crim.ca/clients/ccdp/portal/deployment/portal:$commit_sha" \
      -t "registry.gitlab.com/crim.ca/clients/ccdp/portal/deployment/portal:$new_version_tag" \
      .

  echo "-> Git: adding the tag '$new_version_tag'..."
  git tag "$new_version_tag"

  echo "-> Git: pushing to the repository..."
  git push -q --set-upstream origin "$new_version_branch"
  git push -q origin "$new_version_tag"

  echo "-> Docker: pushing to the repository..."
  docker push -q "${PORTAL_DOCKER_IMAGE_BASE_NAME}:${new_version_tag}"

}

function release-minor {
  current_branch=$(git branch --show-current)
  commit_sha=$(git rev-parse --short HEAD)

  if [[ "$current_branch" != "main" ]]; then
    echo "ERROR: you are not on the 'main' branch, which is probably not what you want."
    exit 1
  fi

  _validate_is_latest_commit
  _validate_current_commit "do a 'minor' release"

  echo ""
  echo "Making a plan (no changes are being done)"

  echo "-> Pulling the Docker image that was built for this commit..."
  docker_image_name_commit="${PORTAL_DOCKER_IMAGE_BASE_NAME}:${commit_sha}"

  if ! docker pull "$docker_image_name_commit" > /dev/null 2>&1; then
    echo "ERROR: Could not retrieve the Docker image built for the current commit. Only a commit that has been previously deployed in QA can be released. (Could not find image: $docker_image_name_commit)"
    exit 1
  fi

  echo "-> Retrieving the last used version tag..."
  latest_version_tag=$(git ls-remote --tags origin "v*" | cut -f2 | cut -d'/' -f3 | sort -r | head -n 1)

  if [[ ! ("$latest_version_tag" =~ ^v([0-9]+)\.([0-9]+)\.[0-9]+$) ]]; then
    echo "ERROR: Was expecting latest version tag to be vX.Y.Z, instead received: '$latest_version_tag'"
    exit 1
  fi

  echo "    The last used version tag is: $latest_version_tag"

  major="${BASH_REMATCH[1]}"
  minor="${BASH_REMATCH[2]}"

  minor=$((minor + 1))

  new_version_tag_prefix="v${major}.${minor}"
  new_version_branch="release/${new_version_tag_prefix}.x"
  new_version_tag="${new_version_tag_prefix}.0"

  echo "    The NEW version tag will be: $new_version_tag"
  echo "-> Validating that the branch doesn't already exist..."

  if git ls-remote --exit-code --heads origin "$new_version_branch" > /dev/null 2>&1; then
    echo "ERROR: Remote Git already has a branch for the new release (${new_version_branch})"
    exit 1
  fi

  echo ""
  echo "The following actions will be done (in order):"
  echo "  - Git: A branch '${new_version_branch}' will be created at the current commit"
  echo "  - Git: A tag '${new_version_tag}' will be added to the current commit"
  echo "  - Docker: The tag '${new_version_tag}' will be added to the existing Docker image built for the current commit ('.../portal:${commit_sha}')"
  echo "  - Git: The Git changes will be pushed"
  echo "  - Docker: The Docker change will be pushed"
  echo ""
  _validate_with_user "Do you wish to execute the changes (cannot be reverted)?"

  echo ""

  echo "Executing the changes..."
  echo "-> Git: creating the new branch '$new_version_branch'..."
  git checkout -q -b "$new_version_branch"

  echo "-> Git: adding the tag '$new_version_tag'..."
  git tag "$new_version_tag"

  echo "-> Docker: adding the tag '$new_version_tag'..."
  docker image tag "${docker_image_name_commit}" "${PORTAL_DOCKER_IMAGE_BASE_NAME}:${new_version_tag}"

  echo "-> Git: pushing to the repository..."
  git push -q --set-upstream origin "$new_version_branch"
  git push -q origin "$new_version_tag"

  # Restore the developer's branch to main
  git switch -q main

  echo "-> Docker: pushing to the repository..."
  docker push -q "${PORTAL_DOCKER_IMAGE_BASE_NAME}:${new_version_tag}"

  echo ""
  echo -n "Do you also want to tag the Docker image with 'prod' and push it (required to update the production instance)? [y/N]: "
  read -r ans

  if [[ "$ans" == "y" ]]; then
    echo "-> Docker: adding the tag 'prod'..."
    docker image tag "${docker_image_name_commit}" "${PORTAL_DOCKER_IMAGE_BASE_NAME}:prod"
    echo "-> Docker: pushing to the repository..."
    docker push -q "${PORTAL_DOCKER_IMAGE_BASE_NAME}:prod"
  fi

  echo ""
  echo "DONE"
  echo "To update the production instance, connect to it and run:"
  echo "  app-manager compose pull portal"
  echo "  app-manager restart"

}

# This function is just a small warning for the user in case they try 'deploy-qa'
# It's voluntarily not listed in the help message.
function deploy-qa {
  echo "ERROR: deployment to QA is automatically done by pushing to the 'main' branch."
  echo "You don't need to execute any command."
  exit 1
}

function deploy-uat {
  _git_tag_deploy "uat"
}

function deploy-preprod {
  _git_tag_deploy "preprod"
}

####
# Process command argument
####

if [ $# -lt 1 ]; then
  _show_help
  exit 1
fi

command=$1
shift

case $command in
  --help|-h|help)
    _show_help
    ;;
  *)
    if declare -F "$command" > /dev/null && [[ "$command" != _* ]]; then
      $command "$@"
    else
      echo "Unknown command : $command"
      _show_help
      exit 1
    fi
    ;;
esac
