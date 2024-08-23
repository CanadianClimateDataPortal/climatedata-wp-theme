# syntax=docker/dockerfile:1

# Dockerfile for the "task runner".
#
# The task runner contains various scripts and utilities (i.e. "tasks") to help
# in the development of asset files, to test source files and to build assets.
#
# This Dockerfile assumes that the context directory is the root of the project.
# So, when building the image, make sure to build it from the project's root.

FROM node:21.7-bookworm

# Put global npm packages in the `node` user's directory instead of the `root`
# user's directory
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin:/home/node/bin/dart-sass
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=info

# For `dumb-init`, see point #5 in:
#   https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/
#   also see: https://github.com/Yelp/dumb-init
RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init \
    && rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Install SASS

RUN wget -qO- https://github.com/sass/dart-sass/releases/download/1.72.0/dart-sass-1.72.0-linux-x64.tar.gz | tar xvz -C /opt
RUN ln -s /opt/dart-sass/sass /usr/local/bin/sass

# Install custom scripts

COPY --chmod=755 dockerfiles/build/task-runner/bin /usr/local/bin

USER node
WORKDIR /home/node/app
