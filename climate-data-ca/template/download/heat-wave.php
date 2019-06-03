<form action="./" method="get" name="heat-wave-form" id="heat-wave-form">
  
  <div class="form-layout-row row">
    <div class="col-10 offset-1 col-sm-6 offset-sm-3">
      <h5 class="text-primary"><?php _e ( 'Create your own heat wave events thresholds', 'cdc' ); ?></h5>
      <p class="form-label-wrap"><span class="form-label"><?php _e ( 'A ‘heat wave event’ occurs when the minimum and maximum daily temperatures exceed specific thresholds. These thresholds may be different for various parts of the country. Adjust the thresholds in the form below to create your own ‘heat wave events’ indicator:', 'cdc' ); ?></span></p>
    </div>
  </div>
  
  <div class="form-layout-row row align-items-center">
    <p class="form-label-wrap col-3 offset-1">
      <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">1</span>
      <label for="heat-wave-location" class="form-label"><?php _e ( 'Select a location', 'cdc' ); ?></label>
    </p>
    
    <div class="form-select col-4">
      <input type="hidden" name="heatwave-lat" id="heatwave-lat">
      <input type="hidden" name="heatwave-lon" id="heatwave-lon">
      
      <select class="custom-select custom-select-lg select2 form-control-lg rounded-pill border-dark text-center download-location" name="heat-wave-location" id="heat-wave-location" data-map="heatwave" data-dropdown-css-class="big-menu-dropdown" required>
        <option value=""><?php _e ( 'Search for a City/Town', 'cdc' ); ?></option>
      </select>
      
    </div>
    
    <p class="form-help col-2 offset-1"><?php _e ( 'Zoom into the map to select a grid point.', 'cdc' ); ?></p>
    
    <div id="download-map-heatwave-container" class="col-10 offset-1 col-lg-8 offset-lg-2 download-map-container">
      <div id="download-map-heatwave" class="download-map"></div>
    </div>
  </div>
  
  <div class="form-layout-row row">
    <div class="col-10 offset-1 col-sm-6 offset-sm-3 form-inline">
      <p class="form-label-wrap">
        <span class="form-label"><?php _e ( 'This ‘heat wave event’ includes', 'cdc' ); ?></span>
        
        <input type="text" class="form-control heat-wave-control" id="heat-wave-days" name="heat-wave-days" value="0">
        
        <span class="form-label"><?php _e ( 'consecutive days with a minimum temperature exceeding', 'cdc' ); ?></span>
        
        <input type="text" class="form-control heat-wave-control" id="heat-wave-min" name="heat-wave-min" value="0">
        
        <span class="form-label">º C <?php _e ( 'and a maximum temperature exceeding', 'cdc' ); ?></span>
        
        <input type="text" class="form-control heat-wave-control" id="heat-wave-max" name="heat-wave-max" value="0">
        
        <span class="form-label">º C</span>
      </p>
    </div>
  </div>
  
  <div id="heat-wave-process-wrap">
    <div class="form-layout-row form-process">
      <div class="col-10 offset-1 col-md-8 offset-md-2 row bg-light">
        <div id="heatwave-captcha-wrap" class="col-10-of-10 col-md-3-of-8 p-4">
          <label for="heatwave-captcha_code" class="d-block w-100"><?php _e ( 'Enter the characters shown here', 'cdc' ); ?>: </label>
          
          <div class="d-flex align-items-center">
            <img id="heatwave-captcha" src="<?php echo $GLOBALS['vars']['child_theme_dir']; ?>resources/php/securimage/securimage_show.php" alt="CAPTCHA Image" />
            <input type="text" name="heatwave-captcha_code" id="heatwave-captcha_code" class="form-control ml-4" placeholder="XXXX" size="4" maxlength="4" data-toggle="tooltip" data-placement="bottom" title="<?php _e ( 'Non-valid entered characters. Please try again.', 'cdc' ); ?>" />
          </div>
        </div>
        
        <div class="col-10-of-10 col-md-5-of-8 p-4">
          <label for="heat-wave-email"><?php _e ( 'Enter your email address', 'cdc' ); ?>:</label>
          
          <div class="input-group input-group-lg">
            <input type="email" name="heat-wave-email" id="heat-wave-email" class="form-control" aria-label="" placeholder="" required>
        
            <div class="input-group-append">
              <a class="btn btn-secondary text-white all-caps download-process-btn disabled" id="heat-wave-process" target="_blank"><?php _e ( 'Send Request', 'cdc' ); ?> <i class="far fa-arrow-alt-circle-down"></i></a>
            </div>
          </div>
          
        </div>
        
        <div class="col-8-of-8 p-4">
          <p class="form-label-wrap mt-3"><strong><?php _e ( 'Note:', 'cdc' ); ?></strong> <?php _e ( 'This is an experimental functionality. This data requires 30 to 90 minutes of processing time. All data will be delivered in a NetCDF file via an email notification once the processing is complete. Don’t forget to check your spam folder.', 'cdc' ); ?></p>
        </div>
        
      </div>
    </div>
  </div>
  
</form>