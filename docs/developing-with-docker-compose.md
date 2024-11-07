# Developing with Docker Compose

This documentation explains a recommended development setup when working on the
portal site (i.e. the _Climate Data_ website).

This setup uses Docker Compose. It starts a local web server (the [_Portal_
Docker image](./portal-docker-image)), a pre-filled database and a
[_Task Runner_](./task-runner.md). It also configures the _Portal_ container
for development.

## TL;DR

1. Clone this repository, it contains a pre-defined Docker Compose setup.
2. Create an empty `docker-override.yaml` file.
3. Edit the `docker-override.yaml` file as required. See the
   [_Detailed setup_](#detailed-setup) section below for details. You _must_
   edit this file its default content is not sufficient to correctly run the
   site. 
4. Start the services:
   ```shell
   docker compose -f docker-compose-dev.yaml -f docker-override.yaml up
   ```
5. Visit the website! The default URL are https://dev-en.climatedata.ca and
   https://dev-fr.climatedata.ca.

## Detailed setup

The development setup is simply started with Docker Compose and two compose
files:

* [`docker-compose-dev.yaml`](../docker-compose-dev.yaml) which contains the
  base Docker Compose configuration (common to every developer).
* `docker-override.yaml` which contains configuration overrides specific to
  your environment.

The `docker-override.yaml` file is required since the base Docker setup requires
that you set some minimum configurations, and that you mount some required
files.

The following lists the minimum required content of your `docker-override.yaml`.

### Configurations for serving over HTTPS or HTTP

If you want to serve your local _Portal_ site over **HTTPS**, you must mount a
valid SSL certificate (ask the Tech Lead for a copy of the SSL certificate) and
open ports 443 and 80. Add the following to your `docker-override.yaml`:

```yaml
services:
  portal:
    volumes:
      # Bind SSL certificate
      - type: bind
        # The location below in `source` is a suggested directory for your SSL
        # certificate. You can use any valid path you want.
        source: dockerfiles/mounts/ssl
        target: /etc/nginx/ssl
    ports:
      # Open port 80 and 443
      - "80:80"
      - "443:443"
```

If you want to serve your local _Portal_ site over **HTTP**, you must replace
the site's Nginx configuration with one that allows non-HTTPS requests (already
provided), and you must open port 80. Add the following to your
`docker-override.yaml`:

```yaml
services:
  portal:
    volumes:
      # Replace the site's default Nginx configuration with the provided one
      # that allows non-HTTPS requests.
      - type: bind
        source: dockerfiles/dev/www/configs/nginx/climatedata-site-no-ssl.conf
        target: /etc/nginx/sites-available/climatedata-site.conf
    ports:
      # Open port 80
      - "80:80"
```

### Building the Portal image with Docker Compose

If you want the _Portal_ image to be built when starting Docker Compose, you
must specify the local directory, used by the Dockerfile, containing the
required, but "non-public", WordPress plugins.

> If you don't want to build the image and instead want to use a pre-built
> image, simply put the path of a pre-built _Portal_ image in the
> `services > portal > image` configuration of your `docker-override.yaml`.
> Then skip this section.

The non-public WordPress plugins are the ones that cannot be installed by the
Dockerfile from the public WordPress plugin repository. For example, paid
plugins, custom plugins or plugins not available anymore.

To have those plugins installed during the image building, you must have their
source zip files available locally (ask the Tech Lead for a copy of those
files), and you then set the `LOCAL_WP_PLUGINS_DIR` build argument to the path
of the directory containing the files (see the
[documentation about this argument](./portal-docker-image.md#the-local_wp_plugins_dir-argument)).

The required plugin files are listed in the
[wp-plugins/local.txt](../dockerfiles/build/www/wp-plugins/local.txt) file.

The add the following to your `docker-override.yaml`:

```yaml
services:
  portal:
    build:
      args:
        # Set `LOCAL_WP_PLUGINS_DIR` to a directory containing the files of the
        # required non-public WordPress plugins.
        # The following path is only a suggestion. You can put any valid path.
        LOCAL_WP_PLUGINS_DIR: dockerfiles/mounts/wp-plugins
```

### Other recipes for `docker-override.yaml`

The [`docker-override.sample.yaml`](../docker-override.sample.yaml) file
contains other optional "recipes" showing how to use the
`docker-override.yaml` file for some specific tasks, like adding new Nginx
configurations, adding a custom PHP configuration or changing a WordPress
constant (also see the [Setting WordPress constants](#setting-wordpress-constants)
for more details about this).

## Run the setup

Execute the following command to start the environment (of course, adapt the
command as you wish):

```shell
docker compose -f docker-compose-dev.yaml -f docker-override.yaml up
```

If the _Portal_ and _Task Runner_ images are not already built, they will be
built.

Then visit the site! The default URLs are https://dev-en.climatedata.ca and
https://dev-fr.climatedata.ca.

## Developing process

The themes' files are mounted to the running container, so any change to any
file is immediately available on the server.

Files built from assets (like CSS files built from SASS files) are automatically
rebuilt by the _Task Runner_ service.

The _Portal_ image contains [wp-cli](https://wp-cli.org/).

### Setting WordPress constants

The `wp-config.php` file used in the _Portal_ image is a custom script that 
allows setting WordPress constants using environment variables.

Environment variables prefixed with `WP_` will be used to set the
corresponding WordPress constants (i.e. the name _after_ the `WP_` prefix).

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
