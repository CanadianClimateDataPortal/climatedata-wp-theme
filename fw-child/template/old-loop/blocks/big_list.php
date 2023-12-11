<?php
  
  $list_style = get_sub_field ( 'list_style' );
  
  if ( have_rows ( 'items' ) ) {
    
?>

<ul class="big-list style-<?php echo $list_style; ?>">
  
  <?php
    
    while ( have_rows ( 'items' ) ) {
      the_row();
      
  ?>

  <li><span><?php the_sub_field ( 'text' ); ?></span></li>
  
  <?php
      
    }
    
  ?>
  
</ul>

<?php
  
  }
  
?>