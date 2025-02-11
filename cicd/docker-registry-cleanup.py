import argparse
import requests
from datetime import datetime

important_tags = ["preprod", "uat", "qa"]

HEADERS = {}

def make_api_request(method, url):
    """
    Makes an API request to the given URL using the specified HTTP method.
    Exits the program if the request fails.
    
    Args:
    - method (str): The HTTP method to use (GET, POST, etc.)
    - url (str): The URL to send the request to.
    
    Returns:
    - dict: The response data in JSON format.
    """
    response = requests.request(method, url, headers=HEADERS)
    if response.status_code != 200:
        print(f"Error {response.status_code} retrieving data from {url}.")
        print(response.text)
        exit(1)
    return response.json()

def get_repository_path(api_url, project_id):
    """
    Retrieves the repository path for a specific repository within a GitLab project.
    
    Args:
    - api_url (str): The base URL of the GitLab API.
    - project_id (str): The ID of the GitLab project.
    
    Returns:
    - str: The full path of the repository, or None if not found.
    """
    repo_url = f"{api_url}/{project_id}/registry/repositories"
    repositories = make_api_request("GET", repo_url)

    if not repositories:
        print("No repository found in the registry.")
        exit(1)

    portal_repo = next(
        (repo for repo in repositories if repo.get("name") == "portal"), None
    )

    if portal_repo:
        return f"{repo_url}/{portal_repo['id']}"
    else:
        print("No repository named 'portal' found.")
        return None


def get_tag_info(repo_path, tag):
    """
    Retrieves detailed information (digest and creation date) for a specific tag in the repository.
    
    Args:
    - repo_path (str): The full repository path.
    - tag (str): The name of the tag to query.
    
    Returns:
    - tuple: A tuple containing the digest and the creation date of the tag.
    """
    url = f"{repo_path}/tags/{tag}"

    tag_info = make_api_request("GET", url)
    return tag_info.get("digest"), tag_info.get("created_at")

def get_all_tags(repo_path):
    """
    Retrieves all tags available in the repository.
    
    Args:
    - repo_path (str): The full repository path.
    
    Returns:
    - list: A list of all tag metadata.
    """
    tags = make_api_request("GET", f"{repo_path}/tags") or []
    if not tags:
        print("No tags found for this repository.")
    return tags

def get_non_important_tags(tags, repo_path):
    """
    Filters out important tags and returns only non-important tags 

    Args:
    - tags (list): List of all tags retrieved from the repository.
    - repo_path (str): The full repository path.
    
    Returns:
    - dict: A dictionary of non-important tags with their digests and creation dates.
    """
    tag_digests_important = {}
    tag_digests_not_important = {}
    all_digests = {}

    for tag in tags:
        tag_name = tag["name"]
        digest, created_at = get_tag_info(repo_path, tag_name)
        if digest:
            all_digests[tag_name] = {"digest": digest, "created_at": created_at}

    for tag_name, tag_info in all_digests.items():
        if tag_name in important_tags:
            tag_digests_important[tag_name] = tag_info
        else:
            tag_digests_not_important[tag_name] = tag_info

    important_digests = set(
        tag_info["digest"] for tag_info in tag_digests_important.values()
    )

    for tag_name, tag_info in list(tag_digests_not_important.items()):
        if tag_info["digest"] in important_digests:
            tag_digests_important[tag_name] = tag_info
            del tag_digests_not_important[tag_name]

    return tag_digests_not_important
    

def sort_and_retaining_n_latest(tags_dict, n):
    """
    Sorts tags by creation date in descending order

    Args:
    - items_dict (dict): A dictionary of tags that are not marked as important.
    - n (int): The number of most recent tags to ignore (i.e., not delete).
    Returns:
    - list: A list of tags that should be deleted.
    """
    sorted_tags = sorted(
        tags_dict.items(),
        key=lambda x: datetime.fromisoformat(x[1]["created_at"]),
        reverse=True,
    )
    return sorted_tags[n:]

def delete_old_tags(tags, n):
    """
    Deletes tags that are older than the n most recent ones.

    Args:
    - tags (list): The list of tags to delete.
    - n (int): The number of most recent tags to keep.
    """

    if tags:
        print("Deleting the following tags (older than the {} most recent ones):".format(n))
        for tag in tags:
            print(
            f"Tag: {tag[0]}, Digest: {tag[1]['digest']}, Created At: {tag[1]['created_at']}"
        )
            # tag_name = tag[0]
            # delete_url = f"{repo_path}/tags/{tag_name}"
            # response = make_api_request("DELETE", delete_url)
            # if response == {}:
            #     print(f"Successfully deleted tag: {tag_name}")
            # else:
            #     print(f"Failed to delete tag: {tag_name}.")
    else:
        print(f"No tags to delete after keeping the {n} most recent ones.")


def main():
    global HEADERS

    parser = argparse.ArgumentParser(description="Clean up Docker image tags in GitLab Container Registry, keeping the most recent tags as specified.")
    parser.add_argument("api_url", help="GitLab project API URL")
    parser.add_argument(
        "--token", required=True, help="GitLab API authentication token."
    )
    parser.add_argument("--project_id", required=True, help="GitLab project ID")
    parser.add_argument(
        "--nb_to_keep", type=int, required=True, help="Number of most recent tags to keep"
    )

    args = parser.parse_args()

    HEADERS = {"PRIVATE-TOKEN": args.token}

    repo_path = get_repository_path(args.api_url, args.project_id)

    if repo_path:
        tags=get_all_tags(repo_path)
        tag_digests_not_important = get_non_important_tags(tags, repo_path)
        remaining_tags = sort_and_retaining_n_latest(tag_digests_not_important, args.nb_to_keep)
        delete_old_tags(remaining_tags, args.nb_to_keep)

if __name__ == "__main__":
    main()
