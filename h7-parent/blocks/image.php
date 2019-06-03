<?php
  
  $img_URL = wp_get_attachment_image_url( get_sub_field ( 'image' ), 'full' );
  
?>

<img src="<?php echo $img_URL; ?>">