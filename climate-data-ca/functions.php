<?php

//
// GLOBALS
//

function child_global_vars()
{

    global $vars;

    $query_string = $_GET;

    // if we're on the variable template and there's no variable set,
    // get the first variable post

    if (is_page_template('tpl-variable.php') && !isset ($query_string['var'])) {

        $first_var = get_posts(array('post_type' => 'variable', 'posts_per_page' => 1, 'orderby' => 'menu_order', 'order' => 'asc'));

        if (!empty ($first_var)) {
            $query_string['var'] = get_field('var_name', $first_var[0]->ID);
        }

    }

    // begin evaluating query string

    if (isset ($query_string['var'])) {

        // if a variable is set

        $vars['current_data'] = array('type' => 'variable', 'var_name' => $query_string['var']);

        // get the matching post ID

        $get_post_by_slug = get_posts(array('post_type' => 'variable', 'name' => $query_string['var'], 'posts_per_page' => 1));

        if (!empty ($get_post_by_slug)) {
            $vars['current_data']['id'] = $get_post_by_slug[0]->ID;
        }

        // if a location is also set, add it to the array

        if (isset ($query_string['geo-select'])) {

            $vars['current_data']['location_data'] = get_location_by_ID($query_string['geo-select']);

        }

    } elseif (isset ($query_string['loc'])) {

        // if a location is set

        $vars['current_data'] = array('type' => 'location', 'id' => $query_string['loc']);

        $vars['current_data']['location_data'] = get_location_by_ID($query_string['loc']);

    } elseif (isset ($query_string['sec'])) {

        // if a sector is set

        $vars['current_data'] = array('type' => 'sector', 'id' => $query_string['sec']);

    }

}

add_action('wp', 'child_global_vars');

//
// ENQUEUE
//

function child_theme_enqueue()
{
    $theme_dir = get_bloginfo('template_directory') . '/';
    $bower_dir = $theme_dir . 'resources/bower_components/';
    $js_dir = $theme_dir . 'resources/js/';

    $child_theme_dir = get_stylesheet_directory_uri() . '/';
    $child_bower_dir = $child_theme_dir . 'resources/bower_components/';
    $child_js_dir = $child_theme_dir . 'resources/js/';

    //
    // STYLES
    //

    wp_enqueue_style('child-style', $child_theme_dir . 'style.css', array('global-style'), NULL, 'all');

    //
    // SCRIPTS
    //

    wp_register_script('child-functions', $child_js_dir . 'child-functions.js', array('jquery', 'global-functions'), NULL, true);
    wp_register_script('location-functions', $child_js_dir . 'location-functions.js', array('jquery', 'child-functions'), NULL, true);
    wp_register_script('variable-functions', $child_js_dir . 'variable-functions.js', array('jquery', 'child-functions'), NULL, true);
    wp_register_script('slr-functions', $child_js_dir . 'slr-functions.js', array('jquery', 'child-functions'), NULL, true);
    wp_register_script('analyze-functions', $child_js_dir . 'analyze-functions.js', array('jquery', 'child-functions'), NULL, true);
    wp_register_script('download-functions', $child_js_dir . 'download-functions.js', array('jquery', 'child-functions'), NULL, true);
    wp_register_script('archive-functions', $child_js_dir . 'archive-functions.js', array('jquery', 'child-functions'), NULL, true);
    wp_register_script('case-study-functions', $child_js_dir . 'case-study-functions.js', array('jquery', 'child-functions', 'map-renderer', 'renderer'), NULL, true);
    wp_register_script('training-functions', $child_js_dir . 'training-functions.js', array('jquery', 'child-functions' ), NULL, true);

    // VENDOR

    wp_register_script('js-cookie', $bower_dir . 'js-cookie/src/js.cookie.js', NULL, true);
    //wp_register_script ( 'jquery-mousewheel', $bower_dir . 'jquery-mousewheel/jquery.mousewheel.min.js', array ( 'jquery' ), NULL, true );
    wp_register_script('listnav', $bower_dir . 'pe-listnav/jquery-listnav.js', NULL, NULL, true);

    // highcharts

    wp_register_script('highcharts-highstock', 'https://code.highcharts.com/stock/8.2/highstock.js', NULL, NULL, true);
    wp_register_script('highcharts-more', 'https://code.highcharts.com/stock/8.2/highcharts-more.js', array('highcharts-highstock'), NULL, true);
    wp_register_script('highcharts-exporting', 'https://code.highcharts.com/stock/8.2/modules/exporting.js', array('highcharts-highstock'), NULL, true);
    wp_register_script('highcharts-export-data', 'https://code.highcharts.com/stock/8.2/modules/export-data.js', array('highcharts-highstock'), NULL, true);

    // select2

    wp_register_script('select2', $bower_dir . 'select2/dist/js/select2.full.min.js', NULL, NULL, true);
    wp_register_script('select2-fr', $bower_dir . 'select2/dist/js/i18n/fr.js', array('select2'), NULL, true);

    // app dependencies

    wp_register_script('leaflet', $bower_dir . 'leaflet/dist/leaflet.js', NULL, NULL, true);
    wp_register_script('leaflet-cluster', $child_js_dir . 'leaflet-cluster.js', NULL, NULL, true);

    wp_register_script('jszip', $bower_dir . 'jszip/dist/jszip.min.js', NULL, NULL, true);
    wp_register_script('FileSaver', $bower_dir . 'FileSaver/dist/FileSaver.min.js', NULL, NULL, true);    
    wp_register_script('ion-slider', $bower_dir . 'ion.rangeSlider/js/ion.rangeSlider.min.js', NULL, NULL, true);
    wp_register_script('vector-grid', $child_js_dir . 'vector-grid.js', NULL, NULL, true);
    //wp_register_script ( 'zoom', $child_js_dir . 'zoom.js', NULL, NULL, true );
    wp_register_script('sync', $child_js_dir . 'sync.js', NULL, NULL, true);
    wp_register_script('nearest', $child_js_dir . 'nearest.js', NULL, NULL, true);

    // COMPONENTS

    wp_register_script('map-renderer', $js_dir . 'map-renderer.js', array('jquery'), NULL, true);
    wp_register_script('renderer', $js_dir . 'renderer.js', array('jquery', 'highcharts-highstock'), NULL, true);

    wp_register_script('page-tour', $bower_dir . 'pe-page-tour/page-tour.js', array('jquery-ui-position', 'js-cookie'), NULL, true);

    wp_enqueue_script('child-functions');

    wp_enqueue_script('select2');
    wp_enqueue_script('select2-fr');

    // PAGE CONDITIONALS

    if (is_archive()) {

        wp_enqueue_script('archive-functions');

    }

  if ( is_singular ( 'case-study' ) || is_singular ( 'resource' ) ) {

        wp_enqueue_script('case-study-functions');
  }

  if ( is_page ( 'learn' ) || is_page ( 'apprendre' ) || is_singular ( 'resource' ) ) {

    wp_enqueue_script ( 'training-functions' );

    //wp_enqueue_script ( 'isotope', 'https://unpkg.com/isotope-layout@3/dist/isotope.pkgd.min.js', null, null, true );

  }

}

add_action('wp_enqueue_scripts', 'child_theme_enqueue');

//
// ADMIN JS
//

function admin_js() {


  wp_register_script ( 'timeline-admin', get_stylesheet_directory_uri() . '/resources/js/admin-timeline.js', array ( 'jquery', 'jquery-ui-autocomplete' ), NULL, true );

  wp_enqueue_script ( 'timeline-admin' );

}

add_action ( 'admin_enqueue_scripts', 'admin_js' );



//
// WPML
//

add_filter('icl_ls_languages', 'wpml_ls_filter');

function wpml_ls_filter($languages)
{
    global $sitepress;
    if ($_SERVER["QUERY_STRING"]) {
        if (strpos(basename($_SERVER['REQUEST_URI']), $_SERVER["QUERY_STRING"]) !== false) {

            foreach ($languages as $lang_code => $language) {
                $languages[$lang_code]['url'] = $languages[$lang_code]['url'] . '?' . $_SERVER["QUERY_STRING"];
            }
        }
    }
    return $languages;
}

//
// ARCHIVE
//

function my_change_sort_order($query)
{

    if (!is_admin() && $query->is_main_query()) {

        if (is_post_type_archive('variable') || is_archive('var-type')) {

            $query->set('order', 'ASC');
            $query->set('orderby', 'menu_order');
            $query->set('posts_per_page', '-1');

        }

    }

}

add_action('pre_get_posts', 'my_change_sort_order');

//
// APP FUNCTIONS
//

// GET LOCATION

function get_location($loc)
{

    $all_locations = array('mon' => 'Montréal, QC', 'ott' => 'Ottawa, ON');

    $location = '';

    if (isset ($all_locations[$loc])) {
        $location = $all_locations[$loc];
    }

    return $location;

}

// GET LOCATION NAME BY ID

function get_location_by_ID($loc)
{

    if (isset ($loc) && !empty ($loc)) {

        # remove possible bad stuff
        $loc = preg_replace("/[^a-zA-Z0-9]+/", "", $loc);

        if (defined('ICL_LANGUAGE_CODE') && 'fr' == ICL_LANGUAGE_CODE) {
            $columns = array("id_code as geo_id", "geo_name", "gen_term_fr as generic_term", "location", "province_fr as province", "lat", "lon");

        } else {

            $columns = array("id_code as geo_id", "geo_name", "gen_term as generic_term", "location", "province", "lat", "lon");
        }

        require_once locate_template('resources/app/db.php');

        $main_query = mysqli_query($GLOBALS['vars']['con'], "SELECT " . implode(", ", $columns) . " FROM all_areas WHERE id_code = '" . $loc . "'") or die (mysqli_error($GLOBALS['vars']['con']));

        $row = mysqli_fetch_assoc($main_query);

        return $row;

    } else {

        return false;

    }

}

// GET LOCATION NAME BY COORDS

// helper function - distance between coordinates

function distance($lat1, $lon1, $lat2, $lon2)
{

    $theta = $lon1 - $lon2;
    $dist = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
    $dist = acos($dist);
    $dist = rad2deg($dist);

    return $dist;

}

function get_location_by_coords($lat, $lon, $sealevel=false)
{

    if ((isset ($lat) && !empty ($lat)) && (isset ($lon) && !empty ($lon))) {

        if (defined('ICL_LANGUAGE_CODE') && 'fr' == ICL_LANGUAGE_CODE) {

            $columns = array("all_areas.id_code as geo_id", "geo_name", "gen_term_fr as generic_term", "location", "province_fr as province", "lat", "lon");

        } else {

            $columns = array("all_areas.id_code as geo_id", "geo_name", "gen_term as generic_term", "location", "province", "lat", "lon");

        }

        if ($sealevel){
            $join="JOIN all_areas_sealevel ON (all_areas.id_code=all_areas_sealevel.id_code)";
        } else {
            $join="";
        }

        require_once locate_template('resources/app/db.php');

        // range of coordinates to search between
        $range = 0.1;

        $main_query = mysqli_query($GLOBALS['vars']['con'], "SELECT " . implode(",", $columns) . "
      , DISTANCE_BETWEEN($lat, $lon, lat,lon) as distance
      FROM all_areas
      $join
      WHERE lat BETWEEN " . (round($lat, 2) - $range) . " AND " . (round($lat, 2) + $range) . "
      AND lon BETWEEN " . (round($lon, 2) - $range) . " AND " . (round($lon, 2) + $range) . "
      AND gen_term NOT IN ('Railway Point', 'Railway Junction', 'Urban Community', 'Administrative Sector')
      ORDER BY DISTANCE
      LIMIT 1") or die (mysqli_error($GLOBALS['vars']['con']));

        if ($main_query->num_rows > 0) {

            $selected_place = mysqli_fetch_assoc($main_query);

            return $selected_place;

        } else {

            return 'Point';
        }

    } else {

        return 'Point';

    }

}

// GET PROVINCE ABBREVIATION

function short_province($province)
{
    $provinces = array("British Columbia" => "BC", "Colombie-Britannique" => "BC", "Yukon" => "YT", "Northwest Territories" => "NT", "Territoires du Nord-Ouest" => "NT", "Alberta" => "AB", "Newfoundland and Labrador" => "NL", "Terre-Neuve-et-Labrador" => "NL", "Saskatchewan" => "SK", "Ontario" => "ON", "Manitoba" => "MB", "Nova Scotia" => "NS", "Nouvelle-Écosse" => "NS", "Quebec" => "QC", "Québec" => "QC", "New Brunswick" => "NB", "Nouveau-Brunswick" => "NB", "Prince Edward Island" => "PE", "Île-du-Prince-Édouard" => "PE", "Nunavut" => "NU");

    if (array_key_exists($province, $provinces)) {
        return $provinces[$province];
    } else {
        return $province;
    }

}


//
// ACF OPTIONS PAGES
//

if (function_exists('acf_add_options_page')) {

    acf_add_options_page(array('page_title' => 'Variable Archive', 'menu_title' => 'Archive', 'menu_slug' => 'options_var', 'capability' => 'edit_posts', 'parent_slug' => 'edit.php?post_type=variable', 'position' => false, 'icon_url' => 'dashicons-images-alt2', 'redirect' => false,));

}


//

// Add the meta box callback function

function admin_init()
{

    add_meta_box('case_study_parent_id', 'Case Study Parent', 'set_case_study_parent_id', 'case-study', 'side', 'low');

}

add_action('admin_init', 'admin_init');

// Meta box for setting the parent ID

function set_case_study_parent_id()
{

    global $post;

    $master = array('');

    $current_parent = $post->post_parent;

    $custom = get_post_custom($post->ID);

    //$parent_id = $custom['parent_id'][0];

    echo '<p>Select a sub-sector page to be the parent of this Case Study.</p>';

    // query posts under 'sector' parent

    $sector_parent_ID = filtered_ID_by_path('explore/sector', ICL_LANGUAGE_CODE);

    $sector_query = get_pages(array('posts_per_page' => -1, 'child_of' => $sector_parent_ID));

    echo '<select id="parent_id" name="parent_id">';

    echo '<option value="">None</option>';
    echo '<option value="" disabled>Sectors</option>';

    if (!empty ($sector_query)) {

        foreach ($sector_query as $sector_page) {

            $ancestors = get_ancestors($sector_page->ID, 'page');

            echo '<option value="' . $sector_page->ID . '"';

            if (count($ancestors) < 3)
                echo ' disabled';

            if ($current_parent == $sector_page->ID)
                echo ' selected';

            echo '>';

            for ($i = 1; $i < count($ancestors); $i += 1) {

                echo '— ';

            }

            echo get_the_title($sector_page->ID);

            echo '</option>';

        }


    }

    echo '</select>';

    // create a custom nonce for submit verification later
    echo '<input type="hidden" name="parent_id_noncename" value="' . wp_create_nonce(__FILE__) . '">';

}

// Save the meta data
function save_case_study_parent_id($post_id)
{

    global $post;

    // make sure data came from our meta box
    if (isset ($_POST['parent_id_noncename'])) {
        if (!wp_verify_nonce($_POST['parent_id_noncename'], __FILE__))
            return $post_id;
    }

    if (isset ($_POST['parent_id']) && ($_POST['post_type'] == 'case-study')) {

        $data = $_POST['parent_id'];
        update_post_meta($post_id, 'parent_id', $data);

    }

}

add_action("save_post", "save_case_study_parent_id");
