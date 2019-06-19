<?php
  
  get_header();
  
?>

<main>
  
  <?php
    
    //
    // HERO
    //
    
    $hero_images = get_field ( 'misc_images', 'option' );
    
    if (!empty ( $hero_images ) ) {
    
      $bg_URL = wp_get_attachment_image_url ( $hero_images[array_rand ( $hero_images )]['ID'], 'hero' );  
      $bg_class = array ( 'opacity-30', 'bg-position-center', 'bg-attachment-fixed' );
    
    }
    
  ?>
  
  <section id="hero" class="page-section first-section bg-dark text-white">
    <?php
      
      include ( locate_template ( 'elements/bg.php' ) );
      
    ?>
    
    <div class="section-container">
      <div class="container-fluid">
        <div class="row align-items-center">
          
          <div class="col-10 offset-1 col-sm-8 offset-sm-2 col-lg-6 offset-lg-1">
            <h1><?php _e ( '404 Error' ); ?></h1>
            
            <p><?php _e ( 'Page not found' ); ?></p>
          </div>
        </div>
      </div>
    </div>
  </section>
  
</main>

<?php
  
  get_footer();
  
?>