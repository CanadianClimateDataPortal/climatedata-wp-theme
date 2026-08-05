<?php
declare(strict_types=1);

/**
 * Shared "is the raster proxy configured" predicate.
 *
 * `map-raster-proxy.php` and the map page's own render path both answer
 * this question, and both must reach the same answer from the same fact,
 * so this file is the one place either of them reads it.
 *
 * `map-raster-proxy.php` requires this file directly, before WordPress has
 * necessarily loaded it any other way, so this file stays free of every
 * WordPress function and global — the same self-containment that file's own
 * docblock describes for itself.
 *
 * @see map-raster-proxy.php Requires this file and gates on `cdc_raster_proxy_is_configured()`.
 */

/**
 * Base URL of the map screenshot service, without a trailing slash.
 *
 * Reads `CDC_RASTER_BACKEND_URL` from the environment.
 * Unset or empty is a valid, fully supported state — it means the service
 * is not configured for this environment, not that something is broken.
 *
 * @return string Trimmed URL with no trailing slash, or '' when unset.
 */
function cdc_raster_backend_url(): string {
	return rtrim( (string) ( getenv( 'CDC_RASTER_BACKEND_URL' ) ?: '' ), '/' );
}

/**
 * Whether the map screenshot proxy is configured for this environment.
 *
 * `CDC_RASTER_BACKEND_URL` alone carries the answer: its presence is both
 * "the proxy should accept requests" and "this is the backend it forwards
 * them to", so there is exactly one fact to check rather than a flag and a
 * target that could disagree.
 *
 * @return bool
 */
function cdc_raster_proxy_is_configured(): bool {
	return '' !== cdc_raster_backend_url();
}
