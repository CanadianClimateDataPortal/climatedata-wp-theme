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

// process any deployment specific configuration
if (stream_resolve_include_path('local_config.php')) {
    include_once 'local_config.php';
} else {
    include_once 'default_config.php';
}

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
    wp_register_script('iframe-functions', $child_js_dir . 'iframe-functions.js', array('jquery', 'child-functions'), NULL, true);
    // VENDOR

    wp_register_script('js-cookie', $bower_dir . 'js-cookie/src/js.cookie.js', NULL, true);
    //wp_register_script ( 'jquery-mousewheel', $bower_dir . 'jquery-mousewheel/jquery.mousewheel.min.js', array ( 'jquery' ), NULL, true );
    wp_register_script('listnav', $bower_dir . 'pe-listnav/jquery-listnav.js', NULL, NULL, true);

    // highcharts

    wp_register_script('highcharts-highstock', 'https://code.highcharts.com/stock/8.2/highstock.js', NULL, NULL, true);
    wp_register_script('highcharts-more', 'https://code.highcharts.com/stock/8.2/highcharts-more.js', array('highcharts-highstock'), NULL, true);
    wp_register_script('highcharts-exporting', 'https://code.highcharts.com/stock/8.2/modules/exporting.js', array('highcharts-highstock'), NULL, true);
    wp_register_script('highcharts-export-data', 'https://code.highcharts.com/stock/8.2/modules/export-data.js', array('highcharts-exporting'), NULL, true);
    wp_register_script('highcharts-offline-exporting', 'https://code.highcharts.com/stock/8.2/modules/offline-exporting.js', array('highcharts-exporting'), NULL, true);

    // select2

    wp_register_script('select2', $bower_dir . 'select2/dist/js/select2.full.min.js', NULL, NULL, true);
    wp_register_script('select2-fr', $bower_dir . 'select2/dist/js/i18n/fr.js', array('select2'), NULL, true);

    // app dependencies

    wp_register_script('leaflet', $bower_dir . 'leaflet/dist/leaflet.js', NULL, NULL, true);
    wp_register_script('leaflet-geoman', $child_js_dir . 'leaflet-geoman.min.js', array('leaflet'), NULL, true);
    wp_register_script('leaflet-cluster', $child_js_dir . 'leaflet-cluster.js', array('leaflet'), NULL, true);
    wp_register_script('leaflet-cluster-subgroup', $child_js_dir . 'leaflet.featuregroup.subgroup.js', array('leaflet-cluster'), NULL, true);

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
    
    
    if ( is_page_template ( 'tpl-news.php' ) ) {
      
      wp_register_script ( 'news-functions', $child_js_dir . 'news.js', array ( 'jquery' ), false, true );
      
      wp_localize_script ( 'news-functions', 'ajax_data',
        array (
          'url' => admin_url ( 'admin-ajax.php' )
        )
      );
      
      wp_enqueue_script ( 'news-functions' );
      
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

// get a single key from array, or $default if missing (source: https://stackoverflow.com/questions/9555758/default-array-values-if-key-doesnt-exist)
function arr_get($array, $key, $default = null){
    return isset($array[$key]) ? $array[$key] : $default;
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

// Return a string of valid javascript (enclosed in <script> tag) that create a Map object including all ACF fields of all variables
function render_variables_fields()
{
    $rendered_variables_fields_script = '<script type="text/javascript">const varData = new Map();';

    $the_wp_query = new WP_Query(array(
            'post_type' => 'variable',
            'status' => 'publish',
            'orderby' => 'menu_order',
            'order' => 'ASC',
            'posts_per_page' => -1)
    );

    if ($the_wp_query->have_posts()) {
        while ($the_wp_query->have_posts()) {
            $the_wp_query->the_post();
            $var_fields = get_fields();
            $var_name = $var_fields['var_name'];
            if ($var_name != 'slr') {
                $rendered_variables_fields_script .= "varData.set('$var_name', " . json_encode(get_fields()) . ");\n";
            }
        }
    }
    $rendered_variables_fields_script .= '</script>';
    return $rendered_variables_fields_script;
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

// Add sup/sub to MCE editor
function my_mce_buttons_2( $buttons ) { 
  /**
   * Add in a core button that's disabled by default
   */
  $buttons[] = 'superscript';
  $buttons[] = 'subscript';

  return $buttons;
}
add_filter( 'mce_buttons_2', 'my_mce_buttons_2' );

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
function save_case_study_parent_id($post_id) {

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

//
// custom body classes
//

add_filter ( 'custom_body_classes', function ( $classes ) {

	if ( ! is_array ( $classes ) ) {
		$classes = array();
	}

	if ( is_singular ( 'resource' ) ) {

		if ( get_field ( 'asset_type' ) == 'interactive' ) {

			$classes[] = 'has-timeline';

		}

	}

	return $classes;

}, 100 );

//
// ADMIN AJAX
//

function news_filter() {
  
  $query_page = 1;
  $query_tags = array();
  
  $query_args = array (
    'post_type' => 'post',
    'post_status' => 'publish',
    'posts_per_page' => 12
  );
  
  // tax_query
  
  if (
    isset ( $_GET['tags'] ) &&
    !empty ( $_GET['tags'] )
  ) {
    
    $query_args['tax_query'] = array (
      array (
        'taxonomy' => 'post_tag',
        'field' => 'term_id',
        'terms' => explode ( ',', $_GET['tags'] )
      )
    );
    
  }
  
  // paged
  
  if ( 
    isset ( $_GET['page_num'] ) &&
    !empty ( $_GET['page_num'] )
  ) {
    $query_page = $_GET['page_num'];
  }
  
  $query_args['paged'] = $query_page;
  
  $result = array(
    'current_page' => $query_page,
    'max_pages' => 1,
    'output' => ''
  );
  
  $news_query = new WP_Query ( $query_args );
  
  if ( $news_query->have_posts() ) {
    
    $result['max_pages'] = $news_query->max_num_pages;
    
    while ( $news_query->have_posts() ) {
      $news_query->the_post();
      
      $item = array (
        'id' => get_the_ID(),
        'title' => get_the_title(),
        'permalink' => get_permalink(),
        'post_type' => get_post_type(),
        'content' => get_the_content()
      );
      
      $output = '<div id="news-post-' . $item['id'] . '" class="col-12 col-sm-6 col-md-4 px-2 pb-3">';
      
      ob_start();
      include ( locate_template ( 'previews/post.php' ) );
      $output .= ob_get_clean();
      
      $output .= '</div>';
      
      $result['output'] .= $output;
      
    }
    
  }
  
  print_r ( json_encode ( $result ) );
  
  die();
  
}

add_action ( 'wp_ajax_get_news_posts', 'news_filter' );
add_action ( 'wp_ajax_nopriv_get_news_posts', 'news_filter' );

//
// TAGS - SHOW AS CHECKBOXES
// https://rudrastyh.com/wordpress/tag-metabox-like-categories.html
//

function rudr_post_tags_meta_box_remove() {
  $id = 'tagsdiv-post_tag'; // you can find it in a page source code (Ctrl+U)
  $post_type = 'post'; // remove only from post edit screen
  $position = 'side';
  remove_meta_box( $id, $post_type, $position );
}
add_action( 'admin_menu', 'rudr_post_tags_meta_box_remove');

/*
 * Add
 */
function rudr_add_new_tags_metabox(){
  $id = 'rudrtagsdiv-post_tag'; // it should be unique
  $heading = 'Tags'; // meta box heading
  $callback = 'rudr_metabox_content'; // the name of the callback function
  $post_type = 'post';
  $position = 'side';
  $pri = 'default'; // priority, 'default' is good for us
  add_meta_box( $id, $heading, $callback, $post_type, $position, $pri );
}
add_action( 'admin_menu', 'rudr_add_new_tags_metabox');
 
/*
 * Fill
 */
function rudr_metabox_content($post) {  
 
  // get all blog post tags as an array of objects
  $all_tags = get_terms( array('taxonomy' => 'post_tag', 'hide_empty' => 0) ); 
 
  // get all tags assigned to a post
  $all_tags_of_post = get_the_terms( $post->ID, 'post_tag' );  
 
  // create an array of post tags ids
  $ids = array();
  if ( $all_tags_of_post ) {
    foreach ($all_tags_of_post as $tag ) {
      $ids[] = $tag->term_id;
    }
  }
 
  // HTML
  echo '<div id="taxonomy-post_tag" class="categorydiv">';
  echo '<input type="hidden" name="tax_input[post_tag][]" value="0" />';
  echo '<ul>';
  foreach( $all_tags as $tag ){
    // unchecked by default
    $checked = "";
    // if an ID of a tag in the loop is in the array of assigned post tags - then check the checkbox
    if ( in_array( $tag->term_id, $ids ) ) {
      $checked = " checked='checked'";
    }
    $id = 'post_tag-' . $tag->term_id;
    echo "<li id='{$id}'>";
    echo "<label><input type='checkbox' name='tax_input[post_tag][]' id='in-$id'". $checked ." value='$tag->slug' /> $tag->name</label><br />";
    echo "</li>";
  }
  echo '</ul></div>'; // end HTML
}

/**
 * Fix Motion.page styling conflict with WPML
 *
 * @return void
 */
function motion_page_styles() {
	if ( ! isset( $_GET['page'] ) ) {
		return;
	}

	if ( $_GET['page'] !== 'motionpage' ) {
		return;
	} ?>

	<style>
        #mp-main input[type="text"] {
            color: #ffffff;
        }
	</style>
	<?php
}

add_action( 'admin_head', 'motion_page_styles' );

/**
 * Register block pattern categories for interactive CPT.
 *
 * @return void
 */
function register_interactive_block_pattern_category() {
	register_block_pattern_category(
		'interactive-sections',
		[ 'label' => __( 'Interactive Sections', 'cdc-block-pattern-category' ) ]
	);
}

// add_action( 'init', 'register_interactive_block_pattern_category' );

/**
 * Register block patterns for interactive CPT.
 *
 * @return void
 */
function register_interactive_block_pattern() {
	register_block_pattern(
		'interactive-sections/interactive-section-2-cols',
		[
			'title'       => __( 'Basic interactive section with 2 columns', 'cdc-block-pattern' ),
			'description' => __( 'A basic interactive section with 2 columns.', 'cdc-block-pattern' ),
			'categories'  => [ 'interactive-sections' ],
			'content'     => '<!-- wp:cover {"overlayColor":"light-green-cyan","isDark":false,"className":"interactive-section full-height"} --><div class="wp-block-cover is-light interactive-section full-height" id="section-ID"><span aria-hidden="true" class="wp-block-cover__background has-light-green-cyan-background-color has-background-dim-100 has-background-dim"></span><div class="wp-block-cover__inner-container"><!-- wp:columns {"className":"overlap-container is-mobile"} --><div class="wp-block-columns overlap-container is-mobile"><!-- wp:column {"className":"overlap-container is-desktop"} --><div class="wp-block-column overlap-container is-desktop"><!-- wp:paragraph --><p id="section-ID-elm-ID">Text on column 1</p><!-- /wp:paragraph --></div><!-- /wp:column --><!-- wp:column {"className":"overlap-container is-desktop"} --><div class="wp-block-column overlap-container is-desktop"><!-- wp:paragraph --><p id="section-ID-elm-ID">Text on column 2</p><!-- /wp:paragraph --></div><!-- /wp:column --></div><!-- /wp:columns --></div></div><!-- /wp:cover -->'
		]
	);
}

// add_action( 'init', 'register_interactive_block_pattern' );

if (!function_exists('str_ends_with')) {
    function str_ends_with($str, $end) {
        return (@substr_compare($str, $end, -strlen($end))==0);
    }
}

function allow_custom_host( $allow, $host, $url ) {
    if ( str_ends_with($host, 'climatedata.ca') || str_ends_with($host, 'donneesclimatiques.ca') || str_ends_with($host, 'crim.ca')) {
        $allow = true;
    }
    return $allow;
}
add_filter( 'http_request_host_is_external', 'allow_custom_host', 10, 3 );
