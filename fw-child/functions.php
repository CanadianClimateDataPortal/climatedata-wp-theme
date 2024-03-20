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
	
	wp_register_style ( 'font-awesome', WP_CONTENT_URL . '/vendor/font-awesome-pro/css/all.css', null, null );
	wp_enqueue_style ( 'font-awesome' );

	// leaflet
	
	wp_enqueue_style ( 'leaflet', $child_npm_dir . 'leaflet/dist/leaflet.css', NULL, NULL, 'all' );
	
	// select2
	
	wp_register_style ( 'select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css', null, null );

	wp_register_style ( 'gutenberg', $child_theme_dir . 'resources/css/gutenberg.css', null, null );
	wp_enqueue_style ( 'child-style', $child_theme_dir . 'style.css', NULL, NULL, 'all' );
	
	if (
		is_singular ( 'interactive' ) ||
		is_singular ( 'resource' )
	) {
		wp_enqueue_style ( 'wp-block-library' );
		wp_enqueue_style ( 'gutenberg' );
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
	
	// lodash
	
	// wp_register_script ( 'lodash-full', $child_vendor_dir . 'lodash.js', NULL, NULL, true );
	
	// tab drawer
	
	wp_register_script ( 'tab-drawer', $child_vendor_dir . 'pe-tab-drawer/tab-drawer.js', array ( 'jquery' ), NULL, true );
	
	// flex drawer
	
	wp_register_script ( 'flex-drawer', $child_vendor_dir . 'pe-flex-drawer/flex-drawer.js', array ( 'jquery' ), NULL, true );

	wp_register_script ( 'share-widget', $child_vendor_dir . 'pe-social-widget/share-widget.js', array ( 'jquery' ), NULL, true );
	
	// leaflet
	
	wp_register_script ( 'leaflet', $child_npm_dir . 'leaflet/dist/leaflet-src.js', null, null, true );
	
	wp_register_script ( 'leaflet-sync', $child_npm_dir . 'leaflet.sync/L.Map.Sync.js', array ( 'leaflet' ), null, true );
	
	wp_register_script ( 'leaflet-vectorgrid', $child_npm_dir . 'leaflet.vectorgrid/dist/Leaflet.VectorGrid.bundled.min.js', array ( 'leaflet' ), null, true );
	
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
	
	// utilities/constants
	
	wp_register_script ( 'utilities', $child_js_dir . 'utilities.js', array ( 'jquery' ), NULL, true );
	
  wp_register_script ( 'data', $child_js_dir . 'data.js', array (  ), NULL, true );

	wp_register_script ( 'cdc', $child_js_dir . 'cdc.js', array ( 'utilities', 'data', 'lodash', 'jquery', 'leaflet', 'leaflet-vectorgrid', 'leaflet-sync', 'tab-drawer', 'highcharts-highstock', 'highcharts-more', 'highcharts-exporting', 'highcharts-export-data', 'highcharts-offline-exporting', 'highcharts-accessibility' ), NULL, true );
	
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
		
	}

	switch ( $GLOBALS['vars']['current_slug'] ) {
		case 'map' :
		case 'carte' :
			wp_enqueue_script ( 'map-app' );
			wp_enqueue_script ( 'shapefile-upload' );
			break;
			
		case 'download' :
		case 'telechargement' :
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
				
		case 'beta-apps' :
		case 'apps-beta' :
			wp_enqueue_script ( 'zebra-pin' );
			break;
		
	}
	
	if ( is_singular ( 'beta-app' ) ) {
		wp_enqueue_script ( 'iframe-functions', $child_js_dir . 'iframe-functions.js', array ( 'jquery' ), null, true );
	}
	
	if ( is_post_type_archive ( 'variable' ) ) {
		wp_enqueue_script ( 'zebra-pin' );
		wp_enqueue_script ( 'flex-drawer' );
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
	
	load_theme_textdomain ( 'cdc', get_stylesheet_directory() . '/languages' );
	
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

<script src="https://platform.linkedin.com/in.js" type="text/javascript">lang: en_US</script>
<script type="IN/Share" data-url="https://www.linkedin.com"></script>

<?php

	}

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

//
// VARIABLES OFFCANVAS
//

add_action ( 'fw_before_footer', function() {

	include ( locate_template ( 'template/menu-overlay.php' ) );

} );

//
// ADMIN STUFF
//

// DISABLE EDITOR

function remove_default_editor() {
	remove_post_type_support ( 'page', 'editor' );
}

// DISABLE COMMENTS

function remove_comments_admin_menu() {
	remove_menu_page ( 'edit-comments.php' );
}

function remove_comments_post_type_support() {
	remove_post_type_support ( 'post', 'comments' );
	remove_post_type_support ( 'page', 'comments' );
}

function remove_comments_admin_bar() {
	global $wp_admin_bar;
	$wp_admin_bar->remove_menu ( 'comments' );
}

add_action ( 'init', 'remove_default_editor' );
add_action ( 'init', 'remove_comments_post_type_support', 100 );
add_action ( 'admin_menu', 'remove_comments_admin_menu' );
add_action ( 'wp_before_admin_bar_render', 'remove_comments_admin_bar' );

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


function cdc_var_types_field () {

	register_rest_field ( 'variable',
		'var_types',
		array (
			'get_callback' => 'cdc_list_var_types',
			'update_callback' => null,
			'schema' => null,
		)
	);
	
}

add_action ( 'rest_api_init', 'cdc_var_types_field' );

function cdc_list_var_types ( $object, $field_name, $request ) {

	$term_list = array();

	$terms = get_the_terms ( $object['id'], 'var-type' );

	foreach ($terms as $term) {
		$term_list[] = $term->name;
	}

	return $term_list;
	
}
