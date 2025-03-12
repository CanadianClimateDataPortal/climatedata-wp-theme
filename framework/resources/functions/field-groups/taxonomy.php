<?php

//
// TAXONOMY TRANSLATION FIELDS
//

// REGISTER FIELD GROUP
// TODO: It is better to handle this via ACF instead of code.

$GLOBALS['fw_fields']['admin']['tax_term'] = array(
	'settings'    => array(
		'title' => 'Taxonomy Term',
	),
	'field_group' => array(
		'key'                   => 'admin_term',
		'title'                 => 'Taxonomy Term',
		'fields'                => array(),
		'location'              => array(
			array(
				array(
					'param'    => 'taxonomy',
					'operator' => '==',
					'value'    => 'all',
				),
			),
		),
		'menu_order'            => 0,
		'position'              => 'normal',
		'style'                 => 'default',
		'label_placement'       => 'top',
		'instruction_placement' => 'label',
		'hide_on_screen'        => '',
		'active'                => true,
		'description'           => '',
		'show_in_rest'          => 0,
	),
);

$fw_langs = get_option( 'fw_langs' );
if ( is_array( $fw_langs ) ) {
	foreach ( $fw_langs as $code => $lang ) {

		if ( 'en' === $code ) {
			array_push(
				$GLOBALS['fw_fields']['admin']['tax_term']['field_group']['fields'],
				array(
					'key'               => 'admin_term_tab_' . $code,
					'label'             => $lang['name'],
					'name'              => '',
					'type'              => 'tab',
					'conditional_logic' => 0,
					'placement'         => 'top',
					'endpoint'          => 0,
					'wrapper'           => array(
						'width' => '',
						'class' => '',
						'id'    => '',
					),
				),
				array(
					'key'               => 'admin_term_title',
					'label'             => 'Title',
					'name'              => 'title',
					'type'              => 'text',
					'required'          => 0,
					'conditional_logic' => 0,
					'wrapper'           => array(
						'width' => '',
						'class' => '',
						'id'    => '',
					),
				),
			);
		} else {
			array_push(
				$GLOBALS['fw_fields']['admin']['tax_term']['field_group']['fields'],
				array(
					'key'               => 'admin_term_tab_' . $code,
					'label'             => $lang['name'],
					'name'              => '',
					'type'              => 'tab',
					'conditional_logic' => 0,
					'placement'         => 'top',
					'endpoint'          => 0,
					'wrapper'           => array(
						'width' => '',
						'class' => '',
						'id'    => '',
					),
				),
				array(
					'key'               => 'admin_term_title_' . $code,
					'label'             => 'Title',
					'name'              => 'title_' . $code,
					'type'              => 'text',
					'required'          => 0,
					'conditional_logic' => 0,
					'wrapper'           => array(
						'width' => '',
						'class' => '',
						'id'    => '',
					),
					array(
						'key'               => 'admin_term_slug_' . $code,
						'label'             => 'Slug',
						'name'              => 'slug_' . $code,
						'type'              => 'text',
						'required'          => 0,
						'conditional_logic' => 0,
						'wrapper'           => array(
							'width' => '',
							'class' => '',
							'id'    => '',
						),
					),
					array(
						'key'               => 'admin_term_description_' . $code,
						'label'             => 'Description',
						'name'              => 'description_' . $code,
						'type'              => 'textarea',
						'required'          => 0,
						'conditional_logic' => 0,
						'rows'              => 4,
						'wrapper'           => array(
							'width' => '',
							'class' => '',
							'id'    => '',
						),
					),
				),
				array(
					'key'               => 'admin_term_description_' . $code,
					'label'             => 'Description',
					'name'              => 'description_' . $code,
					'type'              => 'textarea',
					'required'          => 0,
					'conditional_logic' => 0,
					'rows'              => 4,
					'wrapper'           => array(
						'width' => '',
						'class' => '',
						'id'    => '',
					),
				)
			);

		}
	}
}


// SANITIZE SLUGS ON SAVE

function sanitize_slug_on_tax_save ( $term_id, $tt_id, $update, $args ) {
	
	$debug = array();
	
	$this_term = get_term ( $term_id );
	$this_tax = $this_term->taxonomy;
	
	$debug['tax'] = $this_tax;
	$debug['term'] = $this_term;
	
	foreach ( get_option ( 'fw_langs') as $code => $lang ) {
		
		$this_title = get_field ( 'title_' . $code, $this_tax . '_' . $term_id );
		$this_slug = get_field ( 'slug_' . $code, $this_tax . '_' . $term_id );
		
		$debug['title_' . $code] = $this_title;
		$debug['slug_' . $code] = $this_slug;
	
		$new_title = '';
		$new_slug = '';
		
		if ( $this_slug != '' ) {
			// slug is set
			$new_slug = sanitize_title ( $this_slug );
		} elseif ( $this_title != '') {
			// slug is not set but title is
			$new_slug = sanitize_title ( $this_title );
		} else {
			// neither is set, use english
			$new_title = $this_term->name;
			$new_slug = $this_term->slug;
		}
		
		if ( $new_title != '' ) {
			$debug['changed_title'] = $new_title;
			// title has changed
			update_field ( 'title_' . $code, $new_title, $this_tax . '_' . $term_id );
		}
		
		if ( $new_slug != '' ) {
			$debug['changed_slug'] = $new_slug;
			// slug has changed
			update_field ( 'slug_' . $code, $new_slug, $this_tax . '_' . $term_id );
		}
	
	}
	
	update_option ( 'fw_test', array (
		'time' => date ( 'H:i:s' ),
		'debug' => $debug
	) );
	
}

foreach ( get_taxonomies ( array ( 'public' => true ) ) as $taxonomy ) {
	add_action ( 'saved_' . $taxonomy, 'sanitize_slug_on_tax_save', 10, 4 );
}

/*

alternate action to hook in acf/save_post instead of saved_$taxonomy - may end up being a better option

add_action('acf/save_post', 'my_acf_save_post');

function my_acf_save_post( $post_id ) {
	
	
	
	update_option ( 'fw_test', $_POST );
	
}*/
