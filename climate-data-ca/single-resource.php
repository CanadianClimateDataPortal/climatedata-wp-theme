<?php
  
  if ( have_posts() ) : while ( have_posts() ) : the_post();

    //
    // WHAT'S HAPPENING RIGHT NOW?
    //
    
    if ( isset ( $_GET['content'] ) && $_GET['content'] == 'video' ) {
    
      // 1. ajax request for variable interstitial
      //    (a variable was selected from a menu)
  
?>

<div id="training-video-overlay" class="overlay-content-wrap container-fluid">
  <div class="overlay-content row">
    <div class="overlay-content-heading col-9 offset-1 col-sm-8 offset-sm-2 col-md-6 offset-md-3">
      <h6 class="overlay-subtitle text-secondary all-caps"><?php _e ( 'Video', 'cdc' ); ?></h6>
      <h4 class="overlay-title text-white"><?php the_title(); ?></h4>
    </div>
    
    <div class="col-1 overlay-close text-white"><i class="fas fa-times"></i></div>
  </div>
  
  <div class="row">
    <div class="overlay-content-row col-10 offset-1 col-sm-8 offset-sm-2 col-md-6 offset-md-3">
      <div class="overlay-content-text">
        <?php
          
          if ( have_rows ( 'resource_video' ) ) {
            while ( have_rows ( 'resource_video' ) ) {
              the_row();
              
              switch ( get_sub_field ( 'source' ) ) {
                
                case 'vimeo' :
                
        ?>
        
        <div class="overlay-video-embed">
          <iframe src="https://player.vimeo.com/video/<?php the_sub_field ( 'url' ); ?>" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
        </div>
        
        <?php
                
                  break;
                  
                case 'upload' :
              
                  if ( get_sub_field ( 'poster' ) != '' ) {
                    $video_poster = wp_get_attachment_image_url ( get_sub_field ( 'poster' ), 'large' );
                  } else {
                    $video_poster = get_the_post_thumbnail_url ( get_the_ID(), 'large' );
                  }
              
        ?>
        
        <video id="" class="" preload="auto" poster="<?php echo $video_poster; ?>" controls>
          <?php
            
                  if ( have_rows ( 'sources' ) ) {
                    while ( have_rows ( 'sources' ) ) {
                      the_row();
                
          ?>
          
          <source src="<?php echo wp_get_attachment_url ( get_sub_field ( 'source' ) ); ?>" type="video/<?php echo get_sub_field ( 'type' ); ?>">
          
          <?php
            
                    }
                  }
          
          ?>
          
          <span class="text-white">Video not supported</span>
        </video>
        
        <?php
          
                  break;
            
              }
              
            }
            
          } else {
            
            echo '<p class="text-white">No video selected.</p>';
            
          }
          
        ?>
      </div>
    </div>
    
  </div>
</div>

<?php
    
    } else {
      
      the_title();
      
    }
    
  endwhile; endif;

?>