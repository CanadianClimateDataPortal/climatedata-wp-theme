<?php
  
  if ( have_rows ( 'footer_sections', 'option' ) ) {
    while ( have_rows( 'footer_sections', 'option' ) ) {
      the_row();
      
      $section_ID = get_sub_field ( 'id' );
      
?>

<div id="<?php echo $section_ID; ?>" class="row align-items-center <?php the_sub_field ( 'class' ); ?>">
  
  <?php
    
    if ( have_rows ( 'elements' ) ) {
      while ( have_rows ( 'elements' ) ) {
        the_row();
          
        if ( locate_template ( 'template/blocks/' . get_row_layout() . '.php' ) != '' ) {
          
          include locate_template ( 'template/blocks/' . get_row_layout() . '.php' );
          
        } else {
          
          echo get_row_layout();
          
        }
    
      }
    }
    
  ?>
  
</div>

<?php
  
    }
  }
  
?>