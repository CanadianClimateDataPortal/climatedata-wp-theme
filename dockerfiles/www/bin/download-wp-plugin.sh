#!/usr/bin/env bash

# Downloads specific version of plugins from the Wordpress repository and unzips them in the current working directory.

set -e

show_help() {
  echo "Usage: $0 <slug>=<version> ..."
  echo ""
  echo "  <slug>: Slug of the plugin, on the Wordpress' plugin repository"
  echo "  <version>: Exact version (X.Y.Z) of the plugin to download. The version must be available for download"
  echo "    (plugin authors frequently remove older versions from the repository)."
}

if [[ "$#" -eq 0 ]]; then
  echo "ERROR: Specify at least one plugin specification (<slug>=<version>)"
  show_help
  exit 1
fi

plugin_files=()

for specification in "$@"
do
  IFS='=' read -ra specification_parts <<< "$specification"
  slug="${specification_parts[0]}"
  version="${specification_parts[1]}"
  
  if [[ -z $slug || -z $version ]]; then
    echo "ERROR: Invalid plugin specification: $specification"
    echo "Make sure to specify both the slug and the version number"
    show_help
    exit 1
  fi
  
  api_request_url="https://api.wordpress.org/plugins/info/1.1/?action=plugin_information&request[slug]=$slug"
  download_url=$(curl -gs $api_request_url | jq -r ".versions[\"$version\"]" 2>/dev/null || echo "null")
  
  if [ "$download_url" ==  "null" ]; then
    echo "ERROR: Could not find '$slug' version '$version' on Wordpress API ($api_request_url)"
    exit 1
  fi
  
  plugin_files=("${plugin_files[@]}" "$download_url")
done

for plugin_url in "${plugin_files[@]}"; do
  echo "Downloading and unpacking plugin: $plugin_url"
  tmp_file=$(mktemp)
  curl -s "$plugin_url" > "$tmp_file"
  
  if ! unzip -t "$tmp_file" 2>/dev/null; then
    echo "ERROR: Downloaded plugin is not a zip file. Check the plugin's URL for error."
    exit 1
  fi
  
  unzip -qq "$tmp_file"
  rm "$tmp_file"
done
