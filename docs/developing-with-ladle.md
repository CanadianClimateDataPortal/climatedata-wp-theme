# Developing with Ladle

This documentation explains how to run [Ladle](https://ladle.dev/) in the
_Task Runner_ container, with live reload working in your browser.

Ladle shows the `*.stories.tsx` files of `apps/` in isolation. More technical
documentation is available in [the README of the ladle/
directory](../apps/src/lib/ladle/README.md).


## Requirements

* The portal running with Docker Compose, as described in
  [Developing with Docker Compose](./developing-with-docker-compose.md#setup).
* A `compose.override.yaml` file (see
  [Custom setup](./developing-with-docker-compose.md#custom-setup)).

## Why a second port is needed

Ladle serves its pages on port `61000`. Live reload uses a separate WebSocket,
on a port of its own.

By default, that WebSocket listens on `localhost` inside the container. A Docker
port mapping cannot reach it, so the browser console shows
`[vite] failed to connect to websocket`. The stories still load, but they do
not reload when a file changes.

`apps/.ladle/config.mjs` reads the `LADLE_HMR_PORT` environment variable. When
it is set, the WebSocket listens on that port, on every interface of the
container. When it is not set, Ladle keeps its default and live reload does not
reach the browser.

The browser connects to that same host and port, i.e.
`ws://0.0.0.0:<port>`. So the port published on your machine must be the same
as the one in the container.

## Setup

### 1. Publish the ports and set the variable

Your `compose.override.yaml` file is ignored by Git, so nothing tracked changes.

Add a `task-runner` entry. The file has one `services:` key, and every service
goes under it. For example:

```yaml
services:
  # Local development only. Lets the browser reach Ladle and its live reload.
  task-runner:
    environment:
      # Read by apps/.ladle/config.mjs. Must match the published port below.
      LADLE_HMR_PORT: "24678"
    ports:
      - "61000:61000"  # Ladle pages
      - "24678:24678"  # Ladle live reload WebSocket
```

`24678` is only an example. Any free port works, as long as the same number
appears in all three places.

### 2. Restart the services

A new environment variable and a new published port both need the container to
be recreated:

```shell
./dev.sh restart
```

### 3. Start Ladle

```shell
./dev.sh ladle-apps
```

Open <http://localhost:61000>.

## Troubleshoot

### The browser cannot connect to the WebSocket

**Issue**: the browser console shows `[vite] failed to connect to websocket`,
and stories do not reload on change.

**Solution:** check that `LADLE_HMR_PORT` is set in the container:

```shell
./dev.sh compose exec task-runner printenv LADLE_HMR_PORT
```

If it prints nothing, check your `compose.override.yaml`, then run
`./dev.sh restart`. If it prints a port, check that the same port is published
in the `ports:` list.

### Port is already in use

**Issue**: Ladle logs `WebSocket server error: Port is already in use`.

**Solution:** pick another port, and change it in all three places of
[step 1](#1-publish-the-ports-and-set-the-variable). Then run
`./dev.sh restart`.
