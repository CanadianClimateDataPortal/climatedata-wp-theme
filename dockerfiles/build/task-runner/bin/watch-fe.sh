#!/usr/bin/env bash

# Assets watcher and compiler
# Watches and compiles frontend assets for themes and apps (map, download)

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
    echo "Watches and compiles frontend assets for themes and apps (map, download)"
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
cd "${src}/apps" || error "Apps directory not found"

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

log "Watching frontend assets..."
concurrently \
    --names "APPS,THEMES" \
    "npm run watch" \
    "sass --watch --style=expanded \
        ${src}/fw-child/resources/scss:${src}/fw-child/resources/css \
        ${src}/framework/resources/scss:${src}/framework/resources/css"
