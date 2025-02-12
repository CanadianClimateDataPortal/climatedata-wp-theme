# Developing with Docker Compose

This documentation explains the recommended development setup when developing for the
portal site (i.e. the _Climate Data_ website).

## TL;DR

1. Clone this repository, it contains a pre-defined Docker Compose setup.
2. Download the required files to build the Docker image (ask the tech lead
   for the `<URL>` and the authentication credentials):
   ```shell
   ./dockerfiles/tools/download-docker-assets.sh <URL>
   ```
3. Start the services:
   ```shell
   docker compose up -d
   ```
4. Visit the website! The default URLs are https://dev-en.climatedata.ca and
   https://dev-fr.climatedata.ca.

## Custom setup

To customize your development setup, create a `compose.override.yaml` file in the
root directory of the repository.

The [`compose.override.sample.yaml`](../compose.override.sample.yaml) file
contains example of various custom setups.

The `docker compose up -d` command will, by default, use both the `compose.yaml`
and `compose.override.yaml` files (the latter being included after the former).

## Docker services

The setup will create the following Docker services:

* `portal`: The _Portal_ image, containing the website.
  [More details here](./portal-docker-image.md).
* `db`: A MySQL database. The default image is a pre-filled Maria DB database.
  The port `3306` of the DB is exposed on the host machine.
* `task-runner`: The _Task Runner_ image, used to watch and rebuild, on change,
  the assets (CSS, JS, etc.) from their sources.
  [More details here](./task-runner.md).

## Development process

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

Example `compose.override.yaml`:

```yaml
services:
  portal:
    environment:
      WP_DB_NAME: my-custom-db
      WP_WP_DEBUG: "false"
```

For more information, and for the list of required environment variables, see
the [`wp-config.php` file](../dockerfiles/build/www/configs/wordpress/wp-config.php).
