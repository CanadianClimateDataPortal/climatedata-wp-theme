<?php
/**
 * REST API V3 initialization.
 *
 * This file initializes the WordPress REST API V3 functionality for
 * map and download applications. It handles registration and loading
 * of custom endpoints and defines common functions.
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

/**
 * Register REST API V3 endpoints.
 *
 * @return void
 */
function cdc_rest_v3_init() {
	// Load endpoint definitions.
	require_once dirname( __FILE__ ) . '/datasets-list.php';
	require_once dirname( __FILE__ ) . '/variables-list.php';
	require_once dirname( __FILE__ ) . '/variables-filters.php';
	require_once dirname( __FILE__ ) . '/variable.php';
	require_once dirname( __FILE__ ) . '/idf.php';
}

add_action( 'rest_api_init', 'cdc_rest_v3_init' );

/**
 * Permission callback for REST API V3 endpoints.
 *
 * Ensures requests only come from the same WordPress domain.
 *
 * @return bool|WP_Error True if permission granted, WP_Error otherwise
 */
function cdc_rest_v3_endpoint_permission() {
	// Get the WordPress site URL and domain.
	$site_url = parse_url( get_site_url(), PHP_URL_HOST );

	// Get HTTP referer.
	$referer      = isset( $_SERVER['HTTP_REFERER'] ) ? $_SERVER['HTTP_REFERER'] : '';
	$referer_host = $referer ? parse_url( $referer, PHP_URL_HOST ) : '';

	// Get request origin.
	$origin      = isset( $_SERVER['HTTP_ORIGIN'] ) ? $_SERVER['HTTP_ORIGIN'] : '';
	$origin_host = $origin ? parse_url( $origin, PHP_URL_HOST ) : '';

	// Check if request is from REST API interface.
	$is_rest_request = defined( 'REST_REQUEST' ) && REST_REQUEST;

	// Get the current request host.
	$request_host = isset( $_SERVER['HTTP_HOST'] ) ? $_SERVER['HTTP_HOST'] : '';

	// Security checks.
	$is_same_domain = false;

	// Clean and validate domains.
	$site_url     = sanitize_text_field( $site_url );
	$referer_host = sanitize_text_field( $referer_host );
	$origin_host  = sanitize_text_field( $origin_host );
	$request_host = sanitize_text_field( $request_host );

	// Check if the request is from the same domain.
	if ( $is_rest_request && ! empty( $request_host ) ) {
		// Compare with site URL.
		if ( $request_host === $site_url ) {
			$is_same_domain = true;
		}

		// Check referer if available.
		if ( ! empty( $referer_host ) && $referer_host === $site_url ) {
			$is_same_domain = true;
		}

		// Check origin if available.
		if ( ! empty( $origin_host ) && $origin_host === $site_url ) {
			$is_same_domain = true;
		}
	}

	// Log unauthorized attempts if logging is enabled.
	if ( ! $is_same_domain && WP_DEBUG ) {
		error_log( sprintf(
			'Unauthorized API access attempt from: %s, Referer: %s, Origin: %s',
			$request_host,
			$referer_host,
			$origin_host
		) );
	}

	// Return result.
	if ( $is_same_domain ) {
		return true;
	}

	return new WP_Error(
		'rest_forbidden',
		esc_html__( 'Access denied. Only same-domain requests are allowed.', 'cdc' ),
		array(
			'status' => 403,
			'source' => 'domain_restriction'
		)
	);
}

/**
 * Build a multilingual field array.
 *
 * This function creates an associative array with 'en' and 'fr' keys
 * if the corresponding input values are not empty. If both inputs are empty,
 * it returns null.
 *
 * @param string $en The English value of the field.
 * @param string $fr The French value of the field.
 *
 * @return array|null The multilingual field array or null if both inputs are empty.
 */
function cdc_rest_v3_build_multilingual_field( $en, $fr ) {
	$field = array();

	if ( ! empty( $en ) ) {
		$field['en'] = $en;
	}

	if ( ! empty( $fr ) ) {
		$field['fr'] = $fr;
	}

	return ! empty( $field ) ? $field : null;
}

/**
 * Helper function to get taxonomy terms data.
 *
 * @param int $post_id The post ID.
 * @param string $taxonomy The taxonomy name.
 *
 * @return array The formatted taxonomy terms data.
 */
function cdc_rest_v3_get_taxonomy_terms_data( $post_id, $taxonomy ) {
	$terms           = wp_get_post_terms( $post_id, $taxonomy );
	$formatted_terms = array();

	if ( ! is_wp_error( $terms ) ) {
		foreach ( $terms as $term ) {
			$formatted_terms[] = array(
				'term_id' => $term->term_id,
				'title'   => cdc_rest_v3_build_multilingual_field(
					$term->name,
					get_field( 'title_fr', $term )
				),
			);
		}
	}

	return array( 'terms' => $formatted_terms );
}

/**
 * Set cache headers for REST API V3 endpoints.
 *
 * This function sets the Cache-Control header to cache the response
 * for 24 hours for specific REST API V3 endpoints.
 *
 * @param bool $served Whether the request has already been served.
 * @param WP_HTTP_Response $result Result to send to the client.
 * @param WP_REST_Request $request Request used to generate the response.
 * @param WP_REST_Server $server Server instance.
 *
 * @return bool True if the request has been served, otherwise false.
 */
function cdc_rest_v3_set_cache( $served, $result, $request, $server ) {
	$cacheable_endpoints = [
		'cdc/v3/datasets-list',
		'cdc/v3/variables-list',
		'cdc/v3/variables-filters',
		'cdc/v3/variable',
	];

	$route = $request->get_route();

	if ( array_filter( $cacheable_endpoints, function ( $endpoint ) use ( $route ) {
		return strpos( $route, $endpoint ) !== false;
	} ) ) {
		header( 'Cache-Control: public, max-age=86400' ); // Cache for 24 hours.
	}

	return $served;
}

add_action( 'rest_pre_serve_request', 'cdc_rest_v3_set_cache', 10, 4 );
