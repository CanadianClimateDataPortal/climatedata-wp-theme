<?php
  
  $hero_ID = get_the_ID();
  
  if ( is_post_type_archive ( 'variable' ) ) {
    $hero_ID = 'option';
  }
  
  if ( !isset ( $hero_fields['background'] ) ) $hero_fields['background'] = array ( 'background', $hero_ID ); // just the field name to use have_rows

  if ( !isset ( $hero_fields['title'] ) ) {
    
    if ( get_field ( 'hero_title', $hero_ID ) ) {
      
      $hero_fields['title'] = get_field ( 'hero_title', $hero_ID );
      
    } else {
      
      if ( is_archive() ) {
        
        $current_query = get_queried_object();
        $hero_fields['title'] = $current_query->label;
      
      } else {
        
        $hero_fields['title'] = get_the_title();
        
      }
      
      
    }
    
  }  
  
  if ( !isset ( $hero_fields['text'] ) ) $hero_fields['text'] = get_field ( 'hero_text', $hero_ID );
  
  
?>

<section id="hero" class="page-section first-section bg-dark text-white">
  <?php
    
    $bg_URL = '';
    
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
  
  <div class="section-container">
    <div class="container-fluid">
      <div class="row align-items-center">
        <div class="col-10 offset-1 col-sm-8 offset-sm-2 col-lg-6 offset-lg-1">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <?php
                
                $page_ancestors = array_reverse ( array_slice ( get_ancestors ( get_the_ID(), 'page' ), 0, -1 ) );
                  
                foreach ( $page_ancestors as $ancestor ) {
                  
              ?>
            
              <li class="breadcrumb-item"><a href="<?php echo get_permalink ( $ancestor ); ?>"><?php echo get_the_title ( $ancestor ); ?></a></li>
              
              <?php
                
                }
                
              ?>
            </ol>
          </nav>
          
          <h1><?php
            
            if ( $hero_fields['title'] != '' ) {
              echo $hero_fields['title'];
            } else {
              the_title();
            }
            
          ?></h1>
          
          <?php echo $hero_fields['text']; ?>
          
          <div class="hero-buttons">
            <a href="#case-studies" class="smooth-scroll btn btn-outline-primary rounded-pill text-white all-caps mr-5"><?php _e ( 'Case Studies', 'cdc' ); ?></a>
            <a href="#sector-vars" class="smooth-scroll btn btn-outline-primary rounded-pill text-white all-caps"><?php _e ( 'Variables', 'cdc' ); ?></a>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</section>