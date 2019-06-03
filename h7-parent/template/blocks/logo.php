<?php
  
  $element_class = array ( 'logo' );
  
  $logo_link = '';
  
  if ( get_sub_field ( 'link' ) == 'home' ) {
    $logo_link = $GLOBALS['vars']['site_url'];
  } elseif ( get_sub_field ( 'link' ) == 'url' ) {
    $logo_link = get_sub_field ( 'url' );
  }
  
  if ( get_sub_field ( 'class' ) != '' ) {
    $element_class = array_merge ( $element_class, explode ( ' ', get_sub_field ( 'class' ) ) );
  }
  
  $logo_img = wp_get_attachment_image_url ( get_sub_field ( 'image' ), 'full' );
  
  if ( empty ( $element_class ) ) {
    $element_class[] = 'col';
  }
  
?>

<div class="<?php echo implode ( ' ', $element_class ); ?>">
  <?php
    
    if ( get_sub_field ( 'link' ) != 'none' ) {
    
  ?>
  
  <a href="<?php echo $logo_link; ?>" <?php echo ( get_sub_field ( 'link' ) == 'url' ) ? 'target="_blank"' : ''; ?>>
  
  <?php
    
    }
    
  ?>
  
  <img src="<?php echo $logo_img; ?>" alt="Logo">
  
  <?php
    
    if ( get_sub_field ( 'link' ) != 'none' ) {
    
  ?>
  
  </a>
  
  <?php
    
    }
    
  ?>
</div>