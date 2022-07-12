<form id="download-form" class="needs-validation" novalidate>
    <div class="form-layout-row row align-items-center">
        <p class="form-label-wrap col-10 col-sm-3 offset-1 mb-3 mb-sm-0">
            <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">1</span>
            <label for="download-dataset" class="form-label"><?php _e('Select a frequency', 'cdc'); ?></label>
        </p>

        <div class="form-select col-10 offset-1 col-sm-4 offset-sm-0 mb-3 mb-sm-0">
            <select class="custom-select custom-select-md select2 form-control input-large" name="download-dataset" id="download-dataset" data-container-css-class="big-menu btn btn-lg btn-outline-primary rounded-pill" data-dropdown-css-class="big-menu-dropdown">
                <option value="annual" data-timestep="annual" selected><?php _e('Annual', 'cdc'); ?></option>

                <option value="daily" data-timestep="daily"><?php _e('Daily', 'cdc'); ?></option>
                <option value="2qsapr" data-timestep="2qsapr"><?php _e('April to September', 'cdc'); ?></option>

                <optgroup label="<?php _e('Monthly', 'cdc'); ?>">
                    <option value="all" data-timestep="monthly"><?php _e('All months', 'cdc'); ?></option>
                    <option value="jan" data-timestep="monthly"><?php _e('January', 'cdc'); ?></option>
                    <option value="feb" data-timestep="monthly"><?php _e('February', 'cdc'); ?></option>
                    <option value="mar" data-timestep="monthly"><?php _e('March', 'cdc'); ?></option>
                    <option value="apr" data-timestep="monthly"><?php _e('April', 'cdc'); ?></option>
                    <option value="may" data-timestep="monthly"><?php _e('May', 'cdc'); ?></option>
                    <option value="jun" data-timestep="monthly"><?php _e('June', 'cdc'); ?></option>
                    <option value="jul" data-timestep="monthly"><?php _e('July', 'cdc'); ?></option>
                    <option value="aug" data-timestep="monthly"><?php _e('August', 'cdc'); ?></option>
                    <option value="sep" data-timestep="monthly"><?php _e('September', 'cdc'); ?></option>
                    <option value="oct" data-timestep="monthly"><?php _e('October', 'cdc'); ?></option>
                    <option value="nov" data-timestep="monthly"><?php _e('November', 'cdc'); ?></option>
                    <option value="dec" data-timestep="monthly"><?php _e('December', 'cdc'); ?></option>
                </optgroup>
                <optgroup label="<?php _e('Seasonal', 'cdc'); ?>">
                    <option value="spring" data-timestep="qsdec"><?php _e('Spring', 'cdc'); ?></option>
                    <option value="summer" data-timestep="qsdec"><?php _e('Summer', 'cdc'); ?></option>
                    <option value="fall" data-timestep="qsdec"><?php _e('Fall', 'cdc'); ?></option>
                    <option value="winter" data-timestep="qsdec"><?php _e('Winter', 'cdc'); ?></option>
                </optgroup>
            </select>
        </div>

        <p class="form-help col-10 col-sm-2 offset-1"><a href="<?php echo get_permalink(filtered_ID_by_path('about', $GLOBALS['vars']['current_lang'])); ?>#about-datasets"><?php _e('Learn more about datasets', 'cdc'); ?></a></p>
    </div>

    <div class="form-layout-row row align-items-center">
        <p class="form-label-wrap col-10 col-sm-3 offset-1 mb-3 mb-sm-0">
            <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">2</span> <label for="download-variable" class="form-label"><?php _e('Select a variable', 'cdc'); ?></label>
        </p>

        <div class="form-select col-10 offset-1 col-sm-4 offset-sm-0 mb-3 mb-sm-0">

            <select class="custom-select custom-select-md select2 form-control input-large" name="download-variable" id="download-variable" data-container-css-class="big-menu btn btn-lg btn-outline-primary rounded-pill" data-dropdown-css-class="big-menu-dropdown">
                <?php

                $var_types = get_terms(array('taxonomy' => 'var-type', 'hide_empty' => true, 'exclude' => array(10, 14) // station data term ID in en and fr
                ));

                if (!empty ($var_types)) {

                    foreach ($var_types as $var_type) {

                        ?>

                        <optgroup label="<?php echo $var_type->name; ?>">

                            <?php

                            $vars_by_type = new WP_Query (array('post_type' => 'variable', 'posts_per_page' => -1, 'orderby' => 'menu_order', 'order' => 'asc', 'tax_query' => array(array('taxonomy' => 'var-type', 'terms' => $var_type->term_id))));

                            if ($vars_by_type->have_posts()) : while ($vars_by_type->have_posts()) :
                                $vars_by_type->the_post();

                                $var_name = get_field('var_name');

                                ?>

                                <option
                                        value="<?php echo $var_name; ?>"
                                    <?php echo (isset ($_GET['var']) && $_GET['var'] == $var_name) ? 'selected' : ''; ?>
                                    <?php echo ($var_name == 'tx_mean' || $var_name == 'tn_mean' || $var_name == 'prcptot') ? 'class="daily"' : ''; ?>
                                ><?php the_title(); ?></option>

                            <?php

                            endwhile; endif;

                            wp_reset_postdata();

                            ?>

                        </optgroup>

                        <?php

                    } // foreach var_types

                }

                ?>

            </select>

        </div>

        <p class="form-help col-10 col-sm-2 offset-1"><a href="<?php echo get_permalink(filtered_ID_by_path('about', $GLOBALS['vars']['current_lang'])); ?>#about-datasets"><?php _e('Learn more about variables', 'cdc'); ?></a></p>
    </div>


    <div id="selection-type" class="form-layout-row row align-items-center">
        <p class="form-label-wrap col-10 col-sm-3 offset-1 mb-3 mb-sm-0">
            <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">3</span> <label for="download-variable" class="form-label"><?php _e('Selection type', 'cdc'); ?></label>
        </p>

        <div class="form-select col-10 offset-1 col-sm-4 offset-sm-0">
            <div id="select-btn-group" class="btn-group btn-group-toggle w-100" data-toggle="buttons">
                <label id="select-label-gridded" class="btn btn-outline-primary active"> <input type="radio" name="download-select" id="download-select-gridded" autocomplete="off" value="gridded" checked> <?php _e('Gridded','cdc'); ?></label>
                <label id="select-label-bbox" class="btn btn-outline-primary"> <input type="radio" name="download-select" id="download-select-bbox" autocomplete="off" value="bbox"> <?php _e('Bounding box'); ?> </label>
            </div>
        </div>

    </div>



    <div class="form-layout-row row align-items-center">
        <p class="form-label-wrap col-10 col-sm-3 offset-1 mb-3 mb-sm-0">
            <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">4</span> <label for="download-location" class="form-label"><?php _e('Select a location', 'cdc'); ?></label>
        </p>

        <div class="form-select col-10 offset-1 col-sm-3 offset-sm-0 mb-3 mb-sm-0">
            <!-- <input type="hidden" name="download-lat" id="download-lat"> -->
            <!-- <input type="hidden" name="download-lon" id="download-lon"> -->
            <input type="hidden" name="download-coords" id="download-coords">

            <select class="custom-select custom-select-lg select2 form-control-lg rounded-pill border-dark text-center download-location" name="download-location" id="download-location" data-map="variable" data-dropdown-css-class="big-menu-dropdown" required>
                <option value=""><?php _e('Search for a City/Town', 'cdc'); ?></option>
            </select>


        </div>
        <div class="col-10  col-sm-1 mb-3 mb-sm-0">
        <a class="btn btn-primary text-white offset-1" id="download-clear" target="_blank"><?php _e('Clear selection', 'cdc'); ?></a>
        </div>
        <p class="form-help col-2 col-sm-2 offset-1"><?php _e('Zoom in to the map to select at least one grid coordinate.', 'cdc'); ?></p>

        <div id="download-map-variable-container" class="col-10 offset-1 col-lg-8 offset-lg-2 download-map-container">
            <div id="map-overlay">
                <div id="map-overlay-content">
                    <h4><?php _e('Zoom in to the map to select at least one grid coordinate.', 'cdc'); ?></h4>
                    <span class="btn btn-outline-secondary rounded-pill"><?php _e('Dismiss', 'cdc'); ?></span>
                </div>

            </div>

            <div id="download-map-variable" class="download-map"></div>
            <!--
                        <div style="position:absolute;right:0;width:200px;z-index:1000">
                            <select id="gridselect" class="custom-select custom-select-md select2 form-control input-large select2-hidden-accessible">
                                <option>Gridded Data</option>
                                <option>Census subdivisions</option>
                                <option>Health</option>
                                <option>Watershed</option>
                            </select>
                        </div>
            -->
        </div>
    </div>

    <div id="download-filetype" class="form-layout-row row align-items-center">
        <p class="form-label-wrap col-10 col-sm-3 offset-1 mb-3 mb-sm-0">
            <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">5</span> <label for="format" class="form-label"><?php _e('Select a data format', 'cdc'); ?></label>
        </p>

        <div class="form-select col-10 offset-1 col-sm-4 offset-sm-0">
            <div id="format-btn-group" class="btn-group btn-group-toggle w-100" data-toggle="buttons">
                <label id="format-label-csv" class="btn btn-outline-primary active"> <input type="radio" name="download-format" id="download-format-csv" autocomplete="off" value="csv" checked> CSV </label>

                <label id="format-label-json" class="btn btn-outline-primary"> <input type="radio" name="download-format" id="download-format-json" autocomplete="off" value="json"> JSON </label>

                <label id="format-label-nc" class="btn btn-outline-primary"> <input type="radio" name="download-format" id="download-format-nc" autocomplete="off" value="nc"> NetCDF </label>
            </div>
        </div>
    </div>

    <div id="annual-process-wrap" class="form-layout-row row align-items-center form-process">
        <div class="col-10 offset-1 col-sm-6 offset-sm-3 input-group input-group-lg">

            <input type="text" name="download-filename" id="download-filename" class="form-control" aria-label="" placeholder="<?php _e('Save as', 'cdc'); ?> …" required>

            <div class="input-group-append">
                <a class="btn btn-secondary text-white all-caps download-process-btn disabled" id="download-process" target="_blank"><?php _e('Process', 'cdc'); ?> <i class="far fa-arrow-alt-circle-down"></i></a>
            </div>

        </div>
        <div id="download-result" class="col-10 offset-1 col-sm-6 offset-sm-3 mt-3 p-4 bg-light" style="display: none;">
            <p class="form-label-wrap"><?php _e('Processed successfully.', 'cdc'); ?> <a class="download_variable_data_bccaqv2" href="" target="_blank"><?php _e('Click here to download your data', 'cdc'); ?></a>.</p>
        </div>
    </div>

    <div id="daily-process-wrap">
        <div class="form-layout-row form-process">
            <div class="col-10 offset-1 col-md-8 offset-md-2 row bg-light">
                <div id="daily-captcha-wrap" class="col-10-of-10 col-md-3-of-8 p-4">
                    <label for="daily-captcha_code" class="d-block w-100"><?php _e('Enter the characters shown here', 'cdc'); ?>: </label>

                    <div class="d-flex align-items-center">
                        <img id="daily-captcha" src="<?php echo $GLOBALS['vars']['child_theme_dir']; ?>resources/php/securimage/securimage_show.php" alt="CAPTCHA Image"/> <input type="text" name="daily-captcha_code" id="daily-captcha_code" class="form-control ml-4" placeholder="XXXX" size="4" maxlength="4" data-placement="bottom" title="<?php _e('Non-valid entered characters. Please try again.', 'cdc'); ?>"/>
                    </div>
                </div>

                <div class="col-10-of-10 col-md-5-of-8 p-4">
                    <label for="daily-email"><?php _e('Enter your email address', 'cdc'); ?>:</label>

                    <div class="input-group input-group-lg">
                        <input type="email" name="daily-email" id="daily-email" class="form-control" aria-label="" placeholder="" required>

                        <div class="input-group-append">
                            <a class="btn btn-secondary text-white all-caps download-process-btn disabled" id="daily-process" target="_blank"><?php _e('Send Request', 'cdc'); ?> <i class="far fa-arrow-alt-circle-down"></i></a>
                        </div>
                    </div>
                    <div class="form-check form-check-inline mt-4">
                        <input class="form-check-input" type="checkbox" value="" id="signup">
                        <label class="form-check-label" for="signup"><?php _e ( 'Subscribe to the ClimateData.ca newsletter', 'cdc' ); ?></label>
                    </div>
                </div>

                <div class="col-8-of-8 p-4">
                    <p class="form-label-wrap mt-3"><strong><?php _e('Note:', 'cdc'); ?></strong> <?php _e('This data requires processing. All data will be delivered via an email notification once the processing is complete.', 'cdc'); ?></p>
                </div>

            </div>
        </div>
    </div>

</form>
