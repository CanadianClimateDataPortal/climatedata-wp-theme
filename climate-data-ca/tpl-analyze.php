<?php
  
  /*
    
    Template Name: Analyze
    
  */
  
  //
  // ENQUEUE
  //
  
  function tpl_enqueue() {
    
    wp_enqueue_script ( 'analyze-functions' );
    
    wp_enqueue_script ( 'highcharts-highstock' );
    wp_enqueue_script ( 'highcharts-more' );
    wp_enqueue_script ( 'highcharts-exporting' );
    wp_enqueue_script ( 'highcharts-export-data' );
    
    wp_enqueue_script ( 'leaflet' );
    
    wp_enqueue_script ( 'vector-grid' );
    wp_enqueue_script ( 'sync' );
    wp_enqueue_script ( 'nearest' );
    
    wp_enqueue_script ( 'jquery-ui-core' );
    wp_enqueue_script ( 'jquery-ui-widget' );
    wp_enqueue_script ( 'jquery-effects-core' );
    wp_enqueue_script ( 'jquery-ui-tabs' );
    
    wp_enqueue_script ( 'moment', 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment.min.js', null, null, true );
    wp_enqueue_script ( 'tempusdominus', 'https://cdnjs.cloudflare.com/ajax/libs/tempusdominus-bootstrap-4/5.0.1/js/tempusdominus-bootstrap-4.min.js', array ( 'jquery' ), null, true );
    
    wp_enqueue_style ( 'tempusdominus', 'https://cdnjs.cloudflare.com/ajax/libs/tempusdominus-bootstrap-4/5.0.1/css/tempusdominus-bootstrap-4.min.css', null, null, 'all' );
    
  }
  
  add_action ( 'wp_enqueue_scripts', 'tpl_enqueue' );
  
  //
  // TEMPLATE
  //

  get_header();
  
  if ( have_posts() ) : while ( have_posts() ) : the_post();
  
  
?>

<main id="analyze-content">
  
  <?php
    
    include ( locate_template ( 'template/hero/hero.php' ) );
    
  ?>
    
  <section id="" class="page-section has-subsections">
    
    <div class="section-container">
      <div class="container-fluid">
        <div class="row">
          <div class="col-3">
            
            <div id="analyze-steps">
              
              <div class="accordion-head">
                <h5>Choose a dataset</h5>
              </div>
              
              <div class="accordion-content">
                form
              </div>
              
              <div class="accordion-head">
                <h5>Select location</h5>
              </div>
              
              <div class="accordion-content">
                form
              </div>
              
              <div class="accordion-head">
                <h5>Customize variable</h5>
              </div>
              
              <div class="accordion-content">
                form
              </div>
              
              <div class="accordion-head">
                <h5>Advanced options</h5>
              </div>
              
              <div class="accordion-content">
                form
              </div>
              
              <div class="accordion-head">
                <h5>Choose a timeframe</h5>
              </div>
              
              <div class="accordion-content">
                form
              </div>
              
            </div>
            
            <div class="col-9">
              map
            </div>
            
          </div>
        </div>    
      </div>  
    </div>
    
  </section>
  
</main>

<div id="dummy-chart" style="position: absolute; left: -9999px; top: -9999px; width: 500px; height: 500px;"></div>

<?php
  
  endwhile; endif;
  
  get_footer();
  
?>