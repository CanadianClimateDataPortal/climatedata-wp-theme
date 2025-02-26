import argparse
import requests
from datetime import datetime

reserved_tags = ["preprod", "uat", "qa"]


class RepositoryAPI:
    def __init__(self, token, api_url, project_id, repository_name="portal"):
        """
        Initializes the RepositoryAPI instance with authentication headers and repository details.

        Args:
        - token (str): GitLab API authentication token.
        - api_url (str): The base URL of the GitLab API.
        - project_id (str): The ID of the GitLab project.
        - repository_name (str): The name of the repository (default: "portal").
        """
        self._headers = {"PRIVATE-TOKEN": token}
        self.repository_name = repository_name
        self.api_url = api_url
        self.project_id = project_id
        # self.repo_url = self.get_repository_url()

    def make_api_request(self, method, url):
        """
        Makes an API request to the given URL using the specified HTTP method.
        Exits the program if the request fails.

        Args:
        - method (str): The HTTP method to use (GET, POST, etc.).
        - url (str): The URL to send the request to.

        Returns:
        - dict: The parsed response data as a Python dictionary.

        Raises:
        - requests.HTTPError: If the request fails.
        """
        response = requests.request(method, url, headers=self._headers)
        if response.status_code != 200:
            raise requests.HTTPError(
                f"Error {response.status_code} retrieving data from {url}: {response.text}"
            )
        return response.json()

    def get_repository_url(self):
        """
        Retrieves the url for a specific registry repository within a GitLab project.

        Returns:
        - str: The full url of the repository if found.

        Raises:
        - ValueError: If the repository is not found.
        """
        repo_url = f"{self.api_url}/{self.project_id}/registry/repositories"
        repositories = self.make_api_request("GET", repo_url) or []

        repo = next(
            (repo for repo in repositories if repo.get("name") == self.repository_name),
            None,
        )

        if repo:
            return f"{repo_url}/{repo['id']}"
        else:
            raise ValueError(f"No repository named '{self.repository_name}' found.")

    def get_tag_info(self, tag):
        """
        Retrieves detailed information (digest and creation date) for a specific tag in the repository.

        Args:
        - tag (str): The name of the tag to query.

        Returns:
        - tuple: A tuple containing the digest and the creation date of the tag.
        """
        url = f"{self.get_repository_url()}/tags/{tag}"

        tag_info = self.make_api_request("GET", url)
        return tag_info.get("digest"), tag_info.get("created_at")

    def get_all_tags(self):
        """
        Retrieves all tags available in the repository.

        Returns:
        - list: A list of all tag metadata.

        Raises:
        - ValueError: If no tags are found.
        """
        tags = self.make_api_request("GET", f"{self.get_repository_url()}/tags") or []
        if not tags:
            raise ValueError("No tags found for this repository.")
        return tags

    def filter_tags(self, tags):
        """
        Filters out important tags and returns only non-important tags.

        Args:
        - tags (list): List of all tags retrieved from the repository.

        Returns:
        - dict: A dictionary of non-important tags with their digests and creation dates.
        """
        protected_tags = {}
        filtered_tags = {}
        protected_digests = set()

        for tag in tags:
            tag_name = tag["name"]
            digest, created_at = self.get_tag_info(tag_name)
            tag_info = {"digest": digest, "created_at": created_at}
            if tag_name in reserved_tags:
                protected_tags[tag_name] = tag_info
                protected_digests.add(digest)
            else:
                filtered_tags[tag_name] = tag_info

        for tag_name, tag_info in list(filtered_tags.items()):
            if tag_info["digest"] in protected_digests:
                protected_tags[tag_name] = tag_info
                del filtered_tags[tag_name]

        return filtered_tags

    def delete_tags(self, tags):
        """
        Deletes tags that are older than the n most recent ones.

        Args:
        - tags (list): The list of tags to delete.
        """
        if tags:
            print(f"Deleting the following tags :")
            for tag in tags:
                print(
                    f"Tag: {tag[0]}, Digest: {tag[1]['digest']}, Created At: {tag[1]['created_at']}"
                )
                # tag_name = tag[0]
                # delete_url = f"{self.get_repository_url()}/tags/{tag_name}"
                # response = self.make_api_request("DELETE", delete_url)
                # if response == {}:
                #     print(f"Successfully deleted tag: {tag_name}")
                # else:
                #     print(f"Failed to delete tag: {tag_name}.")
        else:
            print(f"No tags to delete")


def get_old_tags(tags_dict, n):
    """
    Returns the tags older than the n most recent ones, sorted by creation date.

    Args:
    - tags_dict (dict): A dictionary of tags with their associated metadata (e.g., digest and creation date).
    - n (int): The number of most recent tags to retain.

    Returns:
    - list: A list of tags older than the n most recent ones.
    """
    sorted_tags = sorted(
        tags_dict.items(),
        key=lambda x: datetime.fromisoformat(x[1]["created_at"]),
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
        "--nb-to-keep",
        type=int,
        required=True,
        help="Number of most recent tags to keep",
    )

    args = parser.parse_args()

    repo_api = RepositoryAPI(args.token, args.api_url, args.project_id)

    try:
        tags = repo_api.get_all_tags()
        filtered_tags = repo_api.filter_tags(tags)
        tags_to_delete = get_old_tags(filtered_tags, args.nb_to_keep)
        repo_api.delete_tags(tags_to_delete)
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
