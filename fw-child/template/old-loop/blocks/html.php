<?php
  
  $element_class = array ( 'code' );
  
  if ( get_sub_field ( 'class' ) != '' ) {
    $element_class = array_merge ( $element_class, explode ( ' ', get_sub_field ( 'class' ) ) );
  }
  
?>

<div class="<?php echo implode ( ' ', $element_class ); ?>">
  <?php
    
    the_sub_field ( 'code' );
    
  ?>
</div>