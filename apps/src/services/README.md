# Services — where the apps talk to WordPress

This folder holds the data-fetching layer for the Maps and Download apps.

- `services.ts` — the hand-rolled `fetch()` wrapper and its in-memory cache.
- `download.ts` — the Download app's own calls.
- `wp-node.ts` — exports `wpApiSlice` and `useGetPostsQuery`.

## `wp-node.ts`

It builds `wpApiSlice` with `createApi`, imported from `@reduxjs/toolkit/query/react`.
That is Redux Toolkit Query, the data-fetching layer of [Redux Toolkit](https://redux-toolkit.js.org/).
It declares one endpoint, `getPosts`, and its `baseUrl` points at `/dummy/wp-response-311-dummy.json`.

`apps/src/app/store.ts` imports `wpApiSlice` and registers both its reducer and its middleware.
Nothing in `apps/` imports `useGetPostsQuery`.

The file carries two TODO comments from its author, asking for the real
structure and for documentation once it connects to WordPress.

## The PHP behind these calls lives in `fw-child/`, not `framework/`

Every `cdc/v3` endpoint these apps call registers inside the **child theme**:

```
fw-child/functions.php:307-322
  → fw-child/resources/functions/rest.php:900-907   (require_once rest-v3/init.php)
    → cdc_rest_v3_init()
      → fw-child/resources/functions/rest-v3/datasets-list.php
      → fw-child/resources/functions/rest-v3/variables-list.php
      → fw-child/resources/functions/rest-v3/variable.php
      → fw-child/resources/functions/rest-v3/idf.php
      → fw-child/resources/functions/rest-v3/variables-filters.php
```

`fw-child` is the **active theme**. Its `style.css` declares
`Template: framework`, which makes `framework` the parent. WordPress reports
`stylesheet=fw-child` and `template=framework`. Removing `fw-child/` would
deactivate the site's theme and take these endpoints with it.

The `cdc/v2` routes also register in `fw-child/`, in `fw-child/resources/functions/rest.php`.
The only registration inside `framework/` is `framework/v2/query`, in
`framework/resources/functions/builder/rest.php`, which these apps do not call.

**The convention still stands: write new PHP in `framework/`, never in
`fw-child/`.**
That is about where new code belongs. It is not a statement that `fw-child/` is inert.
It currently serves every API request these apps make.

## Endpoints these apps call

| Endpoint | Registered in |
|---|---|
| `wp-json/cdc/v3/datasets-list` | `fw-child/resources/functions/rest-v3/datasets-list.php` |
| `wp-json/cdc/v3/variables-list` | `fw-child/resources/functions/rest-v3/variables-list.php` |
| `wp-json/cdc/v3/variable` | `fw-child/resources/functions/rest-v3/variable.php` |
| `wp-json/cdc/v3/idf-station-files` | `fw-child/resources/functions/rest-v3/idf.php` |
| `wp-json/cdc/v2/location_search/` | `fw-child/resources/functions/rest.php` |
| `wp-json/cdc/v2/get_location_by_coords` | `fw-child/resources/functions/rest.php` |
| `wp-json/cdc/v2/finch_submit/` | `fw-child/resources/functions/rest.php` |
| `wp-json/wp/v2/posts` | WordPress core |

`variables-filters` registers alongside the others and no code in `apps/`
references it.

## Two things to know before changing this layer

1. **These calls cost more on the server than they look.** Every request that
reaches PHP triggers writes to the WordPress `wp_options` table, unrelated to
what the endpoint returns. One page load of `/maps/` measured 358 SQL statements
and 18 writes. Tracked as CLIM-1472.

2. **The cache in `services.ts` has no in-flight guard.** It checks the cache
before its `await` and fills it after, so concurrent callers all miss. A cold
load of the Maps app therefore fires the same `datasets-list` request three
times.
