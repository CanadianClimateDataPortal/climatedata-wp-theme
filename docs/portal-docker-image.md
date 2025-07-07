# The Portal Docker image

The website is containerized in a _Portal_ Docker image. This image is
deployed on our different environments, including the production environment.
The same image can also be used during development.

> This document explains how to build the _Portal_ Docker image. For how to use
> it during development, you probably want to read
> [_Developing with Docker Compose_](./developing-with-docker-compose.md)
> instead.

## Image content

The _Portal_ image contains PHP-FPM, a web server (nginx), a WordPress
installation, the required WordPress plugins, and all the themes files (PHP
scripts, JavaScript, CSS, etc.).

The image doesn't contain:
* The database (should be another Docker image).
* The `upload/` directory containing files uploaded from the administration
  (should be mounted as a volume since we need those files to persist).
* SSL certificates (should be mounted when instantiating the container).

## Building the image

To build the _Portal_ image for production, run the following command:

```shell
docker build \
  --target production \
  --build-arg TASK_RUNNER_IMAGE=<IMAGE> \
  --build-arg LOCAL_WP_PLUGINS_DIR=<PATH> \
  -t <IMAGE-NAME:TAG> \
  .
```

### The `TASK_RUNNER_IMAGE` argument

Some of the site assets must be built from "source" assets. For example, the CSS
files are built from SASS files.

To keep the _Portal_ image lean, the tools used to generate the assets and 
the asset source files are not added to the image.

The required tools are in another Docker image, called the _**Task Runner**_.
When building the _Portal_ image, a multi-stage build will use the _Task 
Runner_ to build the assets from their sources, and then add them to the 
_Portal_ image.

The _Task Runner_ image must have been built before using it to build the 
_Portal_ image. You pass its Docker image name as the `TASK_RUNNER_IMAGE` build
argument. This argument can be any valid Docker image name.

For more details, see the [documentation about the Task Runner](./task-runner.md).

### The `LOCAL_WP_PLUGINS_DIR` argument

The building process installs all the required WordPress plugins. Most 
plugins can be installed from the
[public plugin repository](https://en-ca.wordpress.org/plugins/). The list of
plugins to be installed from the public repository is defined in the
[wp-plugins/public.txt](../dockerfiles/build/www/wp-plugins/public.txt) file.

But some other plugins are not available on the public repository (ex: because
they were bought), and they must be installed from local files.

The `LOCAL_WP_PLUGINS_DIR` build argument is a path to a local directory 
containing those non-public plugins to install. It must contain one zip file 
for each required plugin to install (the same zip file that can be used to 
install the plugin through the administration). The list of required plugin 
files is defined in the [wp-plugins/local.txt](../dockerfiles/build/www/wp-plugins/local.txt)
file.

The directory must be inside the build context (you can use the `dockerfiles/mounts`
directory for this, see [its documentation](../dockerfiles/mounts)), and the
path must be relative to the build context.

**Note:** A script ([_download-docker-assets.sh_](../dockerfiles/tools/download-docker-assets.sh))
can be used to download the required "local plugins" files from a central
server. See [developing-with-docker-compose.md](./developing-with-docker-compose.md)
for details.

### Complete example:

```shell
mkdir dockerfiles/mounts/wp-plugins
cp ~/plugin-a-pro-1.2.3.zip ~/plugin-b-5.2.1.zip dockerfiles/mounts/wp-plugins

docker build \
  --target production \
  --build-arg TASK_RUNNER_IMAGE=registry.example.com/task_runner:demo \
  --build-arg LOCAL_WP_PLUGINS_DIR=dockerfiles/mounts/wp-plugins \
  .
```

## WordPress and plugin versions

To ensure reproducibility, consistency between the environments and control, 
the **WordPress version** is specified in the Dockerfile. The _Portal_ image 
is configured to disallow updating WordPress from the WordPress administration.

Updating the WordPress version can only be done by:

1. Updating the WordPress version in the Dockerfile.
2. Rebuilding and redeploying the _Portal_ image.

The same applies for the list of WordPress plugins and their version.

## Web server user and group ID

The web server will create and modify some files. For example, it will save 
files uploaded from the WordPress administration to the `assets/uploads/` 
directory. It will also create and write log files.

Those files are created and modified using the web server's own user and group.

If the modified files or directories are mounted from your system, there can be
a conflict between the user ID used by the web server inside the Docker image
and the ID of another user on your system. For example, if the web server in 
the Docker container has ID 1000, and, on your local system, this ID 
correspond to user `test`, then all files created in a mounted directory 
will be locally owned by user `test`. This can create access and security
problems.

To remedy this problem, the build arguments `WEB_SERVER_USER_ID` and
`WEB_SERVER_GROUP_ID` can be used, when building the _Portal_ Docker 
image, to specify the user and group ID of the user created for the web server.

Note that it's not possible to change the IDs when running the container, only
when building the image.

## WordPress constants

> The following applies when running the container, not when building the image.

The `wp-config.php` file used in the Docker image is a custom script that allows
setting WordPress constants using environment variables.

Environment variables prefixed with `WP_` will be used to set the 
corresponding WordPress constants (i.e. the name after the `WP_` prefix).

For example, if the environment variables `WP_DB_NAME` and `WP_WP_DEBUG` are
set, they will be used to set the WordPress constants `DB_NAME` and `WP_DEBUG`.

```shell
docker run \
  --env WP_DB_NAME=my_db \
  --env WP_WP_DEBUG=true \
  <...>
```

For more information, and for the list of required environment variables, see
the [`wp-config.php` file](../dockerfiles/build/www/configs/wordpress/wp-config.php).
