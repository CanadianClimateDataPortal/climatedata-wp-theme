<div class="map-filters container-fluid">
    <div id="var-sliders" class="map-sliders row align-items-end">

        <?php




        while (have_rows('variable_sliders')) {
            the_row();

            switch (get_row_layout()) {

                case 'decade' :


                    ?>

                    <div class="filter-container slider-container col offset-1">
                        <h6><?php _e('Time period', 'cdc'); ?></h6>

                        <div id="range-slider-container" class="decade-slider-container" data-min="<?php echo get_field('time_slider_min_value',$post_id); ?>" data-max="<?php echo get_field('time_slider_max_value',$post_id); ?>" data-default="<?php echo get_field('time_slider_default_value',$post_id); ?>" data-interval="<?php echo get_field('time_slider_interval',$post_id); ?>">
                            <input id="range-slider" class="decade-slider">
                        </div>
                    </div>

                    <?php

                    break;

                case 'opacity' :

                    ?>

                    <div class="filter-container slider-container col-2 offset-1 px-4 border-left border-right">
                        <h6><?php _e('Opacity', 'cdc'); ?></h6>

                        <div id="opacity-slider-container" class="opacity-slider-container" data-min="<?php the_sub_field('min'); ?>" data-max="<?php the_sub_field('max'); ?>" data-default="<?php the_sub_field('default'); ?>">
                            <input id="opacity-slider" class="opacity-slider">
                        </div>
                    </div>

                    <?php

                    break;

            }

        }

        ?>
        
        <div class="col-2 offset-1 align-self-center pr-4 d-flex justify-content-end">
            <a href="#" id="screenshot" class="btn btn-outline-primary rounded-pill all-caps" data-tour="page-tour" target="_blank"><?php _e ( 'Export Map Image', 'cdc' ); ?></a>
        </div>
    </div>
</div>
