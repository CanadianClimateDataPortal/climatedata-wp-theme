<?php


//
// GLOBALS
//

function child_global_vars() {

	global $vars;
	global $classes;

	$query_string = $_GET;

	$vars['user_id'] = '';

	if ( is_user_logged_in() ) {

		$vars['user_id'] = get_current_user_id();

	}

	if ( is_page ( 'scenarios' ) || is_page ( 'risks' ) ) {

		$classes['body'][] = 'app-page';

	}

	// $classes['body'][] = 'lang-' . apply_filters ( 'wpml_current_language', NULL );

}

add_action ( 'wp', 'child_global_vars', 20 );

//
// ENQUEUE
//


add_action ( 'wp_enqueue_scripts', function() {
	
	// deregister font-awesome from parent theme
	// to use /site/assets/font-awesome instead
	
	wp_dequeue_style ( 'font-awesome' );
	wp_deregister_style ( 'font-awesome' );
	
}, 20 );

function child_theme_enqueue() {
	
	$theme_dir = get_bloginfo ( 'template_directory' ) . '/';
	$vendor_dir = $theme_dir . 'resources/vendor/';
	$js_dir = $theme_dir . 'resources/js/';

	$child_theme_dir = get_stylesheet_directory_uri() . '/';
	$child_vendor_dir = $child_theme_dir . 'resources/vendor/';
	$child_npm_dir = $child_theme_dir . 'node_modules/';
	$child_js_dir = $child_theme_dir . 'resources/js/';

	//
	// STYLES
	//
	
	// dequeue global CSS
	
	wp_dequeue_style ( 'global-style' );
	
	wp_register_style ( 'font-awesome', WP_CONTENT_URL . '/vendor/font-awesome-pro/css/all.css', null, null );
	wp_enqueue_style ( 'font-awesome' );

	wp_enqueue_style ( 'leaflet', $child_npm_dir . 'leaflet/dist/leaflet.css', NULL, NULL, 'all' );

	wp_enqueue_style ( 'child-style', $child_theme_dir . 'style.css', NULL, NULL, 'all' );
	
	if (
		$GLOBALS['vars']['current_slug'] == 'map' ||
		$GLOBALS['vars']['current_slug'] == 'carte'
	) {
		
		wp_enqueue_style ( 'leaflet' );
		
	}

	//
	// SCRIPTS
	//
	
	// VENDOR
	
	// lodash
	
	wp_register_script ( 'lodash-full', $child_vendor_dir . 'lodash.js', NULL, NULL, true );
	
	// tab drawer
	
	wp_register_script ( 'tab-drawer', $child_vendor_dir . 'pe-tab-drawer/tab-drawer.js', array ( 'jquery' ), NULL, true );

	// leaflet
	
	wp_register_script ( 'leaflet', $child_npm_dir . 'leaflet/dist/leaflet-src.js', null, null, true );
	
	wp_register_script ( 'leaflet-sync', $child_npm_dir . 'leaflet.sync/L.Map.Sync.js', array ( 'leaflet' ), null, true );
	
	wp_register_script ( 'leaflet-vectorgrid', $child_npm_dir . 'leaflet.vectorgrid/dist/Leaflet.VectorGrid.bundled.min.js', array ( 'leaflet' ), null, true );
	
	// highcharts
	
	wp_register_script ( 'highcharts-highstock', 'https://code.highcharts.com/stock/highstock.js', NULL, NULL, true );
	wp_register_script ( 'highcharts-more', 'https://code.highcharts.com/stock/highcharts-more.js', array ( 'highcharts-highstock' ), NULL, true );
	wp_register_script ( 'highcharts-exporting', 'https://code.highcharts.com/stock/modules/exporting.js', array ( 'highcharts-highstock' ), NULL, true );
	wp_register_script ( 'highcharts-export-data', 'https://code.highcharts.com/stock/modules/export-data.js', array ( 'highcharts-exporting' ), NULL, true );
	wp_register_script ( 'highcharts-offline-exporting', 'https://code.highcharts.com/stock/modules/offline-exporting.js', array ( 'highcharts-exporting' ), NULL, true );
	wp_register_script ( 'highcharts-accessibility', 'https://code.highcharts.com/modules/accessibility.js', array ( 'highcharts-highstock' ), NULL, true );
	
	wp_register_script ( 'zebra-pin', $child_npm_dir . 'zebra_pin/dist/zebra_pin.min.js', array ( 'jquery' ), null, true );
	
	//
	
	wp_register_script ( 'utilities', $child_js_dir . 'utilities.js', array ( 'jquery' ), NULL, true );
	
  wp_register_script ( 'data', $child_js_dir . 'data.js', array (  ), NULL, true );

	wp_register_script ( 'cdc', $child_js_dir . 'cdc.js', array ( 'utilities', 'data', 'lodash-full', 'jquery', 'leaflet', 'leaflet-vectorgrid', 'leaflet-sync', 'tab-drawer', 'highcharts-highstock', 'highcharts-more', 'highcharts-exporting', 'highcharts-export-data', 'highcharts-offline-exporting', 'highcharts-accessibility' ), NULL, true );
	
	wp_register_script ( 'map-app', $child_js_dir . 'map.js', array ( 'cdc', 'data', 'jquery-ui-slider' ), NULL, true );
	
	wp_register_script ( 'download-app', $child_js_dir . 'download.js', array ( 'cdc', 'jquery-ui-slider' ), NULL, true );
	
	wp_register_script ( 'child-functions', $child_js_dir . 'child-functions.js', array ( 'utilities', 'cdc', 'map-app' ), NULL, true );
	
	// localize admin url
	
	$units = array (
		'celcius' => 'º C',
		'kelvin' => 'K',
		'mm' => 'mm',
		'cm' => 'cm',
		'm' => 'm',
		'days' => __ ( 'days', 'cdc' ),
		'doy' => __ ( 'day of the year', 'cdc' ),
		'degree-days' => __ ( 'degree days', 'cdc' ),
		'number of periods' => __ ( 'number of periods', 'cdc' ),
		'events' => __ ( 'events', 'cdc' )
	);
	
	wp_localize_script ( 'utilities', 'unit_strings', $units );
	
	// PAGE CONDITIONALS

	switch ( $GLOBALS['vars']['current_slug'] ) {
		case 'map' :
		case 'carte' :
			wp_enqueue_script ( 'map-app' );
			break;
			
		case 'download' :
		case 'telechargement' :
			wp_enqueue_script ( 'download-app' );
			break;
			
		case 'learn' :
		case 'apprendre' :
			wp_enqueue_script ( 'zebra-pin' );
			wp_enqueue_script ( 'tab-drawer' );
			break;
			
		case 'news' :
		case 'nouvelles' :
			wp_enqueue_script ( 'zebra-pin' );
			wp_enqueue_script ( 'tab-drawer' );
			break;
		
	}
	
	wp_enqueue_script ( 'child-functions' );
	

}

add_action ( 'wp_enqueue_scripts', 'child_theme_enqueue', 50 );

//
// INCLUDES
//

$includes = array (
	'resources/functions/builder/field-groups.php',
	'resources/functions/taxonomies.php',
	'resources/functions/post-types.php',
	'resources/functions/shortcodes.php',
	'resources/functions/rest.php',
);

foreach ( $includes as $include ) {

	if ( locate_template ( $include ) != '' ) {
		include_once ( locate_template ( $include ) );
	}

}

//
// THEME SETUP
//

add_action ( 'after_setup_theme', 'fw_child_theme_support', 0 );

function fw_child_theme_support() {

	// DOCUMENT TITLE

	add_theme_support ( 'title-tag' );

	// PAGE EXCERPTS

	add_post_type_support ( 'page', 'excerpt' );

	// UNCROPPED IMAGE SIZE FOR CARD BLOCKS

	add_image_size ( 'card-img-no-crop', '600', '380', false );

	// MENUS

	// LANGUAGES
	
	load_theme_textdomain ( 'cdc', get_stylesheet_directory() );

}

add_action ( 'after_setup_theme', 'fw_load_child_theme_lang_files', 0 );

function fw_load_child_theme_lang_files() {
	
	load_theme_textdomain ( 'cdc', get_stylesheet_directory() . '/languages' );
	
	$locale = get_locale();
	$locale_file = get_stylesheet_directory() . '/languages/' . $locale . '.php';
	
	if ( is_readable ( $locale_file ) ) {
		require_once ( $locale_file );
	}
	
}


//
// TEMPLATE HOOKS
//

function add_favicon() {

?>

<link rel="apple-touch-icon" sizes="180x180" href="<?php echo $GLOBALS['vars']['child_theme_dir']; ?>resources/vendor/favicon_package_v0.16/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="<?php echo $GLOBALS['vars']['child_theme_dir']; ?>resources/vendor/favicon_package_v0.16/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="<?php echo $GLOBALS['vars']['child_theme_dir']; ?>resources/vendor/favicon_package_v0.16/favicon-16x16.png">
<link rel="manifest" href="<?php echo $GLOBALS['vars']['child_theme_dir']; ?>resources/vendor/favicon_package_v0.16/site.webmanifest">
<link rel="mask-icon" href="<?php echo $GLOBALS['vars']['child_theme_dir']; ?>resources/vendor/favicon_package_v0.16/safari-pinned-tab.svg" color="#0018ff">
<meta name="msapplication-TileColor" content="#ffffff">
<meta name="theme-color" content="#ffffff">

<?php

}

// add_action( 'wp_head', 'add_favicon' );

add_action ( 'fw_before_footer', function() {
	
?>

<script type="text/javascript">var L_DISABLE_3D = true;</script>

<?php

} );

//
// ADMIN STUFF
//

// DISABLE EDITOR

function remove_default_editor() {
	remove_post_type_support ( 'page', 'editor' );
}

// DISABLE COMMENTS

function remove_comments_admin_menu() {
	remove_menu_page ( 'edit-comments.php' );
}

function remove_comments_post_type_support() {
	remove_post_type_support ( 'post', 'comments' );
	remove_post_type_support ( 'page', 'comments' );
}

function remove_comments_admin_bar() {
	global $wp_admin_bar;
	$wp_admin_bar->remove_menu ( 'comments' );
}

add_action ( 'init', 'remove_default_editor' );
add_action ( 'init', 'remove_comments_post_type_support', 100 );
add_action ( 'admin_menu', 'remove_comments_admin_menu' );
add_action ( 'wp_before_admin_bar_render', 'remove_comments_admin_bar' );

//
// MISC
// find a good home for these
//

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

add_action ( 'wp_ajax_cdc_get_random_var', 'cdc_get_random_var' );
add_action ( 'wp_ajax_nopriv_cdc_get_random_var', 'cdc_get_random_var' );

function cdc_get_location_by_coords () {
	
	if (
		( isset ( $_GET['lat'] ) && !empty ( $_GET['lat'] ) ) &&
		( isset ( $_GET['lng'] ) && !empty ( $_GET['lng'] ) )
	) {
		
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
				LIMIT 50") or die (mysqli_error($GLOBALS['vars']['con']));
				
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
			LIMIT 1") or die (mysqli_error($GLOBALS['vars']['con']));
			
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
					'geo_name' => __ ( 'Point', 'cdc' ),
					'title' => __ ( 'Point', 'cdc' ) . ' (' . $lat . ', ' . $lng . ')'
				) );
				
			}
			
		}
		
	} else {
		
		echo json_encode ( array (
			'lat' => $lat,
			'lng' => $lng,
			'geo_id' => '',
			'geo_name' => __ ( 'Point', 'cdc' ),
			'title' => __ ( 'Point', 'cdc' ) . ' (' . $lat . ', ' . $lng . ')'
		) );
		
	}
	
	wp_die();

}

add_action ( 'wp_ajax_cdc_get_location_by_coords', 'cdc_get_location_by_coords' );
add_action ( 'wp_ajax_nopriv_cdc_get_location_by_coords', 'cdc_get_location_by_coords' );

// GET PROVINCE ABBREVIATION

function short_province ( $province ) {
		$provinces = array (
			"British Columbia" => "BC",
			"Colombie-Britannique" => "BC",
			"Yukon" => "YT",
			"Northwest Territories" => "NT",
			"Territoires du Nord-Ouest" => "NT",
			"Alberta" => "AB",
			"Newfoundland and Labrador" => "NL",
			"Terre-Neuve-et-Labrador" => "NL",
			"Saskatchewan" => "SK",
			"Ontario" => "ON",
			"Manitoba" => "MB",
			"Nova Scotia" => "NS",
			"Nouvelle-Écosse" => "NS",
			"Quebec" => "QC",
			"Québec" => "QC",
			"New Brunswick" => "NB",
			"Nouveau-Brunswick" => "NB",
			"Prince Edward Island" => "PE",
			"Île-du-Prince-Édouard" => "PE",
			"Nunavut" => "NU"
		);

		if ( array_key_exists ( $province, $provinces ) ) {
			return $provinces[$province];
		} else {
			return $province;
		}

}