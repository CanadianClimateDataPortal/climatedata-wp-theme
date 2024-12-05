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
        'hierarchical' => true,
        'public' => false,
        'show_ui' => true,
        'show_admin_column' => true,
        'show_in_nav_menus' => true,
        'show_tagcloud' => true,
        'show_in_rest' => true,
    ];
    register_taxonomy( 'topic', array( 'page', 'resource', 'app' ), $args );
}
add_action('init', 'taxonomy_topic', 10);

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
        'hierarchical' => true,
        'public' => false,
        'show_ui' => true,
        'show_admin_column' => false,
        'show_in_nav_menus' => true,
        'show_tagcloud' => true,
        'show_in_rest' => true,
    ];
    register_taxonomy( 'tech_level', array( 'page', 'resource', 'app' ), $args );
}
add_action('init', 'taxonomy_techlevel', 10);

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
        'hierarchical' => true,
        'public' => false,
        'show_ui' => true,
        'show_admin_column' => true,
        'show_in_nav_menus' => true,
        'show_tagcloud' => true,
        'show_in_rest' => true,
    ];
    register_taxonomy( 'sector', array( 'variable', 'page', 'resource', 'app' ), $args );
}
add_action('init', 'taxonomy_sector', 10);

/**
 * Module Taxonomy
 */
function taxonomy_module() {
	$labels = array(
		'name'                       => __( 'Modules', 'cdc-taxonomies' ),
		'singular_name'              => __( 'Module', 'cdc-taxonomies' ),
		'menu_name'                  => __( 'Modules', 'cdc-taxonomies' ),
		'all_items'                  => __( 'All Modules', 'cdc-taxonomies' ),
		'new_item_name'              => __( 'New Module Name', 'cdc-taxonomies' ),
		'add_new_item'               => __( 'Add New Module', 'cdc-taxonomies' ),
		'edit_item'                  => __( 'Edit Module', 'cdc-taxonomies' ),
		'update_item'                => __( 'Update Module', 'cdc-taxonomies' ),
		'view_item'                  => __( 'View Module', 'cdc-taxonomies' ),
		'separate_items_with_commas' => __( 'Separate items with commas', 'cdc-taxonomies'),
		'add_or_remove_items'        => __( 'Add or remove items', 'cdc-taxonomies' ),
		'choose_from_most_used'      => __( 'Choose from the most used', 'cdc-taxonomies' ),
		'popular_items'              => __( 'Popular Items', 'cdc-taxonomies' ),
		'search_items'               => __( 'Search Items', 'cdc-taxonomies' ),
		'not_found'                  => __( 'Not Found', 'cdc-taxonomies' ),
		'no_terms'                   => __( 'No items', 'cdc-taxonomies' ),
		'items_list'                 => __( 'Items list', 'cdc-taxonomies' ),
		'items_list_navigation'      => __( 'Items list navigation', 'cdc-taxonomies' ),
	);
	$args   = array(
		'labels'            => $labels,
		'hierarchical'      => true,
		'public'            => false,
		'show_ui'           => true,
		'show_admin_column' => true,
		'show_in_nav_menus' => true,
		'show_tagcloud'     => true,
		'show_in_rest'      => true,
	);
	register_taxonomy( 'module', array( 'page', 'resource' ), $args );
}
add_action( 'init', 'taxonomy_module', 10 );

/**
 * Hides the sector taxonomy metabox on the edit page of CPT 'variable'.
 *
 * @param WP_Screen $current_screen Current WP_Screen object.
 *
 * @return void
 */
function cdc_hide_tax_sector_metabox_cpt_variable( $current_screen ) {
	if ( ! is_object( $current_screen ) || 'variable' !== $current_screen->post_type ) {
		return;
	}

	remove_meta_box( 'tagsdiv-sector', 'variable', 'normal' );
}

add_action( 'current_screen', 'cdc_hide_tax_sector_metabox_cpt_variable' );

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
        'hierarchical' => true,
        'public' => false,
        'show_ui' => true,
        'show_admin_column' => true,
        'show_in_nav_menus' => true,
        'show_tagcloud' => true,
        'show_in_rest' => true,
    ];
    register_taxonomy('region', array( 'variable', 'page', 'resource', 'app' ), $args);
}
add_action('init', 'taxonomy_region', 10);

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
        'hierarchical'               => true,
        'public'                     => false,
        'show_ui'                    => true,
        'show_admin_column'          => true,
        'show_in_nav_menus'          => true,
        'show_tagcloud'              => true,
        'show_in_rest'               => true,
    );
    register_taxonomy( 'var-type', array( 'variable' ), $args );

}

add_action( 'init', 'taxonomy_vartype', 10 );

// variable dataset

function taxonomy_variabledataset() {

  $labels = array(
      'name'                       => _x( 'Variable Datasets', 'Taxonomy General Name', 'cdc-taxonomies' ),
      'singular_name'              => _x( 'Variable Dataset', 'Taxonomy Singular Name', 'cdc-taxonomies' ),
      'menu_name'                  => __( 'Variable Datasets', 'cdc-taxonomies' ),
      'all_items'                  => __( 'All Datasets', 'cdc-taxonomies' ),
      'parent_item'                => __( 'Parent Dataset', 'cdc-taxonomies' ),
      'parent_item_colon'          => __( 'Parent Dataset:', 'cdc-taxonomies' ),
      'new_item_name'              => __( 'New Dataset Name', 'cdc-taxonomies' ),
      'add_new_item'               => __( 'Add New Dataset', 'cdc-taxonomies' ),
      'edit_item'                  => __( 'Edit Dataset', 'cdc-taxonomies' ),
      'update_item'                => __( 'Update Dataset', 'cdc-taxonomies' ),
      'view_item'                  => __( 'View Dataset', 'cdc-taxonomies' ),
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
      'public'                     => false,
      'show_ui'                    => true,
      'show_admin_column'          => true,
      'show_in_nav_menus'          => false,
      'show_tagcloud'              => false,
      'show_in_rest'               => true,
  );
  register_taxonomy( 'variable-dataset', array( 'variable' ), $args );

}

add_action( 'init', 'taxonomy_variabledataset', 10 );

// News Author

function cd_register_tax_news_author() {
	$labels = array(
		'name'                       => _x( 'News Authors', 'Taxonomy General Name', 'cdc-taxonomies' ),
		'singular_name'              => _x( 'News Author', 'Taxonomy Singular Name', 'cdc-taxonomies' ),
		'menu_name'                  => __( 'News Authors', 'cdc-taxonomies' ),
		'all_items'                  => __( 'All News Authors', 'cdc-taxonomies' ),
		'parent_item'                => __( 'Parent News Author', 'cdc-taxonomies' ),
		'parent_item_colon'          => __( 'Parent News Author:', 'cdc-taxonomies' ),
		'new_item_name'              => __( 'New News Author Name', 'cdc-taxonomies' ),
		'add_new_item'               => __( 'Add New News Author', 'cdc-taxonomies' ),
		'edit_item'                  => __( 'Edit News Author', 'cdc-taxonomies' ),
		'update_item'                => __( 'Update News Author', 'cdc-taxonomies' ),
		'view_item'                  => __( 'View News Author', 'cdc-taxonomies' ),
		'separate_items_with_commas' => __( 'Separate news authors with commas', 'cdc-taxonomies' ),
		'add_or_remove_items'        => __( 'Add or remove news authors', 'cdc-taxonomies' ),
		'choose_from_most_used'      => __( 'Choose from the most used', 'cdc-taxonomies' ),
		'popular_items'              => __( 'Popular News Authors', 'cdc-taxonomies' ),
		'search_items'               => __( 'Search News Authors', 'cdc-taxonomies' ),
		'not_found'                  => __( 'Not Found', 'cdc-taxonomies' ),
		'no_terms'                   => __( 'No news authors', 'cdc-taxonomies' ),
		'items_list'                 => __( 'News Authors list', 'cdc-taxonomies' ),
		'items_list_navigation'      => __( 'News Authors list navigation', 'cdc-taxonomies' ),
	);

	$args = array(
		'labels'            => $labels,
		'hierarchical'      => true,
		'public'            => false,
		'show_ui'           => true,
		'show_admin_column' => true,
		'show_in_nav_menus' => true,
		'show_tagcloud'     => true,
		'show_in_rest'      => true,
	);

	register_taxonomy( 'news-author', array( 'post' ), $args );
}

add_action( 'init', 'cd_register_tax_news_author', 10 );

// News Topic

function cd_register_tax_news_topic() {
	$labels = array(
		'name'                       => _x( 'News Topics', 'Taxonomy General Name', 'cdc-taxonomies' ),
		'singular_name'              => _x( 'News Topic', 'Taxonomy Singular Name', 'cdc-taxonomies' ),
		'menu_name'                  => __( 'News Topics', 'cdc-taxonomies' ),
		'all_items'                  => __( 'All News Topics', 'cdc-taxonomies' ),
		'parent_item'                => __( 'Parent News Topic', 'cdc-taxonomies' ),
		'parent_item_colon'          => __( 'Parent News Topic:', 'cdc-taxonomies' ),
		'new_item_name'              => __( 'New News Topic Name', 'cdc-taxonomies' ),
		'add_new_item'               => __( 'Add New News Topic', 'cdc-taxonomies' ),
		'edit_item'                  => __( 'Edit News Topic', 'cdc-taxonomies' ),
		'update_item'                => __( 'Update News Topic', 'cdc-taxonomies' ),
		'view_item'                  => __( 'View News Topic', 'cdc-taxonomies' ),
		'separate_items_with_commas' => __( 'Separate news topics with commas', 'cdc-taxonomies' ),
		'add_or_remove_items'        => __( 'Add or remove news topics', 'cdc-taxonomies' ),
		'choose_from_most_used'      => __( 'Choose from the most used', 'cdc-taxonomies' ),
		'popular_items'              => __( 'Popular News Topics', 'cdc-taxonomies' ),
		'search_items'               => __( 'Search News Topics', 'cdc-taxonomies' ),
		'not_found'                  => __( 'Not Found', 'cdc-taxonomies' ),
		'no_terms'                   => __( 'No news topics', 'cdc-taxonomies' ),
		'items_list'                 => __( 'News Topics list', 'cdc-taxonomies' ),
		'items_list_navigation'      => __( 'News Topics list navigation', 'cdc-taxonomies' ),
	);

	$args = array(
		'labels'            => $labels,
		'hierarchical'      => true,
		'public'            => false,
		'show_ui'           => true,
		'show_admin_column' => true,
		'show_in_nav_menus' => true,
		'show_tagcloud'     => true,
		'show_in_rest'      => true,
	);

	register_taxonomy( 'news-topic', array( 'post' ), $args );
}

add_action( 'init', 'cd_register_tax_news_topic', 10 );