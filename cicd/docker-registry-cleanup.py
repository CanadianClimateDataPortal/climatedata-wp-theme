import argparse
import requests
from datetime import datetime

important_tags = ["preprod", "uat", "qa"]

HEADERS = {}

def make_api_request(method, url):
    """
    """
    response = requests.request(method, url, headers=HEADERS)
    if response.status_code != 200:
        print(f"Error {response.status_code} retrieving data from {url}.")
        print(response.text)
        exit(1)
    return response.json()

def get_repository_path(api_url, project_id):

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
    url = f"{repo_path}/tags/{tag}"

    tag_info = make_api_request("GET", url)
    return tag_info.get("digest"), tag_info.get("created_at")


def get_tags_with_digests(repo_path):
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

    parser = argparse.ArgumentParser(description="")
    parser.add_argument("api_url", help="GitLab project API URL")
    parser.add_argument(
        "--token", required=True, help="GitLab API authentication token."
    )
    parser.add_argument("--project_id", required=True, help="GitLab project ID")
    # parser.add_argument("--nb_to_keep", required=True, help="GitLab project ID")

    args = parser.parse_args()

    HEADERS = {"PRIVATE-TOKEN": args.token}

    repo_path = get_repository_path(args.api_url, args.project_id)

    if repo_path:
        tag_info = get_tags_with_digests(repo_path)
        print(tag_info)
        tag_digests_not_important = tag_info["tag_digests_not_important"]
        # n = args.nb_to_keep
        n=3
        get_tags_ignore_n_latest(tag_digests_not_important, n)


if __name__ == "__main__":
    main()
