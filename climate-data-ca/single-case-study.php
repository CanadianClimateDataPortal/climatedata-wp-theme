<?php
  
  get_header();
  
  if ( have_posts() ) : while ( have_posts() ) : the_post();
  
?>

<main>
  
  <?php
    
    //
    // HERO
    //
  
    $hero_templates['content'] = 'sector-hero-content';
  
    include ( locate_template ( 'template/hero/hero.php' ) );
  
    //
    // SECTIONS LOOP
    //
    
    include ( locate_template ( 'template/loop/sections.php' ) );
    
    $sector_ID = $post->post_parent;
    
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