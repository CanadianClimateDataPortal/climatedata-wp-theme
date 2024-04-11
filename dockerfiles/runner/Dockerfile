# syntax=docker/dockerfile:1

# Dockerfile for the "runner".
#
# The "runner" is a task runner for the website files. The task runner can run various scripts and utilities to help in
# the development of asset files, to test source files and to build assets.
#
# It's intended to be used only during development, in the CI/CD and to build production assets. It's not intended to
# run on the production server. For this reason, the source files are not built into the image, they are expected to
# be mounted when creating a container.
#
# This Dockerfile assumes that the context directory is the root of the project. So, when building the image, make sure
# to build it from the project's root.
#
# Currently, the runner only compiles SASS files into CSS files.

FROM node:21.7-bookworm

# Put global npm packages in the `node` user's directory instead of the `root` user's directory
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin:/home/node/bin/dart-sass
ENV NODE_ENV production
ENV NPM_CONFIG_LOGLEVEL info

# For `dumb-init`, see point #5 in:
#   https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/
#   also see: https://github.com/Yelp/dumb-init
RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init \
    && rm -rf /var/lib/apt/lists/* 

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

RUN wget -qO- https://github.com/sass/dart-sass/releases/download/1.72.0/dart-sass-1.72.0-linux-x64.tar.gz | tar xvz -C /opt
RUN ln -s /opt/dart-sass/sass /usr/local/bin/sass

COPY --chmod=755 dockerfiles/runner/bin /usr/local/bin

USER node
WORKDIR /home/node/app
