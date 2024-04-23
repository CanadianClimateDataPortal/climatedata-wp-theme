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

function wpza_replace_repeater_field ( $where ) {
	$where = str_replace( "meta_key = 'var_names_$", "meta_key LIKE 'var_names_%", $where );
	return $where;
}

add_filter ( 'posts_where', 'wpza_replace_repeater_field' );

//
// GET RELATED VARS
//

add_action ( 'rest_api_init', function () {
	
	register_rest_route ( 'cdc/v2', '/related/', array (
		'methods' => 'GET', 
		'callback' => 'cdc_get_related_content' 
	) );
	
});

function cdc_get_related_content () {
	
	$result = array(
		'vars' => [],
		'sectors' => [],
		'training' => []
	);
	
	// VARIABLES
		
	if ( isset ( $_GET['var_id'] ) ) {
		
		foreach ( get_field ( 'related_vars', $_GET['var_id'] ) as $related_ID ) {
			
			$result['vars'][] = array (
				'id' => $related_ID,
				'title' => get_the_title ( $related_ID ),
				'url' => get_permalink ( $related_ID )
			);
			
		}
		
	}
	
	// SECTORS
	
	$sectors = get_the_terms ( $_GET['var_id'], 'sector' );
	
	foreach ( $sectors as $sector ) {
		$result['sectors'][] = array (
			'id' => $sector->term_id,
			'title' => $sector->name,
			'url' => get_term_link ( $sector->term_id, 'sector' )
		);
	}
	
	// TRAINING
	
	$lz_query = get_posts ( array ( 
		'post_type' => 'resource',
		'posts_per_page' => 3,
		'post_parent' => 0,
		'orderby' => 'rand',
		'post_status' => 'publish',
		'meta_query' => array (
			array (
				'key' => 'related_vars',
				'value' => $_GET['var_id'],
				'compare' => 'LIKE'
			)
		)
	) );
	
	foreach ( $lz_query as $lz_post ) {
		$result['training'][] = array (
			'id' => $lz_post->ID,
			'title' => get_the_title ( $lz_post->ID ),
			'url' => get_permalink ( $lz_post->ID )
		);
	}
	
	return $result;
	
}

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
// SUBMIT FINCH REQUEST
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
	
	return do_shortcode ( apply_filters ( 'the_content', $value_formatted ) );
	
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
// LOCATION FUNCTIONS
//

// GET LOCATION BY ID

add_action ( 'rest_api_init', function () {
	
	register_rest_route ( 'cdc/v2', '/get_location_by_id/', array (
		'methods' => 'GET', 
		'callback' => 'cdc_get_location_by_id' 
	) );
	
});

function cdc_get_location_by_id () {

	if ( isset ( $_GET['loc'] ) && !empty ( $_GET['loc'] )) {

		// remove possible bad stuff
		$loc = preg_replace ( "/[^a-zA-Z0-9]+/", "", $_GET['loc'] );
		
		$term_append = ( $GLOBALS['fw']['current_lang_code'] == 'fr' ) ? '_fr' : '';
		
		$columns = array (
			"id_code as geo_id",
			"geo_name",
			"gen_term" . $term_append . " as generic_term",
			"location",
			"province" . $term_append . " as province",
			"lat",
			"lon"
		);

		require_once locate_template ( 'resources/app/db.php' );
		
		$row = [];
		
		$main_query = mysqli_query ( $GLOBALS['vars']['con'], "SELECT " . implode ( ", ", $columns ) . " FROM all_areas WHERE id_code = '" . $loc . "'" ) or die ( mysqli_error ( $GLOBALS['vars']['con'] ) );

		if ($main_query->num_rows > 0) {
			$row = mysqli_fetch_assoc ( $main_query );
	
			$row['coords'] = [ floatval ( $row['lat'] ), floatval ( $row['lon'] ) ];
			$row['lat'] = floatval ( $row['lat'] );
			$row['lng'] = floatval ( $row['lon'] );
			$row['province_short'] = short_province ( $row['province'] );
			$row['title'] = $row['geo_name'] . ', ' . $row['province_short'];
		}
		
		echo json_encode ( $row );
	
	} else {
	
		echo '[]';

	}

}

// GET LOCATION BY COORDS

add_action ( 'rest_api_init', function () {
	
	register_rest_route ( 'cdc/v2', '/get_location_by_coords/', array (
		'methods' => 'GET', 
		'callback' => 'cdc_get_location_by_coords' 
	) );
	
});

function cdc_get_location_by_coords () {
	
	if (
		( isset ( $_GET['lat'] ) && !empty ( $_GET['lat'] ) ) &&
		( isset ( $_GET['lng'] ) && !empty ( $_GET['lng'] ) )
	) {
		
		if ( locate_template ( 'resources/app/db.php' ) == '' ) {
			
			echo json_encode ( array (
				'lat' => $lat,
				'lng' => $lng,
				'coords' => [ $lat, $lng ],
				'geo_id' => '',
				'geo_name' => __ ( 'Point', 'cdc' ),
				'title' => __ ( 'Point', 'cdc' ) . ' (' . number_format ( $lat, 4, '.', '') . ', ' . number_format ( $lng, 4, '.', '') . ')'
			) );
			
		} else {
			
			require_once locate_template ( 'resources/app/db.php' );
			
			$lat = floatval ( $_GET['lat'] );
			$lng = floatval ( $_GET['lng'] );
			
			// add _fr if needed
			$term_append = ( $GLOBALS['fw']['current_lang_code'] == 'fr' ) ? '_fr' : '';
			
			$columns = array (
				"all_areas.id_code as geo_id", 
				"geo_name", 
				"gen_term" . $term_append . " as generic_term", 
				"location", 
				"province" . $term_append, 
				"lat", 
				"lon"
			);
			
			// $columns = implode ( ",", $columns );
			$join = "";
			
			if ( $_GET['sealevel'] == 'true' ) {
				$join = "JOIN all_areas_sealevel ON (all_areas.id_code=all_areas_sealevel.id_code)";
			}
	
			$ranges = [ 0.05, 0.1, 0.2 ];
			$preferred_terms = [ 'Community', 'Metropolitan Area' ];
			$found_community = false;
			
			// gradually increase the range until we find a community
			
			foreach ( $ranges as $range ) {
				
				if ( $found_community == false ) {
					$main_query = mysqli_query($GLOBALS['vars']['con'], "SELECT " . implode(",", $columns) . "
					, DISTANCE_BETWEEN($lat, $lng, lat,lon) as distance
					FROM all_areas
					$join
					WHERE lat BETWEEN " . (round($lat, 2) - $range) . " AND " . (round($lat, 2) + $range) . "
					AND lon BETWEEN " . (round($lng, 2) - $range) . " AND " . (round($lng, 2) + $range) . "
					AND gen_term NOT IN ('Railway Point', 'Railway Junction', 'Urban Community', 'Administrative Sector')
					ORDER BY DISTANCE
					LIMIT 50");// or die (mysqli_error($GLOBALS['vars']['con']));
					
					if ($main_query->num_rows > 0) {
						
						while ( $row = mysqli_fetch_assoc ( $main_query ) ) {
							
							if ( in_array ( $row['generic_term'], $preferred_terms ) ) {
								$result = $row;
								
								// might be good to know
								// what range is the community in from the click
								$result['range'] = $range;
								
								// send back the original coords
								$result['coords'] = [ $lat, $lng ];
								
								// lon -> lng
								$result['lng'] = $result['lon'];
								
								// province abbreviation
								$result['province_short'] = short_province ( $result['province'] );
								
								// nice name
								$result['title'] = $result['geo_name'] . ', ' . $result['province_short'];
								
								$found_community = true;
								
								break;
							}
						}
						
					}
					
				}
				
			}
			
			if ( $found_community == true ) {
				
				// found a community in range
				echo json_encode ( $result );
				
			} else {
				
				// no preferred results, grab the nearest one
	
				// range of coordinates to search between
				$range = 0.1;
				
				$main_query = mysqli_query($GLOBALS['vars']['con'], "SELECT " . implode(",", $columns) . "
				, DISTANCE_BETWEEN($lat, $lng, lat,lon) as distance
				FROM all_areas
				$join
				WHERE lat BETWEEN " . (round($lat, 2) - $range) . " AND " . (round($lat, 2) + $range) . "
				AND lon BETWEEN " . (round($lng, 2) - $range) . " AND " . (round($lng, 2) + $range) . "
				AND gen_term NOT IN ('Railway Point', 'Railway Junction', 'Urban Community', 'Administrative Sector')
				ORDER BY DISTANCE
				LIMIT 1");// or die (mysqli_error($GLOBALS['vars']['con']));
				
				if ($main_query->num_rows > 0) {
					
					$result = mysqli_fetch_assoc ( $main_query );
					
					$result['coords'] = [ $lat, $lng ];
					$result['lng'] = $result['lon'];
					$result['province_short'] = short_province ( $result['province'] );
					$result['title'] = $result['geo_name'] . ', ' . $result['province_short'];
					
					echo json_encode ( $result );
					
				} else {
					
					echo json_encode ( array (
						'lat' => $lat,
						'lng' => $lng,
						'coords' => [ $lat, $lng ],
						'geo_name' => __ ( 'Point', 'cdc' ),
						'title' => __ ( 'Point', 'cdc' ) . ' (' . number_format ( $lat, 4, '.', '') . ', ' . number_format ( $lng, 4, '.', '') . ')'
					) );
					
				}
				
			}
			
		} // if db.php
	
	} // if $_GET

}

// LOCATION SEARCH

add_action ( 'rest_api_init', function () {
	
	register_rest_route ( 'cdc/v2', '/location_search/', array (
		'methods' => 'GET', 
		'callback' => 'cdc_location_search' 
	) );
	
});

function cdc_location_search() {
	
	if ( locate_template ( 'resources/app/db.php' ) == '' ) {
		
		echo json_encode ( array (
			'error' => 'no db connection'
		) );
		
	} else {
		
		require_once locate_template ( 'resources/app/db.php' );
		
		$con = $GLOBALS['vars']['con'];
		
		$get_sSearch = isset($_GET['q']) ? $_GET['q'] : '';
		$post_draw = isset($_POST['draw']) ? $_POST['draw'] : '';
		
		if (isset ( $GLOBALS['fw']['current_lang_code'] ) ){
			$get_lang = $GLOBALS['fw']['current_lang_code'];
		} else {
			$get_lang = 'en';
		}
		
		// the columns to be filtered, ordered and returned
		// must be in the same order as displayed in the table
		
		$columns = array (
			"id_code",
			"geo_name",
			"gen_term",
			"location",
			"province",
			"lat",
			"lon"
		);
		
		if ( $get_lang == 'fr' ) {
			$columns = array (
				"id_code",
				"geo_name",
				"gen_term_fr",
				"location",
				"province_fr",
				"lat",
				"lon"
			);
		}
		
		$search_columns = [ "geo_name" ];
		
		$table = "all_areas";
		$joins = "";
		
		$get_sSearch = str_replace('`','\'', $get_sSearch);
		
		// filtering
		$sql_where = "where gen_term not in ('Administrative Region', 'Province', 'Territory') and geo_name like '%" . mysqli_real_escape_string ( $con,$get_sSearch ) . "%'" ;
		
		// ordering
		$sql_order = "order by scale desc";
		
		$sql_limit = "";
		
		// paging if query string is shorter than 5
		if ( strlen ( $get_sSearch ) < 5) {
			$sql_limit = "LIMIT 0,10";
		}
		
		$main_query = mysqli_query($con,"SELECT SQL_CALC_FOUND_ROWS " . implode(", ", $columns) . " FROM {$table} {$joins} {$sql_where} {$sql_order} {$sql_limit}")
			or die ( mysqli_error ( $con ) );
		
		// send back the number requested
		$response['draw'] = intval ( $post_draw );
		
		// get the number of filtered rows
		
		$filtered_rows_query = mysqli_query ( $con,"SELECT FOUND_ROWS()" )
			or die ( mysqli_error ( $con ) );
			
		$row = mysqli_fetch_array ( $filtered_rows_query );
		$response['recordsFiltered'] = $row[0];
		
		// get the number of rows in total
		$total_query = mysqli_query ( $con,"SELECT COUNT(*) FROM {$table}" )
			or die ( mysqli_error ( $con ) );
			
		$row = mysqli_fetch_array ( $total_query );
		$response['recordsTotal'] = $row[0];
		
		$response['items'] = array();
		
		// finish getting rows from the main query
		while ( $row = mysqli_fetch_row ( $main_query ) ) {
			$row = array (
				"id" => $row[0],
				"text" => $row[1],
				"term" => $row[2],
				"location" => $row[3],
				"province" => $row[4],
				"lat" => $row[5],
				"lon" => $row[6]
			);
			
			$response['items'][] = $row;
		}
		
	} // locate db
	
	header('Cache-Control: no-cache');
	header('Pragma: no-cache');
	header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
	header('Content-type: application/json');
	
	echo json_encode ( $response );

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
