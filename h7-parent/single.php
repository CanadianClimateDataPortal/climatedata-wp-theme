<?php
  
  get_header();
  
  if ( have_posts() ) : while ( have_posts() ) : the_post();
  
?>

<main>
  
  <?php
    
    //
    // HERO
    //
  
    include ( locate_template ( 'template/hero/post.php' ) );
  
    //
    // SECTIONS LOOP
    //
    
    include ( locate_template ( 'template/loop/sections.php' ) );
    
  ?>
  
</main>

<?php
  
  endwhile; endif;
  
  get_footer();
  
?>