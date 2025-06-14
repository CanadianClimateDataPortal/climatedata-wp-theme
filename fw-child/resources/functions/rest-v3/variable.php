<?php
/**
 * Variable endpoint.
 *
 * This file defines the REST API endpoint for retrieving a single variable
 * with associated metadata, taxonomies, descriptions, and related content.
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

/**
 * Register custom REST API endpoint for retrieving
 * a single variable post.
 */
register_rest_route(
	'cdc/v3',
	'variable',
	array(
		'methods'             => WP_REST_Server::READABLE,
		'callback'            => 'cdc_rest_v3_get_variable',
		'permission_callback' => 'cdc_rest_v3_endpoint_permission',
		'args'                => cdc_rest_v3_get_variable_args(),
	)
);

/**
 * Retrieve a single variable for the REST API endpoint.
 *
 * @param WP_REST_Request $request The request object.
 *
 * @return WP_REST_Response|WP_Error The response object or WP_Error on failure.
 */
function cdc_rest_v3_get_variable( $request ) {
	/**
	 * Force global variable configuration initialization since
	 * this function isn't called during AJAX requests.
	 */
	theme_global_vars();

	try {
		// Get variable post ID
		$post_id = $request->get_param( 'post_id' );

		$variable = array(
			'id'      => get_field( 'var_id', $post_id ),
			'post_id' => $post_id,
			'meta'    => array(
				'content'  => array(
					'title' => cdc_rest_v3_build_multilingual_field(
						get_the_title( $post_id ),
						get_field( 'title_fr', $post_id )
					),
				),
				'taxonomy' => array(
					'variable-dataset' => cdc_rest_v3_get_taxonomy_terms_data( $post_id, 'variable-dataset' ),
				),
			),
		);

		// Variable tagline (card descriptions)
		$tagline = cdc_rest_v3_build_multilingual_field(
			cdc_get_sanitized_field( 'card_description', $post_id ),
			cdc_get_sanitized_field( 'card_description_fr', $post_id )
		);

		if ( ! empty( $tagline ) ) {
			$variable['meta']['content']['tagline'] = $tagline;
		}

		// Variable full descriptions.
		$full_descriptions = cdc_rest_v3_build_multilingual_field(
			cdc_get_sanitized_field( 'var_description', $post_id ),
			cdc_get_sanitized_field( 'var_description_fr', $post_id )
		);

		if ( ! empty( $full_descriptions ) ) {
			$variable['meta']['content']['full_description'] = $full_descriptions;
		}

		// Variable technical descriptions.
		$tech_descriptions = cdc_rest_v3_build_multilingual_field(
			cdc_get_sanitized_field( 'var_tech_description', $post_id ),
			cdc_get_sanitized_field( 'var_tech_description_fr', $post_id )
		);

		if ( ! empty( $tech_descriptions ) ) {
			$variable['meta']['content']['tech_description'] = $tech_descriptions;
		}

		// Variable relevant sectors.
		$relevant_sectors = cdc_rest_v3_get_relevant_sectors( $post_id );

		if ( ! empty( $relevant_sectors ) ) {
			$variable['meta']['content']['relevant_sectors'] = $relevant_sectors;
		}

		// Variable relevant articles resources.
		$relevant_trainings = cdc_rest_v3_get_relevant_trainings( $post_id );

		if ( ! empty( $relevant_trainings ) ) {
			$variable['meta']['content']['relevant_trainings'] = $relevant_trainings;
		}

		// Featured images.
		$featured_images = cdc_rest_v3_get_featured_image( $post_id );

		if ( ! empty( $featured_images ) ) {
			$variable['meta']['content']['featured_image'] = $featured_images;
		}

		// Prepare response.
		$response = array(
			'variable' => $variable,
		);

		return new WP_REST_Response( $response, 200 );
	} catch ( Exception $e ) {
		return new WP_Error(
			'server_error',
			esc_html__( 'An unexpected error occurred.', 'cdc' ),
			array( 'status' => 500 )
		);
	}
}

/**
 * Get the arguments for the variable REST API endpoint.
 *
 * @return array The arguments for the variable endpoint.
 */
function cdc_rest_v3_get_variable_args() {
	return array(
		'post_id' => array(
			'description'       => 'Variable post ID',
			'type'              => 'integer',
			'required'          => true,
			'validate_callback' => 'cdc_validate_variable_post_id',
		),
	);
}

/**
 * Validate if the provided ID is a valid published variable post.
 *
 * @param int $param The variable post ID to validate.
 *
 * @return bool Whether the post ID is valid.
 */
function cdc_validate_variable_post_id( $param ) {
	$post = get_post( $param );

	return ! is_null( $post ) && $post->post_type === 'variable' && $post->post_status === 'publish';
}

/**
 * Get relevant sectors from ACF repeater field.
 *
 * @param int $post_id The variable post ID.
 *
 * @return array The formatted relevant sectors' data.
 */
function cdc_rest_v3_get_relevant_sectors( $post_id ) {
	$sectors          = array();
	$relevant_sectors = get_field( 'relevant_sectors', $post_id );

	if ( ! empty( $relevant_sectors ) ) {
		foreach ( $relevant_sectors as $sector ) {
			$term = $sector['sector_term'];

			$sectors[] = array(
				'term_id'     => $term->term_id,
				'name'        => cdc_rest_v3_build_multilingual_field(
					$term->name,
					get_field( 'title_fr', $term )
				),
				'description' => cdc_rest_v3_build_multilingual_field(
					$sector['sector_description'],
					$sector['sector_description_fr']
				),
			);
		}
	}

	return $sectors;
}

/**
 * Get relevant articles (a.k.a. "trainings") from ACF relationship field.
 *
 * @param int $post_id The variable post ID.
 *
 * @return array The formatted relevant articles' data.
 */
function cdc_rest_v3_get_relevant_trainings( $post_id ) {
	$trainings         = array();
	$training_post_ids = get_field( 'relevant_trainings', $post_id );

	if ( ! empty( $training_post_ids ) ) {
		foreach ( $training_post_ids as $training_post_id ) {
			// Training post links.
			$training_link_en = get_permalink( $training_post_id );
			$training_link_fr = translate_permalink( '', $training_post_id, 'fr' );

			$trainings[] = array(
				'post_id' => $training_post_id,
				'title'   => cdc_rest_v3_build_multilingual_field(
					get_the_title( $training_post_id ),
					get_field( 'title_fr', $training_post_id )
				),
				'link'    => cdc_rest_v3_build_multilingual_field(
					$training_link_en,
					$training_link_fr
				),
			);
		}
	}

	return $trainings;
}

/**
 * Get the featured image in different sizes.
 *
 * @param int $post_id The variable post ID.
 *
 * @return array|null The featured image URLs in different sizes or null if no image.
 */
function cdc_rest_v3_get_featured_image( $post_id ) {
	if ( ! has_post_thumbnail( $post_id ) ) {
		return null;
	}

	return array(
		'thumbnail' => get_the_post_thumbnail_url( $post_id, 'thumbnail' ),
		'medium'    => get_the_post_thumbnail_url( $post_id, 'medium' ),
		'large'     => get_the_post_thumbnail_url( $post_id, 'large' ),
		'full'      => get_the_post_thumbnail_url( $post_id, 'full' ),
	);
}

/**
 * Return a sanitized version of a text field.
 *
 * The sanitization process removes specific shortcodes and optionally passes it
 * through the formatting filter.
 *
 * @param string $selector The ACF field selector.
 * @param int|false $post_id The post ID to retrieve the field from, or false for current post.
 * @param bool $format_value Whether to format the value for display.
 * @param bool $escape_html Whether to escape HTML in the content.
 *
 * @return string The sanitized text field content.
 */
function cdc_get_sanitized_field(
	$selector,
	$post_id = false,
	$format_value = true,
	$escape_html = false,
) {
	$content = get_field( $selector, $post_id, false, $escape_html );

	if ( ! is_string( $content ) ) {
		return $content;
	}

	$shortcodes_to_ignore = [
		'expand',
	];

	foreach ( $shortcodes_to_ignore as $shortcode ) {
		$content = preg_replace( '/\[' . $shortcode . '.+?](.+?)\[\/' . $shortcode . ']/s', '$1', $content );
	}

	if ( $format_value ) {
		$content = apply_filters( 'the_content', $content, $post_id );
	}

	return $content;
}
