<?php
/**
 * Template Name: Init LZ meta
 *
 * Initialize the Learning Zone ACF meta on the "resource" CPT.
 */

// Bail early if the user isn't logged in and isn't an administrator.
if ( ! is_user_logged_in() || ! current_user_can( 'administrator' ) ) {
	wp_die( 'You do not have sufficient permissions to access this page.' );
}

// Get all posts of the custom post type 'variable'.
$args = array(
	'post_type'      => 'resource',
	'posts_per_page' => -1,
	'fields'         => 'ids',
	'post_parent'    => 0, // Only parent posts.
);

$query = new WP_Query( $args );

$resources = $query->posts;

if ( ! empty( $resources ) ) {
	foreach ( $resources as $post_id ) {
		// Enable post display in Learning Zone.
		update_field( 'display_in_learning_zone', '1', $post_id );

		echo "Post Updated: $post_id<br>";
	}
}

echo 'ACF "Learning Zone" meta updated successfully.';
