#!/usr/bin/env bash

# Unzips a list of zip files from a source directory into the current working
# directory.

set -e

show_help() {
  echo "Usage: $0 <source-directory> <file-name> ..."
  echo ""
  echo "  <source-directory>: Directory containing the zip files."
  echo "  <file-name>: Space separated list of file names to unzip."
}

if [[ "$#" -lt 2 ]]; then
  echo "ERROR: you must specify a source directory and at least one zip file."
  show_help
  exit 1
fi

source_directory="$1"

if [ ! -d "$source_directory" ]; then
  echo "ERROR: the source directory doesn't exist: $path"
  exit 1
fi

shift

for file_name in "$@"
do
  path="$source_directory/$file_name"
  if [[ ! -e "$path" ]]; then
    echo "ERROR: the file doesn't exist: $path"
    exit 1
  fi
  unzip -qq "$path"
done
