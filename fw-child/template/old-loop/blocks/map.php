<?php
  
  wp_enqueue_script ( 'leaflet' );
  
  wp_enqueue_script ( 'ion-slider' );
  
  wp_enqueue_script ( 'vector-grid' );
  wp_enqueue_script ( 'zoom' );
  wp_enqueue_script ( 'sync' );
  wp_enqueue_script ( 'nearest' );
  
  wp_enqueue_script ( 'map-renderer' );
  wp_enqueue_script ( 'renderer' );
    
  wp_enqueue_script ( 'health-sectors' );
  
  // variable names
  
  $var_IDs = get_sub_field ( 'variable' );
  $map_vars = '[';
  
  if ( !empty ( $var_IDs != '' ) ) {
    
    $i = 0;
    
    foreach ( $var_IDs as $var_ID ) {
      
      if ( $i != 0 ) $map_vars .= ',';
      
      $map_vars .= '"' . get_field ( 'var_name', $var_ID ) . '"';
      
      $i++;
      
    }
    
  }
  
  $map_vars .= ']';
  
  // timesteps
  
  $timesteps = array();
  
  foreach ( $var_IDs as $var_ID ) {
    if ( !empty ( get_field ( 'timestep', $var_ID ) ) ) {
      $timesteps[] = get_field ( 'timestep', $var_ID );
    } else {
      $timesteps[] = 'annual';
    }
  }
  
  $times = array();
  
  foreach ( get_sub_field ( 'time' ) as $time ) {
    $times[] = $time['value'];
  }
  
  if ( empty ( $times ) ) $times = array ( 'ann' );
  
  // center
  
  $init_lat = '';
  $init_lng = '';
  $init_zoom = '';
  
  if ( have_rows ( 'center' ) ) {
    while ( have_rows ( 'center' ) ) {
      the_row();
      
      if ( get_sub_field ( 'lat' ) != '' && get_sub_field ( 'lng' ) != '' ) {
        $init_lat = get_sub_field ( 'lat' );
        $init_lng = get_sub_field ( 'lng' );
      }
      
      if ( get_sub_field ( 'zoom' ) != '' ) {
        $init_zoom = get_sub_field ( 'zoom' );
      }
      
    }
  }
  
  // RCP
  
  $rcp = get_sub_field ( 'scenario' );
  
  if ( $rcp == '' ) {
    $rcp = 'rcp26';
  }
  
  if ( strpos ( $rcp, 'vs' ) !== false ) {
    $map_compare = true;
  } else {
    $map_compare = false;
  }
  
  // layer type
  
  $panes = array();
  
  if ( 
    get_sub_field ( 'sector' ) != '' &&
    get_sub_field ( 'sector' ) != 'none'
  ) {
    
    // sector panes
    
    $panes = array (
      "data" => array (
        "type" => "geojson",
        "style" => array (
          "zIndex" => 403
        )
      )
    );
    
  } else {
    
    // raster panes
    
    $panes = array (
      "data" => array (
        "type" => "wms",
        "style" => array (
          "zIndex" => 400,
          "pointerEvents" => "none"
        )
      )
    );
    
  }
  
?>

<div id="<?php echo $block_ID; ?>-container" class="renderable map-object <?php echo ( $map_compare == true ) ? 'compare' : ''; ?>" 
  data-map-variables='<?php echo $map_vars; ?>'
  data-map-lat="<?php echo $init_lat; ?>"
  data-map-lng="<?php echo $init_lng; ?>"
  data-map-zoom="<?php echo $init_zoom; ?>"
  data-map-rcp='<?php echo $rcp; ?>'
  data-map-time='<?php echo json_encode ( $times ); ?>'
  data-map-timesteps='<?php echo json_encode ( $timesteps ); ?>'
  data-map-panes='<?php echo json_encode ( $panes ); ?>'
>
  <?php
    
    if ( $map_compare == true ) {
            
      $rcp = str_replace ( 'rcp', '', $rcp );
      $rcp = explode ( 'vs', $rcp );
    
  ?>
  
  <div class="d-flex">
    <div class="w-50"><p class="d-inline-block bg-white py-2 px-3 mb-0">RCP <?php echo ( (int) $rcp[0] ) / 10; ?></p></div>
    <div class="w-50"><p class="d-inline-block bg-white py-2 px-3 mb-0">RCP <?php echo ( (int) $rcp[1] ) / 10; ?></p></div>
  </div>
    
  <?php
    
    }
    
  ?>

  <div id="<?php echo $block_ID; ?>-map-container" class="map-container">
    <div id="<?php echo $block_ID; ?>-map" class="map map-full"></div>
    
    <?php
      
      if ( $map_compare == true ) {
      
    ?>
    
    <div id="<?php echo $block_ID; ?>-map-right-container" class="map-right-container">
      <div id="<?php echo $block_ID; ?>-map-right" class="map map-right"></div>
    </div>
    
    <?php
      
      }
      
    ?>
  </div>
  
  <div id="<?php echo $block_ID; ?>-filters" class="map-filters d-lg-flex flex-lg-wrap" data-layer="data">
    <?php
      
      if ( count ( $var_IDs ) > 1 ) {
        
    ?>
    
    <div id="<?php echo $block_ID; ?>-vars" class="filter-container col-12 col-lg-4">
      
      <h6><?php _e ( 'Variable', 'cdc' ); ?></h6>
      
      <select id="<?php echo $block_ID; ?>-var-select" class="filter-var" data-container-css-class="btn rounded-pill" data-dropdown-css-class="big-menu-dropdown">
        <?php 
          
          foreach ( $var_IDs as $var_ID ) {
          
        ?>
        
        <option value="<?php the_field ( 'var_name', $var_ID ); ?>"><?php echo get_the_title ( $var_ID ); ?></option>
        
        <?php
          
          }
          
        ?>
      </select>
      
    </div>
    
    <?php
      
      }
      
    ?>
    
    <?php
      
      if ( count ( get_sub_field ( 'time' ) ) > 1 ) {
        
    ?>
    
    <div id="<?php echo $block_ID; ?>-time" class="filter-container col-12 col-lg-4">
      
      <h6><?php _e ( 'Time', 'cdc' ); ?></h6>
      
      <select id="<?php echo $block_ID; ?>-time-select" class="filter-time" data-container-css-class="btn rounded-pill" data-dropdown-css-class="big-menu-dropdown">
        <?php 
          
          foreach ( get_sub_field ( 'time' ) as $time ) {
          
        ?>
        
        <option value="<?php echo $time['value']; ?>"><?php echo $time['label']; ?></option>
        
        <?php
          
          }
          
        ?>
      </select>
      
    </div>
    
    <?php
      
      }
      
    ?>
    
    <div id="<?php echo $block_ID; ?>-sliders" class="map-sliders col d-flex justify-content-between">
      
      <div class="filter-container slider-container col-6">
        <h6><?php _e ( 'Decade', 'cdc' ); ?></h6>
        
        <div id="<?php echo $block_ID; ?>-range-slider-container" class="decade-slider-container">
          <input id="<?php echo $block_ID; ?>-range-slider" class="decade-slider">
        </div>
      </div>
    
      <div class="filter-container slider-container col-2">
        <h6><?php _e ( 'Opacity', 'cdc' ); ?></h6>
      
        <div id="<?php echo $block_ID; ?>-opacity-slider-container">
          <input id="<?php echo $block_ID; ?>-opacity-slider" class="opacity-slider">
        </div>
      </div>
    
    </div>
    
  </div>
</div>

