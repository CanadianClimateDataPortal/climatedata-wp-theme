<form action="./" method="get" name="idf-download-form" id="idf-download-form">

      
  <div class="form-layout-row row">
    <p class="form-label-wrap col-2 offset-1">
      <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">1</span>
      <label for="s" class="form-label"><?php _e ( 'Stations', 'cdc' ); ?></label>
    </p>
    
    <div class="form-input form-select col-7">
      <select class="custom-select custom-select-md select2 form-control input-large validate" name="s[]" id="idf-select" data-container-css-class="big-menu btn btn-lg border-primary" data-dropdown-css-class="big-menu-dropdown" data-placeholder="<?php _e ( 'Select station(s)', 'cdc' ); ?>">
        <option></option>
      </select>
    </div>
    
    <div id="download-map-idf-container" class="col-10 offset-1 col-lg-7 offset-lg-3 download-map-container">
      <div id="download-map-idf" class="download-map"></div>
    </div>
  </div>
  
  <div id="download-idf-station" class="form-layout-row row" style="display: none;">
    <div class="form-input form-select col-7 offset-3 p-5 bg-light">
      <div class="d-flex mb-5 pb-3 border-bottom">
        <div id="idf-station-name" class="w-50">
          <h6><?php _e ( 'Station', 'cdc' ); ?></h6>
          <h5></h5>
        </div>
        
        <div id="idf-station-elevation" class="w-50">
          <h6><?php _e ( 'Elevation', 'cdc' ); ?></h6>
          <h5></h5>
        </div>
      </div>
      
      <h6><?php _e ( 'Downloads', 'cdc' ); ?></h6>
      
      <div id="idf-links">
        <ul></ul>
      </div>
    </div>
  </div>
  
  

</form>