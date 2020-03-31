<?php

  /*

    Template Name: Analyze

  */

  //
  // ENQUEUE
  //

  function tpl_enqueue() {

    wp_enqueue_script ( 'analyze-functions' );

    wp_enqueue_script ( 'highcharts-highstock' );
    wp_enqueue_script ( 'highcharts-more' );
    wp_enqueue_script ( 'highcharts-exporting' );
    wp_enqueue_script ( 'highcharts-export-data' );

    wp_enqueue_script ( 'leaflet' );

    wp_enqueue_script ( 'vector-grid' );
    wp_enqueue_script ( 'sync' );
    wp_enqueue_script ( 'nearest' );

    wp_enqueue_script ( 'jquery-ui-core' );
    wp_enqueue_script ( 'jquery-ui-widget' );
    wp_enqueue_script ( 'jquery-effects-core' );
    wp_enqueue_script ( 'jquery-ui-accordion' );

    wp_enqueue_script ( 'moment', 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment.min.js', null, null, true );
    wp_enqueue_script ( 'tempusdominus', 'https://cdnjs.cloudflare.com/ajax/libs/tempusdominus-bootstrap-4/5.0.1/js/tempusdominus-bootstrap-4.min.js', array ( 'jquery' ), null, true );

    wp_enqueue_style ( 'tempusdominus', 'https://cdnjs.cloudflare.com/ajax/libs/tempusdominus-bootstrap-4/5.0.1/css/tempusdominus-bootstrap-4.min.css', null, null, 'all' );

  }

  add_action ( 'wp_enqueue_scripts', 'tpl_enqueue' );

  //
  // TEMPLATE
  //

  get_header();

  if ( have_posts() ) : while ( have_posts() ) : the_post();


?>

<main id="analyze-content">

  <?php

    include ( locate_template ( 'template/hero/hero.php' ) );

  ?>

  <section id="analyze-section" class="page-section bg-white">

    <div class="section-container">
      <div class="container-fluid">
        <div class="row">

          <div id="analyze-form" class="col-3">

            <form id="analyze-form-inputs">

              <input class="add-to-object" type="hidden" name="lat" id="lat" value="">
              <input class="add-to-object" type="hidden" name="lon" id="lon" value="">

              <div id="analyze-steps">
                <div class="accordion-head" data-step="1">
                  <h5 class="d-flex align-items-center justify-content-between all-caps">
                    <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">1</span>
                    <span class="flex-grow-1">Choose a dataset</span>
                    <i class="fas fa-caret-down"></i>
                  </h5>
                </div>

                <div class="accordion-content" data-step="1">
                  <div class="accordion-content-inner">
                    <div class="field validate-input type-radio">
                      <div class="input-row form-check">
                        <div class="input-item">
                          <input class="form-check-input add-to-object" type="radio" name="dataset_name" id="analyze-dataset-bccaqv2" value="bccaqv2">
                          <label class="form-check-label" for="analyze-dataset-bccaqv2">BCCAQv2</label>
                        </div>

                        <!--<span class="tooltip-icon"><i class="fas fa-question"></i></span>-->
                      </div>
                    </div>
                  </div>
                </div>

                <div class="accordion-head" data-step="2">
                  <h5 class="d-flex align-items-center justify-content-between all-caps">
                    <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">2</span>
                    <span class="flex-grow-1">Select locations</span>
                    <i class="fas fa-caret-down"></i>
                  </h5>
                </div>

                <div class="accordion-content" data-step="2">
                  <div class="accordion-content-inner">
                    <div class="field validate-input type-radio">
                      <div class="input-row form-check">
                        <div class="input-item">
                          <input class="form-check-input" type="radio" name="analyze-location" id="analyze-location-grid" value="grid">
                          <label class="form-check-label" for="analyze-location-grid">Grids</label>
                        </div>

                        <!--<span class="tooltip-icon"><i class="fas fa-question"></i></span>-->
                      </div>

                      <div class="input-row form-check">
                        <div class="input-item">
                          <input class="form-check-input" type="radio" name="analyze-location" id="analyze-location-grid" value="grid" disabled>
                          <label class="form-check-label" for="analyze-location-grid">Other location types coming soon</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="accordion-head" data-step="3">
                  <h5 class="d-flex align-items-center justify-content-between all-caps">
                    <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">3</span>
                    <span class="flex-grow-1">Customize variables</span>
                    <i class="fas fa-caret-down"></i>
                  </h5>
                </div>

                <div class="accordion-content" data-step="3">
                  <div class="accordion-content-scroll">
                    <div class="accordion-content-inner">
                      <div class="field validate-input type-radio">
                        <?php

                          if ( have_rows ( 'analyze_vars' ) ) {
                            while ( have_rows ( 'analyze_vars' ) ) {
                              the_row();

                              $var_description = array ();

                              if ( have_rows ( 'description' ) ) {
                                while ( have_rows ( 'description' ) ) {
                                  the_row();

                                  if ( get_row_layout() == 'text' ) {

                                    $new_block = array (
                                      'text' => get_sub_field ( 'text' )
                                    );

                                  } elseif ( get_row_layout() == 'input' ) {

                                    $new_block = array (
                                      'id' => get_sub_field ( 'id' ),
                                      'units' => get_sub_field ( 'units' ),
                                      'decimals' => get_sub_field ( 'decimals' ),
                                      'min' => get_sub_field ( 'min' ),
                                      'max' => get_sub_field ( 'max' )
                                    );

                                  }

                                  $new_block['type'] = get_row_layout();

                                  $var_description[] = $new_block;

                                }
                              }

                        ?>

                        <div class="input-row form-check input-variable" data-content='<?php echo json_encode ( $var_description ); ?>'>
                          <div class="input-item">
                            <input class="form-check-input" type="radio" name="analyze-var" id="analyze-var-<?php the_sub_field ( 'var' ); ?>" value="<?php the_sub_field ( 'var' ); ?>">
                            <label class="form-check-label" for="analyze-var-<?php the_sub_field ( 'var' ); ?>"><?php the_sub_field ( 'name' ); ?></label>
                          </div>

  <!--                         <span data-href="<?php echo get_permalink ( $var ); ?>" class="tooltip-icon analyze-var"><i class="fas fa-question"></i></span> -->
                        </div>

                        <?php

                            }
                          }

                        ?>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="accordion-head" data-step="4">
                  <h5 class="d-flex align-items-center justify-content-between all-caps">
                    <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">4</span>
                    <span class="flex-grow-1">Choose a timeframe</span>
                    <i class="fas fa-caret-down"></i>
                  </h5>
                </div>

                <div class="accordion-content" data-step="4">
                  <div class="accordion-content-inner">
                    <div class="validate-input type-select">
                      <div class="input-row mb-4">
                        <div class="input-item">
                          <label class="form-check-label" for="analyze-timeframe-start">Start Year</label>
                          <!--<span class="tooltip-icon"><i class="fas fa-question"></i></span>-->
                        </div>

                        <select name="start_date" id="analyze-timeframe-start" class="custom-select custom-select-lg add-to-object">
                          <option value="">---</option>
                          <?php

                            for ( $i = 1950; $i <= 2100; $i += 5 ) {
                              echo '<option value="' . $i . '">' . $i . '</option>';
                            }

                          ?>
                        </select>
                      </div>

                      <div class="input-row">
                        <div class="input-item">
                          <label class="form-check-label" for="analyze-timeframe-end">End Year</label>
                          <!--<span class="tooltip-icon"><i class="fas fa-question"></i></span>-->
                        </div>

                        <select name="end_date" id="analyze-timeframe-end" class="custom-select custom-select-lg add-to-object">
                          <option value="">---</option>
                          <?php

                            for ( $i = 1950; $i <= 2100; $i += 5 ) {

                              echo '<option value="' . $i . '">' . $i . '</option>';

                            }

                          ?>
                        </select>

                      </div>
                    </div>
                  </div>
                </div>

                <div class="accordion-head" data-step="5">
                  <h5 class="d-flex align-items-center justify-content-between all-caps">
                    <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">5</span>
                    <span class="flex-grow-1">Advanced</span>
                    <i class="fas fa-caret-down"></i>
                  </h5>
                </div>

                <div class="accordion-content" data-step="5">
<!--                   <div class="scroll-fade"></div> -->

                  <div class="accordion-content-scroll">
                    <div class="accordion-content-inner">

                      <div class="field validate-input type-radio">
                        <p class="input-label"><?php _e ( 'Models', 'cdc' ); ?></p>

                        <div class="input-row form-check">
                          <div class="input-item">
                            <input class="form-check-input add-to-object" type="radio" name="models" id="analyze-model-PCIC12" value="PCIC12" checked>
                            <label class="form-check-label" for="analyze-model-PCIC12">PCIC12 (Ensemble)</label>
                          </div>
                        </div>

                        <div class="input-row form-check">
                          <div class="input-item">
                            <input class="form-check-input add-to-object" type="radio" name="models" id="analyze-model-24MODELS" value="24MODELS">
                            <label class="form-check-label" for="analyze-model-24MODELS"><?php _e ( 'All models', 'cdc' ); ?></label>
                          </div>
                        </div>

                      </div>

                          <?php

                            /*

                      <div class="field type-checkbox">
                        <div class="form-check input-row select-all">
                          <div class="input-item">
                            <input class="form-check-input" type="checkbox" name="" id="analyze-model-all" value="all">
                            <label class="form-check-label" for="analyze-model-all">Models</label>
                          </div>
                        </div>

                        <div class="tree d-flex flex-wrap">

                          <?php

                            $models = array (
                              'PCIC12',
                              'BNU-ESM',
                              'CCSM4',
                              'CESM1-CAM5',
                              'CNRM-CM5',
                              'CSIRO-Mk3-6-0',
                              'CanESM2',
                              'FGOALS-g2',
                              'GFDL-CM3',
                              'GFDL-ESM2G',
                              'GFDL-ESM2M',
                              'HadGEM2-AO',
                              'HadGEM2-ES',
                              'IPSL-CM5A-LR',
                              'IPSL-CM5A-MR',
                              'MIROC-ESM-CHEM',
                              'MIROC-ESM',
                              'MIROC5',
                              'MPI-ESM-LR',
                              'MPI-ESM-MR',
                              'MRI-CGCM3',
                              'NorESM1-M',
                              'NorESM1-ME',
                              'bcc-csm1-1-m',
                              'bcc-csm1-1'
                            );

                            foreach ( $models as $model ) {

                          ?>

                          <div class="input-row form-check w-50">
                            <div class="input-item">
                              <input class="form-check-input add-to-object" type="checkbox" name="models" id="analyze-model-<?php echo $model; ?>" value="<?php echo $model; ?>" checked>
                              <label class="form-check-label" for="analyze-model-<?php echo $model; ?>"><?php echo $model; ?></label>
                            </div>
                          </div>

                          <?php

                            }

                          ?>
                        </div>
                      </div>

                      */

                      ?>

                      <div class="field type-checkbox">
                        <div class="form-check input-row select-all">
                          <div class="input-item">
                            <input class="form-check-input" type="checkbox" name="" id="analyze-rcp-all" value="rcp">
                            <label class="form-check-label" for="analyze-rcp-all">Representative Concentration Pathways (RCPs)</label>
                          </div>
                        </div>

                        <div class="tree d-flex flex-wrap">
                          <div class="input-row form-check w-25">
                            <div class="input-item">
                              <input class="form-check-input add-to-object" type="checkbox" name="rcp" id="analyze-rcp-85" value="rcp85" checked>
                              <label class="form-check-label" for="analyze-rcp-85">8.5</label>
                            </div>
                          </div>

                          <div class="input-row form-check w-25">
                            <div class="input-item">
                              <input class="form-check-input add-to-object" type="checkbox" name="rcp" id="analyze-rcp-45" value="rcp45">
                              <label class="form-check-label" for="analyze-rcp-45">4.5</label>
                            </div>
                          </div>

                          <div class="input-row form-check w-25">
                            <div class="input-item">
                              <input class="form-check-input add-to-object" type="checkbox" name="rcp" id="analyze-rcp-26" value="rcp26">
                              <label class="form-check-label" for="analyze-rcp-26">2.6</label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="field type-checkbox">
                        <div class="form-check input-row select-all">
                          <div class="input-item">
                            <input class="form-check-input" type="checkbox" name="" id="analyze-model-all" value="all">
                            <label class="form-check-label" for="analyze-model-all">Percentiles</label>
                          </div>
                        </div>

                        <div class="tree d-flex flex-wrap">
                          <div class="input-row form-check w-25">
                            <div class="input-item">
                              <input class="form-check-input add-to-object" type="checkbox" name="ensemble_percentiles" id="analyze-percentile-5" value="5">
                              <label class="form-check-label" for="analyze-percentile-5">5</label>
                            </div>
                          </div>

                          <div class="input-row form-check w-25">
                            <div class="input-item">
                              <input class="form-check-input add-to-object" type="checkbox" name="ensemble_percentiles" id="analyze-percentile-10" value="10" checked>
                              <label class="form-check-label" for="analyze-percentile-10">10</label>
                            </div>
                          </div>

                          <div class="input-row form-check w-25">
                            <div class="input-item">
                              <input class="form-check-input add-to-object" type="checkbox" name="ensemble_percentiles" id="analyze-percentile-25" value="25">
                              <label class="form-check-label" for="analyze-percentile-25">25</label>
                            </div>
                          </div>

                          <div class="input-row form-check w-25">
                            <div class="input-item">
                              <input class="form-check-input add-to-object" type="checkbox" name="ensemble_percentiles" id="analyze-percentile-50" value="50" checked>
                              <label class="form-check-label" for="analyze-percentile-50">50</label>
                            </div>
                          </div>

                          <div class="input-row form-check w-25">
                            <div class="input-item">
                              <input class="form-check-input add-to-object" type="checkbox" name="ensemble_percentiles" id="analyze-percentile-75" value="75">
                              <label class="form-check-label" for="analyze-percentile-75">75</label>
                            </div>
                          </div>

                          <div class="input-row form-check w-25">
                            <div class="input-item">
                              <input class="form-check-input add-to-object" type="checkbox" name="ensemble_percentiles" id="analyze-percentile-90" value="90" checked>
                              <label class="form-check-label" for="analyze-percentile-90">90</label>
                            </div>
                          </div>

                          <div class="input-row form-check w-25">
                            <div class="input-item">
                              <input class="form-check-input add-to-object" type="checkbox" name="ensemble_percentiles" id="analyze-percentile-95" value="95">
                              <label class="form-check-label" for="analyze-percentile-95">95</label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="field validate-input type-radio d-flex flex-wrap">
                        <p class="input-label w-100"><?php _e ( 'Output Format', 'cdc' ); ?></p>

                        <div class="input-row form-check w-50">
                          <div class="input-item">
                            <input class="form-check-input add-to-object" type="radio" name="output_format" id="analyze-format-csv" value="csv" checked>
                            <label class="form-check-label" for="analyze-model-csv">CSV</label>
                          </div>
                        </div>

                        <div class="input-row form-check w-50">
                          <div class="input-item">
                            <input class="form-check-input add-to-object" type="radio" name="output_format" id="analyze-format-netcdf" value="netcdf">
                            <label class="form-check-label" for="analyze-model-netcdf">NetCDF</label>
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>

                </div>
              </div>

            </form>
          </div>

          <div class="col-9">
            <div id="analyze-header">
              <div id="analyze-breadcrumb" class="d-flex">
                <div class="step" data-step="1">
                  <div class="crumb">
                    <h6>Dataset</h6>
                    <p class="value"></p>
                  </div>
                </div>

                <div class="step" data-step="2">
                  <div class="caret">
                    <i class="fas fa-caret-right fa-2x"></i>
                  </div>

                  <div class="crumb">
                    <h6>Location <i class="fas fa-exclamation-circle ml-3 text-warning validation-tooltip" data-toggle="tooltip" data-placement="bottom" title="<?php _e ( 'Zoom in to the map to select at least one grid coordinate.', 'cdc' ); ?>"></i></h6>
                    <p class="value"></p>
                  </div>
                </div>

                <div class="step" data-step="3">
                  <div class="caret">
                    <i class="fas fa-caret-right fa-2x"></i>
                  </div>

                  <div class="crumb">
                    <h6>Variable(s) <i class="fas fa-exclamation-circle ml-3 text-warning validation-tooltip" data-toggle="tooltip" data-placement="bottom" title="<?php _e ( 'Make sure a value is entered for each variable threshold.', 'cdc' ); ?>"></i></h6>
                    <p class="value"></p>
                  </div>
                </div>

                <div class="step" data-step="4">
                  <div class="caret">
                    <i class="fas fa-caret-right fa-2x"></i>
                  </div>

                  <div class="crumb">
                    <h6>Timeframe</h6>
                    <p class="value"></p>
                  </div>
                </div>

                <div class="step" data-step="5">
                  <div class="caret">
                    <i class="fas fa-caret-right fa-2x"></i>
                  </div>

                  <div class="crumb">
                    <h6>Options</h6>
                    <p class="value"></p>
                  </div>
                </div>
              </div>

              <div id="analyze-detail">
                <div class="row">
                  <div class="col-7-of-9 offset-1-of-9">
                    <div id="placeholder"></div>
                  </div>

                  <div class="col-1-of-9">
                    <span id="detail-close" class="close-btn">
                      <i class="fas fa-times"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div id="analyze-map-container">
              <div id="geo-select-container" class="text-center">
                <select class="custom-select custom-select-lg select2 form-control" name="geo-select" id="geo-select">
                  <option value=""><?php _e ( 'Search for a City/Town', 'cdc' ); ?></option>
                </select>
              </div>

              <div id="map-overlay">

                <div id="map-overlay-content">
                  <h4>Choose a dataset and process to visualize data on map</h4>
                  <p>Start by selecting a dataset from the menu on the left.</p>
                  <span class="btn btn-outline-secondary rounded-pill hidden">Dismiss</span>
                </div>

              </div>

              <div id="analyze-map"></div>
            </div>
          </div>
        </div>

        <div id="analyze-submit">
          <div class="row form-process pt-5">
            <div class="col-10 offset-1 col-md-8 offset-md-2 row bg-light">
              <div id="analyze-captcha-wrap" class="col-10-of-10 col-md-3-of-8 p-4">
                <label for="analyze-captcha_code" class="d-block w-100"><?php _e ( 'Enter the characters shown here', 'cdc' ); ?>: </label>

                <div class="d-flex align-items-center">
                  <img id="analyze-captcha" src="<?php echo $GLOBALS['vars']['child_theme_dir']; ?>resources/php/securimage/securimage_show.php" alt="CAPTCHA Image" />
                  <input type="text" name="analyze-captcha_code" id="analyze-captcha_code" class="form-control ml-4" placeholder="XXXX" size="4" maxlength="4" autocomplete="off" data-toggle="tooltip" data-placement="bottom" title="<?php _e ( 'Non-valid entered characters. Please try again.', 'cdc' ); ?>" />
                </div>
              </div>

              <div class="col-10-of-10 col-md-5-of-8 p-4">
                <label for="analyze-email"><?php _e ( 'Enter your email address', 'cdc' ); ?>:</label>

                <div class="input-group input-group-lg">
                  <input type="email" name="analyze-email" id="analyze-email" class="form-control" aria-label="" placeholder="" required>

                  <div class="input-group-append">
                    <a class="btn btn-secondary text-white all-caps download-process-btn disabled" id="analyze-process" target="_blank"><?php _e ( 'Send Request', 'cdc' ); ?> <i class="far fa-arrow-alt-circle-down"></i></a>
                  </div>
                </div>

              </div>

              <div class="col-8-of-8 p-4">
                <p class="form-label-wrap mt-3"><strong><?php _e ( 'Note:', 'cdc' ); ?></strong> <?php _e ( 'This is an experimental functionality. This data requires 30 to 90 minutes of processing time. All data will be delivered in a NetCDF file via an email notification once the processing is complete. Don’t forget to check your spam folder.', 'cdc' ); ?></p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>

  </section>

</main>

<div class="modal fade" id="success-modal" tabindex="-1" role="dialog" aria-labelledby="analyze-success-title" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLongTitle"><?php _e ( 'Success', 'cdc' ); ?></h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <p><?php _e ( 'Your request has been submitted. The processed data will be sent to your email address shortly.', 'cdc' ); ?></p>
      </div>
    </div>
  </div>
</div>

<?php

  endwhile; endif;

  get_footer();

?>
