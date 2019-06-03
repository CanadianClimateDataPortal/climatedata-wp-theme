<blockquote>
  
  <p class="text-muted"><?php echo wptexturize ( get_sub_field ( 'body' ) ); ?></p>

  <footer>
    <?php
      
      if ( get_sub_field ( 'photo' ) != '' ) {
        
    ?>
    
    <div class="testimonial-photo">
      <img src="<?php echo wp_get_attachment_image_url ( get_sub_field ( 'photo' ), 'thumbnail' ); ?>">
    </div>
    
    <?php
      
      }
      
    ?>
    
    <div class="testimonial-meta">
      <p class="testimonial-person"><strong><?php the_sub_field ( 'person' ); ?></strong> <?php the_sub_field ( 'title' ); ?></p>
      
      <?php
        
        if ( get_sub_field ( 'organization' ) != '' ) {
          
      ?>
      
      <p class="testimonial-org"><?php the_sub_field ( 'organization' ); ?></p>
      
      <?php
        
        }
        
      ?>
    </div>
  </footer>
</blockquote>