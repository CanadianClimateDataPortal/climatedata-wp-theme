<?php

  /*

    Template Name: Location

  */

  //
  // ENQUEUE
  //

  function tpl_enqueue() {

    wp_enqueue_script ( 'highcharts-highstock' );
    wp_enqueue_script ( 'highcharts-more' );
    wp_enqueue_script ( 'highcharts-exporting' );
    wp_enqueue_script ( 'highcharts-export-data' );

    wp_enqueue_script ( 'leaflet' );

    wp_enqueue_script ( 'vector-grid' );
    
    // page tour
  
    wp_enqueue_script ( 'jquery-ui-core' );
    wp_enqueue_script ( 'jquery-ui-position' );
    wp_enqueue_script ( 'page-tour' );

    wp_enqueue_script ( 'location-functions' );

  }

  add_action ( 'wp_enqueue_scripts', 'tpl_enqueue' );

  //
  // TEMPLATE
  //

  get_header();
  $dataset_name = arr_get($_GET, 'dataset_name', 'cmip6');


if ( have_posts() ) : while ( have_posts() ) : the_post();

?>

<section id="location-hero" class="page-section first-section">
  <div id="location-map"></div>
  <div id="location-hero-bg"></div>

  <div id="location-hero-content" class="container-fluid">
    <div class="row">
      <div class="col-6 offset-1 col-md-4 hero-content text-white">
        <h6><?php echo $GLOBALS['vars']['current_data']['location_data']['lat'] . 'ºN, ' . abs ( $GLOBALS['vars']['current_data']['location_data']['lon'] ) . 'º W'; ?></h6>

        <h1><?php echo $GLOBALS['vars']['current_data']['location_data']['geo_name'] . ', ' . short_province ( $GLOBALS['vars']['current_data']['location_data']['province'] ); ?></h1>

        <div id="location-hero-default">
          <?php the_field ( 'hero_text' ); ?>
        </div>

        <div id="location-hero-data" style="display: none;">
          <p><?php printf ( __( 'For the 1971-2000 period, the annual average temperature was %s&nbsp;ºC. Under a high emissions scenario, annual average temperatures are projected to be %s&nbsp;ºC for the 2021-2050 period, %s&nbsp;ºC for the 2051-2080 period and %s&nbsp;ºC for the last 30 years of this century.', 'cdc' ), '<strong id="tg_mean_1971"></strong>', '<strong id="tg_mean_2021"></strong>', '<strong id="tg_mean_2051"></strong>', '<strong id="tg_mean_2071"></strong>' ); ?></p>

          <p><?php printf ( __( 'Average annual precipitation for the 1971-2000 period was %s&nbsp;mm. Under a high emissions scenario, this is projected to be %s%% higher for the 2051-2080 period and %s%% higher for the last 30 years of this century.', 'cdc' ), '<strong id="prcptot_1971"></strong>', '<strong id="prcptot_delta_2051_percent"></strong>', '<strong id="prcptot_delta_2071_percent"></strong>' ); ?></p>
            <p><?php printf( __('* These values reflect those of the ~10 km x 6 km grid cell that %s lies within and do not necessarily reflect the exact point that you select, particularly in areas with varying microclimates.','cdc'), $GLOBALS['vars']['current_data']['location_data']['geo_name'] ); ?>
            </p>

            <div class="navbar chart-navbar d-flex align-items-center mb-5">
                <div class="nav-item flex-grow-1 d-flex">
                    <div class="form-select col-10 offset-4 col-sm-4">
                        <div class="btn-group btn-group-toggle w-100" data-toggle="buttons">
                            <label class="btn btn-outline-light <?php echo $dataset_name == 'cmip5'? 'active':'';?>" style="border-top-left-radius: 25px;border-bottom-left-radius: 25px;padding: 13px;"> <input type="radio" name="location-dataset" autocomplete="off" value="cmip5" <?php echo $dataset_name == 'cmip5'? 'checked':'';?>>CMIP5</label>
                            <label>&nbsp;</label>
                            <label class="btn btn-outline-light <?php echo $dataset_name == 'cmip6'? 'active':'';?>" style="border-top-right-radius: 25px;border-bottom-right-radius: 25px;padding: 13px;"> <input type="radio" name="location-dataset" autocomplete="off" value="cmip6" <?php echo $dataset_name == 'cmip6'? 'checked':'';?>>CMIP6</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</section>

<main 
  id="location-content" 
  data-location="<?php echo $_GET['loc']; ?>" 
  data-lat="<?php echo $GLOBALS['vars']['current_data']['location_data']['lat']; ?>" 
  data-lon="<?php echo $GLOBALS['vars']['current_data']['location_data']['lon']; ?>"
>

  <section id="location-data" class="page-section">
    <div id="location-tag-wrap" class="d-none d-lg-block">
      <div id="location-tag">
        <span class="tag-icon cdc-icon icon-location"></span>
        <a href="http://climatedata.demo/explore/location/" id="location-toggle-label" class="supermenu-toggle"><?php echo $GLOBALS['vars']['current_data']['location_data']['geo_name'] . ', ' . short_province ( $GLOBALS['vars']['current_data']['location_data']['province'] ); ?></a>
      </div>
    </div>

    <a href="http://climatedata.demo/explore/location/" id="location-toggle" class="supermenu-toggle text-secondary all-caps d-none d-lg-block"><i class="fas fa-times"></i> <?php _e ( 'Change Location', 'cdc' ); ?></a>

    <header class="section-head container-fluid">
      <div class="row">
        <div class="col-10 offset-1 text-center">
          <h2 class="text-body"><?php printf ( __ ( 'Annual Values for %s', 'cdc' ), $GLOBALS['vars']['current_data']['location_data']['geo_name'] ); ?></h2>
        </div>
      </div>
    </header>

    <div id="data-blocks">
      <?php

        $var_types = get_terms ( array (
          'taxonomy' => 'var-type',
          'hide_empty' => true,
          'exclude' => array ( 10 ),
        ) );

        foreach ( $var_types as $var_type ) {

          $accent = get_field ( 'vartype_colour', $var_type->taxonomy . '_' . $var_type->term_id );

      ?>

      <div class="var-type container-fluid">
        <div class="row">
          <div class="col-10 offset-1 col-sm-8 offset-sm-2 col-md-4 offset-md-1 col-lg-3 text-<?php echo $accent; ?>">
            <h4 class="text-center text-sm-left"><span class="cdc-icon icon-var-<?php echo $var_type->slug; ?>"></span><?php echo $var_type->name; ?></h4>
          </div>

          <div class="col-10 offset-1 col-sm-8 offset-sm-2 col-md-6 offset-md-0 col-lg-4 offset-lg-0">
            <?php

              $vars_by_type = new WP_Query ( array (
                'post_type' => 'variable',
                'posts_per_page' => -1,
                'orderby' => 'menu_order',
                'order' => 'asc',
                'tax_query' => array (
                  array (
                    'taxonomy' => 'var-type',
                    'terms' => $var_type->term_id
                  )
                )
              ) );

              if ( $vars_by_type->have_posts() ) :

                $var_num = 1;

            ?>

            <select name="location-select-<?php echo $var_type->slug; ?>" id="location-select-<?php echo $var_type->slug; ?>" class="location-data-select select2 w-100" data-container-css-class="big-menu btn btn-lg btn-outline-primary rounded-pill w-100" data-dropdown-css-class="big-menu-dropdown">

              <?php

                while ( $vars_by_type->have_posts() ) :
                  $vars_by_type->the_post();
                  if ( get_field( 'var_name' ) != 'spei_3m' && get_field( 'var_name' ) != 'slr') { // we exclude specificly spei_3m / slr
                  $selected = false;

                  if (
                    isset ( $_GET['location-select-' . $var_type->slug] ) &&
                    get_field ( 'var_name' ) == $_GET['location-select-' . $var_type->slug]
                  ) {
                    $selected = true;
                  }

              ?>

              <option value="<?php the_field ( 'var_name' ); ?>" <?php echo ( $selected == true ) ? 'selected' : ''; ?>><?php the_title(); ?></option>

              <?php

                  $var_num++;
                  }

                endwhile;

              ?>

            </select>
          </div>
        </div>
        
        <div id="<?php echo $var_type->slug; ?>-chart" class="var-data-placeholder">
          <div class="col-10 offset-1 text-center">
            <?php _e ( 'Loading', 'cdc' ); ?> …
          </div>
        </div>

        <?php

          endif;

          wp_reset_postdata();

        ?>
      </div>

      <?php

        }

      ?>

    </div>
  </section>
</main>

<div class="page-tour" id="page-tour" data-steps='<?php echo json_encode ( get_field ( 'tour' ) ); ?>'></div>

<?php

  endwhile; endif;

  get_footer();

?>
