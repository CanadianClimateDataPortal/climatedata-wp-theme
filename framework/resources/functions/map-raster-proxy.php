<?php
declare(strict_types=1);

/**
 * Map raster proxy.
 *
 * This file forwards a map screenshot request to the external screenshot
 * service and streams the resulting PNG back to the browser.
 *
 * `framework/functions.php` requires it, above its own `$includes` array,
 * from a top-level conditional that matches `POST /maps` or `POST /cartes`
 * and calls `exit` right after — see that file for the full reasoning.
 * That point runs after WordPress core, plugins, and both themes'
 * registrations have loaded, but before `init` fires, before `wp()` builds
 * the main query, before a template is chosen, and before anything is
 * echoed, so headers are still ours to set.
 *
 * This file itself calls no WordPress function and reads no WordPress
 * global, so it is independently correct if the web server ever reaches it
 * directly instead — same output, just without the bootstrap already paid
 * for by that point.
 * The method and path check below is therefore real validation, not a
 * decoration of a check `functions.php` already made.
 *
 * This replaces Atom34's `register_rest_route()` version of the same idea
 * (`fw-child/resources/functions/rest-v3/map-raster.php`, commit `98538431`,
 * deleted by this change), which paid a full WordPress bootstrap through
 * `init`, the main query, and template selection before ever reaching its
 * own logic.
 * That version is inert in git history — never `require`d, never
 * reachable — and stays there for the record.
 *
 * A stray second `require` of this file would fail loudly on the `const`
 * redeclarations below rather than silently running its logic twice.
 *
 * The screenshot service renders the map in its own headless Selenium Chrome.
 * It authenticates each request by a hash of the target URL combined with a
 * shared secret, computed here so the secret never leaves the server.
 *
 * The service contract this file speaks to:
 * - `POST {backend URL}/raster?url=<encoded>` where `<encoded>` is
 *   `urlencode( base64( "<url>|<hash>" ) )`.
 * - An optional JSON body carrying `locationPopupHtml` and `markerLatLon`,
 *   which the service replays into the page it screenshots.
 * - A `200` response carrying `image/png`, or an error response carrying
 *   HTML that must never reach the browser as-is.
 *
 * This file's own request contract:
 * - The path comes from the request itself (`/maps` or `/cartes`, with or
 *   without a trailing slash), never from the body.
 * - A JSON body carries `mapQuery` — the map page's query string, without a
 *   leading `?`, since a request to bare `location.pathname` carries none —
 *   plus optionally `locationPopupHtml` and `markerLatLon`.
 *
 * No front-end code calls this endpoint yet; wiring a `fetch()` call to it is
 * later work.
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
 * Unset or empty means the service is not configured for this environment.
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
 * Source: (to confirm) whether this PHP-FPM build's execution timer counts
 * time spent inside `curl_exec()` — the PHP manual describes this as
 * SAPI-dependent, so `set_time_limit()` is called regardless, as a correct
 * and free defensive move either way.
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
 * Ported unchanged from Atom34 (`98538431`), verified byte-identical against
 * production before and after the move.
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
 * Ported unchanged from Atom34 (`98538431`), verified byte-identical against
 * production before and after the move — see this ticket's report for the
 * command output.
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
 * Atom34 used WordPress transients as a counter store; this file has none,
 * and the two alternatives available without an image rebuild — APCu (not
 * among the extensions `Dockerfile` installs) or a file-based counter with
 * its own locking and cleanup — are the apparatus this rewrite exists to
 * avoid rebuilding.
 * Deferring this leaves the endpoint, once a later Atom wires a `fetch()`
 * call to it, an unauthenticated trigger for the Selenium-backed backend.
 * That is the same exposure the shared salt already carries today: it is
 * echoed into `window.URL_ENCODER_SALT` on every map page load
 * (`fw-child/apps/app-map.php`), so any visitor's browser can already
 * compute a valid signed URL and call the backend directly, unthrottled.
 * This file is no worse than that starting point, and it is not better yet.
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

	if ( '' === $cdcRasterBackendUrl || '' === $cdcRasterUrlSalt ) {
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
		// truncated image with the browser. There is no clean way back from
		// that once bytes are sent — headers are gone, so this file can only
		// log it, not answer with a clean error.
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

// PHP-FPM's SAPI is always `fpm-fcgi`, never `cli`, so this guard changes
// nothing in production.
// It exists so `docker compose exec -T portal php < map-raster-proxy.php` — used
// to verify the two functions above against known fixtures — can define
// everything in this file without also running a request handler that
// expects a real HTTP request.
if ( 'cli' !== PHP_SAPI ) {
	cdc_raster_handle_request();
}
