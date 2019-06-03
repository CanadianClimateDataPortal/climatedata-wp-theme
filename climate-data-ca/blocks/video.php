<?php
  
  if ( get_sub_field ( 'source' ) != '' ) {
    
?>

<div class="video">
  <video loop autoplay muted>
    <source src="<?php echo wp_get_attachment_url ( get_sub_field ( 'source' ) ); ?>" type="video/mp4">
    <?php _e ( 'Your browser does not support the video tag.', 'cdc' ); ?>
  </video>
</div>

<?php
  
  } else {
    echo 'Video source not set.';
  }
  
?>