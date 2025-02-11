import argparse
import requests
from datetime import datetime

important_tags = ["preprod", "uat", "qa"]

HEADERS = {}

def make_api_request(method, url):
    """
    Makes an API request to the given URL using the specified HTTP method.
    Checks for a successful response (status code 200) and returns the JSON data.
    
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
    Retrieves the repository path for the 'portal' repository within a GitLab project.
    
    Args:
    - api_url (str): The base URL of the GitLab API.
    - project_id (str): The ID of the GitLab project.
    
    Returns:
    - str: The full path of the 'portal' repository, or None if not found.
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


def get_tags_with_digests(repo_path):
    """
    Retrieves all tags from the repository and sorts them into 'important' and 'not important' categories.
    Also groups the tags by their digests and creation dates.

    Args:
    - repo_path (str): The full repository path.
    
    Returns:
    - dict: A dictionary containing two categories: 'tag_digests_important' and 'tag_digests_not_important'.
    """
    tag_digests_important = {}
    tag_digests_not_important = {}

    tags = make_api_request("GET", f"{repo_path}/tags") or []
    if not tags:
        print("No tags found for this repository.")
        return tag_digests_important, tag_digests_not_important

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

    return {
        "tag_digests_important": tag_digests_important,
        "tag_digests_not_important": tag_digests_not_important,
    }


def get_tags_ignore_n_latest(tag_digests_not_important, n):
    """
    Sorts the 'not important' tags by their creation date and removes the most recent 'n' tags.

    Args:
    - tag_digests_not_important (dict): A dictionary of tags that are not marked as important.
    - n (int): The number of most recent tags to ignore (i.e., not delete).
    """
    sorted_tags = sorted(
        tag_digests_not_important.items(),
        key=lambda x: datetime.fromisoformat(x[1]["created_at"]),
        reverse=True,
    )

    remaining_tags = sorted_tags[n:]

    if remaining_tags:
        print("Remaining tags after ignoring the {} most recent tags:".format(n))
    for tag in remaining_tags:
        print(
            f"Tag: {tag[0]}, Digest: {tag[1]['digest']}, Created At: {tag[1]['created_at']}"
        )
    else:
        print(f"No tags remaining after ignoring the {n} most recent tags.")


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
        tag_info = get_tags_with_digests(repo_path)
        print(tag_info)
        tag_digests_not_important = tag_info["tag_digests_not_important"]
        get_tags_ignore_n_latest(tag_digests_not_important, args.nb_to_keep)


if __name__ == "__main__":
    main()
