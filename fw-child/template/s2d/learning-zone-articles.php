<?php

/**
 * Show a list of pinned Learning Zone articles for S2D.
 *
 * The articles are shown in a horizontal scrollable grid.
 *
 * The list of articles to show is determined by the page's custom field
 * `$PINNED_IDS_FIELD`. This field must be a comma-separated list of post IDs
 * (no spaces). The order of the ids is preserved.
 *
 * If this field is not specified or empty, it defaults to the 3 latest
 * learning zone articles for S2D.
 */

$PINNED_IDS_FIELD = 'pinned_lz_ids';

// The following 2 variables are used only when no pinned IDS are set.
$DEFAULT_NB_ARTICLES = 3;
$S2D_MODULE_SLUG = 'seasonal-to-decadal-forecasts';

$lz_post_ids = [];
$lz_post_ids_raw = get_field( $PINNED_IDS_FIELD );

if ( ! empty( $lz_post_ids_raw ) ) {
    $lz_post_ids = array_map('intval', explode( ',', $lz_post_ids_raw ));
}

$item_options = array(
    'type'       => 'items',
    'template'   => 'template/query/learn-item.php',
    'id'         => '',
    'item_class' => 'col min-width-col',
);

$module_args = array(
    'posts_per_page' => -1,
    'post_type'      => array( 'page', 'resource' ),
    'post_status'    => 'publish',
);

if ( ! empty( $lz_post_ids ) ) {
    $module_args['post__in'] = $lz_post_ids;
    $module_args['orderby'] = 'post__in';
} else {
    $module_args = array_merge(
        $module_args,
        [
            'posts_per_page' => $DEFAULT_NB_ARTICLES,
            'tax_query'      => array(
                array(
                    'taxonomy' => 'module',
                    'field'    => 'slug',
                    'terms'    => $S2D_MODULE_SLUG,
                ),
            ),
            'meta_query'     => array(
                array(
                    'key'   => 'display_in_learning_zone',
                    'value' => '1',
                ),
            ),
            'orderby'        => 'menu_order',
            'order'          => 'ASC',
        ]
    );
}

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
