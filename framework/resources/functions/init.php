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
	
	flush_rewrite_rules ( true );
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


function fw_global_vars() {
	
	if ( is_admin() && !wp_doing_ajax() ) return;
	
	global $fw;
	global $wp_query;
	
	// $fw['current_query'] = (array) get_queried_object();
	// this stopped working after adding pre_get_posts for
	// the lang slug
	
	// dumpit ( $wp_query );
	
	if ( is_archive() ) {
		
		$fw['current_query'] = (array) get_queried_object();
		// $fw['current_query'] = $wp_query->tax_query;
		
	} else {
	
		$fw['current_query'] = (array) $wp_query->post;
		
		unset ( $fw['current_query']['post_content'] );
	
		$fw['current_ancestors'] = get_ancestors ( $fw['current_query']['ID'], $fw['current_query']['post_type'] );

	}
	
	$fw['elements'] = array ( 'section', 'container', 'row', 'column', 'block' );
	
	$fw['autogen'] = true;
	
	// $fw['classes'] = array (
	// 	'page' => get_body_class(),
	// 	'section' => ['fw-element', 'fw-section'],
	// 	'container' => ['fw-element', 'fw-container', 'container-fluid'],
	// 	'row' => ['fw-element', 'fw-row', 'row'],
	// 	'column' => ['fw-element', 'fw-column', 'col'],
	// 	'block' => ['fw-element', 'fw-block'],
	// );
	
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

	// possibly not needed anymore because of setup/language.php
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
		
		acf_add_options_page ( array (
			'page_title' => 'Taxonomies',
			'menu_slug' => 'taxonomies',
			'parent_slug' => 'theme-settings',
		) );
		
		acf_add_options_page ( array (
			'page_title' => 'Social Networks',
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

//
// ADMIN BAR
//

add_action ( 'admin_bar_menu', function ( $admin_bar ) {
	
	if ( is_admin() ) return;

	$admin_bar->remove_node ( 'customize' );
	$admin_bar->remove_node ( 'customize-background' );   
	$admin_bar->remove_node ( 'customize-header' ); 
	$admin_bar->remove_node ( 'customize-themes' );   
	$admin_bar->remove_node ( 'customize-widgets' );

	$edit_node = $admin_bar->get_node ( 'edit' );
	
	if ( !empty ( $edit_node ) ) {
		$edit_node->title = 'Edit in Wordpress';
		$edit_node->meta = array ( 'target' => '_blank' );
		$admin_bar->add_node ( $edit_node );
	}
	
	$admin_bar->add_menu ( array (
		'id'    => 'fw-actions',
		'title' => '<span class="dashicons dashicons-block-default"></span>Builder'
	) );
	
	$admin_bar->add_menu ( array (
		'id'    => 'fw-actions-item-toggle',
		'parent' => 'fw-actions',
		'title' => 'Toggle <span class="badge text-bg-success">On</span>',
		'meta'  => array (
			'class' => 'fw-actions-item toggle-builder'
		),
	) );
	
	$admin_bar->add_menu ( array (
		'id'    => 'fw-actions-item-settings',
		'parent' => 'fw-actions',
		'title' => 'Page Settings',
		'href'  => '#fw-modal',
		'meta'  => array (
			'class' => 'fw-actions-item fw-modal-content-page'
		),
	) );
	
	$admin_bar->add_menu ( array (
		'id'    => 'fw-actions-item-layout',
		'parent' => 'fw-actions',
		'title' => 'Apply Layout',
		'href'  => '#fw-modal',
		'meta'  => array (
			'class' => 'fw-actions-item fw-modal-content-do-layout'
		),
	) );
	
	$admin_bar->add_menu ( array (
		'id'    => 'fw-actions-item-save',
		'parent' => 'fw-actions',
		'title' => 'Save Changes',
		'href'  => '#fw-modal',
		'meta'  => array (
			'class' => 'fw-actions-item fw-modal-content-save'
		),
	) );
	
	$admin_bar->add_menu ( array (
		'id'    => 'fw-actions-item-new',
		'parent' => 'fw-actions',
		'title' => 'New Page',
		'href'  => '#fw-modal',
		'meta'  => array (
			'class' => 'fw-actions-item fw-modal-content-post'
		),
	) );
	
	$admin_bar->add_menu ( array (
		'id'    => 'fw-actions-item-langs',
		'title' => '<span class="dashicons dashicons-translation"></span>Language',
	) );
	
	if ( !is_archive() ) {
			
		foreach ( get_option ( 'fw_langs') as $code => $lang ) {
			
			$admin_bar->add_menu ( array (
				'id'    => 'fw-actions-item-lang-' . $code ,
				'parent' => 'fw-actions-item-langs',
				'title' => $lang['name'],
				'href'  => translate_permalink ( $GLOBALS['vars']['current_url'], $GLOBALS['fw']['current_query']['ID'], $code ),
				'meta'  => array (
					'class' => ''
				),
			) );
			
		}
		
	}
}, 100 );



//

add_action ( 'acf/init', function() {
	acf_update_setting ( 'remove_wp_meta_box', false );
} );

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