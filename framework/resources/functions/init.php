<?php

//
// REGISTER SESSION
// used for admin-ajax queries
//

add_action ( 'after_setup_theme', 'fw_register_session', 1 );
add_action ( 'wp_logout', 'end_session' );
// add_action ( 'wp_login', 'end_session' );
add_action ( 'end_session_action', 'end_session' );

function fw_register_session() {
	if ( !session_id() && !headers_sent() ) {
		session_start();
		session_write_close();
	}
}

function end_session() {
	session_destroy();
}

//
// GLOBAL VARIABLES
//

// function utf8_urldecode($str) {
// 				return html_entity_decode(preg_replace("/%u([0-9a-f]{3,4})/i", "&#x\\1;", urldecode($str)), null, 'UTF-8');
// }

function fw_init_lang_setup() {
	
	// dumpit ( $fw );
	
}

// add_action ( 'after_setup_theme', 'fw_init_lang_setup' );


function fw_global_vars() {
	
	global $fw;
	
	// using get_option instead in rewrite.php
	// $fw['langs'] = array ( 
	// 	'en' => 'English',
	// 	'fr' => 'Français'
	// );
	
	global $wp_query;
	// dumpit ( $wp_query->post );
	
	// $fw['current_query'] = (array) get_queried_object();
	// this stopped working after adding pre_get_posts for
	// the lang slug
	
	$fw['current_query'] = (array) $wp_query->post;
	
	$fw['classes'] = array (
		'page' => get_body_class(),
		'section' => ['fw-element', 'fw-section'],
		'container' => ['fw-element', 'fw-container', 'container-fluid'],
		'row' => ['fw-element', 'fw-row', 'row'],
		'column' => ['fw-element', 'fw-column', 'col'],
		'block' => ['fw-element', 'fw-block'],
	);
	
}

add_action ( 'wp', 'fw_global_vars', 15 );

function var_template_include ( $t ) {
	$GLOBALS['vars']['current_template'] = basename ( $t );
	return $t;
}

add_filter ( 'template_include', 'var_template_include', 1000 );

function theme_global_vars() {

	global $vars;
	global $classes;
	global $css;
	global $ids;
	global $elements;
	global $defaults;
	global $counters;

	global $acf_fields;
	
	// $counters = array (
	// 	'section' => 1,
	// 	'container' => 1,
	// 	'column' => 1,
	// 	'block' => 1
	// );
	// 
	// $acf_fields = array (
	// 	'section' => array(),
	// 	'container' => array(),
	// 	'column' => array(),
	// 	'block' => array()
	// );

	//
	// INLINE STYLES
	//

	$css = array();

	//
	// PAGE ID & CLASSES
	//

	$ids['body'] = 'page';

	$classes['body'] = array ( 'spinner-on' );

	if ( is_front_page() ) {

		$ids['body'] = 'page-home';

	} elseif ( is_author() ) {

		$ids['body'] = 'page-author';

	} elseif ( is_archive () ) {

		$ids['body'] = 'page-archive';

	} /*elseif ( is_home() ) {

		$ids['body'] = 'page-posts';

	} */else {
		
		$ids['body'] = get_post_type() . '-' . get_the_slug();

	}

	//
	// DATE / TIME
	//

	$vars['timestamp'] = current_time ( 'timestamp' );
	$vars['date'] = date ( 'Ymd', $vars['timestamp'] );

	//
	// URLS
	//

	// CURRENT SITE URL

	// possible not needed anymore because of setup/language.php
	$vars['site_url'] = trailingslashit ( site_url() );
	$vars['home_url'] = trailingslashit ( home_url() );
	
	if ( substr ( $vars['site_url'], -1) != '/' ) $vars['site_url'] .= '/';

	// NETWORK SITE URL

	$vars['network_site_url'] = $vars['site_url']; // default (not multisite)

	if ( is_multisite() ) {
		$vars['network_site_url'] = network_site_url();
	}

	// CURRENT LOCATION URL AND SLUG

	$vars['current_url'] = current_URL();
	$vars['current_slug'] = get_the_slug();
	
	if ( $GLOBALS['fw']['current_lang_code'] != 'en' ) {
		$vars['current_slug'] = get_post_meta ( get_the_ID(), 'slug_' . $GLOBALS['fw']['current_lang_code'], true );
	}
	
	$vars['current_ancestors'] = get_ancestors ( get_the_ID(), get_post_type() );

	//
	// HOME PAGE ID
	//

	// $vars['homepage'] = get_option ( 'page_on_front' );

	//
	// CURRENT QUERY
	//

	// global $current_query;
	// $vars['current_query'] = get_queried_object();

	//
	// DIRECTORIES
	//

	// PARENT

	$vars['theme_dir'] = get_bloginfo ( 'template_directory' ) . '/';

	// CHILD

	$vars['child_theme_dir'] = $vars['theme_dir']; // default (not a child theme)

	if ( is_child_theme() ) {
		$vars['child_theme_dir'] = get_stylesheet_directory_uri() . '/';
	}

	//
	// USER
	//

	$vars['user_id'] = '';

	if ( is_user_logged_in() ) {

		$vars['user_id'] = get_current_user_id();

		if ( current_user_can ( 'administrator' ) ) {
			$classes['body'][] = 'logged-in-admin';
		}
	}

}

add_action ( 'wp', 'theme_global_vars', 10 );

//
// THEME SETUP
//

function custom_theme_setup() {

	// DOCUMENT TITLE

	add_theme_support ( 'title-tag' );
	
	// ACF options page
	
	if ( function_exists ( 'acf_add_options_page' ) && current_user_can ( 'administrator' ) ) {
	
		$options_parent = acf_add_options_page ( array (
			'page_title' 	=> 'Theme Settings',
			'menu_title'	=> 'Theme Settings',
			'menu_slug' 	=> 'theme-settings',
			'capability'	=> 'edit_posts'
		) );
	
		$options_setup = acf_add_options_sub_page ( array (
			'page_title'  => 'Theme Setup',
			'menu_title'  => 'Setup',
			'menu_slug'		=> 'acf-options-setup',
			'parent_slug' => $options_parent['menu_slug'],
		) );
		
		acf_add_options_sub_page ( array (
			'page_title'  => 'Default Settings',
			'menu_title'  => 'Defaults',
			'parent_slug' => 'theme-settings',
		) );
		
		acf_add_options_sub_page ( array (
			'page_title'  => 'Languages',
			'menu_title'  => 'Languages',
			'menu_slug'		=> 'acf-options-languages',
			'parent_slug' => 'theme-settings',
		) );
		
		// 
		// acf_add_options_sub_page ( array (
		// 	'page_title'  => 'Header',
		// 	'menu_title'  => 'Header',
		// 	'parent_slug' => 'theme-settings',
		// ) );
		// 
		// acf_add_options_sub_page ( array (
		// 	'page_title'  => 'Footer',
		// 	'menu_title'  => 'Footer',
		// 	'parent_slug' => 'theme-settings',
		// ) );
		// 
		// acf_add_options_sub_page ( array (
		// 	'page_title'  => 'Components',
		// 	'menu_title'  => 'Component Settings',
		// 	'parent_slug' => 'theme-settings',
		// ) );
	
	}

}

add_action ( 'after_setup_theme', 'custom_theme_setup', 0 );

function my_acf_init() {
		acf_update_setting('remove_wp_meta_box', false);
}

add_action('acf/init', 'my_acf_init');

function load_custom_wp_admin_style() {

	$theme_dir = get_bloginfo ( 'template_directory' ) . '/';
	$vendor_dir = $theme_dir . 'resources/vendor/';
	$js_dir = $theme_dir . 'resources/js/';

	//
	// CSS
	//

	wp_register_style ( 'admin-style', $theme_dir . 'resources/css/admin.css', NULL, NULL, 'all' );
	wp_enqueue_style ( 'admin-style' );

	//
	// JS
	//

// 	wp_register_script ( 'admin', $js_dir . 'admin-functions.js', array ( 'jquery' ), NULL, true );
// 
// 	wp_localize_script ( 'admin', 'admin_ajax_data',
// 		array (
// 			'url' => admin_url ( 'admin-ajax.php' )
// 		)
// 	);
// 
// 	wp_enqueue_script ( 'admin' );

}

add_action ( 'admin_enqueue_scripts', 'load_custom_wp_admin_style' );