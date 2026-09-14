# Developing with the screenshot service

This documentation explains how to run the portal site and the screenshot
service together on one machine. You then download a map image that carries
the enriched information: the title, the legend, the grid, and the location
popup with its marker.

The screenshot service is the `climatedata-api` project. Its `/raster` endpoint
loads a map page in a headless Chrome and returns a PNG image. Nothing here adds
a capability. It documents how to run what already exists.

## Requirements

* The Docker assets. The command needs the server `<URL>`, and asks for a
  username and a password unless you pass them as options (see
  [Setup](./developing-with-docker-compose.md#setup)):
  ```shell
  ./dev.sh download-docker-assets <URL>
  ```
  It writes the certificate files to `dockerfiles/mounts/ssl/`. The proxy of
  [step 4](#4-add-the-https-proxy-to-the-portal) serves `fullchain.pem` and
  `privkey.pem` from there, on port `5001`.

  The certificate does not have to be the production one. It must match the
  hostname (see [Why the hostname matters](#why-the-hostname-matters)), and
  both your browser and the headless Chrome of the service must trust it: the
  service cannot ignore certificate errors without a change to its code. A
  self-signed certificate works only when its authority is in the trust store
  of the machine, for example one installed with `mkcert`.
* The portal running with Docker Compose, as described in
  [Developing with Docker Compose](./developing-with-docker-compose.md#setup).
* Google Chrome, installed on the host machine.
* [uv](https://docs.astral.sh/uv/), installed on the host machine.

## Why a proxy is needed

The map app calls `/raster` with a cross-origin `POST` request that sends JSON.
The browser first sends a CORS preflight (`OPTIONS`) request. The Flask
application of `climatedata-api` answers that preflight, but with no CORS
headers, so the browser rejects the call.

The `installation.txt` file in the `climatedata-api` repository is an old setup
note, not the deployed configuration. The nginx block it shows adds the
`Access-Control-Allow-Origin` header only. It does not answer a preflight.

Locally, the portal's own nginx fills the gap. It listens on port `5001` with
TLS, answers the preflight with the CORS headers, and forwards `/raster` to the
screenshot service on port `5000` of the host machine.

### Why the hostname matters

Chrome and Firefox allow an HTTPS page to call `http://localhost`. So the real
blockers are CORS, described in [Why a proxy is needed](#why-a-proxy-is-needed),
and the name on the certificate.

The certificate in `dockerfiles/mounts/ssl/` is a publicly trusted
wildcard certificate for the `climatedata.ca` and `donneesclimatiques.ca`
domains. It carries no IP address, so `https://127.0.0.1:5001` fails the name
validation, in your browser and in the headless Chrome of the service.

`dev-en.climatedata.ca` and `dev-fr.climatedata.ca` both resolve to `127.0.0.1`
in public DNS. No hosts file entry is needed, and the certificate validates.
This is why the frontend calls `https://dev-en.climatedata.ca:5001`.

## Setup

### 1. Install the screenshot service

1. Clone the `climatedata-api` repository next to this one, and check out the
   branch of pull request 43:
   ```shell
   git clone git@github.com:CanadianClimateDataPortal/climatedata-api.git ../API/repo
   cd ../API/repo
   git checkout CLIM-1454-update-raster-endpoint-with-new-payload
   ```
   The directory name `../API/repo` is only an example. Choose any directory:
   nothing in either repository depends on it.
2. From the root of the `climatedata-api` clone, create a virtual environment.
   The `--python-preference only-managed` option makes uv download its own
   CPython, so no system Python is needed. Without it, uv can pick another
   Python that is already on the machine:
   ```shell
   uv venv --python 3.9 --python-preference only-managed .venv
   ```
   Use Python 3.9, 3.10 or 3.11. Python 3.12 does not work, because the pinned
   `numpy` version needs `distutils`.
3. Install the dependencies. Some pure-Python source distributions build during
   the install, but no compiler and no system headers are needed:
   ```shell
   uv pip install -r requirements_dev.txt
   ```

No `local_settings.py` file is needed. The portal page carries
`window.URL_ENCODER_SALT = 'override-me'`, which matches the default of the
service. The `./datasets` NetCDF directory is not needed for `/raster` either.

### 2. Get a chromedriver, without root access

`climatedata_api/raster.py` hardcodes the path `/usr/bin/chromedriver`. Selenium
reads the `SE_CHROMEDRIVER` environment variable, and that variable overrides
the hardcoded path. No `sudo` and no system package are needed.

The `selenium-manager` binary ships inside the installed `selenium` package. It
downloads a chromedriver that matches your installed Chrome. Its path contains
the Python version and the platform, so find it with `find`.

1. From the root of the `climatedata-api` clone, ask `selenium-manager` for a
   driver that matches the installed Chrome:
   ```shell
   SELENIUM_MANAGER=$(find .venv -name selenium-manager -type f)
   "$SELENIUM_MANAGER" --browser chrome --output json
   ```
2. Read `driver_path` in the output. `selenium-manager` keeps the driver in your
   user cache directory, so it survives a reboot. The driver must match the
   installed Chrome. Run the command again after a Chrome update.

### 3. Start the screenshot service

From the root of the `climatedata-api` clone, replace `<driver_path>` with the
value from [step 2](#2-get-a-chromedriver-without-root-access):

```shell
SE_CHROMEDRIVER=<driver_path> \
  .venv/bin/flask --app wsgi:app run -h 0.0.0.0 -p 5000
```

The `-h 0.0.0.0` option is required. When the service listens on `127.0.0.1`,
the proxy in the portal container, set up in
[step 4](#4-add-the-https-proxy-to-the-portal), cannot reach it.

**Warning:** `-h 0.0.0.0` also makes the service reachable from your local
network, and the service has no authentication. Stop it when you are done. A
firewall on the host can also block the traffic from the container to the host.

### 4. Add the HTTPS proxy to the portal

Both files below are ignored by Git, so nothing tracked changes.

1. Create the directory for the configuration file. It does not exist by
   default, and the bind mount fails when the file is missing:
   ```shell
   mkdir -p dockerfiles/mounts/config
   ```
2. Create the file `dockerfiles/mounts/config/raster-proxy.conf`:
   ```nginx
   # Local development only. Not used in staging or in production.
   #
   # The map app calls the screenshot service with a cross-origin POST. That
   # service is the `climatedata-api` project, run separately by the developer,
   # listening on port 5000 of the host machine.
   #
   # This block gives that service an HTTPS front door, using the certificate the
   # portal already mounts. It answers on port 5001 for the two development
   # hostnames, which resolve to 127.0.0.1 in public DNS. The certificate is a
   # wildcard for *.climatedata.ca and carries no IP address, so an address such as
   # https://127.0.0.1:5001 fails name validation and a hostname must be used.

   server {
       listen 5001 ssl;
       server_name dev-en.climatedata.ca dev-fr.climatedata.ca;

       ssl_certificate     /etc/nginx/ssl/fullchain.pem;
       ssl_certificate_key /etc/nginx/ssl/privkey.pem;
       ssl_protocols       TLSv1.2 TLSv1.3;

       location /raster {
           # The map app sends POST with Content-Type: application/json, which makes
           # the browser send a CORS preflight first. The Python service answers
           # OPTIONS itself, but with no CORS headers, so nginx answers it here.
           if ($request_method = OPTIONS) {
               return 204;
           }

           proxy_pass http://host.docker.internal:5000;
           proxy_set_header Host              $host;
           proxy_set_header X-Forwarded-Proto https;

           # A screenshot takes a full map load, then several fixed waits in the
           # service. The nginx default timeout of 60 seconds is not enough.
           proxy_read_timeout 180s;
           proxy_send_timeout 180s;

           # `always` matters: without it nginx drops these headers on a 4xx, and a
           # rejected request reaches the page as an opaque CORS error rather than a
           # readable one.
           add_header 'Access-Control-Allow-Origin'  '*'                     always;
           add_header 'Access-Control-Allow-Headers' 'Content-Type'          always;
           add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS'    always;
       }
   }
   ```
3. Add a `portal` entry to your `compose.override.yaml` (see
   [Custom setup](./developing-with-docker-compose.md#custom-setup)). The file
   has one `services:` key, and every service goes under it. For example, a
   file that already exposes the Ladle port becomes:
   ```yaml
   services:
     task-runner:
       ports:
         - "61000:61000"  # Ladle development server

     # Local development only. Gives the `climatedata-api` screenshot service an
     # HTTPS front door on port 5001, so the HTTPS map page can call it.
     # The server block itself is dockerfiles/mounts/config/raster-proxy.conf.
     portal:
       # The screenshot service runs on the host, not in a container. This name is
       # how the portal container reaches it. The service must listen on 0.0.0.0,
       # because a service bound to 127.0.0.1 is unreachable from here.
       extra_hosts:
         - "host.docker.internal:host-gateway"
       volumes:
         - type: bind
           source: dockerfiles/mounts/config/raster-proxy.conf
           target: /etc/nginx/conf.d/raster-proxy.conf
       ports:
         - "5001:5001"
   ```
   If you do not use Ladle, leave out the `task-runner` entry.
4. Restart the services. A new published port needs a restart. Reloading nginx
   with `./dev.sh nginx -s reload` is not enough:
   ```shell
   ./dev.sh restart
   ```

### 5. Point the frontend at the proxy

While you test locally, point the raster call of the map app at the proxy.
This step edits one tracked file. It is the only tracked file the procedure
touches: everything else you create is ignored by Git or lives outside the
repository.

In
`apps/src/lib/map/image-rastering/create-fetch-target-to-raster-with-encoded-url.ts`,
change this line:

```ts
const rasterEndpoint = new URL('/raster', window.DATA_URL);
```

to:

```ts
const rasterEndpoint = new URL('/raster', 'https://dev-en.climatedata.ca:5001');
```

`window.DATA_URL` is one value, shared by other places in the map app, GeoServer
among them. Pointing it at the proxy would send all of them to the proxy. This
one line redirects the raster call only, and leaves the rest untouched. The URL
uses the hostname, not `127.0.0.1`, for the reason given in
[Why the hostname matters](#why-the-hostname-matters).

**Do not commit this change.** When you are done, undo it:
```shell
git checkout -- apps/src/lib/map/image-rastering/create-fetch-target-to-raster-with-encoded-url.ts
```

## Smoke test the proxy and the service

Before you use the browser, check the proxy and the service with curl.

Nothing in this procedure leaves a file inside the repository, apart from the
two ignored files of [step 4](#4-add-the-https-proxy-to-the-portal).
`git status` must show only the one-line edit of
[step 5](#5-point-the-frontend-at-the-proxy). When a command saves an image,
give it an explicit path outside the repository, as below.

1. Check the CORS preflight. The answer must be `HTTP 204`, with the three
   `Access-Control-Allow-*` headers:
   ```shell
   curl -i -X OPTIONS \
     -H 'Origin: https://dev-en.climatedata.ca' \
     -H 'Access-Control-Request-Method: POST' \
     -H 'Access-Control-Request-Headers: Content-Type' \
     'https://dev-en.climatedata.ca:5001/raster'
   ```
2. Request a map image. The `url` parameter is the Base64 encoding of
   `<url>|<hash>`, URL-encoded. The hash is the Java `String.hashCode()` of the
   map URL followed by the salt, in 32-bit signed arithmetic. The salt is
   `override-me`:
   ```shell
   MAP_URL='https://dev-en.climatedata.ca/maps/?dataset=216&var=hottest_day&scen=ssp126&ver=cmip6&lat=46.21738&lng=-63.75023'
   ENCODED=$(python3 - "$MAP_URL" <<'EOF'
   import base64, sys, urllib.parse

   def hash_code(text):
       h = 0
       for ch in text:
           h = (h * 31 + ord(ch)) & 0xFFFFFFFF
       return h - 0x100000000 if h >= 0x80000000 else h

   url = sys.argv[1]
   salt = "override-me"
   token = base64.b64encode(f"{url}|{hash_code(url + salt)}".encode()).decode()
   print(urllib.parse.quote(token, safe=""))
   EOF
   )
   curl -o /tmp/climatedata-raster-test.png -w '%{http_code} %{content_type}\n' \
     -X POST -H 'Content-Type: application/json' -d '{}' \
     "https://dev-en.climatedata.ca:5001/raster?url=${ENCODED}"
   ```
   The hash of this exact URL with the salt `override-me` is `-1117713198`. It
   is not a constant: another URL or another salt gives another hash.

The command prints the HTTP status and the content type. Success is `200` and
`image/png`: open `/tmp/climatedata-raster-test.png` to see the map. On
failure, that file holds the error instead of an image. A `502` means the proxy
cannot reach the service; see
[The proxy cannot reach the screenshot service](#the-proxy-cannot-reach-the-screenshot-service).
Any other error comes from the service itself, so read its output in the
terminal where it runs.

With the empty body `{}`, the image has no location popup. A body with a
placeholder popup gives a placeholder popup, for example:

```json
{"locationPopupHtml": ["<div>...</div>"], "markerLatLon": [46.21738, -63.75023]}
```

The browser sends the real popup, as described in
[Download a map image](#download-a-map-image).

## Download a map image

The browser builds the real request by itself, with the real popup content.

1. Open the map with the configuration of the
   [smoke test](#smoke-test-the-proxy-and-the-service):
   ```
   https://dev-en.climatedata.ca/maps/?dataset=216&var=hottest_day&scen=ssp126&ver=cmip6&lat=46.21738&lng=-63.75023
   ```
   The map opens on the whole of Canada. The `lat` and `lng` values in this URL
   do not centre the map.
2. In the search box of the map, type `Borden-Carleton`, then select the result
   "Borden-Carleton, (Town), Prince, Prince Edward Island". The map zooms to
   that location, and the location popup opens.
3. Open the developer tools of the browser, on the network tab.
4. In the map header, click **Download**, next to **Share**. Its accessible
   name, read by screen readers, is "Download image from your viewport".
5. In the **Download image from viewport** window, click **Download**. The
   button shows **Generating...** while the service takes the screenshot.

In the network tab, find the `POST` request to
`https://dev-en.climatedata.ca:5001/raster` and confirm that it did not return
an error. Then open the downloaded image. It must carry the four elements: the
title, the legend, the grid, and the location popup with its marker. It can
also show a scenario pill, which was already in exported images before this
work.

The browser sends a request body of this shape:

```
{"locationPopupHtml": [<one string>], "markerLatLon": [<lat>, <lng>]}
```

The string is the inner HTML of the popup, with its Tailwind classes. The
close button and the "See details" link of the popup carry
`data-raster="false"`, so neither appears in the image.

The `url` token of this request differs from the one of the smoke test. The
browser encodes the current URL of the page, which the search changed, so the
hash differs too. This is expected.

## Troubleshoot

### The map page returns an HTTP 500 error after a branch checkout

**Issue**: `/maps/` returns an HTTP 500 error after you switch branches, and it
does not recover by itself.

`apps/src/lib/s2d` is a directory on `main` and a file, `apps/src/lib/s2d.ts`,
on the `CLIM-1454` branch. Git swaps one for the other, the Vite watcher of the
_Task Runner_ (see
[TypeScript files in apps/](./developing-with-docker-compose.md#typescript-files-in-apps))
keeps the old path, and `fw-child/apps/dist/` becomes empty. This
entry stops applying once pull request 709 merges into `main`.

**Solution:** restart the _Task Runner_:
```shell
./dev.sh compose restart task-runner
```

### The proxy cannot reach the screenshot service

**Issue**: calls to `https://dev-en.climatedata.ca:5001/raster` fail, because
the proxy cannot reach the service.

**Solution:** check that the screenshot service listens on `0.0.0.0`, not on
`127.0.0.1`. Restart it with `-h 0.0.0.0`, as shown in
[Start the screenshot service](#3-start-the-screenshot-service). Also check
that a firewall on the host does not block the traffic from the container.

### curl fails on port 443 with an unknown issuer

**Issue**: `curl https://dev-en.climatedata.ca/maps/` fails with an unknown
certificate issuer.

Port `443` serves `cert.pem`, which holds only the leaf certificate (see
`dockerfiles/build/www/configs/nginx/climatedata-site.conf`), the case the
Certbot `README` in `dockerfiles/mounts/ssl/` warns about. Port `5001` serves
`fullchain.pem`, which holds the full chain. Browsers fetch the missing
intermediate certificate themselves, but curl does not.

**Solution:** add the `-k` option to curl for port `443`.

### The map image shows "API KEY REQUIRED"

**Issue**: a map image produced locally shows "API KEY REQUIRED" across the
basemap tiles.

**Solution:** none is needed. This is expected in local development only, and
it does not affect production.

### Expired SSL certificate

**Issue**: the browser or curl reports an expired certificate.

**Solution:** see
[Expired SSL certificate](./developing-with-docker-compose.md#expired-ssl-certificate).
