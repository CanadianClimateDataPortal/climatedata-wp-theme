# syntax=docker/dockerfile:1

# Dockerfile for the "task runner".
#
# The task runner contains various scripts and utilities (i.e. "tasks") to help
# in the development of asset files, to test source files and to build assets.
#
# This Dockerfile assumes that the context directory is the root of the project.
# So, when building the image, make sure to build it from the project's root.

FROM node:23.5-bookworm

# Define environment variables
ENV NPM_CONFIG_LOGLEVEL=info

# For `dumb-init`, see point #5 in:
#   https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/
#   also see: https://github.com/Yelp/dumb-init
RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init \
    && rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Install concurrently and SASS
# Concurrently is needed to output both SASS and Vite logs in the same terminal

RUN npm install -g concurrently sass

# Install custom scripts

COPY --chmod=755 dockerfiles/build/task-runner/bin /usr/local/bin

# Switch to the `node` user

USER node

WORKDIR /app/apps

COPY --chown=node apps/package*.json .

RUN npm ci
