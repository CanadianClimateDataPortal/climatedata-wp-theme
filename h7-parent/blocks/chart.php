<?php
  
  wp_enqueue_script ( 'highcharts-highstock' );
  wp_enqueue_script ( 'highcharts-more' );
  wp_enqueue_script ( 'highcharts-exporting' );
  wp_enqueue_script ( 'highcharts-export-data' );
  
  wp_enqueue_script ( 'renderer' );
  
  $chart_var = get_sub_field ( 'variable' );
  
  if ( have_rows ( 'coordinates' ) ) {
    while ( have_rows ( 'coordinates' ) ) {
      the_row();
      
      $chart_lat = get_sub_field ( 'latitude' );
      $chart_lon = get_sub_field ( 'longitude' );
      
    }
  }
  
  $chart_units = get_field ( 'units', $chart_var );
  
?>

<div id="<?php echo $block_ID; ?>-container" class="renderable chart-container"
  data-chart-variable="<?php echo get_field ( 'var_name', $chart_var ); ?>"
  data-chart-lat="<?php echo $chart_lat; ?>"
  data-chart-lon="<?php echo $chart_lon; ?>"
  data-chart-month="<?php echo get_sub_field ( 'month' ); ?>"
  data-chart-units='<?php echo '{ "label": "' . $chart_units['label'] . '", "value": "' . $chart_units['value'] . '"}'; ?>'
  data-chart-decimals="<?php echo get_field ( 'decimals', $chart_var ); ?>"
>
  
  <div class="navbar chart-navbar d-block d-lg-flex">
    <h5 class="chart-title w-100 text-primary"><?php echo get_the_title ( $chart_var ); ?></h5>
    
    <div class="nav-item mb-2 mb-lg-0">
      <h6 class="px-0"><span class="cdc-icon icon-location"></span> <?php echo $chart_lat . ', ' . $chart_lon; ?></h6>
    </div>
    
    <div class="nav-item d-flex align-items-center mb-2 mb-lg-0">
      <h6><span class="cdc-icon icon-download-data"></span> <?php _e ( 'Download data', 'cdc' ); ?></h6>
      
      <div class="btn-group btn-group-sm" role="group">
        <a href="#" class="chart-export-data btn btn-sm btn-outline-secondary" data-type="csv">CSV</a>
      </div>
    </div>
    
    <div class="nav-item d-flex align-items-center mb-2 mb-lg-0">
      <h6><span class="cdc-icon icon-download-img"></span> <?php _e ( 'Download image', 'cdc' ); ?></h6>
      
      <div class="btn-group btn-group-sm" role="group">
        <a href="#" class="chart-export-img btn btn-sm btn-outline-secondary " data-type="png">PNG</a>
        <a href="#" class="chart-export-img btn btn-sm btn-outline-secondary" data-type="pdf">PDF</a>
      </div>
    </div>
  </div>
  
  <div class="overlay-content-row">
    <div class="overlay-content-chart">
      <div id="<?php echo $block_ID; ?>-chart-placeholder" class="chart-placeholder"></div>
    </div>
  </div>

</div>