import argparse
import requests
from datetime import datetime

reserved_tags = ["preprod", "uat", "qa"]


class RepositoryAPI:
    """
    A class to interact with the GitLab API of a specific container registry and manage Docker image its tags.

    This class allows users to retrieve information about repository tags, delete old tags, and perform
    various operations related to tags in a GitLab Container Registry.
    """

    def __init__(self, token, api_url, project_id, repository_name):
        """
        Initializes the RepositoryAPI instance with authentication headers and repository details.

        Args:
          token (str): GitLab API authentication token.
          api_url (str): The base URL of the GitLab API.
          project_id (str): The ID of the GitLab project.
          repository_name (str): The name of the repository.
        """
        self._headers = {"PRIVATE-TOKEN": token}
        self._repository_name = repository_name
        self._api_url = api_url
        self._project_id = project_id
        self._repo_endpoint = self._get_repository_endpoint()

    def _make_api_request(self, method, endpoint):
        """
        Makes an HTTP request to the GitLab API using the specified method and endpoint.

        Args:
          method (str): The HTTP method to use.
          endpoint (str): The API endpoint relative to the base URL.

        Returns:
          The response.

        Raises:
          requests.HTTPError: If the request fails.
        """
        response = requests.request(
            method, f"{self._api_url}/{endpoint}", headers=self._headers
        )
        if response.status_code != 200:
            raise requests.HTTPError(
                f"Error {response.status_code} retrieving data from {self._api_url}{endpoint}: {response.text}"
            )
        return response

    def _get_repository_endpoint(self):
        """
        Retrieves the endpoint for a specific registry repository within a GitLab project.

        Returns:
          str: The endpoint of the matching repository if found.

        Raises:
          ValueError: If the repository with the specified name is not found in the project.
        """
        repo_endpoint = f"{self._project_id}/registry/repositories"
        response = self._make_api_request("GET", repo_endpoint)
        repositories = response.json()

        try:
            repos_with_matching_name = (repo for repo in repositories if repo.get("name") == self._repository_name)
            repo = next(repos_with_matching_name)
            return f"{repo_endpoint}/{repo['id']}"
        except StopIteration:
            raise ValueError(f"No repository named '{self._repository_name}' found.")


    def _get_tag_info(self, tag):
        """
        Retrieves detailed information (digest and creation date) for a specific tag in the repository.

        Args:
          tag (str): The name of the tag to query.

        Returns:
          tuple: A tuple containing the digest and the creation date of the tag.
        """
        endpoint = f"{self._repo_endpoint}/tags/{tag}"

        response = self._make_api_request("GET", endpoint)
        tag_info = response.json()
        return tag_info.get("digest"), tag_info.get("created_at")

    def get_all_tags_with_infos(self):
        """
        Retrieves all tags available in the repository.

        Returns:
          list[dict]: A list of dictionaries of all tag with their metadata.

        Raises:
          ValueError: If no tags are found.
        """
        tags = []
        tags_infos = []

        next_page = 1
        has_next_page = True

        while has_next_page:
            response = self._make_api_request("GET", f"{self._repo_endpoint}/tags?page={next_page}")
            tags.extend(response.json())
            total_nb_pages = int(response.headers.get("x-total-pages"))
            has_next_page = next_page < total_nb_pages
            next_page += 1

        if not tags:
            raise ValueError("No tags found for this repository.")

        for tag in tags:
            tag_name = tag["name"]
            digest, created_at = self._get_tag_info(tag_name)
            tags_infos.append(
                {"name": tag_name, "digest": digest, "created_at": created_at}
            )

        return tags_infos

    def delete_tags(self, tags):
        """
        Deletes the specified tags from the GitLab repository.

        Args:
          tags (list): The list of tags to delete.
        """
        for tag in tags:
            tag_name = tag['name']
            delete_endpoint = f"{self._repo_endpoint}/tags/{tag_name}"
            self._make_api_request("DELETE", delete_endpoint)


def filter_required_tags(tags):
    """
    Filters out tags that must be kept.

    Tags that must be kept are the "reserved" tags and all the other tags of the same
    Docker image.

    Args:
      tags (list): List of all tags with their digests and creation dates retrieved from the repository.

    Returns:
      list: A list of tags to keep.
    """
    protected_digests = []
    filtered_tags = []

    for tag_info in tags:
        if tag_info["name"] in reserved_tags:
            protected_digests.append(tag_info["digest"])

    for tag_info in tags:
        if tag_info["digest"] not in protected_digests:
            filtered_tags.append(tag_info)

    return filtered_tags


def get_old_tags(tags, n):
    """
    Returns the tags older than the n most recent ones, sorted by creation date.

    Args:
      tags (list): A list of tags with their associated metadata (e.g., digest and creation date).
      n (int): The number of most recent tags to retain.

    Returns:
      list: A list of tags older than the n most recent ones.
    """
    sorted_tags = sorted(
        tags,
        key=lambda tag: datetime.fromisoformat(tag["created_at"]),
        reverse=True,
    )
    return sorted_tags[n:]


def main():

    parser = argparse.ArgumentParser(
        description="Clean up Docker image tags in GitLab Container Registry, keeping the most recent tags as specified."
    )
    parser.add_argument("api_url", help="GitLab project API URL")
    parser.add_argument(
        "--token", required=True, help="GitLab API authentication token."
    )
    parser.add_argument(
        "--project-id",
        required=True,
        help="ID of the GitLab project hosting the Container Registry to clean",
    )
    parser.add_argument(
        "--repository-name",
        default="portal",
        help="Name of the repository to clean",
    )
    parser.add_argument(
        "--nb-to-keep",
        type=int,
        required=True,
        help="Number of most recent tags to keep",
    )
    parser.add_argument(
        "--yes",
        action="store_true",
        help="Do not ask for confirmation before deleting tags",
    )

    args = parser.parse_args()

    try:
        repo_api = RepositoryAPI(
            args.token, args.api_url, args.project_id, args.repository_name
        )
        print("Retrieving tags from the repository...")
        tags = repo_api.get_all_tags_with_infos()
        filtered_tags = filter_required_tags(tags)
        tags_to_delete = get_old_tags(filtered_tags, args.nb_to_keep)

        if not tags_to_delete:
            print("No tags to delete.")
            return

        print(f"The following tags will be deleted: {', '.join(t['name'] for t in tags_to_delete)}")
        do_delete = args.yes or input("Continue? [y/N]: ").lower() in ["y", "yes"]
        if do_delete:
            repo_api.delete_tags(tags_to_delete)
            print(f"Deleted {len(tags_to_delete)} tags")
        else:
            print("Aborted.")
    except requests.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
    except ValueError as val_err:
        print(f"Value error: {val_err}")
    except requests.RequestException as req_err:
        print(f"Request failed: {req_err}")
    except Exception as err:
        print(f"An unexpected error occurred: {err}")


if __name__ == "__main__":
    main()
