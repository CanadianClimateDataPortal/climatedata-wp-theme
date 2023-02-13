<aside class="col-10 offset-1 col-sm-8 offset-sm-2 col-lg-3 offset-lg-1 hero-menu-wrap">
  <div class="hero-menu">
    <h6><?php _e ( 'Jump to:', 'cdc' ); ?></h6>

    <ul>
      <?php
      
        if ( have_rows ( 'region_context' ) ) {
          
      ?>
      
      <li><a href="#region-overview" class="smooth-scroll"><?php _e ( 'Overview', 'cdc' ); ?></a></li>
      
      <?php 
      
        }
        
        if ( have_rows ( 'region_cases' ) ) { 
      
      ?>
      
      <li><a href="#region-cases" class="smooth-scroll"><?php _e ( 'Case Studies', 'cdc' ); ?></a></li>
      
      <?php
      
        }
      
        if ( have_rows ( 'region_analogous' ) ) {
      
      ?>
      
      <li><a href="#region-analogous" class="smooth-scroll"><?php _e ( 'Resources', 'cdc' ); ?></a></li>
      
      <?php
      
        }
      
        if ( !empty ( get_field ( 'related_vars' ) != '' ) ) {
          
      ?>
      
      <li><a href="#region-vars" class="smooth-scroll"><?php _e ( 'Related Variables', 'cdc' ); ?></a></li>
      
      <?php
      
        }
        
        if ( have_rows ( 'region_related' ) ) {
          
      ?>
        
      <li><a href="#region-related" class="smooth-scroll"><?php _e ( 'Related Content', 'cdc' ); ?></a></li>
      
      <?php 
        
        }
        
      ?>
    </ul>

  </div>
</aside>
