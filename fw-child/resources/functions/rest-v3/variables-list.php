<?php
/**
 * Variables list endpoint.
 *
 * This file defines the REST API endpoint for retrieving variables list
 * with associated metadata, taxonomies, and translations.
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

/**
 * Register custom REST API endpoints for retrieving
 * variables list.
 */
register_rest_route(
	'cdc/v3',
	'variables-list',
	array(
		'methods'             => WP_REST_Server::READABLE,
		'callback'            => 'cdc_rest_v3_get_variables_list',
		'permission_callback' => 'cdc_rest_v3_endpoint_permission',
		'args'                => cdc_rest_v3_get_variables_args(),
	)
);

/**
 * Retrieve the variables list for the REST API endpoint.
 *
 * @param WP_REST_Request $request The request object.
 *
 * @return WP_REST_Response|WP_Error The response object or WP_Error on failure.
 */
function cdc_rest_v3_get_variables_list( $request ) {
	try {
		// Get pagination parameters
		$posts_per_page           = $request->get_param( 'posts_per_page' );
		$paged                    = $request->get_param( 'paged' );
		$app                      = $request->get_param( 'app' );
		$variable_dataset_term_id = $request->get_param( 'variable_dataset_term_id' );

		// Query arguments for variables
		$args = array(
			'post_type'      => 'variable',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
		);

		// Only add 'posts_per_page' and 'paged' if not requesting all items
		if ( $posts_per_page !== -1 ) {
			$args['posts_per_page'] = $posts_per_page;
			$args['paged']          = $paged;
		}

		// Add meta query for app filter (Map or Download)
		if ( ! empty( $app ) ) {
			$meta_query = array(
				array(
					'key'     => 'variable_availability',
					'value'   => '"' . $app . '"',
					'compare' => 'LIKE',
				),
			);

			$args['meta_query'] = $meta_query;
		}

		// Add taxonomy query for variable-dataset term ID
		if ( ! empty( $variable_dataset_term_id ) ) {
			$tax_query = array(
				array(
					'taxonomy' => 'variable-dataset',
					'field'    => 'term_id',
					'terms'    => $variable_dataset_term_id,
				),
			);

			$args['tax_query'] = $tax_query;
		}

		// Query variable posts
		$query     = new WP_Query( $args );
		$variables = array();

		foreach ( $query->posts as $post ) {
			$post_id = $post->ID;

			// Get taxonomies data.
			$taxonomies = array(
				'sector'            => cdc_rest_v3_get_taxonomy_terms_data( $post_id, 'sector' ),
				'region'            => cdc_rest_v3_get_taxonomy_terms_data( $post_id, 'region' ),
				'var-type'          => cdc_rest_v3_get_taxonomy_terms_data( $post_id, 'var-type' ),
				'variable-datasets' => cdc_rest_v3_get_taxonomy_terms_data( $post_id, 'variable-dataset' ),
			);

			// Build variable array
			$variable = array(
				'id'      => get_field( 'var_id', $post_id ),
				'post_id' => $post_id,
				'meta'    => array(
					'updated-on' => get_the_modified_date( 'Y-m-d H:i:s', $post_id ),
					'content'    => array(
						'title' => cdc_rest_v3_build_multilingual_field(
							$post->post_title,
							get_field( 'title_fr', $post_id )
						),
					),
				),
			);

			// Get ACF fields
			$card_description    = get_field( 'card_description', $post_id );
			$card_description_fr = get_field( 'card_description_fr', $post_id );
			$card_link           = get_field( 'card_link', $post_id );
			$card_link_fr        = get_field( 'card_link_fr', $post_id );

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
				$variable['meta']['content']['card'] = $card;
			}

			// Add thumbnail if available
			$thumbnail_size = 'post-thumbnail';
			$thumbnail      = get_the_post_thumbnail_url( $post_id, $thumbnail_size );

			if ( ! empty( $thumbnail ) ) {
				$variable['meta']['content']['thumbnail'] = $thumbnail;
			}

			// Add taxonomies if not empty
			if ( ! empty( $taxonomies ) ) {
				$variable['meta']['taxonomy'] = $taxonomies;
			}

			$variables[] = $variable;
		}

		// Prepare response
		$response = array(
			'variables' => $variables,
		);

		// Add pagination headers if not requesting all items
		if ( $posts_per_page !== -1 ) {
			$response_headers = array(
				'X-WP-Total'      => $query->found_posts,
				'X-WP-TotalPages' => $query->max_num_pages,
			);

			$response_object = new WP_REST_Response( $response, 200 );

			foreach ( $response_headers as $key => $value ) {
				$response_object->header( $key, $value );
			}
		} else {
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
 * Get the arguments for the datasets list REST API endpoint.
 *
 * This function returns an array of arguments for the variables list
 * endpoint, including pagination parameters, app type and variable
 * dataset term ID. Each argument includes a description, type,
 * default value, and a sanitize callback.
 *
 * @return array The arguments for the datasets list endpoint.
 */
function cdc_rest_v3_get_variables_args() {
	return array(
		'posts_per_page'           => array(
			'description' => 'Number of items per page. Use -1 for all items.',
			'type'        => 'integer',
			'default'     => -1,
			'minimum'     => -1,
			'maximum'     => 100,
		),
		'paged'                    => array(
			'description'       => 'Current page number',
			'type'              => 'integer',
			'default'           => 1,
			'minimum'           => 1,
			'sanitize_callback' => 'absint',
		),
		'app'                      => array(
			'description' => 'Filter by app type (map or download)',
			'type'        => 'string',
			'enum'        => array( 'map', 'download' ),
			"required"    => true,
		),
		'variable_dataset_term_id' => array(
			'description'       => 'Filter by variable-dataset taxonomy term ID',
			'type'              => 'integer',
			'minimum'           => 1,
			'sanitize_callback' => 'absint',
			"required"          => true,
		),
	);
}
