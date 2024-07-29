#!/usr/bin/env bash

# Unzips a list of zip files into the current working directory.

set -e

show_help() {
  echo "Usage: $0 <zip-file> ..."
  echo ""
  echo "  <zip-file>: Space separated list of zip file paths."
}

if [[ "$#" -lt 1 ]]; then
  echo "ERROR: you must specify at least one zip file"
  show_help
  exit 1
fi

for path in "$@"
do
  if [[ ! -e "$path" ]]; then
    echo "ERROR: the file doesn't exist: $path"
    exit 1
  fi
  unzip -qq "$path"
done
