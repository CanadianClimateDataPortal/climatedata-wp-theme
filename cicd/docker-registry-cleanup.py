import argparse
import requests
from datetime import datetime
from typing import NamedTuple, List

reserved_tags = ["preprod", "uat", "qa"]


class TagInfo(NamedTuple):
    """
    Represents detailed information about a Docker image tag in a GitLab repository.

    This class encapsulates metadata related to a Docker image tag, including
    the tag's name, digest and creation timestamp.

    Attributes:
        name: The name of the Docker image tag.
        digest: The unique digest associated with the tag.
        created_at: The creation timestamp of the tag.
    """

    name: str
    digest: str
    created_at: str


class RepositoryAPI:
    """
    A class to interact with the GitLab API of a specific container registry and manage Docker image its tags.

    This class allows users to retrieve information about repository tags, delete old tags, and perform
    various operations related to tags in a GitLab Container Registry.
    """

    def __init__(self, token: str, api_url: str, project_id: str, repository_name: str):
        """
        Initializes the RepositoryAPI instance with authentication headers and repository details.

        Args:
            token : GitLab API authentication token.
            api_url: The base URL of the GitLab API.
            project_id: The ID of the GitLab project.
            repository_name: The name of the repository.
        """
        self._headers = {"PRIVATE-TOKEN": token}
        self._repository_name = repository_name
        self._api_url = api_url
        self._project_id = project_id
        self._repo_endpoint = self._get_repository_endpoint()

    def _make_api_request(self, method: str, endpoint: str) -> requests.Response:
        """
        Makes an HTTP request to the GitLab API using the specified method and endpoint.

        Args:
            method: The HTTP method to use.
            endpoint: The API endpoint relative to the base URL.

        Returns:
            The API response object.

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

    def _get_repository_endpoint(self) -> str:
        """
        Returns the endpoint for a specific registry repository within a GitLab project if found.

        Raises:
            ValueError: If the repository with the specified name is not found in the project.
        """
        repo_endpoint = f"{self._project_id}/registry/repositories"
        response = self._make_api_request("GET", repo_endpoint)
        repositories = response.json()

        try:
            repos_with_matching_name = (
                repo
                for repo in repositories
                if repo.get("name") == self._repository_name
            )
            repo = next(repos_with_matching_name)
            return f"{repo_endpoint}/{repo['id']}"
        except StopIteration:
            raise ValueError(f"No repository named '{self._repository_name}' found.")

    def _get_tag_info(self, tag: str) -> TagInfo:
        """
        Returns detailed information for a specific tag in the repository.

        Args:
            tag: The name of the tag to query.

        """
        endpoint = f"{self._repo_endpoint}/tags/{tag}"

        response = self._make_api_request("GET", endpoint)
        tag_info = response.json()
        return TagInfo(
            name=tag,
            digest=tag_info.get("digest"),
            created_at=tag_info.get("created_at"),
        )

    def get_all_tags_with_infos(self) -> List[TagInfo]:
        """
        Returns all tags available in the repository.

        Raises:
            ValueError: If no tags are found.
        """
        tags: List[TagInfo] = []
        next_page = 1
        has_next_page = True

        while has_next_page:
            response = self._make_api_request(
                "GET", f"{self._repo_endpoint}/tags?page={next_page}"
            )
            tags.extend(
                self._get_tag_info(tag["name"]) for tag in response.json()
            )
            total_nb_pages = int(response.headers.get("x-total-pages", "1"))
            has_next_page = next_page < total_nb_pages
            next_page += 1

        if not tags:
            raise ValueError("No tags found for this repository.")

        return tags

    def delete_tags(self, tags: List[TagInfo]):
        """
        Deletes the specified tags from the GitLab repository.

        Args:
            tags: elements to delete.
        """
        for tag in tags:
            tag_name = tag.name
            delete_endpoint = f"{self._repo_endpoint}/tags/{tag_name}"
            self._make_api_request("DELETE", delete_endpoint)


def filter_required_tags(tags: List[TagInfo]) -> List[TagInfo]:
    """
    Returns tags that must be kept.

    Tags that must be kept are the "reserved" tags and all the other tags of the same
    Docker image.

    Args:
        tags: elements with their metadata retrieved from the repository.

    """
    protected_digests = []
    filtered_tags = []

    for tag_info in tags:
        if tag_info.name in reserved_tags:
            protected_digests.append(tag_info.digest)

    for tag_info in tags:
        if tag_info.digest not in protected_digests:
            filtered_tags.append(tag_info)

    return filtered_tags


def get_old_tags(tags: List[TagInfo], n: int) -> List[TagInfo]:
    """
    Returns the tags older than the n most recent ones, sorted by creation date.

    Args:
        tags: elements with their metadata.
        n: The number of most recent tags to retain.

    """
    sorted_tags = sorted(
        tags,
        key=lambda tag: datetime.fromisoformat(tag.created_at),
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

        print(
            f"The following tags will be deleted: {', '.join(t.name for t in tags_to_delete)}"
        )
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
