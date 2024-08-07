<?php
/**
 * The WordPress configuration.
 *
 * The default wp-config.php file was modified to allow setting the WordPress
 * constants using environment variables. This provides 2 benefits:
 *   1) Prevents storing sensitive information permanently in the Docker image
 *   2) Allows to reuse the same Docker image in different environments (with a
 *      different database, for example)
 *
 * To set a WordPress constant, define an environment variable with the name of
 * the WordPress constant, but prefixed with "WP_". For example, to set the
 * "DB_NAME" constant, define a "WP_DB_NAME" variable. To set the "WP_DEBUG"
 * constant, define a "WP_WP_DEBUG" variable.
 *
 * For boolean values, make sure to use exactly the words "true" or "false" to
 * ensure a correct conversion to booleans.
 *
 * At least the following WordPress constants need to be set (prefix your
 * environment variable with "WP_"):
 * - DB_NAME
 * - DB_USER
 * - DB_PASSWORD
 * - DB_HOST
 * - DB_CHARSET
 * - DB_COLLATE
 * - AUTH_KEY
 * - SECURE_AUTH_KEY
 * - LOGGED_IN_KEY
 * - NONCE_KEY
 * - AUTH_SALT
 * - SECURE_AUTH_SALT
 * - LOGGED_IN_SALT
 * - NONCE_SALT
 *
 * Some WordPress constants that are frequently set for different environments
 * (if not set, WordPress will use default values, so no need to set them if the
 * default value is good):
 * - WP_DEBUG
 * - WP_DEBUG_LOG
 * - WP_DEBUG_DISPLAY
 * - WP_MEMORY_LIMIT
 *
 * See this page for details about the constants:
 * https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * Some WordPress constants which are expected to apply to all environment are
 * explicitly set in this file. They cannot be redefined with environment
 * variables.
 */

/**
 * Define WordPress constants from environment variables starting with "WP_".
 *
 * The name of the constant to set is the name of the environment variable
 * without the (first) "WP_" prefix. For example, the environment variable
 * "WP_WP_DEBUG" will be used to set the "WP_DEBUG" constant.
 *
 * The value of the constant is the value of the environment variable. Basic
 * parsing of the value allow to set non-string values. See `parse_env()`.
 */
function define_constants_from_env() {
	foreach ( getenv() as $env_name => $env_value ) {
		if ( str_starts_with( $env_name, 'WP_' ) && strlen( $env_name ) > 3 ) {
			$constant_name  = substr( $env_name, 3 );
			$constant_value = parse_env_value( $env_value );
			define( $constant_name, $constant_value );
		}
	}
}

/**
 * Perform basic parsing of an environment variable's value to return it as the
 * correct type.
 *
 * The parsing logic is:
 * - If the value is "true" or "false", return the appropriate boolean.
 * - Else return the value as a string.
 *
 * @param string $value
 * @return string|bool
 */
function parse_env_value( $value ) {
	if ( 'true' === $value || 'false' === $value ) {
		return 'true' === $value;
	}
	return $value;
}

define_constants_from_env();

// The current configuration file uses $_SERVER variables. When running wp-cli
// from the command line, the $_SERVER variables are not set, which can cause
// errors. The following "mocks" those variables when using wp-cli.
if ( defined( 'WP_CLI' ) && WP_CLI ) {
	if ( ! isset( $_SERVER['HTTP_HOST'] ) ) {
		$_SERVER['HTTP_HOST'] = 'wp-cli.dummy';
	}
}

// WordPress core and plugin updates are to be done exclusively by rebuilding a
// Docker image, so disable auto-updating.
define( 'WP_AUTO_UPDATE_CORE', false );
define( 'AUTOMATIC_UPDATER_DISABLED', true );
define( 'DISALLOW_FILE_MODS', true );

define( 'WP_CONTENT_DIR', __DIR__ . '/assets' );

$is_https = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on';
$protocol = $is_https ? 'https://' : 'http://';

define( 'WP_CONTENT_URL', $protocol . $_SERVER['HTTP_HOST'] . '/assets' );

// Other configurations
define( 'WP_POST_REVISIONS', 10 );

$table_prefix = 'wp_';

require_once( __DIR__  . '/wp-settings.php' );
