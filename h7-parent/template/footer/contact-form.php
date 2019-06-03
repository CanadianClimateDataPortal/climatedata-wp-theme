<section id="feedback" class="page-section bg-dark text-white">
  <?php
    
    if ( have_rows ( 'contact_bg', 'option' ) ) {
      while ( have_rows ( 'contact_bg', 'option' ) ) {
        the_row();
        
        $bg_URL = wp_get_attachment_image_url ( get_sub_field ( 'image' ), 'hero' );
          
        include ( locate_template ( 'elements/bg.php' ) );
        
      }
    }
    
  ?>
  
  <div class="section-container">
    <div class="section-content container-fluid">
      <div class="row">
        <div class="col-10 offset-1 col-sm-8 col-md-7 col-lg-6 text-white">
          <h2><?php _e ( 'Need help? Have Feedback?', 'cdc' ); ?></h2>
          <p><?php _e ( 'We want to hear from you. If you have any comment, feedback or need support, please contact us.', 'cdc' ); ?></p>
          
          <?php
            
            $feedback_slug = apply_filters( 'wpml_get_translated_slug', 'feedback', 'page', $GLOBALS['vars']['current_lang'] );
            
          ?>
          
          <p><a href="<?php echo $GLOBALS['vars']['site_url'] . $feedback_slug . '/'; ?>" class="btn btn-lg btn-outline-light rounded-pill all-caps"><?php _e ( 'Submit Feedback', 'cdc' ); ?></a>
        </div>
      </div>
    </div>
  </div>
</section>