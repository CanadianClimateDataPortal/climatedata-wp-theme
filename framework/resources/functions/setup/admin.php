<?php

/**
 * Setup functions and hooks concerning the administration area.
 */

/**
 * Returning HTTP 403 error when accessing the admin or the login page.
 *
 * If the user is logged in, they will be logged out when trying to access the
 * admin.
 */
function fw_forbid_admin_access() {
	$error_message = __( 'WordPress admin has been disabled.', 'cdc' );

	if (
		is_login() ||
		( is_admin() && ! wp_doing_ajax() )
	) {
		if ( is_user_logged_in() ) {
			wp_logout();
		}
		status_header( 403 );
		print( esc_html( $error_message ) );
		exit;
	}
}

/**
 * Disable access to the WordPress admin area if APP_DISABLE_WP_ADMIN is "true".
 */
if ( getenv( 'APP_DISABLE_WP_ADMIN' ) === 'true' ) {
	add_action( 'init', 'fw_forbid_admin_access' );
}
