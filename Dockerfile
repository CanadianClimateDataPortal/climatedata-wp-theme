# syntax=docker/dockerfile:1

ARG RUNNER_IMAGE
ARG PHP_VERSION=8.2

FROM ${RUNNER_IMAGE} as task-runner

WORKDIR /home/node/app

COPY --chown=node framework src/framework
COPY --chown=node fw-child src/fw-child

RUN compile-sass.sh src dist

CMD ["echo", "Done"]


FROM php:${PHP_VERSION}-fpm as production

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

# PHP modules

# https://github.com/mlocati/docker-php-extension-installer
ADD --chmod=0755 https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
    
RUN install-php-extensions \
    gd \
    mysqli \
    pdo \
    pdo_mysql \
    zip

COPY --chmod=755 dockerfiles/www/bin /usr/local/bin

# Supervisor

COPY dockerfiles/www/configs/supervisor/supervisord.conf /etc/

# Apache

RUN a2enmod actions fcgid alias proxy proxy_fcgi setenvif rewrite ssl

COPY dockerfiles/www/configs/apache/100-climatedata*.conf /etc/apache2/sites-available
COPY dockerfiles/www/configs/apache/php-fpm.conf /etc/apache2/conf-available

RUN a2dissite 000-default && \
    a2ensite 100-climatedata && \
    a2ensite 100-climatedata-ssl && \
    a2enconf php-fpm

RUN rm /var/www/html/index.html

# PHP

COPY --chmod=644 dockerfiles/www/configs/php/php.ini /usr/local/etc/php
RUN mkdir /var/log/php && chown www-data:www-data /var/log/php

# WP-CLI

WORKDIR /usr/local/bin
RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    && mv wp-cli.phar wp \
    && chmod +x wp

# Wordpress

USER www-data
WORKDIR /var/www/html/site

ARG WORDPRESS_VERSION=6.3.1
RUN wp core download --version=$WORDPRESS_VERSION --skip-content
RUN mv wp-content assets
RUN echo "<?php define('WP_USE_THEMES', true); require( dirname( __FILE__ ) . '/site/wp-blog-header.php' );" > ../index.php

COPY --chown=www-data:www-data --chmod=744 dockerfiles/www/configs/wordpress/wp-config.php .
COPY --chown=www-data:www-data --chmod=744 dockerfiles/www/configs/wordpress/.htaccess /var/www/html

# Vendor assets

WORKDIR /var/www/html/site/assets/vendor

ARG EXTRA_VENDOR_ASSETS_DIR
RUN --mount=type=bind,target=/tmp/vendor-assets,source=$EXTRA_VENDOR_ASSETS_DIR unzip-all.sh /tmp/vendor-assets

# Plugins

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

## Themes

WORKDIR /var/www/html/site/assets/themes

COPY --chown=www-data:www-data framework framework
COPY --chown=www-data:www-data fw-child fw-child

COPY --chown=www-data:www-data --from=task-runner /home/node/app/dist .

WORKDIR /root

USER root

CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisord.conf"]
