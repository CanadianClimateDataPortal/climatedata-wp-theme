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

function cdc_get_var ( $args, $request ) {
	
	if ( isset ( $request['var'] ) ) {
		$args['meta_key'] = 'var_name';
		$args['meta_value'] = $request['var'];
	}
	
	return $args;
	
}

add_filter ( 'rest_variable_query', 'cdc_get_var', 10, 2 );