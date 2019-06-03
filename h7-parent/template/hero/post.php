<section id="hero" class="page-section first-section bg-dark text-white">
  <?php
    
    $bg_URL = '';
    
    $hero_images = get_field ( 'misc_images', 'option' );
    
    if ( !empty ( $hero_images ) ) {
    
      $bg_URL = wp_get_attachment_image_url ( $hero_images[array_rand ( $hero_images )]['ID'], 'hero' );  
      $bg_class = array ( 'opacity-30', 'bg-position-center', 'bg-attachment-fixed' );
    
      include ( locate_template ( 'elements/bg.php' ) );
      
    }
    
  ?>
  
  <div class="section-container">
    <div class="container-fluid">
      <div class="row align-items-center">
        <div class="col-6 offset-1">
          <h1><?php
            
            the_title();
            
          ?></h1>
          
          <?php the_field ( 'hero_text' ); ?>
        </div>
        
        <aside class="col-3 offset-1 hero-menu-wrap">
          <div class="hero-menu">
            <h6>Date</h6>
            <p><?php the_time ( 'F j, Y' ); ?></p>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>