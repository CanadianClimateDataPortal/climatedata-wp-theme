<?php
  
  /*
    
    Template Name: Sub-Sector
    
  */
  
  function tpl_enqueue() {
    
    
    
  }
  
  add_action ( 'wp_enqueue_scripts', 'tpl_enqueue' );
  
  //
  // TEMPLATE
  //
  
  get_header();
  
  $sector_ID = get_the_ID();
  
  if ( have_posts() ) : while ( have_posts() ) : the_post();
  
?>

<main>
  
  <?php
    
    //
    // HERO
    //
  
    $hero_templates['content'] = 'sector-hero-content';
    $hero_templates['footer'] = 'sector-hero-footer';
  
    include ( locate_template ( 'template/hero/hero.php' ) );
    
    //
    // CASE STUDIES
    //
    
    $section_ID = 'case-studies';
    $block_ID = 'case-studies-grid';
    
  ?>
  
  <section id="<?php echo $section_ID; ?>" class="page-section has-head has-subsections">
      
    <div class="section-container">
      <header class="section-head container-fluid">
        <div class="row">
          <div class="col-10 offset-1 col-md-8 offset-md-2 text-center text-lg-left">
            <h4 class="text-muted"><?php _e ( 'Case Studies', 'cdc' ); ?></h4>
          </div>
                  
          <div class="col-10 offset-1 col-md-8 offset-md-2 col-lg-5">
            <p><?php _e ( 'Explore case studies to learn about how data was used to impact climate related decisions in specific contexts.', 'cdc' ); ?></p>
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
                    'columns' => 1
                  )
                );
                
                $new_query = array (
                  'args' => array (
                    'post_type' => 'case-study',
                    'post_parent' => get_the_ID(),
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
    
    //
    // VARIABLES
    //
    
    $section_ID = 'sector-vars';
    $block_ID = 'vars-grid';
    
    include ( locate_template ( 'template/subsector/related.php' ) );
    
  ?>
  
</main>

<?php
  
  endwhile; endif;
  
  get_footer();
  
?>