<?php
  
  // 
  // ENQUEUE
  //
  
  function template_nav_enqueue() {
    
    wp_enqueue_script ( 'bootstrap-collapse' );
    
  }
  
  add_action ( 'wp_enqueue_scripts', 'template_nav_enqueue' );
  
  //
  // LAYOUT
  //
  
  if ( have_rows ( 'header_elements', 'option') ) {
  
?>

<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <?php
    
    while ( have_rows ( 'header_elements', 'option') ) {
      the_row();
      
      if ( get_row_layout() == 'collapsible' ) {
        
        if ( get_sub_field ( 'wrapper' ) == 'open' ) {
          
  ?>
  
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>

  <div class="collapse navbar-collapse" id="navbarSupportedContent">
  
  <?php
          
        } elseif ( get_sub_field ( 'wrapper' ) == 'close' ) {
          
  ?>
  
  </div>
  
  <?php
    
        }
        
      } else {
        
        include ( locate_template ( 'template/nav/' . get_row_layout() . '.php' ) );
        
      }
    
    }
    
  ?>
</nav>

<?php
  
  }
  
?>