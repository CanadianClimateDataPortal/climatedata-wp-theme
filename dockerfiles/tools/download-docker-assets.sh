#!/usr/bin/env bash

set -e

show_help() {
    echo "Sets up necessary files for Docker by downloading SSL files and specific WordPress plugins from the server to local directories."
    echo ""
    echo "Usage: $0 <server_url> [--username=<username>] [--password-file=<file_path>]"
    echo "  <server_url>: URL to download the assets from."
    echo "  --username=<username>: Username for authentication."
    echo "  --password-file=<file_path>: File containing the password for authentication."
    echo ""
    echo "Any missing authentication information will be requested interactively."
    echo ""
}

initialize_variables() {
    script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    ssl_archive_url="$server/ssl/wildcard.climatedata.ca.tgz"
    wp_plugins_url="$server/wp-plugins"
    temp_download_dir=$(mktemp -d)
    ssl_archive_filename=$(basename "$ssl_archive_url")
    ssl_archive_temp_path="$temp_download_dir/$ssl_archive_filename"
    ssl_destination_dir="$script_dir/../mounts/ssl"
    wp_plugins_destination_dir="$script_dir/../mounts/wp-plugins"
    wp_plugins_list_file="$script_dir/../build/www/wp-plugins/local.txt"
}

process_arguments() {
    shift
    while [[ "$#" -gt 0 ]]; do
        case "$1" in
        --username=*)
            username="${1#--username=}"
            ;;
        --password-file=*)
            password_file="${1#--password-file=}"
            if [[ -f "$password_file" ]]; then
                password=$(<"$password_file")
            else
                echo "ERROR: Password file '$password_file' does not exist."
                exit 1
            fi
            ;;
        *)
            echo "ERROR: Invalid argument '$1'"
            exit 1
            ;;
        esac
        shift
    done
}

handle_user_input() {
    if [[ -z "$username" ]]; then
        read -p "Enter username: " username
    fi

    if [[ -z "$password" && -n "$username" ]]; then
        read -s -p "Enter password: " password
        echo ""
    fi

    if [[ -z "$username" && -n "$password" ]]; then
        echo "ERROR: Password provided but no username entered."
        exit 1
    elif [[ -n "$username" && -n "$password" ]]; then
        auth_option="-u $username:$password"
    else
        auth_option=""
    fi
}

setup_authentification() {
    process_arguments "$@"
    handle_user_input
}

validate_url() {
    local url=$1
    http_status=$(curl -s -o /dev/null -w "%{http_code}" $auth_option "$url")

    if [[ "$http_status" -ne 200 && "$http_status" -ne 401 ]]; then
        echo "ERROR: $url is not valid or does not return a successful status. HTTP status: $http_status"
        exit 1
    fi
}

download_file() {
    local url=$1
    local ssl_archive_temp_path=$2

    validate_url "$url"

    curl $auth_option -o "$ssl_archive_temp_path" "$url" || {
        echo "ERROR: Download failed for URL: $url"
        exit 1
    }
}

extract_file() {
    local file=$1
    local ssl_destination_dir=$2

    mkdir -p "$ssl_destination_dir"

    if [[ "$file" == *.tgz ]]; then
        tar -xzf "$file" -C "$ssl_destination_dir" || {
            echo "ERROR: "$file" extraction failed."
            exit 1
        }
    else
        echo "ERROR: "$file" not a TGZ file."
        exit 1
    fi

    rm -rf "$temp_download_dir"
}

download_from_list() {
    local wp_plugins_list_file=$1
    local wp_plugins_url=$2
    local wp_plugins_destination_dir=$3

    mkdir -p "$wp_plugins_destination_dir"

    while IFS= read -r file; do
        [[ -z "$file" || "$file" =~ ^# ]] && continue

        curl $auth_option --fail "$wp_plugins_url/$file" -o "$wp_plugins_destination_dir/$file" || {
            echo "ERROR: $file Download failed."
        }
    done <"$wp_plugins_list_file"
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
initialize_variables
setup_authentification "$@"
download_file "$ssl_archive_url" "$ssl_archive_temp_path"
extract_file "$ssl_archive_temp_path" "$ssl_destination_dir"
download_from_list "$wp_plugins_list_file" "$wp_plugins_url" "$wp_plugins_destination_dir"
