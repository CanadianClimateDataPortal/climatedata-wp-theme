#!/usr/bin/env bash

# Tool to manage the development environment.
#
# USAGE: use the `help` command to see usage.

set -e

function _show_help {
  echo "Tool to manage the development environment."
  echo ""
  echo "Usage: $(basename "$0") <command>"
  echo ""
  echo "Available commands:"
  echo "  help                      Show help and usage."
  echo ""
  echo "  Docker Compose:"
  echo "    start                   Start the app's Docker Compose stack."
  echo "    stop                    Stop the app's Docker Compose stack."
  echo "    restart                 Restart the app's Docker Compose stack."
  echo "    compose <args...>       Execute a docker compose command. All <args...> are passed to docker compose."
  echo ""
  echo "  Portal:"
  echo "    portal-shell            Start a shell on the 'portal' container."
  echo "    wp-cli <args...>        Execute a 'wp-cli' command in the 'Portal' container. All <args...> are passed to wp-cli."
  echo "    nginx  <args...>        Execute a 'nginx' command in the 'Portal' container. All <args...> are passed to nginx."
  echo ""
  echo "  Database:"
  echo "    db-shell                Start a shell on the 'database' container."
  echo "    db-dump <database>      Dump to standard output the <database> database of the 'database' container."
  echo "    db-execute <database>   Execute the SQL script from standard input on the <database> database of the 'database' container."
  echo ""
  echo "  Task runner:"
  echo "    task-runner-shell       Start a shell on the 'Task runner' container."
  echo ""
  echo "  Other:"
  echo "    download-docker-assets <URL>   Download the required Docker assets from the given URL."
}

# Switch to the real directory of the script, so it still works when used from
# $PATH
if [[ "$OSTYPE" == "darwin"* ]]; then
  SCRIPT_PATH=$(dirname $(greadlink -f $0 || realpath $0))
else
  SCRIPT_PATH=$(dirname $(readlink -f $0 || realpath $0))
fi

cd "${SCRIPT_PATH}" || exit

function _docker_compose {
  USER_ID=$(id -u) GROUP_ID=$(id -g) docker compose "$@"
}

function _check_for_required_build_assets {
  local required_dirs=("dockerfiles/mounts/wp-plugins" "dockerfiles/mounts/ssl")
  local error_found=false
  
  for dir in "${required_dirs[@]}"; do
    if [[ ! -d "$dir" ]]; then
      error_found=true
      break
    elif [[ -z "$(ls -A "$dir" 2>/dev/null)" ]]; then
      error_found=true
      break
    fi
  done
  
  if [[ "$error_found" == true ]]; then
    echo    "[WARNING] Some assets are required to build the Portal image, but they cannot be found. To download those assets, cancel this process and run:"
    echo    "            ./dev.sh download-docker-assets <URL>"
    read -p "          Do you want to cancel this process? [Y/n]? " -n 1 -r
    
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
      echo "Cancelled."
      exit 1
    fi
  fi
}

function start {
  _check_for_required_build_assets
  # The Task Runner image must be built before building the Portal image, so
  # we start it (i.e. build it, if required) first before starting the other
  # services.
  _docker_compose up -d task-runner
  _docker_compose up -d
}

function stop {
  _docker_compose down
}

function restart {
  stop
  start
}

function compose {
  _docker_compose "$@"
}

function download-docker-assets {
  ./dockerfiles/tools/download-docker-assets.sh "$@"
}

function portal-shell {
  _docker_compose exec -it portal bash
}

function wp-cli {
  _docker_compose exec -w /var/www/html portal wp "$@"
}

function db-shell {
  _docker_compose exec -it db bash
}

function db-dump {
  database="$1"

  if [[ -z "$database" ]]; then
    echo "First argument must be the name of a database"
    exit 1
  fi

  _docker_compose exec -T db mysqldump -proot --routines "$database"
}

function db-execute {
  database="$1"

  if [[ -z "$database" ]]; then
    echo "First argument must be the name of a database"
    exit 1
  fi
  _docker_compose exec -T db mysql -proot "$database"
}

function nginx {
  _docker_compose exec -T portal nginx "$@"
}

function task-runner-shell {
  _docker_compose exec -it task-runner bash
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
