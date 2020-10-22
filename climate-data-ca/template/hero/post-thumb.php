<?php
  
  $bg_URL = '';
  
  if ( has_post_thumbnail () ) {
    
    $bg_URL = get_the_post_thumbnail_url( get_the_ID(), 'bg' );  
    $bg_class = array ( 'opacity-30', 'bg-position-center', 'bg-attachment-fixed' );
    
    include ( locate_template ( 'elements/bg.php' ) );
    
  }
  
?>