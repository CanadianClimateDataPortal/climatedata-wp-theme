<?php
/**
 * Template Name: Migrate ACF Field
 *
 * Script to migrate data from one ACF field to another.
 *
 * This script utilizes $_GET parameters:
 *  - old-field: Name of the old ACF field
 *  - new-field: Name of the new ACF field
 *  - post-type: Post type to use for filtering (optional)
 *
 * Example:
 *  https://dev-en.climatedata.ca/migrate-acf-fields/?old-field=var_name&new-field=var_id&post-type=variable
 */

// Bail early if the user isn't logged in and isn't an administrator.
if ( ! is_user_logged_in() || ! current_user_can( 'administrator' ) ) {
  wp_die( 'You do not have sufficient permissions to access this page.' );
}

// check for required parameters
if ( ! isset( $_GET['old-field'], $_GET['new-field'] ) ) {
  // show usage instructions if required parameters are missing
  echo <<<HTML
    <h1>ACF Field Migration Tool</h1>
    <p><strong>Required Parameters:</strong></p>
    <ul>
      <li><code>?old-field=</code> (Name of the old ACF field)</li>
      <li><code>?new-field=</code> (Name of the new ACF field)</li>
    </ul>
    <p><i>Optional Parameters:</i></p>
      <li><code>?post-type=</code> (Optional, filter by post type)</li>
    </ul>
    <p>Example:
      <code>?old-field=var_name&new-field=var_id&post-type=post</code>
    </p>
  HTML;
  wp_die();
}

$old_field = sanitize_text_field( $_GET['old-field'] );
$new_field = sanitize_text_field( $_GET['new-field'] );

// optional post type parameter, to narrow down results
$post_type = isset( $_GET['post-type'] ) ? sanitize_text_field( $_GET['post-type'] ) : 'any';

// make sure the new field exists in ACF, otherwise there's no point in continuing
$new_field_data = acf_get_field( $new_field );
if ( ! $new_field_data ) {
  wp_die( "The new field '{$new_field}' does not exist in ACF." );
}

// fetch posts
$args = [
    'post_type'      => $post_type,
    'posts_per_page' => -1,
    'post_status'    => 'any',
];
$posts = get_posts( $args );

if ( empty( $posts ) ) {
  wp_die('No posts found for the specified post type.');
}

// just so we can output a nice summary at the end
$output = [];

// start the migration process
foreach ( $posts as $post ) {
  // get the old field value from post meta, instead of ACF -- because it may not exist in ACF anymore
  $old_value = get_post_meta( $post->ID, $old_field, true );

  // update the new field only if the old field has any data
  if ( ! empty( $old_value ) ) {
    update_field( $new_field, $old_value, $post->ID );

    // store the old value for the summary
    $output[$post->ID] = $old_value;
  }

  // finally delete the old field meta if it exists
  delete_post_meta( $post->ID, $old_field );
}

echo "<p><strong>Migrating '{$old_field}' -> '{$new_field}'</strong></p>";

$table_output = "Post ID   | Old Value\n";
$table_output .= str_repeat('-', 40) . "\n";
foreach ( $output as $post_id => $old_value ) {
  $table_output .= str_pad($post_id, 10) . " | " . $old_value . "\n";
}

// in case this is run from the CLI
if ( php_sapi_name() === 'cli' ) {
  echo $table_output;
}
else {
  echo '<pre>' . htmlspecialchars($table_output) . '</pre>';
}