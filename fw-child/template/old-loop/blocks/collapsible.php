<?php
  
  if ( get_sub_field ( 'wrapper' ) == 'open' ) {
  
?>

<nav class="navbar navbar-expand-xl <?php echo get_sub_field ( 'class' ); ?>">
  <button class="navbar-toggler btn btn-lg btn-transparent text-secondary" type="button" data-toggle="collapse" data-target="#<?php echo $section_ID; ?>-collapse" aria-controls="<?php echo $section_ID; ?>-collapse" aria-expanded="false" aria-label="Toggle navigation">
    <i class="fas fa-bars"></i>
  </button>

  <?php 
    
    // collapsible area
    
  ?>
  <div id="<?php echo $section_ID; ?>-collapse" class="collapse navbar-collapse row w-100">
    
      
<?php
  
  } elseif ( get_sub_field ( 'wrapper' ) ) {
    
?>
            

  </div>

  <?php
    
    // end collapsible area
    
  ?>
</nav>

<?php
  
  }
  
?>