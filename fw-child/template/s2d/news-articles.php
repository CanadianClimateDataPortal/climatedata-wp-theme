<?php

/**
 * Show a list of the most recent news articles in the S2D topic.
 *
 * The articles are shown in a horizontal scrollable grid.
 */

$NB_ARTICLES = 3;
$S2D_TOPIC_SLUG = 'seasonal-to-decadal-forecasts';

$item_options = array(
    'type'       => 'items',
    'template'   => 'template/query/news-item.php',
    'id'         => '',
    'class'      => array( 'row', 'row-cols-3' ),
    'item_class' => 'col min-width-col',
);

$module_args = array(
    'posts_per_page' => $NB_ARTICLES,
    'post_type'      => 'post',
    'post_parent'    => 0,
    'post_status'    => 'publish',
    'tax_query'      => array(
        array(
            'taxonomy' => 'news-topic',
            'field'    => 'slug',
            'terms'    => $S2D_TOPIC_SLUG,
        ),
    ),
    'orderby'        => 'menu_order',
    'order'          => 'ASC',
);

?>

<div class="inline-query-grid over-white-bg overflow-x-auto"
     data-args='<?php echo json_encode( $module_args ); ?>'>
    <div class="query-container row py-4">
        <div class="col-1 col-sm-2"></div>
        <div class="col-14 col-sm-12">
            <div class="fw-query-items row row-cols-3 gx-3 gx-lg-6 row-no-wrap"
                 data-options='<?php echo json_encode( $item_options ); ?>'>
                <div class="fw-query-item"></div>
            </div>
        </div>
    </div>
</div>
