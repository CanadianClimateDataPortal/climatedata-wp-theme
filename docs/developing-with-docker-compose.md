# Developing with Docker Compose

This documentation explains the recommended development setup when developing
for the portal site (i.e., the _Climate Data_ website).

## Setup

1. You need a GitLab access token to the Docker Container Registry. Ask the tech
   lead for details.
2. Clone this repository.
3. Using the following command, download the extra files required to build the
   Docker images (ask the tech lead for the `<URL>` and the authentication
   credentials):
   ```shell
   ./dev.sh download-docker-assets <URL>
   ```
   FYI: The files will be downloaded to the `dockerfiles/mount/` directory
   (inside the `ssl/` and `wp-plugins/` directories).
4. Start the services (always use the `dev.sh` script):
   ```shell
   ./dev.sh start
   ```
5. The first time you start the environment, the database will need a few
   seconds to initialize once the service is started. You can follow the logs
   with:
   ```shell
    ./dev.sh compose logs -f
    ```
6. Visit the website! The default URLs are:
   * https://dev-en.climatedata.ca
   * https://dev-fr.climatedata.ca
7. To stop the services:
   ```shell
    ./dev.sh stop
    ```

To ease your development, be sure to check the available commands in `dev.sh`:
```shell
./dev.sh --help
```

### WordPress administration

A development user is created for the WordPress administration:

* https://dev-en.climatedata.ca/wp-admin
* Username: `dev`
* Password: `climatedata`

### Created Docker services

This setup creates three Docker services:

* `portal`: The _Portal_ image, containing the website.
  [More details here](./portal-docker-image.md).
* `db`: A MySQL database. The default image is a pre-filled Maria DB database.
  The port `3306` is mapped to the same port on the host machine.
* `task-runner`: The _Task Runner_ image, used to watch and rebuild, on change,
  the assets (CSS, JS, etc.) from their sources.
  [More details here](./task-runner.md).

## Custom setup

To customize your development setup, create a `compose.override.yaml` file in
the root directory of the repository. This file will automatically be used by
all compose commands in `./dev.sh`.

The [`compose.override.examples.yaml`](../compose.override.examples.yaml) file
contains examples of various custom setups.

## Development process

### Theme files

The WordPress theme files are in the `fw-child/` and `framework/` directories.
For most theme files (especially PHP files), modify the files and reload the
page to instantly see the changes.

### wp-cli

The Portal container contains [wp-cli](https://wp-cli.org/) if you need it.

Use it with `./dev.sh wp-cli <args>`

### SASS files

The styles for the themes are SASS files that are compiled to CSS.

The SASS files are found in `fw-child/resources/scss` and some in
`framework/resources/scss`.

The _Task Runner_ container automatically builds the CSS files from the SASS
file when they change (look at the log of the _Task Runner_ container to see the
compilation).

### TypeScript files in apps/

The source files of the _Maps_ and _Download_ pages are in the `apps/`
directory.

The _Task Runner_ automatically rebuilds the JavaScript files when
TypeScript files in the `apps/` directory change (they are rebuilt and put in
the `fw-child/apps/dist/` directory).

#### TypeScript tests

It's (highly) encouraged to develop tests for new (and existing) TypeScript
code. The [vitest](https://vitest.dev/guide/) framework is used.

Create tests in the same directory as the file you want to test, using the
same file name with the `.test` suffix added.

For example, if you want to create tests for a function in the
`apps/src/lib/utils.ts` file, put it in the file `apps/src/lib/utils.test.ts`.

Run the tests with:

```shell
./dev.sh test-apps
```

### Database access

The database container has the port `3306` opened, so you can connect to it
using your IDE or any other database management tool (using `localhost` as the
server host).

## Committing changes

### Validate the TypeScript code

Before commiting changes to TypeScript files, make sure a "production build"
can be compiled without errors (else the CICD pipeline will fail).

From the Task Runner container, trigger a production build. It will check for
any issues.

```shell
./dev.sh task-runner-shell
# Then, from the shell in the Task Runner:
build-fe.sh /app
```

If it ends without any error (i.e., it shows `[APPS] npm run build exited with
code 0`), you can commit and push.

### Git branching process

See the documentation for the [Git branching strategy](./git-branching-strategy.md).

### Setting WordPress constants

The `wp-config.php` file used in the _Portal_ image is a custom script that 
allows setting WordPress constants using environment variables.

Environment variables prefixed with `WP_` will be used to set the
corresponding WordPress constants (i.e., the name _after_ the `WP_` prefix).

For example, if the environment variables `WP_DB_NAME` and `WP_WP_DEBUG` are
set, they will be used to set the WordPress constants `DB_NAME` and `WP_DEBUG`.

**Warning:** For boolean values, always use _quoted_ `"true"` and `"false"`. If
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

## Troubleshoot

### Expired SSL certificate

**Issue**: Your browser complains about an invalid/expired SSL certificate.

**Solution:** re-run `./dev.sh download-docker-assets <URL>` to download an
up-to-date SSL certificate.
