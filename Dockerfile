# syntax=docker/dockerfile:1

# Dockerfile for the climatedata.ca web server.
#
# (For a detailled documentation, see docs/portal-docker-image.md)
#
# The image contains PHP-FPM, a web server (Nginx) and all the site files
# (WordPress, plugins, custom themes).
#
# To build, use the "production" target with at least the required build
# arguments:
#   ```
#   docker build \
#     --target production \
#     --build-arg TASK_RUNNER_IMAGE=<IMAGE> \
#     --build-arg LOCAL_WP_PLUGINS_DIR=<PATH> \
#     .
#   ```
#
# Build arguments:
#
#  - TASK_RUNNER_IMAGE (required): name of the Task Runner Docker image used
#      during the multi-stage build.
#  - LOCAL_WP_PLUGINS_DIR (required): local directory, in the build context,
#      containing zip files of WordPress plugins to extract in the WordPress's
#      assets/plugins/ directory. The directory must contain all the files
#      listed in the dockerfiles/build/www/wp-plugins/local.txt file.
#  - WEB_SERVER_USER_ID (optional, default=10000): user id of the created
#      we server user (www-data). Setting the id gives more control over
#      permissions if you mount a directory that must be writable by the website
#      (ex: the assets/upload/ directory). For security reasons, it's
#      recommended that the id be >= 10000, unless you know what you do.
#  - WEB_SERVER_GROUP_ID (optional, default=10001): group id for the created
#      web server user's group (www-data).

ARG TASK_RUNNER_IMAGE

###
# Task runner stage.
#
# The task runner compiles some site's assets from their source files. It
# outputs the generated files in a local dist/ directory.
###

FROM ${TASK_RUNNER_IMAGE} AS task-runner

WORKDIR /home/node/app

COPY --chown=node framework src/framework
COPY --chown=node fw-child src/fw-child

RUN compile-sass.sh src dist

###
# Production website building stage.
#
# To allow reproducibility across environments and better control over breaking
# features, the image sometimes installs specific version of tools or packages.
###

FROM php:8.2-fpm AS production

# ---
# Tools, librairies and softwares installation
# ---

RUN apt-get update && apt-get install -y --no-install-recommends \
        jq \
        less \
        nginx \
        supervisor \
        unzip \
        vim \
        zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions

# See: https://github.com/mlocati/docker-php-extension-installer
ADD \
    --chmod=0755 \
    https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions \
    /usr/local/bin/

# Some PHP extensions are either core extensions or are bundled with PHP, and
# thus don't need a version specification.
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

# WP-CLI

WORKDIR /usr/local/bin
RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    && mv wp-cli.phar wp \
    && chmod +x wp

# Custom scripts

COPY --chmod=755 dockerfiles/build/www/bin /usr/local/bin

# ---
# Software and library configurations
# ---

# Supervisord

COPY dockerfiles/build/www/configs/supervisor/supervisord.conf /etc/

# PHP

RUN mkdir /var/log/php && chown www-data:www-data /var/log/php
COPY --chmod=644 dockerfiles/build/www/configs/php/php.ini /usr/local/etc/php

# PHP-FPM

COPY --chmod=644 dockerfiles/build/www/configs/php-fpm/zz-docker.conf /usr/local/etc/php-fpm.d/

# Nginx

ARG WEB_SERVER_USER_ID=10000
ARG WEB_SERVER_GROUP_ID=10001

RUN usermod -u ${WEB_SERVER_USER_ID} www-data && groupmod -g ${WEB_SERVER_GROUP_ID} www-data

COPY --chmod=644 dockerfiles/build/www/configs/nginx/conf.d/* /etc/nginx/conf.d/

COPY --chmod=644 dockerfiles/build/www/configs/nginx/climatedata-site.conf /etc/nginx/sites-available/
COPY --chmod=644 dockerfiles/build/www/configs/nginx/site-extra/* /etc/nginx/conf.d/climatedata-site/

RUN rm /etc/nginx/sites-enabled/default \
    && ln -s ../sites-available/climatedata-site.conf /etc/nginx/sites-enabled/climatedata-site.conf

# ---
# Wordpress
# ---

WORKDIR /var/www/html

# Installation

RUN rm index.nginx-debian.html
# We add the core fr_CA language to have this language recognized when
# translating strings.
RUN wp core download --allow-root --version=6.3.1 --skip-content --locale=fr_CA

# Base setup

RUN mv wp-content assets
RUN mkdir assets/uploads
RUN mkdir mkdir assets/cache

COPY dockerfiles/build/www/configs/wordpress/wp-config.php .

# Plugins installation

WORKDIR /var/www/html/assets/plugins

# Read plugins defined in the wp-plugins/local.txt file and unzip them from the
# `LOCAL_WP_PLUGINS_DIR` directory.
ARG LOCAL_WP_PLUGINS_DIR
RUN --mount=type=bind,source=$LOCAL_WP_PLUGINS_DIR,target=/tmp/wp-plugins \
    --mount=type=bind,source=dockerfiles/build/www/wp-plugins/local.txt,target=/tmp/plugins.txt \
    plugins=$(grep -v -e '^\s*$' -e '^#' /tmp/plugins.txt) \
    && set -- $plugins \
    && unzip-multiple.sh /tmp/wp-plugins "$@"

# Read plugins defined in the wp-plugins/public.txt file and download them from
# the WordPress plugin repository.
RUN --mount=type=bind,source=dockerfiles/build/www/wp-plugins/public.txt,target=/tmp/plugins.txt \
    plugins=$(grep -v -e '^\s*$' -e '^#' /tmp/plugins.txt) \
    && set -- $plugins \
    && download-wp-plugin.sh "$@"

# ----
# Themes files
# ----

WORKDIR /var/www/html/assets/themes

COPY --from=task-runner /home/node/app/dist .

COPY framework framework
COPY fw-child fw-child
COPY dockerfiles/build/www/configs/wordpress/db.php ./fw-child/resources/app/db.php

# ----
# File permissions
#
# Set restrictive file permissions allowing the web server only read permissions
# (except for specific directories)
# ----

WORKDIR /var/www/html

RUN chown -R root:www-data . \
    && find . -type d -print0 | xargs -0 chmod 750 \
    && find . -type f -print0 | xargs -0 chmod 640 \
    && chmod 0770 assets/cache assets/uploads

WORKDIR /root
USER root
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisord.conf"]

###
# Development image stage.
#
# This stage builds an image that can be used during development. The
# generated image is exactly the same as the one produced by the "production"
# stage, except that it contains some additional development tools. But it
# doesn't contain anything that could easily be done using mounted volumes.
###

FROM production AS development

RUN pecl install xdebug \
    && docker-php-ext-enable xdebug
