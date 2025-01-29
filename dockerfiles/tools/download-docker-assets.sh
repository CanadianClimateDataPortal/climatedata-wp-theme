#!/bin/bash

# Downloads SSL files and specific WordPress plugins from the server to local directories.

set -e

show_help() {
    echo "Usage: $0 <server_url> [--username <username>] [--password-file <file_path>]"
    echo "  <server_url>: URL to download the assets from."
    echo "  [--username <username>]: (Optional) Username for authentication. If provided, the script will prompt for the password."
    echo "  [--password-file <file_path>]: (Optional) password file for authentication."
    echo ""
    echo "  If no authentication options are provided, the script will prompt for both username and password interactively."
    echo ""
}

initialize_variables() {
    url_ssl="$server/ssl/wildcard.climatedata.ca.tgz"
    url_wp="$server/wp-plugins"
    temp_dir=$(mktemp -d)
    file_name=$(basename "$url_ssl")
    temp_full_path="$temp_dir/$file_name"
    destination_ssl="../mounts/ssl"
    destination_wp="../mounts/wp-plugins"
    file_list="../build/www/wp-plugins/local.txt"
}

authenticate_user() {
    if [[ "$#" -ge 2 && "$2" == --username* ]]; then
        username=${2#--username=}
    else
        read -p "Enter username: " username
    fi

    if [[ "$#" -eq 3 && "$3" == --password-file* ]]; then
        password_file="${3#--password-file=}"
        if [[ -f "$password_file" ]]; then
            password=$(<"$password_file")
        else
            echo "ERROR: Password file '$password_file' does not exist."
            exit 1
        fi
    elif [[ -n "$username" ]]; then
        read -s -p "Enter password: " password
        echo ""
    fi

    if [[ -z "$username" && -n "$password" ]]; then
        echo "ERROR: Password provided but no username entered."
        exit 1
    fi

    if [[ -n "$username" && -n "$password" ]]; then
        auth_option="-u $username:$password"
    else
        auth_option=""
    fi
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
    local temp_full_path=$1
    local url=$2

    validate_url "$url"

    curl $auth_option -o "$temp_full_path" "$url" || {
        echo "ERROR: Download failed for URL: $url"
        exit 1
    }
}

# extract_file() {
#     local file=$1
#     local destination_ssl=$2

#     mkdir -p "$destination_ssl"

#     if [[ "$file" == *.tgz ]]; then
#         tar -xzf "$file" -C "$destination_ssl" || {
#             echo "ERROR: Extraction failed."
#             exit 1
#         }
#     else
#         echo "ERROR: Not a TGZ file."
#         exit 1
#     fi
# }
extract_file() {
    local file=$1
    local temp_full_path=$2

    if [[ "$file" == *.tgz ]]; then
        tar -xzf "$file" -C "$temp_full_path" || {
            echo "ERROR: Extraction failed."
            exit 1
        }
    else
        echo "ERROR: Not a TGZ file."
        exit 1
    fi
}

download_from_list() {
    local file_list=$1
    local url_wp=$2
    local destination_wp=$3

    mkdir -p "$destination_wp"

    while IFS= read -r file; do
        [[ -z "$file" || "$file" =~ ^# ]] && continue

        curl $auth_option --fail "$url_wp/$file" -o "$destination_wp/$file" || {
            echo "ERROR: $file Download failed."
        }
    done <"$file_list"
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
authenticate_user "$@"
download_file "$temp_full_path" "$url_ssl"
# extract_file "$temp_full_path" "$destination_ssl"

# rm -rf "$temp_dir"

extract_file "$temp_full_path" "$temp_dir"

mkdir -p "$destination_ssl"
mv "$temp_dir"/* "$destination_ssl"
rm -rf "$temp_dir"

download_from_list "$file_list" "$url_wp" "$destination_wp"