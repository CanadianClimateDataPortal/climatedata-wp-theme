#!/usr/bin/env bash

# Lint the source code using ESLint (map and download apps)

# Enable strict mode
set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Utility functions
log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $*${NC}"
}

error() {
    echo -e "${RED}ERROR: $*${NC}" >&2
    exit 1
}

# Show help message
show_help() {
    echo "Usage: $(basename "$0") <source-directory>"
    echo "Lint the source code of the map and download apps using ESLint"
}

# Validate input
if [ "$#" -ne 1 ]; then
    error "Please provide the source directory"
    show_help
    exit 1
fi

# Set source directory.
src=$1

# Validate directory
[ ! -d "$src" ] && error "Directory not found: $src"

# Check dependencies
for cmd in node npm; do
    command -v "$cmd" >/dev/null 2>&1 || error "$cmd is required but not installed"
done

# Change to apps directory
cd "${src}/apps" || error "Apps directory not found"

log "Installing dependencies..."
npm install

log "Running linter..."
npm run lint
