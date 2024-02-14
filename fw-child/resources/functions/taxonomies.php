<?php

// resource category
/*

replaced with 'topic'

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
		'show_in_rest'               => true,
	);
	register_taxonomy( 'resource-category', array( 'resource', 'interactive' ), $args );

}
add_action( 'init', 'taxonomy_resourcecat', 0 );
*/

// topic

function taxonomy_topic()
{
    $labels = [
        'name' => _x('Topics', 'Taxonomy General Name', 'cdc-taxonomies'),
        'singular_name' => _x(
            'Topic',
            'Taxonomy Singular Name',
            'cdc-taxonomies'
        ),
        'menu_name' => __('Topics', 'cdc-taxonomies'),
        'all_items' => __('All Topics', 'cdc-taxonomies'),
        'parent_item' => __('Parent Topic', 'cdc-taxonomies'),
        'parent_item_colon' => __('Parent Topic:', 'cdc-taxonomies'),
        'new_item_name' => __('New Topic Name', 'cdc-taxonomies'),
        'add_new_item' => __('Add New Topic', 'cdc-taxonomies'),
        'edit_item' => __('Edit Topic', 'cdc-taxonomies'),
        'update_item' => __('Update Topic', 'cdc-taxonomies'),
        'view_item' => __('View Topic', 'cdc-taxonomies'),
        'separate_items_with_commas' => __(
            'Separate items with commas',
            'cdc-taxonomies'
        ),
        'add_or_remove_items' => __('Add or remove items', 'cdc-taxonomies'),
        'choose_from_most_used' => __(
            'Choose from the most used',
            'cdc-taxonomies'
        ),
        'popular_items' => __('Popular Items', 'cdc-taxonomies'),
        'search_items' => __('Search Items', 'cdc-taxonomies'),
        'not_found' => __('Not Found', 'cdc-taxonomies'),
        'no_terms' => __('No items', 'cdc-taxonomies'),
        'items_list' => __('Items list', 'cdc-taxonomies'),
        'items_list_navigation' => __(
            'Items list navigation',
            'cdc-taxonomies'
        ),
    ];
    $args = [
        'labels' => $labels,
        'hierarchical' => false,
        'public' => true,
        'show_ui' => true,
        'show_admin_column' => true,
        'show_in_nav_menus' => true,
        'show_tagcloud' => true,
        'show_in_rest' => true,
    ];
    register_taxonomy('topic', ['resource'], $args);
}
add_action('init', 'taxonomy_topic', 0);

// technical level

function taxonomy_techlevel()
{
    $labels = [
        'name' => _x(
            'Technical Levels',
            'Taxonomy General Name',
            'cdc-taxonomies'
        ),
        'singular_name' => _x(
            'Technical Level',
            'Taxonomy Singular Name',
            'cdc-taxonomies'
        ),
        'menu_name' => __('Technical Levels', 'cdc-taxonomies'),
        'all_items' => __('All Levels', 'cdc-taxonomies'),
        'parent_item' => __('Parent Level', 'cdc-taxonomies'),
        'parent_item_colon' => __('Parent Level:', 'cdc-taxonomies'),
        'new_item_name' => __('New Level Name', 'cdc-taxonomies'),
        'add_new_item' => __('Add New Level', 'cdc-taxonomies'),
        'edit_item' => __('Edit Level', 'cdc-taxonomies'),
        'update_item' => __('Update Level', 'cdc-taxonomies'),
        'view_item' => __('View Level', 'cdc-taxonomies'),
        'separate_items_with_commas' => __(
            'Separate items with commas',
            'cdc-taxonomies'
        ),
        'add_or_remove_items' => __('Add or remove items', 'cdc-taxonomies'),
        'choose_from_most_used' => __(
            'Choose from the most used',
            'cdc-taxonomies'
        ),
        'popular_items' => __('Popular Items', 'cdc-taxonomies'),
        'search_items' => __('Search Items', 'cdc-taxonomies'),
        'not_found' => __('Not Found', 'cdc-taxonomies'),
        'no_terms' => __('No items', 'cdc-taxonomies'),
        'items_list' => __('Items list', 'cdc-taxonomies'),
        'items_list_navigation' => __(
            'Items list navigation',
            'cdc-taxonomies'
        ),
    ];
    $args = [
        'labels' => $labels,
        'hierarchical' => false,
        'public' => true,
        'show_ui' => true,
        'show_admin_column' => false,
        'show_in_nav_menus' => true,
        'show_tagcloud' => true,
        'show_in_rest' => true,
    ];
    register_taxonomy('tech_level', ['resource'], $args);
}
add_action('init', 'taxonomy_techlevel', 0);

// sector

function taxonomy_sector()
{
    $labels = [
        'name' => _x('Sectors', 'Taxonomy General Name', 'cdc-taxonomies'),
        'singular_name' => _x(
            'Sector',
            'Taxonomy Singular Name',
            'cdc-taxonomies'
        ),
        'menu_name' => __('Sectors', 'cdc-taxonomies'),
        'all_items' => __('All Sectors', 'cdc-taxonomies'),
        'parent_item' => __('Parent Sector', 'cdc-taxonomies'),
        'parent_item_colon' => __('Parent Sector:', 'cdc-taxonomies'),
        'new_item_name' => __('New Sector Name', 'cdc-taxonomies'),
        'add_new_item' => __('Add New Sector', 'cdc-taxonomies'),
        'edit_item' => __('Edit Sector', 'cdc-taxonomies'),
        'update_item' => __('Update Sector', 'cdc-taxonomies'),
        'view_item' => __('View Sector', 'cdc-taxonomies'),
        'separate_items_with_commas' => __(
            'Separate items with commas',
            'cdc-taxonomies'
        ),
        'add_or_remove_items' => __('Add or remove items', 'cdc-taxonomies'),
        'choose_from_most_used' => __(
            'Choose from the most used',
            'cdc-taxonomies'
        ),
        'popular_items' => __('Popular Items', 'cdc-taxonomies'),
        'search_items' => __('Search Items', 'cdc-taxonomies'),
        'not_found' => __('Not Found', 'cdc-taxonomies'),
        'no_terms' => __('No items', 'cdc-taxonomies'),
        'items_list' => __('Items list', 'cdc-taxonomies'),
        'items_list_navigation' => __(
            'Items list navigation',
            'cdc-taxonomies'
        ),
    ];
    $args = [
        'labels' => $labels,
        'hierarchical' => false,
        'public' => true,
        'show_ui' => true,
        'show_admin_column' => true,
        'show_in_nav_menus' => true,
        'show_tagcloud' => true,
        'show_in_rest' => true,
    ];
    register_taxonomy('sector', ['variable', 'resource'], $args);
}
add_action('init', 'taxonomy_sector', 0);

// region

function taxonomy_region()
{
    $labels = [
        'name' => _x('Regions', 'Taxonomy General Name', 'cdc-taxonomies'),
        'singular_name' => _x(
            'Region',
            'Taxonomy Singular Name',
            'cdc-taxonomies'
        ),
        'menu_name' => __('Regions', 'cdc-taxonomies'),
        'all_items' => __('All Regions', 'cdc-taxonomies'),
        'parent_item' => __('Parent Region', 'cdc-taxonomies'),
        'parent_item_colon' => __('Parent Region:', 'cdc-taxonomies'),
        'new_item_name' => __('New Region Name', 'cdc-taxonomies'),
        'add_new_item' => __('Add New Region', 'cdc-taxonomies'),
        'edit_item' => __('Edit Region', 'cdc-taxonomies'),
        'update_item' => __('Update Region', 'cdc-taxonomies'),
        'view_item' => __('View Region', 'cdc-taxonomies'),
        'separate_items_with_commas' => __(
            'Separate items with commas',
            'cdc-taxonomies'
        ),
        'add_or_remove_items' => __('Add or remove items', 'cdc-taxonomies'),
        'choose_from_most_used' => __(
            'Choose from the most used',
            'cdc-taxonomies'
        ),
        'popular_items' => __('Popular Items', 'cdc-taxonomies'),
        'search_items' => __('Search Items', 'cdc-taxonomies'),
        'not_found' => __('Not Found', 'cdc-taxonomies'),
        'no_terms' => __('No items', 'cdc-taxonomies'),
        'items_list' => __('Items list', 'cdc-taxonomies'),
        'items_list_navigation' => __(
            'Items list navigation',
            'cdc-taxonomies'
        ),
    ];
    $args = [
        'labels' => $labels,
        'hierarchical' => false,
        'public' => true,
        'show_ui' => true,
        'show_admin_column' => true,
        'show_in_nav_menus' => true,
        'show_tagcloud' => true,
        'show_in_rest' => true,
    ];
    register_taxonomy('region', ['resource'], $args);
}
add_action('init', 'taxonomy_region', 0);

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
        'show_in_rest'               => true,
    );
    register_taxonomy( 'var-type', array( 'variable' ), $args );

}

add_action( 'init', 'taxonomy_vartype', 0 );
