// map renderer
// v1.0

(function ($) {

  // custom select class

  function map_renderer(item, options) {
    
    // options
    
    var defaults = {
      hosturl: '//data.climatedata.ca',
      variables: null,
      rcp: 'rcp85',
      maps: {
        main: {
          object: null,
          id: null,
          center: [67,-98.525390625],
          zoom: 3,
          panes: {
            "basemap" : {
              "style": {
                "zIndex": 399,
                "pointerEvents": "none"
              }
            },
            "labels": {
              "style": {
                "zIndex": 402,
                "pointerEvents": "none"
              }
            }
          },
          controls: {
            legend: null,
            zoom: {
              position: 'bottomleft'
            }
          },
          layers: {
            target: null,
            grid: {
              line_color: '#fff',
              line_color_hover: '#fff',
              line_color_active: '#fff',
              line_width: '0.2',
              line_width_active: '1',
              fill_color_hover: '#fff'
            },
            geojson: {
              path: ''
            }
          },
          colormap: '',
          query: {
            variable: null,
            decade: 1980,
            mora: 'ann',
            sector: null
          }
        }
      },
      elements: {
        sliders: {}
      },
      debug: true
    };
    
    this.options = $.extend(true, defaults, options);

    this.item = $(item);
    this.init();
  }

  map_renderer.prototype = {

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
        console.log('initializing map renderer');
      }
      
      // data URL
      
/*
      if (client_ip === '72.137.170.138') {
        plugin_settings.hosturl = 'http://192.168.0.52:8080';
      }
*/
      
      // set initial variable
      
      plugin_settings.maps.main.query.variable = plugin_settings.variables[0];

      var highlightGridFeature;
      
      // OBJECTS
      
      plugin_settings.maps.main.object = L.map(plugin_settings.maps.main.id, {
        zoomControl: false,
        maxZoom: 12,
        minZoom: 3,
        center: plugin_settings.maps.main.center,
        zoom: plugin_settings.maps.main.zoom
      });
      
      if (typeof plugin_settings.maps.main.controls.zoom !== 'undefined') {
        L.control.zoom(plugin_settings.maps.main.controls.zoom).addTo(plugin_settings.maps.main.object);
      }
      
      //
      // PANES
      //
      
      // get panes from data attribute and merge with defaults
      
      if (typeof plugin_item.attr('data-map-panes') != 'undefined' && plugin_item.attr('data-map-panes') != '') {
        
        plugin_settings.maps.main.panes = {...plugin_settings.maps.main.panes, ...JSON.parse(plugin_item.attr('data-map-panes'))};
        
      }
      
      for (var pane in plugin_settings.maps.main.panes) {
        
        var pane_data = plugin_settings.maps.main.panes[pane];
        
        plugin_settings.maps.main.object.createPane(pane);
        
        if (typeof pane_data.style !== 'undefined') {
        
          for (var prop in pane_data.style) {
            plugin_settings.maps.main.object.getPane(pane).style[prop] = prop.zIndex;
            plugin_settings.maps.main.object.getPane(pane).style[prop] = prop.pointerEvents;
          }
        
        }
        
      }
      
      // POPULATE DEFAULT PANES
      
      // basemap
      
      L.tileLayer('//cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '',
        subdomains: 'abcd',
        pane: 'basemap',
        maxZoom: 12
      }).addTo(plugin_settings.maps.main.object);
      
      // labels
      
      L.tileLayer('//{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
        pane: 'labels'
      }).addTo(plugin_settings.maps.main.object);
      
      // POPULATE CUSTOM PANES
      
      for (var pane in plugin_settings.maps.main.panes) {
        
        var pane_data = plugin_settings.maps.main.panes[pane];
        
        if (pane_data.type == 'wms') {
          
          pane_data.layer = L.tileLayer.wms(plugin_settings.hosturl + '/geoserver/ows?', {
            format: 'image/png',
            opacity: 0.8,
            transparent: true,
            pane: 'raster',
            VERSION: '1.3.0',
            TIME: plugin_settings.maps.main.query.decade + '-01-00T00:00:00Z/' + (plugin_settings.maps.main.query.decade + 10) + '-01-01T00:00:00Z',
            layers: 'CDC:' + plugin_settings.maps.main.query.variable + '-ys-' + plugin_settings.rcp + '-p50-ann-10year'
          }).addTo(plugin_settings.maps.main.object);
          
        } else if (pane_data.type == 'protobuf') {
          
          pane_data.layer = L.vectorGrid.protobuf(
            plugin_settings.hosturl + "/geoserver/gwc/service/tms/1.0.0/CDC:canadagrid@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
            {
              rendererFactory: L.canvas.tile,
              interactive: true,
              getFeatureId: function (f) {
                  return f.properties.gid;
              },
              maxNativeZoom: 12,
              vectorTileLayerStyles: {
                  'canadagrid': function (properties, zoom) {
                      return {
                          weight: 0.1,
                          color: plugin_settings.maps.main.layers.grid.line_color,
                          opacity: 1,
                          fill: true,
                          radius: 4,
                          fillOpacity: 0
                      }
                  }
              },
              maxZoom: 12,
              minZoom: 7,
              pane: 'grid'
            }
          ).on('click', function (e) {
            
          }).on('mouseover', function (e) {
              
          }).addTo(plugin_settings.maps.main.object);
          
        } else if (pane_data.type == 'geojson') {
          
          plugin_settings.maps.main.query.sector = 1712;
          
          $.getJSON(plugin_settings.hosturl + "/geoserver/wms?service=WMS&version=1.1.0&request=GetLegendGraphic&layer=CDC:health_sectors&style=" + plugin_settings.maps.main.query.variable + "_health_ann&format=application/json").then(function (data) {
  
            plugin_settings.maps.main.colormap = data.Legend[0].rules[0].symbolizers[0].Raster.colormap.entries;
            plugin_settings.maps.main.colormap = plugin_settings.maps.main.colormap.reverse();
            
            console.log('creating sector layer');
  
            plugin_settings.maps.main.layers.geojson.path = site_url + 'data/run-frontend-health/' + "annual_choro_values.php?var=" + plugin_settings.maps.main.query.variable + "&rcp=" + plugin_settings.rcp;
            
            console.log(plugin_settings.maps.main.layers.geojson.path);
            
            $.getJSON(plugin_settings.maps.main.layers.geojson.path).then(function (data) {
            
                plugin_settings.maps.main.layers.geojson.values = data;
    
                console.log("choroValues");
                console.log(plugin_settings.maps.main.layers.geojson.values);
                
                var tooltipValue;
    
                plugin_settings.maps.main.layers.geojson.choropleth = L.geoJSON(healthSectorsGeoJson, {
                    smoothFactor: 0,
                    name: 'geojson',
                    pane: 'sector',
                    onEachFeature: function (feature, layer) {
                      
                      if (typeof feature !== 'undefined') {
                      
                        layer.setStyle({
                            fillColor: plugin_instance._get_color(plugin_settings.maps.main.layers.geojson.values[plugin_settings.maps.main.query.decade][parseInt(feature.properties.PR_HRUID)], plugin_settings.maps.main.colormap),
                            weight: 0.5,
                            opacity: 1,
                            color: 'white',
                            fillOpacity: 1
                        });
                        layer.on('mouseover', function () {
    
                            tooltipValue = plugin_settings.maps.main.layers.geojson.values[plugin_settings.maps.main.query.decade][parseInt(this.feature.properties.PR_HRUID)];
                            //fixedTooltipValue = (tooltipValue - subtractValue).toFixed(varDetails['decimals']) + "" + chartUnit;
                            this.setStyle({
                                fillColor: plugin_instance._get_color(plugin_settings.maps.main.layers.geojson.values[plugin_settings.maps.main.query.decade][parseInt(this.feature.properties.PR_HRUID)], plugin_settings.maps.main.colormap),
                                weight: 2,
                                opacity: 1,
                                color: 'white',
                                fillOpacity: 1
                            });
                            layer.bindTooltip(layer.feature.properties.ENG_LABEL, {sticky: true}).openTooltip(layer.latlng);
                        });
                        layer.on('mouseout', function () {
                            this.setStyle({
                                fillColor: plugin_instance._get_color(plugin_settings.maps.main.layers.geojson.values[plugin_settings.maps.main.query.decade][parseInt(feature.properties.PR_HRUID)], plugin_settings.maps.main.colormap),
                                weight: 0.5,
                                opacity: 1,
                                color: 'white',
                                fillOpacity: 1
                            });
                        });
                        
                      }
                      
                    }
                }).addTo(plugin_settings.maps.main.object);
                
            });
            
          }).fail(function (err) {
            console.log(err)
          });
          
          
          
        }
        
      }
      
      //console.log(plugin_settings.maps.main.panes);
      
      plugin_settings.maps.main.object.invalidateSize();
      
      //
      // LEGEND
      //
      
      plugin_instance.generate_legend();
      
      //
      // CONTROLS
      //
      
      // target layer for control adjustments
      
      plugin_settings.maps.main.layers.target = plugin_item.find('.map-filters').attr('data-layer');
      
      // VARIABLE
      
      plugin_item.find('.map-filters select').select2({
        language: current_lang,
        width: '80%',
        minimumResultsForSearch: -1
      });
      
      plugin_item.find('.map-filters select').change(function(e) {
        
        plugin_settings.maps.main.query.variable = $(this).val();
        
        plugin_instance.update_layer();
        
      });
      
      // ION SLIDERS
      
      // opacity
      
      if (plugin_item.find('.opacity-slider').length) {
      
        plugin_elements['sliders']['opacity'] = {};
        
        plugin_elements.sliders.opacity.element = plugin_item.find('.opacity-slider');
        
        plugin_elements.sliders.opacity.element.ionRangeSlider({
          grid: false,
          skin: "round",
          from: 80,
          min: 0,
          max: 100,
          step: 5,
          hide_min_max: true,
          hide_from_to: true,
          prettify_enabled: false,
          onChange: function (data) {
            
            if (plugin_settings.maps.main.query.sector == '') {
              
              plugin_settings.maps.main.panes[plugin_settings.maps.main.layers.target]['layer'].setOpacity(data.from / 100);
              
            } else {
              
              plugin_item.find('.leaflet-sector-pane').css('opacity', data.from / 100);
              
            }
          }
        });
        
        plugin_elements.sliders.opacity.data = plugin_elements.sliders.opacity.element.data("ionRangeSlider");
      
      }
      
      // decade
      
      if (plugin_item.find('.decade-slider').length) {
      
        plugin_elements['sliders']['decade'] = {};
        plugin_elements.sliders.decade.element = plugin_item.find('.decade-slider');
    
        plugin_elements.sliders.decade.element.ionRangeSlider({
            grid: false,
            skin: "round",
            from: 3,
            hide_min_max: true,
            prettify_enabled: false,
            values: [
                1950,
                1960,
                1970,
                1980,
                1990,
                2000,
                2010,
                2020,
                2030,
                2040,
                2050,
                2060,
                2070,
                2080,
                2090
            ],
    
            onChange: function (data) {
              
              plugin_settings.maps.main.query.decade = data.from_value;
              
              plugin_settings.maps.main.object.invalidateSize();
              
              plugin_instance.update_layer();
              
            }
        });
        
        plugin_elements.sliders.decade.data = plugin_elements.sliders.decade.element.data("ionRangeSlider");
    
        plugin_elements.sliders.decade.element.on("finish", function (e) {
    
          e.stopPropagation();
          var $inp = $(this);
          var from = $inp.prop("value"); // reading input value
          //var from2 = $inp.data("from"); // reading input data-from attribute
    
        });
        
      }
      
    },
    
    _legend_markup: function(legendTitle, colormap) {
      
      labels = [];
      
      labels.push('<h6 class="legendTitle">' + legendTitle +'</h6>');
      
      var first_label = colormap[0].label;
      
      if (current_lang == 'fr') {
        first_label = first_label.replace('Degree Days', 'Degrés-jours');
        first_label = first_label.replace('Days', 'Jours');
      }
      
      labels.push('<span class="legendLabel max">' + first_label + '</span>');
      
      labels.push('<div class="legendRows">');
      
      var min_label = '';
      
      for (let i = 0; i < colormap.length; i++) {
        unitValue = colormap[i].label;
        unitColor = colormap[i].color;
        
        if (unitValue !== 'NaN') {
          
          if (current_lang == 'fr') {
            unitValue = unitValue.replace('Degree Days', 'Degrés-jours');
            unitValue = unitValue.replace('Days', 'Jours');
          }
          
          labels.push(
            '<div class="legendRow">' +
              '<div class="legendColor" style="background:' + unitColor + '"></div>' +
              '<div class="legendUnit">' + unitValue + '</div>' +
            '</div>'
          );
          
          min_label = unitValue;
        }
      }

      labels.push('</div><!-- .legendRows -->');
      
      labels.push('<span class="legendLabel min">' + min_label + '</span>');
      
      return labels;
      
    },
    
    generate_legend: function(fn_options) {

      var plugin_instance = this;
      var plugin_item = this.item;
      var plugin_settings = plugin_instance.options;
      var plugin_elements = plugin_settings.elements;
      
      // options

      var defaults = {
      };
      
      var settings = $.extend(true, defaults, fn_options);
      
      if (plugin_settings.maps.main.controls.legend == null) {
        
        plugin_settings.maps.main.controls.legend = L.control({position: 'topright'});
        
      }
      
      //console.log(plugin_settings.maps.main.controls.legend);
      
      var leftLegend = plugin_settings.maps.main.controls.legend;
      var map1 = plugin_settings.maps.main.object;
            
      var_value = plugin_settings.maps.main.query.variable;
      mora_value = plugin_settings.maps.main.query.mora;
      mora_text_value = 'Annual';
      rcp_value = plugin_settings.rcp;
      decade_value = plugin_settings.maps.main.query.decade;
      
      //plugin_settings.maps.main.query['var-group'] = $('#var option:selected').parent('optgroup').attr('data-slug');
    
      if (mora_value === 'ann') {
          msorys = 'ys';
          msorysmonth = '-ann';
      } else {
          msorys = 'ms';
          msorysmonth = '-' + mora_value;
      }

      left_rcp_value = '';
      right_rcp_value = '';

      if (rcp_value === 'rcp26vs45') {
          left_rcp_value = 'rcp26';
          right_rcp_value = 'rcp45';
      } else if (rcp_value === 'rcp26vs85') {
          left_rcp_value = 'rcp26';
          right_rcp_value = 'rcp85';
      } else if (rcp_value === 'rcp45vs26') {
          left_rcp_value = 'rcp45';
          right_rcp_value = 'rcp26';
      } else if (rcp_value === 'rcp45vs85') {
          left_rcp_value = 'rcp45';
          right_rcp_value = 'rcp85';
      } else if (rcp_value === 'rcp85vs26') {
          left_rcp_value = 'rcp85';
          right_rcp_value = 'rcp26';
      } else if (rcp_value === 'rcp85vs45') {
          left_rcp_value = 'rcp85';
          right_rcp_value = 'rcp45';
      } else if (rcp_value === 'rcp26') {
          left_rcp_value = 'rcp26';
          right_rcp_value = 'rcp45';
      } else if (rcp_value === 'rcp45') {
          left_rcp_value = 'rcp45';
          right_rcp_value = 'rcp45';
      } else if (rcp_value === 'rcp85') {
          left_rcp_value = 'rcp85';
          right_rcp_value = 'rcp45';
      }

      singleLayerName = var_value + '-' + msorys + '-' + left_rcp_value + '-p50' + msorysmonth + '-10year';
      leftLayerName = var_value + '-' + msorys + '-' + left_rcp_value + '-p50' + msorysmonth + '-10year';
      rightLayerName = var_value + '-' + msorys + '-' + right_rcp_value + '-p50' + msorysmonth + '-10year';
      
      var layer = leftLayerName;
      var legendTitle = mora_text_value;
  
      console.log("left legend layer");
      console.log(layer);
      
      $.getJSON(plugin_settings.hosturl + "/geoserver/wms?service=WMS&version=1.1.0&request=GetLegendGraphic&layer=CDC:" + layer + "&format=application/json")
        .then(function (data) {

            labels = [];
            
            plugin_settings.maps.main.controls.legend.onAdd = function (map1) {
                let div = L.DomUtil.create('div', 'info legend legendTable');
                plugin_settings.maps.main.colormap = data.Legend[0].rules[0].symbolizers[0].Raster.colormap.entries;
                let unitValue;
                let unitColor;

                plugin_settings.maps.main.colormap = plugin_settings.maps.main.colormap.reverse();
                
                labels = plugin_instance._legend_markup(legendTitle, plugin_settings.maps.main.colormap);
                    
                div.innerHTML = labels.join('');
                return div;

            };

            plugin_settings.maps.main.controls.legend.addTo(plugin_settings.maps.main.object);
            
/*
            if ($('#rcp').val().indexOf("vs") !== -1) {
              generateRightLegend(layer, legendTitle, data);
            }
*/
            
/*
            if (query['sector'] != '') {
              genChoro(decade_value, var_value, rcp_value, mora_value, colormap);
            }
*/

        })
        .fail(function (err) {
            console.log(err.responseText)
        });
        
    
       
    },
    
    update_layer: function(fn_options) {

      var plugin_instance = this;
      var plugin_item = this.item;
      var plugin_settings = plugin_instance.options;
      var plugin_elements = plugin_settings.elements;
      
      // options

      var defaults = {
      };
      
      var settings = $.extend(true, defaults, fn_options);
      
      if (plugin_settings.maps.main.query.sector == '') {
      
        plugin_settings.maps.main.panes[plugin_settings.maps.main.layers.target]['layer'].setParams({
          format: 'image/png',
          transparent: true,
          opacity: 0.8,
          TIME: plugin_settings.maps.main.query.decade + '-01-00T00:00:00Z/' + (plugin_settings.maps.main.query.decade + 10) + '-01-01T00:00:00Z',
          VERSION: '1.3.0',
          layers: 'CDC:' + plugin_settings.maps.main.query.variable + '-ys-' + plugin_settings.rcp + '-p50-ann-10year'
        });
        
      } else {
            
        if (plugin_settings.maps.main.object.hasLayer(plugin_settings.maps.main.layers.geojson.choropleth)) {
          //console.log('remove existing choroLayer');
          plugin_settings.maps.main.object.removeLayer(plugin_settings.maps.main.layers.geojson.choropleth);
        }
        
        var tooltipValue;

        plugin_settings.maps.main.layers.geojson.choropleth = L.geoJSON(healthSectorsGeoJson, {
            smoothFactor: 0,
            name: 'geojson',
            pane: 'sector',
            onEachFeature: function (feature, layer) {
              
              if (typeof feature !== 'undefined') {
              
                layer.setStyle({
                    fillColor: plugin_instance._get_color(plugin_settings.maps.main.layers.geojson.values[plugin_settings.maps.main.query.decade][parseInt(feature.properties.PR_HRUID)], plugin_settings.maps.main.colormap),
                    weight: 0.5,
                    opacity: 1,
                    color: 'white',
                    fillOpacity: 1
                });
                layer.on('mouseover', function () {

                    tooltipValue = plugin_settings.maps.main.layers.geojson.values[plugin_settings.maps.main.query.decade][parseInt(this.feature.properties.PR_HRUID)];
                    //fixedTooltipValue = (tooltipValue - subtractValue).toFixed(varDetails['decimals']) + "" + chartUnit;
                    this.setStyle({
                        fillColor: plugin_instance._get_color(plugin_settings.maps.main.layers.geojson.values[plugin_settings.maps.main.query.decade][parseInt(this.feature.properties.PR_HRUID)], plugin_settings.maps.main.colormap),
                        weight: 2,
                        opacity: 1,
                        color: 'white',
                        fillOpacity: 1
                    });
                    layer.bindTooltip(layer.feature.properties.ENG_LABEL, {sticky: true}).openTooltip(layer.latlng);
                });
                layer.on('mouseout', function () {
                    this.setStyle({
                        fillColor: plugin_instance._get_color(plugin_settings.maps.main.layers.geojson.values[plugin_settings.maps.main.query.decade][parseInt(feature.properties.PR_HRUID)], plugin_settings.maps.main.colormap),
                        weight: 0.5,
                        opacity: 1,
                        color: 'white',
                        fillOpacity: 1
                    });
                });
                
              }
              
            }
        }).addTo(plugin_settings.maps.main.object);
        
      }
      
    },
    
    _get_color: function(d, colormap) {

        for (let i = 0; i < colormap.length; i++) {
            
            unitValue = parseInt(colormap[i].quantity);
            unitColor = colormap[i].color;
            
            if (d > unitValue) {
                return unitColor
            }
        }
        
    }
    
  }

  // jQuery plugin interface

  $.fn.map_renderer = function (opt) {
    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {

      var item = $(this);
      var instance = item.data('map_renderer');

      if (!instance) {

        // create plugin instance if not created
        item.data('map_renderer', new map_renderer(this, opt));

      } else {

        // otherwise check arguments for method call
        if (typeof opt === 'string') {
          instance[opt].apply(instance, args);
        }

      }
    });
  }

}(jQuery));
