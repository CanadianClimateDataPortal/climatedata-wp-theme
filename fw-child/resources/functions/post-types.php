<?php

// variables

function posttype_variable()
{
    $labels = [
        'name' => _x('Variables', 'Post Type General Name', 'cdc-post-types'),
        'singular_name' => _x(
            'Variable',
            'Post Type Singular Name',
            'cdc-post-types'
        ),
        'menu_name' => __('Variables', 'cdc-post-types'),
        'name_admin_bar' => __('Variable', 'cdc-post-types'),
        'archives' => __('Variable Archives', 'cdc-post-types'),
        'attributes' => __('Variable Attributes', 'cdc-post-types'),
        'parent_item_colon' => __('Parent Variable:', 'cdc-post-types'),
        'all_items' => __('All Variables', 'cdc-post-types'),
        'add_new_item' => __('Add New Variable', 'cdc-post-types'),
        'add_new' => __('Add New', 'cdc-post-types'),
        'new_item' => __('New Variable', 'cdc-post-types'),
        'edit_item' => __('Edit Variable', 'cdc-post-types'),
        'update_item' => __('Update Variable', 'cdc-post-types'),
        'view_item' => __('View Variable', 'cdc-post-types'),
        'view_items' => __('View Variables', 'cdc-post-types'),
        'search_items' => __('Search Variable', 'cdc-post-types'),
        'not_found' => __('Not found', 'cdc-post-types'),
        'not_found_in_trash' => __('Not found in Trash', 'cdc-post-types'),
        'featured_image' => __('Featured Image', 'cdc-post-types'),
        'set_featured_image' => __('Set featured image', 'cdc-post-types'),
        'remove_featured_image' => __(
            'Remove featured image',
            'cdc-post-types'
        ),
        'use_featured_image' => __('Use as featured image', 'cdc-post-types'),
        'insert_into_item' => __('Insert into item', 'cdc-post-types'),
        'uploaded_to_this_item' => __(
            'Uploaded to this item',
            'cdc-post-types'
        ),
        'items_list' => __('Items list', 'cdc-post-types'),
        'items_list_navigation' => __(
            'Items list navigation',
            'cdc-post-types'
        ),
        'filter_items_list' => __('Filter items list', 'cdc-post-types'),
    ];
    $args = [
        'label' => __('Variable', 'cdc-post-types'),
        'description' => __('Post Type Description', 'cdc-post-types'),
        'labels' => $labels,
        'supports' => [
            'title',
            'editor',
            'custom-fields',
            'page-attributes',
            'thumbnail',
            'revisions',
        ],
        'hierarchical' => true,
        'public' => true,
        'show_ui' => true,
        'show_in_menu' => true,
        'menu_position' => 25,
        'menu_icon' => 'dashicons-admin-settings',
        'show_in_admin_bar' => true,
        'show_in_nav_menus' => true,
        'can_export' => true,
        'has_archive' => true,
        'exclude_from_search' => false,
        'publicly_queryable' => true,
        'capability_type' => 'page',
        'show_in_rest' => true,
    ];
    register_post_type('variable', $args);
}
add_action('init', 'posttype_variable', 0);

// training resources

function posttype_resource()
{
    $labels = [
        'name' => _x(
            'Training Resources',
            'Post Type General Name',
            'cdc-post-types'
        ),
        'singular_name' => _x(
            'Training Resource',
            'Post Type Singular Name',
            'cdc-post-types'
        ),
        'menu_name' => __('Training Resources', 'cdc-post-types'),
        'name_admin_bar' => __('Resource', 'cdc-post-types'),
        'archives' => __('Resource Archives', 'cdc-post-types'),
        'attributes' => __('Resource Attributes', 'cdc-post-types'),
        'parent_item_colon' => __('Parent Resource:', 'cdc-post-types'),
        'all_items' => __('All Resources', 'cdc-post-types'),
        'add_new_item' => __('Add New Resource', 'cdc-post-types'),
        'add_new' => __('Add New', 'cdc-post-types'),
        'new_item' => __('New Resource', 'cdc-post-types'),
        'edit_item' => __('Edit Resource', 'cdc-post-types'),
        'update_item' => __('Update Resource', 'cdc-post-types'),
        'view_item' => __('View Resource', 'cdc-post-types'),
        'view_items' => __('View Resources', 'cdc-post-types'),
        'search_items' => __('Search Resource', 'cdc-post-types'),
        'not_found' => __('Not found', 'cdc-post-types'),
        'not_found_in_trash' => __('Not found in Trash', 'cdc-post-types'),
        'featured_image' => __('Featured Image', 'cdc-post-types'),
        'set_featured_image' => __('Set featured image', 'cdc-post-types'),
        'remove_featured_image' => __(
            'Remove featured image',
            'cdc-post-types'
        ),
        'use_featured_image' => __('Use as featured image', 'cdc-post-types'),
        'insert_into_item' => __('Insert into item', 'cdc-post-types'),
        'uploaded_to_this_item' => __(
            'Uploaded to this item',
            'cdc-post-types'
        ),
        'items_list' => __('Items list', 'cdc-post-types'),
        'items_list_navigation' => __(
            'Items list navigation',
            'cdc-post-types'
        ),
        'filter_items_list' => __('Filter items list', 'cdc-post-types'),
    ];
    $args = [
        'label' => __('Training Resource', 'cdc-post-types'),
        'description' => __('Post Type Description', 'cdc-post-types'),
        'labels' => $labels,
        'supports' => [
            'title',
            'thumbnail',
            'custom-fields',
            'revisions',
            'excerpt',
            'page-attributes',
        ],
        'hierarchical' => true,
        'public' => true,
        'show_ui' => true,
        'show_in_menu' => true,
        'menu_position' => 23,
        'show_in_admin_bar' => true,
        'show_in_nav_menus' => true,
        'can_export' => true,
        'has_archive' => true,
        'exclude_from_search' => false,
        'publicly_queryable' => true,
        'capability_type' => 'page',
        'show_in_rest' => true,
    ];
    register_post_type('resource', $args);
}

add_action('init', 'posttype_resource', 0);
