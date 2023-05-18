<?php
  
  $hero_content_class = 'col-10 offset-1 col-sm-8 offset-sm-2 col-lg-6 offset-lg-1';
  
  if ( get_field ( 'asset_type' ) == 'video' ) $hero_content_class = 'col-10 offset-1';
  
?>

<div id="hero-asset-type-<?php echo get_field ( 'asset_type' ); ?>" class="<?php echo $hero_content_class; ?>">
  <?php
    
    $training_page = filtered_ID_by_path ( 'learn' );
      
  ?>
  
  <nav aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item"><a href="<?php echo get_permalink ( $training_page ); ?>"><?php echo get_the_title ( $training_page ); ?></a></li>
      
      <?php
        
        $post_cat = get_the_terms ( get_the_ID(), 'resource-category' );
        
        $post_cat = $post_cat[0];
          
      ?>
    
      <li class="breadcrumb-item"><a href="<?php echo get_permalink ( $training_page ) . '#' . $post_cat->slug; ?>" class=""><?php 
        
        echo $post_cat->name; 
        
        if ( get_field ( 'module_title', 'resource-category_' . $post_cat->term_id ) != '' ) {
          echo ': ' . get_field ( 'module_title', 'resource-category_' . $post_cat->term_id );
        }
        
      ?></a></li>
      
    </ol>
  </nav>
  
  <?php
    
    
  ?>
  
  <h1><?php
    
    if ( $hero_fields['title'] != '' ) {
      echo $hero_fields['title'];
    } else {
      the_title();
    }
    
  ?></h1>
  
  <?php
  
    if ( 
      get_field ( 'asset_type' ) == 'audio' &&
      get_field ( 'asset_audio' ) != ''
    ) {
    
  ?>
  
  
  <div id="asset-video">
    <?php echo wp_oembed_get ( get_field ( 'asset_audio' ) ); ?>
  </div>
  
  <?php
  
    } elseif ( 
      get_field ( 'asset_type' ) == 'video' &&
      get_field ( 'asset_video' ) != ''
    ) {
      
  ?>
  
  <div id="asset-video">
    <?php echo wp_oembed_get ( 'http://vimeo.com/' . get_field ( 'asset_video' ) ); ?>
  </div>
  
  <?php
      
    } else {
      
      echo apply_filters ( 'the_content', custom_excerpt ( get_the_ID(), 999 ) );
    
      if ( get_field ( 'asset_time' ) != '' ) {
      
  ?>
  
  <div id="hero-asset-time" class="asset-time d-flex align-items-center">
    <h6 class="mb-0 all-caps"><?php _e ( 'Time to completion', 'cdc' ); ?></h6>
    <span class="border border-secondary text-white rounded-pill ml-4 py-2 px-4"><?php echo get_field ( 'asset_time' ); ?> min</span>
  </div>
  
  <?php
      
      }
    }
  
  ?>
</div>