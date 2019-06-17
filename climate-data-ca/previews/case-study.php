<?php 
  
  if ( has_post_thumbnail ( $item['id'] ) ) {
    
?>

<div class="case-study-bg bg fixed opacity-50" style="background-image: url(<?php echo wp_get_attachment_image_url ( get_post_thumbnail_id ( $item['id'] ), 'bg' ); ?>);"></div>

<?php
  
  }
  
?>

<div class="section-content">
  <div class="row">
    
    <nav aria-label="breadcrumb" class="col-8 offset-1 offset-lg-2">
      <ol class="breadcrumb">
    
        <?php
          
          $page_ancestors = array_slice ( get_ancestors ( get_the_ID(), 'page' ), 0, -2 );
            
          foreach ( $page_ancestors as $ancestor ) {
            
        ?>
      
        <li class="breadcrumb-item"><a href="<?php echo get_permalink ( $ancestor ); ?>"><?php echo get_the_title ( $ancestor ); ?></a></li>
        
        <?php
          
          }
          
        ?>
        
        <li class="breadcrumb-item"><a href="<?php echo the_permalink(); ?>"><?php the_title(); ?></a></li>
        <li class="breadcrumb-item active"><?php _e('Case Study', 'cdc'); ?></li>
      </ol>
    </nav>
      
  </div>
    
  <div class="row">
    <div class="case-study-content col-10 offset-1 col-md-8 offset-md-0 offset-lg-1">
      <div class="col-6-of-8 offset-1-of-8 col-lg-5-of-8">
        <h2><a href="<?php echo $item['permalink']; ?>"><?php echo $item['title']; ?></a></h2>
        
        <?php
          
          echo apply_filters ( 'the_content', custom_excerpt ( $item['id'], 30 ) );
          
        ?>
      </div>
      
      <a href="<?php echo $item['permalink']; ?>" class="btn rounded-pill btn-outline-primary all-caps"><?php _e ( 'Explore', 'cdc' ); ?> <span class="icon fas fa-long-arrow-alt-right"></span></a>
    </div>
    
    <aside class="case-study-related col-md-4 col-lg-3">
      <?php
        
        $related_vars = get_field ( 'related_vars', $item['id'] );
        
        if ( !empty ( $related_vars ) ) {
          
      ?>
      
      <div class="sidebar-content post-preview type-case-study-related h-100">
        
        <?php
          
          $random_var = $related_vars[array_rand ( get_field ( 'related_vars', $item['id'] ))];
          
          $related_var = get_post ( $random_var );
          
        ?>
        
        <div class="card h-100">
          <div class="card-body">
            <h6 class="card-label vertical-label"><span><?php _e ( 'Related Variable', 'cdc' ); ?></span></h6>
            <h5 class="card-title"><a href="<?php echo get_permalink ( $random_var ); ?>" class="overlay-toggle" data-overlay-content="interstitial"><?php echo get_the_title ( $random_var ); ?></a></h5>
            
            <?php echo apply_filters ( 'the_content', custom_excerpt ( $random_var, 30 ) ); ?>
            
            <?php
              
              if ( has_post_thumbnail ( $random_var ) ) {
                
            ?>
            
            <div class="card-bg" style="background-image: url(<?php echo get_the_post_thumbnail_url ( $random_var, 'medium' ); ?>);"></div>
            
            <?php
              
              }
              
            ?>
          </div>
          
          <a href="<?php echo get_permalink ( $random_var ); ?>" class="btn rounded-pill btn-outline-primary all-caps overlay-toggle" data-overlay-content="interstitial"><?php _e ( 'View', 'cdc' ); ?> <span class="icon fas fa-long-arrow-alt-right"></span></a>
          
          <a href="<?php echo get_permalink ( $random_var ); ?>" class="card-overlay overlay-toggle" data-overlay-content="interstitial"></a>
        </div>
      </div>
      
      <?php
        
        }
        
      ?>
    </aside> 
  </div>
</div>
