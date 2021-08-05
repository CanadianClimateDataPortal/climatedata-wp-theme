<form action="./" method="get" name="ahccd-download-form" id="ahccd-download-form">

  <div class="form-layout-row row">
    <p class="form-label-wrap col-2 offset-1">
      <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">1</span>
      <label for="s" class="form-label"><?php _e ( 'Stations', 'cdc' ); ?></label>
    </p>
    
    <div class="form-input form-select col-7">
      <select class="custom-select custom-select-md select2 form-control input-large validate" name="s[]" multiple="multiple" id="ahccd-select" data-container-css-class="big-menu btn btn-lg border-primary" data-dropdown-css-class="big-menu-dropdown" data-placeholder="<?php _e ( 'Select station(s)', 'cdc' ); ?>">
        <option></option>
      </select>
    </div>
    
   
    <div id="download-map-ahccd-container" class="col-10 offset-1 col-lg-8 offset-lg-3 download-map-container">
      <div id="download-map-ahccd" class="col-lg-9 float-left download-map"></div>
        <div class="col-3 col-lg-3 float-right" style="padding:10px">
            <h5><?php _e ( 'Legend', 'cdc' ); ?></h5>
            <div class="row"><input type="checkbox" checked name="ahccd_filter_temp" value="T"><span><img src="/site/assets/themes/climate-data-ca/resources/app/ahccd/square-blue.png" style="padding:0 10px 0 10px;"></span><span style="font-size: 1.5em"><?php _e ( 'Temperature', 'cdc' ); ?></span></div> <br>
            <div class="row"><input type="checkbox" checked name="ahccd_filter_pr" value="P"><span><img src="/site/assets/themes/climate-data-ca/resources/app/ahccd/triangle-blue.png" style="padding:0 10px 0 10px;"></span><span style="font-size: 1.5em"><?php _e ( 'Precipitation', 'cdc' ); ?></span></div><br>
            <div class="row"><input type="checkbox" checked name="ahccd_filter_both" value="B"><span><img src="/site/assets/themes/climate-data-ca/resources/app/ahccd/circle-blue.png" style="padding:0 10px 0 10px;"></span><span style="font-size: 1.5em"><?php _e ( 'Both', 'cdc' ); ?></span></div>
        </div>
    </div>

  </div>



    
    <div id="ahccd-download-filetype" class="form-layout-row row align-items-center">
    <p class="form-label-wrap col-10 col-sm-3 offset-1 mb-3 mb-sm-0">
        <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">2</span> <label for="format" class="form-label"><?php _e('Select a data format', 'cdc'); ?></label>
    </p>

    <div class="form-select col-10 offset-1 col-sm-4 offset-sm-0">
        <div id="format-btn-group" class="btn-group btn-group-toggle w-100" data-toggle="buttons">
            <label id="ahccd-format-label-csv" class="btn btn-outline-primary active"> <input type="radio" name="ahccd-download-format" id="ahccd-download-format-csv" autocomplete="off" value="csv" checked> CSV </label>

            <label id="ahccd-format-label-netcdf" class="btn btn-outline-primary"> <input type="radio" name="ahccd-download-format" id="ahccd-download-format-netcdf" autocomplete="off" value="netcdf"> NetCDF </label>
        </div>
    </div>
</div>      
  
  <div id="ahccd-process-wrap" class="form-layout-row row align-items-center form-process">
    <div class="col-10 offset-1 col-sm-6 offset-sm-3 input-group input-group-lg">

      <div id="ahccd-download-status" class="form-control text-center"><?php _e ( 'Select at least one station to download data.', 'cdc' ); ?></div>

      <div class="input-group-append">
        <a class="btn btn-secondary text-white all-caps download-process-btn disabled" id="ahccd-process" target="_blank"><?php _e ( 'Process', 'cdc' ); ?> <i class="far fa-arrow-alt-circle-down"></i></a>
      </div>


    </div>

      <div id="result"></div>

  </div>  
 
  

</form>