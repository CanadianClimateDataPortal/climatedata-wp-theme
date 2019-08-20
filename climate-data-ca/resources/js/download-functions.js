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

    function var_init() {

      create_map('variable');

/*
      maps['variable'] = L.map("download-map", {
        maxZoom: 12,
        minZoom: 3
      }).setView([62.51231793838694,-98.5693359375], 4);

      maps['variable'].createPane('basemap');
      maps['variable'].getPane('basemap').style.zIndex = 399;
      maps['variable'].getPane('basemap').style.pointerEvents = 'none';

      maps['variable'].createPane('grid');
      maps['variable'].getPane('grid').style.zIndex = 500;
      maps['variable'].getPane('grid').style.pointerEvents = 'all';

      maps['variable'].createPane('labels');
      maps['variable'].getPane('labels').style.zIndex = 402;
      maps['variable'].getPane('labels').style.pointerEvents = 'none';

      L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png', {
          attribution: '',
          subdomains: 'abcd',
          pane: 'basemap',
          maxZoom: 12
      }).addTo(maps['variable']);
*/

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

          $('#download-lat').val(e.latlng.lat);
          $('#download-lon').val(e.latlng.lng);

          var ajax_url = base_href.replace('fr/', '');

          //console.log(ajax_url);

          $.ajax({
            url: ajax_url + '/site/assets/themes/climate-data-ca/resources/ajax/get-place-by-coords.php',
            dataType: 'json',
            data: {
              lat: e.latlng.lat,
              lon: e.latlng.lng
            },
            success: function(data) {
              //console.log(data);

              if (data.hasOwnProperty('geo_name')) {

                $('#download-location').parent().find('.select2-selection__rendered').text(data['geo_name'] + ', ' + data['province']);

              }
            }
          });

          // get the variable details

          $.ajax({
            url: ajax_url + '/variable/' + $('#var').val() + '/',
            data: {
              content: 'location'
            },
            success: function(data) {

              varDetails = JSON.parse($(data).find('#callback-data').html())

              console.log(varDetails)

            },
            complete: function() {

              // genChart

              timerStart = Date.now();

              midHistSeries = [];
              rangeHistSeries = [];

              mid26Series = [];
              range26Series = [];

              mid45Series = [];
              range45Series = [];

              mid85Series = [];
              range85Series = [];

              //console.log('get_values.php?lat=' + e.latlng.lat + '&lon=' + e.latlng.lng + '&var=' + $('#download-variable').val() + '&month=ann');

              $.getJSON(
                  data_url + '/get_values.php?lat=' + e.latlng.lat + '&lon=' + e.latlng.lng + '&var=' + $('#download-variable').val() + '&month=ann',
                  function (data) {

                      if (varDetails.units.value === 'kelvin') {
                          subtractValue = k_to_c;
                          chartUnit = "°C";
                      } else {
                          subtractValue = 0;
                          chartUnit = varDetails.units.label;
                      }

                      seconds = (Date.now() - timerStart) * 0.001;
                      //$('#loadtime').html(" <strong style=color:blue>Loaded in " + seconds + " seconds</strong>");

                      dLen = data.length;

                      for (var i = 0; i < data.length; i++) {

                          data[i][0] = parseFloat((data[i][0] - subtractValue).toFixed(2));
                          data[i][1] = parseFloat((data[i][1] - subtractValue).toFixed(2));
                          data[i][2] = parseFloat((data[i][2] - subtractValue).toFixed(2));

                          data[i][3] = parseFloat((data[i][3] - subtractValue).toFixed(2));
                          data[i][4] = parseFloat((data[i][4] - subtractValue).toFixed(2));
                          data[i][5] = parseFloat((data[i][5] - subtractValue).toFixed(2));

                          data[i][6] = parseFloat((data[i][6] - subtractValue).toFixed(2));
                          data[i][7] = parseFloat((data[i][7] - subtractValue).toFixed(2));
                          data[i][8] = parseFloat((data[i][8] - subtractValue).toFixed(2));

                          data[i][9] = parseFloat((data[i][0]).toFixed(2));
                          data[i][10] = parseFloat((data[i][1]).toFixed(2));
                          data[i][11] = parseFloat((data[i][2]).toFixed(2));

                          if (i < 56) {
                              rangeHistSeries.push([Date.UTC(1950 + i, 0, 1), data[i][9], data[i][11]]);
                              midHistSeries.push([Date.UTC(1950 + i, 0, 1), data[i][10]]);
                          }
                          // had to add limiter since annual values spit out a null set at the end.
                          if (i > 54 && i < 150) {

                              range26Series.push([Date.UTC(1950 + i, 0, 1), data[i][0], data[i][2]]);
                              mid26Series.push([Date.UTC(1950 + i, 0, 1), data[i][1]]);
                              range45Series.push([Date.UTC(1950 + i, 0, 1), data[i][3], data[i][5]]);
                              mid45Series.push([Date.UTC(1950 + i, 0, 1), data[i][4]]);
                              range85Series.push([Date.UTC(1950 + i, 0, 1), data[i][6], data[i][8]]);
                              mid85Series.push([Date.UTC(1950 + i, 0, 1), data[i][7]]);
                          }
                      }

                      chart = Highcharts.stockChart('dummy-chart', {
                          chart: {
                              height: '700px',
                              zoomType: 'x',
                              animation: false,
                              backgroundColor: 'transparent',
                              style: {
                                  fontFamily: 'CDCSans'
                              }
                          },
                          title: {
                              align: 'left',
                              style: {
                                fontWeight: 600
                              },
                              text: 'Max Temperature (°C)'
                          },
                          subtitle: {
                              align: 'left',
                              text: document.ontouchstart === undefined ?
                                  'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
                          },

                          xAxis: {
                              type: 'datetime'
                          },

                          yAxis: {
                              title: {
                                  text: 'Max Temperature (°C)'
                              }
                          },
                          legend: {
                              enabled: true,
                              align: 'right',
                              verticalAlign: 'top',
                              itemStyle: {
                                  textTransform: 'uppercase',
                                  color: '#727c9a'
                              }
                          },
                           rangeSelector: {
                              inputEnabled: false,
                              buttonTheme: {
                                  visibility: 'hidden'
                              },
                              labelStyle: {
                                  visibility: 'hidden'
                              }
                          },

                          tooltip: {
                              crosshairs: true,
                              shared: true,
                              split: false,
                              valueSuffix: '°C'
                          },

                          exporting: {
                            filename: 'ClimateData.ca Export'
                          },

                          series: [{
                              name: chart_labels.historical,
                              data: midHistSeries,
                              zIndex: 1,
                              showInNavigator: true,
                              color: '#000000',
                              marker: {
                                  fillColor: '#000000',
                                  lineWidth: 0,
                                  radius: 0,
                                  lineColor: '#000000'
                              }
                          }, {
                              name: chart_labels.historical_range,
                              data: rangeHistSeries,
                              type: 'arearange',
                              lineWidth: 0,
                              linkedTo: ':previous',
                              color: '#000000',
                              fillOpacity: 0.2,
                              zIndex: 0,
                              marker: {
                                  radius: 0,
                                  enabled: false
                              },
                          }, {
                              name: chart_labels.rcp_26_median,
                              data: mid26Series,
                              zIndex: 1,
                              showInNavigator: true,
                              color: '#00F',
                              marker: {
                                  fillColor: '#00F',
                                  lineWidth: 0,
                                  radius: 0,
                                  lineColor: '#00F'
                              }
                          }, {
                              name: chart_labels.rcp_26_range,
                              data: range26Series,
                              type: 'arearange',
                              lineWidth: 0,
                              linkedTo: ':previous',
                              color: '#00F',
                              fillOpacity: 0.2,
                              zIndex: 0,
                              marker: {
                                  radius: 0,
                                  enabled: false
                              },
                          }, {
                              name: chart_labels.rcp_45_median,
                              data: mid45Series,
                              zIndex: 1,
                              showInNavigator: true,
                              color: '#00640c',
                              marker: {
                                  fillColor: '#00640c',
                                  lineWidth: 0,
                                  radius: 0,
                                  lineColor: '#00640c'
                              }
                          }, {
                              name: chart_labels.rcp_45_range,
                              data: range45Series,
                              type: 'arearange',
                              lineWidth: 0,
                              linkedTo: ':previous',
                              color: '#00640c',
                              fillOpacity: 0.2,
                              zIndex: 0,
                              marker: {
                                  radius: 0,
                                  enabled: false
                              }
                          }, {
                              name: chart_labels.rcp_85_median,
                              data: mid85Series,
                              zIndex: 1,
                              showInNavigator: true,
                              color: '#F00',
                              marker: {
                                  fillColor: '#F00',
                                  lineWidth: 0,
                                  radius: 0,
                                  lineColor: '#F00'
                              }
                          }, {
                              name: chart_labels.rcp_85_range,
                              data: range85Series,
                              type: 'arearange',
                              lineWidth: 0,
                              linkedTo: ':previous',
                              color: '#F00',
                              fillOpacity: 0.2,
                              zIndex: 0,
                              marker: {
                                  radius: 0,
                                  enabled: false
                              }
                          }]
                      });

                  }
              );

            }
          })

          // console.log(var_value);
          //console.log(mora_value);

          L.DomEvent.stop(e);

          checkform();

      }).addTo(maps['variable']);

    }

    //
    // FORM VALIDATION
    //

    function checkform() {

      //console.log('checking form');

      var form_valid = false;

      if ($('#download-dataset').val() == 'annual') {

        if ($('#download-filename').hasClass('valid') && $('#download-lat').val() != '' && $('#download-lon').val() != '') {
          form_valid = true;
        }

        if (form_valid == true) {

          $('#download-process').attr('download', $('#download-filename').val() + '.' + $('input[name="download-format"]:checked').val());

          if ($('input[name="download-format"]:checked').val() == 'json') {

            //console.log('get data', data_url + '/download_csv.php?lat=' + $('#download-lat').val() + '&lon=' + $('#download-lon').val() + '&var=' + $('#download-variable').val());

            var json_data;

            $('body').addClass('spinner-on');

            $.ajax({
              url: data_url + '/download_csv.php?lat=' + $('#download-lat').val() + '&lon=' + $('#download-lon').val() + '&var=' + $('#download-variable').val(),
              success: function (data) {
                //console.log('success');

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

                json_data[1]['data'] = data_obj;

                $('#download-process').attr('href', "data:application/json," + encodeURIComponent(JSON.stringify(json_data))).removeClass('disabled');

                $('body').removeClass('spinner-on');

              }
            });

          } else {

            $('#download-process').removeClass('disabled');

          }

        } else {
          $('#download-process').addClass('disabled');
          //$('#download-process').prop('disabled', true);
        }

      } else if ($('#download-dataset').val() == 'daily') {

        if (check_email($('#daily-email').val()) == true && $('#daily-captcha_code').val() != '' && $('#download-lat').val() != '' && $('#download-lon').val() != '') {
          $('#daily-process').removeClass('disabled');
        } else {
          $('#daily-process').addClass('disabled');
        }

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

    $('#download-process').click(function(e) {

      //console.log('submit');

      if ($('input[name="download-format"]:checked').val() == 'csv') {
        $(this).attr('href', 'data:text/csv;charset=utf-8,' + escape(chart.getCSV()));
      }

    });

    checkform();

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

            $('#daily-captcha_code').removeClass('border-secondary').tooltip('dispose');

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
                        "data": $('#download-lat').val()
                      },
                      {
                        "id": "lon0",
                        "data": $('#download-lon').val()
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

              }
            });

            request.fail(function(a, b) {
              console.log(a);
              console.log(b);
            });

          } else if (data == 'captcha failed') {

            $('#daily-captcha_code').addClass('border-secondary').tooltip('show');

          }
        }
      });



    });

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

          console.log(ajax_url);

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

    function check_email(email_val) {

      var is_valid = false;

      if (typeof email_val !== 'undefined' && email_val != 'undefined' && email_val != '') {

        if (email_val.indexOf('@') !== -1 && email_val.indexOf('.') !== -1) {

          if (email_val.indexOf('@') !== 0) {

            var after_at = email_val.substring(email_val.indexOf('@'));

            if (after_at.indexOf('.') !== -1) {

              var after_dot = after_at.substring(after_at.indexOf('.'));

              if (after_dot.length > 1) {

                is_valid = true;

              } else {
                //console.log('no chars after .');
              }

            } else {
              //console.log('no . after @');
            }

          } else {
            //console.log('no chars before @');
          }

        } else {
          //console.log('doesn\'t contains @ and .');
        }

      } else {
        //console.log('blank');
      }

      return is_valid;

    }

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

      if (check_email(email_val) == true) {
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
