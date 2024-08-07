#!/usr/bin/env bash

# Watches SASS files of the themes and compiles them.

set -e

show_help() {
  echo "Usage: $0 <source-directory>"
  echo ""
  echo "  <source-directory>: Directory containing the themes' source files."
}

if [[ "$#" -ne 1 ]]; then
  echo "ERROR: Invalid number of arguments"
  show_help
  exit 1
fi

src="$1"

sass \
  --watch \
  --style=expanded \
  "${src}/fw-child/resources/scss:${src}/fw-child/resources/css" \
  "${src}/framework/resources/scss:${src}/framework/resources/css"
