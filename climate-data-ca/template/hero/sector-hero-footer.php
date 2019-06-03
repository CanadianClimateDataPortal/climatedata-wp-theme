<div class="row">
  <?php
    
    if ( is_page_template( 'tpl-subsector.php' ) ) {
    
  ?>
  
  <div class="hero-buttons col-10 offset-1 col-sm-8 offset-sm-2 col-lg-6 offset-lg-1">
    <a href="#case-studies" class="smooth-scroll btn btn-outline-primary rounded-pill text-white all-caps mr-5"><?php _e ( 'Case Studies', 'cdc' ); ?></a>
    <a href="#sector-vars" class="smooth-scroll btn btn-outline-primary rounded-pill text-white all-caps"><?php _e ( 'Variables', 'cdc' ); ?></a>
  </div>
    
  <?php
    
    } elseif ( is_page_template ( 'tpl-sector.php' ) ) {
      
  ?>
  
  <div class="col-10 offset-1 text-center">
    <a href="#" class="next-section rounded-circle border border-light"><i class="fas fa-long-arrow-alt-down fa-3x"></i></a>
  </div>
  
  <?php
    
    }
    
  ?>
</div>