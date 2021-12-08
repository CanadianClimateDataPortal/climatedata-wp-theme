<?php

  /*

    Template Name: Glossary

  */

  //
  // ENQUEUE
  //

  function tpl_enqueue() {

    wp_enqueue_script ( 'listnav' );

  }

  add_action ( 'wp_enqueue_scripts', 'tpl_enqueue' );

  //
  // TEMPLATE
  //

  get_header();

  if ( have_posts() ) : while ( have_posts() ) : the_post();

?>

<main id="glossary-content">

  <?php

    include ( locate_template ( 'template/hero/hero.php' ) );

  ?>

  <nav class="navbar navbar-expand navbar-light bg-light">
    <aside id="glossary-listnav-nav" class="collapse navbar-collapse">
<!--
      <ul class="navbar-nav tabs-nav w-100 justify-content-center">
        <li class="nav-item head px-4 py-5 all-caps">Filter</li>
      </ul>
-->
    </aside>
  </nav>

  <section id="glossary" class="page-section">

      <?php

        $glossary_query = new WP_Query ( array (
          'post_type' => 'definition',
          'posts_per_page' => -1,
          'orderby' => 'title',
          'order' => 'asc'
        ) );

        if ( $glossary_query->have_posts() ) :

      ?>

      <div class="container-fluid">
        <ul id="glossary-listnav">

          <?php

            while ( $glossary_query->have_posts() ) : $glossary_query->the_post();

          ?>

          <li id="def-<?php echo get_the_id(); ?>" class="dl-item row">
            <span class="dt col-10 offset-1 col-sm-2 col-lg-3"><?php the_title(); ?></span>
            <span class="dd col-10 offset-1 col-sm-8 offset-sm-0 col-lg-6"><?php the_content(); ?></span>
          </li>

          <?php

            endwhile;

          ?>

        </ul>
      </div>

      <?php

        endif;

        wp_reset_postdata();

      ?>

  </section>

</main>

<?php

  endwhile; endif;

  get_footer();

?>
