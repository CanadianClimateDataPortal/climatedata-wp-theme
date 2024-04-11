<?php

/**
 * The WordPress configuration.
 * 
 * The default wp-config.php file was modified to allow setting the WordPress constants using environment variables.
 * This provides 2 benefits:
 *   1) Prevents storing sensitive information permanently in the Docker image
 *   2) Allows to reuse the same Docker image in different environments (with a different database, for example)
 * 
 * To set a WordPress constant using an environment variable, define an environment variable with the name of the
 * WordPress constant, but prefixed with "WP_". For example, to set the "DB_NAME" constant, define a "WP_DB_NAME"
 * variable. To set the "WP_DEBUG" constant, define a "WP_WP_DEBUG" variable.
 * 
 * To have a working WordPress, you must set at least the following constants (prefix your environment
 * variable with "WP_"):
 *  - DB_NAME
 *  - DB_USER
 *  - DB_PASSWORD
 *  - DB_HOST
 *  - DB_CHARSET
 *  - DB_COLLATE
 *  - AUTH_KEY
 *  - SECURE_AUTH_KEY
 *  - LOGGED_IN_KEY
 *  - NONCE_KEY
 *  - AUTH_SALT
 *  - SECURE_AUTH_SALT
 *  - LOGGED_IN_SALT
 *  - NONCE_SALT
 * 
 * Some WordPress constants that are frequently set for different environments (if not set, WordPress will use default
 * values, so no need to set them if the default value is good):
 *  - WP_DEBUG
 *  - WP_DEBUG_LOG
 *  - WP_DEBUG_DISPLAY
 *  - WP_MEMORY_LIMIT
 * 
 * See this page for details about the constants:
 * https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 * 
 * Some WordPress constants which are expected to apply to all environment are explicitly set in this file, but they
 * can be overwritten with environment variables.
 */

function parse_env($value) {
	if ($value === 'true' || $value === 'false') {
		return $value === 'true';
	}
	return $value;
}

function define_configurations_from_env() {
	$required_config = [
		'DB_NAME',
		'DB_USER',
		'DB_PASSWORD',
		'DB_HOST',
		'AUTH_KEY',
		'SECURE_AUTH_KEY',
		'LOGGED_IN_KEY',
		'NONCE_KEY',
		'AUTH_SALT',
		'SECURE_AUTH_SALT',
		'LOGGED_IN_SALT',
		'NONCE_SALT',
	];
	
	$unset_variables = [];
	
	foreach ($required_config as $config) {
		$env_name = 'WP_' . $config;
		$env_value = getenv($env_name);
		if ($env_value === false) {
			$unset_variables[] = $env_name;
		}
		
		define($config, parse_env($env_value));
	}
	
	if ($unset_variables) {
		throw new Exception("Some configurations must be set in environment variables: " . implode(', ', $unset_variables));
	}
	
	$over_writable_config = [
		'DB_CHARSET' => 'utf-8',
		'DB_COLLATE' => '',
		'WP_DEBUG' => null,
		'WP_DEBUG_LOG' => null,
		'WP_DEBUG_DISPLAY' => null,
		'WP_MEMORY_LIMIT' => null,
		'FORCE_SSL_ADMIN' => null,
		'FORCE_SSL_LOGIN' => null,
	];
	
	foreach ($over_writable_config as $config => $default_value) {
		$env_name = 'WP_' . $config;
		$env_value = getenv($env_name);
		
		if ($env_value !== false || !is_null($default_value)) {
			define($config, parse_env($env_value !== false ? $env_value : $default_value));
		}
	}
}

define_configurations_from_env();

define('WP_AUTO_UPDATE_CORE', false);
define('AUTOMATIC_UPDATER_DISABLED', true);
define('DISALLOW_FILE_MODS', true);

/*
 WP_AUTO_UPDATE_CORE false
'AUTOMATIC_UPDATER_DISABLED', true
WP_HOME
WP_ENVIRONMENT_TYPE à la place de WP_DEBUG
DISALLOW_FILE_MODS true
FORCE_SSL_ADMIN
FORCE_SSL_LOGIN
 */

define('WP_CACHE', false);
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

//define( 'WP_MEMORY_LIMIT', '128M' );

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
//define('DB_NAME', 'climatedata');

/** MySQL database username */
//define('DB_USER', 'climatedata');

/** MySQL database password */
//define('DB_PASSWORD', 'climatedata');

/** MySQL hostname */
//define('DB_HOST', 'db');

/** Database Charset to use in creating database tables. */
//define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
//define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
//define('AUTH_KEY',         ']jkQVSgz &&!>1<bK9JpD<Y_3 Xb#t|4=(g|Km+._e{YC5Bb>zrJl8I[r)$$Qq%{');
//define('SECURE_AUTH_KEY',  '/{LmO@Hj|=6|y>W|9%uEPIvd%@F,?@tOofJo6C:YnOdfQk@t-K!4n,3Kolvo fDy');
//define('LOGGED_IN_KEY',    'K!9E9_~C;6Fqh8/i>^dWK7~F=mk$FsWOyz^y^A-0eU_a&d-ysykH9/1:/ils,F1d');
//define('NONCE_KEY',        'azzh.48v*8iRO2l`*-=gUT_kYOD<Ig9[qUaM>phg6ip8-avN<`#TBYf?yDPL_5UO');
//define('AUTH_SALT',        '{i{+<`BhmtR`I2+9]lE2IU3!ypRkw9HjY;1}L!/OndY9nHR%N1*^W2?!?+cPG0+c');
//define('SECURE_AUTH_SALT', 'wI~I>Rooz-+-{lNI%[g3~|# 9R4 k6I?j7vF!${Q>I^Utr^Pr5tZuZg?Pc$+N5gF');
//define('LOGGED_IN_SALT',   'i=GdI3/$VdU,+Y T-f?kr-.0(Q4kxiqZ[Hu*tB3TY(@W5M3mee/XRI-~[cHNOZ&j');
//define('NONCE_SALT',       'Up<Q /#k4>;p)GYi)+--Pls<>-7NywT.JVmrW9C,bET(F@Tz*Bkp+kHtN)87<5 l');

//define('AUTH_KEY',         'iM+y^uD|d/-H`|52|vB,~-v~.;rAI?y|dP`>{[BUH$zHo iKiLhg;b:Q$q:*B(w ');
//define('SECURE_AUTH_KEY',  '%_MDN1*-6gUQ<1^)J6AMb2k<u#3>7NbnDaxyy?/G<2O{+#I-<#GS&}L2xHlg9|Yk');
//define('LOGGED_IN_KEY',    'GezD8^y(bIs|%8dCpC;,dFPm0|xOJ4;s:4,|/1p/8Ltg3mR.K?GSUd|<?!FWaMwe');
//define('NONCE_KEY',        'q$T)mnMR<7;avTO3/y92|FvggD-&e:O,(oy@{PNM%+%&8`)^&61=KfAvqZQm8EQ/');
//define('AUTH_SALT',        'm5(d=[0+b-}tMTUa}keX/AdOk|k(><}Lb@UuVM-!*^e?nTm,R3At{J>;_RQ-7[T:');
//define('SECURE_AUTH_SALT', 'V&c+4aPkx-;.R:e5LS[1^/Ge=(T>um`[^_-xK75>~G^VOzQ]%+W,1Fhl-V,27[kh');
//define('LOGGED_IN_SALT',   'FA{-z,I-8AdXjTt!pT}7MnbULQs]CF)%b_1yaW}nBerN8$7>$v|p81sX -(kb:$n');
//define('NONCE_SALT',       'i$?/WhvBuwIBvUrm{5[Pl{Gk`-0]-Cc@iB$q!NJoW}qBpsQVuj:!~E 8ve5J-]%O');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
//define('WP_DEBUG', true);
//define('WP_DEBUG_LOG', true);

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

$protocol = getenv("APP_NO_HTTPS") === "true" ? "http://" : "https://";

define('WP_CONTENT_FOLDERNAME', 'assets');
define('WP_CONTENT_DIR', ABSPATH . WP_CONTENT_FOLDERNAME);  # ABSPATH/assets
define('WP_SITEURL', $protocol . $_SERVER['HTTP_HOST'] . '/site/');
define('WP_CONTENT_URL', WP_SITEURL . WP_CONTENT_FOLDERNAME); # WP_SITEURL/assets
define('COOKIE_DOMAIN', $_SERVER['HTTP_HOST']);
define('WP_POST_REVISIONS', 10);

/* That's all, stop editing! Happy blogging. */

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');

