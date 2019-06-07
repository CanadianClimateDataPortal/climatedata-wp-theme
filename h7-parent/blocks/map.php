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
  
  // RCP
  
  $rcp = get_sub_field ( 'scenario' );
  
  if ( $rcp == '' ) {
    $rcp = 'rcp26';
  }
  
  // layer type
  
  $panes = array();
  
  if ( get_sub_field ( 'sector' ) != '' ) {
    
    // sector panes
    
    $panes = array (
      "sector" => array (
        "type" => "geojson",
        "style" => array (
          "zIndex" => 403
        )
      )
    );
    
  } else {
    
    // raster panes
    
    $panes = array (
      "raster" => array (
        "type" => "wms",
        "style" => array (
          "zIndex" => 400,
          "pointerEvents" => "none"
        )
      ),
      "grid" => array (
        "type" => "protobuf",
        "style" => array (
          "zIndex" => 500,
          "pointerEvents" => "none"
        )
      )
    );
    
  }
  
?>

<script type="text/javascript">
  
</script>

<div id="<?php echo $block_ID; ?>-container" class="renderable map-container" 
  data-map-variables='<?php echo $map_vars; ?>'
  data-map-rcp='<?php echo $rcp; ?>'
  data-map-panes='<?php echo json_encode ( $panes ); ?>'
>
  <div id="<?php echo $block_ID; ?>-map" class="map"></div>
  
  <div id="<?php echo $block_ID; ?>-filters" class="map-filters d-lg-flex flex-lg-wrap" data-layer="raster">
    <?php
      
      if ( count ( $var_IDs ) > 1 ) {
        
    ?>
    
    <div id="<?php echo $block_ID; ?>-vars" class="filter-container col-12 col-lg-4">
      
      <h6><?php _e ( 'Variable', 'cdc' ); ?></h6>
      
      <select id="<?php echo $block_ID; ?>-var-select" data-container-css-class="btn rounded-pill" data-dropdown-css-class="big-menu-dropdown">
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

