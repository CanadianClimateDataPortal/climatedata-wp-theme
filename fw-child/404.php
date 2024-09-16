<?php
/**
 * Page template for the 404 error page.
 *
 * The template retrieves and renders the page specified in the "Custom 404
 * error page" setting (found in the "Settings > Reading" page).
 *
 * If no page is specified or if it doesn't have any content, the default
 * page is rendered.
 */

$content_found = false;
$page_404_id = get_option( 'cdc_page_404' );

if ( $page_404_id ) {
	$builder = get_post_meta( $page_404_id, 'builder', true );

	if ( $builder ) {
		$builder = json_decode( $builder, true );
		$content_found = true;

		get_header();
		fw_output_loop( $builder, 1, true );
		get_footer();
	}
}

if ( ! $content_found ) {
	get_template_part( "index" );
}
