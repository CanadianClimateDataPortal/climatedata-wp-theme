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
	
	wp_register_style ( 'font-awesome', WP_CONTENT_URL . '/vendor/font-awesome-pro/css/all.css', null, null );
	wp_enqueue_style ( 'font-awesome' );

	wp_enqueue_style ( 'leaflet', $child_npm_dir . 'leaflet/dist/leaflet.css', NULL, NULL, 'all' );

	wp_enqueue_style ( 'child-style', $child_theme_dir . 'style.css', NULL, NULL, 'all' );
	
	if (
		$GLOBALS['vars']['current_slug'] == 'map' ||
		$GLOBALS['vars']['current_slug'] == 'carte'
	) {
		
		wp_enqueue_style ( 'leaflet' );
		
	}

	//
	// SCRIPTS
	//

	wp_register_script ( 'tab-drawer', $child_vendor_dir . 'pe-tab-drawer/tab-drawer.js', array ( 'jquery' ), NULL, true );
	
	wp_register_script ( 'child-functions', $child_js_dir . 'child-functions.js', array (  ), NULL, true );
	
	wp_register_script ( 'cdc', $child_js_dir . 'cdc.js', array ( 'jquery', 'leaflet', 'leaflet-vectorgrid', 'leaflet-sync', 'tab-drawer' ), NULL, true );
	
	wp_register_script ( 'map-app', $child_js_dir . 'map.js', array ( 'jquery', 'leaflet', 'cdc', 'leaflet-sync', 'tab-drawer', 'jquery-ui-tabs', 'jquery-ui-sortable', 'jquery-ui-slider' ), NULL, true );

	wp_register_script ( 'download-app', $child_js_dir . 'download.js', array ( 'jquery', 'cdc', 'leaflet', 'leaflet-sync', 'tab-drawer' ), NULL, true );
	
	// localize admin url
		
	// wp_localize_script ( 'child-functions', 'ajax_data',
	// 	array (
	// 		'url' => admin_url ( 'admin-ajax.php' ),
	// 		'globals' => $GLOBALS['fw']
	// 	)
	// );
	
	// VENDOR

	wp_register_script ( 'leaflet', $child_npm_dir . 'leaflet/dist/leaflet-src.js', null, null, true );
	
	wp_register_script ( 'leaflet-sync', $child_npm_dir . 'leaflet.sync/L.Map.Sync.js', array ( 'leaflet' ), null, true );
	
	wp_register_script ( 'leaflet-vectorgrid', $child_npm_dir . 'leaflet.vectorgrid/dist/Leaflet.VectorGrid.bundled.min.js', array ( 'leaflet' ), null, true );
	
	wp_register_script ( 'zebra-pin', $child_npm_dir . 'zebra_pin/dist/zebra_pin.min.js', array ( 'jquery' ), null, true );
	
	// PAGE CONDITIONALS

	switch ( $GLOBALS['vars']['current_slug'] ) {
		case 'map' :
		case 'carte' :
			wp_enqueue_script ( 'map-app' );
			break;
			
		case 'download' :
		case 'telechargement' :
			wp_enqueue_script ( 'download-app' );
			break;
			
		case 'learn' :
		case 'apprendre' :
			wp_enqueue_script ( 'zebra-pin' );
			wp_enqueue_script ( 'tab-drawer' );
			break;
			
		case 'news' :
		case 'nouvelles' :
			wp_enqueue_script ( 'zebra-pin' );
			wp_enqueue_script ( 'tab-drawer' );
			
		
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

<link rel="apple-touch-icon" sizes="180x180" href="<?php echo $GLOBALS['vars']['child_theme_dir']; ?>resources/vendor/favicon_package_v0.16/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="<?php echo $GLOBALS['vars']['child_theme_dir']; ?>resources/vendor/favicon_package_v0.16/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="<?php echo $GLOBALS['vars']['child_theme_dir']; ?>resources/vendor/favicon_package_v0.16/favicon-16x16.png">
<link rel="manifest" href="<?php echo $GLOBALS['vars']['child_theme_dir']; ?>resources/vendor/favicon_package_v0.16/site.webmanifest">
<link rel="mask-icon" href="<?php echo $GLOBALS['vars']['child_theme_dir']; ?>resources/vendor/favicon_package_v0.16/safari-pinned-tab.svg" color="#0018ff">
<meta name="msapplication-TileColor" content="#ffffff">
<meta name="theme-color" content="#ffffff">

<?php

}

// add_action( 'wp_head', 'add_favicon' );

add_action ( 'fw_before_footer', function() {
	
?>

<script type="text/javascript">var L_DISABLE_3D = true;</script>

<?php

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