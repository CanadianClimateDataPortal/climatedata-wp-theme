#!/usr/bin/env bash

# Unzips all zip files from a source directory into the current working directory.

set -e

show_help() {
  echo "Usage: $0 <source-directory>"
  echo ""
  echo "  <source-directory>: Directory containing the zip files to extract."
}

if [[ "$#" -ne 1 ]]; then
  echo "ERROR: you must specify the source directory"
  show_help
  exit 1
fi

dir=$1

if ls "$dir"/*.zip 1> /dev/null 2>&1; then \
  unzip -qq "$dir"/\*.zip; \
fi
