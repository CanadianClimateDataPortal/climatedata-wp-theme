<?php
  
  $bg_img = get_the_post_thumbnail_url ( $item['id'], 'card-img' );
  
?>

<div class="card h-100 bg-light">
  <?php 
    
    if ( has_post_thumbnail ( $item['id'] ) ) {
      
  ?>
  
  <img src="<?php echo $bg_img; ?>" class="card-img-top">
  
  <?php
    
    }
    
  ?>
  
  <div class="card-body">
    <h6 class="card-date"><?php echo get_the_time( 'F j, Y', $item['id'] ); ?></h6>
    <h5 class="card-title"><a href="<?php echo $item['permalink']; ?>"><?php echo $item['title']; ?></a></h5>
    
    
    
    <a href="<?php echo $item['permalink']; ?>" class="btn rounded-pill btn-outline-secondary"><?php _e ( 'Read more', 'cdc' ); ?></a>
  </div>
</div>