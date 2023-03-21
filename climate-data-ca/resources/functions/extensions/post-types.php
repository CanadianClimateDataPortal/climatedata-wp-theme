<?php

// variables

function posttype_variable() {

	$labels = array(
		'name'                  => _x( 'Variables', 'Post Type General Name', 'cdc-post-types' ),
		'singular_name'         => _x( 'Variable', 'Post Type Singular Name', 'cdc-post-types' ),
		'menu_name'             => __( 'Variables', 'cdc-post-types' ),
		'name_admin_bar'        => __( 'Variable', 'cdc-post-types' ),
		'archives'              => __( 'Variable Archives', 'cdc-post-types' ),
		'attributes'            => __( 'Variable Attributes', 'cdc-post-types' ),
		'parent_item_colon'     => __( 'Parent Variable:', 'cdc-post-types' ),
		'all_items'             => __( 'All Variables', 'cdc-post-types' ),
		'add_new_item'          => __( 'Add New Variable', 'cdc-post-types' ),
		'add_new'               => __( 'Add New', 'cdc-post-types' ),
		'new_item'              => __( 'New Variable', 'cdc-post-types' ),
		'edit_item'             => __( 'Edit Variable', 'cdc-post-types' ),
		'update_item'           => __( 'Update Variable', 'cdc-post-types' ),
		'view_item'             => __( 'View Variable', 'cdc-post-types' ),
		'view_items'            => __( 'View Variables', 'cdc-post-types' ),
		'search_items'          => __( 'Search Variable', 'cdc-post-types' ),
		'not_found'             => __( 'Not found', 'cdc-post-types' ),
		'not_found_in_trash'    => __( 'Not found in Trash', 'cdc-post-types' ),
		'featured_image'        => __( 'Featured Image', 'cdc-post-types' ),
		'set_featured_image'    => __( 'Set featured image', 'cdc-post-types' ),
		'remove_featured_image' => __( 'Remove featured image', 'cdc-post-types' ),
		'use_featured_image'    => __( 'Use as featured image', 'cdc-post-types' ),
		'insert_into_item'      => __( 'Insert into item', 'cdc-post-types' ),
		'uploaded_to_this_item' => __( 'Uploaded to this item', 'cdc-post-types' ),
		'items_list'            => __( 'Items list', 'cdc-post-types' ),
		'items_list_navigation' => __( 'Items list navigation', 'cdc-post-types' ),
		'filter_items_list'     => __( 'Filter items list', 'cdc-post-types' ),
	);
	$args = array(
		'label'                 => __( 'Variable', 'cdc-post-types' ),
		'description'           => __( 'ClimateData.ca provides high-resolution climate data to help decision makers build a more resilient Canada.', 'cdc-post-types' ),
		'labels'                => $labels,
		'supports'              => array( 'title', 'editor', 'page-attributes', 'thumbnail', 'revisions' ),
		'hierarchical'          => true,
		'public'                => true,
		'show_ui'               => true,
		'show_in_menu'          => true,
		'menu_position'         => 21,
		'menu_icon'             => 'dashicons-admin-settings',
		'show_in_admin_bar'     => true,
		'show_in_nav_menus'     => true,
		'can_export'            => true,
		'has_archive'           => true,
		'exclude_from_search'   => false,
		'publicly_queryable'    => true,
		'capability_type'       => 'page',
	);
	register_post_type( 'variable', $args );

}
add_action( 'init', 'posttype_variable', 0 );

// case studies

function posttype_casestudy() {

	$labels = array(
		'name'                  => _x( 'Case Studies', 'Post Type General Name', 'cdc-post-types' ),
		'singular_name'         => _x( 'Case Study', 'Post Type Singular Name', 'cdc-post-types' ),
		'menu_name'             => __( 'Case Studies', 'cdc-post-types' ),
		'name_admin_bar'        => __( 'Case Study', 'cdc-post-types' ),
		'archives'              => __( 'Case Study Archives', 'cdc-post-types' ),
		'attributes'            => __( 'Case Study Attributes', 'cdc-post-types' ),
		'parent_item_colon'     => __( 'Parent Case Study:', 'cdc-post-types' ),
		'all_items'             => __( 'All Case Studies', 'cdc-post-types' ),
		'add_new_item'          => __( 'Add New Case Study', 'cdc-post-types' ),
		'add_new'               => __( 'Add New', 'cdc-post-types' ),
		'new_item'              => __( 'New Case Study', 'cdc-post-types' ),
		'edit_item'             => __( 'Edit Case Study', 'cdc-post-types' ),
		'update_item'           => __( 'Update Case Study', 'cdc-post-types' ),
		'view_item'             => __( 'View Case Study', 'cdc-post-types' ),
		'view_items'            => __( 'View Case Studies', 'cdc-post-types' ),
		'search_items'          => __( 'Search Case Study', 'cdc-post-types' ),
		'not_found'             => __( 'Not found', 'cdc-post-types' ),
		'not_found_in_trash'    => __( 'Not found in Trash', 'cdc-post-types' ),
		'featured_image'        => __( 'Featured Image', 'cdc-post-types' ),
		'set_featured_image'    => __( 'Set featured image', 'cdc-post-types' ),
		'remove_featured_image' => __( 'Remove featured image', 'cdc-post-types' ),
		'use_featured_image'    => __( 'Use as featured image', 'cdc-post-types' ),
		'insert_into_item'      => __( 'Insert into item', 'cdc-post-types' ),
		'uploaded_to_this_item' => __( 'Uploaded to this item', 'cdc-post-types' ),
		'items_list'            => __( 'Items list', 'cdc-post-types' ),
		'items_list_navigation' => __( 'Items list navigation', 'cdc-post-types' ),
		'filter_items_list'     => __( 'Filter items list', 'cdc-post-types' ),
	);
	$args = array(
		'label'                 => __( 'Case Study', 'cdc-post-types' ),
		'description'           => __( 'Post Type Description', 'cdc-post-types' ),
		'labels'                => $labels,
		'supports'              => array ( 'title', 'thumbnail', 'excerpt', 'revisions', 'page-attributes' ),
		'hierarchical'          => false,
		'public'                => true,
		'show_ui'               => true,
		'show_in_menu'          => true,
		'menu_position'         => 22,
		'menu_icon'             => 'dashicons-portfolio',
		'show_in_admin_bar'     => true,
		'show_in_nav_menus'     => true,
		'can_export'            => true,
		'has_archive'           => true,
		'exclude_from_search'   => false,
		'publicly_queryable'    => true,
		'capability_type'       => 'page',
	);
	register_post_type( 'case-study', $args );

}
add_action( 'init', 'posttype_casestudy', 0 );

// training resources

function posttype_resource() {

	$labels = array(
		'name'                  => _x( 'Training Resources', 'Post Type General Name', 'cdc-post-types' ),
		'singular_name'         => _x( 'Training Resource', 'Post Type Singular Name', 'cdc-post-types' ),
		'menu_name'             => __( 'Training Resources', 'cdc-post-types' ),
		'name_admin_bar'        => __( 'Resource', 'cdc-post-types' ),
		'archives'              => __( 'Resource Archives', 'cdc-post-types' ),
		'attributes'            => __( 'Resource Attributes', 'cdc-post-types' ),
		'parent_item_colon'     => __( 'Parent Resource:', 'cdc-post-types' ),
		'all_items'             => __( 'All Resources', 'cdc-post-types' ),
		'add_new_item'          => __( 'Add New Resource', 'cdc-post-types' ),
		'add_new'               => __( 'Add New', 'cdc-post-types' ),
		'new_item'              => __( 'New Resource', 'cdc-post-types' ),
		'edit_item'             => __( 'Edit Resource', 'cdc-post-types' ),
		'update_item'           => __( 'Update Resource', 'cdc-post-types' ),
		'view_item'             => __( 'View Resource', 'cdc-post-types' ),
		'view_items'            => __( 'View Resources', 'cdc-post-types' ),
		'search_items'          => __( 'Search Resource', 'cdc-post-types' ),
		'not_found'             => __( 'Not found', 'cdc-post-types' ),
		'not_found_in_trash'    => __( 'Not found in Trash', 'cdc-post-types' ),
		'featured_image'        => __( 'Featured Image', 'cdc-post-types' ),
		'set_featured_image'    => __( 'Set featured image', 'cdc-post-types' ),
		'remove_featured_image' => __( 'Remove featured image', 'cdc-post-types' ),
		'use_featured_image'    => __( 'Use as featured image', 'cdc-post-types' ),
		'insert_into_item'      => __( 'Insert into item', 'cdc-post-types' ),
		'uploaded_to_this_item' => __( 'Uploaded to this item', 'cdc-post-types' ),
		'items_list'            => __( 'Items list', 'cdc-post-types' ),
		'items_list_navigation' => __( 'Items list navigation', 'cdc-post-types' ),
		'filter_items_list'     => __( 'Filter items list', 'cdc-post-types' ),
	);
	$args = array(
		'label'                 => __( 'Training Resource', 'cdc-post-types' ),
		'description'           => __( 'Post Type Description', 'cdc-post-types' ),
		'labels'                => $labels,
		'supports'              => array( 'title', 'thumbnail', 'revisions', 'excerpt', 'page-attributes' ),
		'hierarchical'          => true,
		'public'                => true,
		'show_ui'               => true,
		'show_in_menu'          => true,
		'menu_position'         => 23,
		'show_in_admin_bar'     => true,
		'show_in_nav_menus'     => true,
		'can_export'            => true,
		'has_archive'           => true,
		'exclude_from_search'   => false,
		'publicly_queryable'    => true,
		'capability_type'       => 'page',
	);
	register_post_type( 'resource', $args );

}

add_action( 'init', 'posttype_resource', 0 );

// definitions

function posttype_definition() {

	$labels = array(
		'name'                  => _x( 'Definitions', 'Post Type General Name', 'cdc-post-types' ),
		'singular_name'         => _x( 'Definition', 'Post Type Singular Name', 'cdc-post-types' ),
		'menu_name'             => __( 'Definitions', 'cdc-post-types' ),
		'name_admin_bar'        => __( 'Definition', 'cdc-post-types' ),
		'archives'              => __( 'Definition Archives', 'cdc-post-types' ),
		'attributes'            => __( 'Definition Attributes', 'cdc-post-types' ),
		'parent_item_colon'     => __( 'Parent Definition:', 'cdc-post-types' ),
		'all_items'             => __( 'All Definitions', 'cdc-post-types' ),
		'add_new_item'          => __( 'Add New Definition', 'cdc-post-types' ),
		'add_new'               => __( 'Add New', 'cdc-post-types' ),
		'new_item'              => __( 'New Definition', 'cdc-post-types' ),
		'edit_item'             => __( 'Edit Definition', 'cdc-post-types' ),
		'update_item'           => __( 'Update Definition', 'cdc-post-types' ),
		'view_item'             => __( 'View Definition', 'cdc-post-types' ),
		'view_items'            => __( 'View Definitions', 'cdc-post-types' ),
		'search_items'          => __( 'Search Definition', 'cdc-post-types' ),
		'not_found'             => __( 'Not found', 'cdc-post-types' ),
		'not_found_in_trash'    => __( 'Not found in Trash', 'cdc-post-types' ),
		'featured_image'        => __( 'Featured Image', 'cdc-post-types' ),
		'set_featured_image'    => __( 'Set featured image', 'cdc-post-types' ),
		'remove_featured_image' => __( 'Remove featured image', 'cdc-post-types' ),
		'use_featured_image'    => __( 'Use as featured image', 'cdc-post-types' ),
		'insert_into_item'      => __( 'Insert into item', 'cdc-post-types' ),
		'uploaded_to_this_item' => __( 'Uploaded to this item', 'cdc-post-types' ),
		'items_list'            => __( 'Items list', 'cdc-post-types' ),
		'items_list_navigation' => __( 'Items list navigation', 'cdc-post-types' ),
		'filter_items_list'     => __( 'Filter items list', 'cdc-post-types' ),
	);
	$args = array(
		'label'                 => __( 'Definition', 'cdc-post-types' ),
		'description'           => __( 'Post Type Description', 'cdc-post-types' ),
		'labels'                => $labels,
		'supports'              => array( 'title', 'editor' ),
		'hierarchical'          => false,
		'public'                => true,
		'show_ui'               => true,
		'show_in_menu'          => true,
		'menu_position'         => 24,
		'menu_icon'             => 'dashicons-book-alt',
		'show_in_admin_bar'     => true,
		'show_in_nav_menus'     => true,
		'can_export'            => true,
		'has_archive'           => true,
		'exclude_from_search'   => false,
		'publicly_queryable'    => true,
		'capability_type'       => 'page',
	);
	register_post_type( 'definition', $args );

}
add_action( 'init', 'posttype_definition', 0 );

// Interactive

function posttype_interactive() {

	$labels = array(
		'name'                  => _x( 'Interactive', 'Post Type General Name', 'cdc-post-types' ),
		'singular_name'         => _x( 'Interactive', 'Post Type Singular Name', 'cdc-post-types' ),
		'menu_name'             => __( 'Interactive', 'cdc-post-types' ),
		'name_admin_bar'        => __( 'Interactive', 'cdc-post-types' ),
		'archives'              => __( 'Interactive Archives', 'cdc-post-types' ),
		'attributes'            => __( 'Interactive Attributes', 'cdc-post-types' ),
		'parent_item_colon'     => __( 'Parent Interactive:', 'cdc-post-types' ),
		'all_items'             => __( 'All Interactive', 'cdc-post-types' ),
		'add_new_item'          => __( 'Add New Interactive', 'cdc-post-types' ),
		'add_new'               => __( 'Add New', 'cdc-post-types' ),
		'new_item'              => __( 'New Interactive', 'cdc-post-types' ),
		'edit_item'             => __( 'Edit Interactive', 'cdc-post-types' ),
		'update_item'           => __( 'Update Interactive', 'cdc-post-types' ),
		'view_item'             => __( 'View Interactive', 'cdc-post-types' ),
		'view_items'            => __( 'View Interactive', 'cdc-post-types' ),
		'search_items'          => __( 'Search Interactive', 'cdc-post-types' ),
		'not_found'             => __( 'Not found', 'cdc-post-types' ),
		'not_found_in_trash'    => __( 'Not found in Trash', 'cdc-post-types' ),
		'featured_image'        => __( 'Featured Image', 'cdc-post-types' ),
		'set_featured_image'    => __( 'Set featured image', 'cdc-post-types' ),
		'remove_featured_image' => __( 'Remove featured image', 'cdc-post-types' ),
		'use_featured_image'    => __( 'Use as featured image', 'cdc-post-types' ),
		'insert_into_item'      => __( 'Insert into item', 'cdc-post-types' ),
		'uploaded_to_this_item' => __( 'Uploaded to this item', 'cdc-post-types' ),
		'items_list'            => __( 'Items list', 'cdc-post-types' ),
		'items_list_navigation' => __( 'Items list navigation', 'cdc-post-types' ),
		'filter_items_list'     => __( 'Filter items list', 'cdc-post-types' ),
	);
	$args   = array(
		'label'               => __( 'Interactive', 'cdc-post-types' ),
		'description'         => __( 'ClimateData.ca interactive pages.', 'cdc-post-types' ),
		'labels'              => $labels,
		'supports'            => array( 'title', 'editor', 'excerpt', 'thumbnail', 'revisions' ),
		'hierarchical'        => true,
		'public'              => true,
		'show_ui'             => true,
		'show_in_menu'        => true,
		'menu_position'       => 20,
		'menu_icon'           => 'dashicons-images-alt',
		'show_in_admin_bar'   => true,
		'show_in_nav_menus'   => true,
		'can_export'          => true,
		'has_archive'         => true,
		'exclude_from_search' => false,
		'publicly_queryable'  => true,
		'capability_type'     => 'page',
		'show_in_rest'        => true,
	);
	register_post_type( 'interactive', $args );

}

add_action( 'init', 'posttype_interactive', 0 );