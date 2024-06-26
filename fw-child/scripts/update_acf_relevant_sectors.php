<?php
/**
 * Template Name: Update ACF Relevant Sectors
 */

// Bail early if the user isn't logged in and isn't an administrator.
if ( ! is_user_logged_in() || ! current_user_can( 'administrator' ) ) {
	wp_die( 'You do not have sufficient permissions to access this page.' );
}

// Get all posts of the custom post type 'variable'.
$args = array(
	'post_type'      => 'variable',
	'posts_per_page' => -1,
	'fields'         => 'ids',
);

$query = new WP_Query( $args );

$variables = $query->posts;

if ( ! empty( $variables ) ) {
	foreach ( $variables as $post_id ) {
		// Get the sector terms for the current post.
		$sector_terms = wp_get_post_terms( $post_id, 'sector' );

		if ( ! is_wp_error( $sector_terms ) && ! empty( $sector_terms ) ) {
			// Prepare the relevant_sectors repeater field data.
			$relevant_sectors = array();

			foreach ( $sector_terms as $term ) {
				$relevant_sectors[] = array(
					'sector_term'           => $term,
					'sector_description'    => '',
					'sector_description_fr' => '',
				);
			}

			// Update the ACF repeater field with the sector terms data.
			update_field( 'relevant_sectors', $relevant_sectors, $post_id );

			echo "Post Updated: $post_id<br>";
		}
	}
}

echo 'ACF Relevant Sectors updated successfully.';
