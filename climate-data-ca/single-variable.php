<?php

if (have_posts()) : while (have_posts()) : the_post();

    //
    // GET TRANSLATED VARIABLES PAGE URL
    //

    $var_page = get_page_by_path('explore/variable');

    if ($GLOBALS['vars']['current_lang'] == 'fr') {
        $var_page = get_page_by_path('explorer/variable');
    }

    $var_url = get_permalink($var_page->ID);

    if (isset ($_GET['sector'])) {

        $var_url = get_permalink(filtered_ID_by_path('explore/sector/human-health/map'));

    }

    // get location page ID

    $chart_tour = json_encode(get_field('tour', filtered_ID_by_path('explore/location')));

    //
    // WHAT'S HAPPENING RIGHT NOW?
    //

    if (isset ($_GET['content']) && $_GET['content'] == 'interstitial') {

        // 1. ajax request for variable interstitial
        //    (a variable was selected from a menu)

?>

<div id="var-interstitial" class="overlay-content-wrap col-12 col-lg-8 col-xl-9 h-lg-100 bg-primary text-white">
    <div class="overlay-content container-fluid">
        <h2 class="overlay-title"><?php echo get_the_title(); ?></h2>

        <div class="overlay-content-row">
            <div class="overlay-content-heading d-flex align-items-center justify-content-end">
                <h6 class="vertical-label"><span>Variable</span></h6>
            </div>

            <div class="overlay-content-text">
                <?php the_content(); ?>
            </div>
        </div>

        <?php

            $var_type = get_the_terms(get_the_ID(), 'var-type');
        
            if (!empty ($var_type)) {
                $var_type = $var_type[0]->slug;
            }
        
            if ($var_type != 'station-data' && get_field('var_name') != 'slr') {
        
        ?>

        <h5 class="overlay-title text-center all-caps"><?php _e('Select a scenario below to continue', 'cdc'); ?></h5>

        <div class="overlay-content-row">
            <div class="overlay-content-heading d-flex align-items-center justify-content-end">
                <h6 class="vertical-label"><span><?php _e('Scenario', 'cdc'); ?></span></h6>
            </div>

            <div class="overlay-content-text">
                <div class="overlay-scenarios">
                    <form class="form-inline" action="<?php echo $var_url; ?>">
                        <input type="hidden" name="var" value="<?php the_field('var_name'); ?>">
                        <?php
                        if (in_array(get_field('var_name'), ['spei_12m', 'spei_3m'])) {
                        ?>
                            <input type="hidden" name="mora" value="sep">
                        <?php
                        }
                        ?>

                        <div class="d-lg-flex justify-content-around align-items-center w-100">
                            <div class="btn-group btn-group-toggle mb-5 mb-lg-0" data-toggle="buttons">
                                <label class="btn btn-outline-light text-left active"> <input type="radio" name="rcp" id="variable-detail-high" autocomplete="off" value="ssp585" checked> <?php _e('High Emissions', 'cdc'); ?><br>(SSP5-8.5) </label>

                                <label class="btn btn-outline-light text-left"> <input type="radio" name="rcp" id="variable-detail-lower" autocomplete="off" value="ssp245"> <?php _e('Moderate Emissions', 'cdc'); ?><br>(SSP2-4.5) </label>

                                <label class="btn btn-outline-light text-left"> <input type="radio" name="rcp" id="variable-detail-lowest" autocomplete="off" value="ssp126"> <?php _e('Low Emissions', 'cdc'); ?><br>(SSP1-2.6) </label>
                            </div>

                            <div class="d-flex justify-content-center d-lg-block" role="group" aria-label="">
                                <button type="submit" class="btn btn-secondary border-white rounded-pill all-caps"><?php _e('Explore', 'cdc'); ?></button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        
        <?php
        
            } else {

        ?>

        <div class="overlay-content-row">
            <div class="overlay-content-heading d-flex align-items-center justify-content-end">
                <h6 class="vertical-label"><span>&nbsp;</span></h6>
            </div>

            <div class="overlay-content-text">
                <div class="overlay-scenarios">
                    <form class="form-inline" action="<?php echo $var_url; ?>">
                        <input type="hidden" name="var" value="<?php the_field('var_name'); ?>">

                        <div class="d-flex justify-content-around align-items-center w-100">
                            <div class="" role="group" aria-label="">
                                <button type="submit" class="btn btn-secondary border-white rounded-pill all-caps"><?php _e('Explore', 'cdc'); ?></button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <?php

            }

        ?>
    </div>
</div>

<aside class="overlay-sidebar col-12 col-lg-4 col-xl-3 d-flex flex-column flex-sm-row d-lg-block bg-white">
    <?php
        
        // RANDOM RESOURCE
        
        $random_resource = new WP_Query ( array (
            'post_type' => 'resource',
            'posts_per_page' => 1,
            'orderby' => 'rand',
            'meta_query' => array (
                'relation' => 'OR',
                array (
                    'key' => 'related_vars',
                    'value' => get_the_ID(),
                    'compare' => 'LIKE'
                )
            )
        ) );
        
        $related_exclude = array();
    
        if ($random_resource->have_posts()) {
            while ($random_resource->have_posts()) {
                $random_resource->the_post();
                
                $related_exclude = [ get_the_ID() ];
    
                $item = array (
                    'id' => get_the_ID(),
                    'title' => get_the_title(),
                    'permalink' => get_permalink(),
                    'post_type' => get_post_type()
                );
        
    ?>
    
    <div id="var-overlay-resource" class="query-item post-preview type-<?php echo $item['post_type']; ?> h-auto">
    
        <?php
    
            $bg_colour = 'light';
            $text_colour = 'body';
    
            include ( locate_template ( 'previews/resource.php' ) );
    
        ?>
    
    </div>
    
    <?php
    
            }
        }
    
        wp_reset_postdata();
        
        // OTHER RELATED
    
        $posts_with_related = new WP_Query ( array (
            'post_type' => 'any',
            'post__not_in' => $related_exclude,
            'posts_per_page' => -1,
            'orderby' => 'rand',
            'meta_query' => array (
                'relation' => 'OR',
                array (
                    'key' => 'related_vars',
                    'value' => get_the_ID(),
                    'compare' => 'LIKE'
                ),
                array (
                    'key' => 'related',
                    'value' => get_the_ID(),
                    'compare' => 'LIKE'
                )
            )
        ) );
        
        if ( $posts_with_related->have_posts() ) {
            
    ?>
    
    <div id="var-overlay-related" class="p-4">
        <h6 class="mt-3 mb-4 pl-3 all-caps"><?php _e ( 'Related Content', 'cdc' ); ?></h6>
        
        <div class="list-group">
                
            <?php
                
                while ( $posts_with_related->have_posts() ) {
                    $posts_with_related->the_post();
                    
                    $item_ID = get_the_ID();
                    $post_type = get_post_type();
                    $post_type_obj = get_post_type_object ( $post_type );
                    
            ?>
                
            <div class="list-group-item p-3">
                
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                    
                        <?php
                        
                            if ( $post_type == 'variable' ) {
                                
                                // variable
                                
                                $var_type = get_the_terms ( $item_ID, 'var-type' );
                                
                        ?>
                        
                        <li class="breadcrumb-item">
                            <?php _e ( 'Variable', 'cdc' ); ?>
                        </li>
                        
                        <?php
                            
                                if (!empty ($var_type)) {
                                
                        ?>
                        
                        <li class="breadcrumb-item">
                            <?php echo $var_type[0]->name; ?>
                        </li>
                        
                        <?php
                        
                                }
                                
                            } else {
                                
                                // other post types
                                
                                $page_ancestors = array();
                                
                                if ( $post_type == 'page' ) {
                                    
                                    $page_ancestors = array_reverse ( array_slice ( get_ancestors ( $item_ID, 'page' ), 0, -1 ) );
                                    
                                } elseif ( $post_type == 'resource' ) {
                                    
                                    $page_ancestors = array (
                                        filtered_ID_by_path ( 'learn' , $GLOBALS['vars']['current_lang'] )
                                    );
                                    
                                }
                                
                                if ( !empty ( $page_ancestors ) ) {
                        
                                    $ancestor_num = 1;
                                    
                                    foreach ( $page_ancestors as $ancestor ) {
                        
                        ?>
                        
                        <li class="breadcrumb-item">
                            <?php
                            
                                        if ( $ancestor_num != 1 )
                                            echo '<a href="' . get_permalink ( $ancestor ) . '">';
                                        
                                        echo get_the_title ( $ancestor );
                                        
                                        if ( $ancestor_num != 1 )
                                        
                                        echo '</a>';
                        
                            ?>
                        </li>
                        
                        <?php
                        
                                        $ancestor_num++;
                                    
                                    } // each ancestor
                                    
                                } // if ancestors
                                        
                                if ( $post_type != 'page' ) {
                                    
                        ?>
                        
                        <li class="breadcrumb-item">
                            <?php echo $post_type_obj->labels->singular_name; ?>
                        </li>
                        
                        <?php
                                }
                                
                            }
                        
                        ?>
                    </ol>
                </nav>
                
                <h5 class="related-item-title mb-2">
                    <a href="<?php echo get_permalink ( $item_ID ); ?>"><?php echo get_the_title ( $item_ID ); ?></a></h5>
                
                <?php
                
                    if ( has_excerpt ( $item_ID ) ) {
                        
                ?>
                
                <p class="related-item-excerpt mb-0"><?php echo custom_excerpt ( $item_ID, 50 ); ?></p>
                
                <?php
                
                    }
                
                ?>
            </div>
        
            <?php
        
                } // while
            
            ?>
        </div>
    </div>
    
    <?php
                
        } // if posts
        
        wp_reset_postdata();
        
    ?>
</aside>

        <?php

    } elseif (isset ($_GET['station_name'])) {

        // 2. ajax request for msc-climate-normals

        ?>

        <div id="var-by-location" class="overlay-content-wrap variable-data-overlay col-12">
            <div class="overlay-content container-fluid">
                <?php

                $selected_place = get_location_by_coords($_GET['lat'], $_GET['lon']);

                if (is_array($selected_place)) {
                    $location_name = $selected_place['geo_name'] . ', ' . short_province($selected_place['province']);
                } else {

                    if (isset ($_GET['station_name'])) {
                        $location_name = $_GET['station_name'];
                    } else {
                        $location_name = 'Point';
                    }

                }

                ?>

                <h2 class="overlay-title text-primary"><?php echo $location_name; ?></h2>

                <div class="overlay-content-row">
                    <div class="overlay-content-chart">
                        <div class="navbar chart-navbar d-flex">
                            <div class="nav-item d-flex align-items-center mr-5">

                            </div>

                            <div class="nav-item d-flex align-items-center mr-5">
                                <h6><span class="cdc-icon icon-download-data"></span> <?php _e('Download data', 'cdc'); ?></h6>

                                <div class="btn-group btn-group-sm" role="group">
                                    <a href="#" class="chart-export-data btn btn-sm btn-outline-secondary" data-type="csv">CSV</a>
                                </div>
                            </div>

                            <div class="nav-item d-flex align-items-center">
                                <h6><span class="cdc-icon icon-download-img"></span> <?php _e('Download image', 'cdc'); ?></h6>

                                <div class="btn-group btn-group-sm" role="group">
                                    <a href="#" class="chart-export-img btn btn-sm btn-outline-secondary " data-type="png">PNG</a> <a href="#" class="chart-export-img btn btn-sm btn-outline-secondary" data-type="pdf">PDF</a>
                                </div>
                            </div>
                        </div>

                        <div id="chart-placeholder" class="var-chart" style="height: 400px;"></div>

                        <div>
                            <p><?php _e('Additional Climate Normals variables are available from the <a target="_blank" href="https://climate-change.canada.ca/climate-data/#/climate-normals">Canadian Centre for Climate Services</a> and the <a target="_blank" href="https://climate.weather.gc.ca/climate_normals/index_e.html">Government of Canada Historical Climate Data</a> websites.', 'cdc'); ?></p>
                        </div>

                    </div>
                </div>

                <div class="page-tour" id="chart-tour" data-steps='<?php echo $chart_tour; ?>'></div>

                <?php

                $units = get_field('units');

                ?>

                <div id="callback-data"><?php

                    echo json_encode(array('title' => get_field('var_title'), 'units' => array('label' => __($units['label'], 'cdc'), 'value' => __($units['value'], 'cdc')), 'decimals' => get_field('decimals')));

                    ?></div>

            </div>
        </div>

<?php

    } elseif (isset ($_GET['content']) && in_array($_GET['content'], ['location', 'sector'])) {
        // 2. ajax request for variable data by location
        //
        switch ($_GET['content']) {
            case 'location': // a grid square was clicked on variable map
                $selected_place = get_location_by_coords($_GET['lat'], $_GET['lon']);
                if (is_array($selected_place)) {
                    $location_name = $selected_place['geo_name'] . ', ' . short_province($selected_place['province']);
                } else {
                    $location_name = 'Point';
                }
                break;
            case 'sector': // a region was clicked on variable map
                $location_name = $_GET['region'] ?? 'Region';
                break;
        }

        $var_name = get_field('var_name');
        $dataset_name = arr_get($_GET, 'dataset_name', 'cmip6');
        $dataset_availability = get_field('dataset_availability');
        if (is_null($dataset_availability)) {
            $dataset_availability = ['cmip5', 'cmip6'];
        }

        ?>

        <div id="var-by-location" class="overlay-content-wrap variable-data-overlay col-12">
            <div class="overlay-content container-fluid">

                <h2 class="overlay-title text-primary"><?php echo $location_name; ?></h2>

                <div class="overlay-content-row">
                    <div class="overlay-content-chart">
                        <div class="navbar chart-navbar d-flex justify-content-around align-items-center mb-4 pb-4 border-bottom">
                            <div class="nav-item d-flex align-items-center">
                                <h6 class="mb-0"><?php _e('Dataset', 'cdc'); ?>:</h6>

                                <div class="btn-group btn-group-toggle w-100" data-toggle="buttons">
        <?php
        if (in_array("cmip5", $dataset_availability)) {
            ?>
                                    <label class="btn btn-outline-primary rounded-pill <?php echo $dataset_name == 'cmip5' ? 'active':'';?>">
                                        <input type="radio" class="chart-dataset" autocomplete="off" value="cmip5" <?php echo $dataset_name == 'cmip5' ? 'checked':'';?>>
                                        CMIP5
                                    </label>
                                    <?php
        }
        if (in_array("cmip6", $dataset_availability)) {
                                    ?>

                                    <label class="btn btn-outline-primary rounded-pill <?php echo $dataset_name == 'cmip6' ? 'active':'';?>">
                                        <input type="radio" class="chart-dataset" autocomplete="off" value="cmip6" <?php echo $dataset_name == 'cmip6' ? 'checked':'';?>>
                                        CMIP6
                                    </label>
            <?php
        }
            ?>
                                </div>
                            </div>

                            <div class="chart-delta nav-item d-flex align-items-center">
                                <?php

                                if ( get_field ( 'hasdelta' ) ) {
                                    $input_name = uniqid("chart-options-");
                                    ?>

                                    <h6 class="mb-0">Options:</h6>

                                    <div class="btn-group btn-group-toggle" data-toggle="buttons">

                                        <label class="btn btn-outline-primary rounded-pill">
                                            <input type="radio" class="chart-option" name="<?php echo $input_name;?>" value="annual">
                                            <?php _e('Annual values', 'cdc'); ?>
                                        </label>

                                        <label class="btn btn-outline-primary rounded-pill active">
                                            <input type="radio" class="chart-option" name="<?php echo $input_name;?>" value="30y" checked>
                                            <?php _e('30 year averages', 'cdc'); ?>
                                        </label>

                                        <label class="btn btn-outline-primary rounded-pill">
                                            <input type="radio" class="chart-option" name="<?php echo $input_name;?>" value="delta">
                                            <?php _e('30 year changes', 'cdc'); ?>
                                        </label>

                                    </div>

                                    <?php

                                }

                                ?>
                            </div>
                        </div>

                        <div class="navbar chart-navbar d-flex justify-content-between align-items-center mb-4 pb-4 border-bottom">
                            <div class="nav-item d-flex align-items-center mr-3">
                                <h6><span class="cdc-icon icon-download-data"></span> <?php _e('Download data', 'cdc'); ?></h6>

                                <div class="btn-group btn-group-sm mr-3" role="group">
                                    <a href="#" class="chart-export-data btn btn-sm btn-outline-secondary" data-type="csv">CSV</a>
                                </div>

                                <h6><span class="cdc-icon icon-download-img"></span> <?php _e('Download image', 'cdc'); ?></h6>

                                <div class="btn-group btn-group-sm" role="group">
                                    <a href="#" class="chart-export-img btn btn-sm btn-outline-secondary " data-type="png">PNG</a> <a href="#" class="chart-export-img btn btn-sm btn-outline-secondary" data-type="pdf">PDF</a>
                                </div>
                            </div>

                            <div class="nav-item d-flex align-items-center">
                                <a href="#" class="btn btn-sm btn-outline-secondary page-tour-trigger" data-tour="chart-tour"><span class="fas fa-question icon rounded-circle icon mr-3"></span><?php _e('How to read this', 'cdc'); ?></a>
                            </div>

                            <div class="nav-item d-flex align-items-center">
                                <h6 class="mb-0 mr-3"><?php _e( 'More', 'cdc'); ?></h6>

                                <div class="btn-group btn-group-sm" role="group">
                                    <a href="<?php echo home_url ( 'download' ); ?>" class="btn btn-sm btn-outline-secondary"><?php _e ( 'Download multiple grid cells', 'cdc' ); ?></a>
                                    <a href="<?php echo home_url ( 'analyze' ); ?>" class="btn btn-sm btn-outline-secondary"><?php _e ( 'Customize variable data', 'cdc' ); ?></a>
                                </div>
                            </div>
                        </div>

                        <div class="navbar chart-navbar d-flex align-items-center mb-5">

                        </div>

                        <div id="chart-placeholder" class="var-chart"></div>

                    </div>
                </div>

                <div class="page-tour" id="chart-tour" data-steps='<?php echo $chart_tour; ?>'></div>

                <?php

                $units = get_field('units');

                ?>

                <div id="callback-data"><?php

                    echo json_encode(array('title' => get_field('var_title'), 'units' => array('label' => __(arr_get($units, 'label', ''), 'cdc'), 'value' => __(arr_get($units, 'value', ''), 'cdc')), 'decimals' => get_field('decimals')));

                    ?></div>
            </div>
        </div>

        <?php

    } elseif (isset ($_GET['content']) && $_GET['content'] == 'slr-location') {

        // 2. ajax request for variable data by location
        //    (a grid square was clicked on variable map)

?>

<div id="var-by-location" class="overlay-content-wrap variable-data-overlay col-12">
    <div class="overlay-content container-fluid">
        <?php

        $selected_place = get_location_by_coords($_GET['lat'], $_GET['lon'],true);

        if (is_array($selected_place)) {
            $location_name = $selected_place['geo_name'] . ', ' . short_province($selected_place['province']);
        } else {

            if (isset ($_GET['station_name'])) {
                $location_name = $_GET['station_name'];
            } else {
                $location_name = 'Point: ' .  round($_GET['lat'],2) . "," .  round($_GET['lon'],2);
            }

        }

        ?>

        <h2 class="overlay-title text-primary"><?php echo $location_name; ?></h2>

        <div class="overlay-content-row">
            <div class="overlay-content-chart">
                <div class="navbar chart-navbar d-flex">

                    <div class="nav-item d-flex align-items-center mr-5">
                        <h6><span class="cdc-icon icon-download-data"></span> <?php _e('Download data', 'cdc'); ?></h6>

                        <div class="btn-group btn-group-sm" role="group">
                            <a href="#" class="chart-export-data btn btn-sm btn-outline-secondary" data-type="csv">CSV</a>
                        </div>
                    </div>

                    <div class="nav-item d-flex align-items-center">
                        <h6><span class="cdc-icon icon-download-img"></span> <?php _e('Download image', 'cdc'); ?></h6>

                        <div class="btn-group btn-group-sm" role="group">
                            <a href="#" class="chart-export-img btn btn-sm btn-outline-secondary " data-type="png">PNG</a> <a href="#" class="chart-export-img btn btn-sm btn-outline-secondary" data-type="pdf">PDF</a>
                        </div>
                    </div>
                </div>

                <div id="chart-placeholder" class="var-chart"></div>
            </div>
        </div>

        <div class="page-tour" id="chart-tour" data-steps='<?php echo $chart_tour; ?>'></div>

        <?php

        $units = get_field('units');

        ?>

        <div id="callback-data"><?php

            echo json_encode(array('title' => get_field('var_title'), 'units' => array('label' => __($units['label'], 'cdc'), 'value' => __($units['value'], 'cdc')), 'decimals' => get_field('decimals')));

            ?></div>
    </div>
</div>

<?php

    } elseif (isset ($_GET['content']) && $_GET['content'] == 'chart') {

        // 3. ajax request for variable data by location
        //    (a variable was selected on the location page)
        $var_name = get_field('var_name');
?>

<div class="row">
    <div class="var-description col-10 offset-1 col-sm-8 offset-sm-2 col-md-6 offset-md-5 col-lg-4 offset-lg-4">
        <?php the_content(); ?>
    </div>
</div>

<div class="align-items-center var-chart-container">
    <div class="navbar col-9 offset-1 chart-navbar d-flex align-items-center mb-5">
        <div class="align-items-center chart-delta nav-item flex-grow-1 d-flex">
            <?php

            if (get_field('hasdelta')) {
                $input_name = uniqid("chart-options-");
                ?>

                <h6 class="mb-0">Options:</h6>

                <div class="btn-group btn-group-toggle" data-toggle="buttons">

                    <label class="btn btn-outline-primary rounded-pill">
                        <input type="radio" class="chart-option" name="<?php echo $input_name;?>" value="annual">
                        <?php _e('Annual values', 'cdc'); ?>
                    </label>

                    <label class="btn btn-outline-primary rounded-pill active">
                        <input type="radio" class="chart-option" name="<?php echo $input_name;?>" value="30y" checked>
                        <?php _e('30 year averages', 'cdc'); ?>
                    </label>

                    <label class="btn btn-outline-primary rounded-pill">
                        <input type="radio" class="chart-option"name="<?php echo $input_name;?>" value="delta"><?php _e('30 year changes', 'cdc'); ?>
                    </label>

                </div>

                <?php

            }

            ?>
        </div>
        <div class="nav-item d-flex align-items-center mr-5">
        <a href="#" class="btn btn-sm all-caps btn-outline-secondary rounded-pill chart-tour-trigger offset-5" data-tour="page-tour" data-container="<?php the_field('var_name'); ?>-chart"><?php _e('How to read this', 'cdc'); ?></a>
        </div>
        <div class="nav-item d-flex align-items-center mr-3">
            <h6><span class="cdc-icon icon-download-data"></span> <?php _e('Download data', 'cdc'); ?></h6>

            <div class="btn-group btn-group-sm" role="group">
                <a href="#" class="chart-export-data btn btn-sm btn-outline-secondary" data-type="csv">CSV</a>
            </div>
        </div>

        <div class="nav-item d-flex align-items-center">
            <h6><span class="cdc-icon icon-download-img"></span> <?php _e('Download image', 'cdc'); ?></h6>

            <div class="btn-group btn-group-sm" role="group">
                <a href="#" class="chart-export-img btn btn-sm btn-outline-secondary " data-type="png">PNG</a> <a href="#" class="chart-export-img btn btn-sm btn-outline-secondary" data-type="pdf">PDF</a>
            </div>
        </div>

    </div>

    <div id="<?php the_field('var_name'); ?>-chart" class="var-chart col-10 col-lg-9 offset-1 mb-5 mb-lg-0">
        <h6 class="text-center"><?php _e('Loading chart data', 'cdc'); ?> …</h6>
    </div>

    <div class="var-btn text-center col-11">
        <a href="<?php echo $var_url; ?>?var=<?php the_field('var_name'); ?>&geo-select=<?php echo $GLOBALS['vars']['current_data']['location_data']['geo_id']; ?>" class="btn rounded-pill btn-outline-secondary"><?php _e('View on map', 'cdc'); ?></a>
    </div>
</div>

<?php

    $units = get_field('units');

?>

<div id="callback-data"><?php

    echo json_encode(array('title' => get_field('var_title'), 'units' => array('label' => __($units['label'], 'cdc'), 'value' => __($units['value'], 'cdc')), 'decimals' => get_field('decimals')));

?></div>

<?php

    } elseif (isset ($_GET['info'])) {
        
        get_header();
        // Direct variable info page
        
?>
<div> </div>
<div id="var-interstitial" class="bg-primary text-white" style="padding:160px 0">
    <div class="container-fluid">
        <h2 class="overlay-title"><?php echo get_the_title(); ?></h2>

        <div class="overlay-content-row">
            <div class="overlay-content-heading d-flex align-items-center justify-content-end">
                <h6 class="vertical-label"><span>Variable</span></h6>
            </div>

            <div class="overlay-content-text">
                <?php the_content(); ?>
            </div>
        </div>

        <?php

        $var_type = get_the_terms(get_the_ID(), 'var-type');

        if (!empty ($var_type)) {
            $var_type = $var_type[0]->slug;
        }

        if ($var_type != 'station-data' && get_field('var_name') != 'slr') {

        ?>

        <h5 class="overlay-title text-center all-caps"><?php _e('Select a scenario below to continue', 'cdc'); ?></h5>

        <div class="overlay-content-row">
            <div class="overlay-content-heading d-flex align-items-center justify-content-end">
                <h6 class="vertical-label"><span><?php _e('Scenario', 'cdc'); ?></span></h6>
            </div>

            <div class="overlay-content-text">
                <div class="overlay-scenarios">
                    <form class="form-inline" action="<?php echo $var_url; ?>">
                        <input type="hidden" name="var" value="<?php the_field('var_name'); ?>">
                        <?php
                        if (in_array(get_field('var_name'), ['spei_12m', 'spei_3m'])) {
                            ?>
                            <input type="hidden" name="mora" value="sep">
                            <?php
                        }
                        ?>
                        <div class="d-lg-flex justify-content-around align-items-center w-100">
                            <div class="btn-group btn-group-toggle mb-5 mb-lg-0" data-toggle="buttons">
                                <label class="btn btn-outline-light text-left active"> <input type="radio" name="rcp" id="variable-detail-high" autocomplete="off" value="ssp585" checked> <?php _e('High Emissions', 'cdc'); ?><br>(SSP5-8.5) </label>

                                <label class="btn btn-outline-light text-left"> <input type="radio" name="rcp" id="variable-detail-lower" autocomplete="off" value="ssp245"> <?php _e('Moderate Emissions', 'cdc'); ?><br>(SSP2-4.5) </label>

                                <label class="btn btn-outline-light text-left"> <input type="radio" name="rcp" id="variable-detail-lowest" autocomplete="off" value="ssp126"> <?php _e('Low Emissions', 'cdc'); ?><br>(SSP1-2.6) </label>
                            </div>

                            <div class="d-flex justify-content-center d-lg-block" role="group" aria-label="">
                                <button type="submit" class="btn btn-secondary border-white rounded-pill all-caps"><?php _e('Explore', 'cdc'); ?></button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <?php

            } else {

        ?>

        <div class="overlay-content-row">
            <div class="overlay-content-heading d-flex align-items-center justify-content-end">
                <h6 class="vertical-label"><span>&nbsp;</span></h6>
            </div>

            <div class="overlay-content-text">
                <div class="overlay-scenarios">
                    <form class="form-inline" action="<?php echo $var_url; ?>">
                        <input type="hidden" name="var" value="<?php the_field('var_name'); ?>">

                        <div class="d-flex justify-content-around align-items-center w-100">
                            <div class="" role="group" aria-label="">
                                <button type="submit" class="btn btn-secondary border-white rounded-pill all-caps"><?php _e('Explore', 'cdc'); ?></button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <?php

            }

        ?>
    </div>
</div>

<?php

        get_footer();

    } else {

        // 4. redirect to variables page with this variable ID selected
    
        header('Location: ' . $var_url . '?var=' . get_field('var_name'));

    }

endwhile; endif;
