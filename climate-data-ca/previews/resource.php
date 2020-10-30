<?php

  if ( !isset ( $bg_colour ) ) $bg_colour = 'dark';
  if ( !isset ( $text_colour ) ) $text_colour = 'white';
  
  if ( $bg_colour == 'dark' ) {
    $btn_class = 'btn-outline-light';
  } else {
    $btn_class = 'btn-outline-secondary';
  }

  $bg_img = get_the_post_thumbnail_url ( $item['id'], 'medium' );

  $bg_style = get_field ( 'resource_style', $item['id'] );

  if ( $bg_style == 'random' ) $bg_style = mt_rand ( 1, 3 );

?>

<div class="card h-100 bg-<?php echo $bg_colour; ?> text-<?php echo $text_colour; ?>">
  <div class="card-bg" style="background-image: url(<?php echo $bg_img; ?>);"></div>
  
  <div class="card-body p-5">
    <h6 class="card-label vertical-label"><span><?php _e ( 'Training', 'cdc' ); ?></span></h6>
    <h5 class="card-title mb-4"><a href="<?php echo $item['permalink']; ?>"><?php echo $item['title']; ?></a></h5>
    
    <p><?php
      
      echo custom_excerpt ( $item['id'], 50 );
    
    ?></p>
  </div>
  
  <div class="card-footer border-0 d-flex flex-md-column flex-lg-row justify-content-between px-5 pb-5">
    <div class="d-flex align-items-center mb-md-4 mb-lg-0">
      <h6 class="mb-0 all-caps"><?php _e ( 'Format', 'cdc' ); ?></h6>
      
      <?php
        
        switch ( get_field ( 'asset_type', $item['id'] ) ) {
          case 'video' :
            $icon_class = 'fas fa-play';
            break;
            
          case 'interactive' :
            $icon_class = 'fas fa-hand-pointer';
            break;
            
          default : 
            $icon_class = 'fas fa-file';
          
        }
      
      ?>
      
      <i class="<?php echo $icon_class; ?> ml-4 fa-2x"></i>
    </div>
    
    <div class="d-flex align-items-center">
      <a href="<?php echo $item['permalink']; ?>" class="btn rounded-pill <?php echo $btn_class; ?>"><?php _e ( 'View', 'cdc' ); ?></a>
    </div>
  </div>    
</div>
