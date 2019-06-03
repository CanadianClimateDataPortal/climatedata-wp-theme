<?php
  
  if ( locate_template ( 'blocks/supermenu/supermenu.php' ) != '' ) {
    
    locate_template ( 'blocks/supermenu/supermenu.php' );
    
  } else {
    
?>

<div class="supermenu-wrap">
  <div class="supermenu">
    menu
  </div>
</div>

<?php
    
  }
  
?>