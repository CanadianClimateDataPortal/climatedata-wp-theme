<?php


//
// GLOBALS
//

function child_global_vars() {

	global $vars;
	global $classes;

	$query_string = $_GET;

	$vars['user_id'] = '';

	if ( is_user_logged_in() ) {

		$vars['user_id'] = get_current_user_id();

	}

	if ( is_page ( 'scenarios' ) || is_page ( 'risks' ) ) {

		$classes['body'][] = 'app-page';

	}

	// $classes['body'][] = 'lang-' . apply_filters ( 'wpml_current_language', NULL );

}

add_action ( 'wp', 'child_global_vars', 20 );

// process any deployment specific configuration

if ( stream_resolve_include_path ( 'local_config.php' ) ) {
	include_once locate_template ( 'local_config.php' );
} else {
	include_once locate_template ( 'default_config.php' );
}

//
// ENQUEUE
//


add_action ( 'wp_enqueue_scripts', function() {

	// deregister font-awesome from parent theme
	// to use /site/assets/font-awesome instead

	wp_dequeue_style ( 'font-awesome' );
	wp_deregister_style ( 'font-awesome' );

}, 20 );

function child_theme_enqueue() {

	$theme_dir = get_bloginfo ( 'template_directory' ) . '/';
	$vendor_dir = $theme_dir . 'resources/vendor/';
	$js_dir = $theme_dir . 'resources/js/';

	$child_theme_dir = get_stylesheet_directory_uri() . '/';
	$child_vendor_dir = $child_theme_dir . 'resources/vendor/';
	$child_npm_dir = $child_theme_dir . 'node_modules/';
	$child_js_dir = $child_theme_dir . 'resources/js/';

	//
	// STYLES
	//

	// dequeue global CSS

	wp_dequeue_style ( 'global-style' );

	// VENDOR

	// font awesome

	wp_register_style ( 'font-awesome', $child_npm_dir . '@fortawesome/fontawesome-free/css/all.min.css', null, null );
	wp_enqueue_style ( 'font-awesome' );

	// leaflet

	wp_enqueue_style ( 'leaflet', $child_npm_dir . 'leaflet/dist/leaflet.css', NULL, NULL, 'all' );

	wp_enqueue_style ( 'leaflet-geoman', $child_vendor_dir . 'leaflet-geoman/leaflet-geoman.css', NULL, NULL, 'all' );

	// select2

	wp_register_style ( 'select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css', null, null );

	wp_register_style ( 'gutenberg', $child_theme_dir . 'resources/css/gutenberg.css', null, null );
	wp_enqueue_style ( 'child-style', $child_theme_dir . 'style.css', NULL, NULL, 'all' );

	// Load WP native styles for resource and interactive posts
	if ( is_singular ( 'resource' ) || is_singular ( 'interactive' ) ) {
		wp_enqueue_style ( 'wp-block-library' );
		wp_enqueue_style ( 'gutenberg' );
		wp_enqueue_style ( 'global-styles' );
	}

	if (
		$GLOBALS['vars']['current_slug'] == 'map' ||
		$GLOBALS['vars']['current_slug'] == 'carte' ||
		$GLOBALS['vars']['current_slug'] == 'download' ||
		$GLOBALS['vars']['current_slug'] == 'telechargement'
	) {

		wp_enqueue_style ( 'leaflet' );
		wp_enqueue_style ( 'select2' );

	}

	//
	// SCRIPTS
	//

	// VENDOR

	// js-cookie

	wp_register_script ( 'js-cookie', 'https://cdn.jsdelivr.net/npm/js-cookie@3.0.5/dist/js.cookie.min.js', NULL, NULL, true );

	// page tour

	wp_register_script ( 'page-tour', $child_vendor_dir . 'pe-page-tour/page-tour.js', array ( 'jquery-ui-core', 'js-cookie' ), NULL, true );

	// tab drawer

	wp_register_script ( 'tab-drawer', $child_vendor_dir . 'pe-tab-drawer/tab-drawer.js', array ( 'jquery' ), NULL, true );

	// flex drawer

	wp_register_script ( 'flex-drawer', $child_vendor_dir . 'pe-flex-drawer/flex-drawer.js', array ( 'jquery' ), NULL, true );

	wp_register_script ( 'share-widget', $child_vendor_dir . 'pe-social-widget/share-widget.js', array ( 'jquery' ), NULL, true );

	// leaflet

	wp_register_script ( 'leaflet', $child_npm_dir . 'leaflet/dist/leaflet-src.js', null, null, true );

	wp_register_script ( 'leaflet-sync', $child_npm_dir . 'leaflet.sync/L.Map.Sync.js', array ( 'leaflet' ), null, true );

	wp_register_script ( 'leaflet-geoman', $child_vendor_dir . 'leaflet-geoman/leaflet-geoman.min.js', array ( 'leaflet' ), NULL, true );

	wp_register_script ( 'leaflet-vectorgrid', $child_npm_dir . 'leaflet.vectorgrid/dist/Leaflet.VectorGrid.bundled.min.js', array ( 'leaflet' ), null, true );

	wp_register_script ( 'leaflet-cluster', $child_vendor_dir . 'leaflet-markercluster/leaflet.markercluster.js', array ( 'leaflet' ), NULL, true );

	wp_register_script ( 'leaflet-cluster-subgroup', $child_vendor_dir . 'leaflet.featuregroup.subgroup.js', array ( 'leaflet-cluster' ), NULL, true );

	// highcharts

	wp_register_script ( 'highcharts-highstock', 'https://code.highcharts.com/stock/highstock.js', NULL, NULL, true );
	wp_register_script ( 'highcharts-more', 'https://code.highcharts.com/stock/highcharts-more.js', array ( 'highcharts-highstock' ), NULL, true );
	wp_register_script ( 'highcharts-exporting', 'https://code.highcharts.com/stock/modules/exporting.js', array ( 'highcharts-highstock' ), NULL, true );
	wp_register_script ( 'highcharts-export-data', 'https://code.highcharts.com/stock/modules/export-data.js', array ( 'highcharts-exporting' ), NULL, true );
	wp_register_script ( 'highcharts-offline-exporting', 'https://code.highcharts.com/stock/modules/offline-exporting.js', array ( 'highcharts-exporting' ), NULL, true );
	wp_register_script ( 'highcharts-accessibility', 'https://code.highcharts.com/modules/accessibility.js', array ( 'highcharts-highstock' ), NULL, true );

	// zebra pin

	wp_register_script ( 'zebra-pin', $child_npm_dir . 'zebra_pin/dist/zebra_pin.min.js', array ( 'jquery' ), null, true );

	// select2

	wp_register_script ( 'select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js', array ( 'jquery' ), null, true );

	// GSAP

	wp_register_script ( 'gsap', 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.5/gsap.min.js', null, '3.11.5', true );
	wp_register_script ( 'scrolltrigger', 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.5/ScrollTrigger.min.js', array ( 'gsap' ), '3.11.5', true );
	wp_register_script ( 'scroll', $child_js_dir . 'scroll.js', array ( 'jquery', 'scrolltrigger' ), '1.1', true );

	// utilities/constants

	wp_register_script ( 'utilities', $child_js_dir . 'utilities.js', array ( 'jquery', 'leaflet' ), NULL, true );

	wp_localize_script ( 'utilities', 'theme_data', array (
		'child_theme_dir' => get_stylesheet_directory_uri()
	) );

	wp_register_script ( 'data', $child_js_dir . 'data.js', array (  ), NULL, true );

	wp_register_script ( 'cdc', $child_js_dir . 'cdc.js', array (
		'utilities',
		'data',
		'lodash',
		'jquery',
		'leaflet',
		'leaflet-vectorgrid',
		'leaflet-sync',
		'leaflet-geoman',
		'leaflet-cluster',
		'leaflet-cluster-subgroup',
		'tab-drawer',
		'highcharts-highstock',
		'highcharts-more',
		'highcharts-exporting',
		'highcharts-export-data',
		'highcharts-offline-exporting',
		'highcharts-accessibility'
	), NULL, true );

	wp_localize_script ( 'cdc', 'theme_data', array (
		'child_theme_dir' => get_stylesheet_directory_uri()
	) );

	wp_register_script ( 'map-app', $child_js_dir . 'map.js', array ( 'cdc', 'data', 'jquery-ui-slider', 'select2', 'flex-drawer' ), NULL, true );

	wp_register_script ( 'download-app', $child_js_dir . 'download.js', array ( 'cdc', 'jquery-ui-slider', 'jquery-ui-datepicker', 'select2', 'flex-drawer' ), NULL, true );

	wp_register_script ( 'child-functions', $child_js_dir . 'child-functions.js', array ( 'tab-drawer', 'utilities', 'share-widget' ), NULL, true );

	// Scripts for the "custom shapefile upload" logic (in the "download" section).

	wp_register_script ( 'jszip', $child_npm_dir . 'jszip/dist/jszip.min.js', null, null, true );
	wp_register_script ( 'mapshaper_modules', $child_npm_dir . 'mapshaper/www/modules.js', null, null, true );
	wp_register_script ( 'mapshaper', $child_npm_dir . 'mapshaper/www/mapshaper.js', array ( 'mapshaper_modules' ), null, true );
	wp_register_script ( 'topojson', $child_npm_dir . 'topojson/dist/topojson.min.js', null, null, true );
	wp_register_script ( 'turf', $child_npm_dir . '@turf/turf/turf.min.js', null, null, true );

	wp_register_script ( 'shapefile-upload', $child_js_dir . 'shapefile-upload.js', array ( 'jquery', 'jszip', 'mapshaper', 'topojson', 'turf' ), null, true );

	// localize admin url

	$units = array (
		'celcius' => 'º C',
		'kelvin' => 'K',
		'mm' => 'mm',
		'cm' => 'cm',
		'm' => 'm',
		'days' => __ ( 'days', 'cdc' ),
		'doy' => __ ( 'day of the year', 'cdc' ),
		'degree-days' => __ ( 'degree days', 'cdc' ),
		'number of periods' => __ ( 'number of periods', 'cdc' ),
		'events' => __ ( 'events', 'cdc' )
	);

	wp_localize_script ( 'utilities', 'unit_strings', $units );

	// PAGE CONDITIONALS

	if ( is_front_page() ) {

		// wp_dequeue_script ( 'jquery' );
		wp_deregister_script ( 'jquery' );

		wp_enqueue_script ( 'jquery', 'https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=65dbbfa49f6b400b385a0b1d', null, null, true );

		wp_enqueue_script ( 'webflow', $child_vendor_dir . 'climatedata-scroll.webflow/webflow.js', array ( 'jquery' ), null, true );

		wp_enqueue_script ( 'gsap' );
		wp_enqueue_script ( 'scrolltrigger' );
		wp_enqueue_script ( 'scroll' );
		wp_enqueue_script ( 'swiper' );

	}

	switch ( $GLOBALS['vars']['current_slug'] ) {
		case 'map' :
		case 'carte' :
			wp_enqueue_script ( 'map-app' );
			wp_enqueue_script ( 'page-tour' );
			wp_enqueue_script ( 'shapefile-upload' );
			break;

		case 'download' :
		case 'telechargement' :
			wp_enqueue_script ( 'page-tour' );
			wp_enqueue_script ( 'download-app' );
			wp_enqueue_script ( 'shapefile-upload' );
			break;

		case 'learn' :
		case 'apprendre' :
			wp_enqueue_script ( 'zebra-pin' );
			// wp_enqueue_script ( 'tab-drawer' );
			break;

		case 'news' :
		case 'nouvelles' :
			wp_enqueue_script ( 'zebra-pin' );
			// wp_enqueue_script ( 'tab-drawer' );
			break;

		case 'apps' :
			wp_enqueue_script ( 'zebra-pin' );
			break;

	}

	if ( is_singular ( 'app' ) ) {
		wp_enqueue_script ( 'iframe-functions', $child_js_dir . 'iframe-functions.js', array ( 'jquery' ), null, true );
	}

	if ( is_page( 'variables' ) || is_single( 'variables' ) ) {
		wp_enqueue_script( 'zebra-pin' );
		wp_enqueue_script( 'flex-drawer' );
	}

	wp_enqueue_script ( 'child-functions' );


}

add_action ( 'wp_enqueue_scripts', 'child_theme_enqueue', 50 );

//
// INCLUDES
//

$includes = array (
	'resources/functions/builder/field-groups.php',
	'resources/functions/taxonomies.php',
	'resources/functions/post-types.php',
	'resources/functions/shortcodes.php',
	'resources/functions/ajax.php',
	'resources/functions/rest.php',
);

foreach ( $includes as $include ) {

	if ( locate_template ( $include ) != '' ) {
		include_once ( locate_template ( $include ) );
	}

}

//
// THEME SETUP
//

add_action ( 'after_setup_theme', 'fw_child_theme_support', 0 );

function fw_child_theme_support() {

	// DOCUMENT TITLE

	add_theme_support ( 'title-tag' );

	// PAGE EXCERPTS

	add_post_type_support ( 'page', 'excerpt' );

	// UNCROPPED IMAGE SIZE FOR CARD BLOCKS

	add_image_size ( 'card-img-no-crop', '600', '380', false );

	// MENUS

	// LANGUAGES

	load_theme_textdomain ( 'cdc', get_stylesheet_directory() );

}

add_action ( 'after_setup_theme', 'fw_load_child_theme_lang_files', 0 );

function fw_load_child_theme_lang_files() {

	load_theme_textdomain ( 'cdc', get_stylesheet_directory() . '/languages/cdc' );
	load_theme_textdomain ( 'cdc-taxonomies', get_stylesheet_directory() . '/languages/cdc-taxonomies' );

	$locale = get_locale();
	$locale_file = get_stylesheet_directory() . '/languages/' . $locale . '.php';

	if ( is_readable ( $locale_file ) ) {
		require_once ( $locale_file );
	}

}


//
// TEMPLATE HOOKS
//

function add_favicon() {

?>

<link rel="apple-touch-icon" sizes="180x180" href="<?php echo $GLOBALS['vars']['child_theme_dir']; ?>resources/vendor/favicon_io/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="<?php echo $GLOBALS['vars']['child_theme_dir']; ?>resources/vendor/favicon_io/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="<?php echo $GLOBALS['vars']['child_theme_dir']; ?>resources/vendor/favicon_io/favicon-16x16.png">
<link rel="manifest" href="<?php echo $GLOBALS['vars']['child_theme_dir']; ?>resources/vendor/favicon_io/site.webmanifest">
<link rel="mask-icon" href="<?php echo $GLOBALS['vars']['child_theme_dir']; ?>resources/vendor/favicon_io/safari-pinned-tab.svg" color="#0018ff">
<meta name="msapplication-TileColor" content="#ffffff">
<meta name="theme-color" content="#ffffff">

<?php

}

add_action( 'wp_head', 'add_favicon' );

add_action ( 'wp_head', function() {

	if ( is_front_page() ) {

?>

<script type="text/javascript">
	! function(o, c) {
		var n = c.documentElement,
			t = " w-mod-";

		n.setAttribute('data-wf-page', '65dbbfa49f6b400b385a0b23')
		n.setAttribute('data-wf-site', '65dbbfa49f6b400b385a0b1d')

		n.className += t + "js", ("ontouchstart" in o || o.DocumentTouch && c instanceof DocumentTouch) && (n.className += t + "touch")
	}(window, document);
</script>

<?php

	}

} );

add_action( 'wp_footer', function() {

	if ( is_singular ( 'post' ) ) {

?>

<script async defer crossorigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js"></script>

<?php

	}

	// spinner

?>

<div id="spinner" class="spinner"></div>

<?php

}, 10, 1 );

//
// GLOBAL JS VAR
// disable 3D transform in leaflet
//

add_action ( 'fw_before_footer', function() {

?>

<script type="text/javascript">
	var base_href = '<?php echo $GLOBALS['vars']['home_url']; ?>';
	var L_DISABLE_3D = true;
	const DATA_URL = '<?php echo $GLOBALS['vars']['data_url']; ?>';
	const URL_ENCODER_SALT = '<?php echo $GLOBALS['vars']['url_encoder_salt']; ?>';
</script>

<?php

} );

/**
 * Insert the CookieYes script tag in the head.
 *
 * CookieYes does provide a WordPress plugin that automatically includes the required script tag, but it supports only
 * one ID. Since we use a different domain for each language, and since CookieYes requires a different ID for different
 * domains, the plugin is replaced by this hook that can insert a different ID for each language (i.e. domain).
 */
add_action('wp_head',

	/**
	 * Output the CookieYes language specific script tag.
	 *
	 * The inserted script tag requires an ID in the `cookieyes_id_<lang>` entry in the global 'vars' array. If the
	 * entry is not defined or empty, no script tag is inserted.
	 */
	function () {
		$lang = $GLOBALS['fw']['current_lang_code'];
		$id_key = 'cookieyes_id_' . $lang;
		$cookieyes_id = $GLOBALS['vars'][$id_key] ?? '';

		if ( !empty( $cookieyes_id ) ) {
			echo '<script id="cookieyes" type="text/javascript" src="https://cdn-cookieyes.com/client_data/' . $cookieyes_id . '/script.js"></script>';
		}
	},
	1
);

//
// VARIABLES OFFCANVAS
//

add_action ( 'fw_before_footer', function() {

	include ( locate_template ( 'template/menu-overlay.php' ) );

} );

// PAGE TOUR

add_action ( 'fw_before_footer', function() {

	/**
	 * Generate the page tour's steps.
	 *
	 * The steps are defined in ACF fields in the page.
	 */
	if ( have_rows ( 'tour', $GLOBALS['fw']['current_query']['ID'] ) ) {

		$tour_raw_data = get_field ( 'tour', $GLOBALS['fw']['current_query']['ID'] );
		$tour_data = array_map(function($raw_data) {
			$lang = $GLOBALS['fw']['current_lang_code'];
			return [
				'text' => $raw_data['text']["text_$lang"],
				'position' => $raw_data['position'],
			];
		}, $tour_raw_data);

		echo '<div class="page-tour" id="page-tour" data-steps=';
		echo "'" . json_encode ( $tour_data ) . "'></div>";
	}
} );

//
// ADMIN STUFF
//

// DISABLE EDITOR

function cdc_remove_default_editor() {
	remove_post_type_support ( 'page', 'editor' );
}

// DISABLE COMMENTS

function cdc_remove_comments_admin_menu() {
	remove_menu_page ( 'edit-comments.php' );
}

function cdc_remove_comments_post_type_support() {
	remove_post_type_support ( 'post', 'comments' );
	remove_post_type_support ( 'page', 'comments' );
}

function cdc_remove_comments_admin_bar () {
	global $wp_admin_bar;
	$wp_admin_bar->remove_menu ( 'comments' );
}

/**
 * Add a 'Display in Learning Zone' column.
 *
 * @param array $columns The existing columns.
 * @return array Modified columns with 'Display in Learning Zone' added.
 */
function cdc_add_display_in_learning_zone_column ( $columns ) {
	return array_merge ( $columns, ['display_in_learning_zone' => __ ( 'Display in Learning Zone', 'cdc' )] );
}

/**
 * Display the value of 'display_in_learning_zone' ACF in a readable format.
 *
 * @param string $column_key The key of the column being displayed.
 * @param int $post_id The ID of the current post/page.
 */
function cdc_display_in_learning_zone_value ( $column_key, $post_id ) {
	if ( $column_key == 'display_in_learning_zone' ) {
		$display_in_learning_zone = get_post_meta ( $post_id, 'display_in_learning_zone', true );
		if ( $display_in_learning_zone ) {
			echo '<span style="color:green;">' . __ ( 'Yes', 'cdc') . '</span>';
		} else {
			echo '<span style="color:red;">' . __ ( 'No', 'cdc') . '</span>';
		}
	}
}

/**
 * Returns a boolean indicating if the Gutenberg editor must be enabled for a post type.
 *
 * @param bool   $use_block_editor Whether the post type can use the block editor.
 * @param string $post_type The post type being checked.
 *
 * @return bool Status of block editor.
 */
function cdc_enable_block_editor( $use_block_editor, $post_type ) {
	if ( in_array( $post_type, array( 'interactive' ), true ) ) {
		return true;
	}

	return false;
}

/**
 * Updates the `interactive` post type arguments to make it public if loaded by the motion.page editor.
 *
 * @param array   $args Array of arguments for registering a post type.
 * @param string  $post_type Post type key.
 *
 * @return array  Array of arguments for registering a post type.
 */
function cdc_make_interactive_cpt_public_for_motion_page( $args, $post_type ) {
	if ( $post_type === 'interactive' ) {
		// Check if the request is coming from Motion.page
		if ( isset( $_GET['motionpage_iframe'] ) && $_GET['motionpage_iframe'] == 'true' ) {
			$args['public'] = true;
			$args['publicly_queryable'] = true;
		}
	}
	return $args;
}

/**
 * Adjusts the current user and permissions if loaded by the Motion.page editor,
 * making the page appear as if the user is not logged in.
 *
 * @return void
 */
function cdc_page_as_guest_for_motion_page() {
	// Check if the request is coming from Motion.page
	if ( isset( $_GET['motionpage_iframe'] ) && $_GET['motionpage_iframe'] == 'true' ) {
		// Simulate a non-logged-in user
		wp_set_current_user( 0 );
	}
}

/**
 * Unregisters default taxonomies that are not used.
 *
 * @return void
 */
function cdc_remove_unused_taxonomies() {
	unregister_taxonomy_for_object_type( 'post_tag', 'post' );
	unregister_taxonomy_for_object_type( 'category', 'post' );
}

/**
 * Returns the list of columns to show for the "post" listing page (of the administration).
 *
 * @param string[] $post_columns Associative array `[$id => $name]` of the current columns. `$id` is the column's id,
 *                               and `$value` is the column's name.
 *
 * @return string[] Associative array `[$id => $name]` of the columns to show.
 */
function cdc_manage_post_columns( $post_columns ) {
	unset( $post_columns['author'] );
	unset( $post_columns['post_type'] );
	return $post_columns;
}

add_action ( 'init', 'cdc_remove_default_editor' );
add_action ( 'init', 'cdc_remove_unused_taxonomies' );
add_action ( 'init', 'cdc_remove_comments_post_type_support', 100 );
add_action ( 'init', 'cdc_page_as_guest_for_motion_page' );
add_action ( 'admin_menu', 'cdc_remove_comments_admin_menu' );
add_action ( 'wp_before_admin_bar_render', 'cdc_remove_comments_admin_bar' );
add_action ( 'manage_pages_custom_column', 'cdc_display_in_learning_zone_value', 10, 2 );
add_action ( 'manage_app_posts_custom_column', 'cdc_display_in_learning_zone_value', 10, 2 );
add_filter ( 'use_block_editor_for_post_type', 'cdc_enable_block_editor', 10, 2 );
add_filter ( 'manage_post_posts_columns', 'cdc_manage_post_columns', 10, 1 );
add_filter ( 'manage_pages_columns', 'cdc_add_display_in_learning_zone_column' );
add_filter ( 'manage_resource_posts_columns', 'cdc_add_display_in_learning_zone_column' );
add_filter ( 'manage_app_posts_columns', 'cdc_add_display_in_learning_zone_column' );
add_filter ( 'register_post_type_args', 'cdc_make_interactive_cpt_public_for_motion_page', 10, 2 );


//
// MISC
// find a good home for these
//

// GET PROVINCE ABBREVIATION

function short_province ( $province ) {
		$provinces = array (
			"British Columbia" => "BC",
			"Colombie-Britannique" => "BC",
			"Yukon" => "YT",
			"Northwest Territories" => "NT",
			"Territoires du Nord-Ouest" => "NT",
			"Alberta" => "AB",
			"Newfoundland and Labrador" => "NL",
			"Terre-Neuve-et-Labrador" => "NL",
			"Saskatchewan" => "SK",
			"Ontario" => "ON",
			"Manitoba" => "MB",
			"Nova Scotia" => "NS",
			"Nouvelle-Écosse" => "NS",
			"Quebec" => "QC",
			"Québec" => "QC",
			"New Brunswick" => "NB",
			"Nouveau-Brunswick" => "NB",
			"Prince Edward Island" => "PE",
			"Île-du-Prince-Édouard" => "PE",
			"Nunavut" => "NU"
		);

		if ( array_key_exists ( $province, $provinces ) ) {
			return $provinces[$province];
		} else {
			return $province;
		}

}

// Disable WordPress redirection guessing on 404 errors.
add_filter( 'do_redirect_guess_404_permalink', '__return_false' );

// Get asset type meta for Learning Zone.
function cdc_get_asset_type_meta( $asset_type ) {

	switch ( $asset_type ) {
		case 'video' :
			$meta['icon']  = 'fas fa-video';
			$meta['label'] = __( 'Video', 'cdc' );
			break;

		case 'podcast' :
			$meta['icon']  = 'fas fa-microphone';
			$meta['label'] = __( 'Podcast', 'cdc' );
			break;

		case 'interactive' :
			$meta['icon']  = 'far fa-hand-pointer';
			$meta['label'] = __( 'Interactive', 'cdc' );
			break;

		case 'app' :
			$meta['icon']  = 'far fa-window-maximize';
			$meta['label'] = __( 'App', 'cdc' );
			break;

		case 'sector_overview':
			$meta['icon']  = 'fa-solid fa-gear';
			$meta['label'] = __( 'Sector overview', 'cdc' );
			break;

		case 'case_study':
			$meta['icon']  = 'fa-solid fa-book';
			$meta['label'] = __( 'Case study', 'cdc' );
			break;

		case 'regional_profile':
			$meta['icon']  = 'fas fa-globe';
			$meta['label'] = __( 'Regional profile', 'cdc' );
			break;

		default : // Article.
			$meta['icon'] = 'far fa-newspaper';
			$meta['label'] = __( 'Article', 'cdc' );
			break;
	}

	return $meta;
}

//
// Error 404 related functions
//

/**
 * Add a page selector in the "Reading Settings" page to choose a 404 page.
 */
function cdc_custom_404_page_setting() {

	function page_selector() {
		$page_404 = get_option( 'cdc_page_404' );
		wp_dropdown_pages( array(
			'name' => 'cdc_page_404',
			'selected' => $page_404,
			'show_option_none' => '-- No custom page --',
		) );
		echo '<p class="description">The <em>content</em> of this page will be used for the 404 page.</p>';
	}

	add_settings_field(
		'cdc_page_404',
		'Custom 404 error page',
		'page_selector',
		'reading',
	);

	register_setting( 'reading', 'cdc_page_404' );
}

add_action( 'admin_init', 'cdc_custom_404_page_setting' );

/**
 * Load and process FE assets for apps from the built `manifest.json`
 *
 * @param string $app_type The type of app ('map' or 'download')
 *
 * @return array|null Array of assets or null on failure
 */
function cdc_app_asset_load( $app_type ) {
	// Validate app type
	if ( ! in_array( $app_type, array( 'map', 'download' ), true ) ) {
		error_log( 'Invalid app type: ' . $app_type );

		return null;
	}

	// Set manifest paths based on current theme
	$base_path     = get_stylesheet_directory() . '/apps/dist';
	$manifest_path = $base_path . '/.vite/manifest.json';

	// Verify if manifest file exists and is readable
	if ( ! file_exists( $manifest_path ) || ! is_readable( $manifest_path ) ) {
		error_log( 'Invalid manifest file: ' . $manifest_path );

		return null;
	}

	try {
		// Read and decode manifest.json
		$manifest_content = file_get_contents( $manifest_path );

		if ( false === $manifest_content ) {
			error_log( 'Failed to read file: ' . $manifest_path );

			return null;
		}

		$manifest = json_decode( $manifest_content, true );

		if ( json_last_error() !== JSON_ERROR_NONE ) {
			error_log( 'Failed to parse manifest.json' );

			return null;
		}

		// Get entry point data based on app type
		$entry_key = $app_type . '.html';

		if ( ! isset( $manifest[ $entry_key ] ) ) {
			error_log( 'Missing entry point for: ' . $entry_key );

			return null;
		}

		// Initialize entry data.
		$entry_data = $manifest[ $entry_key ];

		// Initialize apps dist URI
		$apps_dist_uri = get_stylesheet_directory_uri() . '/apps/dist';

		// Initialize arrays for JS (with type) and CSS files
		$js_files  = array(
			'module'        => array(),
			'modulepreload' => array()
		);
		$css_files = array();

		// Add main entry JS file as module
		$js_files['module'][] = $apps_dist_uri . '/' . $entry_data['file'];

		// Add imported JS files as modulepreload
		if ( isset( $entry_data['imports'] ) ) {
			foreach ( $entry_data['imports'] as $import ) {
				if ( isset( $manifest[ $import ]['file'] ) ) {
					$js_files['modulepreload'][] = $apps_dist_uri . '/' . $manifest[ $import ]['file'];
				}
			}
		}

		// Add CSS files from imports
		if ( isset( $entry_data['imports'] ) ) {
			foreach ( $entry_data['imports'] as $import ) {
				if ( isset( $manifest[ $import ]['css'] ) ) {
					foreach ( $manifest[ $import ]['css'] as $css ) {
						$css_files[] = $apps_dist_uri . '/' . $css;
					}
				}
			}
		}

		// Add CSS files from entry
		if ( isset( $entry_data['css'] ) ) {
			foreach ( $entry_data['css'] as $css ) {
				$css_files[] = $apps_dist_uri . '/' . $css;
			}
		}

		return array(
			'js'  => array(
				'module'        => array_unique( $js_files['module'] ),
				'modulepreload' => array_unique( $js_files['modulepreload'] )
			),
			'css' => array_unique( $css_files )
		);

	} catch ( \Exception $e ) {
		error_log( 'App asset loader error: ' . $e->getMessage() );

		return null;
	}
}

/**
 * Get the French domain.
 *
 * @return string The French domain or empty string if not found.
 */
function cdc_get_fr_domain() {
	$fr_domain = '';

	// Check if ACF is active and the field exists
	if ( function_exists( 'get_field' ) ) {
		// Get the repeater field data
		$lang_repeater = get_field( 'admin_langs_languages', 'option' );
		// Loop through each row
		if ( is_array( $lang_repeater ) && ! empty( $lang_repeater ) ) {
			foreach ( $lang_repeater as $lang_row ) {
				// Check if this row represents the French language
				if ( isset( $lang_row['code'] ) && 'fr' === $lang_row['code'] ) {
					// Found the French language row, get its domain
					if ( isset( $lang_row['domain'] ) ) {
						$fr_domain = $lang_row['domain'];

						break; // Exit the loop
					}
				}
			}
		}
	}

	// URL with HTTPS
	$fr_domain_https = 'https://' . $fr_domain;

	return $fr_domain_https;
}



add_filter ( 'document_title_parts', 'cdc_html_title', 20 );

/**
 * Generates the parts of the HTML title.
 *
 * On the home page, show only the site's name and tagline. On other pages, show the page title and the site's name.
 *
 * Notes:
 * - The site's name and tagline are defined in this function. We don't use the WordPress settings for these since we
 *   want them to be translatable, and the WordPress settings are not translatable.
 * - This function doesn't translate the part of title containing the name of the current page. This is done by the
 *   parent theme.
 *
 * @param $title_array
 * @return mixed
 */
function cdc_html_title ( $title_array ) {
	$site_title = __( 'ClimateData.ca', 'cdc' );
	$tagline = __( 'ClimateData.ca provides high quality climate data and resources to help Canadians make decisions in a changing climate.', 'cdc' );

	if ( is_front_page() ) {
		$title_array[ 'title' ] = $site_title;
	}

	if ( array_key_exists( 'tagline', $title_array ) ) {
		$title_array[ 'tagline' ] = $tagline;
	}

	if ( array_key_exists( 'site', $title_array ) ) {
		$title_array[ 'site' ] = $site_title;
	}

	return $title_array;
}

/**
 * Extract locale data from a domain's translation files (.mo files).
 * 
 * Translation files must be situated in the `languages/{domain}` directory of the theme.
 *
 * @param string $domain Domain for which to extract translation data.
 * @param string $locale Locale to load in the domain
 * @return array The structured translation data in JED-compatible format.
 */
function cdc_extract_locale_data( $domain, $locale ) {
    $translation_base_path = get_stylesheet_directory() . '/languages/' . $domain . '/';
    $data = [];

    $mofile = $translation_base_path . $locale . '.mo';

    if ( file_exists( $mofile ) ) {
        $mo = new MO();

        if ( $mo->import_from_file( $mofile ) ) {
            $data[ "" ] = [
                'domain' => $domain,
                'lang'   => $mo->headers['Language'] ?? 'en',
                'plural_forms' => $mo->headers['Plural-Forms'] ?? 'nplurals=2; plural=(n != 1);',
            ];
            foreach ( $mo->entries as $original => $translation_entry ) {
                if ( ! empty( $original ) ) {
                    // $translation_entry->translations is an array of translated strings
                    $data[ $original ] = $translation_entry->translations;
                }
            }
        }
    }

    return $data;
}
