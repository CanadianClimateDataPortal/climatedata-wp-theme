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

## Available tools

The _Task Runner_ image has the following tools available on the command line:

* [`compile-sass.sh`](../dockerfiles/build/task-runner/bin/compile-sass.sh)
  to compile the SASS files of the themes.
* [`watch-sass.sh`](../dockerfiles/build/task-runner/bin/watch-sass.sh)
  to continually watch the themes' SASS files and recompile them when changed.
