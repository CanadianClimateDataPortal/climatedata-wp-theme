<aside class="col-10 offset-1 col-sm-8 offset-sm-2 col-lg-3 offset-lg-1 hero-menu-wrap">
  <div class="hero-menu">
    <h6><?php _e ( 'Explore Sub-Sectors', 'cdc' ); ?></h6>
    
    <?php
      
      $subsectors = get_pages ( array (
        'posts_per_page' => -1,
        'child_of' => get_the_ID(),
        'sort_column' => 'menu_order',
        'order' => 'asc'
      ) );
      
      if ( !empty ( $subsectors ) ) { 
      
    ?>
    
    <ul>
      
      <?php
      
        foreach ( $subsectors as $subsector ) {
      
      ?>
      
      <li><a href="#subsector-<?php echo get_the_slug ( $subsector->ID ); ?>" class="smooth-scroll"><?php echo get_the_title ( $subsector->ID ); ?></a></li>
      
      <?php
        
        }
        
      ?>
      
    </ul>
    
    <?php
      
      }
      
    ?>
  </div>
</aside>