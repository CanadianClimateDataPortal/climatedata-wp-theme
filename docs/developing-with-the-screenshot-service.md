# Developing with the screenshot service

This documentation explains how to run the portal site (i.e., the _Climate Data_ website)
and the screenshot service together on one machine.

The screenshot service is the
[`climatedata-api` project](https://github.com/CanadianClimateDataPortal/climatedata-api).
Its `/raster` endpoint loads a map page in a headless Chrome and returns a PNG image.


## Requirements

* The Docker assets. The command needs the server `<URL>`, and asks for a username and a password
  unless you pass them as options (see [Setup](./developing-with-docker-compose.md#setup)):
  ```shell
  ./dev.sh download-docker-assets <URL>
  ```
  It writes the certificate files to `dockerfiles/mounts/ssl/`
  (Alternatively, you can create the `ssl/` folder inside [`dockerfiles/mounts/`](../dockerfiles/mounts/)).
  The proxy of [step 4](#4-add-the-https-proxy-to-the-portal)
  serves with TLS using `fullchain.pem` and `privkey.pem` certificates, on port `5001`.

  You can use your own certificate instead.
  Keep the file names the nginx configurations read:
  `fullchain.pem` and `privkey.pem` for the proxy on port `5001`, and `cert.pem` and `privkey.pem` for the main site on port `443`.
  The screenshot shows publicly available data, so certificate validation protects nothing here.
  An expired or self-signed certificate should not be able to stop a screenshot.
  Today, the service still validates it: Selenium drives a headless Chrome, which stops on a certificate error.
  So, for now, use a certificate that your browser and that headless Chrome both accept, for the hostname you use
  (see [Why the hostname matters](#why-the-hostname-matters)).
* The portal running with Docker Compose, as described in
  [Developing with Docker Compose](./developing-with-docker-compose.md#setup).
* Google Chrome, installed on the host machine.
* [uv](https://docs.astral.sh/uv/), installed on the host machine.

## Why a proxy is needed

As a frontend developer, you run your own copy of the screenshot service next to the local portal.
With it, you can develop and test the frontend features that depend on it, for example the Download button.
You can also change the service itself when the frontend needs it.

The portal serves the map page over TLS, for example at `https://dev-en.climatedata.ca/maps/`.
Your copy of the service listens on port `5000` of the host, with plain HTTP.
The page needs an HTTPS address on the development hostname that it can call.
The proxy gives it that address, `https://dev-en.climatedata.ca:5001`, and forwards `/raster` to your copy.

Only `/raster` moves to that address, through a temporary edit in
[step 5](#5-point-the-frontend-at-the-proxy).
`window.DATA_URL` stays on the deployed `climatedata-api`, because the map uses it for more than `/raster`,
for example GeoServer.
Your local copy only needs to run the screenshot service.

The `/map` React app calls `/raster` with a
[cross-origin ("CORS")](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS 'Cross-Origin Resource Sharing')
`POST` request that [sends JSON](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Type)
with `Content-Type: application/json`, not a form content type.

Because of that content type, the browser first sends a CORS preflight (`OPTIONS`) request.
A form post would not need a preflight, so JSON adds one more point where CORS can fail.
The Flask application of `climatedata-api` answers that preflight, but with no CORS headers,
so the browser would reject the call.

In a cross-origin call, the page's JavaScript cannot read `Content-Disposition`
unless the response lists it in `Access-Control-Expose-Headers`.
Without it, `headers.get('content-disposition')` returns `null`, and the browser picks the file name.
The view in `climatedata_api/raster.py` sends that header on a successful `POST`.

The `installation.txt` file in the [`climatedata-api`](https://github.com/CanadianClimateDataPortal/climatedata-api)
repository is an old setup note, not the deployed configuration.
The nginx block it shows adds the `Access-Control-Allow-Origin` header only.
It does not answer a preflight.
The deployed staging and production servers are set up outside this repository and differ from `installation.txt`.
Their front server answers the preflight. It sends `Access-Control-Allow-Origin`,
`Access-Control-Allow-Headers` and `Access-Control-Allow-Methods`.

Locally, the proxy on port `5001` does that job.
The call is cross-origin because the port differs from the page.
The other reason is that in production, the hostname to serve this service is a completely different hostname (e.g. `data.climatedata.ca`)

### Why the hostname matters

The browser blocks a call from an HTTPS page to a plain HTTP address on the development hostname.
So the service needs an HTTPS address, and your browser checks the name on its certificate.

The certificate in `dockerfiles/mounts/ssl/` is a publicly trusted
wildcard certificate for the `climatedata.ca` and `donneesclimatiques.ca`
domains. It carries no IP address, so `https://127.0.0.1:5001` fails the name
validation in your browser and in `curl`.

`dev-en.climatedata.ca` and `dev-fr.climatedata.ca` both resolve to `127.0.0.1` in public DNS.
You need no hosts file entry, and your browser accepts the certificate.
This is why the frontend calls `https://dev-en.climatedata.ca:5001`.

## Setup

### 1. Install the screenshot service

1. Clone the `climatedata-api` repository next to this one:
   ```shell
   git clone git@github.com:CanadianClimateDataPortal/climatedata-api.git ../API/repo
   ```
   The directory name `../API/repo` is only an example. Nothing in either repositories are depending on it.
   Then check out the branch that the ticket names for this work.
   The default branch does not carry the `/raster` changes, so the screenshot
   never becomes ready.
2. From the root of the `climatedata-api` clone, create a virtual environment.
   The `--python-preference only-managed` option makes uv download its own
   CPython, so no system Python is needed.
   Without it, uv can pick another Python that is already on the machine:
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
   - On a development machine or VM, a past run of Selenium with Chrome
     may no longer work when the version of chrome gets updated
   - The following command will give the versions installed, there may be more than one.
     Pick the one that is the most recent and accurate depending on your setup (uv, venv, etc.)
   ```shell
   find .venv -name selenium-manager -type f
   .venv/lib/python3.9/site-packages/selenium/webdriver/common/linux/selenium-manager
   .venv/lib/python3.9/site-packages/selenium/webdriver/common/macos/selenium-manager
   ```
   - Use one of the entries from `selenium-manager` and run it
   ```shell
   export SELENIUM_MANAGER=".venv/lib/python3.9/site-packages/selenium/webdriver/common/linux/selenium-manager"
   "$SELENIUM_MANAGER" --browser chrome --output json
   ```
   - The command above output looks like this:
   ```
   {
     "logs": [],
     "result": {
       "code": 0,
       "message": "",
       "driver_path": "/usr/bin/chromedriver",
       "browser_path": "/usr/bin/google-chrome"
     }
   }%
   ```
2. Read `driver_path` in the output. The driver must match the installed
   Chrome.
   Run the command again after a Chrome update.

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

The nginx of the portal container loads every `.conf` file in `/etc/nginx/conf.d/`.
You can bind-mount your own file there, from `dockerfiles/mounts/config/`, through your `compose.override.yaml`.
Each file needs its own bind mount entry.
With this, you can proxy the portal's nginx to any other service that runs on your machine.
The `raster-proxy.conf` file below is one example, for the screenshot service.

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
           add_header 'Access-Control-Expose-Headers' 'Content-Disposition'  always;
       }
   }
   ```
3. Add a `portal` entry to your `compose.override.yaml` (see
   [Custom setup](./developing-with-docker-compose.md#custom-setup)). The file
   has one `services:` key, and every service goes under it. For example:
   ```yaml
   services:
     # Local development only. Gives the `climatedata-api` screenshot service an
     # HTTPS front door on port 5001, so the HTTPS map page can call it.
     portal:
       # The screenshot service runs on the host, not in a container.
       # This name is how the portal container reaches it.
       # The service must listen on 0.0.0.0, because a service bound to
       # 127.0.0.1 is unreachable from here.
       extra_hosts:
         - "host.docker.internal:host-gateway"
       volumes:
         - type: bind
           source: dockerfiles/mounts/config/raster-proxy.conf
           target: /etc/nginx/conf.d/raster-proxy.conf
       ports:
         - "5001:5001"
   ```
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
This one-line edit must be the only tracked change the procedure makes.
`git status`, or the commit that holds the edit, must show nothing else.

In
`apps/src/lib/map/image-rastering/create-fetch-target-to-raster-with-encoded-url.ts`,
change this line:

```ts
const rasterEndpoint = new URL('/raster', window.DATA_URL);
```

to:

```ts
const rasterEndpoint = new URL('/raster', 'https://dev-en.climatedata.ca:5001'); // Keep with no trailing slash
```

`window.DATA_URL` is one value, shared by other places in the map app, GeoServer
among them.
Pointing it at the proxy would send all of them to the proxy.
This one line redirects the raster call only, and leaves the rest untouched.
The URL uses the hostname, not `127.0.0.1`, for the reason given in
[Why the hostname matters](#why-the-hostname-matters).

**This change must never reach `main`.** Choose one of these two ways:
* Keep the edit uncommitted. When you are done, undo it:
  ```shell
  git checkout -- apps/src/lib/map/image-rastering/create-fetch-target-to-raster-with-encoded-url.ts
  ```
* Commit the edit on its own, with nothing else in that commit.
  Revert that commit before the squash-merge.

## Download a map image

1. Open <https://dev-en.climatedata.ca/maps/>, and move the map to any area.
2. Click a location on the map, so that its popup opens.
3. In the map header, click the red 'download' button, it will open a modal
4. Under the title **Download image from viewport**, click the download button.
   The button will show a generating state while the service takes the screenshot.

In the browser dev tools, in the network tab, find the `POST` request to
`https://dev-en.climatedata.ca:5001/raster` and confirm that it did not return
an error.
A `502` means that the proxy cannot reach the service. See
[The proxy cannot reach the screenshot service](#the-proxy-cannot-reach-the-screenshot-service).
Any other error comes from the service itself, so read its output in the
terminal where it runs.

## Troubleshoot

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
[`dockerfiles/build/www/configs/nginx/climatedata-site.conf`](../dockerfiles/build/www/configs/nginx/climatedata-site.conf)),
the case the Certbot `README` in `dockerfiles/mounts/ssl/` warns about.
Port `5001` serves `fullchain.pem`, which holds the full chain.
Browsers fetch the missing intermediate certificate themselves, but curl does not.

**Solution:** add the `-k` option to curl for port `443`.

### Expired SSL certificate

**Issue**: your own browser or curl reports an expired certificate.
This concerns your browser and curl only. A certificate error must not stop the
screenshot service.

**Solution:** see
[Expired SSL certificate](./developing-with-docker-compose.md#expired-ssl-certificate).


