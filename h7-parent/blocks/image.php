<?php
  
  $img_ID = get_sub_field ( 'image' );
  
  if ( $img_ID != '' ) {
    
    $img_post = get_post ( $img_ID );
    
    $img_URL = wp_get_attachment_image_url ( $img_ID, 'full' );
    $img_alt = get_post_meta ( $img_ID, '_wp_attachment_image_alt', true );
    
    $img_title = get_the_title ( $img_ID );
    $img_caption = get_the_excerpt ( $img_ID );
    $img_content = $img_post->post_content;
    
?>

<div class="row">
  <div class="col-10 offset-1">
    <h4><?php echo $img_title; ?></h4>
  </div>
</div>

<div class="row">
  <div class="col-10 offset-1 image">
    <img src="<?php echo $img_URL; ?>" alt="<?php echo $img_alt; ?>">
  </div>
</div>

<div class="row">
  <div class="col-10 offset-1 image-caption">
    <?php 
      
      echo apply_filters ( 'the_content', $img_content );
      
    ?>
  </div>
</div>

<?php
  
  }
  
?>