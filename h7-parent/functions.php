<?php

/**
 * Enable Gutenberg on "interactive" custom post
 * 
 * @param $use_block_editor Whether the post can be edited or not.
 * @param $post The post being checked.
 *
 * @return bool
 */
function enable_gutenberg_on_interactive_cpt( $use_block_editor, $post ) {
   if ( 'interactive' === $post->post_type ) {
      return true;
   }

   return false;
}
add_filter( 'use_block_editor_for_post', 'enable_gutenberg_on_interactive_cpt', 10, 2 );

//
// GLOBAL VARS
//

function theme_global_vars() {

	global $vars;
	
	//
	// DATE / TIME
	//
	
	$vars['timestamp'] = current_time ( 'timestamp' );
  $vars['date'] = date ( 'Ymd', $vars['timestamp'] );
  
  //
  // URLS
  // 
  
  // CURRENT SITE URL
  
  $vars['site_url'] = get_bloginfo('url');
  
  if ( substr ( $vars['site_url'], -1) != '/' ) $vars['site_url'] .= '/';
  
  // NETWORK SITE URL
  
  $vars['network_site_url'] = $vars['site_url']; // default (not multisite)
  
  if ( is_multisite() ) {
    $vars['network_site_url'] = network_site_url();
  }
  
  // CURRENT LOCATION URL AND SLUG
  
  $vars['current_url'] = current_URL();
  $vars['current_slug'] = get_the_slug();
  
  // LANGUAGE
  
  $current_lang = 'en';
  
  $vars['current_lang'] = ICL_LANGUAGE_CODE;
  
  //
  // HOME PAGE ID
  //
  
  $vars['homepage'] = get_option ( 'page_on_front' );
	
	//
	// DIRECTORIES
	//
	
	// PARENT
	
	$vars['theme_dir'] = get_bloginfo ( 'template_directory' );
  
  // CHILD
  
  $vars['child_theme_dir'] = $vars['theme_dir']; // default (not a child theme)
  
  if ( is_child_theme() ) {
    $vars['child_theme_dir'] = get_stylesheet_directory_uri() . '/';
  }
  
}

add_action ( 'wp', 'theme_global_vars' );

//
// INCLUDES
//

$includes = array (
  'resources/functions/essentials/overrides.php',
  'resources/functions/essentials/post.php',
  'resources/functions/essentials/taxonomy.php',
  'resources/functions/essentials/content.php',
  'resources/functions/essentials/media.php',
  'resources/functions/essentials/misc.php',
  'resources/functions/essentials/acf.php',
  'resources/functions/extensions/taxonomies.php',
  'resources/functions/extensions/post-types.php',
  'resources/functions/extensions/shortcodes.php'
);

foreach ( $includes as $include ) {
  
  if ( locate_template ( $include ) != '' ) {
    include_once ( locate_template ( $include ) );
  }
  
} 

//
// THEME FEATURES
//

function theme_features() {

  // menus
  
  add_theme_support ( 'menus' );
  
  register_nav_menus ( array (
    'primary' => 'Primary Navigation',
    'secondary' => 'Secondary Navigation',
    'footer' => 'Footer Menu'
  ) );
  
  // image sizes

  add_theme_support('post-thumbnails');
  
  add_image_size ( 'bg', '2400', '1800', true );
  add_image_size ( 'card-img', '600', '380', true );
  
  // ACF options page
  
  if ( function_exists ( 'acf_add_options_page' ) ) {
  	
  	acf_add_options_page ( array (
  		'page_title' 	=> 'Theme Settings',
  		'menu_title'	=> 'Theme Settings',
  		'menu_slug' 	=> 'theme-settings',
  		'capability'	=> 'edit_posts'
  	) );
  	
  	acf_add_options_sub_page ( array (
  		'page_title'  => 'General Settings',
  		'menu_title'  => 'General',
  		'parent_slug' => 'theme-settings',
  	) );
  	
  	acf_add_options_sub_page ( array (
  		'page_title'  => 'Header',
  		'menu_title'  => 'Header',
  		'parent_slug' => 'theme-settings',
  	) );
  	
  	acf_add_options_sub_page ( array (
  		'page_title'  => 'Footer',
  		'menu_title'  => 'Footer',
  		'parent_slug' => 'theme-settings',
  	) );
  	
  	acf_add_options_sub_page ( array (
  		'page_title'  => 'Contact Form',
  		'menu_title'  => 'Contact Form',
  		'parent_slug' => 'theme-settings',
  	) );
  	
  }
}

add_action ( 'after_setup_theme', 'theme_features' );

// 
// ENQUEUE
//

// FRONT-END

function theme_enqueue() {
  
  //
  // VARS
  //
  
  $theme_dir = get_bloginfo('template_directory') . '/';
  $bower_dir = $theme_dir . 'resources/bower_components/';
  $js_dir = $theme_dir . 'resources/js/';
  
  //
  // STYLES
  //
  
  wp_dequeue_style ( 'wp-block-library' );
  
  //wp_register_style ( 'setup', $theme_dir . 'resources/css/setup.css', NULL, NULL, 'all' );
  //wp_enqueue_style ( 'setup' );
  
  wp_register_style ( 'global-style', $theme_dir . 'style.css', NULL, NULL, 'all' );
  wp_enqueue_style ( 'global-style' );
  
  wp_register_style ( 'font-awesome', 'https://use.fontawesome.com/releases/v5.7.1/css/all.css', NULL, NULL, 'all' );
  wp_enqueue_style ( 'font-awesome' );
  
  if ( is_user_logged_in() ) {
    wp_register_style ( 'user-frontend', $theme_dir . 'resources/css/user/frontend.css', NULL, NULL, 'all' );
    wp_enqueue_style ( 'user-frontend' );
  }
  
  //
  // SCRIPTS
  //
  
  // REGISTER
  
  wp_deregister_script ( 'jquery' );
  wp_register_script ( 'jquery', 'https://code.jquery.com/jquery-latest.min.js', null, false, true );
  wp_enqueue_script ( 'jquery' );
  
  
  wp_register_script ( 'animsition', $bower_dir . 'animsition/dist/js/animsition.min.js', array ( 'jquery' ), NULL, true );
  wp_enqueue_script ( 'animsition' );
  
  // vendor
  
  wp_register_script ( 'slick', $bower_dir . 'slick-carousel/slick/slick.min.js', array ( 'jquery' ), NULL, true );
  wp_register_script ( 'sticky-kit', $bower_dir . 'sticky-kit/jquery.sticky-kit.min.js', array ( 'jquery' ), NULL, true );
  
  // bootstrap
  
  wp_register_script ( 'popper-utils', $bower_dir . 'popper.js/dist/umd/popper-utils.min.js', NULL, NULL, true);  
  wp_register_script ( 'popper', $bower_dir . 'popper.js/dist/umd/popper.min.js', NULL, NULL, true);
  wp_register_script ( 'bootstrap-js', $theme_dir . 'resources/vendor/bootstrap/dist/js/bootstrap.bundle.min.js', array( 'jquery'), NULL, true );
  
  // utilities
  
  wp_register_script ( 'smooth-scroll', $bower_dir . 'pe-smooth-scroll/smooth-scroll.js', array ( 'jquery' ), NULL, true );
  
  // components
  
  wp_register_script ( 'share-widget', $bower_dir . 'pe-social-widget/share-widget.js', array ( 'jquery' ), NULL, true );
  wp_register_script ( 'follow-widget', $bower_dir . 'pe-social-widget/follow-widget.js', array ( 'jquery' ), NULL, true );
  
  wp_register_script ( 'supermenu', $bower_dir . 'pe-supermenu/supermenu.js', array ( 'jquery', 'bootstrap-js', 'slick' ), NULL, true );
  wp_register_script ( 'overlay', $bower_dir . 'pe-overlay/overlay.js', array ( 'jquery' ), NULL, true );
  
  // page functions
  
  wp_register_script ( 'global-functions', $js_dir . 'global-functions.js', array ( 'jquery', 'smooth-scroll', 'supermenu', 'overlay', 'jquery-ui-autocomplete' ), NULL, true );
  wp_register_script ( 'home-functions', $js_dir . 'home-functions.js', array ( 'jquery' ), NULL, true );
  
  // ENQUEUE
  
  // global
  
  wp_enqueue_script ( 'bootstrap-js' );
  
  wp_enqueue_script ( 'sticky-kit' );
  
  //wp_enqueue_script ( 'follow-widget' );
  //wp_enqueue_script ( 'share-widget' );
  //wp_enqueue_script ( 'smooth-scroll' );
  
  wp_enqueue_script ( 'supermenu' );
  wp_enqueue_script ( 'overlay' );
  
  wp_enqueue_script ( 'global-functions' );
  
}

add_action ( 'wp_enqueue_scripts', 'theme_enqueue' );

// ADMIN

// enqueue

function load_custom_wp_admin_style() {
  
  $theme_dir = get_bloginfo ( 'template_directory' ) . '/';
  $bower_dir = $theme_dir . 'resources/bower_components/';
  $js_dir = $theme_dir . 'resources/js/';
  
  wp_register_style ( 'admin-style', $theme_dir . 'resources/css/user/admin.css', NULL, NULL, 'all' );
  wp_enqueue_style ( 'admin-style' );
  
  //wp_register_script ( 'admin', $js_dir . 'admin.js', array ( 'jquery' ), NULL, true );
  //wp_enqueue_script ( 'admin' );
  
}

add_action ( 'admin_enqueue_scripts', 'load_custom_wp_admin_style' );

//
// WPML
//

// get translated ID by path

function filtered_ID_by_path ( $path, $lang = null ) {
  
  if ( $lang == null ) {
    if ( isset ( $GLOBALS['vars']['current_lang'] ) ) {
      $lang = $GLOBALS['vars']['current_lang'];
    } else {
      $lang = 'en';
    }
  }
  
  $get_page = get_page_by_path ( $path );
  
  if ( !empty ( $get_page ) ) {
    
    return apply_filters ( 'wpml_object_id', $get_page->ID, 'page', true, $lang );
    
  }
  
  

}