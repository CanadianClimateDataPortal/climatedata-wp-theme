# Task Runner

The _Task Runner_ is a Docker image containing various scripts and utilities 
(i.e. "tasks") to help in the development of asset files, to test source 
files and to build assets.

It's intended to be used only during development, in a CI/CD pipeline or when 
building production assets. It's not intended to run on the production server.
For this reason, the _Task Runner_ image doesn't contain the source files, 
they are expected to be mounted when running a container.

## Building the image

> This section explains how to manually build the _Task Runner_ Docker image.
> For use during development, you probably want to read
> [_Developing with Docker Compose_](./developing-with-docker-compose.md)
> instead.
> 
Example (from the repository root):

```shell
docker build -f dockerfiles/build/task-runner/Dockerfile .
```

### Permission issues with mounted directories

(The following instructions are optional, only if you need it.)

If you're using the Task Runner to update files in a mounted local directory
(e.g., when developing), you can encounter permission errors because the user
inside the container doesn't have the permissions to update the local (mounted)
files.

To circumvent this issue, it's possible to set, at build time, the ID of the
user inside the container. By giving it an ID that matches a local user that has
the required permissions (e.g., the local files' owner), the user inside the
container will be able to access and update mounted files.

> Note that this can only be done at build time, once the ID is set, it cannot
> be changed when running the container.

Set the ID with the `USER_ID` and `GROUP_ID` build arguments:

```shell
# For example, use the current user's informations
new_user_id=$(id -u)
new_group_id=$(id -g)

docker build \
  --build-arg USER_ID=$new_user_id \
  --build-arg GROUP_ID=$new_group_id \
  -f dockerfiles/build/task-runner/Dockerfile \
  .
```

## Available tools

The _Task Runner_ contains scripts to perform the most common tasks.

The scripts are in the `dockerfiles/build/task-runner/bin/` directory. Inside
the image, all those scripts are available globally (i.e., you can run directly
`build-fe.sh`).
