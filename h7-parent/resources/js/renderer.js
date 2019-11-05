// renderer
// v1.0

(function ($) {

  // custom select class

  function renderer(item, options) {
    
    // options
  
    var defaults = {
      chart_dir: 'charts',
      chart_options: null,
      charts: {},
      debug: true
    };
    
    this.options = $.extend(true, defaults, options);

    this.item = $(item);
    this.init();
  }

  renderer.prototype = {

    // init

    init: function () {

      var plugin_instance = this;
      var plugin_item = this.item;
      var plugin_settings = plugin_instance.options;
      var plugin_elements = plugin_settings.elements;
      
      //
      // INITIALIZE
      //
      
      if (plugin_settings.debug == true) {
        console.log('initializing renderer');
      }
      
      if (typeof Highcharts !== 'undefined' && plugin_settings.chart_options != null) {  
        Highcharts.setOptions(plugin_settings.chart_options);
      }
      
      $('body').data('chart_dir', plugin_settings.chart_dir);
      
      plugin_instance.find_objects();
      
    },
    
    find_objects: function(fn_options) {

      var plugin_instance = this;
      var plugin_item = this.item;
      var plugin_settings = plugin_instance.options;
      var plugin_elements = plugin_settings.elements;
      
      // options

      var defaults = {
        parent: 'body'
      };

      var settings = $.extend(true, defaults, fn_options);
      
      console.log('finding objects', settings.parent);
      
      $(settings.parent).find('.renderable').each(function() {
        
        var container = $(this);
        
        var render_success = false;
        
        console.log(container.attr('id'));
        
        if (container.hasClass('map-container')) {
          
          //
          // MAP
          //
          
          container.map_renderer({
            variables: JSON.parse(container.attr('data-map-variables')),
            rcp: container.attr('data-map-rcp'),
            maps: {
              main: {
                id: container.find('.map').attr('id')
              }
            }
          });
          
        } else if (container.hasClass('chart-container')) {
          
          //
          // CHART
          //
          
          var variable = container.attr('data-chart-variable'),
              lat = container.attr('data-chart-lat'),
              lon = container.attr('data-chart-lon'),
              month = container.attr('data-chart-month');
          
          var units = JSON.parse(container.attr('data-chart-units'));
          
          //console.log(units.label);
          //console.log(units.value);
          
          var varDetails = {
            units: units,
            decimals: container.attr('data-chart-decimals')
          };
          
          //console.log(varDetails);
          
          timerStart = Date.now();
  
          midHistSeries = [];
          rangeHistSeries = [];
  
          mid26Series = [];
          range26Series = [];
  
          mid45Series = [];
          range45Series = [];
  
          mid85Series = [];
          range85Series = [];
            
          $.getJSON(
              '//data.climatedata.ca/get_values.php?lat=' + lat + '&lon=' + lon + '&var=' + variable + '&month=' + month,
              function (data) {

                  if (varDetails.units.value === 'kelvin') {
                      subtractValue = k_to_c;
                      chartUnit = " °C";
                  } else {
                      subtractValue = 0;
                      chartUnit = ' ' + varDetails.units.label;
                  }
                  
                  if (month === 'jan'){
                      monthNum = 0;
                  } else if (month === 'feb'){
                      monthNum = 1;
                  } else if (month === 'mar'){
                      monthNum = 2;
                  } else if (month === 'apr'){
                      monthNum = 3;
                  } else if (month === 'may'){
                      monthNum = 4;
                  } else if (month === 'jun'){
                      monthNum = 5;
                  } else if (month === 'jul'){
                      monthNum = 6;
                  } else if (month === 'aug'){
                      monthNum = 7;
                  } else if (month === 'sep'){
                      monthNum = 8;
                  } else if (month === 'oct'){
                      monthNum = 9;
                  } else if (month === 'nov'){
                      monthNum = 10;
                  } else if (month === 'dec'){
                      monthNum = 11;
                  } else {
                      monthNum = 0
                  }
  
                  for (var i = 0; i < data.length; i++) {
                    
                      chartDecimals = varDetails['decimals'];
  
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
                          rangeHistSeries.push([Date.UTC(1950 + i, monthNum, 1), data[i][9], data[i][11]]);
                          midHistSeries.push([Date.UTC(1950 + i, monthNum, 1), data[i][10]])
                      }
                      // had to add limiter since annual values spit out a null set at the end.
                      if (i > 54 && i < 150) {
  
                          range26Series.push([Date.UTC(1950 + i, monthNum, 1), data[i][0], data[i][2]]);
                          mid26Series.push([Date.UTC(1950 + i, monthNum, 1), data[i][1]]);
                          range45Series.push([Date.UTC(1950 + i, monthNum, 1), data[i][3], data[i][5]]);
                          mid45Series.push([Date.UTC(1950 + i, monthNum, 1), data[i][4]]);
                          range85Series.push([Date.UTC(1950 + i, monthNum, 1), data[i][6], data[i][8]]);
                          mid85Series.push([Date.UTC(1950 + i, monthNum, 1), data[i][7]]);
                      }
                  }
  
  
                  var chart = Highcharts.stockChart(container.find('.chart-placeholder')[0], {
                      
/*
                      title: {
                          text: varDetails['title']
                      },
*/
                      subtitle: {
                          align: 'left',
                          text: document.ontouchstart === undefined ?
                              chart_labels.click_to_zoom : 'Pinch the chart to zoom in'
                      },
  
                      xAxis: {
                          type: 'datetime'
                      },
  
                      yAxis: {
                          title: {
                              text: varDetails['title']
                          },
                          
                          labels: {
                              formatter: function () {
                                  return this.axis.defaultLabelFormatter.call(this) + chartUnit;
                              }
                          }
                      },
                      
                      legend: {
                        enabled: true
                      },
  
                      tooltip: {
                        valueDecimals: chartDecimals,
                        valueSuffix: chartUnit
                      },
                      
                      navigation: {
                        buttonOptions: {
                          enabled: false
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
                  
                  //console.log(chart);
                  
                  $('.chart-export-data').click(function (e) {
                    e.preventDefault();
                    
                    var dl_type = '';
                    
                    switch ($(this).attr('data-type')) {
                      case 'csv' : 
                        //chart.downloadCSV();
                        
                        window.open("data:text/csv;charset=utf-8," + escape(chart.getCSV()));
                        
                        break;
                    }
                    
                  });
                  
                  $('.chart-export-img').click(function (e) {
                    e.preventDefault();
                    
                    var dl_type = '';
                    
                    switch ($(this).attr('data-type')) {
                      case 'png' : 
                        dl_type = 'image/png';
                        break;
                      case 'pdf' :
                        dl_type = 'application/pdf';
                        break;
                    }
                    
                    chart.exportChart({
                      type: dl_type
                    });
                  });            
      
                
              }
          );
          
        }
                
        if ( render_success == true ) {
          container.addClass('rendered');
        }
        
      });
      
    },
    
    
    _eval: function(fn_code) {
      
      return Function('return ' + fn_code)();
      
    }
    
  }

  // jQuery plugin interface

  $.fn.renderer = function (opt) {
    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {

      var item = $(this);
      var instance = item.data('renderer');

      if (!instance) {

        // create plugin instance if not created
        item.data('renderer', new renderer(this, opt));

      } else {

        // otherwise check arguments for method call
        if (typeof opt === 'string') {
          instance[opt].apply(instance, args);
        }

      }
    });
  }

}(jQuery));
