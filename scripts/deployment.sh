#!/usr/bin/env bash

# Various utilities related the deployment of the Portal.
#
# See how to use this tool on the Confluence page related to the Portal and
# its deployments.
#
# USAGE: use the `help` command to see usage.

set -e

function _show_help {
  echo "Various utilities related the deployment of the Portal."
  echo ""
  echo "Usage: $(basename "$0") <command>"
  echo ""
  echo "Available commands:"
  echo "  help            Show help and usage."
  echo "  release-minor   Creates a release of the current Git commit, automatically incrementing the MINOR version and pushing the Docker image."
  echo "  deploy-uat      Deploy to UAT the current Git commit."
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
  [ -z "$action" ] && action="Do you want to continue?"

  echo -n "$msg [y/N]: "
    read -r ans

    if [[ "$ans" != "y" ]]; then
      echo "ABORTED"
      exit 1
    fi
}

# Validate with the user that the current commit is the one they want to process
function _validate_current_commit {
  action="$1"
  [ -z "$action" ] && action="do the operation"
  
  latest_commit_message=$(git log -1 --pretty=%B)
  commit_sha=$(git rev-parse --short HEAD)

  if [[ -z "$commit_sha" ]]; then
    echo "ERROR: Could not determine the commit's sha."
    exit 1
  fi

  echo "The current commit is: $commit_sha"
  echo "It has the following log message:"
  echo "  $latest_commit_message"
  echo ""
  _validate_with_user "Do you confirm it's for this commit you want to $action?"

}

function release-minor {
  docker_image_name_base="registry.gitlab.com/crim.ca/clients/ccdp/portal/deployment/portal"
  current_branch=$(git branch --show-current)
  commit_sha=$(git rev-parse --short HEAD)

  if [[ "$current_branch" != "main" ]]; then
    echo "ERROR: you are not on the 'main' branch, which is probably not what you want."
    exit 1
  fi

  _validate_current_commit "do a release"

  echo ""
  echo "Making a plan (no changes are being done)"
  echo "-> Pulling the Docker image that was built for this commit..."
  docker_image_name_commit="${docker_image_name_base}:${commit_sha}"

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

  ((minor++))

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
  echo "The following actions will be done:"
  echo "  - Git: A branch '${new_version_branch}' will be created at the current commit"
  echo "  - Git: A tag '${new_version_tag}' will be added to the current commit"
  echo "  - Docker: The tag '${new_version_tag}' will be added to the existing Docker image built for the current commit ('.../portal:${commit_sha}')"
  echo "  - Those Git and Docker changes will be pushed to their repositories"
  echo ""
  _validate_with_user "Do you wish to execute the changes (cannot be reverted)?"

  echo ""

  echo "Executing the changes"
  echo "-> Git: creating the new branch '$new_version_branch'..."
  git checkout -q -b "$new_version_branch"

  echo "-> Git: adding the tag '$new_version_tag'..."
  git tag "$new_version_tag"

  echo "-> Docker: adding the tag '$new_version_tag'..."
  docker image tag "${docker_image_name_commit}" "${docker_image_name_base}:${new_version_tag}"

  echo "-> Git: pushing to the repository..."
  git push -q --set-upstream origin "$new_version_branch"
  git push -q origin "$new_version_tag"

  # Restore the developer's branch to main
  git switch -q main

  echo "-> Docker: pushing to the repository..."
  docker push -q "${docker_image_name_base}:${new_version_tag}"

  echo ""
  echo -n "Do you also want to tag the Docker image with 'prod' and push it (required to update the production instance)? [y/N]: "
  read -r ans

  if [[ "$ans" == "y" ]]; then
    echo "-> Docker: adding the tag 'prod'..."
    docker image tag "${docker_image_name_commit}" "${docker_image_name_base}:prod"
    echo "-> Docker: pushing to the repository..."
    docker push -q "${docker_image_name_base}:prod"
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
  echo "WARN: deployment to QA is automatically done by pushing to the 'main' branch."
  echo "      You don't need to execute any command."
  exit 1
}

function deploy-uat {
  _validate_current_commit "deploy to UAT"

  echo ""

  echo "The following actions will be done:"
  echo "  - Git: Add the 'uat' tag to the current commit (deleting any existing 'uat' tag)"
  echo "  - Git: Push the 'uat' tag"
  echo ""
  _validate_with_user "Do you wish to execute the changes (cannot be reverted)?"

  echo ""

  echo "Executing the changes"
  echo "-> Git: deleting any existing 'uat' tag..."
  git tag -d uat
  echo "-> Git: adding the 'uat' tag to the current commit..."
  git tag uat
  echo "-> Git: pushing the 'uat' tag..."
  git push --force origin uat

  echo ""
  echo "DONE"
  echo "  The GitLab CI/CD pipeline will automatically deploy to UAT in a few minutes (up to 20 minutes)."
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
