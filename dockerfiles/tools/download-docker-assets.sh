#!/bin/bash

set -e

show_help() {
    echo "Usage: $0 <server_url>"
    echo "  <server_url>: URL to download the assets from."
}

if [[ "$#" -eq 0 ]]; then
    echo "ERROR: Missing server URL."
    show_help
    exit 1
fi

if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    show_help
    exit 0
fi

server=$1
url="$server/ssl/wildcard.climatedata.ca.tgz"
read -p "Enter username: " username

if [[ -n "$username" ]]; then
    read -s -p "Enter password: " password
    echo ""
    auth_option="--user=$username:$password"
else
    echo "No username provided."
    auth_option=""
fi

temp_dir=$(mktemp -d)
file_name=$(basename "$url")
full_path="$temp_dir/$file_name"

if [[ -n "$username" && -n "$password" ]]; then
    auth_option="--user=$username --password=$password"
else
    auth_option=""
fi

wget $auth_option -O "$full_path" "$url" || {
    echo "ERROR: Download failed."
    exit 1
}

if [[ "$file_name" == *.tgz ]]; then
    tar -xzf "$full_path" -C "$temp_dir" || {
        echo "ERROR: Extraction failed."
        exit 1
    }
else
    echo "ERROR: Not a TGZ file."
    exit 1
fi

destination="../mounts/ssl"
mv "$temp_dir"/* "$destination"
rm -rf "$temp_dir"