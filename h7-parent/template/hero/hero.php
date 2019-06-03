<?php
  
  if ( !isset ( $hero_templates['bg'] ) ) $hero_templates['bg'] = 'bg';
  if ( !isset ( $hero_templates['content'] ) ) $hero_templates['content'] = 'content';
  if ( !isset ( $hero_templates['sidebar'] ) ) $hero_templates['sidebar'] = 'sidebar';
  if ( !isset ( $hero_templates['footer'] ) ) $hero_templates['footer'] = '';
  
  $hero_ID = get_the_ID();
  
  if ( is_post_type_archive ( 'variable' ) ) {
    $hero_ID = 'option';
  }
  
  //
  // FIELDS
  //
  
  // bg
  
  if ( !isset ( $hero_fields['background'] ) ) $hero_fields['background'] = array ( 'background', $hero_ID ); // just the field name to use have_rows
  
  // text
  
  if ( !isset ( $hero_fields['title'] ) ) {
    
    if ( get_field ( 'hero_title', $hero_ID ) ) {
      
      $hero_fields['title'] = get_field ( 'hero_title', $hero_ID );
      
    } else {
      
      if ( is_archive() ) {
        
        $current_query = get_queried_object();
        $hero_fields['title'] = $current_query->label;
      
      } else {
        
        $hero_fields['title'] = get_the_title();
        
      }
      
      
    }
    
  }  
  
  if ( !isset ( $hero_fields['text'] ) ) $hero_fields['text'] = get_field ( 'hero_text', $hero_ID );
  
  //
  // TEMPLATE
  //
  
?>

<section id="hero" class="page-section first-section bg-dark text-white">
  <?php
    
    include ( locate_template ( 'template/hero/' . $hero_templates['bg'] . '.php' ) );
    
  ?>
  
  <div class="section-container">
    <div class="container-fluid">
      <div class="row align-items-center">
        <?php
          
          //
          // CONTENT
          //
          
          if ( locate_template ( 'template/hero/' . $hero_templates['content'] . '.php' ) != '' ) {
            include ( locate_template ( 'template/hero/' . $hero_templates['content'] . '.php' ) );
          }
          
          //
          // SIDEBAR
          //
          
          if ( locate_template ( 'template/hero/' . $hero_templates['sidebar'] . '.php' ) != '' ) {
            include ( locate_template ( 'template/hero/' . $hero_templates['sidebar'] . '.php' ) );
          }
          
        ?>
      </div>
      
      <?php
        
        //
        // FOOTER
        //
      
        if ( locate_template ( 'template/hero/' . $hero_templates['footer'] . '.php' ) != '' ) {
          include ( locate_template ( 'template/hero/' . $hero_templates['footer'] . '.php' ) );
        }
          
      ?>
    </div>
  </div>
</section>