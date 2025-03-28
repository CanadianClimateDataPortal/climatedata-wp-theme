<?php
/**
 * Datasets list endpoint.
 *
 * This file defines the REST API endpoint for retrieving datasets list
 * from the WordPress taxonomy 'variable-dataset'. It includes functions
 * for handling pagination, data formatting, and cache control.
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

/**
 * Register custom REST API endpoints for retrieving
 * datasets list.
 */
register_rest_route(
	'cdc/v3',
	'datasets-list',
	array(
		'methods'             => WP_REST_Server::READABLE,
		'callback'            => 'cdc_rest_v3_get_datasets_list',
		'permission_callback' => 'cdc_rest_v3_endpoint_permission',
		'args'                => cdc_rest_v3_get_datasets_args(),
	)
);

/**
 * Retrieve the datasets list for the REST API endpoint.
 *
 * This function handles the retrieval of dataset terms based on pagination parameters.
 * It constructs the response with dataset details and includes pagination headers if applicable.
 *
 * @param WP_REST_Request $request The request object.
 *
 * @return WP_REST_Response|WP_Error The response object or WP_Error on failure.
 */
function cdc_rest_v3_get_datasets_list( $request ) {
	try {
		// Get pagination parameters.
		$terms_per_page = $request->get_param( 'terms_per_page' );
		$paged          = $request->get_param( 'paged' );

		// Get all variable dataset terms.
		$args = array(
			'taxonomy'   => 'variable-dataset',
			'hide_empty' => false,
		);

		// Only add 'number' and offset if not requesting all items.
		if ( $terms_per_page !== -1 ) {
			$args['number'] = $terms_per_page;
			$args['offset'] = ( $paged - 1 ) * $terms_per_page;
		}

		$terms = get_terms( $args );

		// Check if terms exist.
		if ( is_wp_error( $terms ) ) {
			return new WP_Error(
				'no_terms_found',
				esc_html__( 'No dataset terms found.', 'cdc' ),
				array( 'status' => 404 )
			);
		}

		$datasets = array();

		foreach ( $terms as $term ) {
			$term_id = absint( $term->term_id );

			// Get ACF fields
			$title_fr            = get_field( 'title_fr', 'term_' . $term_id );
			$card_description    = get_field( 'card_description', 'term_' . $term_id );
			$card_description_fr = get_field( 'card_description_fr', 'term_' . $term_id );
			$card_link           = get_field( 'card_link', 'term_' . $term_id );
			$card_link_fr        = get_field( 'card_link_fr', 'term_' . $term_id );

			// Build dataset array.
			$dataset = array(
				'term_id' => $term_id,
			);

			// Add titles.
			$dataset['title'] = cdc_rest_v3_build_multilingual_field(
				$term->name,
				$title_fr
			);

			// Build card object.
			$card = array();

			// Add card descriptions if available.
			$card_descriptions = cdc_rest_v3_build_multilingual_field(
				$card_description,
				$card_description_fr
			);

			if ( ! empty( $card_descriptions ) ) {
				$card['description'] = $card_descriptions;
			}

			// Add card links if available.
			$card_links = cdc_rest_v3_build_multilingual_field(
				$card_link,
				$card_link_fr
			);

			if ( ! empty( $card_links ) ) {
				$card['link'] = $card_links;
			}

			// Add card object if it has content.
			if ( ! empty( $card ) ) {
				$dataset['card'] = $card;
			}

			$datasets[] = $dataset;
		}

		// Prepare the response.
		$response = array(
			'datasets' => $datasets,
		);

		// Add pagination headers only if not requesting all items.
		if ( $terms_per_page !== -1 ) {
			$total_terms = wp_count_terms( array( 'taxonomy' => 'variable-dataset' ) );
			if ( is_wp_error( $total_terms ) ) {
				$total_terms = 0;
			}

			$total_pages = ceil( $total_terms / $terms_per_page );

			// Set headers for pagination.
			$response_headers = array(
				'X-WP-Total'      => $total_terms,
				'X-WP-TotalPages' => $total_pages,
			);

			// Add headers to response.
			$response_object = new WP_REST_Response( $response, 200 );

			foreach ( $response_headers as $key => $value ) {
				$response_object->header( $key, $value );
			}
		} else {
			// Simple response without pagination headers when getting all items.
			$response_object = new WP_REST_Response( $response, 200 );
		}

		return $response_object;
	} catch ( Exception $e ) {
		return new WP_Error(
			'server_error',
			esc_html__( 'An unexpected error occurred.', 'cdc' ),
			array( 'status' => 500 )
		);
	}
}

/**
 * Get the arguments for the datasets list REST API endpoint.
 *
 * This function returns an array of arguments for the datasets list
 * endpoint, including pagination parameters. Each argument includes
 * a description, type, default value, and a sanitize callback.
 *
 * @return array The arguments for the datasets list endpoint.
 */
function cdc_rest_v3_get_datasets_args() {
	return array(
		'terms_per_page' => array(
			'description'       => 'Number of items per page. Use -1 for all items.',
			'type'              => 'integer',
			'default'           => -1,
			'minimum'           => -1,
			'maximum'           => 100,
		),
		'paged'           => array(
			'description'       => 'Current page number',
			'type'              => 'integer',
			'default'           => 1,
			'minimum'           => 1,
			'sanitize_callback' => 'absint',
		),
	);
}
