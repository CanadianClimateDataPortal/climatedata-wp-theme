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

echo 'ACF "Learning Zone" meta updated successfully.<br>';

// Get all posts of the custom post type 'page'.
$args = array(
	'post_type'      => 'page',
	'posts_per_page' => -1,
	'fields'         => 'ids'
);

$query = new WP_Query( $args );

$pages = $query->posts;

if ( ! empty( $pages ) ) {
	foreach ( $pages as $post_id ) {
		// Update "page" CPT posts asset type.
		update_field( 'asset_type', 'article', $post_id );

		echo "Post Updated: $post_id<br>";
	}
}

echo '"Page" CPT posts asset type updated successfully.<br>';

// Get all posts of the custom post type 'beta-app'.
$args = array(
	'post_type'      => 'beta-app',
	'posts_per_page' => -1,
	'fields'         => 'ids'
);

$query = new WP_Query( $args );

$beta_apps = $query->posts;

if ( ! empty( $beta_apps ) ) {
	foreach ( $beta_apps as $post_id ) {
		// Update "beta-app" CPT posts asset type.
		update_field( 'asset_type', 'app', $post_id );

		echo "Post Updated: $post_id<br>";
	}
}

echo '"Beta app" CPT posts asset type updated successfully.<br>';
