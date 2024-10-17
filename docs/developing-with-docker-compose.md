# Developing with Docker Compose

This documentation explains a recommended development setup when working on the
portal site (i.e. the _Climate Data_ website).

This setup uses Docker Compose. It starts a local web server (the [_Portal_
Docker image](./portal-docker-image)), a pre-filled database and a
[_Task Runner_](./task-runner.md). It also configures the _Portal_ container
for development.

## TL;DR

1. Copy `docker-override.sample.yaml` to `docker-override.yaml`
2. Edit the `docker-override.yaml` file as required. You _must_ edit this file
   since its default content is not sufficient to correctly run the site. See
   the [_Minimum overrides_](#minimum-overrides) section below for details.
3. Start the services:
   ```shell
   docker compose -f docker-compose-dev.yaml -f docker-override.yaml up
   ```
4. Visit the website! The default URL is https://dev-en.climatedata.ca.

## Setup

The development setup is simply started with Docker Compose and two compose
files:

* [`docker-compose-dev.yaml`](../docker-compose-dev.yaml) which contains the
  main Docker Compose configuration, and is common to all development
  environments.
* `docker-override.yaml` (the "_overrides_" file) which contains configuration
  overrides specific to your environment.

The _overrides_ file allows you to customize your environment as you wish. For
example to allow non-HTTPS requests, to change WordPress constants, to add
custom nginx configuration files, etc.

The _overrides_ file must be created since it's ignored by Git. A simple way
is to copy
[`docker-override.sample.yaml`](../docker-override.sample.yaml) to
`docker-override.yaml`, then edit it based on your needs. The
[`docker-override.sample.yaml`](../docker-override.sample.yaml) file contains
multiple example configurations that you can use.

### Minimum overrides

The _overrides_ file is required and requires a minimum of configuration. This
section details the minimum overrides required.

For example of those minimum overrides, and for examples of other kinds of
overrides, see the examples in the
[`docker-override.sample.yaml`](../docker-override.sample.yaml) file.

#### Serving over HTTP or HTTPS

Whether you want to serve your local _Portal_ site over HTTP or HTTPS, you have
configurations to do in your _overrides_ file.

To serve over HTTP:

* Using a volume mount, you must replace the site's Nginx configuration since
  the default one forces HTTPS. A suggested replacement configuration already
  exists (see the examples).
* You must open port 80.

To server over HTTPS:

* You must mount the SSL certificate files to the correct directory (see the
  examples). Ask the Tech Lead for a copy of the SSL certificates.
* You must open ports 80 and 443.

#### Non-public WordPress plugins when rebuilding

_This section is only if you want to build the Portal image during the Docker
Compose set up. You can skip it if you use an already built image._

To build the _Portal_ image during the Docker Compose set up , you must instruct
Docker where to find the files of the non-public WordPress plugins. Those
plugins are the ones that cannot be installed from the public WordPress plugin
repository. For example, paid plugins, custom plugins or plugins not available
anymore.

To have those plugins installed during the image building, you must have their
source zip files locally (ask the Tech Lead for a copy of those files). The
files you require are listed in the
[wp-plugins/local.txt](../dockerfiles/build/www/wp-plugins/local.txt) file.

You must then set the `LOCAL_WP_PLUGINS_DIR` build argument to the path of the
directory containing the files. See the
[documentation about this argument](./portal-docker-image.md#the-local_wp_plugins_dir-argument)
for more details.

## Run the setup

Execute the following command to start the environment (of course, adapt the
command as you wish):

```shell
docker compose -f docker-compose-dev.yaml -f docker-override.yaml up
```

If the _Portal_ and _Task Runner_ images are not already built, the Compose
files are configured to rebuild them.

Then visit the site! The default URL is https://dev-en.climatedata.ca.

## Develop

The themes' files are mounted to the running container, so any change to any
file is immediately available on the server.

Files built from assets (like CSS files built from SASS files) are automatically
rebuilt by the _Task Runner_ service.

The _Portal_ image contains [wp-cli](https://wp-cli.org/).

## WordPress constants

The `wp-config.php` file used in the _Portal_ image is a custom script that 
allows setting WordPress constants using environment variables.

Environment variables prefixed with `WP_` will be used to set the
corresponding WordPress constants (i.e. the name after the `WP_` prefix).

For example, if the environment variables `WP_DB_NAME` and `WP_WP_DEBUG` are
set, they will be used to set the WordPress constants `DB_NAME` and `WP_DEBUG`.

**Warning:** For boolean values, always use quoted `"true"` and `"false"`. If
you don't quote, the YAML parser may transform them to `1` and `0`.

Example `docker-override.yaml`:

```yaml
services:
  portal:
    environment:
      WP_DB_NAME: my-custom-db
      WP_WP_DEBUG: "false"
```

For more information, and for the list of required environment variables, see
the [`wp-config.php` file](../dockerfiles/build/www/configs/wordpress/wp-config.php).
