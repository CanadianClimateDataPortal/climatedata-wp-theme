<?php
/**
 * Various shortcodes for the theme.
 */

/**
 * Returns the creation or last update date of the current post.
 *
 * Example usage:
 * [post-date type="created"] (also works with `type="creation"`)
 * [post-date type="updated"] (also works with `type="update"`)
 */
function cdc_post_date_shortcode( $atts ) {
	$a = shortcode_atts( array(
		'type' => 'creation',
	), $atts );

	if ( in_array( $a['type'], [ 'update', 'updated' ] ) ) {
		$timestamp = get_the_modified_time( 'U' );
	} else {
		$timestamp = get_the_time( 'U' );
	}

	return date_i18n( __( 'F j, Y', 'cdc' ), $timestamp );
}
add_shortcode( 'post-date', 'cdc_post_date_shortcode' );
