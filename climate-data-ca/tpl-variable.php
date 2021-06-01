<?php

/*
maxime
  Template Name: Variable

*/

function tpl_enqueue()
{

    wp_enqueue_script('highcharts-highstock');
    wp_enqueue_script('highcharts-more');
    wp_enqueue_script('highcharts-exporting');
    wp_enqueue_script('highcharts-export-data');

    wp_enqueue_script('leaflet');

    wp_enqueue_script('ion-slider');

    wp_enqueue_script('vector-grid');
    wp_enqueue_script('zoom');
    wp_enqueue_script('sync');
    wp_enqueue_script('nearest');

    wp_enqueue_script('variable-functions');

    // page tour

    wp_enqueue_script('jquery-ui-core');
    wp_enqueue_script('jquery-ui-position');
    wp_enqueue_script('page-tour');

}

add_action('wp_enqueue_scripts', 'tpl_enqueue');

//
// TEMPLATE
//

get_header();

if (have_posts()) : while (have_posts()) : the_post();

    $post = get_post($GLOBALS['vars']['current_data']['var_name']);


    setup_postdata($post);

    if (isset ($GLOBALS['vars']['current_data']['var_name'])) {
        $post_id = $GLOBALS['vars']['current_data']['id'];
    }

    $fields = get_field_objects( $post_id );



    ?>


    <main id="variable-content" data-variable="<?php the_field('var_name'); ?>">

        <input type="hidden" id="varPostID" value="<?=$post_id?>"></input>

        <div id="map1"></div>

        <?php

        $show_right = false;

        while (have_rows('variable_filters')) {
            the_row();

            if (get_row_layout() == 'rcp' && get_sub_field('compare') == 1) {
                $show_right = true;
                break;
            }
        }

        if ($show_right == true) {

            ?>

            <div id="mapRightcontainer">
                <div id="mapRight"></div>
            </div>

            <?php

        }

//        if (have_rows('variable_sliders')) {

            include(locate_template('template/variable/sliders.php'));

//        }

        ?>

        <div id="map-controls">
            <span id="zoom-in" class="zoom">+</span> <span id="zoom-out" class="zoom">-</span>
        </div>

    </main>

    <div class="modal right fade" id="chartSidebar" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-body">
                    <div id="container"></div>
                    <div id="loadtime"></div>
                    <div id="latlondisplay"></div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal"><?php _e('Close'); ?></button>
                </div>
            </div>
        </div>
    </div>

    <?php

    wp_reset_postdata();

    if (have_rows('tour')) {

        ?>

        <div class="page-tour" id="page-tour" data-steps='<?php echo json_encode(get_field('tour')); ?>'></div>

        <?php

    }

    //
    // SECTIONS LOOP
    //

    include(locate_template('template/loop/sections.php'));

endwhile; endif;

get_footer();

?>
