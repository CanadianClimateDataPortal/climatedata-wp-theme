<?php

/*
  Template Name: IFrame
*/

//
// ENQUEUE
//

function tpl_enqueue() {

  wp_enqueue_script ( 'iframe-functions' );
  
}
add_action ( 'wp_enqueue_scripts', 'tpl_enqueue' );

get_header();
if (have_posts()) : while (have_posts()) : the_post();
?>

<main id="iframe-content">


<?php

  include (locate_template('template/hero/hero.php'));
  
?>
<section id="iframe-section" class="page-section bg-white" >
  <div class="iframe-container">
    <iframe src=<?php echo get_field("url") ?> id="i_frame" title="iframe" allow="fullscreen" data-timeout="<?php echo get_field("timeout_timer") ?>" data-timeout-message="<?php echo htmlspecialchars(get_field("timeout_message"));?>"></iframe>
  </div>
</section>

</main>


<?php
endwhile; endif;

get_footer();

?>