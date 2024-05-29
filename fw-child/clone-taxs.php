<?php
/**
 * Template Name: Clone Taxonomy
 *
 * Script to clone a taxonomy to a new one for a given CPT.
 *
 * This script utilizes $_GET parameters:
 *  - old-tax: Slug of the old taxonomy
 *  - new-tax: Slug of the new taxonomy
 *  - cpt: Post type associated with the taxonomies
 */

if ( isset( $_GET['old-tax'], $_GET['new-tax'], $_GET['cpt'] ) ) {
	$cpt          = sanitize_text_field( $_GET['cpt'] );
	$old_taxonomy = sanitize_text_field( $_GET['old-tax'] );
	$new_taxonomy = sanitize_text_field( $_GET['new-tax'] );

	// Check if new taxonomy already exists.
	if ( ! taxonomy_exists( $new_taxonomy ) ) {
		echo "The new taxonomy, '$new_taxonomy', doesn't exist!";

		return;
	}

	// Get all terms from the old taxonomy.
	$old_terms = get_terms( $old_taxonomy, array( 'hide_empty' => false ) );

	if ( $old_terms ) {
		foreach ( $old_terms as $old_term ) {
			// Check if term exists in new taxonomy by slug.
			$existing_term = get_term_by( 'slug', $old_term->slug, $new_taxonomy );

			if ( $existing_term ) {
				$new_term_id = $existing_term->term_id; // Use existing term ID.
			} else {
				$new_term = array(
					'slug' => $old_term->slug,
					'name' => $old_term->name,
				);

				// Create the term in the new taxonomy.
				$new_term_id = wp_insert_term( $new_term['name'], $new_taxonomy, array( 'slug' => $new_term['slug'] ) );
			}

			if ( ! is_wp_error( $new_term_id ) ) {
				// Get post IDs associated with the old term.
				$posts = get_posts( array(
					'post_type'      => $cpt,
					'fields'         => 'ids',
					'tax_query'      => array(
						array(
							'taxonomy' => $old_taxonomy,
							'field'    => 'slug',
							'terms'    => $old_term->slug,
						),
					),
					'posts_per_page' => - 1,
				) );

				// Assign the new term to the same posts.
				if ( $posts ) {
					foreach ( $posts as $post_id ) {
						wp_set_post_terms( $post_id, $new_term_id, $new_taxonomy, true );
					}
				}
			}
		}
	}

	echo 'Taxonomy cloning completed.';
} else {
	echo 'Please provide all required parameters: old-tax, new-tax, and cpt.';
}
