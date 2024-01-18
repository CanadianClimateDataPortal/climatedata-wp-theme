<div class="row">
  <div class="col">
    <?php
    
      include ( locate_template ( 'template/old-loop/elements/heading.php' ) );
      
    ?>
  </div>
</div>

<div class="row">
  <?php
    
    $text_class = array ( 'block-text' );
    
    if ( have_rows ( 'image' ) ) {
      while ( have_rows ( 'image' ) ) {
        the_row();
        
        $image_URL = wp_get_attachment_image_url ( get_sub_field ( 'image' ), 'large' );
        
        $image_class = array ( 'block-image', 'position-' . get_sub_field ( 'position' ) );
        
        switch ( get_sub_field ( 'position' ) ) {
          
          case 'above' : 
            array_push ( $image_class, 'col-16', 'col-md-12-of-13', 'col-lg-9-of-13', 'col-xl-8-of-13', 'order-1', 'mb-3' );
            array_push ( $text_class, 'col-16', 'col-md-12-of-13', 'col-lg-9-of-13', 'col-xl-8-of-13', 'order-2' );
            break;
          
          case 'below' : 
            array_push ( $image_class, 'col-16', 'col-md-12-of-13', 'col-lg-9-of-13', 'col-xl-8-of-13' );
            array_push ( $text_class, 'col-16', 'col-md-12-of-13', 'col-lg-9-of-13', 'col-xl-8-of-13' );
            break;
          
          case 'left' : 
            array_push ( $image_class, 'col-16', 'col-md-4-of-13', 'order-1', 'mb-3', 'mb-md-0' );
            array_push ( $text_class, 'col-16', 'col-md-8-of-13', 'offset-md-1-of-13', 'col-lg-7-of-13', 'col-xl-6-of-13', 'order-2' );
            break;
          
          case 'right' : 
            array_push ( $image_class, 'col-16', 'offset-md-1-of-13', 'col-md-4-of-13' );
            array_push ( $text_class, 'col-16', 'col-md-8-of-13', 'col-lg-7-of-13', 'col-xl-6-of-13' );
            break;
          
        }
        
      }
      
    }
    
  ?>
  
  <div class="<?php echo implode ( ' ', $text_class ); ?>">
    <?php the_sub_field ( 'body' ); ?>
  </div>
  
  <div class="<?php echo implode ( ' ', $image_class ); ?>">
    <img src="<?php echo $image_URL; ?>">
  </div>
</div>