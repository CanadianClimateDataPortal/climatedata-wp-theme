<?php
  
  $element_class = array ( 'lang-switcher' );
  
  if ( get_sub_field ( 'class' ) != '' ) {
    $element_class = array_merge ( $element_class, explode ( ' ', get_sub_field ( 'class' ) ) );
  }
  
?>

<div class="<?php echo implode ( ' ', $element_class ); ?>">
  <?php
    
    $languages = icl_get_languages ( 'skip_missing=0' );
  
    if ( !empty ( $languages ) ) {
      foreach ( $languages as $l ) {
        
        echo '<a href="' . $l['url'] . '"';
        
        if ( $l['active'] ) echo '  class="current-lang"';
        
        echo '>' . $l['language_code'] . '</a>';
        
      }
    }
    
  ?>
</div>