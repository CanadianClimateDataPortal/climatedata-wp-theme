<?php
  
?>

<div class="col-10 offset-1 col-sm-8 offset-sm-2 col-lg-6 offset-lg-1">
  <h1><?php
    
    if ( $hero_fields['title'] != '' ) {
      echo $hero_fields['title'];
    } else {
      the_title();
    }
    
  ?></h1>
  
  <?php echo apply_filters ( 'the_content', $hero_fields['text'] ); ?>
</div>