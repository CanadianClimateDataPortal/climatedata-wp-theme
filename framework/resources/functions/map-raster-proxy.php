<?php
declare(strict_types=1);

/**
 * Map raster proxy.
 *
 * This file forwards a map screenshot request to the external screenshot
 * service and streams the resulting PNG back to the browser.
 *
 * `framework/functions.php` requires it, above that file's own `$includes`
 * array, from a top-level conditional matching `POST /maps` or `POST /cartes`
 * that calls `exit` right after.
 * That point runs after WordPress core, plugins, and both themes'
 * registrations have loaded, and before `init` fires, before `wp()` builds the
 * main query, before a template is chosen, and before anything is echoed, so
 * the response headers are still ours to set.
 * Keeping the conditional at the top level is what makes the design worth
 * having, and the cost it avoids is spelled out further down.
 *
 * This file calls no WordPress function, reads no WordPress global, and loads
 * no `wp-load.php`, theme, plugin, or database connection.
 * It is therefore correct on its own if a web server ever routes to it
 * directly, producing the same output without the bootstrap already paid for
 * by the time `functions.php` reaches it.
 * The method and path checks below are real validation on that path, rather
 * than decoration of a check `functions.php` already made.
 *
 * That self-containment is also why this file carries no
 * `defined( 'ABSPATH' ) || exit;` line.
 * The guard is a WordPress idiom for files that only ever run inside a booted
 * WordPress, and here it would abort a file designed to run without one.
 *
 * A stray second `require` of this file fails loudly on the `const`
 * redeclarations below rather than silently running its logic twice.
 *
 * The screenshot service renders the map in its own headless Selenium Chrome.
 * It authenticates each request by a hash of the target URL combined with a
 * shared secret, computed here so a proxied request needs no secret in the
 * browser.
 * The map page still echoes that same secret into `window.URL_ENCODER_SALT` for
 * the direct-to-service path the Maps app falls back to, so this file leaves the
 * secret as public as it already was.
 *
 * The service contract this file speaks to:
 * - `POST {backend URL}/raster?url=<encoded>` where `<encoded>` is
 *   `urlencode( base64( "<url>|<hash>" ) )`.
 * - An optional JSON body carrying `locationPopupHtml` and `markerLatLon`,
 *   which the service replays into the page it screenshots.
 * - A `200` response carrying `image/png`, or an error response carrying
 *   HTML that must stay out of the browser.
 *
 * This file's own request contract:
 * - The path comes from the request line itself (`/maps` or `/cartes`, with or
 *   without a trailing slash), never from the body.
 * - The map page's query string arrives in the JSON body as `mapQuery`, with no
 *   leading `?`, and a query string on the request URI itself is ignored.
 * - That same body optionally carries `locationPopupHtml` and `markerLatLon`.
 *
 * The browser half of this round trip lives in
 * `apps/src/lib/map/image-rastering/`, where `resolveRasterFetchTarget` posts to
 * the map page's own URL once `window.RASTER_PROXY_ENABLED` is set.
 * No deployment sets that flag yet, so this endpoint currently answers requests
 * a developer aims at it deliberately, and the Maps app still reaches the
 * screenshot service directly.
 *
 * Answering here rather than through a registered route is what keeps the cost
 * down.
 * A route registered the usual WordPress way is reached after `init`, and one
 * map page load past that point costs 118 term-taxonomy queries over 29
 * distinct post IDs plus 18 identical 23 KB writes of the serialized
 * `rewrite_rules` option.
 * A screenshot request needs none of that work.
 *
 * @see https://www.php.net/manual/en/book.curl.php
 */

// ---------------------------------------------------------------------------
// Configuration, read from the environment so retargeting the backend or
// rotating the shared secret is a docker-compose change and nothing else.
// ---------------------------------------------------------------------------

/**
 * Base URL of the screenshot service, without a trailing slash.
 *
 * Reads `CDC_RASTER_BACKEND_URL` from the environment.
 * An empty value is a valid, fully supported state: this environment has no
 * screenshot service configured, and the proxy answers 503.
 * This one value carries both facts at once — whether to accept a request, and
 * where to forward it — so no separate flag exists that could disagree with it.
 */
$cdcRasterBackendUrl = rtrim( (string) ( getenv( 'CDC_RASTER_BACKEND_URL' ) ?: '' ), '/' );

/**
 * Shared secret the screenshot service also holds, used to sign the target URL.
 */
$cdcRasterUrlSalt = (string) ( getenv( 'CDC_RASTER_URL_SALT' ) ?: '' );

/**
 * Whether cURL verifies the backend's TLS certificate.
 *
 * Defaults to true.
 * Set `CDC_RASTER_BACKEND_VERIFY_TLS` to `0`, `false`, `no`, or `off` to
 * accept a self-signed backend certificate, which a local or staging
 * deployment may need.
 */
$cdcRasterVerifyTlsRaw = getenv( 'CDC_RASTER_BACKEND_VERIFY_TLS' );
$cdcRasterVerifyTls    = ( false === $cdcRasterVerifyTlsRaw || '' === $cdcRasterVerifyTlsRaw )
	? true
	: ! in_array( strtolower( $cdcRasterVerifyTlsRaw ), array( '0', 'false', 'no', 'off' ), true );

// ---------------------------------------------------------------------------
// Tuning constants.
//
// These stay as plain `const` rather than deployment-target values, because
// they tune this file's own behaviour rather than pointing it at a
// different backend.
// ---------------------------------------------------------------------------

/**
 * Request paths this file agrees to screenshot.
 *
 * The map app answers at `/maps` in English and `/cartes` in French, and a
 * request may or may not carry a trailing slash, so both forms of each are
 * listed rather than normalised — normalising would be one more thing that
 * could disagree with `framework/functions.php`'s own matching.
 * Both entries stay literal so this file depends on no function or constant
 * defined elsewhere.
 */
const CDC_RASTER_ALLOWED_PATHS = array( '/maps', '/maps/', '/cartes', '/cartes/' );

/**
 * Longest accepted map query string, in bytes.
 *
 * A map's state serialises to a few hundred bytes.
 * A cap keeps the signed string bounded and removes a cheap amplification lever.
 */
const CDC_RASTER_MAX_QUERY_LENGTH = 2048;

/**
 * Seconds cURL waits for the whole request, connect through response body.
 *
 * The screenshot service sleeps 1 second, waits up to 10 seconds for the
 * page to signal readiness, then sleeps a further 4 seconds before
 * capturing — a floor of roughly 15 seconds.
 * Observed healthy requests run 10-45 seconds under real load.
 * 60 seconds clears that ceiling with margin for network and TLS overhead
 * while still freeing a PHP-FPM worker from a stuck backend in bounded time.
 *
 * `max_execution_time` in `dockerfiles/build/www/configs/php/php.ini` is 30,
 * below this value, so `cdc_raster_handle_request()` below calls
 * `set_time_limit()` to raise it for the life of this request.
 * Whether this PHP-FPM build's execution timer counts time spent inside
 * `curl_exec()` stays unconfirmed, since the PHP manual describes that as
 * SAPI-dependent.
 * `set_time_limit()` is called either way, because it is correct and free in
 * both cases.
 */
const CDC_RASTER_CURL_TIMEOUT = 60;

/**
 * Bytes of a failed backend response kept in the error log.
 *
 * The service answers failures with an HTML page — a small generic page in
 * production, or tens of kilobytes of Werkzeug debugger markup locally — so
 * the log keeps a readable prefix rather than the whole body.
 */
const CDC_RASTER_ERROR_LOG_EXCERPT = 512;

// ---------------------------------------------------------------------------
// Pure helpers.
// ---------------------------------------------------------------------------

/**
 * Hash a string the way `hashCode()` in `apps/src/lib/utils.ts` does.
 *
 * The reference implementation reads:
 *
 *     export const hashCode = (s: string)=> {
 *         return s.split('').reduce(function (a: number, b: string) {
 *             a = (a << 5) - a + b.charCodeAt(0);
 *             return a & a;
 *         }, 0);
 *     }
 *
 * The arithmetic is signed 32-bit two's complement.
 * JavaScript's `a & a` looks redundant and exists to force the ToInt32
 * coercion that bitwise operators apply.
 * PHP integers are 64 bits wide and `<<` keeps growing them, so each
 * iteration here masks the accumulator back to 32 bits and restores the sign.
 * Masking every iteration reaches the same result as JavaScript's single mask
 * at the end, because shifting, subtracting and adding are all well defined
 * modulo 2^32.
 *
 * Results are routinely negative and carry a leading minus sign into the
 * signed string.
 * Both verification fixtures for this function produce negative hashes.
 *
 * The screenshot service computes the same value with numpy 32-bit integers
 * in `calculate_hash()`, and describes the formula as:
 * "Same formula as in Java lang String.java: s[0]*31^(n-1) + s[1]*31^(n-2) +
 * ... + s[n-1], in 32 bits signed arithmetic".
 *
 * This reproduces the browser's `hashCode` exactly, verified byte-identical
 * against production.
 *
 * @param string $s ASCII-only input.
 *                  JavaScript iterates UTF-16 code units while `ord()` reads
 *                  bytes, so the two agree below U+0080 and diverge above it.
 *                  Callers pass the result of `URL.toString()`, which
 *                  percent-encodes everything outside ASCII.
 *                  `cdc_raster_reject_query()` enforces this for the query
 *                  portion of that URL.
 *
 * @return int Signed 32-bit hash.
 */
function cdc_raster_hash_code( string $s ): int {
	$a   = 0;
	$len = strlen( $s );

	for ( $i = 0; $i < $len; $i++ ) {
		$a = ( ( $a << 5 ) - $a ) + ord( $s[ $i ] );
		$a = $a & 0xFFFFFFFF;

		if ( $a & 0x80000000 ) {
			$a -= 0x100000000;
		}
	}

	return $a;
}

/**
 * Encode a URL for the screenshot service's `url` query parameter.
 *
 * The reference implementation reads:
 *
 *     export const encodeURL = (url: string, salt: string) => {
 *         const hash = hashCode(url + salt);
 *         const encoded = encodeURIComponent(btoa(`${url}|${hash}`));
 *         return { encoded, hash };
 *     };
 *
 * `base64_encode()` matches `btoa()` for ASCII input, since `btoa()` encodes
 * Latin-1 bytes and PHP encodes bytes.
 *
 * `rawurlencode()` matches `encodeURIComponent()` for base64 output.
 * The two differ only over the characters `!*'()`, and base64 produces none
 * of them.
 *
 * This function stays free of any request state so a verification script can
 * call it directly with a known URL and salt.
 *
 * This reproduces the browser's `encodeURL` exactly, verified byte-identical
 * against production.
 *
 * @param string $url  Absolute URL of the page to screenshot.
 * @param string $salt Shared secret the screenshot service also holds.
 *
 * @return string Value ready to append to `?url=`.
 */
function cdc_raster_encode_url( string $url, string $salt ): string {
	$hash = cdc_raster_hash_code( $url . $salt );

	return rawurlencode( base64_encode( $url . '|' . $hash ) );
}

/**
 * Describe why a query string is unacceptable, or return an empty string.
 *
 * Three rules apply.
 *
 * A length cap keeps the signed string bounded.
 *
 * The vertical bar is reserved.
 * The screenshot service separates the URL from its hash on that character
 * and splits into exactly two parts, so a URL carrying one makes the service
 * raise and answer `400`.
 * Refusing it here returns a message that names the cause.
 *
 * Bytes at or above `0x80` would hash differently on each side, because
 * JavaScript reads UTF-16 code units where `cdc_raster_hash_code()` reads
 * bytes.
 * A browser builds the query with `URL.toString()`, which percent-encodes
 * those characters, so a well-formed request never carries them.
 * Checking anyway keeps the guarantee inside this file rather than resting
 * on the caller.
 *
 * @param string $query Query string with no leading `?`.
 *
 * @return string Error code, or an empty string when the query is acceptable.
 */
function cdc_raster_reject_query( string $query ): string {
	if ( strlen( $query ) > CDC_RASTER_MAX_QUERY_LENGTH ) {
		return 'raster_invalid_query';
	}

	if ( false !== strpos( $query, '|' ) ) {
		return 'raster_invalid_query';
	}

	if ( 1 !== preg_match( '/^[\x00-\x7F]*$/', $query ) ) {
		return 'raster_unsupported_charset';
	}

	return '';
}

/**
 * Read this site's own scheme and host, the way `wp-config.php` does.
 *
 * `dockerfiles/build/www/configs/wordpress/wp-config.php` trusts
 * `HTTP_X_FORWARDED_PROTO` for the same reason: nginx terminates TLS, but a
 * reverse proxy in front of it may terminate TLS again and forward plain
 * HTTP, in which case `$_SERVER['HTTPS']` alone would read as off.
 * Mirroring that trust decision here keeps this file's idea of "same origin"
 * consistent with WordPress's.
 *
 * The host comes from the request the browser actually sent, never from a
 * request body — that is what keeps a caller from signing a URL on a host of
 * its own choosing.
 *
 * @return string Origin such as `https://dev-en.climatedata.ca`, no trailing slash.
 */
function cdc_raster_site_origin(): string {
	$forwardedHttps = isset( $_SERVER['HTTP_X_FORWARDED_PROTO'] )
		&& 'https' === $_SERVER['HTTP_X_FORWARDED_PROTO'];
	$directHttps    = isset( $_SERVER['HTTPS'] )
		&& '' !== $_SERVER['HTTPS']
		&& 'off' !== $_SERVER['HTTPS'];
	$scheme         = ( $forwardedHttps || $directHttps ) ? 'https://' : 'http://';
	$host           = (string) ( $_SERVER['HTTP_HOST'] ?? '' );

	return $scheme . $host;
}

/**
 * Extract the screenshot payload from a decoded request body.
 *
 * The screenshot service validates the two keys independently, so this
 * function keeps whichever one arrives well formed and drops the other.
 * It mirrors the service's own rules: `locationPopupHtml` is a list of one
 * or two strings, and `markerLatLon` is a pair of numbers.
 *
 * An empty array means the request carries no payload.
 * The caller then sends no body at all, because the service reads its body
 * with a bare `request.get_json()` that raises on an empty body when the
 * content type announces JSON, answering `400` instead of falling back to a
 * screenshot without a marker.
 *
 * @param array<string, mixed> $decoded Decoded JSON request body.
 *
 * @return array<string, mixed> Payload to forward, possibly empty.
 */
function cdc_raster_extract_payload( array $decoded ): array {
	$payload = array();
	$popup   = $decoded['locationPopupHtml'] ?? null;
	$marker  = $decoded['markerLatLon'] ?? null;

	if ( is_array( $popup ) && count( $popup ) >= 1 && count( $popup ) <= 2 ) {
		$strings = array_filter( $popup, 'is_string' );

		if ( count( $strings ) === count( $popup ) ) {
			$payload['locationPopupHtml'] = array_values( $popup );
		}
	}

	if ( is_array( $marker ) && 2 === count( $marker ) ) {
		$marker = array_values( $marker );

		if ( is_numeric( $marker[0] ) && is_numeric( $marker[1] ) ) {
			$payload['markerLatLon'] = array( (float) $marker[0], (float) $marker[1] );
		}
	}

	return $payload;
}

/**
 * Answer with a small JSON error body and stop.
 *
 * @param int    $status  HTTP status code.
 * @param string $code    Short machine-readable error code.
 * @param string $message Human-readable message, safe to display.
 */
function cdc_raster_fail( int $status, string $code, string $message ): never {
	http_response_code( $status );
	header( 'Content-Type: application/json; charset=utf-8' );
	echo json_encode( array( 'error' => $code, 'message' => $message ) );
	exit;
}

// ---------------------------------------------------------------------------
// The pass-through itself.
// ---------------------------------------------------------------------------

/**
 * Read one raster request, forward it, and answer with the image or an error.
 *
 * Rate limiting is deferred rather than reimplemented here.
 * The earlier REST-route version counted requests in WordPress transients,
 * which a file running outside a WordPress bootstrap cannot reach.
 * The two stores available without rebuilding the image are APCu, which the
 * `Dockerfile` does not install, and a file-based counter carrying its own
 * locking and cleanup, and both are the apparatus this rewrite exists to shed.
 *
 * This endpoint is therefore an unauthenticated trigger for the
 * Selenium-backed backend, and the Maps app already posts to it whenever the
 * page reports the proxy as configured.
 * That matches the exposure the shared salt already carries: the map page
 * echoes it into `window.URL_ENCODER_SALT` on every load, so any visitor's
 * browser can compute a valid signed URL and call the backend directly,
 * unthrottled.
 * This file holds that starting point rather than improving on it, and rate
 * limiting is the work that would.
 */
function cdc_raster_handle_request(): void {
	global $cdcRasterBackendUrl, $cdcRasterUrlSalt, $cdcRasterVerifyTls;

	// Raised above CDC_RASTER_CURL_TIMEOUT — see that constant's docblock.
	set_time_limit( CDC_RASTER_CURL_TIMEOUT + 5 );

	if ( 'POST' !== ( $_SERVER['REQUEST_METHOD'] ?? '' ) ) {
		header( 'Allow: POST' );
		cdc_raster_fail( 405, 'raster_method_not_allowed', 'Only POST is supported.' );
	}

	// Repeats the check `framework/functions.php` already made, so this file
	// is correct on its own if the web server ever reaches it directly.
	$path = (string) parse_url( (string) ( $_SERVER['REQUEST_URI'] ?? '' ), PHP_URL_PATH );

	if ( ! in_array( $path, CDC_RASTER_ALLOWED_PATHS, true ) ) {
		cdc_raster_fail( 404, 'raster_invalid_path', 'Unsupported map page.' );
	}

	if ( '' === $cdcRasterBackendUrl ) {
		cdc_raster_fail( 503, 'raster_not_configured', 'The map screenshot service is unavailable.' );
	}

	$decoded = json_decode( (string) file_get_contents( 'php://input' ), true );

	if ( ! is_array( $decoded ) ) {
		cdc_raster_fail( 400, 'raster_invalid_body', 'Request body must be a JSON object.' );
	}

	$query    = (string) ( $decoded['mapQuery'] ?? '' );
	$rejected = cdc_raster_reject_query( $query );

	if ( '' !== $rejected ) {
		cdc_raster_fail( 400, $rejected, 'Unsupported map address.' );
	}

	$mapUrl = cdc_raster_site_origin() . $path . ( '' !== $query ? '?' . $query : '' );
	$target = $cdcRasterBackendUrl . '/raster?url=' . cdc_raster_encode_url( $mapUrl, $cdcRasterUrlSalt );

	$payload     = cdc_raster_extract_payload( $decoded );
	$payloadJson = array() === $payload ? '' : (string) json_encode( $payload );

	// These travel by reference into the two callbacks below: header lines
	// arrive first and settle status/content type/content length, then body
	// chunks arrive and read whatever the header callback already settled.
	$status        = 0;
	$contentType   = '';
	$contentLength = null;
	$decided       = false;
	$isImage       = false;
	$errorExcerpt  = '';

	// Header and body arrive through CURLOPT_HEADERFUNCTION and
	// CURLOPT_WRITEFUNCTION rather than CURLOPT_RETURNTRANSFER, so a
	// successful image streams straight to the browser as cURL receives it
	// instead of sitting fully buffered in PHP memory first — the backend's
	// PNG can reach into the megabytes, and this file never needs the whole
	// thing at once to decide what to do with it.
	$ch = curl_init( $target );
	curl_setopt_array(
		$ch,
		array(
			CURLOPT_POST           => true,
			CURLOPT_TIMEOUT        => CDC_RASTER_CURL_TIMEOUT,
			CURLOPT_SSL_VERIFYPEER => $cdcRasterVerifyTls,
			CURLOPT_SSL_VERIFYHOST => $cdcRasterVerifyTls ? 2 : 0,
			CURLOPT_HEADERFUNCTION => function ( $handle, string $line ) use ( &$status, &$contentType, &$contentLength ): int {
				$trimmed = rtrim( $line, "\r\n" );

				if ( 1 === preg_match( '#^HTTP/\S+\s+(\d{3})#', $trimmed, $matches ) ) {
					// A fresh status line means a fresh set of headers,
					// which matters if the backend ever answers through a
					// 100-continue before its real response.
					$status        = (int) $matches[1];
					$contentType   = '';
					$contentLength = null;
				} elseif ( 0 === stripos( $trimmed, 'content-type:' ) ) {
					$contentType = trim( substr( $trimmed, strlen( 'content-type:' ) ) );
				} elseif ( 0 === stripos( $trimmed, 'content-length:' ) ) {
					$contentLength = trim( substr( $trimmed, strlen( 'content-length:' ) ) );
				}

				return strlen( $line );
			},
			CURLOPT_WRITEFUNCTION  => function ( $handle, string $chunk ) use ( &$decided, &$isImage, &$status, &$contentType, &$contentLength, &$errorExcerpt ): int {
				// Headers are always complete before the first body chunk
				// arrives, so status and content type are final by now —
				// decide once, on the first chunk, and hold that decision
				// for the rest of the transfer.
				if ( ! $decided ) {
					$decided = true;
					$isImage = ( 200 === $status ) && ( 0 === stripos( $contentType, 'image/' ) );

					if ( $isImage ) {
						http_response_code( 200 );
						header( 'Content-Type: ' . $contentType );

						if ( null !== $contentLength ) {
							header( 'Content-Length: ' . $contentLength );
						}

						// The browser receives the image inline; the caller
						// already holds the bytes as a Blob and names the
						// file itself when the visitor saves it, so no
						// Content-Disposition header travels with this
						// response.
						header( 'Cache-Control: private, no-store, max-age=0' );
					}
				}

				if ( $isImage ) {
					echo $chunk;
					flush();
				} elseif ( strlen( $errorExcerpt ) < CDC_RASTER_ERROR_LOG_EXCERPT ) {
					// The screenshot service reports every failure as an
					// HTML page — a generic 265-byte page in production, or
					// a Werkzeug debugger dump locally — so only a bounded
					// excerpt is kept for the log, and none of it reaches
					// the browser.
					$errorExcerpt .= $chunk;
				}

				return strlen( $chunk );
			},
		)
	);

	// Send a body only when there is a payload, so the screenshot service
	// reaches its own path for a request without a marker.
	if ( '' !== $payloadJson ) {
		curl_setopt( $ch, CURLOPT_POSTFIELDS, $payloadJson );
		curl_setopt( $ch, CURLOPT_HTTPHEADER, array( 'Content-Type: application/json' ) );
	}

	$transferred = curl_exec( $ch );

	if ( false === $transferred ) {
		$isTimeout = CURLE_OPERATION_TIMEDOUT === curl_errno( $ch );
		$error     = curl_error( $ch );

		curl_close( $ch );

		// A transport failure after streaming had already begun leaves a
		// truncated image with the browser.
		// The response headers went out with the first chunk, so logging the
		// failure is all this file can still do about it.
		// That is the trade-off streaming buys: no full image in PHP memory, and
		// no clean error once bytes are on the wire.
		if ( $isImage ) {
			error_log( sprintf( 'cdc-raster transport failure mid-stream: %s', $error ) );
			exit;
		}

		error_log( sprintf( 'cdc-raster transport failure: %s', $error ) );

		if ( $isTimeout ) {
			cdc_raster_fail( 504, 'raster_backend_timeout', 'The map image took too long to generate.' );
		}

		cdc_raster_fail( 502, 'raster_backend_unavailable', 'The map image service is unreachable.' );
	}

	curl_close( $ch );

	// A successful image has already streamed out through the write
	// callback above; there is nothing left to send.
	if ( $isImage ) {
		exit;
	}

	error_log(
		sprintf(
			'cdc-raster backend answered %d as %s: %s',
			$status,
			'' === $contentType ? 'an unknown type' : $contentType,
			$errorExcerpt
		)
	);

	cdc_raster_fail( 502, 'raster_backend_error', 'The map image could not be generated.' );
}

// PHP-FPM reports `fpm-fcgi`, so this guard passes on every real request and
// changes nothing in production.
// It exists so `docker compose exec -T portal php < map-raster-proxy.php` can
// define everything in this file while leaving the request handler unrun.
// That command verifies `cdc_raster_hash_code()` and `cdc_raster_encode_url()`
// against known fixtures, and those two functions need no HTTP request.
if ( 'cli' !== PHP_SAPI ) {
	cdc_raster_handle_request();
}
