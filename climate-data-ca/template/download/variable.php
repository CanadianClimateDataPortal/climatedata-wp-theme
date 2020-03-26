<form id="download-form" class="needs-validation" novalidate>
  <div class="form-layout-row row align-items-center">
    <p class="form-label-wrap col-10 col-sm-3 offset-1 mb-3 mb-sm-0">
      <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">1</span>
      <label for="download-dataset" class="form-label"><?php _e ( 'Select a dataset', 'cdc' ); ?></label>
    </p>

    <div class="form-select col-10 offset-1 col-sm-4 offset-sm-0 mb-3 mb-sm-0">
      <select class="custom-select custom-select-md select2 form-control input-large" name="download-dataset" id="download-dataset" data-container-css-class="big-menu btn btn-lg btn-outline-primary rounded-pill" data-dropdown-css-class="big-menu-dropdown">
        <option value="annual" selected><?php _e ( 'BCCAQv2 (annual)', 'cdc' ); ?></option>

        <option value="daily"><?php _e ( 'BCCAQv2 (daily)', 'cdc' ); ?></option>

        <optgroup label="<?php _e ( 'Monthly', 'cdc' ); ?>">
          <option value="jan"><?php _e ( 'January', 'cdc' ); ?></option>
          <option value="feb"><?php _e ( 'February', 'cdc' ); ?></option>
          <option value="mar"><?php _e ( 'March', 'cdc' ); ?></option>
          <option value="apr"><?php _e ( 'April', 'cdc' ); ?></option>
          <option value="may"><?php _e ( 'May', 'cdc' ); ?></option>
          <option value="jun"><?php _e ( 'June', 'cdc' ); ?></option>
          <option value="jul"><?php _e ( 'July', 'cdc' ); ?></option>
          <option value="aug"><?php _e ( 'August', 'cdc' ); ?></option>
          <option value="sep"><?php _e ( 'September', 'cdc' ); ?></option>
          <option value="oct"><?php _e ( 'October', 'cdc' ); ?></option>
          <option value="nov"><?php _e ( 'November', 'cdc' ); ?></option>
          <option value="dec"><?php _e ( 'December', 'cdc' ); ?></option>
        </optgroup>
      </select>
    </div>

    <p class="form-help col-10 col-sm-2 offset-1"><a href="<?php echo get_permalink ( filtered_ID_by_path ( 'about', $GLOBALS['vars']['current_lang'] ) ); ?>#about-datasets"><?php _e ( 'Learn more about datasets', 'cdc' ); ?></a></p>
  </div>

  <div class="form-layout-row row align-items-center">
    <p class="form-label-wrap col-10 col-sm-3 offset-1 mb-3 mb-sm-0">
      <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">2</span>
      <label for="download-variable" class="form-label"><?php _e ( 'Select a variable', 'cdc' ); ?></label>
    </p>

    <div class="form-select col-10 offset-1 col-sm-4 offset-sm-0 mb-3 mb-sm-0">

      <select class="custom-select custom-select-md select2 form-control input-large" name="download-variable" id="download-variable" data-container-css-class="big-menu btn btn-lg btn-outline-primary rounded-pill" data-dropdown-css-class="big-menu-dropdown">
        <?php

          $var_types = get_terms ( array (
            'taxonomy' => 'var-type',
            'hide_empty' => true,
            'exclude' => array ( 10, 14 ) // station data term ID in en and fr
          ) );

          if ( !empty ( $var_types ) ) {

            foreach ( $var_types as $var_type ) {

        ?>

        <optgroup label="<?php echo $var_type->name; ?>">

          <?php

              $vars_by_type = new WP_Query ( array (
                'post_type' => 'variable',
                'posts_per_page' => -1,
                'orderby' => 'menu_order',
                'order' => 'asc',
                'tax_query' => array (
                  array (
                    'taxonomy' => 'var-type',
                    'terms' => $var_type->term_id
                  )
                )
              ) );

              if ( $vars_by_type->have_posts() ) : while ( $vars_by_type->have_posts() ) :
                $vars_by_type->the_post();

                $var_name = get_field ( 'var_name' );

          ?>

          <option
            value="<?php echo $var_name; ?>"
            <?php echo ( isset ( $_GET['var'] ) && $_GET['var'] == $var_name ) ? 'selected' : ''; ?>
            <?php echo ( $var_name == 'tx_mean' || $var_name == 'tn_mean' || $var_name == 'prcptot' ) ? 'class="daily"' : ''; ?>
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

    <p class="form-help col-10 col-sm-2 offset-1"><a href="<?php echo get_permalink ( filtered_ID_by_path ( 'about', $GLOBALS['vars']['current_lang'] ) ); ?>#about-datasets"><?php _e ( 'Learn more about variables', 'cdc' ); ?></a></p>
  </div>

  <div class="form-layout-row row align-items-center">
    <p class="form-label-wrap col-10 col-sm-3 offset-1 mb-3 mb-sm-0">
      <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">3</span>
      <label for="download-location" class="form-label"><?php _e ( 'Select a location', 'cdc' ); ?></label>
    </p>

    <div class="form-select col-10 offset-1 col-sm-4 offset-sm-0 mb-3 mb-sm-0">
      <!-- <input type="hidden" name="download-lat" id="download-lat"> -->
      <!-- <input type="hidden" name="download-lon" id="download-lon"> -->
      <input type="hidden" name="download-coords" id="download-coords">

      <select class="custom-select custom-select-lg select2 form-control-lg rounded-pill border-dark text-center download-location" name="download-location" id="download-location" data-map="variable" data-dropdown-css-class="big-menu-dropdown" required>
        <option value=""><?php _e ( 'Search for a City/Town', 'cdc' ); ?></option>
      </select>

    </div>

    <p class="form-help col-10 col-sm-2 offset-1"><?php _e ( 'Zoom into the map to select a grid point.', 'cdc' ); ?></p>

    <div id="download-map-variable-container" class="col-10 offset-1 col-lg-8 offset-lg-2 download-map-container">
      <div id="download-map-variable" class="download-map"></div>
    </div>
  </div>

  <div id="download-filetype" class="form-layout-row row align-items-center">
    <p class="form-label-wrap col-10 col-sm-3 offset-1 mb-3 mb-sm-0">
      <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">4</span>
      <label for="format" class="form-label"><?php _e ( 'Select a data format', 'cdc' ); ?></label>
    </p>

    <div class="form-select col-10 offset-1 col-sm-4 offset-sm-0">
      <div id="format-btn-group" class="btn-group btn-group-toggle w-100" data-toggle="buttons">
        <label id="format-label-csv" class="btn btn-outline-primary active">
          <input type="radio" name="download-format" id="download-format-csv" autocomplete="off" value="csv" checked> CSV
        </label>

        <label id="format-label-json" class="btn btn-outline-primary">
          <input type="radio" name="download-format" id="download-format-json" autocomplete="off" value="json"> JSON
        </label>

        <label id="format-label-netcdf" class="btn btn-outline-primary">
          <input type="radio" name="download-format" id="download-format-netcdf" autocomplete="off" value="netcdf"> NetCDF
        </label>
      </div>
    </div>
  </div>

  <div id="annual-process-wrap" class="form-layout-row row align-items-center form-process">
    <div class="col-10 offset-1 col-sm-6 offset-sm-3 input-group input-group-lg">

      <input type="text" name="download-filename" id="download-filename" class="form-control" aria-label="" placeholder="<?php _e ( 'Save as', 'cdc' ); ?> …" required>

      <div class="input-group-append">
        <a class="btn btn-secondary text-white all-caps download-process-btn disabled" id="download-process" target="_blank"><?php _e ( 'Process', 'cdc' ); ?> <i class="far fa-arrow-alt-circle-down"></i></a>
      </div>

    </div>

    <div id="download-result" class="col-10 offset-1 col-sm-6 offset-sm-3 mt-3 p-4 bg-light" style="display: none;">
      <p class="form-label-wrap"><?php _e ( 'Processed successfully.', 'cdc' ); ?> <a href="" target="_blank"><?php _e ( 'Click here to download your data' ), 'cdc' ); ?></a>.</p>
    </div>
  </div>

  <div id="daily-process-wrap">
    <div class="form-layout-row form-process">
      <div class="col-10 offset-1 col-md-8 offset-md-2 row bg-light">
        <div id="daily-captcha-wrap" class="col-10-of-10 col-md-3-of-8 p-4">
          <label for="daily-captcha_code" class="d-block w-100"><?php _e ( 'Enter the characters shown here', 'cdc' ); ?>: </label>

          <div class="d-flex align-items-center">
            <img id="daily-captcha" src="<?php echo $GLOBALS['vars']['child_theme_dir']; ?>resources/php/securimage/securimage_show.php" alt="CAPTCHA Image" />
            <input type="text" name="daily-captcha_code" id="daily-captcha_code" class="form-control ml-4" placeholder="XXXX" size="4" maxlength="4" data-placement="bottom" title="<?php _e ( 'Non-valid entered characters. Please try again.', 'cdc' ); ?>" />
          </div>
        </div>

        <div class="col-10-of-10 col-md-5-of-8 p-4">
          <label for="daily-email"><?php _e ( 'Enter your email address', 'cdc' ); ?>:</label>

          <div class="input-group input-group-lg">
            <input type="email" name="daily-email" id="daily-email" class="form-control" aria-label="" placeholder="" required>

            <div class="input-group-append">
              <a class="btn btn-secondary text-white all-caps download-process-btn disabled" id="daily-process" target="_blank"><?php _e ( 'Send Request', 'cdc' ); ?> <i class="far fa-arrow-alt-circle-down"></i></a>
            </div>
          </div>

        </div>

        <div class="col-8-of-8 p-4">
          <p class="form-label-wrap mt-3"><strong><?php _e ( 'Note:', 'cdc' ); ?></strong> <?php _e ( 'This data requires processing. All data will be delivered via an email notification once the processing is complete.', 'cdc' ); ?></p>
        </div>

      </div>
    </div>
  </div>

</form>
