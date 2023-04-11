<?php
  
  /*
    
    Template Name: Training
    
  */
  
  //
  // ENQUEUE
  //
  
  function tpl_enqueue() {
    
    wp_enqueue_script ( 'jquery-ui-core' );
    wp_enqueue_script ( 'jquery-ui-widget' );
    wp_enqueue_script ( 'jquery-effects-core' );
    wp_enqueue_script ( 'jquery-ui-tabs' );
    
  }
  
  add_action ( 'wp_enqueue_scripts', 'tpl_enqueue' );
  
  //
  // TEMPLATE
  //
  
  get_header();
  
  if ( have_posts() ) : while ( have_posts() ) : the_post();
  
?>

<main id="training-content">
  
  <?php
    
    include ( locate_template ( 'template/hero/hero.php' ) );
    
  ?>
  
  <section id="modules" class="page-section">
  
    <nav id="training-filter" class="navbar navbar-expand navbar-light bg-light">
      
      <ul class="navbar-nav tabs-nav w-100 flex-column flex-sm-row align-items-center justify-content-center">
        <li class="nav-item"><span class="nav-link disabled p-4 all-caps"><?php _e ( 'Filter:', 'cdc' ); ?></a></li>
        <li class="nav-item"><span class="nav-link p-4 all-caps" data-type="video"><?php _e ( 'Video', 'cdc' ); ?></a></li>
        <li class="nav-item"><span class="nav-link p-4 all-caps" data-type="interactive"><?php _e ( 'Interactive', 'cdc' ); ?></a></li>
        <li class="nav-item"><span class="nav-link p-4 all-caps" data-type="article"><?php _e ( 'Article', 'cdc' ); ?></a></li>
      </ul>
      
    </nav>

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
      
      if ( !empty ($modules) ) {
        
        foreach ( $modules as $module ) {
          
    ?>
    
    <div id="<?php echo $module->slug; ?>" class="training-module section-container">
      
      <div class="container-fluid">
    
        <div class="row">
          <div class="col-10 offset-1 col-md-8 col-lg-6">
            <h2 class="text-primary mb-2"><?php echo $module->name; ?></h2>
            <h4 class="text-primary"><?php echo get_field ( 'module_title', 'resource-category_' . $module->term_id ); ?></h4>
            <p><?php echo $module->description; ?></p>
          </div>
        </div>
            
        <?php
          
          $module_query = new WP_Query ( array (
            'post_type' => ['resource', 'interactive'],
            'posts_per_page' => -1,
            'tax_query' => array (
              array (
                'taxonomy' => 'resource-category',
                'terms' => $module->term_id
              )
            )
          ) );
          
          if ( $module_query->have_posts() ) {
            
        ?>
        
        <div class="row mt-5">
          <div class="col-12 px-3 col-sm-10 offset-sm-1 px-sm-0 col-md-12 offset-md-0 px-md-3 col-lg-10 offset-lg-1 px-lg-0"> 
            <div class="module-assets row mx-n3">
              
              <?php
              
                while ( $module_query->have_posts() ) {
                  
                  $module_query->the_post();
                  
                  $current_post_type = get_post_type();
              ?>              

              <div class="training-asset col-12 col-md-6 mb-4" data-type="<?php echo get_field ( 'asset_type' ); ?>">
                <div class="card bg-dark text-white mx-3 h-100">
                  <div class="bg" style="background-image: url(<?php echo get_the_post_thumbnail_url ( get_the_ID(), 'large' ); ?>);"></div>
                  
                  <div class="card-body p-5 mb-5">
                    <h4 class="card-title mb-5"><?php the_title(); ?></h4>
                    <p class="card-text"><?php
                      
                      echo custom_excerpt ( get_the_ID(), 50 );
                      
                    ?></p>
                  </div>
                  
                  <div class="card-footer border-0 d-flex flex-md-column flex-lg-row justify-content-between px-5 pb-5">
                    <div class="d-flex align-items-center mb-md-4 mb-lg-0">
                      <h6 class="mb-0 all-caps"><?php _e ( 'Format', 'cdc' ); ?></h6>
                      
                      <?php
                        
                        switch ( get_field ( 'asset_type' ) ) {
                          case 'video' :
                            $icon_class = 'fas fa-play';
                            break;
                            
                          case 'interactive' :
                            $icon_class = 'fas fa-hand-pointer';
                            break;
                            
                          default : 
                            if ( $current_post_type === 'interactive' ) {
                                $icon_class = 'fas fa-hand-pointer';
                            } else {
                                $icon_class = 'fas fa-file';    
                            }
                          
                        }
                      
                      ?>
                      
                      <i class="<?php echo $icon_class; ?> ml-4 fa-2x"></i>
                    </div>
                    
                    <?php
                      
                      if ( get_field ( 'asset_time' ) != '' ) {
                        
                    ?>
                    
                    <div class="d-flex align-items-center">
                      <h6 class="mb-0 all-caps"><?php _e ( 'Time to completion', 'cdc' ); ?></h6>
                      <span class="btn btn-outline-light rounded-pill ml-4"><?php echo get_field ( 'asset_time' ); ?> min</span>
                    </div>
                    
                    <?php
                      
                      }
                      
                    ?>
                  </div>
                  
                  <a href="<?php the_permalink(); ?>" class="card-overlay"></a>
                </div>
              </div>
            
              <?php
                  
                } // while posts
                
              ?>
              
            </div>
          </div>
        </div>
            
        <?php
            
          } // if posts
          
          wp_reset_postdata();
          
        ?>

      </div>
    </div>
    
    <?php
          
        }
      }
      
    ?>
  </section>
  
  <?php
    
    //
    // SECTIONS LOOP
    //
    
    include ( locate_template ( 'template/loop/sections.php' ) );
    
  ?>
  
</main>

<?php
  
  endwhile; endif;
  
  get_footer();
  
?>
