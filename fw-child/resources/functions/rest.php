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

//
// GET VAR DATA
//

function cdc_get_var ( $args, $request ) {
	
	if ( isset ( $request['var'] ) ) {
		$args['meta_key'] = 'var_name';
		$args['meta_value'] = $request['var'];
	}
	
	return $args;
	
}

add_filter ( 'rest_variable_query', 'cdc_get_var', 10, 2 );

//
//
//

add_action ( 'rest_api_init', function () {
	
	register_rest_route ( 'cdc/v2', '/finch_submit/', array (
		'methods' => 'POST', 
		'callback' => 'cdc_finch_submit' 
	) );
	
});

function cdc_finch_submit () {
	
	include_once ( locate_template ( 'resources/php/securimage/securimage.php' ) );
	include_once ( locate_template ( 'resources/php/mailchimp.php' ) );
	
	$securimage = new Securimage();
	
	if ( isset ( $_POST['namespace'] ) ) {
		$securimage->setNamespace(sanitize_title_with_dashes($_POST['namespace']));
	}
	
	$submit_url = $GLOBALS['vars']['pavics_url'] . $_POST['submit_url'];
	$data_url = "https:" . $GLOBALS['vars']['data_url'];
	
	$result = '{ "status": "captcha failed" }';
	
	if ( isset ( $_POST['captcha_code'] ) ) {
	
		if ( $securimage->check( $_POST['captcha_code'] ) == true ) {
			
			// if the request was sent with required vars
			if (
				isset ( $_POST['required_variables'] ) && 
				isset ( $_POST['stations'] )
			) {
				
				$inputs = [];
				
				foreach ($_POST['required_variables'] as $variable) {
					$type = strpos($variable, "tas") !== false ? 'T':'P';
					$inputs[] = ['id' => $variable, 'href' => $data_url . "/download-ahccd?format=netcdf&variable_type_filter=$type&stations={$_POST['stations']}"];
				}
				
				$_POST['request_data']['inputs'] = array_merge($_POST['request_data']['inputs'], $inputs);
				
			}
			
			// initialize cURL request
			$request = curl_init ( $submit_url );
			
			// cURL options
			curl_setopt ( $request, CURLOPT_CUSTOMREQUEST, 'POST' );
			curl_setopt ( $request, CURLOPT_POSTFIELDS, str_replace ( "\\\\\\", "\\", json_encode ( $_POST['request_data'] ) ) );
			curl_setopt ( $request, CURLOPT_HTTPHEADER, array('Content-Type:application/json') );
			curl_setopt ( $request, CURLOPT_RETURNTRANSFER, true );

			// exec
			$result = curl_exec($request);
			curl_close($request);
			
			if ( $_POST['signup'] == 'true' ) {
				mailchimp_register ( $_POST['request_data']['notification_email'] );
			}
			
		} // captcha check
	} // captcha isset
	
	echo $result;

}

//

// format WYSIWYG fields in REST requests

add_filter ( 'acf/rest/format_value_for_rest/name=var_description', 'cdc_format_wysiwyg_in_rest', 10, 5);
add_filter ( 'acf/rest/format_value_for_rest/name=var_tech_description_fr', 'cdc_format_wysiwyg_in_rest', 10, 5);
add_filter ( 'acf/rest/format_value_for_rest/name=var_description', 'cdc_format_wysiwyg_in_rest', 10, 5);
add_filter ( 'acf/rest/format_value_for_rest/name=var_tech_description_fr', 'cdc_format_wysiwyg_in_rest', 10, 5);

function cdc_format_wysiwyg_in_rest ($value_formatted, $post_id, $field, $value, $format) {
	
	return apply_filters ( 'the_content', $value_formatted );
	
}


function cdc_var_types_field () {

	register_rest_field ( 'variable',
		'var_types',
		array (
			'get_callback' => 'cdc_list_var_types',
			'update_callback' => null,
			'schema' => null,
		)
	);
	
}

add_action ( 'rest_api_init', 'cdc_var_types_field' );

function cdc_list_var_types ( $object, $field_name, $request ) {

	$term_list = array();

	$terms = get_the_terms ( $object['id'], 'var-type' );

	foreach ($terms as $term) {
		$term_list[] = $term->name;
	}

	return $term_list;
	
}

//
// IDF LINKS
//

// This script searches for IDF files matching the idf GET parameter and returns a JSON for the Frontend

add_action ( 'rest_api_init', function () {
	
	register_rest_route ( 'cdc/v2', '/get_idf_url/', array (
		'methods' => 'GET', 
		'callback' => 'cdc_get_idf_url' 
	) );
	
} );

function cdc_get_idf_url () {

	if (
		( !isset ( $_GET['data'] ) || $_GET['data'] == '' ) ||
		( !isset ( $_GET['station'] ) || $_GET['station'] == '' )
	) {
		return 'no file';
	}
		
	// ensure input is alphanumeric
	if ( !preg_match ( '/^[a-zA-Z0-9]+$/', $_GET['data'] ) ) {
		return 'invalid';
	}
	
	$result = array (
		'glob' => get_stylesheet_directory() . '/resources/app/idf/' . $_GET['data'] . '/*' . $_GET['station'] . '*',
		'files' => []
	);
	
	$glob = glob ( get_stylesheet_directory() . '/resources/app/idf/' . $_GET['data'] . '/*' . $_GET['station'] . '*' );
	
	if ( !empty ( $glob ) ) {
		foreach ( $glob as $file ) {
			$result['files'][] = str_replace ( get_stylesheet_directory(), get_stylesheet_directory_uri(), $file );
		}
	}
	
	return $result;
	
}

