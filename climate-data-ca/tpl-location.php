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
    
    wp_enqueue_script ( 'location-functions' );
    
  }
  
  add_action ( 'wp_enqueue_scripts', 'tpl_enqueue' );
  
  //
  // TEMPLATE
  //
  
  get_header();
  
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
          <p><?php printf ( __( 'For the 1951-1980 period, the annual average temperature was %s ºC; for 1981-2010 it was %s ºC. Under a high emissions scenario, annual average temperatures are projected to be %s ºC for the 2021-2050 period, %s ºC for the 2051-2080 period and %s ºC for the last 30 years of this century.', 'cdc' ), '<strong id="location-val-1"></strong>', '<strong id="location-val-2"></strong>', '<strong id="location-val-3"></strong>', '<strong id="location-val-4"></strong>', '<strong id="location-val-5"></strong>' ); ?></p>
          
          <p><?php printf ( __( 'Average annual precipitation for the 1951-1980 period was %s mm. Under a high emissions scenario, this is projected to change by %s%% for the 2021-2050 period, by %s%% for the 2051-2080 period and by %s%% for the last 30 years of this century.', 'cdc' ), '<strong id="location-val-6"></strong>', '<strong id="location-val-7"></strong>', '<strong id="location-val-8"></strong>', '<strong id="location-val-9"></strong>' ); ?></p>
        </div>
      </div>
    </div>
  </div>
</section>

<main id="location-content" data-location="<?php echo $_GET['loc']; ?>" data-lat="<?php echo $GLOBALS['vars']['current_data']['location_data']['lat']; ?>" data-lon="<?php echo $GLOBALS['vars']['current_data']['location_data']['lon']; ?>">

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
                  
              ?>
              
              <option value="<?php the_field ( 'var_name' ); ?>"><?php the_title(); ?></option>
              
              
              <?php    
                  
                  $var_num++;
                  
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

<?php
  
  endwhile; endif;
  
  get_footer();
  
?>