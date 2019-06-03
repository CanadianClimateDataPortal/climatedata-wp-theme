<?php
  
  $bg_URL = '';
  
  if ( has_post_thumbnail () ) {
    $bg_URL = get_the_post_thumbnail_url( get_the_ID(), 'bg' );
  }
  
  if ( have_rows ( $hero_fields['background'][0], $hero_fields['background'][1] ) ) {
    while ( have_rows ( $hero_fields['background'][0], $hero_fields['background'][1] ) ) {
      the_row();
      
      if ( get_sub_field ( 'image' ) != '' ) {
      
        $bg_URL = wp_get_attachment_image_url ( get_sub_field ( 'image' ), 'hero' );
        
      }
      
      if ( $bg_URL == '' ) {
        
        $hero_images = get_field ( 'misc_images', 'option' );
        
        if (!empty ( $hero_images ) ) {
        
          $bg_URL = wp_get_attachment_image_url ( $hero_images[array_rand ( $hero_images )]['ID'], 'hero' );  
          $bg_class = array ( 'opacity-30', 'bg-position-center', 'bg-attachment-fixed' );
        
        }
        
      }
      
      include ( locate_template ( 'elements/bg.php' ) );
  
      if ( get_sub_field ( 'video' ) != '' ) {
        
        $video_URL = wp_get_attachment_url ( get_sub_field ( 'video' ) );
    
?>

<div id="home-video" class="d-none d-lg-block">
  <video loop autoplay muted>
    <source src="<?php echo $video_URL; ?>" type="video/mp4">
    Your browser does not support the video tag.
  </video>
  
  <div id="home-video-overlay"></div>
</div>

<?php
  
      }
      
    }
  }
  
?>