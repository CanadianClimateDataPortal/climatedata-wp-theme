<?php

// WP ADMIN AJAX FUNCTIONS

//
// GET DEFAULT VAR
//

add_action ( 'wp_ajax_cdc_get_default_var', 'cdc_get_default_var' );
add_action ( 'wp_ajax_nopriv_cdc_get_default_var', 'cdc_get_default_var' );

function cdc_get_default_var() {
	
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
			
			echo get_the_ID();
			
		}
	}
	
	wp_die();
}

function wpza_replace_repeater_field( $where ) {
	$where = str_replace( "meta_key = 'var_names_$", "meta_key LIKE 'var_names_%", $where );
	return $where;
}

add_filter( 'posts_where', 'wpza_replace_repeater_field' );

// 
// GET RANDOM VAR
//

add_action ( 'wp_ajax_cdc_get_random_var', 'cdc_get_random_var' );
add_action ( 'wp_ajax_nopriv_cdc_get_random_var', 'cdc_get_random_var' );

function cdc_get_random_var() {
	
	$result = get_posts ( array (
		'post_type' => 'variable',
		'posts_per_page' => 1,
		'orderby' => 'rand',
		'post_status' => 'publish'
	) );
	
	if ( !empty ( $result ) ) {
		echo $result[0]->ID;
	}
	
	wp_die();
}

//
// MAP FUNCTIONS
//

// station search

add_action ( 'wp_ajax_cdc_station_search', 'cdc_station_search' );
add_action ( 'wp_ajax_nopriv_cdc_station_search', 'cdc_station_search' );

function cdc_station_search() {

	if ( locate_template ( 'resources/app/db.php' ) != '' )
		require_once locate_template ( 'resources/app/db.php' );

	$q = isset($_GET['q']) ? $_GET['q'] : '';

	$sql = "SELECT station_name,stn_id,lat,lon FROM stations WHERE station_name LIKE '".$q."%' or stn_id LIKE '%".$q."%' and has_normals = 'Y'";

	$result = $GLOBALS['vars']['con']->query($sql);

	$json = [];

	while ( $row = $result->fetch_assoc() ) {
		$json[] = [
			'id' => $row['stn_id'],
			'text' => $row['station_name'],
			'lat' => $row['lat'],
			'lon' => $row['lon']
		];
	}

	echo json_encode ( $json );

	if ( wp_doing_ajax() ) 
		wp_die();

}

// station list

add_action ( 'wp_ajax_cdc_station_list', 'cdc_station_list' );
add_action ( 'wp_ajax_nopriv_cdc_station_list', 'cdc_station_list' );

function cdc_station_list() {

	if ( locate_template ( 'resources/app/db.php' ) != '' )
		require_once locate_template ( 'resources/app/db.php' );

	$query = "SELECT stn_id,station_name FROM stations";
	$result = mysqli_query ( $GLOBALS['vars']['con'], $query ) or die ( mysqli_error ( $GLOBALS['vars']['con'] ) . "[" . $query . "]");

	while ( $row = mysqli_fetch_array ( $result ) ) {
		echo '<option value="' . $row['stn_id'] . '">' . $row['station_name'] . "</option>\n";
	}

	if ( wp_doing_ajax() ) 
		wp_die();

}

// IDF data

add_action ( 'wp_ajax_cdc_get_idf_files', 'cdc_get_idf_files' );
add_action ( 'wp_ajax_nopriv_cdc_get_idf_files', 'cdc_get_idf_files' );

function cdc_get_idf_files () {

	// This script searches for IDF files matching the idf GET parameter and returns a JSON for the Frontend
	
	$get_idf = isset($_GET['idf']) ? $_GET['idf'] : '';
	
	// ensure input is alphanumeric
	
	if ( !preg_match('/^[a-zA-Z0-9]+$/', $get_idf ) ) {
		echo 'nope';
		exit();
	}
	
	$list = [];
	$dir = get_stylesheet_directory() . '/resources/app/idf/';
	
	$filetypes = array (
		array (
			'dirname' => 'historical',
			'label' => __('Historical IDF (ZIP)', 'cdc')
		),
		array (
			'dirname' => 'cmip5',
			'label' => __('Climate Change-Scaled IDF - CMIP5 (ZIP)', 'cdc'),
		),
		array (
			'dirname' => 'cmip6',
			'label' => __('Climate Change-Scaled IDF - CMIP6 (ZIP)', 'cdc'),
		),
		array (
			'dirname' => 'cmip6-quickstart',
			'label' => __('Quick Start - CMIP6 Climate Change-Scaled IDF (ZIP)', 'cdc'),
		)
	);
	
	// glob returns an array with the files it found matching the search pattern (* = wildcard)
	foreach ( $filetypes as $filetype) {

		// since file naming is not stable, a glob search with the station ID works
		$files = glob ( $dir . $filetype['dirname'] . "/*" . $get_idf . "*" );

		if ( count ( $files ) == 1 ) {
			$list[] = array (
				'filename' => '/site/assets/themes/climate-data-ca/resources/app/' . str_replace ( $dir, '', $files[0] ),
				'label' => $filetype['label']
			);
		}
	}
	
	echo json_encode ( $list, JSON_PRETTY_PRINT );

	if ( wp_doing_ajax() ) 
		wp_die();

}

// get location by lat/lng

add_action ( 'wp_ajax_cdc_get_location_by_coords', 'cdc_get_location_by_coords' );
add_action ( 'wp_ajax_nopriv_cdc_get_location_by_coords', 'cdc_get_location_by_coords' );

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
			$term_append = ( $_GET['lang'] == 'fr' ) ? '_fr' : '';
			
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
	
	wp_die();

}

// get location by ID

add_action ( 'wp_ajax_cdc_get_location_by_id', 'cdc_get_location_by_id' );
add_action ( 'wp_ajax_nopriv_cdc_get_location_by_id', 'cdc_get_location_by_id' );

function cdc_get_location_by_id () {

	if ( isset ( $_GET['loc'] ) && !empty ( $_GET['loc'] )) {

		// remove possible bad stuff
		$loc = preg_replace ( "/[^a-zA-Z0-9]+/", "", $_GET['loc'] );
		
		$term_append = ( $_GET['lang'] == 'fr' ) ? '_fr' : '';
		
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

		$main_query = mysqli_query ( $GLOBALS['vars']['con'], "SELECT " . implode ( ", ", $columns ) . " FROM all_areas WHERE id_code = '" . $loc . "'" ) or die ( mysqli_error ( $GLOBALS['vars']['con'] ) );

		$row = mysqli_fetch_assoc ( $main_query );

		$row['coords'] = [ floatval ( $row['lat'] ), floatval ( $row['lon'] ) ];
		$row['lng'] = floatval ( $row['lon'] );
		$row['province_short'] = short_province ( $row['province'] );
		$row['title'] = $row['geo_name'] . ', ' . $row['province_short'];
		
		echo json_encode ( $row );
	
	} else {
	
		echo '[]';

	}
	
	wp_die();

}

// search locations

add_action ( 'wp_ajax_cdc_location_search', 'cdc_location_search' );
add_action ( 'wp_ajax_nopriv_cdc_location_search', 'cdc_location_search' );

function cdc_location_search() {
	
	if ( locate_template ( 'resources/app/db.php' ) == '' ) {
		
		echo json_encode ( array (
			'error' => 'no db connection'
		) );
		
	} else {
		
		require_once locate_template ( 'resources/app/db.php' );
		
		$con = $GLOBALS['vars']['con'];
		
		$get_sSearch = isset($_GET['q']) ? $_GET['q'] : '';
		$get_lang = isset($_GET['lang']) ? $_GET['lang'] : 'en';
		$post_draw = isset($_POST['draw']) ? $_POST['draw'] : '';
		
		// This script is not integrated with Wordpress... hard to have a better way to know in which language we are
		if (isset($_SERVER['HTTP_HOST'])
				&& ($_SERVER['HTTP_HOST'] == "donneesclimatiques.ca"
						|| $_SERVER['HTTP_HOST'] == "donneesclimatiques.crim.ca"
						|| $_SERVER['HTTP_HOST'] == "dev-fr.climatedata.ca")
		) {
				$get_lang = 'fr';
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
		
		if ( $GLOBALS['fw']['current_lang_code'] == 'fr' ) {
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
		$sql_where = "where gen_term not in ('Administrative Region', 'Province', 'Territory') and geo_name like '" . mysqli_real_escape_string($con,$get_sSearch ) . "%'" ;
		
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
	
	
	if ( wp_doing_ajax() ) 
		wp_die();
		
}

//
// FEEDBACK FORM SUBMIT
//

function sanitize_input ( $input ) {
	
	$input = trim ( $input );
	$input = stripslashes ( $input );
	$input = htmlspecialchars ( $input );
	
	return $input;
	
}

add_action ( 'wp_ajax_cdc_submit_feedback_form', 'cdc_submit_feedback_form' );
add_action ( 'wp_ajax_nopriv_cdc_submit_feedback_form', 'cdc_submit_feedback_form' );

function cdc_submit_feedback_form() {
	
	$result = array(
		'invalid' => array(),
		'mail' => 'failed',
		'signup' => '',
		'header' => __ ( 'An error occurred', 'cdc' ),
		'messages' => array()
	);
	
	$valid = true;
	
	$form_data = array();
	
	if ( isset ( $_GET['form'] ) && !empty ( $_GET['form'] ) ) {
		
		// build form data array
		
		foreach ( $_GET['form'] as $input ) {
			$form_data[$input['name']] = $input['value'];
		}
		
		// init captcha
		
		include_once ( locate_template ( 'resources/php/securimage/securimage.php' ) );
		include_once ( locate_template ( 'resources/php/mailchimp.php' ) );
		
		$securimage = new Securimage();
		
		// set captcha namespace by feedback type
		
		switch ( $form_data['feedback-type'] ) {
			case "general":
			case "bug":
			case "demo":
				$securimage->setNamespace('support');
				break;
			case "data":
				$securimage->setNamespace('data');
				break;
		
			default:
				// die;
		}
		
		// validate captcha
		
		if ( $securimage->check( $form_data['captcha_code'] ) == false ) {
		
			$valid = false;
			
			$result['invalid'][] = 'captcha_code';
			$result['messages'][] = __ ( 'CAPTCHA verification failed.', 'cdc' );
		
		}
		
		// validate email address
		
		if (
			$form_data['email'] == '' ||
			!filter_var (
				sanitize_input ( $form_data['email'] ),
				FILTER_VALIDATE_EMAIL
			)
		) {
			
			$valid = false;
			$result['invalid'][] = 'email';
			$result['messages'][] = __ ( 'Please enter a valid email address.', 'cdc' );
			
		}
		
		if ( $form_data['feedback'] == '' ) {
			$valid = false;
			$result['invalid'][] = 'feedback';
			$result['messages'][] = __ ( 'Please provide the details of your inquiry.', 'cdc' );
		}
		
		if ( $valid == false ) {
			
			$result['header'] = __ ( 'Some required fields are missing.', 'cdc' );
			
		} elseif ( $valid == true ) {
			
			// form validation succeeded
			
			// set email headers
			
			$to = "support-backup+{$form_data['feedback-type']}@climatedata.ca";
			$subject = get_bloginfo ( 'title' ) . __(': Feedback form submission','cdc-feedback');
			$headers = array ('Content-Type: text/html; charset=UTF-8',
					"From: Climatedata Feedback Form <feedback@climatedata.ca>",
					"Reply-To: {$form_data['fullname']} <{$form_data['email']}>");
			
			// message body
			
			$body = '';
		
			$body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">' . __('Name','cdc-feedback') . '</span><span style="display: inline-block; vertical-align: top;">' . $form_data['fullname'] . '</span></p>';
		
			$body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">' . __('Email','cdc-feedback') . '</span><span style="display: inline-block; vertical-align: top;"><a href="mailto:' . $form_data['email'] . '">' . $form_data['email'] . '</a></span></p>';
		
			$body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">' . __('Organization','cdc-feedback') . '</span><span style="display: inline-block; vertical-align: top;">' . $form_data['organization'] . '</span></p>';
		
			$body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">Type</span><span style="display: inline-block; vertical-align: top;">' . $form_data['feedback-type'] . '</span></p>';
		
			$body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">Region</span><span style="display: inline-block; vertical-align: top;">' . $form_data['region'];
		
			if ( $form_data['region'] == 'Other' && $form_data['region-other'] != '' ) $body .= ': ' . $form_data['region-other'];
		
			$body .= '</span></p>';
		
			$body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">Role</span><span style="display: inline-block; vertical-align: top;">' . $form_data['role'];
		
			if ( $form_data['role'] == 'Other' && $form_data['role-other'] != '' ) $body .= ': ' . $form_data['role-other'];
		
			$body .= '</span></p>';
		
			$body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">Subject</span><span style="display: inline-block; vertical-align: top;">' . $form_data['subject'];
		
			if ( $form_data['subject'] == 'Other' && $form_data['subject-other'] != '' ) $body .= ': ' . $form_data['subject-other'];
		
			$body .= '</span></p>';
		
			$body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">Referred from</span><span style="display: inline-block; vertical-align: top;">' . $form_data['referral'];
		
			if ( $form_data['referral'] == 'Other' && $form_data['referral-other'] != '' ) $body .= ': ' . $form_data['referral-other'];
		
			$body .= '</span></p>';
		
			$body .= '<p style="font-weight: bold;">Message</p><p><pre>' . $form_data['feedback'] . '</pre></p>';
		
			$result['body'] = $body;
		
			// send mail
			
			$wp_mail1 = wp_mail ( $to, $subject, $body, $headers );
			$wp_mail2 = wp_mail ( $GLOBALS['vars']['feedback_email'], $subject, $body, $headers );
		
			if ( $wp_mail1 && $wp_mail2 ) {
				
				$result['mail'] = 'success';
				$result['header'] = __ ( 'Thanks! We’ve received your inquiry.', 'cdc' );
				$result['messages'] = [ __ ( 'Please note: we are currently experiencing a higher than normal number of inquiries to our Support Desk. We will do our best to reply to you as soon as possible, but please be advised that there may be delays.', 'cdc' ) ];
				
			} else {
				$result['messages'][] = __ ( 'Something went wrong while sending your message. Please try again later.', 'cdc' );
			}
			
			if (
				isset ( $form_data['signup'] ) && 
				$form_data['signup'] == 'true' 
			) {
				
				$signup = mailchimp_register ( $form_data['email'] );
				
				if ( $signup == true ) {
					$result['signup'] = 'success';
					$result['messages'][] = __ ( 'Your email address has been added to our mailing list. You can unsubscribe at any time.', 'cdc' );
				} elseif ( $signup == false ) {
					$result['signup'] = 'failed';
					$result['messages'][] = __ ( 'An error occurred while adding your email address to our mailing list.', 'cdc' );
				}
				
			}
		
		}
		
	} else {
		
		// no form data
		
		$valid = false;
		$result['invalid'][] = 'form data';
		$result['messages'][] = 'An error occurred.';
		
	}
	
	echo json_encode ( $result );
	
	if ( wp_doing_ajax() ) 
		wp_die();	
	
}