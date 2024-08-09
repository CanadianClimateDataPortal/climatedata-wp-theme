<?php

// WP ADMIN AJAX FUNCTIONS

//
// GET DEFAULT VAR
//

// add_action ( 'wp_ajax_cdc_get_default_var', 'cdc_get_default_var' );
// add_action ( 'wp_ajax_nopriv_cdc_get_default_var', 'cdc_get_default_var' );
// 
// function cdc_get_default_var() {
// 	
// 	$result = new WP_Query ( array (
// 		'post_type' => 'variable',
// 		'posts_per_page' => 1,
// 		'post_status' => 'publish',
// 		'meta_query' => array (
// 			array (
// 				'key' => 'var_names_$_variable',
// 				'value' => 'tx_max',
// 				'compare' => '='
// 			)
// 		)
// 	) );
// 	
// 	if ( $result->have_posts() ) {
// 		while ( $result->have_posts() ) {
// 			$result->the_post();
// 			
// 			echo get_the_ID();
// 			
// 		}
// 	}
// 	
// 	wp_die();
// }
// 
// function wpza_replace_repeater_field( $where ) {
// 	$where = str_replace( "meta_key = 'var_names_$", "meta_key LIKE 'var_names_%", $where );
// 	return $where;
// }
// 
// add_filter( 'posts_where', 'wpza_replace_repeater_field' );

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