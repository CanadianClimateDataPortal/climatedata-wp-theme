<?php

// CURRENT TIMESTAMP

$current_timestamp = current_time ( 'timestamp' );
$current_date = date ( 'Ymd', $current_timestamp );

// CURRENT SITE URL

$site_url = get_bloginfo('url');

// NETWORK SITE URL

$network_site_url = $site_url; // default (not multisite)

if ( is_multisite() ) {
  $network_site_url = network_site_url();
}

//
// TEMPLATE DIRECTORY
//

// PARENT THEME

$theme_dir = get_bloginfo ( 'template_directory' );

// CHILD THEME

$child_theme_dir = $theme_dir; // default (not a child theme)

if ( is_child_theme() ) {
  $child_theme_dir = get_stylesheet_directory_uri() . '/';
}

//
// CURRENT URL
//

$current_url = current_URL();
$current_slug = get_the_slug();

//
// HOME PAGE ID
//

$homepage_ID = get_option ( 'page_on_front' );

//
// DEBUG
//

/*
echo 'site_url: ' . $site_url . '<br>';
echo 'network_site_url: ' . $network_site_url . '<br>';
echo 'theme_dir: ' . $theme_dir . '<br>';
echo 'child_theme_dir: ' . $child_theme_dir . '<br>';
*/


echo 'parent vars<br>';