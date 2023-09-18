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

	$classes['body'][] = 'lang-' . apply_filters ( 'wpml_current_language', NULL );

}

add_action ( 'wp', 'child_global_vars', 20 );

//
// ENQUEUE
//

function child_theme_enqueue() {
	
	$theme_dir = get_bloginfo ( 'template_directory' ) . '/';
	$vendor_dir = $theme_dir . 'resources/vendor/';
	$js_dir = $theme_dir . 'resources/js/';

	$child_theme_dir = get_stylesheet_directory_uri() . '/';
	$child_vendor_dir = $child_theme_dir . 'resources/vendor/';
	$child_js_dir = $child_theme_dir . 'resources/js/';

	//
	// STYLES
	//
	
	// dequeue global CSS
	
	wp_dequeue_style ( 'global-style' );

	wp_enqueue_style ( 'child-style', $child_theme_dir . 'style.css', NULL, NULL, 'all' );

	//
	// SCRIPTS
	//

	wp_register_script ( 'tab-drawer', $child_vendor_dir . 'pe-tab-drawer/tab-drawer.js', array ( 'jquery' ), NULL, true );
	
	wp_register_script ( 'child-functions', $child_js_dir . 'child-functions.js', array (  ), NULL, true );
	
	wp_register_script ( 'map-app', $child_js_dir . 'map.js', array ( 'jquery', 'leaflet', 'tab-drawer' ), NULL, true );

	// localize admin url

	wp_localize_script ( 'child-functions', 'ajax_data',
		array (
			'url' => admin_url ( 'admin-ajax.php' ),
			'globals' => $GLOBALS['fw']
		)
	);
	
	// VENDOR

	wp_register_script ( 'leaflet', $child_theme_dir . 'resources/vendor/leaflet/leaflet.js', null, null, true );
	
	// PAGE CONDITIONALS

	if ( is_page ( 'map' ) ) {
		
		wp_enqueue_script ( 'leaflet' );
		wp_enqueue_script ( 'map-app' );
		
	}
	
	wp_enqueue_script ( 'child-functions' );

}

add_action ( 'wp_enqueue_scripts', 'child_theme_enqueue', 50 );

//
// INCLUDES
//

$includes = array (
	'resources/functions/taxonomies.php',
	'resources/functions/post-types.php',
	'resources/functions/shortcodes.php'
);

foreach ( $includes as $include ) {

	if ( locate_template ( $include ) != '' ) {
		include_once ( locate_template ( $include ) );
	}

}

//
// THEME SETUP
//

function fw_child_theme_support() {

	// DOCUMENT TITLE

	add_theme_support ( 'title-tag' );

	// PAGE EXCERPTS

	add_post_type_support ( 'page', 'excerpt' );

	// UNCROPPED IMAGE SIZE FOR CARD BLOCKS

	add_image_size ( 'card-img-no-crop', '600', '380', false );

	// MENUS

}

add_action ( 'after_setup_theme', 'fw_child_theme_support', 0 );

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
