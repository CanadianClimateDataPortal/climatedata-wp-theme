<?php

//
// TEMPLATE TAG
//

function taxonomy_templatetag() {

	$labels = array(
		'name'                       => _x( 'Template Tags', 'Taxonomy General Name', 'fw-taxonomies' ),
		'singular_name'              => _x( 'Template Tag', 'Taxonomy Singular Name', 'fw-taxonomies' ),
		'menu_name'                  => __( 'Tags', 'fw-taxonomies' ),
		'all_items'                  => __( 'All Tags', 'fw-taxonomies' ),
		'parent_item'                => __( 'Parent Tag', 'fw-taxonomies' ),
		'parent_item_colon'          => __( 'Parent Tag:', 'fw-taxonomies' ),
		'new_item_name'              => __( 'New Tag Name', 'fw-taxonomies' ),
		'add_new_item'               => __( 'Add New Tag', 'fw-taxonomies' ),
		'edit_item'                  => __( 'Edit Tag', 'fw-taxonomies' ),
		'update_item'                => __( 'Update Tag', 'fw-taxonomies' ),
		'view_item'                  => __( 'View Tag', 'fw-taxonomies' ),
		'separate_items_with_commas' => __( 'Separate items with commas', 'fw-taxonomies' ),
		'add_or_remove_items'        => __( 'Add or remove items', 'fw-taxonomies' ),
		'choose_from_most_used'      => __( 'Choose from the most used', 'fw-taxonomies' ),
		'popular_items'              => __( 'Popular Items', 'fw-taxonomies' ),
		'search_items'               => __( 'Search Items', 'fw-taxonomies' ),
		'not_found'                  => __( 'Not Found', 'fw-taxonomies' ),
		'no_terms'                   => __( 'No items', 'fw-taxonomies' ),
		'items_list'                 => __( 'Items list', 'fw-taxonomies' ),
		'items_list_navigation'      => __( 'Items list navigation', 'fw-taxonomies' ),
	);
	$args = array(
		'labels'                     => $labels,
		'hierarchical'               => false,
		'public'                     => false,
		'show_ui'                    => true,
		'show_admin_column'          => true,
		'show_in_nav_menus'          => false,
		'show_tagcloud'              => false,
	);
	register_taxonomy( 'template_tag', array( 'fw-template' ), $args );

}
add_action( 'init', 'taxonomy_templatetag', 0 );
