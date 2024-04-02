<?php

// register a custom field for retrieval with
// REST request

register_meta ( 'post', 'title_fr', array (
	'object_subtype' => 'variable',
	'type' => 'string',
	'description' > 'Title (FR)',
	'single' => true,
	'show_in_rest' => true
) );

//
// GET DEFAULT VARIABLE
//

add_action ( 'rest_api_init', function () {
	
	register_rest_route ( 'cdc/v2', '/get_default_var/', array (
		'methods' => 'GET', 
		'callback' => 'cdc_get_default_var' 
	) );
	
});

function cdc_get_default_var () {
	
	$result = new WP_Query ( array (
		'post_type' => 'variable',
		'posts_per_page' => 1,
		'post_status' => 'publish',
		'meta_query' => array (
			array (
				'key' => 'var_names_$_variable',
				'value' => 'tx_max',
				'compare' => '='
			)
		)
	) );
	
	if ( $result->have_posts() ) {
		while ( $result->have_posts() ) {
			$result->the_post();
			
			return get_the_ID();
			
		}
	} else {
		return '{}';
	}
	
	// return $args;
	
}

add_filter ( 'rest_variable_query', 'cdc_get_default_var', 10, 2 );

function wpza_replace_repeater_field( $where ) {
	$where = str_replace( "meta_key = 'var_names_$", "meta_key LIKE 'var_names_%", $where );
	return $where;
}

add_filter ( 'posts_where', 'wpza_replace_repeater_field' );

// get variable data

function cdc_get_var ( $args, $request ) {
	
	if ( isset ( $request['var'] ) ) {
		$args['meta_key'] = 'var_name';
		$args['meta_value'] = $request['var'];
	}
	
	return $args;
	
}

add_filter ( 'rest_variable_query', 'cdc_get_var', 10, 2 );

// format WYSIWYG fields in REST requests

add_filter ( 'acf/rest/format_value_for_rest/name=var_description', 'cdc_format_wysiwyg_in_rest', 10, 5);
add_filter ( 'acf/rest/format_value_for_rest/name=var_tech_description_fr', 'cdc_format_wysiwyg_in_rest', 10, 5);
add_filter ( 'acf/rest/format_value_for_rest/name=var_description', 'cdc_format_wysiwyg_in_rest', 10, 5);
add_filter ( 'acf/rest/format_value_for_rest/name=var_tech_description_fr', 'cdc_format_wysiwyg_in_rest', 10, 5);

function cdc_format_wysiwyg_in_rest ($value_formatted, $post_id, $field, $value, $format) {
	
	return apply_filters ( 'the_content', $value_formatted );
	
}
