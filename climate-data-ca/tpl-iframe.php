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
    <section id="iframe-section" class="page-section bg-white">
        <div id='iframe-error' class="initially-hidden bg-danger section-content p-4 text-center"></div>
        <div id='iframe-spinner' class="m-5 text-center"><i class='fa fa-spinner fa-spin fa-3x fa-fw'></i></div>
        <div class="iframe-container">
            <iframe data-src=<?php echo get_field("url") ?> id="i_frame" title="iframe" allow="fullscreen"
                    data-timeout="<?php echo get_field("timeout_timer") ?>"
                    data-timeout-message="<?php echo htmlspecialchars(get_field("timeout_message")); ?>"></iframe>
        </div>
    </section>

</main>


<?php
endwhile; endif;

get_footer();

?>