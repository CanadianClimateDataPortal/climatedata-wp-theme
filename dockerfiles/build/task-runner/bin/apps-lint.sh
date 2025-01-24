#!/usr/bin/env bash

# Apps linter (map, download)
# Usage example (host machine): docker exec -it climatedata-dev-task_runner-1 apps-lint.sh /app

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
    echo "Apps linter (map, download)"
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
for cmd in node npm sass concurrently; do
    command -v "$cmd" >/dev/null 2>&1 || error "$cmd is required but not installed"
done

# Change to apps directory
cd "${src}/fw-child/apps/apps-src" || error "Apps directory not found"

# Setup correct Node environment
log "Setting up Node.js environment..."

if [ -f "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh" --no-use >/dev/null 2>&1

    if [ -f ".nvmrc" ]; then
        nvm install || error "Failed to install Node.js version"
        nvm use || error "Failed to use Node.js version"
    fi
else
    error "NVM not found"
fi

log "Installing dependencies..."
npm install

log "Running linter..."
npm run lint
