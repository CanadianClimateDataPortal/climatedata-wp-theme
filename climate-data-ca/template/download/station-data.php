<div class="row">
    <div class="col-10 offset-1 col-sm-8 offset-sm-2 col-md-6 offset-md-3">
        <p>
            <?php _e('Hourly data for some stations and variables can be found on the <a href="https://climate.weather.gc.ca/historical_data/search_historic_data_e.html" target="_blank">Government of Canada Historical Climate Data</a> website.','cdc'); ?>
            <br>
            <?php _e('More station data from British Columbia can be found on the <a href="https://www.pacificclimate.org/data/bc-station-data" target="_blank">Pacific Climate Impacts Consortium</a> website.','cdc'); ?>
        </p>
    </div>
</div>

<?php

/**
 * Station data selection removed while waiting for the fix for api.weather.gc.ca
 * 2025-06-11
 */

/*
<form action="./" method="get" name="station-download-form" id="station-download-form">
  <input type="hidden" name="limit" id="limit" value="150000">
  <input type="hidden" name="offset" id="offset" value="0">

  <div class="form-layout-row row">
    <p class="form-label-wrap col-2 offset-1">
      <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">1</span>
      <label for="s" class="form-label"><?php _e ( 'Stations', 'cdc' ); ?></label>
    </p>

    <div class="form-input form-select col-7">
      <select class="custom-select custom-select-md select2 form-control input-large validate" name="s[]" multiple="multiple" id="station-select" data-container-css-class="big-menu btn btn-lg border-primary" data-dropdown-css-class="big-menu-dropdown" data-placeholder="<?php _e ( 'Select station(s)','cdc' ); ?>">
        <?php

          include ( locate_template ( 'resources/app/db.php' ) );

          $query = "SELECT stn_id,station_name FROM stations";
          $result = mysqli_query($con, $query) or die(mysqli_error($con) . "[" . $query . "]");

          while ($row = mysqli_fetch_array($result)) {
            echo '<option value="' . $row['stn_id'] . '">' . $row['station_name'] . "</option>\n";
          }

        ?>
      </select>
    </div>

    <div id="download-map-station-container" class="col-10 offset-1 col-lg-7 offset-lg-3 download-map-container">
      <div id="download-map-station" class="download-map"></div>
    </div>
  </div>

  <div class="form-layout-row row">
    <p class="form-label-wrap col-2 offset-1">
      <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">2</span>
      <span class="form-label"><?php _e ( 'Date range', 'cdc' ); ?></span>
    </p>

    <div class="form-input form-select col-3">
      <label for="start_date" class="form-label"><?php _e ( 'Start', 'cdc' ); ?></label>


      <div class="input-group input-group-lg date" id="start_date" data-target-input="nearest">
        <input type="text" class="form-control datetimepicker-input" data-target="#start_date" id="station-start" name="start_date" value="1840-03-01">

        <div class="input-group-append" data-target="#start_date" data-toggle="datetimepicker">
          <div class="input-group-text"><i class="fa fa-calendar"></i></div>
        </div>
      </div>

    </div>

    <div class="form-input form-select col-3 offset-1">
      <label for="end_date" class="form-label"><?php _e ( 'End', 'cdc' ); ?></label>

      <div class="input-group input-group-lg date" id="end_date" data-target-input="nearest">
        <input type="text" class="form-control datetimepicker-input validate" data-target="#end_date" id="station-end" name="end_date" value="<?php echo date("Y-m-d"); ?>"/>

        <div class="input-group-append" data-target="#end_date" data-toggle="datetimepicker">
          <div class="input-group-text"><i class="fa fa-calendar"></i></div>
        </div>
      </div>
    </div>
  </div>

  <div class="form-layout-row row">
    <p class="form-label-wrap col-2 offset-1">
      <span class="form-step d-inline-block rounded-circle border border-primary text-primary text-center">3</span>
      <span class="form-label"><?php _e ( 'Settings', 'cdc' ); ?></span>
    </p>

    <div class="form-input form-radio col-7">
      <label for="format" class="form-label"><?php _e ( 'Format', 'cdc' ); ?></label>

      <hr class="hidden">

      <div class="btn-group btn-group-toggle btn-group-lg" data-toggle="buttons">
        <label class="btn btn-outline-primary active">
          <input type="radio" name="format" id="csvFormat" autocomplete="off" value="csv" checked> CSV
        </label>

        <label class="btn btn-outline-primary">
          <input type="radio" name="format" id="geoFormat" value="json"> GeoJSON
        </label>
      </div>
    </div>
  </div>

  <div id="station-process-wrap" class="form-layout-row row align-items-center form-process">
    <div class="col-10 offset-1 col-sm-6 offset-sm-3 input-group input-group-lg">

      <div id="station-download-status" class="form-control text-center"><?php _e ( 'Select at least one station to download data.', 'cdc' ); ?></div>

      <div class="input-group-append">
        <a class="btn btn-secondary text-white all-caps download-process-btn disabled" id="station-process" target="_blank"><?php _e ( 'Process', 'cdc' ); ?> <i class="far fa-arrow-alt-circle-down"></i></a>
        <!-- <button type="submit" class="btn btn-secondary all-caps download-process-btn" id="station-process" disabled>Process <i class="far fa-arrow-alt-circle-down"></i></button> -->

        <!-- For Google tag manager. Only work if this child is the last (ex: {{Click Element}}.parentElement.children[children.length - 1]) -->
        <a id="station-process-data" target="_blank"><?php _e ( '', 'cdc' ); ?></a>
      </div>
    </div>


      <div id="result"></div>

  </div>
    <div><p></p></div>
    <div class="form-layout-row row">
        <div class="col-7 offset-3">
            <p>
                <?php _e('Hourly data for some stations and variables can be found on the <a href="https://climate.weather.gc.ca/historical_data/search_historic_data_e.html" target="_blank">Government of Canada Historical Climate Data</a> website.','cdc'); ?>
                <br>
                <?php _e('More station data from British Columbia can be found on the <a href="https://www.pacificclimate.org/data/bc-station-data" target="_blank">Pacific Climate Impacts Consortium</a> website.','cdc'); ?>
            </p>
        </div>
    </div>
</form>

*/
?>
