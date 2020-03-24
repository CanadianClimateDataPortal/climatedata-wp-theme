(function($) {

  $(function() {

    //
    // GLOBAL VARS
    //

    var hosturl = geoserver_url;

    var maps = {};

    var var_map, station_map, heatwave_map;

    var chart;

    var gridline_color = '#9a9fb7';
    var gridline_color_active = '#e50e40';
    var gridline_width = '0.2';
    var gridline_width_active = '1';

    var ajax_url = base_href.replace('fr/', '');

    //
    // VENDOR
    //

    // SELECT2

    // create array of default variable select options

    var var_default = $('#download-variable').clone();

    var all_vars = [];
    var daily_vars = [];

    $('#download-variable optgroup').each(function() {

	      var new_group = {
		label: $(this).attr('label'),
		options: []
	      };

	      $(this).find('option').each(function() {

		var new_object = {
		  value: $(this).attr('value'),
		  text: $(this).text()
		};

		if ($(this).hasClass('daily')) {

		  daily_vars.push(new_object);

		}

		new_group['options'].push(new_object);

	      });

	      all_vars.push(new_group);

	    });

	    // location formatter

	    function formatLocationSearch (item) {

		if (!item.id) {
            return item.text;
        }
        if (item.location === null) {
          show_comma = '';
          item.location = '';
        } else {
          show_comma = ', ';
        }
        var $item = $(
            '<span><div class="geo-select-title">' + item.text + ' (' + item.term + ')</div>' + item.location + show_comma + item.province + '</sup></span>'
        );
        return $item;
    }

    $('.download-location').select2({
      language: current_lang,
      containerCssClass : 'big-menu btn btn-lg btn-outline-primary rounded-pill',
      ajax: {
        url: child_theme_dir + "resources/app/run-frontend-sync/select-place.php",
        dataType: 'json',
        delay: 0,
        data: function (params) {
          return {
            q: params.term,
            page: params.page
          };
        },
        processResults: function (data, page) {
          return {
            results: data.items
          };
        },
        cache: true
      },
      escapeMarkup: function (markup) { return markup; },
      minimumInputLength: 1,
      width: '100%',
      templateResult: formatLocationSearch
    });

    $('.download-location').on('select2:select', function(e) {

      location_map = $(this).attr('data-map');

      thislat = e.params.data.lat;
      thislon = e.params.data.lon;

      //$('#download-lat').val(thislat);
      //$('#download-lon').val(thislon);

      maps[location_map].setView([thislat, thislon], 11);

    });

    //
    // TABS
    //

    $('#download-content').tabs({
      hide: { effect: 'fadeOut', duration: 250 },
      show: { effect: 'fadeIn', duration: 250 },
      create: function(e, ui) {

        $('body').removeClass('spinner-on');

        if (ui.panel.attr('id') == 'var-download') {

          if (typeof maps['variable'] == 'undefined') {
            var_init();
          }

        } else if (ui.panel.attr('id') == 'station-download') {

          if (typeof maps['station'] == 'undefined') {
            station_init();
          }

        } else if (ui.panel.attr('id') == 'heat-wave-analysis') {

          if (typeof maps['heatwave'] == 'undefined') {
            heatwave_init();
          }

        }

      },
      activate: function(e, ui) {

        if (ui.newPanel.attr('id') == 'var-download') {

          if (typeof maps['variable'] == 'undefined') {
            var_init();
          }

          $('#daily-captcha').attr('src', child_theme_dir + 'resources/php/securimage/securimage_show.php');

        } else if (ui.newPanel.attr('id') == 'station-download') {

          if (typeof maps['station'] == 'undefined') {
            station_init();
          }

        } else if (ui.newPanel.attr('id') == 'heat-wave-analysis') {

          if (typeof maps['heatwave'] == 'undefined') {
            heatwave_init();
          }

          $('#heatwave-captcha').attr('src', child_theme_dir + 'resources/php/securimage/securimage_show.php');

        }

      }
    });

    //
    // VARIABLE
    //

    subtractValue = 0
    varDetails = {}

    selectedGrids = []
    selectedPoints = []
    latlons = []

    function var_init() {

      create_map('variable');

      var highlightGridFeature;

      var clearHighlight = function () {
          if (highlightGridFeature) {
              pbfLayer.resetFeatureStyle(highlightGridFeature);
          }
          highlightGridFeature = null;
      };

      var vectorTileOptions = {

          rendererFactory: L.canvas.tile,

          attribution: '',
          interactive: true,
          getFeatureId: function (f) {
              return f.properties.gid;
          },

          maxNativeZoom: 12,
          vectorTileLayerStyles: {
              'canadagrid': function (properties, zoom) {
                  return {
                      weight: 0.1,
                      color: gridline_color,
                      opacity: 1,
                      fill: true,
                      radius: 4,
                      fillOpacity: 0
                  }
              }
          },
          maxZoom: 12,
          minZoom: 7,
          pane: 'grid',
      };

      var pbfURL = hosturl + "/geoserver/gwc/service/tms/1.0.0/CDC:canadagrid@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf";

      var pbfLayer = L.vectorGrid.protobuf(pbfURL, vectorTileOptions).on('click', function (e) {

        highlightGridFeature = e.layer.properties.gid;

        selectedPoints[highlightGridFeature] = e.latlng;

        var selectedExists = selectedGrids.includes(highlightGridFeature);

//         console.log(selectedGrids, highlightGridFeature, selectedExists)

        if (selectedExists === false) {

            selectedGrids.push(highlightGridFeature);

            pbfLayer.setFeatureStyle(highlightGridFeature, {
                weight: 1,
                color: '#F00',
                opacity: 1,
                fill: true,
                radius: 4,
                fillOpacity: 0.1
            });

        } else {

            for (var i = selectedGrids.length - 1; i >= 0; i--) {
                if (selectedGrids[i] === highlightGridFeature) {
                    selectedGrids.splice(i, 1);
                }
            }

            for (var i = selectedPoints.length - 1; i >= 0; i--) {

                if (selectedPoints[highlightGridFeature]) {
                    selectedPoints.splice(i, 1);
                }
            }

            pbfLayer.setFeatureStyle(highlightGridFeature, {
                weight: 0.1,
                color: gridline_color,
                opacity: 1,
                fill: true,
                radius: 4,
                fillOpacity: 0
            });

        }

        //console.log(selectedGrids)

        var points_to_process = selectedGrids.length

        var_value = $("#download-variable").val(); //'tx_max'; //$("#var").val();
        mora_value = $("#download-dataset").val();

        if (mora_value == 'annual') {
          mora_value = 'ann'
        }

        if (selectedGrids.length > 0) {
          $('#download-location').parent().find('.select2-selection__rendered').text(selectedGrids.length + ' selected')
        } else {
          $('#download-location').parent().find('.select2-selection__rendered').text('Search for a City/Town')
        }

        var current_coords = $('#download-coords').val()

        current_coords += '|' + e.latlng.lat + ',' + e.latlng.lng + ',' + highlightGridFeature

        $('#download-coords').val(current_coords)

        L.DomEvent.stop(e);

        checkform()

      }).addTo(maps['variable'])

      $('#var-download .select2').on('select2:select', function(e) {
        checkform()
      })

    }

    //
    // FORM VALIDATION
    //

    function checkform() {

      //console.log('checking form');

      $('#download-result').slideUp(125)

      var form_valid = false;

      if ($('#download-dataset').val() == 'daily') {

        // DAILY DATA

        if (
          $('body').validate_email($('#daily-email').val()) == true &&
          $('#daily-captcha_code').val() != '' &&
          $('#download-coords').val() != ''
        ) {

          $('#daily-process').removeClass('disabled');

        } else {

          $('#daily-process').addClass('disabled');

        }

      } else {

        console.log('monthly')

        // MONTHLY OR ANNUAL

        // if a filename is entered and the hidden lat/lon inputs have values

        if (
          $('#download-filename').hasClass('valid') &&
          $('#download-coords').val() != ''
        ) {
          form_valid = true;
        }

        if (form_valid == true) {

//           console.log('form is valid')
          $('#download-process').removeClass('disabled');

        } else {
          $('#download-process').addClass('disabled');
          //$('#download-process').prop('disabled', true);
        }

      }

    }

    function process_download() {

      var output_JSON = []

      var output_CSV = "DATE, LATITUDE, LONGITUDE, RCP 2.6 MIN, RCP 2.6 MEAN, RCP 2.6 MAX, RCP 4.5 MIN, RCP 4.5 MEAN, RCP 4.5 MAX, RCP 8.5 MIN, RCP 8.5 MEAN, RCP 8.5 MAX\n"

      var split_coords = $('#download-coords').val().split('|')

      // remove first element which is empty because the first character is always '|'
      split_coords.shift()

      var coords_to_process = selectedGrids.length

      $('body').addClass('spinner-on');

      if ($('input[name="download-format"]:checked').val() == 'csv') {

        // get the variable details

        $.ajax({
          url: ajax_url + 'variable/' + $('#download-variable').val() + '/',
          data: {
            content: 'location'
          },
          success: function(data) {
            console.log('success')
            varDetails = JSON.parse($(data).find('#callback-data').html())
          },
          complete: function() {

              month = $("#download-dataset").val();

              if (month == 'annual') {
                month = 'ann'
              }

              selectedPoints.forEach(function(entry) {

                  $.getJSON(
                      'https://data.climatedata.ca/get_values.php?lat=' + entry.lat + '&lon=' + entry.lng + '&var=' + $('#download-variable').val() + '&month=' + month,
                      function (data) {

                          midHistSeries = [];
                          rangeHistSeries = [];

                          mid26Series = [];
                          range26Series = [];

                          mid45Series = [];
                          range45Series = [];

                          mid85Series = [];
                          range85Series = [];

                          dLen = data.length;

                          if (month === 'ann' || month === 'jan') {
                              monthNum = "01";
                          } else if (month === 'feb') {
                              monthNum = "02";
                          } else if (month === 'mar') {
                              monthNum = "03";
                          } else if (month === 'apr') {
                              monthNum = "04";
                          } else if (month === 'may') {
                              monthNum = "05";
                          } else if (month === 'jun') {
                              monthNum = "06";
                          } else if (month === 'jul') {
                              monthNum = "07";
                          } else if (month === 'aug') {
                              monthNum = "08";
                          } else if (month === 'sep') {
                              monthNum = "09";
                          } else if (month === 'oct') {
                              monthNum = "10";
                          } else if (month === 'nov') {
                              monthNum = "11";
                          } else if (month === 'dec') {
                              monthNum = "12";
                          } else {
                              monthNum = 0
                          }

                          if (varDetails.units.value === 'kelvin') {
                              subtractValue = k_to_c;
                              chartUnit = "°C";
                          } else {
                              subtractValue = 0;
                              chartUnit = varDetails.units.label;
                          }

                        console.log('making CSV')

                        for (var i = 0; i < data.length; i++) {

                            decimals = 2;

                            if (data[i][0]) { data0 = (data[i][0] - subtractValue).toFixed(decimals); } else { data0 = null }
                            if (data[i][1]) { data1 = (data[i][1] - subtractValue).toFixed(decimals); } else { data1 = null }
                            if (data[i][2]) { data2 = (data[i][2] - subtractValue).toFixed(decimals); } else { data2 = null }
                            if (data[i][3]) { data3 = (data[i][3] - subtractValue).toFixed(decimals); } else { data3 = null }
                            if (data[i][4]) { data4 = (data[i][4] - subtractValue).toFixed(decimals); } else { data4 = null }
                            if (data[i][5]) { data5 = (data[i][5] - subtractValue).toFixed(decimals); } else { data5 = null }
                            if (data[i][6]) { data6 = (data[i][6] - subtractValue).toFixed(decimals); } else { data6 = null }
                            if (data[i][7]) { data7 = (data[i][7] - subtractValue).toFixed(decimals); } else { data7 = null }
                            if (data[i][8]) { data8 = (data[i][8] - subtractValue).toFixed(decimals); } else { data8 = null }
                            if (data[i][9]) { data9 = (data[i][9] - subtractValue).toFixed(decimals); } else { data9 = null }
                            if (data[i][10]) { data10 = (data[i][10] - subtractValue).toFixed(decimals); } else { data10 = null }
                            if (data[i][11]) { data11 = (data[i][11] - subtractValue).toFixed(decimals); } else { data11 = null }

                            year = 1950 + i;
                            if (i < 56) {

                                output_CSV += year + "-" + monthNum + "-01," + entry.lat + ',' + entry.lng + ',' + data0 + ',' + data1 + ',' + data2 + ',' + data3 + ',' + data4 + ',' + data5 + ',' + data6 + ',' + data7 + ',' + data8 + ',' + "\n"

                            }
                            // had to add limiter since annual values spit out a null set at the end.
                            if (i > 54 && i < 150) {

                                output_CSV += year + "-" + monthNum + "-01," + entry.lat + ',' + entry.lng + ',' + data0 + ',' + data1 + ',' + data2 + ',' + data3 + ',' + data4 + ',' + data5 + ',' + data6 + ',' + data7 + ',' + data8 + ',' + "\n"

                            }
                        }

                        if (coords_to_process == 1) {

                          //console.log(output_CSV)

                          $('#download-result a').attr('href', 'data:text/csv;charset=utf-8,' + escape(output_CSV));
                          $('#download-result a').attr('download', $('#download-filename').val() + '.csv');
                          $('#download-result').slideDown(250)

                          $('body').removeClass('spinner-on');

                        } else {
                          coords_to_process -= 1
                        }

                        chart = null
                        $('#dummy-chart').empty()

                      }
                  );

              }); // selectedPoints.forEach

          }

        }) // varDetails ajax

      } else if ($('input[name="download-format"]:checked').val() == 'json') {

        $('body').addClass('spinner-on');

        var json_data = []

        split_coords.forEach(function(entry) {

          var this_coord = entry.split(',') // [0] lat [1] lon [2] id

          console.log('get data', data_url + '/download_csv.php?lat=' + this_coord[0] + '&lon=' + this_coord[0] + '&var=' + $('#download-variable').val());

          $.ajax({
            url: data_url + '/download_csv.php?lat=' + this_coord[0] + '&lon=' + this_coord[1] + '&var=' + $('#download-variable').val(),
            success: function (data) {
              console.log('success');

              json_data = JSON.parse(data);

              data_obj = json_data[1]['data'];

              i = 0;
              z = 0;

              for (var year in data_obj) {
                for (var val in data_obj[year]) {

                  if (data_obj[year][val] !== null) {
                    data_obj[year][val] = parseFloat((data_obj[year][val] - subtractValue).toFixed(2));
                  }

                  z += 1;

                }

                i += 1;

              }

              // add the returned data
              json_data[1]['data'] = data_obj

              // add the coord ID
              json_data[0]['id'] = this_coord[2]

              // push to the output array
              output_JSON.push(json_data)

              // if this is the last entry,
              // update the output JSON and hide the spinner

              if (coords_to_process == 1) {

                $('#download-result a').attr('href', "data:application/json," + encodeURIComponent(JSON.stringify(output_JSON))).removeClass('disabled');

                $('#download-result a').attr('download', $('#download-filename').val() + '.json');
                $('#download-result').slideDown(250)

                $('body').removeClass('spinner-on');

              } else {
                coords_to_process -= 1
              }

            }
          });


        })

      }

    }

    // daily/annual

    $('#download-dataset').on('select2:select', function (e) {

      $('#download-variable').empty();

      if (e.currentTarget.value == 'daily') {

        // swap fields for daily downloads

        // options

        for (var var_index in daily_vars) {
          $('<option value="' + daily_vars[var_index]['value'] + '">' + daily_vars[var_index]['text'] + '</option>').appendTo('#download-variable');
        }

        // refresh captcha

        $('#daily-captcha').attr('src', child_theme_dir + 'resources/php/securimage/securimage_show.php');

        // netCDF option

        $('#format-label-netcdf').show();
        $('#format-label-json').hide();

        // email field

        $('#annual-process-wrap').hide();
        $('#daily-process-wrap').show();

      } else {

        // swap fields for annual downloads

        // options

        for (var group_index in all_vars) {

          var optgroup = $('<optgroup label="' + all_vars[group_index]['label'] + '">').appendTo('#download-variable');

          for (var var_index in all_vars[group_index]['options']) {
            $('<option value="' + all_vars[group_index]['options'][var_index]['value'] + '">' + all_vars[group_index]['options'][var_index]['text'] + '</option>').appendTo(optgroup);
          }

        }

        // json option

        $('#format-label-netcdf').hide();
        $('#format-label-json').show();

        // email field

        $('#annual-process-wrap').show();
        $('#daily-process-wrap').hide();

      }
      1
      $('#format-btn-group label').removeClass('active');
      $('#format-btn-group input').prop('checked', false);

      $('#format-label-csv').addClass('active');
      $('#format-label-csv input').prop('checked', true);

      $('#download-variable').select2();

    });

    $('#daily-captcha_code').on('input', function(e) {
      checkform();
    });

    $('#daily-email').on('input', function(e) {
      checkform();
    });

    // location

    $('#download-location').on('select2:select', function (e) {

      if ($(this).val() != '') {
        $(this).addClass('valid');
      } else {
        $(this).removeClass('valid');
      }

      checkform();

    });

    // format

    $('#download-filetype input').on('change', function() {

      checkform();

    });

    // filename

    $('#download-filename').on('input', function() {

      if ($(this).val() != '') {
        $(this).addClass('valid');
      } else {
        $(this).removeClass('valid');
      }

      if ($('input[name="download-format"]:checked').val() != 'json') {
        checkform();
      }

    });

    $('#download-filename').on('change', function() {

      if ($('input[name="download-format"]:checked').val() == 'json') {
        checkform();
      }

    });

    $('#download-form').submit(function(e) {
      e.preventDefault();
    });

    //
    // SUBMISSION FOR 'ANNUAL' OR 'MONTHLY' DATASETS
    //

    $('#download-process').click(function(e) {
      e.preventDefault()
      process_download()
    });

    $('#download-result a').click(function(e) {
      console.log('download')
    })

    checkform()

    //
    // SUBMISSION FOR 'DAILY' DATASET
    //

    $('#daily-process').click(function(e) {

      e.preventDefault();

      var var_name = '';

      switch ($('#download-variable').val()) {

        case 'tn_mean' :
          var_name = 'tasmin';
          break;

        case 'tx_mean' :
          var_name = 'tasmax';
          break;

        case 'prcptot' :
          var_name = 'pr';
          break;

      }

      var form_data = $('#download-form').serialize();

      $.ajax({
        url: child_theme_dir + 'resources/ajax/download-form.php',
        data: form_data,
        success: function(data) {
          //console.log(data);

          if (data == 'success') {

            $('#daily-captcha_code').removeClass('border-secondary').tooltip('dispose')

            var split_coords = $('#download-coords').val().split('|'),
                lat_vals = '',
                lon_vals = ''

            // remove first element which is empty because the first character is always '|'
            split_coords.shift()

            for (i = 0; i < split_coords.length; i += 1) {

              var this_coord = split_coords[i].split(',')

              if (lat_vals != '') {
                lat_vals += ','
              }

              lat_vals += this_coord[0]

              if (lon_vals != '') {
                lon_vals += ','
              }

              lon_vals += this_coord[1]

            }

            //console.log('lat', lat_vals)
            //console.log('lon', lon_vals)

            var request = $.ajax({
              url: 'https://pavics.climatedata.ca/providers/finch/processes/subset_ensemble_BCCAQv2/jobs',
              method: 'POST',
              crossDomain: true,
              headers: {
                  'Content-Type': 'application/json'
              },
              data: JSON.stringify({
                "inputs": [
                  {
                    "id": "variable",
                    "data": var_name,
                  },
                  {
                    "id": "lat0",
                    "data": lat_vals
                  },
                  {
                    "id": "lon0",
                    "data": lon_vals
                  },
                  {
                    "id": "output_format",
                    "data": $('input[name="download-format"]:checked').val()
                  },
                ],
                "response": "document",
                "notification_email": $('#daily-email').val(),
                "mode": "auto",
                "outputs": [{
                  "transmissionMode": "reference",
                  "id": "output"
                }]
              }),
              success: function (data) {
                  //console.log(data);

                  if (data.status == 'accepted') {

                    $('#success-modal').modal('show');

                  }

              },
              complete: function() {

                $('#daily-captcha').attr('src', child_theme_dir + 'resources/php/securimage/securimage_show.php')
                $('#daily-captcha_code').val('')

              }
            });

            request.fail(function(a, b) {
              console.log(a, b)
            });

          } else if (data == 'captcha failed') {

            $('#daily-captcha_code').addClass('border-secondary').tooltip('show');

          }
        }
      });

    })

    //
    // STATION
    //

    var station_status = $('#station-download-status').text();

    var dl_URL = {
      s: [],
      start: $('#station-start').val(),
      end: $('#station-end').val(),
      limit: $('#limit').val(),
      offset: 0,
      format: $('input[name="format"]:checked').val()
    };

    var markerMap = [];
    var pointsLayer;

    function station_init() {

      create_map('station');

      $.getJSON('https://geo.weather.gc.ca/geomet/features/collections/climate-stations/items?f=json&limit=10000', function (data) {

          pointsLayer = L.geoJson(data, {
              pointToLayer: function (feature, latlng) {

                  var markerColor = '#BBB';
                  var existingData = $("#station-select").select2("val");

                  //console.log(existingData);

                  if (existingData != null && existingData.includes(feature.properties.STN_ID.toString())) {
                    markerColor = '#F00';
                    console.log('existing');
                  }

                  var marker = L.circleMarker(latlng, {
                      // Stroke properties
                      color: markerColor,
                      opacity: 1,
                      weight: 2,
                      pane: 'idf',
                      // Fill properties
                      fillColor: markerColor,
                      fillOpacity: 1,
                      radius: 5
                  });

                  markerMap[feature.id] = marker;

                  return marker;

              }
          }).on('mouseover', function (e) {
              e.layer.bindTooltip(e.layer.feature.properties.STATION_NAME + ' ' + e.layer.feature.properties.STN_ID).openTooltip(e.latlng);
          }).on('click', function (e) {

              // get current station select value
              var existingData = $("#station-select").select2("val");

              // clicked ID
              var clicked_ID = e.layer.feature.properties.STN_ID.toString();

              // default colour
              markerColor = '#F00';

              if (existingData != null) {

                console.log('has value');

                if (existingData.includes(clicked_ID)) {

                  console.log('selected ID exists in value, removing');

                  var $select = $('#station-select');

                  index = existingData.indexOf(clicked_ID);

                  if (index > -1) {
                    existingData.splice(index, 1);
                    console.log('spliced!');
                  }

                  console.log(existingData);

                  $('#station-select').val(existingData).change();

                  markerColor = '#BBB';

                } else {

                  console.log('selected ID doesn\'t exist in value, adding');

                  existingData.push(clicked_ID);

                  $('#station-select').val(existingData).change();

                }

              } else {

                console.log('value is null, creating now');

                existingData = [clicked_ID];

                $('#station-select').val(existingData).change();

              }

              e.layer.setStyle({
                  // Stroke properties
                  color: markerColor,
                  opacity: 1,
                  weight: 2,
                  pane: 'idf',
                  // Fill properties
                  fillColor: markerColor,
                  fillOpacity: 1,
                  radius: 5
              });

          }).addTo(maps['station']);
      });

      function formatGeoSelect(item) {

          var $item = $('<span><div class="station-select-title">' + item.id + ' (' + item.text + ')</div></span>');

          return $item;

      }

    }

    $('#start_date').datetimepicker({
      format: 'Y-MM-DD',
      viewMode: 'years'
    });

    $('#start_date').on('change.datetimepicker', function () {
      update_URL('start', $('#station-start').val());
    });

    $('#end_date').datetimepicker({
      format: 'Y-MM-DD',
      viewMode: 'years'
    });

    $('#end_date').on('change.datetimepicker', function () {
      update_URL('end', $('#station-end').val());
    });

    $("#station-select").select2({
        language: current_lang,
        ajax: {
            url: child_theme_dir + "resources/app/run-frontend-station-download/search.php",
            dataType: 'json',
            delay: 0,
            data: function (params) {
                return {
                    q: params.term, // search term
                    page: params.page
                };
            },
            processResults: function (data, page) {
                // parse the results into the format expected by Select2.
                // since we are using custom formatting functions we do not need to
                // alter the remote JSON data
                return {
                    results: data
                };
            },
            cache: true
        },
        escapeMarkup: function (markup) {
            return markup;
        }, // let our custom formatter work
        width: "100%",
        //templateResult: formatGeoSelect,
        theme: "bootstrap4",
        placeholderOption: 'first',
        placeholder: $('#station-select').attr('data-placeholder')
    });

    $('#station-download-form :input').change(function() {
      $('#generated_container').hide();

      console.log('--- input changed ---');

      var param = $(this).attr('name');
      var new_val = $(this).val();

      switch ($(this).attr('id')) {

        case 'station-select' :
          param = 's';

          if ($(this).val() !== null) {
            new_val = $(this).val().join('|');
          } else {
            new_val = '';
          }

          break;

        case 'station-start' :
          param = 'start';
          break;

        case 'station-end' :
          param = 'end';
          break;

      }

      update_URL(param, new_val);

      check_station_form();
    });

    // trigger when a tag is removed from multiple station selector input
    $('#station-select').on('select2:unselect', function (e) {
        marker_id = parseFloat(e.params.data.id);
        pointsLayer.eachLayer(function (layer) {
            //console.log(layer);
            if (layer.feature.properties.STN_ID === marker_id) {
                layer.setStyle({
                    // Stroke properties
                    color: '#BBB',
                    opacity: 1,
                    weight: 2,
                    pane: 'idf',
                    // Fill properties
                    fillColor: '#BBB',
                    fillOpacity: 1,
                    radius: 5
                })
            }
        });
    });

    // trigger when a tag is added to multiple station selector input
    $('#station-select').on('select2:select', function (e) {
        marker_id = parseInt(e.params.data.id);
        pointsLayer.eachLayer(function (layer) {
            //console.log(layer);
            if (layer.feature.properties.STN_ID === marker_id) {
                layer.setStyle({
                    // Stroke properties
                    color: '#F00',
                    opacity: 1,
                    weight: 2,
                    pane: 'idf',
                    // Fill properties
                    fillColor: '#F00',
                    fillOpacity: 1,
                    radius: 5
                })
            }
        });
    });

/*
    $('#station-download-form').submit(function(e) {
      e.preventDefault();

      var process_url = $('#result').text();

      console.log(process_url);

      $.ajax({
        url: process_url,
        success: function(data) {
          console.log(data);
        },
        complete: function() {
          console.log('done');
        }
      });

    });
*/

    function check_station_form() {

      station_status = '';

      console.log('checking station form');

      var form_valid = true;

      $('#station-download-form .validate').each(function() {

        if ($(this).val() == '') {
          form_valid = false;

          console.log($(this).closest('div').find('label'));
          console.log($(this).closest('div').find('label').text());

          station_status += $(this).closest('div').find('label').text() + ' is invalid. ';

          console.log($(this).attr('name') + ' is invalid');
        }

      });

      if (dl_URL['s'].length == 0) {
        form_valid = false;

        station_status += 'Choose at least one weather station. ';
      }

      if (form_valid == false) {
        $('#station-process').addClass('disabled');
      } else {
        $('#station-process').removeClass('disabled');
        station_status = 'Ready to process.';

        populate_URL();
      }

      $('#station-download-status').text(station_status);

    }

    function update_URL(name, val) {
      console.log('update', name, val);
      dl_URL[name] = val;
    }

    function populate_URL() {

      console.log('populate', dl_URL);

      var new_url = 'https://geo.weather.gc.ca/geomet/features/collections/climate-daily/items?time=' + dl_URL.start + ' 00:00:00/' + dl_URL.end + ' 00:00:00&STN_ID=' + dl_URL['s'] + '&sortby=PROVINCE_CODE,STN_ID,LOCAL_DATE&f=' + dl_URL.format + '&limit=' + dl_URL.limit + '&offset=' + dl_URL.offset;

      $('#station-process').attr('href', new_url);

    }

    //
    // HEAT WAVE
    //

    function create_map(map_var) {

      console.log('create map', map_var);

      maps[map_var] = L.map('download-map-' + map_var, {
        maxZoom: 12,
        minZoom: 3
      }).setView([62.51231793838694,-98.5693359375], 4);

      maps[map_var].createPane('basemap');
      maps[map_var].getPane('basemap').style.zIndex = 399;
      maps[map_var].getPane('basemap').style.pointerEvents = 'none';

      maps[map_var].createPane('grid');
      maps[map_var].getPane('grid').style.zIndex = 500;
      maps[map_var].getPane('grid').style.pointerEvents = 'all';

      maps[map_var].createPane('labels');
      maps[map_var].getPane('labels').style.zIndex = 402;
      maps[map_var].getPane('labels').style.pointerEvents = 'none';

      L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png', {
          attribution: '',
          subdomains: 'abcd',
          pane: 'basemap',
          maxZoom: 12
      }).addTo(maps[map_var]);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
          pane: 'labels'
      }).addTo(maps[map_var]);

      if (map_var == 'station') {

        maps[map_var].createPane('idf');
        maps[map_var].getPane('idf').style.zIndex = 600;
        maps[map_var].getPane('idf').style.pointerEvents = 'all';

        maps[map_var].setView([52.501690, -98.567253], 4);

      }

    }

    function grid_click(map_var) {



    }

    function heatwave_init() {

      console.log('heat wave init');

      create_map('heatwave');

      var highlight;

      var clearHighlight = function () {
          if (highlight) {
              pbfLayer.resetFeatureStyle(highlight);
          }
          highlight = null;
      };

      var vectorTileOptions = {

          rendererFactory: L.canvas.tile,

          attribution: '',
          interactive: true,
          getFeatureId: function (f) {
              return f.properties.gid;
          },

          maxNativeZoom: 12,
          vectorTileLayerStyles: {
              'canadagrid': function (properties, zoom) {
                  return {
                      weight: 0.1,
                      color: gridline_color,
                      opacity: 1,
                      fill: true,
                      radius: 4,
                      fillOpacity: 0
                  }
              }
          },
          maxZoom: 12,
          minZoom: 7,
          pane: 'grid',
      };

      var pbfURL = hosturl + "/geoserver/gwc/service/tms/1.0.0/CDC:canadagrid@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf";

      var pbfLayer = L.vectorGrid.protobuf(pbfURL, vectorTileOptions).on('click', function (e) {

          clearHighlight();

          highlight = e.layer.properties.gid;

          pbfLayer.setFeatureStyle(highlight, {
              weight: 1,
              color: gridline_color_active,
              opacity: 1,
              fill: true,
              radius: 4,
              fillOpacity: 0
          });

          var_value = $("#var").val();
          mora_value = $("#mora").val();

          $('#heatwave-lat').val(e.latlng.lat);
          $('#heatwave-lon').val(e.latlng.lng);

          var ajax_url = base_href.replace('fr/', '');

          $.ajax({
            url: ajax_url + '/site/assets/themes/climate-data-ca/resources/ajax/get-place-by-coords.php',
            dataType: 'json',
            data: {
              lat: e.latlng.lat,
              lon: e.latlng.lng
            },
            success: function(data) {
              console.log(data);

              if (data.hasOwnProperty('geo_name')) {

                $('#heat-wave-location').parent().find('.select2-selection__rendered').text(data['geo_name'] + ', ' + data['province']);

              }
            }
          });

          L.DomEvent.stop(e);

          check_heat_form();

      }).addTo(maps['heatwave']);

    }

    // FORM VALIDATION

    function check_heat_form() {

      var heat_wave_valid = true;
      var heat_wave_email_valid = false;

      //console.log('checking heat wave form');

      if ($('#heatwave-captcha_code').val() == '') {
        console.log('captcha empty');
        heat_wave_valid = false;
      }

      if ($('#heatwave-lat').val() == '' || $('#heatwave-lon').val() == 0) {
        console.log('lat/lon empty');
        heat_wave_valid = false;
      }

      if ($('#heat-wave-days').val() == '' || $('#heat-wave-days').val() == 0 || $('#heat-wave-days').val() == '0') {
        console.log('days empty');
        heat_wave_valid = false;
      }

      if ($('#heat-wave-min').val() == '' || $('#heat-wave-max').val() == '') {
        console.log('min or max is empty');
        heat_wave_valid = false;
      }

      if (parseInt($('#heat-wave-min').val()) >= parseInt($('#heat-wave-max').val())) {
        console.log('max not greater than min');
        heat_wave_valid = false;
      }

      var email_val = $('#heat-wave-email').val();

      //console.log(input_val.indexOf('@'), input_val.indexOf('.'));

      if ($('body').validate_email(email_val) == true) {
        heat_wave_email_valid = true;
      }

      if (heat_wave_valid == true && heat_wave_email_valid == true) {
        $('#heat-wave-process').removeClass('disabled');
      } else {
        $('#heat-wave-process').addClass('disabled');
      }

    }

    $('#heat-wave-form .heat-wave-control').on('change', function(e) {

      var input_val = $(this).val();
      var cleaned_val = parseInt(input_val.replace(/\D/g,''));

      if (isNaN(cleaned_val)) {
        cleaned_val = 0;
      }

      //console.log(input_val, cleaned_val);

      $(this).val(cleaned_val);

      if ($(this).attr('id') == 'heat-wave-min') {

        // if changing the min value

        // current max value
        current_max = parseInt($('#heat-wave-max').val());

        // if max is not set or is less than the input value
        if (isNaN(current_max) || current_max == '' || current_max <= cleaned_val) {

          // max = input value + 1
          $('#heat-wave-max').val(cleaned_val + 1);

        }

      } else if ($(this).attr('id') == 'heat-wave-max') {

        // if changing the max value

        // current min value
        current_min = parseInt($('#heat-wave-min').val());

        // if min is not set or is more than the input value
        if (isNaN(current_min) || current_min == '' || current_min >= cleaned_val) {

          // max = current min + 1
          $('#heat-wave-max').val(current_min + 1);

        }

      }

      check_heat_form();

    });

    $('#heatwave-captcha_code').on('input', function(e) {
      check_heat_form();
    });

    $('#heat-wave-email').on('input', function(e) {
      check_heat_form();
    });

    $('#heat-wave-form').submit(function(e) {
      e.preventDefault();
    });

    $('#heat-wave-process').click(function(e) {

      e.preventDefault();

      var form_data = $('#heat-wave-form').serialize();

      $.ajax({
        url: child_theme_dir + 'resources/ajax/download-form.php',
        data: form_data,
        success: function(data) {
          console.log(data);

          if (data == 'success') {

            $('#heatwave-captcha_code').removeClass('border-secondary').tooltip('dispose');

            var request = $.ajax({
                url: 'https://pavics.climatedata.ca/providers/finch/processes/BCCAQv2_heat_wave_frequency_gridpoint/jobs',
                method: 'POST',
                crossDomain: true,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({
                    "inputs": [
                        {
                            "id": "lat",
                            "data": $('#heatwave-lat').val()
                        },
                        {
                            "id": "lon",
                            "data": $('#heatwave-lon').val()
                        },
                        {
                            "id": "freq",
                            "data": "YS"
                        },
                        {
                            "id": "thresh_tasmin",
                            "data": parseInt($('#heat-wave-min').val()) + ' degC'
                        },
                        {
                            "id": "thresh_tasmax",
                            "data": parseInt($('#heat-wave-max').val()) + ' degC'
                        },
                        {
                            "id": "window",
                            "data": String($('#heat-wave-days').val())
                        },
                        {
                            "id": "output_format",
                            "data": "netcdf"  // (netcdf, csv) defaults to netcdf, csv is not yet implemented. You'll get an empty csv.
                        },
                    ],
                    "response": "document",
                    "notification_email": $('#heat-wave-email').val(),
                    "mode": "auto",
                    "outputs": [{
                        "transmissionMode": "reference",
                        "id": "output"
                    }]
                }),
                success: function (data) {

                  console.log(data);

                    if (data.status == 'accepted') {

                      $('#success-modal').modal('show');

                    }

                }
            });

            request.fail(function(a, b) {
              console.log(a);
              console.log(b);
            });

          } else if (data == 'captcha failed') {

            $('#heatwave-captcha_code').addClass('border-secondary').tooltip('show');

          }

        }
      });

    });


    console.log('end of download-functions');
    console.log('- - - - -');

  });
})(jQuery);
