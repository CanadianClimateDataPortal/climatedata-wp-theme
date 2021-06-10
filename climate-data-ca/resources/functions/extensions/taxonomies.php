<?php

// variable type

function taxonomy_vartype() {

	$labels = array(
		'name'                       => _x( 'Variable Types', 'Taxonomy General Name', 'cdc-taxonomies' ),
		'singular_name'              => _x( 'Variable Type', 'Taxonomy Singular Name', 'cdc-taxonomies' ),
		'menu_name'                  => __( 'Variable Types', 'cdc-taxonomies' ),
		'all_items'                  => __( 'All Types', 'cdc-taxonomies' ),
		'parent_item'                => __( 'Parent Type', 'cdc-taxonomies' ),
		'parent_item_colon'          => __( 'Parent Type:', 'cdc-taxonomies' ),
		'new_item_name'              => __( 'New Type Name', 'cdc-taxonomies' ),
		'add_new_item'               => __( 'Add New Type', 'cdc-taxonomies' ),
		'edit_item'                  => __( 'Edit Type', 'cdc-taxonomies' ),
		'update_item'                => __( 'Update Type', 'cdc-taxonomies' ),
		'view_item'                  => __( 'View Type', 'cdc-taxonomies' ),
		'separate_items_with_commas' => __( 'Separate items with commas', 'cdc-taxonomies' ),
		'add_or_remove_items'        => __( 'Add or remove items', 'cdc-taxonomies' ),
		'choose_from_most_used'      => __( 'Choose from the most used', 'cdc-taxonomies' ),
		'popular_items'              => __( 'Popular Items', 'cdc-taxonomies' ),
		'search_items'               => __( 'Search Items', 'cdc-taxonomies' ),
		'not_found'                  => __( 'Not Found', 'cdc-taxonomies' ),
		'no_terms'                   => __( 'No items', 'cdc-taxonomies' ),
		'items_list'                 => __( 'Items list', 'cdc-taxonomies' ),
		'items_list_navigation'      => __( 'Items list navigation', 'cdc-taxonomies' ),
	);
	$args = array(
		'labels'                     => $labels,
		'hierarchical'               => false,
		'public'                     => true,
		'show_ui'                    => true,
		'show_admin_column'          => true,
		'show_in_nav_menus'          => true,
		'show_tagcloud'              => true,
	);
	register_taxonomy( 'var-type', array( 'variable' ), $args );

}

add_action( 'init', 'taxonomy_vartype', 0 );

// resource category

function taxonomy_resourcecat() {

	$labels = array(
		'name'                       => _x( 'Categories', 'Taxonomy General Name', 'cdc-taxonomies' ),
		'singular_name'              => _x( 'Category', 'Taxonomy Singular Name', 'cdc-taxonomies' ),
		'menu_name'                  => __( 'Categories', 'cdc-taxonomies' ),
		'all_items'                  => __( 'All Categories', 'cdc-taxonomies' ),
		'parent_item'                => __( 'Parent Category', 'cdc-taxonomies' ),
		'parent_item_colon'          => __( 'Parent Category:', 'cdc-taxonomies' ),
		'new_item_name'              => __( 'New Category Name', 'cdc-taxonomies' ),
		'add_new_item'               => __( 'Add New Category', 'cdc-taxonomies' ),
		'edit_item'                  => __( 'Edit Category', 'cdc-taxonomies' ),
		'update_item'                => __( 'Update Category', 'cdc-taxonomies' ),
		'view_item'                  => __( 'View Category', 'cdc-taxonomies' ),
		'separate_items_with_commas' => __( 'Separate items with commas', 'cdc-taxonomies' ),
		'add_or_remove_items'        => __( 'Add or remove items', 'cdc-taxonomies' ),
		'choose_from_most_used'      => __( 'Choose from the most used', 'cdc-taxonomies' ),
		'popular_items'              => __( 'Popular Items', 'cdc-taxonomies' ),
		'search_items'               => __( 'Search Items', 'cdc-taxonomies' ),
		'not_found'                  => __( 'Not Found', 'cdc-taxonomies' ),
		'no_terms'                   => __( 'No items', 'cdc-taxonomies' ),
		'items_list'                 => __( 'Items list', 'cdc-taxonomies' ),
		'items_list_navigation'      => __( 'Items list navigation', 'cdc-taxonomies' ),
	);
	$args = array(
		'labels'                     => $labels,
		'hierarchical'               => true,
		'public'                     => true,
		'show_ui'                    => true,
		'show_admin_column'          => true,
		'show_in_nav_menus'          => true,
		'show_tagcloud'              => true,
	);
	register_taxonomy( 'resource-category', array( 'resource' ), $args );

}
add_action( 'init', 'taxonomy_resourcecat', 0 );

//

function taxonomy_keywords() {

	$labels = array(
		'name'                       => _x( 'Keywords', 'Taxonomy General Name', 'cdc-taxonomies' ),
		'singular_name'              => _x( 'Keyword', 'Taxonomy Singular Name', 'cdc-taxonomies' ),
		'menu_name'                  => __( 'Keywords', 'cdc-taxonomies' ),
		'all_items'                  => __( 'All Keywords', 'cdc-taxonomies' ),
		'parent_item'                => __( 'Parent Keyword', 'cdc-taxonomies' ),
		'parent_item_colon'          => __( 'Parent Keyword:', 'cdc-taxonomies' ),
		'new_item_name'              => __( 'New Keyword Name', 'cdc-taxonomies' ),
		'add_new_item'               => __( 'Add New Keyword', 'cdc-taxonomies' ),
		'edit_item'                  => __( 'Edit Keyword', 'cdc-taxonomies' ),
		'update_item'                => __( 'Update Keyword', 'cdc-taxonomies' ),
		'view_item'                  => __( 'View Keyword', 'cdc-taxonomies' ),
		'separate_items_with_commas' => __( 'Separate items with commas', 'cdc-taxonomies' ),
		'add_or_remove_items'        => __( 'Add or remove items', 'cdc-taxonomies' ),
		'choose_from_most_used'      => __( 'Choose from the most used', 'cdc-taxonomies' ),
		'popular_items'              => __( 'Popular Items', 'cdc-taxonomies' ),
		'search_items'               => __( 'Search Items', 'cdc-taxonomies' ),
		'not_found'                  => __( 'Not Found', 'cdc-taxonomies' ),
		'no_terms'                   => __( 'No items', 'cdc-taxonomies' ),
		'items_list'                 => __( 'Items list', 'cdc-taxonomies' ),
		'items_list_navigation'      => __( 'Items list navigation', 'cdc-taxonomies' ),
	);
	$args = array(
		'labels'                     => $labels,
		'hierarchical'               => false,
		'public'                     => true,
		'show_ui'                    => true,
		'show_admin_column'          => false,
		'show_in_nav_menus'          => true,
		'show_tagcloud'              => false,
	);
	register_taxonomy( 'keyword', array( 'case-study' ), $args );

}
add_action( 'init', 'taxonomy_keywords', 0 );
