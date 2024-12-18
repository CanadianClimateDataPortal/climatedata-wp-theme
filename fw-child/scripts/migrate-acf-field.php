<?php
/**
 * Template Name: ACF Field Migration
 *
 * Script to migrate data from a post meta into an ACF field (single value).
 *
 * This script utilizes the below $_GET parameters:
 *  - post-meta: The name of the old post meta field.
 *  - acf-field-key: The key of the new ACF field.
 *  - post-type: The post type to filter by.
 *
 * Usage:
 *  - https://dev-en.climatedata.ca/migrate/?post-meta=var_name&acf-field-key=field_XXXX&post-type=variable
 */

// Bail early if the user isn't logged in and isn't an administrator.
if ( ! is_user_logged_in() || ! current_user_can( 'administrator' ) ) {
	die( 'You do not have sufficient permissions to access this page.' );
}

// Check for required parameters.
if ( ! isset( $_GET['post-meta'] ) || ! isset( $_GET['acf-field-key'] ) || ! isset( $_GET['post-type'] ) ) {
	// Output a simple usage guide.
	echo <<<HTML
	<h1>ACF Field Migration Tool</h1>
	<p><strong>Required Parameters:</strong></p>
	<ul>
	  <li><code>?post-meta=</code> (The name of the old post meta field)</li>
	  <li><code>?acf-field-key=</code> (The key of the new ACF field)</li>
	  <li><code>?post-type=</code> (The post type to filter by)</li>
	</ul>
	<p>Example:
	  <code>?post-meta=var_name&acf-field-key=field_XXXX&post-type=variable</code>
	</p>
	HTML;

	die();
}

// Sanitize parameters.
$post_meta     = sanitize_text_field( $_GET['post-meta'] );
$acf_field_key = sanitize_text_field( $_GET['acf-field-key'] );
$post_type     = sanitize_text_field( $_GET['post-type'] );

// Check if the ACF field exists.
$acf_field_key_obj = get_field_object( $acf_field_key, $post_type );

if ( empty( $acf_field_key_obj ) ) {
	die( "The new ACF field with key '{$acf_field_key}' does not exist." );
}

// Get $post_type posts.
$query_args = [
	'post_type'      => $post_type,
	'posts_per_page' => - 1,
	'post_status'    => 'any',
];

$query = new WP_Query( $query_args );
$posts = $query->posts;

if ( empty( $posts ) ) {
	die( "No posts found for the specified post type '{$post_type}'." );
}

// Migrate the data.
$output = array();

foreach ( $posts as $post ) {
	$post_meta_value = trim( get_post_meta( $post->ID, $post_meta, true ) );

	if ( 'variable' == $post_type && 'var_name' === $post_meta && empty( $post_meta_value ) ) {
		$post_meta_value = trim( get_post_meta( $post->ID, 'var_names_0_variable', true ) );

		// Note: if $post_meta_value is still empty, we check the finch_var post_meta.
	}

	update_field( $acf_field_key, $post_meta_value, $post->ID );

	// Add output record.
	$output[ $post->ID ] = $post_meta_value;
}

/**
 * Output the migration summary.
 */

echo "<div class='migration-status'><p><strong>Migrating '{$post_meta}' -> '{$acf_field_key}'</strong></p></div>";

$table_rows = array_map( function ( $post_id, $post_meta_value ) {
	return str_pad( (string) $post_id, 10 ) . " | " . $post_meta_value;
}, array_keys( $output ), $output );

$table = implode( "\n", array_merge(
	[ "Post ID    | Old Value", str_repeat( '-', 40 ) ],
	$table_rows
) );

echo ( PHP_SAPI === 'cli' ) ? $table : '<pre>' . htmlspecialchars( $table ) . '</pre>';
