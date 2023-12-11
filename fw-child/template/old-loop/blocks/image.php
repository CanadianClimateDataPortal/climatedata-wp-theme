<?php
  
  $img_ID = get_sub_field ( 'image' );
  
  if ( $img_ID != '' ) {
    
    $img_post = get_post ( $img_ID );
    
    $img_URL = wp_get_attachment_image_url ( $img_ID, 'full' );
    $img_alt = get_post_meta ( $img_ID, '_wp_attachment_image_alt', true );
    
    $img_title = get_the_title ( $img_ID );
    $img_caption = get_the_excerpt ( $img_ID );
    $img_content = $img_post->post_content;
  
    if ( $img_title != '' ) {
      
?>

<div class="row">
  <div class="col-10 offset-1">
    <h4 class="text-primary"><?php echo $img_title; ?></h4>
  </div>
</div>

<?php
  
    }
  
?>

<div class="row">
  <div class="col-10 offset-1 mb-5 image">
    <img src="<?php echo $img_URL; ?>">
  </div>
</div>

<?php
  
    if ( $img_caption != '' || $img_content != '' ) {
    
?>

<div class="row">
  <div class="col-10 offset-1 col-md-8 col-lg-6 image-caption">
    <?php
      
      if ( $img_caption != '' ) {
        
    ?>
    
    <h5 class="text-primary"><?php echo $img_caption; ?></h5>
    
    <?php 
      
      }
      
      if ( $img_content != '' ) {
      
        echo apply_filters ( 'the_content', $img_content );
        
      }
      
    ?>
  </div>
</div>

<?php
  
    }
  
  }
  
?>