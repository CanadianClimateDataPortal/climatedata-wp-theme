<?php
  
  if ( is_front_page() ) {
    
?>

<aside class="col-10 offset-1 col-sm-8 offset-sm-2 col-lg-3 offset-lg-1 hero-menu-wrap">
  <div class="hero-menu">
    <h6><?php _e ( 'Quick Start', 'cdc' ); ?></h6>
    
    <ul>
      <li><a href="<?php echo get_permalink ( filtered_ID_by_path ( 'explore/location' ) ); ?>" class="supermenu-toggle"><?php _e ( 'Explore by Location', 'cdc' ); ?></a></li>
      <li><a href="<?php echo get_permalink ( filtered_ID_by_path ( 'explore/variable' ) ); ?>" class="supermenu-toggle"><?php _e ( 'Explore by Variable', 'cdc' ); ?></a></li>
      <li><a href="<?php echo get_permalink ( filtered_ID_by_path ( 'explore/sector' ) ); ?>" class="supermenu-toggle"><?php _e ( 'Explore by Sector', 'cdc' ); ?></a></li>
      <li><a href="<?php echo get_permalink ( filtered_ID_by_path ( 'analyze' ) ); ?>"><?php _e ( 'Analyze', 'cdc' ); ?></a></li>
      <li><a href="<?php echo get_permalink ( filtered_ID_by_path ( 'download' ) ); ?>"><?php _e ( 'Download', 'cdc' ); ?></a></li>
      <?php /*<li><a href="<?php echo get_permalink ( filtered_ID_by_path ( 'learn' ) ); ?>"><?php _e ( 'Learn', 'cdc' ); ?></a></li>*/ ?>
    </ul>
  </div>
    
  <footer class="hero-menu-footer"><?php the_field ( 'version' ); ?></footer>
</aside>

<?php
  
  } elseif ( is_page ( 'learn' ) || is_page ( 'apprendre' ) ) {
    
?>

<aside class="col-10 offset-1 col-sm-8 offset-sm-2 col-lg-3 offset-lg-1 hero-menu-wrap">
  <div class="hero-menu">
    <h6><?php _e ( 'Skip to topics', 'cdc' ); ?></h6>
    
    <ul>
      <?php
        
        $terms_to_exclude = get_terms ( array (
          'taxonomy' => 'resource-category',
          'fields' => 'ids',
          'slug' => array ( 'how-to', 'key-concepts' ),
          'hide_empty' => false
        ) );
        
        $modules = get_terms ( array (
          'taxonomy' => 'resource-category',
          'exclude' => $terms_to_exclude,
          'hide_empty' => false
        ) );
        
        foreach ( $modules as $module ) {
        
      ?>
      
      <li><a href="#<?php echo $module->slug; ?>" class="smooth-scroll"><?php echo get_field ( 'module_title', 'resource-category_' . $module->term_id ); ?></a></li>
      
      <?php
        
        }
        
      ?>
      
      <li><a href="#training-materials" class="smooth-scroll"><?php _e ( 'Training Materials', 'cdc' ); ?></a></li>
    </ul>
  </div>
</aside>

<?php
    
  }
  
?>