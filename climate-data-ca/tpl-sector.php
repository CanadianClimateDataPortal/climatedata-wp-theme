<?php
  
  /*
    
    Template Name: Sector
    
  */
  
  function tpl_enqueue() {
    
    
    
  }
  
  add_action ( 'wp_enqueue_scripts', 'tpl_enqueue' );
  
  //
  // TEMPLATE
  //
  
  get_header();
  
  if ( have_posts() ) : while ( have_posts() ) : the_post();
  
?>

<main>
  
  <?php
    
    //
    // HERO
    //
  
    $hero_templates['content'] = 'sector-hero-content';
    $hero_templates['sidebar'] = 'sector-hero-sidebar';
    $hero_templates['footer'] = 'sector-hero-footer';
  
    include ( locate_template ( 'template/hero/hero.php' ) );
    
    //
    // SUB-SECTORS
    //
    
    $section_ID = 'subsectors';
    $block_ID = 'subsectors-grid';
    
  ?>
  
  <section id="<?php echo $section_ID; ?>" class="page-section has-head has-subsections">
      
    <div class="section-container">
      <header class="section-head container-fluid">
        <div class="row">
          <div class="col-10 offset-1 col-md-8 offset-md-2 text-center text-lg-left">
            <h4 class="text-muted">Overview</h4>
          </div>
                  
          <div class="col-10 offset-1 col-md-8 offset-md-2 col-lg-5">
            <p>Explore the following sub-sectors for Human Health to review case studies, access pertinent data-sets, and apply them to maps.</p>
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
                    'columns' => 1,
                    'template' => 'subsector'
                  )
                );
                
                $new_query = array (
                  'args' => array (
                    'post_type' => 'page',
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
  
</main>

<?php
  
  endwhile; endif;
  
  get_footer();
  
?>