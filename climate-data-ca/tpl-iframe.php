<?php

  /*

    Template Name: IFrame

  */
  
  get_header();

  if ( have_posts() ) : while ( have_posts() ) : the_post();
?>

<main id="iframe-content">
  

  <?php

    include ( locate_template ( 'template/hero/hero.php' ) );

  ?>

  <section id="iframe-section" class="page-section bg-white" >
    <div class="iframe-container">

        <iframe src=<?php echo get_field("url");?> title='iframe' allow="fullscreen"></iframe>

    </div>
  </section>

</main>



<?php
  endwhile; endif;
  
  get_footer();

?>
