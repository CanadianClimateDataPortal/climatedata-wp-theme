<?php

//
// TEMPLATE
//

function posttype_template() {

	$labels = array(
		'name'                  => _x( 'Templates', 'Post Type General Name', 'fw-post-types' ),
		'singular_name'         => _x( 'Template', 'Post Type Singular Name', 'fw-post-types' ),
		'menu_name'             => __( 'Templates', 'fw-post-types' ),
		'name_admin_bar'        => __( 'Template', 'fw-post-types' ),
		'archives'              => __( 'Template Archives', 'fw-post-types' ),
		'attributes'            => __( 'Template Attributes', 'fw-post-types' ),
		'parent_item_colon'     => __( 'Parent Template:', 'fw-post-types' ),
		'all_items'             => __( 'All Templates', 'fw-post-types' ),
		'add_new_item'          => __( 'Add New Template', 'fw-post-types' ),
		'add_new'               => __( 'Add New', 'fw-post-types' ),
		'new_item'              => __( 'New Template', 'fw-post-types' ),
		'edit_item'             => __( 'Edit Template', 'fw-post-types' ),
		'update_item'           => __( 'Update Template', 'fw-post-types' ),
		'view_item'             => __( 'View Template', 'fw-post-types' ),
		'view_items'            => __( 'View Templates', 'fw-post-types' ),
		'search_items'          => __( 'Search Template', 'fw-post-types' ),
		'not_found'             => __( 'Not found', 'fw-post-types' ),
		'not_found_in_trash'    => __( 'Not found in Trash', 'fw-post-types' ),
		'featured_image'        => __( 'Featured Image', 'fw-post-types' ),
		'set_featured_image'    => __( 'Set featured image', 'fw-post-types' ),
		'remove_featured_image' => __( 'Remove featured image', 'fw-post-types' ),
		'use_featured_image'    => __( 'Use as featured image', 'fw-post-types' ),
		'insert_into_item'      => __( 'Insert into item', 'fw-post-types' ),
		'uploaded_to_this_item' => __( 'Uploaded to this item', 'fw-post-types' ),
		'items_list'            => __( 'Items list', 'fw-post-types' ),
		'items_list_navigation' => __( 'Items list navigation', 'fw-post-types' ),
		'filter_items_list'     => __( 'Filter items list', 'fw-post-types' ),
	);
	$args = array(
		'label'                 => __( 'Template', 'fw-post-types' ),
		'description'           => __( 'Post Type Description', 'fw-post-types' ),
		'labels'                => $labels,
		'supports'              => array( 'title', 'custom-fields' ),
		'taxonomies'            => array( 'template_tag' ),
		'hierarchical'          => false,
		'public'                => true,
		'show_ui'               => true,
		'show_in_menu'          => true,
		'menu_position'         => 20,
		'menu_icon'             => 'dashicons-clipboard',
		'show_in_admin_bar'     => true,
		'show_in_nav_menus'     => true,
		'can_export'            => true,
		'has_archive'           => true,
		'exclude_from_search'   => false,
		'publicly_queryable'    => true,
		'capability_type'       => 'page',
	);
	register_post_type( 'fw-template', $args );

}
add_action( 'init', 'posttype_template', 0 );

//
// LAYOUT
//

function posttype_layout() {

	$labels = array(
		'name'                  => _x( 'Layouts', 'Post Type General Name', 'fw-post-types' ),
		'singular_name'         => _x( 'Layout', 'Post Type Singular Name', 'fw-post-types' ),
		'menu_name'             => __( 'Layouts', 'fw-post-types' ),
		'name_admin_bar'        => __( 'Post Type', 'fw-post-types' ),
		'archives'              => __( 'Layout Archives', 'fw-post-types' ),
		'attributes'            => __( 'Layout Attributes', 'fw-post-types' ),
		'parent_item_colon'     => __( 'Parent Layout:', 'fw-post-types' ),
		'all_items'             => __( 'All Layouts', 'fw-post-types' ),
		'add_new_item'          => __( 'Add New Layout', 'fw-post-types' ),
		'add_new'               => __( 'Add New', 'fw-post-types' ),
		'new_item'              => __( 'New Layout', 'fw-post-types' ),
		'edit_item'             => __( 'Edit Layout', 'fw-post-types' ),
		'update_item'           => __( 'Update Layout', 'fw-post-types' ),
		'view_item'             => __( 'View Layout', 'fw-post-types' ),
		'view_items'            => __( 'View Layouts', 'fw-post-types' ),
		'search_items'          => __( 'Search Layout', 'fw-post-types' ),
		'not_found'             => __( 'Not found', 'fw-post-types' ),
		'not_found_in_trash'    => __( 'Not found in Trash', 'fw-post-types' ),
		'featured_image'        => __( 'Featured Image', 'fw-post-types' ),
		'set_featured_image'    => __( 'Set featured image', 'fw-post-types' ),
		'remove_featured_image' => __( 'Remove featured image', 'fw-post-types' ),
		'use_featured_image'    => __( 'Use as featured image', 'fw-post-types' ),
		'insert_into_item'      => __( 'Insert into item', 'fw-post-types' ),
		'uploaded_to_this_item' => __( 'Uploaded to this item', 'fw-post-types' ),
		'items_list'            => __( 'Items list', 'fw-post-types' ),
		'items_list_navigation' => __( 'Items list navigation', 'fw-post-types' ),
		'filter_items_list'     => __( 'Filter items list', 'fw-post-types' ),
	);
	$args = array(
		'label'                 => __( 'Layout', 'fw-post-types' ),
		'description'           => __( 'Post Type Description', 'fw-post-types' ),
		'labels'                => $labels,
		'supports'              => array( 'title', 'thumbnail', 'custom-fields', 'page-attributes' ),
		'hierarchical'          => false,
		'public'                => true,
		'show_ui'               => true,
		'show_in_menu'          => true,
		'menu_position'         => 21,
		'menu_icon'             => 'dashicons-layout',
		'show_in_admin_bar'     => true,
		'show_in_nav_menus'     => true,
		'can_export'            => true,
		'has_archive'           => true,
		'exclude_from_search'   => false,
		'publicly_queryable'    => false,
		'capability_type'       => 'page',
	);
	register_post_type( 'fw-layout', $args );

}
add_action( 'init', 'posttype_layout', 0 );