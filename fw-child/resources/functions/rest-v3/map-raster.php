<?php
/**
 * Map raster endpoint.
 *
 * This file defines a same-origin REST endpoint that forwards a map screenshot
 * request to the external screenshot service and returns the resulting PNG.
 *
 * The screenshot service renders the map in its own headless Selenium Chrome.
 * It authenticates each request by a hash of the target URL combined with a
 * shared secret, historically computed in the visitor's browser. Computing that
 * hash here keeps the shared secret on the server and gives the portal a place
 * of its own to apply policy such as rate limiting.
 *
 * The service contract this endpoint speaks to:
 * - `POST {DATA_URL}/raster?url=<encoded>` where `<encoded>` is
 *   `urlencode( base64( "<url>|<hash>" ) )`.
 * - An optional JSON body carrying `locationPopupHtml` and `markerLatLon`,
 *   which the service replays into the page it screenshots.
 * - A `200` response carrying `image/png`, or an error response carrying HTML.
 *
 * This file is standalone and registers nothing until it is required.
 * Adding `require_once dirname( __FILE__ ) . '/map-raster.php';` to
 * `cdc_rest_v3_init()` in `init.php` activates it.
 *
 * @see https://developer.wordpress.org/rest-api/extending-the-rest-api/adding-custom-endpoints/
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

/**
 * Seconds to wait for the screenshot service to answer.
 *
 * The service sleeps 1 second, waits up to 10 seconds for the page to signal
 * readiness, then sleeps a further 4 seconds before capturing. A successful
 * request therefore takes at least 15 seconds and has no hard ceiling.
 *
 * This value is the innermost link of a chain. PHP's `max_execution_time`, the
 * FastCGI read timeout, and any upstream reverse-proxy timeout each need to
 * exceed it. A shorter link higher up surfaces as a generic gateway error with
 * nothing useful in the logs.
 *
 * Source: (to confirm) the production values of the three outer timeouts.
 *
 * Every constant here uses `defined() || define()` so a `WP_`-prefixed
 * environment variable can override it. The Docker image's `wp-config.php`
 * defines a PHP constant from every environment variable starting with `WP_`,
 * stripping that prefix, before any theme code loads. Setting
 * `WP_CDC_RASTER_BACKEND_TIMEOUT=60` therefore changes this value with no code
 * edit.
 */
defined( 'CDC_RASTER_BACKEND_TIMEOUT' ) || define( 'CDC_RASTER_BACKEND_TIMEOUT', 45 );

/**
 * Longest accepted map query string, in bytes.
 *
 * A map's state serialises to a few hundred bytes.
 * A cap keeps the signed string bounded and removes a cheap amplification lever.
 */
defined( 'CDC_RASTER_MAX_QUERY_LENGTH' ) || define( 'CDC_RASTER_MAX_QUERY_LENGTH', 2048 );

/**
 * Requests allowed from one client address within `CDC_RASTER_RATE_LIMIT_WINDOW`.
 *
 * Each accepted request occupies the screenshot service's browser for 15 seconds
 * or more, so the service is the scarce resource this protects.
 */
defined( 'CDC_RASTER_RATE_LIMIT_MAX' ) || define( 'CDC_RASTER_RATE_LIMIT_MAX', 5 );

/**
 * Length of the rate-limiting window, in seconds.
 */
defined( 'CDC_RASTER_RATE_LIMIT_WINDOW' ) || define( 'CDC_RASTER_RATE_LIMIT_WINDOW', 600 );

/**
 * Bytes of a failed backend response kept in the error log.
 *
 * The service answers failures with an HTML debugger page that reaches tens of
 * kilobytes, so the log keeps a readable prefix rather than the whole body.
 */
defined( 'CDC_RASTER_ERROR_LOG_EXCERPT' ) || define( 'CDC_RASTER_ERROR_LOG_EXCERPT', 512 );

/**
 * Full REST route of this endpoint, as `WP_REST_Request::get_route()` reports it.
 *
 * The binary response filter compares against this to recognise its own route.
 */
defined( 'CDC_RASTER_ROUTE' ) || define( 'CDC_RASTER_ROUTE', '/cdc/v3/map-raster' );

/**
 * Register the map raster endpoint.
 *
 * The route name follows the kebab-case nouns already used across `cdc/v3`.
 *
 * `permission_callback` returns true for everyone on purpose. The map is a
 * public page and anonymous visitors are the intended users of this feature.
 * The controls that carry weight here are the map URL reconstruction in
 * `cdc_rest_v3_map_raster_build_map_url()`, which makes the scheme, the host and
 * the path impossible to influence from a request, and the rate limiting in
 * `cdc_rest_v3_map_raster_rate_limit_exceeded()`.
 *
 * A nonce would add little. WordPress derives a nonce for a logged-out visitor
 * from an empty session token, so every anonymous visitor receives the same
 * value and a single request for the map page reveals it. A nonce also expires
 * after 12 to 24 hours, which would break a map page that a visitor left open
 * overnight.
 */
register_rest_route(
	'cdc/v3',
	'map-raster',
	array(
		'methods'             => WP_REST_Server::CREATABLE,
		'callback'            => 'cdc_rest_v3_map_raster',
		'permission_callback' => '__return_true',
	)
);

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
 * The arithmetic is signed 32-bit two's complement. JavaScript's `a & a` looks
 * redundant and exists to force the ToInt32 coercion that bitwise operators
 * apply. PHP integers are 64 bits wide and `<<` keeps growing them, so each
 * iteration here masks the accumulator back to 32 bits and restores the sign.
 * Masking every iteration reaches the same result as JavaScript's single mask at
 * the end, because shifting, subtracting and adding are all well defined modulo
 * 2^32.
 *
 * Results are routinely negative and carry a leading minus sign into the signed
 * string. Both verification fixtures below produce negative hashes.
 *
 * The screenshot service computes the same value with numpy 32-bit integers in
 * `calculate_hash()`, and describes the formula as:
 * "Same formula as in Java lang String.java: s[0]*31^(n-1) + s[1]*31^(n-2) + ...
 * + s[n-1], in 32 bits signed arithmetic".
 *
 * @param string $s ASCII-only input.
 *                  JavaScript iterates UTF-16 code units while `ord()` reads
 *                  bytes, so the two agree below U+0080 and diverge above it.
 *                  Callers pass the result of `URL.toString()`, which
 *                  percent-encodes everything outside ASCII.
 *                  `cdc_rest_v3_map_raster_reject_query()` enforces this.
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
 * `rawurlencode()` matches `encodeURIComponent()` for base64 output. The two
 * differ only over the characters `!*'()`, and base64 produces none of them.
 *
 * This function stays free of WordPress and of request state so a verification
 * script can call it directly with a known URL and salt.
 *
 * Verified against two known-good fixtures, both byte for byte:
 *
 * - Production. URL
 *   `https://climatedata.ca/maps/?var=freeze_thaw_cycles&th=dlyfrzthw_tx0_tn-1&cmp=1&cmpTo=ssp585&region=gridded_data&dataset=216&dataOpacity=70&labelOpacity=71&lat=45.50683&lng=-72.33398&zoom=10`
 *   with salt `deVAzhKYmPjN` gives hash `-1829354212`.
 * - Development. The same query string on host `dev-en.climatedata.ca` with
 *   salt `override-me` gives hash `-1247340579`.
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
 * Read the screenshot service's base URL.
 *
 * The `DATA_URL` constant is the preferred source, because the Docker image
 * defines it from a `WP_DATA_URL` environment variable and therefore keeps
 * deployment configuration outside the image. The theme's global falls in behind
 * it so existing deployments keep working unchanged.
 *
 * @return string Base URL without a trailing slash, or an empty string.
 */
function cdc_rest_v3_map_raster_data_url(): string {
	if ( defined( 'DATA_URL' ) && is_string( DATA_URL ) && '' !== DATA_URL ) {
		return untrailingslashit( DATA_URL );
	}

	if ( isset( $GLOBALS['vars']['data_url'] ) && is_string( $GLOBALS['vars']['data_url'] ) ) {
		return untrailingslashit( $GLOBALS['vars']['data_url'] );
	}

	return '';
}

/**
 * Read the shared secret used to sign the target URL.
 *
 * The `URL_ENCODER_SALT` constant is the preferred source for the same reason as
 * `cdc_rest_v3_map_raster_data_url()`, and it additionally keeps the secret out
 * of the repository. Rotating the secret then becomes a deployment variable
 * change, which matters because the screenshot service holds the same value and
 * the two rotate together.
 *
 * @return string Shared secret, or an empty string.
 */
function cdc_rest_v3_map_raster_salt(): string {
	if ( defined( 'URL_ENCODER_SALT' ) && is_string( URL_ENCODER_SALT ) && '' !== URL_ENCODER_SALT ) {
		return URL_ENCODER_SALT;
	}

	if ( isset( $GLOBALS['vars']['url_encoder_salt'] ) && is_string( $GLOBALS['vars']['url_encoder_salt'] ) ) {
		return $GLOBALS['vars']['url_encoder_salt'];
	}

	return '';
}

/**
 * List the page paths this endpoint agrees to screenshot.
 *
 * The map app answers at `/maps/` in English and `/cartes/` in French.
 * Both entries stay literal so this file keeps working once the surrounding
 * theme moves, and so it depends on no function defined elsewhere.
 *
 * @return string[] Accepted paths, each with leading and trailing slashes.
 */
function cdc_rest_v3_map_raster_paths(): array {
	return array(
		'/maps/',
		'/cartes/',
	);
}

/**
 * Build the absolute URL the screenshot service will load.
 *
 * The scheme and the host come from `home_url()`, which the theme filters per
 * language so it yields the domain the visitor is already on. A request supplies
 * only the path, checked against `cdc_rest_v3_map_raster_paths()`, and the query
 * string. Keeping the host out of a request's reach is what stops this endpoint
 * from signing URLs of someone else's choosing.
 *
 * The query string is concatenated exactly as it arrived. Parsing it and
 * rebuilding it would reorder parameters and re-encode characters such as the
 * commas in `coords`, which would produce a valid signature over a URL that
 * differs from the page the visitor is looking at. That failure is silent: the
 * screenshot would come back showing a slightly different map rather than
 * failing.
 *
 * @param string $path  One of the accepted map paths.
 * @param string $query Query string with no leading `?`, possibly empty.
 *
 * @return string Absolute URL.
 */
function cdc_rest_v3_map_raster_build_map_url( string $path, string $query ): string {
	$map_url = untrailingslashit( home_url() ) . $path;

	if ( '' !== $query ) {
		$map_url .= '?' . $query;
	}

	return $map_url;
}

/**
 * Describe why a query string is unacceptable, or return an empty string.
 *
 * Three rules apply.
 *
 * A length cap keeps the signed string bounded.
 *
 * The vertical bar is reserved. The screenshot service separates the URL from
 * its hash on that character and splits into exactly two parts, so a URL
 * carrying one makes the service raise and answer `400`. Refusing it here
 * returns a message that names the cause.
 *
 * Bytes at or above `0x80` would hash differently on each side, because
 * JavaScript reads UTF-16 code units where `cdc_raster_hash_code()` reads bytes.
 * A browser builds the query with `URL.toString()`, which percent-encodes those
 * characters, so a well-formed request never carries them. Checking anyway keeps
 * the guarantee inside this file rather than resting on the caller.
 *
 * @param string $query Query string with no leading `?`.
 *
 * @return string Error code, or an empty string when the query is acceptable.
 */
function cdc_rest_v3_map_raster_reject_query( string $query ): string {
	if ( strlen( $query ) > (int) CDC_RASTER_MAX_QUERY_LENGTH ) {
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
 * Resolve the address to rate limit against.
 *
 * The site runs behind a reverse proxy, which `wp-config.php` shows by trusting
 * `HTTP_X_FORWARDED_PROTO` to decide the scheme. `REMOTE_ADDR` therefore holds
 * the proxy's address and the visitor's address arrives in a forwarded header.
 *
 * Source: (to confirm) which proxy terminates production traffic, and which
 * header it sets. A client can set `X-Forwarded-For` itself, so this function
 * gives a real limit only once the trusted proxy is known and its own entry is
 * the one read. Until then it groups requests usefully for honest traffic while
 * a determined caller can still present a different value.
 *
 * Keeping the whole question inside one function leaves one place to correct.
 *
 * @return string Address used as the rate limiting key.
 */
function cdc_rest_v3_map_raster_client_address(): string {
	if ( ! empty( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
		$forwarded = explode( ',', (string) $_SERVER['HTTP_X_FORWARDED_FOR'] );
		$candidate = trim( $forwarded[0] );

		if ( '' !== $candidate ) {
			return $candidate;
		}
	}

	if ( ! empty( $_SERVER['REMOTE_ADDR'] ) ) {
		return (string) $_SERVER['REMOTE_ADDR'];
	}

	return 'unknown';
}

/**
 * Record one request and report whether the caller has run out of allowance.
 *
 * The window is fixed rather than sliding. It opens on a caller's first request
 * and closes `CDC_RASTER_RATE_LIMIT_WINDOW` seconds later, whereupon the count
 * restarts. A fixed window lets a caller spend one window's allowance at its end
 * and the next window's at its start. That is acceptable here, because the
 * resource being protected recovers on its own and the goal is to bound sustained
 * load rather than to smooth every burst.
 *
 * @return bool True once the caller has exceeded the allowance.
 */
function cdc_rest_v3_map_raster_rate_limit_exceeded(): bool {
	$key   = 'cdc_raster_rl_' . md5( cdc_rest_v3_map_raster_client_address() );
	$count = (int) get_transient( $key );

	if ( $count >= (int) CDC_RASTER_RATE_LIMIT_MAX ) {
		return true;
	}

	set_transient( $key, $count + 1, (int) CDC_RASTER_RATE_LIMIT_WINDOW );

	return false;
}

/**
 * Extract the screenshot payload from a request body.
 *
 * The screenshot service validates the two keys independently, so this function
 * keeps whichever one arrives well formed and drops the other. It mirrors the
 * service's own rules: `locationPopupHtml` is a list of one or two strings, and
 * `markerLatLon` is a pair of numbers.
 *
 * An empty array means the request carries no payload. The caller then sends no
 * body at all, because the service reads its body with a bare `request.get_json()`
 * that raises on an empty body when the content type announces JSON, answering
 * `400` instead of falling back to a screenshot without a marker.
 *
 * @param WP_REST_Request $request Incoming request.
 *
 * @return array Payload to forward, possibly empty.
 */
function cdc_rest_v3_map_raster_payload( $request ): array {
	$payload = array();
	$popup   = $request->get_param( 'locationPopupHtml' );
	$marker  = $request->get_param( 'markerLatLon' );

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
 * Build the `Content-Disposition` header for a successful response.
 *
 * The screenshot service suggests a descriptive file name of its own. That value
 * arrives from another service, so this function accepts it only when it looks
 * like a plain attachment file name and composes its own otherwise.
 *
 * Reading this header needs no negotiation now that the response is same-origin,
 * so a browser can recover the suggested name.
 *
 * @param string $suggested Header the screenshot service returned.
 *
 * @return string Header value to send.
 */
function cdc_rest_v3_map_raster_disposition( string $suggested ): string {
	if ( 1 === preg_match( '/^attachment; ?filename="[^"\r\n]{1,200}"$/', $suggested ) ) {
		return $suggested;
	}

	return 'attachment; filename="climatedata-map.png"';
}

/**
 * Forward a map screenshot request and return the resulting image.
 *
 * The image travels back through `cdc_rest_v3_map_raster_serve_png()`, because
 * the REST server serialises a callback's return value to JSON and PNG bytes
 * survive no such trip.
 *
 * @param WP_REST_Request $request Incoming request.
 *
 * @return WP_REST_Response|WP_Error Response carrying the image, or an error.
 */
function cdc_rest_v3_map_raster( $request ) {
	$data_url = cdc_rest_v3_map_raster_data_url();
	$salt     = cdc_rest_v3_map_raster_salt();

	if ( '' === $data_url || '' === $salt ) {
		return new WP_Error(
			'raster_not_configured',
			esc_html__( 'The map screenshot service is unavailable.', 'cdc' ),
			array( 'status' => 503 )
		);
	}

	if ( cdc_rest_v3_map_raster_rate_limit_exceeded() ) {
		return new WP_Error(
			'raster_rate_limited',
			esc_html__( 'Too many map image requests. Please try again shortly.', 'cdc' ),
			array( 'status' => 429 )
		);
	}

	$path = (string) $request->get_param( 'mapPath' );

	if ( ! in_array( $path, cdc_rest_v3_map_raster_paths(), true ) ) {
		return new WP_Error(
			'raster_invalid_path',
			esc_html__( 'Unsupported map page.', 'cdc' ),
			array( 'status' => 400 )
		);
	}

	$query    = (string) $request->get_param( 'mapQuery' );
	$rejected = cdc_rest_v3_map_raster_reject_query( $query );

	if ( '' !== $rejected ) {
		return new WP_Error(
			$rejected,
			esc_html__( 'Unsupported map address.', 'cdc' ),
			array( 'status' => 400 )
		);
	}

	$map_url = cdc_rest_v3_map_raster_build_map_url( $path, $query );
	$target  = $data_url . '/raster?url=' . cdc_raster_encode_url( $map_url, $salt );
	$payload = cdc_rest_v3_map_raster_payload( $request );

	$args = array(
		'timeout' => (int) CDC_RASTER_BACKEND_TIMEOUT,
	);

	// Send a body only when there is a payload, so the screenshot service reaches
	// its own path for a request without a marker.
	if ( ! empty( $payload ) ) {
		$args['headers'] = array( 'Content-Type' => 'application/json' );
		$args['body']    = wp_json_encode( $payload );
	}

	$response = wp_remote_post( $target, $args );

	if ( is_wp_error( $response ) ) {
		$message = $response->get_error_message();

		error_log( sprintf( 'cdc/v3/map-raster transport failure: %s', $message ) );

		// A timeout reports itself in the message, and it is worth separating
		// because it points at the timeout chain rather than at the service.
		if ( false !== stripos( $message, 'timed out' ) || false !== stripos( $message, 'timeout' ) ) {
			return new WP_Error(
				'raster_backend_timeout',
				esc_html__( 'The map image took too long to generate.', 'cdc' ),
				array( 'status' => 504 )
			);
		}

		return new WP_Error(
			'raster_backend_unavailable',
			esc_html__( 'The map image service is unreachable.', 'cdc' ),
			array( 'status' => 502 )
		);
	}

	$status       = (int) wp_remote_retrieve_response_code( $response );
	$content_type = (string) wp_remote_retrieve_header( $response, 'content-type' );
	$body         = wp_remote_retrieve_body( $response );

	// Relay bytes only for a successful image.
	// The screenshot service reports every failure as an HTML page, which reaches
	// tens of kilobytes and describes its own internals, so it stays server-side
	// and the log keeps a readable excerpt of it.
	if ( 200 !== $status || 0 !== stripos( $content_type, 'image/' ) ) {
		error_log(
			sprintf(
				'cdc/v3/map-raster backend answered %d as %s: %s',
				$status,
				'' === $content_type ? 'an unknown type' : $content_type,
				substr( $body, 0, (int) CDC_RASTER_ERROR_LOG_EXCERPT )
			)
		);

		return new WP_Error(
			'raster_backend_error',
			esc_html__( 'The map image could not be generated.', 'cdc' ),
			array( 'status' => 502 )
		);
	}

	$result = new WP_REST_Response(
		array(
			'cdcRasterPng'         => $body,
			'cdcRasterDisposition' => cdc_rest_v3_map_raster_disposition(
				(string) wp_remote_retrieve_header( $response, 'content-disposition' )
			),
		),
		200
	);

	return $result;
}

/**
 * Send the PNG bytes instead of a JSON document.
 *
 * The REST server encodes a callback's return value as JSON. This filter runs
 * after the server has chosen its headers and before it writes a body, which is
 * the point where an endpoint can answer with something other than JSON.
 * Calling `header()` here replaces the JSON content type the server already
 * queued, because PHP holds headers until the first byte of output.
 *
 * Every other response, an error among them, passes straight through and the
 * server encodes it as usual.
 *
 * @param bool             $served  True once a response has been written.
 * @param WP_HTTP_Response $result  Result the server is about to write.
 * @param WP_REST_Request  $request Request being served.
 * @param WP_REST_Server   $server  Server instance.
 *
 * @return bool True once this filter has written the response.
 */
function cdc_rest_v3_map_raster_serve_png( $served, $result, $request, $server ) {
	if ( $served ) {
		return $served;
	}

	if ( ! is_a( $request, 'WP_REST_Request' ) || CDC_RASTER_ROUTE !== $request->get_route() ) {
		return $served;
	}

	if ( ! is_a( $result, 'WP_HTTP_Response' ) ) {
		return $served;
	}

	$data = $result->get_data();

	if ( ! is_array( $data ) || ! isset( $data['cdcRasterPng'] ) ) {
		return $served;
	}

	$png = (string) $data['cdcRasterPng'];

	header( 'Content-Type: image/png' );
	header( 'Content-Length: ' . strlen( $png ) );
	header( 'Content-Disposition: ' . $data['cdcRasterDisposition'] );

	// Each image reflects one visitor's map, so it belongs to that response alone.
	header( 'Cache-Control: private, no-store, max-age=0' );

	echo $png;

	return true;
}

add_filter( 'rest_pre_serve_request', 'cdc_rest_v3_map_raster_serve_png', 10, 4 );
