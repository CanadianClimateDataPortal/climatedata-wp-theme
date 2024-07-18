#!/usr/bin/env bash

# Compiles the SASS files of the themes' directory into CSS files.

set -e

show_help() {
  echo "Usage: $0 <source-directory> [<output-directory>]"
  echo ""
  echo "  <source-directory>: Directory containing the themes' source files."
  echo "  <output-directory>: Directory where to output the generated CSS files. The themes' directory structure will"
  echo "    be recreated. Defaults to the source directory."
}

if [[ "$#" -eq 0 || "$#" -gt 2 ]]; then
  echo "ERROR: Invalid number of arguments"
  show_help
  exit 1
fi

src="$1"
out="$2"

if [[ -z "$out" ]]; then
  out=$src
fi

sass \
  --style=compressed \
  --no-source-map \
  "${src}/fw-child/resources/scss:${out}/fw-child/resources/css" \
  "${src}/framework/resources/scss:${out}/framework/resources/css"
