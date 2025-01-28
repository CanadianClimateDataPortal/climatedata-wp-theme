#!/bin/bash

set -e

show_help() {
    echo "Usage: $0 <server_url> [--username <user>] [--password-file <file_path>]"
    echo "  <server_url>: URL to download the assets from."
    echo "  [--username <user>]: (Optional) Username for authentication. If provided, the script will prompt for the password."
    echo "  [--password-file <file_path>]: (Optional) password file for authentication."
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

if [[ "$#" -ge 2 && "$2" == --username* ]]; then
    username=${2#--username=}
else
    read -p "Enter username: " username
fi


if [[ "$#" -eq 3 && "$3" == --password-file* ]]; then
    password_file="${3#--password-file=}"
    if [[ ! -f "$password_file" ]]; then
        echo "ERROR: Password file '$password_file' does not exist."
        exit 1
    fi
    password=$(<"$password_file")
else
    read -s -p "Enter password: " password
    echo ""
fi

if [[ -z "$username" && -n "$password" ]]; then
    echo "ERROR: Password provided but no username entered." && exit 1
fi

auth_option="--user=$username --password=$password"


temp_dir=$(mktemp -d)
file_name=$(basename "$url")
full_path="$temp_dir/$file_name"

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
