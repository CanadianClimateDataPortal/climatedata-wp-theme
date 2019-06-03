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
      <li><a href="<?php echo get_permalink ( filtered_ID_by_path ( 'download' ) ); ?>"><?php _e ( 'Download', 'cdc' ); ?></a></li>
    </ul>
  </div>
    
  <footer class="hero-menu-footer"><?php the_field ( 'version' ); ?></footer>
</aside>

<?php
  
  }
  
?>