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
// GET RELATED CONTENT
//

add_action ( 'rest_api_init', function () {

	register_rest_route ( 'cdc/v2', '/related/', array (
		'methods' => 'GET',
		'callback' => 'cdc_get_related_content'
	) );

});

function cdc_get_related_content () {

	$result = array(
		'sectors' => [],
		'training' => []
	);

	// SECTORS

	$sectors = get_the_terms ( $_GET['var_id'], 'sector' );

	foreach ( $sectors as $sector ) {
		$result['sectors'][] = array (
			'id' => $sector->term_id,
			'title' => $sector->name,
			'url' => home_url ( '/learn/' ) . '?q=sector:' . $sector->slug
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
add_filter ( 'acf/rest/format_value_for_rest/name=var_tech_description', 'cdc_format_wysiwyg_in_rest', 10, 5);
add_filter ( 'acf/rest/format_value_for_rest/name=var_description_fr', 'cdc_format_wysiwyg_in_rest', 10, 5);
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


//
// FEEDBACK FORM SUBMIT
//

/**
 * Register custom REST API routes for form submissions.
 */
add_action ( 'rest_api_init', function () {
	register_rest_route ( 'cdc/v2', '/submit_feedback/', array (
		'methods' => 'GET',
		'callback' => 'cdc_submit_feedback_form'
	) );
	register_rest_route ( 'cdc/v2', '/submit_support/', array (
		'methods' => 'GET',
		'callback' => 'cdc_submit_support_form'
	) );
	register_rest_route ( 'cdc/v2', '/submit_apps/', array (
		'methods' => 'GET',
		'callback' => 'cdc_submit_apps_form'
	) );
} );

/**
 * Handle the feedback form submission.
 */
function cdc_submit_feedback_form () {
	$form_type = 'feedback';
	$required_fields = array(
		'feedback' => __ ( 'Please provide the details of your inquiry.', 'cdc' ),
	);
	handle_form_submission ( $form_type, $required_fields );
}

/**
 * Handle the support form submission.
 */
function cdc_submit_support_form () {
	$form_type = 'support';
	$required_fields = array(
		'feedback' => __ ( 'Please provide the details of your inquiry.', 'cdc' ),
	);
	handle_form_submission ( $form_type, $required_fields );
}

/**
 * Handle the  apps form submission.
 */
function cdc_submit_apps_form () {
	$form_type = 'apps';
	$required_fields = array(
		'feedback' => __ ( 'Please provide the details of your inquiry.', 'cdc' ),
		'apps-posts[]' => __ ( 'Please select at least one app.', 'cdc' )
	);
	handle_form_submission ( $form_type, $required_fields );
}

/**
 * Handle the form submission and process the data.
 *
 * @param string $form_type The type of form being submitted.
 * @param string[] $required_fields The required fields for the form.
 */
function handle_form_submission ( $form_type, $required_fields ) {
	$result = array(
		'invalid' => array(),
		'mail' => 'failed',
		'signup' => '',
		'header' => __ ( 'An error occurred.', 'cdc' ),
		'messages' => array()
	);

	if ( isset ( $_GET['form'] ) && !empty ( $_GET['form'] ) ) {
		$form_data = array();

		// Build form data array and sanitize inputs
		foreach ( $_GET['form'] as $input ) {
			$name = sanitize_text_field( trim( $input['name'] ) );
			if (strpos($name, 'email') !== false) {
				$value = sanitize_email( trim( $input['value'] ) );
			} elseif ( is_array( $input['value'] ) ) {
				$value = array_map( 'sanitize_text_field', array_map( 'trim', $input['value'] ) );
			} else {
				$value = sanitize_text_field( trim( $input['value'] ) );
			}
			$form_data[$name] = $value;
		}

		// Init captcha
		include_once ( locate_template ( 'resources/php/securimage/securimage.php' ) );
		$securimage = new Securimage();
		$securimage->setNamespace ( $form_data['namespace'] );

		// Validate captcha
		if ( $securimage->check ( $form_data['captcha_code'] ) == false ) {
			$result['invalid'][] = 'captcha_code';
			$result['messages'][] = __ ( 'CAPTCHA verification is required.', 'cdc' );
		}

		// Validate email address
		if ( empty ( $form_data['email'] ) || !filter_var ( $form_data['email'], FILTER_VALIDATE_EMAIL ) ) {
			$result['invalid'][] = 'email';
			$result['messages'][] = __ ( 'Please enter a valid email address.', 'cdc' );
		}

		// Validate other required fields
		foreach ( $required_fields as $field => $error_msg ) {
			if (
				( empty( $form_data[$field] ) ) || // Check if the field is not set, or empty
				( is_array( $form_data[$field] ) && count( array_filter( $form_data[$field] ) ) == 0 ) // Or if the array is empty
			) {
				$result['invalid'][] = $field;
				$result['messages'][] = $error_msg;
			}
		}

		if ( !empty( $result['invalid'] ) ) {
			$result['header'] = __ ( 'Some required fields are missing.', 'cdc' );
		} else {
			// Form validation succeeded
			// Set email headers
			$email_key = $form_type . '_email';
			$to = sanitize_email( $GLOBALS['vars'][$email_key] ); // Use actual email for each form type
			$subject = get_bloginfo ( 'title' ) . ': ' . ucfirst( $form_type ) . ' form submission';
			$headers = array(
				'Content-Type: text/html; charset=UTF-8',
				"From: Climatedata " . ucfirst($form_type) . " Form <{$form_type}@climatedata.ca>",
				"Reply-To: {$form_data['fullname']} <{$form_data['email']}>"
			);

			// Build message body
			$body = build_message_body ( $form_data, $form_type );
			$result['body'] = $body;

			// Send mail
			$wp_mail = wp_mail ( $to, $subject, $body, $headers );

			if ( $wp_mail ) {
				$result['mail'] = 'success';
				$result['header'] = __( 'Thanks! We’ve received your inquiry.', 'cdc' );
				$result['messages'] = [ __( 'Please note: we are currently experiencing a higher than normal number of inquiries to our Support Desk. We will do our best to reply to you as soon as possible, but please be advised that there may be delays.', 'cdc' ) ];
			} else {
				$result['messages'][] = __( 'Something went wrong while sending your message. Please try again later.', 'cdc' );
			}

			// Mailchimp signup for feedback form
			if ( isset ( $form_data['signup'] ) && $form_data['signup'] == 'true' ) {
				include_once ( locate_template ( 'resources/php/mailchimp.php' ) );
				$signup = mailchimp_register ( $form_data['email'] );
				if ( $signup == true ) {
					$result['signup'] = 'success';
					$result['messages'][] = __( 'Your email address has been added to our mailing list. You can unsubscribe at any time.', 'cdc' );
				} else {
					$result['signup'] = 'failed';
					$result['messages'][] = __( 'An error occurred while adding your email address to our mailing list.', 'cdc' );
				}
			}
		}
	} else {
		// No form data
		$result['invalid'][] = 'form data';
		$result['messages'][] = 'An error occurred.';
	}

	echo json_encode ( $result );
}

/**
 * Build the message body for the email.
 *
 * @param array $form_data The form data submitted by the user.
 * @param string $form_type The type of form being submitted.
 * @return string The message body for the email.
 */
function build_message_body ( $form_data, $form_type ) {
	$body = '';
	$body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">Name</span><span style="display: inline-block; vertical-align: top;">' . esc_html( $form_data['fullname'] ) . '</span></p>';
	$body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">Email</span><span style="display: inline-block; vertical-align: top;"><a href="mailto:' . esc_attr( $form_data['email'] ) . '">' . esc_html( $form_data['email'] ) . '</a></span></p>';
	$body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">Organization</span><span style="display: inline-block; vertical-align: top;">' . esc_html( $form_data['organization'] ) . '</span></p>';

	// Custom fields for feedback form
	if ( $form_type == 'feedback' ) {
		$body .= build_feedback_body ( $form_data );
	}
	// Custom fields for apps form
	elseif ( $form_type == 'apps' ) {
		$body .= build_apps_body ( $form_data );
	}

	$body .= '<p style="font-weight: bold;">Message</p><pre>' . esc_html( $form_data['feedback'] ) . '</pre>';
	return $body;
}

/**
 * Build the feedback form body for the email.
 *
 * @param array $form_data The form data submitted by the user.
 * @return string The feedback form body for the email.
 */
function build_feedback_body ( $form_data ) {
	$body = '';

	if ( isset( $form_data['feedback-type'] ) ) {
		$body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">Type</span><span style="display: inline-block; vertical-align: top;">' . esc_html( $form_data['feedback-type'] ) . '</span></p>';
	}

	if ( isset( $form_data['region'] ) ) {
		$body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">Region</span><span style="display: inline-block; vertical-align: top;">' . esc_html( $form_data['region'] );

		if ( $form_data['region'] == 'Other' && $form_data['region-other'] != '' ) {
			$body .= ': ' . esc_html( $form_data['region-other'] );
		}

		$body .= '</span></p>';
	}

	if ( isset( $form_data['role'] ) ) {
		$body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">Role</span><span style="display: inline-block; vertical-align: top;">' . esc_html( $form_data['role'] );

		if ( $form_data['role'] == 'Other' && $form_data['role-other'] != '' ) {
			$body .= ': ' . esc_html( $form_data['role-other'] );
		}

		$body .= '</span></p>';
	}

	if ( isset( $form_data['subject'] ) ) {
		$body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">Subject</span><span style="display: inline-block; vertical-align: top;">' . esc_html( $form_data['subject'] );

		if ( $form_data['subject'] == 'Other' && $form_data['subject-other'] != '' ) {
			$body .= ': ' . esc_html( $form_data['subject-other'] );
		}

		$body .= '</span></p>';
	}

	if ( isset( $form_data['referral'] ) ) {
		$body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">Referred from</span><span style="display: inline-block; vertical-align: top;">' . esc_html( $form_data['referral'] );

		if ( $form_data['referral'] == 'Other' && $form_data['referral-other'] != '' ) {
			$body .= ': ' . esc_html( $form_data['referral-other'] );
		}

		$body .= '</span></p>';
	}

	return $body;
}

/**
 * Build the apps form body for the email.
 *
 * @param array $form_data The form data submitted by the user.
 * @return string The apps form body for the email.
 */
function build_apps_body ( $form_data ) {
	$body = '';
	$body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">Apps</span><span style="display: inline-block; vertical-align: top;">';

	if ( isset ( $form_data['apps-posts[]'] ) ) {
		if ( is_array ( $form_data['apps-posts[]'] ) ) {
			$body .= implode ( ', ', array_map( 'esc_html', $form_data['apps-posts[]'] ) );
		} else {
			$body .= esc_html( $form_data['apps-posts[]'] );
		}
	} else {
		$body .= 'None selected';
	}

	$body .= '</span></p>';
	return $body;
}

/**
 * Load REST API V3.
 */
$rest_v3_init_path = dirname( __FILE__ ) . '/rest-v3/init.php';

if ( file_exists( $rest_v3_init_path ) ) {
	require_once $rest_v3_init_path;
}
