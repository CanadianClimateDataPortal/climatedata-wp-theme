#!/usr/bin/env bash

# Tool to manage the development environment.
#
# USAGE: use the `help` command to see usage.

set -e

function _show_help {
  echo "Tool to manage the development environment."
  echo ""
  echo "Usage: $(basename "$0") <command> [arguments]"
  echo ""
  echo "Available commands:"
  echo "  help                      Show help and usage."
  echo ""
  echo "  Docker Compose:"
  echo "    start                   Start the app's Docker Compose stack"
  echo "    stop                    Stop the app's Docker Compose stack"
  echo "    restart                 Restart the app's Docker Compose stack"
  echo "    download-docker-assets <URL>   Download the required Docker assets from the given URL"
  echo ""
  echo "  Portal:"
  echo "    portal-shell            Start a shell on the 'portal' container"
  echo "    wp-cli <arg>...         Execute a 'wp-cli' command in the 'Portal' container. All <arg> are passed to wp-cli."
  echo ""
  echo "  Nginx:"
  echo "    nginx <arg>...          Execute a 'nginx' command in the 'Portal' container. All <arg> are passed to nginx."
  echo ""
  echo "  Database:"
  echo "    db-shell                Start a shell on the 'database' container"
  echo "    db-dump <database>      Dump to standard output the <database> database of the 'database' container"
  echo "    db-execute <database>   Execute the SQL script from standard input on the <database> database of the 'database' container"
  echo ""
  echo "  Task runner:"
  echo "    task-runner-shell       Start a shell on the 'Task runner' container"
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

function start {
  _docker_compose up -d
}

function stop {
  _docker_compose down
}

function restart {
  stop
  start
}

function download-docker-assets {
  ./dockerfiles/tools/download-docker-assets.sh "$@"
}

function portal-shell {
  _docker_compose exec -it portal bash
}

function wp-cli {
  _docker_compose exec -w /var/www/html portal wp --allow-root "$@"
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
  _docker_compose exec -it task_runner bash
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
