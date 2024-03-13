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
