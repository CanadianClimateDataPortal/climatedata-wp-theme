<?php
  
  if ( !empty ( get_field ( 'related_vars' ) ) ) {
  
?>

<section id="<?php echo $section_ID; ?>" class="page-section has-head has-subsections">
    
  <div class="section-container">
    <header class="section-head container-fluid">
      <div class="row">
        <div class="col-10 offset-1 col-md-8 offset-md-2 text-center text-lg-left">
          <h4 class="text-muted"><?php 
            
            if ( is_page_template ( 'tpl-subsector.php' ) ) {
              
              printf ( __ ( 'Variables related to %s' , 'cdc' ), get_the_title() );
              
            } else {
              
              _e ( 'Related Variables', 'cdc' );
              
            }
            
          ?></h4>
        </div>
                
        <div class="col-10 offset-1 col-md-8 offset-md-2 col-lg-5">
          <p><?php _e ( 'Explore variables to learn about how data was used to impact climate related decisions in specific contexts.', 'cdc' ); ?></p>
        </div>
          
      </div>
    </header>
        
    <div class="container-fluid subsections">
    
      <div id="<?php echo $section_ID; ?>-1" class="subsection">
        <div class="row">
                
          <div id="<?php echo $block_ID; ?>" class="block type-post_grid col-12">
            
            <?php
              
              $post_grid[$block_ID] = array (
                'display' => array (
                  'template' => 'sector-variable',
                  'columns' => 1
                )
              );
              
              $new_query = array (
                'args' => array (
                  'post_type' => 'variable',
                  'post__in' => get_field ( 'related_vars' ),
                  'orderby' => 'menu_order',
                  'order' => 'asc'
                )
              );
              
              include ( locate_template ( 'blocks/post_grid.php' ) );
              
            ?>
          
          </div>
          
        </div>
        
      </div>
    
    </div>
    
  </div>
</section>

<?php
   
  }
  
?>