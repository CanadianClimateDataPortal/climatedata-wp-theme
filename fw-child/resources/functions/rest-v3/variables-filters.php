<?php
/**
 * Variables filters endpoint.
 *
 * This file defines the REST API endpoint for retrieving variables
 * filters (taxonomies: 'var-type' and 'sector'). It includes functions
 * for data formatting and response handling.
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

/**
 * Register custom REST API endpoints for retrieving
 * variables filters options.
 */
register_rest_route(
	'cdc/v3',
	'variables-filters',
	array(
		'methods'             => WP_REST_Server::READABLE,
		'callback'            => 'cdc_rest_v3_get_variables_filters',
		'permission_callback' => 'cdc_rest_v3_endpoint_permission',
	)
);

/**
 * Retrieve the variables filters options for the REST API endpoint.
 *
 * This function handles the retrieval of terms data from
 * 'var-type' and 'sector' taxonomies.
 *
 * @param WP_REST_Request $request The request object.
 *
 * @return WP_REST_Response|WP_Error The response object or WP_Error on failure.
 */
function cdc_rest_v3_get_variables_filters( $request ) {
	try {
		// Define the taxonomies to process.
		$taxonomies = array(
			'var_types' => 'var-type',
			'sectors'   => 'sector',
		);

		$response = array();

		foreach ( $taxonomies as $key => $taxonomy ) {
			// Get taxonomy terms.
			$args = array(
				'taxonomy'   => $taxonomy,
				'hide_empty' => true,
			);

			$terms = get_terms( $args );

			// Check if terms exist.
			if ( is_wp_error( $terms ) ) {
				$terms = array();
			}

			// Process terms.
			$response[ $key ] = array();

			foreach ( $terms as $term ) {
				$term_id = absint( $term->term_id );

				// Get the French title.
				$title_fr = get_field( 'title_fr', 'term_' . $term_id );

				// Build term array.
				$processed_term = array(
					'term_id' => $term_id,
					'title'   => cdc_rest_v3_build_multilingual_field(
						$term->name,
						$title_fr
					),
				);

				$response[ $key ][] = $processed_term;
			}
		}

		// Create and return the response.
		return new WP_REST_Response( $response, 200 );
	} catch ( Exception $e ) {
		return new WP_Error(
			'server_error',
			esc_html__( 'An unexpected error occurred.', 'cdc' ),
			array( 'status' => 500 )
		);
	}
}
