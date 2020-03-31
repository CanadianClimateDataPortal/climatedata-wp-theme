<div class="map-filters container-fluid">
  <div id="var-sliders" class="map-sliders row align-items-end">
    
    <?php
      
      while ( have_rows ( 'variable_sliders' ) ) {
        the_row();
        
        switch ( get_row_layout() ) {
          
          case 'decade' :
        
    ?>
    
    <div class="filter-container slider-container col-7 offset-1">
      <h6><?php _e ( 'Time period', 'cdc' ); ?></h6>
      
      <div id="range-slider-container" class="decade-slider-container" data-min="<?php the_sub_field ( 'min' ); ?>" data-max="<?php the_sub_field ( 'max' ); ?>" data-default="<?php the_sub_field ( 'default' ); ?>">
        <input id="range-slider" class="decade-slider">
      </div>
    </div>
    
    <?php
      
          break;
          
        case 'opacity' :
        
    ?>
  
    <div class="filter-container slider-container col-2 offset-1">
      <h6><?php _e ( 'Opacity', 'cdc' ); ?></h6>
    
      <div id="opacity-slider-container" class="opacity-slider-container" data-min="<?php the_sub_field ( 'min' ); ?>" data-max="<?php the_sub_field ( 'max' ); ?>" data-default="<?php the_sub_field ( 'default' ); ?>">
        <input id="opacity-slider" class="opacity-slider">
      </div>
    </div>
    
    <?php
      
          break;
          
        }
        
      }
      
    ?>
  </div>
</div>
