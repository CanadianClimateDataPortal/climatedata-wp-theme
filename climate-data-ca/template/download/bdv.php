<form action="./" method="get" name="bdv-download-form" id="bdv-download-form">

      
  <div class="form-layout-row row">
    <p class="form-label-wrap col-2 offset-1">
      <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">1</span>
      <label for="s" class="form-label"><?php _e ( 'Location', 'cdc' ); ?></label>
    </p>
    
    <div class="form-input form-select col-7">
      <select class="custom-select custom-select-md select2 form-control input-large validate" name="s[]" id="bdv-select" data-container-css-class="big-menu btn btn-lg border-primary" data-dropdown-css-class="big-menu-dropdown" data-placeholder="<?php _e ( 'Select location', 'cdc' ); ?>">
        <option></option>
      </select>
    </div>
    
    <div id="download-map-bdv-container" class="col-10 offset-1 col-lg-7 offset-lg-3 download-map-container">
      <div id="download-map-bdv" class="download-map"></div>
    </div>
  </div>
  
  <div id="download-bdv-station" class="form-layout-row row" style="display: none;">
    <div class="form-input form-select col-7 offset-3 p-5 bg-light">
      <div class="d-flex mb-5 pb-3 border-bottom">
        <div id="bdv-station-name" class="w-50">
          <h6><?php _e ( 'Location', 'cdc' ); ?></h6>
          <h5></h5>
        </div>

      </div>
      
        <h6><a id="bdv-link" href="" target="_blank"><?php _e ( 'View/Download', 'cdc' ); ?></a></h6>

    </div>
  </div>
  
  

</form>