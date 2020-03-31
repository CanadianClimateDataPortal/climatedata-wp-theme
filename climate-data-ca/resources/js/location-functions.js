(function($) {

  $(function() {

    // PAGE TOUR
    
    var tour_options = {
      debug: true,
      default_open: false
    }

	  if (current_lang == 'fr') {
  	  tour_options.labels = {
    	  start_over: 'Recommencer',
    	  next: 'Suivant',
    	  close: 'Quitter',
    	  dont_show: 'Ne plus montrer'
  	  }
	  }

    var current_location = {
      id: $('#location-content').attr('data-location'),
      lat: $('#location-content').attr('data-lat'),
      lon: $('#location-content').attr('data-lon'),
    };

    //
    // MAP
    //

    var hosturl = geoserver_url

    var map1 = L.map('location-map', {
      zoomControl: false,
      zoom: 11,
      center: [current_location.lat, current_location.lon],
      dragging: false,
      boxZoom: false,
      doubleClickZoom: false,
      scrollWheelZoom: false
    });

    map1.createPane('basemap');
    map1.getPane('basemap').style.zIndex = 399;
    map1.getPane('basemap').style.pointerEvents = 'none';

    map1.createPane('grid');
    map1.getPane('grid').style.zIndex = 500;
    map1.getPane('grid').style.pointerEvents = 'none';


    L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '',
        subdomains: 'abcd',
        pane: 'basemap'
    }).addTo(map1);

    var highlightGridFeature;

    var pbfLayer = L.vectorGrid.protobuf(hosturl + "/geoserver/gwc/service/tms/1.0.0/CDC:canadagrid@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf", {

      rendererFactory: L.canvas.tile,

      attribution: '',
      interactive: true,
      getFeatureId: function (f) {
          return f.properties.gid;
      },

      vectorTileLayerStyles: {
        'canadagrid': function (properties, zoom) {
          return {
            weight: 1,
            //color: '#e50e40',
            color: '#9a9fb7',
            opacity: 0.3,
            fill: true,
            radius: 4,
            //dashArray: '2, 20',
            fillOpacity: 0
          }
        }
      },
      pane: 'grid',
    }).on('click', function (e) {

      //console.log('hover', e.layer.properties.gid);

      if (highlightGridFeature) {
          pbfLayer.resetFeatureStyle(highlightGridFeature);
      }

      highlightGridFeature = e.layer.properties.gid;

      pbfLayer.setFeatureStyle(highlightGridFeature, {
          weight: 0,
          color: '#FFF',
          opacity: 1,
          fillColor: '#FFF',
          fill: true,
          fillOpacity: 0.25
      });

    }).addTo(map1);

    var marker = L.marker([current_location.lat, current_location.lon]).addTo(map1);

    //highlight = current_location.id;

/*
    pbfLayer.setFeatureStyle(highlight, {
        weight: 1,
        color: '#f00',
        opacity: 1,
        fill: true,
        radius: 4,
        fillOpacity: 0
    });
*/

    //
    // CHARTS
    //

    var chart_objects = {};

    function update_query(select, val) {

      if (window.location.search != '') {
        var current_search = window.location.search.substr(1).split('&')

        var current_query = {}

        current_search.forEach(function(entry) {
          var split_entry = entry.split('=')
          current_query[split_entry[0]] = split_entry[1]
        });

        current_query[select] = val

        //console.log(window.location)

        history.replaceState({}, $('title').text(), window.location.href.split('?')[0] + '?' + $.param(current_query))
      }

    }

    function load_var_by_location(variable, container) {
      
      if ($('body').hasClass('page-tour-open')) {
        $('#page-tour').page_tour('hide_tour')
        $('#page-tour').page_tour('destroy')
      }

      chart_objects[container.attr('id')] = {
        container: container,
        variable: variable,
        varDetails: null,
        chartDecimals: null
      }

      //console.log('load var', variable);

      $('body').addClass('spinner-on');

      container.animate({
        opacity: 0.1
      }, {
        duration: 250,
        complete: function() {

          var ajax_url = site_url;

          ajax_url += 'variable/' + variable;

          $.ajax({
            url: ajax_url,
            data: {
              content: 'chart',
              loc: current_location.id
            },
            success: function(data) {

              if ($(data).filter('#callback-data').length) {
                chart_objects[container.attr('id')]['varDetails'] = JSON.parse($(data).filter('#callback-data').html());
              }

              container.html(data);

              var json_url = data_url + '/get_values.php?lat=' + current_location.lat + '&lon=' + current_location.lon + '&var=' + variable + '&month=ann';

              //console.log('load chart JSON from ' + 'get_values.php?lat=' + current_location.lat + '&lon=' + current_location.lon + '&var=' + variable + '&month=ann');

              $.ajax({
                url: json_url,
                dataType: 'json',
                success: function (data) {

                  midHistSeries = [];
                  rangeHistSeries = [];

                  mid26Series = [];
                  range26Series = [];

                  mid45Series = [];
                  range45Series = [];

                  mid85Series = [];
                  range85Series = [];

                  //console.log(data);

                  //console.log(variable + ' json success, render to #' + variable + '-chart');

                  if (chart_objects[container.attr('id')]['varDetails']['units']['value'] === 'kelvin') {
                    subtractValue = k_to_c;
                    chart_objects[container.attr('id')]['chartUnit'] = "°C";
                  } else {
                    subtractValue = 0;
                    chart_objects[container.attr('id')]['chartUnit'] = chart_objects[container.attr('id')]['varDetails']['units']['label'];
                  }

                  //console.log(varDetails);

                  chart_objects[container.attr('id')]['chartDecimals'] = chart_objects[container.attr('id')]['varDetails']['decimals'];

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

                  var chart = Highcharts.stockChart({
                      chart: {
                        renderTo: $('body').find('#' + variable + '-chart')[0],
                          height: '700px',
                          zoomType: 'x',
                          animation: false,
                          backgroundColor: 'transparent',
                          style: {
                            fontFamily: 'CDCSans'
                          }
                      },

                      xAxis: {
                          type: 'datetime'
                      },

                      yAxis: {
                          title: {
                            text: chart_objects[container.attr('id')]['varDetails']['title']
                          },

                          labels: {
                            align: 'left',
                            formatter: function () {
                              return this.axis.defaultLabelFormatter.call(this) + ' ' + chart_objects[container.attr('id')]['chartUnit'];
                            }
                          }
                      },
                      legend: {
                          enabled: true,
                          align: 'right',
                          verticalAlign: 'top',
                          x: -50,
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
                          valueDecimals: chart_objects[container.attr('id')]['chartDecimals'],
                          valueSuffix: ' ' + chart_objects[container.attr('id')]['chartUnit']
                      },

                      exporting: {
                        enabled: true,

                        buttons: {
                          contextButton: {
                            menuItems: ['printChart',
                            'separator',
                            'downloadPNG',
                            'downloadJPEG',
                            'downloadPDF',
                            'downloadSVG',
                            'separator',
                            {
                              text: chart_globals.lang.downloadCSV,
                              onclick: function () {

                                window.location.href = "data:text/csv;charset=utf-8," + escape(this.getCSV());

                              }
                            },
                            'downloadXLS']
                          }
                        }
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

                },
                complete: function() {
                  $('body').removeClass('spinner-on');
                }
              });

              //$('body').removeClass('spinner-on');

            },
            complete: function() {
              container.animate({
                opacity: 1
              }, 250);
            }
          });



        }
      });

    }

    // INITIAL LOAD

    $.ajax({
      url: data_url + '/get_location_values_allyears.php?lat=' + current_location.lat + '&lon=' + current_location.lon + '&time=2100-01-01',
      success: function(data) {

        var location_data = JSON.parse(data);

        //console.log(location_data);

        $('#location-hero-default').hide();
        $('#location-hero-data').show();

        $('#location-val-1').text(location_data.anusplin_1950_temp);
        $('#location-val-2').text(location_data.anusplin_2005_temp);
        $('#location-val-3').text(location_data.bcc_2020_temp);
        $('#location-val-4').text(location_data.bcc_2050_temp);
        $('#location-val-5').text(location_data.bcc_2090_temp);

        $('#location-val-6').text(location_data.anusplin_1980_precip);
        $('#location-val-7').text(location_data.bcc_2020_precip);
        $('#location-val-8').text(location_data.bcc_2050_precip);
        $('#location-val-9').text(location_data.bcc_2090_precip);

      }
    });

    $('.location-data-select').each(function() {

      var first_var = $(this).find(':selected');

      //console.log('initial load', first_var.val());

      update_query($(this).attr('name'), first_var.val())

      load_var_by_location(first_var.val(), $(this).closest('.var-type').find('.var-data-placeholder'));

    });

    // ON CHANGE VAR

    $('.location-data-select').on('select2:select', function(e) {

      update_query($(this).attr('name'), $(this).val())

      load_var_by_location($(this).val(), $(this).closest('.var-type').find('.var-data-placeholder'));

    });

    // STICKY KIT

    $('#location-tag-wrap').stick_in_parent({
      offset_top: sticky_offset + $('#main-header').outerHeight()
    });
    
    $('body').on('click', '.chart-tour-trigger', function(e) {
      e.preventDefault()
      
      var this_ID = $(this).attr('data-container')
      var chart_pos = $('#' + this_ID).offset()
      
      var scroll_to = chart_pos.top - ($('#main-header').outerHeight() + 20)
      
      $('body').addClass('spinner-on')
      
      $('body, html').animate({
        scrollTop: scroll_to
      }, {
        duration: 1000,
        complete: function() {
          
          $('body').css('overflow', 'hidden')
          
          var new_options = JSON.parse($('#page-tour').attr('data-steps'))
          
          for (var key in new_options) {
            new_options[key].position.of = '#' + this_ID
          }
          
          $('#page-tour').attr('data-steps', JSON.stringify(new_options))
    
          setTimeout(function() {
            
            $('#page-tour').page_tour(new_options).page_tour('show_tour')
            
            $('body').removeClass('spinner-on')
            
          }, 1000)
          
        }
      })
      
      
    })
    
    $('body').on('click', '.page-tour-close', function(e) {
      $('body').css('overflow', '')
      $('#page-tour').page_tour('destroy')
    })

    //console.log('end of location-functions');

  });
})(jQuery);
