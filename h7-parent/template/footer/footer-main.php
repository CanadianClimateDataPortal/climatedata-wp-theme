<?php
  
  $footer_bg = get_field ( 'footer_bg', 'option' );
  $footer_logo = get_field ( 'footer_logo', 'option' );
  
?>

<div class="footer-content" style="background-image: url(<?php echo wp_get_attachment_image_url( $footer_bg, 'full' ); ?>);">
  <div id="footer-logo">
    <a href="<?php echo network_site_url(); ?>"><img src="<?php echo wp_get_attachment_image_url( $footer_logo, 'large' ); ?>"></a>
  </div>
  
  <nav id="footer-primary">
    <?php
      
      wp_nav_menu ( array (
        'theme_location' => 'footer',
        'container_id' => 'footer-menu',
        'container_class' => 'menu-container'
      ) );
      
    ?>
  </nav>
</div>