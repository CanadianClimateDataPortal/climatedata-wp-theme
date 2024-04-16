# syntax=docker/dockerfile:1

# Dockerfile for the climatedata.ca web server.
#
# The image contains PHP-FPM, a web server (Apache) and all the site files (WordPress, plugins, custom themes).
#
# This image doesn't contain:
# - The database (should be another Docker image).
# - The "upload/" directory containing files uploaded from the administration (should be mounted as a volume since we
#     need those files to persist).
#
# Build arguments:
#  - TASK_RUNNER_IMAGE (required): name of the task runner Docker image (see description below).
#  - EXTRA_WP_PLUGINS_DIR (optional): directory, in the build context, containing zip files of extra WordPress plugins
#      to extract in the assets/plugins/ directory. Can be used, for example, to add plugins not available in the
#      WordPress' plugin directory.
#  - EXTRA_VENDOR_ASSETS_DIR (optional): directory, in the build context, containing zip files to extract in the
#      assets/vendor/ directory.
#  - APACHE_USER_ID (optional, default=10000): user id of the created Apache user (www-data). Setting the id gives more
#      control over permissions if you mount a directory that must be writable by the website
#      (ex: the assets/upload/ directory). For security reasons, it's recommended that the id be >= 10000, unless you
#      know what you do.
#  - APACHE_GROUP_ID (optional, default=10001): group id for the created Apache user's group (www-data). For security
#      reasons, it's recommended that the id be >= 10000, unless you know what you do.
#
# Special runtime environment variables (used only when running the container):
#  - WP_*: variables prefixed with WP_ are used to set WordPress constants. For example `WP_DB_NAME=test` will set the
#      `DB_NAME` WordPress constant to "test". See dockerfiles/www/configs/wordpress/wp-config.php for details.
#  - APP_NO_HTTPS: if "true", informs various components in the container to allow non-HTTPS requests. If not set, or
#      not set to "true", those components will act in "required HTTPS" mode.
#
# The build process is multi-stage, and the "target" you want to build the website is "production".
#
# The build process is two-step:
#   1) Some static assets (ex: CSS files) are built from source files (ex: SCSS). This process is done by a
#      "task runner" image that generates those files locally. You must supply the name of the task runner Docker image
#      with the `TASK_RUNNER_IMAGE` build argument. See the `dockerfiles/runner/Dockerfile` file to build the
#      task runner image.
#   2) The production web server is built. It contains PHP-FPM, Apache, WordPress, the required WordPress plugins, and
#      all the site's files, including the files generated by the task runner and the custom themes.
#
# Example build:
#
#   `docker build --target production --build-arg TASK_RUNNER_IMAGE=task-runner:v2`

ARG TASK_RUNNER_IMAGE

###
# Task runner stage.
#
# The task runner compiles some site's assets from their source files. It outputs the generated files in a local dist/
# directory.
###
FROM ${TASK_RUNNER_IMAGE} as task-runner

WORKDIR /home/node/app

COPY --chown=node framework src/framework
COPY --chown=node fw-child src/fw-child

RUN compile-sass.sh src dist

CMD ["echo", "Done"]


###
# Production website building stage.
###
FROM php:8.2-fpm as production

RUN apt-get update && apt-get install -y --no-install-recommends \
        apache2 \
        jq \
        less \
        libapache2-mod-fcgid \
        supervisor \
        unzip \
        vim \
        zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# WP-CLI download and installation

WORKDIR /usr/local/bin
RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    && mv wp-cli.phar wp \
    && chmod +x wp

# PHP extensions

# https://github.com/mlocati/docker-php-extension-installer
ADD --chmod=0755 https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

# Some PHP extensions are either core extensions or are bundled with PHP, and thus don't need a version specification
# See: https://www.php.net/manual/en/extensions.membership.php
RUN install-php-extensions \
    bcmath \
    exif \
    gd \
    igbinary-^3.2@stable \
    imagick-^3.7@stable \
    intl \
    mysqli \
    opcache \
    pdo_mysql \
    zip

# Supervisord setup

COPY dockerfiles/www/configs/supervisor/supervisord.conf /etc/

# PHP setup

RUN mkdir /var/log/php && chown www-data:www-data /var/log/php
COPY --chmod=644 dockerfiles/www/configs/php/php.ini /usr/local/etc/php

# Apache setup

ARG APACHE_USER_ID=10000
ARG APACHE_GROUP_ID=10001

RUN usermod -u ${APACHE_USER_ID} www-data && groupmod -g ${APACHE_GROUP_ID} www-data

RUN a2enmod actions fcgid alias proxy proxy_fcgi setenvif rewrite ssl

COPY dockerfiles/www/configs/apache/100-climatedata*.conf /etc/apache2/sites-available
COPY dockerfiles/www/configs/apache/php-fpm.conf /etc/apache2/conf-available

RUN a2dissite 000-default && \
    a2ensite 100-climatedata && \
    a2ensite 100-climatedata-ssl && \
    a2enconf php-fpm

RUN rm /var/www/html/index.html

# Custom scripts

COPY --chmod=755 dockerfiles/www/bin /usr/local/bin

# Wordpress files installation and setup

WORKDIR /var/www/html/site

RUN wp core download --allow-root --version=6.3.1 --skip-content
RUN mv wp-content assets
RUN echo "<?php define('WP_USE_THEMES', true); require( dirname( __FILE__ ) . '/site/wp-blog-header.php' );" > ../index.php

COPY dockerfiles/www/configs/wordpress/wp-config.php .
COPY dockerfiles/www/configs/wordpress/.htaccess /var/www/html

WORKDIR /var/www/html/site/assets/vendor

ARG EXTRA_VENDOR_ASSETS_DIR
RUN --mount=type=bind,target=/tmp/vendor-assets,source=$EXTRA_VENDOR_ASSETS_DIR unzip-all.sh /tmp/vendor-assets

# WordPress plugins installation

WORKDIR /var/www/html/site/assets/plugins

ARG EXTRA_WP_PLUGINS_DIR
RUN --mount=type=bind,target=/tmp/wp-plugins,source=$EXTRA_WP_PLUGINS_DIR unzip-all.sh /tmp/wp-plugins

RUN download-wp-plugin.sh \
        classic-editor=1.6.3 \
        custom-taxonomy-order-ne=4.0.0 \
        post-type-switcher=3.3.0 \
        regenerate-thumbnails=3.1.6 \
        simple-page-ordering=2.5.1 \
        wordpress-importer=0.8.1

# Site's custom WordPress themes installation

WORKDIR /var/www/html/site/assets/themes

COPY --from=task-runner /home/node/app/dist .

COPY framework framework
COPY fw-child fw-child

# Set restrictive file permissions allowing the web server only read permissions (except for specific directories)

WORKDIR /var/www/html

RUN mkdir site/assets/cache \
    && chown -R root:www-data . \
    && find . -type d -print0 | xargs -0 chmod 750 \
    && find . -type f -print0 | xargs -0 chmod 640 \
    && chmod 0640 site/wp-config.php \
    && chmod 0640 .htaccess \
    && chmod 0770 site/assets/cache

WORKDIR /root
USER root
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisord.conf"]
