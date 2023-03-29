<aside class="col-10 offset-1 col-sm-8 offset-sm-2 col-lg-3 offset-lg-1 hero-menu-wrap">
  <div class="hero-menu">
    <h6><?php _e ( 'Jump to:', 'cdc' ); ?></h6>

    <ul>
      <li><a href="#sector-overview" class="smooth-scroll"><?php _e ( 'Overview', 'cdc' ); ?></a></li>
      <li><a href="#sector-cases" class="smooth-scroll"><?php _e ( 'Case Studies', 'cdc' ); ?></a></li>
      
      <?php
      
        $blog_query = get_posts ( array (
          'post_type' => 'post',
          'post_status' => 'publish',
          'tax_query' => array (
            array (
              'taxonomy' => 'post_tag',
              'field' => 'slug',
              'terms' => [ get_the_slug ( get_the_ID() ) ]
            )
          )
        ) );
      
        if ( !empty ( $blog_query ) ) {
          
      ?>
      <li><a href="#sector-blog" class="smooth-scroll"><?php _e ( 'Blog Posts', 'cdc' ); ?></a></li>
      <?php
      
        }
    
      ?>
      
      <li><a href="#sector-analogous" class="smooth-scroll"><?php _e ( 'Sector Resources', 'cdc' ); ?></a></li>
      <li><a href="#sector-vars" class="smooth-scroll"><?php _e ( 'Relevant Variables', 'cdc' ); ?></a></li>
      <li><a href="#sector-related" class="smooth-scroll"><?php _e ( 'Related Content', 'cdc' ); ?></a></li>
    </ul>

  </div>
</aside>
