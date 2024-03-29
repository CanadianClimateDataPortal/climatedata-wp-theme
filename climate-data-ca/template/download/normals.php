<form action="./" method="get" name="normals-download-form" id="normals-download-form">
  <input type="hidden" name="limit" id="normals-limit" value="150000">
  <input type="hidden" name="offset" id="offset" value="0">

  <div class="form-layout-row row">
    <p class="form-label-wrap col-2 offset-1">
      <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">1</span>
      <label for="s" class="form-label"><?php _e ( 'Stations', 'cdc' ); ?></label>
    </p>

    <div class="form-input form-select col-7">
      <select class="custom-select custom-select-md select2 form-control input-large validate" name="s[]" multiple="multiple" id="normals-select" data-container-css-class="big-menu btn btn-lg border-primary" data-dropdown-css-class="big-menu-dropdown" data-placeholder="<?php _e ( 'Select station(s)','cdc' ); ?>">
        
      </select>
    </div>

    <div id="download-map-normals-container" class="col-10 offset-1 col-lg-7 offset-lg-3 download-map-container">
      <div id="download-map-normals" class="download-map"></div>
    </div>
  </div>

  <div class="form-layout-row row">
    <p class="form-label-wrap col-2 offset-1">
      <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">2</span>
      <span class="form-label"><?php _e ( 'Settings', 'cdc' ); ?></span>
    </p>

    <div class="form-input form-radio col-7">
      <label for="format" class="form-label"><?php _e ( 'Format', 'cdc' ); ?></label>

      <hr class="hidden">

      <div class="btn-group btn-group-toggle btn-group-lg" data-toggle="buttons">
        <label class="btn btn-outline-primary active">
          <input type="radio" name="format" id="normals-csvFormat" autocomplete="off" value="csv" checked> CSV
        </label>

        <label class="btn btn-outline-primary">
          <input type="radio" name="format" id="normals-geoFormat" value="json"> GeoJSON
        </label>
      </div>
    </div>
  </div>

  <div id="normals-process-wrap" class="form-layout-row row align-items-center form-process">
    <div class="col-10 offset-1 col-sm-6 offset-sm-3 input-group input-group-lg">

      <div id="normals-download-status" class="form-control text-center"><?php _e ( 'Select at least one station to download data.', 'cdc' ); ?></div>

      <div class="input-group-append">
        <a class="btn btn-secondary text-white all-caps download-process-btn disabled" id="normals-process" target="_blank"><?php _e ( 'Process', 'cdc' ); ?> <i class="far fa-arrow-alt-circle-down"></i></a>
        <!-- <button type="submit" class="btn btn-secondary all-caps download-process-btn" id="station-process" disabled>Process <i class="far fa-arrow-alt-circle-down"></i></button> -->

        <!-- For Google tag manager. Only work if this child is the last (ex: {{Click Element}}.parentElement.children[children.length - 1]) -->
        <a id="normals-process-data" target="_blank"><?php _e ( '', 'cdc' ); ?></a>
      </div>
    </div>


      <div id="result"></div>

  </div>
    <div><p></p></div>
    <div class="form-layout-row row">
        <div class="col-7 offset-3">
            <p>
                <?php 
                
                  printf ( 
                    __ ( 'Additional Climate Normals variables are available from the %sCanadian Centre for Climate Services%s and the %sGovernment of Canada Historical Climate Data%s websites.', 'cdc' ), 
                    '<a href="https://climate-change.canada.ca/climate-data/#/climate-normals" target="_blank">',
                    '</a>',
                    '<a href="https://climate.weather.gc.ca/climate_normals/index_e.html" target="_blank">',
                    '</a>',
                  );
                
                ?>
            </p>
        </div>
    </div>
</form>
