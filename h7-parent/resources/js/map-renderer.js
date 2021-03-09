

// map renderer
// v1.0

;(function ($) {

  // custom select class

  function map_renderer(item, options) {

    var default_panes = {
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
    }

    var default_layers = {
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
    }

    // options

    var defaults = {
      hosturl: DATA_URL,
      variables: null,
      rcp: 'rcp85',
      compare: false,
      map_settings: {
        zoomControl: false,
        maxZoom: 12,
        minZoom: 3,
        center: [67,-98.525390625],
        zoom: 3,
      },
      maps: {
        main: {
          object: null,
          id: null,
          controls: {
            legend: null,
            zoom: {
              position: 'bottomleft'
            }
          },
          panes: $.extend(true, {}, default_panes),
          layers: $.extend(true, {}, default_layers),
          colormap: '',
          query: {
            variable: null,
            decade: 1980,
            mora: 'ann',
            msys: 'ys',
            sector: null,
            rcp: 'rcp85'
          }
        },
        right: {
          object: null,
          id: null,
          controls: {
            legend: null,
            zoom: null
          },
          panes: $.extend(true, {}, default_panes),
          layers: $.extend(true, {}, default_layers),
          colormap: '',
          query: {
            variable: null,
            decade: 1980,
            mora: 'ann',
            msys: 'ys',
            sector: null,
            rcp: 'rcp85'
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
        console.log('map renderer', 'initializing')
      }

      // object IDs

//       plugin_settings.maps.main.id = plugin_item.find('.map-full').attr('id')
//       plugin_settings.maps.right.id = plugin_item.find('.map-right').attr('id')

      // set initial variable

      plugin_settings.maps.main.query.variable = plugin_settings.variables[0]
      plugin_settings.maps.right.query.variable = plugin_settings.variables[0]

      // COMPARE

      if (plugin_settings.rcp.indexOf('vs') !== -1) {

        plugin_settings.compare = true

        // RCPs
        plugin_settings.maps.main.query.rcp = plugin_settings.rcp.split('vs')[0]
        plugin_settings.maps.right.query.rcp = plugin_settings.rcp.split('vs')[1]

        plugin_settings.rcp = plugin_settings.rcp.split('vs')

      } else {

        plugin_settings.rcp = [plugin_settings.rcp]

        delete plugin_settings.maps.right

        plugin_settings.maps.main.query.rcp = plugin_settings.rcp

      }

      // set initial time

      if (JSON.parse(plugin_item.attr('data-map-time'))[0] !== 'ann') {
        plugin_settings.maps.main.query.mora = JSON.parse(plugin_item.attr('data-map-time'))[0]
        plugin_settings.maps.main.query.msys = 'ms'

        if (plugin_settings.compare == true) {
          plugin_settings.maps.right.query.mora = JSON.parse(plugin_item.attr('data-map-time'))[0]
          plugin_settings.maps.right.query.msys = 'ms'
        }
      }

      //
      // BUILD MAIN MAP
      //

      plugin_instance._create_map()

      //
      // BUILD CUSTOM PANES
      //

      plugin_instance._build_panes({
        map_id: 'main'
      })

      //
      // LEGEND
      //

      plugin_instance.generate_legend()

//       console.log(plugin_settings.maps.main, plugin_settings.maps.right)

      //
      // CONTROLS
      //

      // VARIABLE

      plugin_item.find('.map-filters select').select2({
        language: current_lang,
        width: '80%',
        minimumResultsForSearch: -1
      });

      plugin_item.find('.map-filters select').change(function(e) {

        if ($(this).hasClass('filter-var')) {

          plugin_settings.maps.main.query.variable = $(this).val()

          if (plugin_settings.compare == true) {
            plugin_settings.maps.right.query.variable = $(this).val()
          }

          plugin_instance.update_layer({
            change_var: true
          })

        } else if ($(this).hasClass('filter-time')) {

          var new_time = $(this).val()

          if (new_time == 'ann' ) {
            plugin_settings.maps.main.query.mora = 'ann'
            plugin_settings.maps.main.query.msys = 'ys'

            if (plugin_settings.compare == true) {
              plugin_settings.maps.right.query.mora = 'ann'
              plugin_settings.maps.right.query.msys = 'ys'
            }

          } else {
            plugin_settings.maps.main.query.mora = new_time
            plugin_settings.maps.main.query.msys = 'ms'

            if (plugin_settings.compare == true) {
              plugin_settings.maps.right.query.mora = new_time
              plugin_settings.maps.right.query.msys = 'ms'
            }

          }

          console.log('update now', plugin_settings.maps.main.query)

          plugin_instance.update_layer()

        }

      })

      // ION SLIDERS

      // opacity

      if (plugin_item.find('.opacity-slider').length) {

        plugin_elements['sliders']['opacity'] = {}

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

              plugin_settings.maps.main.panes[plugin_settings.maps.main.layers.target]['layer'].setOpacity(data.from / 100)

              if (plugin_settings.compare == true) {
                plugin_settings.maps.right.panes[plugin_settings.maps.right.layers.target]['layer'].setOpacity(data.from / 100)
              }

            } else {

              plugin_item.find('.leaflet-data-pane').css('opacity', data.from / 100);

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
              "1951-1980",
              "1961-1990",
              "1971-2000",
              "1981-2010",
              "1991-2020",
              "2001-2030",
              "2011-2040",
              "2021-2050",
              "2031-2060",
              "2041-2070",
              "2051-2080",
              "2061-2090",
              "2071-2100"
            ],

            onChange: function (data) {

              //plugin_settings.maps.main.query.decade = data.from_value
              plugin_settings.maps.main.query.decade = data.from_value.split("-")[0]

              plugin_settings.maps.main.object.invalidateSize()

              if (plugin_settings.compare == true) {
                plugin_settings.maps.right.query.decade = data.from_value.split("-")[0]
                plugin_settings.maps.right.object.invalidateSize()
              }

              plugin_instance.update_layer()

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

      //
      // SYNC MAPS
      //

      if (plugin_settings.compare == true) {
        plugin_settings.maps.main.object.sync(plugin_settings.maps.right.object)
        plugin_settings.maps.right.object.sync(plugin_settings.maps.main.object)
      }


    },

    _create_map: function(fn_options) {

      var plugin_instance = this
      var plugin_item     = this.item
      var plugin_settings = plugin_instance.options
      var plugin_elements = plugin_settings.elements

      // options

      var settings = $.extend(true, {
        map_id: null
      }, fn_options)

      // set query var

      //
      // OBJECTS
      //

      for (var key in plugin_settings.maps) {

        plugin_settings.maps[key].object = L.map(plugin_settings.maps[key].id, plugin_settings.map_settings)

        if (
          typeof plugin_settings.maps[key].controls.zoom !== 'undefined' &&
          plugin_settings.maps[key].controls.zoom != null
        ) {
          L.control.zoom(plugin_settings.maps[key].controls.zoom).addTo(plugin_settings.maps[key].object)
        }

      }

      //
      // PANES
      //

      // get panes from data attribute and merge with defaults

      for (var key in plugin_settings.maps) {

        if (typeof plugin_item.attr('data-map-panes') != 'undefined' && plugin_item.attr('data-map-panes') != '') {

          plugin_settings.maps[key].panes = {...plugin_settings.maps[key].panes, ...JSON.parse(plugin_item.attr('data-map-panes'))}

        }

        for (var pane in plugin_settings.maps[key].panes) {

          var pane_data = plugin_settings.maps[key].panes[pane];

          plugin_settings.maps[key].object.createPane(pane)

          if (typeof pane_data.style !== 'undefined') {

            for (var prop in pane_data.style) {
              plugin_settings.maps[key].object.getPane(pane).style[prop] = prop.zIndex;
              plugin_settings.maps[key].object.getPane(pane).style[prop] = prop.pointerEvents;
            }

          }

        }

      }

      // POPULATE DEFAULT PANES

      for (var key in plugin_settings.maps) {

        // basemap

        L.tileLayer('//cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png', {
          attribution: '',
          subdomains: 'abcd',
          pane: 'basemap',
          maxZoom: 12
        }).addTo(plugin_settings.maps[key].object)

        // labels

        L.tileLayer('//{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
          pane: 'labels'
        }).addTo(plugin_settings.maps[key].object)

      }

    },

    _build_panes: function(fn_options) {

      var plugin_instance = this
      var plugin_item     = this.item
      var plugin_settings = plugin_instance.options
      var plugin_elements = plugin_settings.elements

      // options

      var settings = $.extend(true, {
        map_id: null
      }, fn_options)

      for (var key in plugin_settings.maps) {

        for (var pane in plugin_settings.maps[key].panes) {

          var pane_data = plugin_settings.maps[key].panes[pane];

          // pane type - wms/protobuf/geojson

          if (pane_data.type == 'wms') {

            plugin_instance._get_wms(plugin_settings.maps[key])

/*
            if (plugin_settings.compare == true) {
              plugin_instance._build_panes({
                map_id: 'right'
              })
            }
*/

          } else if (pane_data.type == 'protobuf') {

            // untested

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
                      color: plugin_settings.maps[key].layers.grid.line_color,
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

            }).addTo(plugin_settings.maps[key].object)

            plugin_settings.maps[key].object.invalidateSize()

          } else if (pane_data.type == 'geojson') {

            //console.log('do geojson on ' + key)

            plugin_settings.maps[key].query.sector = 1712

            plugin_settings.maps[key].layers.geojson.path = child_theme_dir + 'resources/app/run-frontend-health/annual_choro_values.php?var=' + plugin_settings.maps[key].query.variable + '&rcp=' + plugin_settings.maps[key].query.rcp

/*
            console.log(
              $(plugin_settings.maps[key].object._container).attr('id'),
              plugin_settings.maps[key].layers.geojson.path
            )
*/

            // get legend data

            $.ajax({
              url: plugin_settings.hosturl + "/geoserver/wms?service=WMS&version=1.1.0&request=GetLegendGraphic&layer=CDC:health_sectors&style=" + plugin_settings.maps[key].query.variable + "_health_ann&format=application/json",
              async: false,
              dataType: 'json',
              success: function(data) {

                plugin_settings.maps[key].colormap = data.Legend[0].rules[0].symbolizers[0].Raster.colormap.entries
                plugin_settings.maps[key].colormap = plugin_settings.maps[key].colormap.reverse()

                //console.log('creating main sector layer')

                $.ajax({
                  url: plugin_settings.maps[key].layers.geojson.path,
                  dataType: 'json',
                  async: false,
                  success: function(data) {

                    plugin_settings.maps[key].layers.geojson.values = data

                    plugin_instance._get_geojson(plugin_settings.maps[key])

                  }
                })

              }

            })

            // set target layer for control adjustments

            plugin_settings.maps[key].layers.target = plugin_item.find('.map-filters').attr('data-layer');

          }

        }
      }

    },

    _legend_markup: function(legendTitle, colormap) {

      var labels = []

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

      var plugin_instance   = this
      var plugin_item       = this.item
      var plugin_settings   = plugin_instance.options
      var plugin_elements   = plugin_settings.elements

      // settings

      var settings = $.extend(true, {
        map_id: 'main'
      }, fn_options);

      if (plugin_settings.maps.main.controls.legend == null) {
        plugin_settings.maps.main.controls.legend = L.control({ position: 'topright' })
      }

      $.getJSON(plugin_settings.hosturl + '/geoserver/wms?service=WMS&version=1.1.0&request=GetLegendGraphic&layer=CDC:' + plugin_settings.maps.main.query.variable + '-ys-' + plugin_settings.maps.main.query.rcp + '-p50-' + plugin_settings.maps.main.query.mora + '-30year' + '&format=application/json')
        .then(function (data) {

          labels = [];

          plugin_settings.maps.main.controls.legend.onAdd = function (map) {

            let div = L.DomUtil.create('div', 'info legend legendTable');
            map.colormap = data.Legend[0].rules[0].symbolizers[0].Raster.colormap.entries;
            let unitValue;
            let unitColor;

            map.colormap = map.colormap.reverse();

            labels = plugin_instance._legend_markup('Annual', map.colormap);

            div.innerHTML = labels.join('');
            return div;

          }

          plugin_settings.maps.main.controls.legend.addTo(plugin_settings.maps.main.object)

        })
        .fail(function (err) {
          console.log(err.responseText)
        });

      if (plugin_settings.compare == true) {

        if (plugin_settings.maps.right.controls.legend == null) {
          plugin_settings.maps.right.controls.legend = L.control({ position: 'topright' })
        }

        $.getJSON(plugin_settings.hosturl + '/geoserver/wms?service=WMS&version=1.1.0&request=GetLegendGraphic&layer=CDC:' + plugin_settings.maps.right.query.variable + '-ys-' + plugin_settings.maps.right.query.rcp + '-p50-' + plugin_settings.maps.main.query.mora + '-30year' + '&format=application/json')
          .then(function (data) {

            labels = [];

            plugin_settings.maps.right.controls.legend.onAdd = function (map) {

              let div = L.DomUtil.create('div', 'info legend legendTable');
              map.colormap = data.Legend[0].rules[0].symbolizers[0].Raster.colormap.entries;
              let unitValue;
              let unitColor;

              map.colormap = map.colormap.reverse();

              labels = plugin_instance._legend_markup('Annual', map.colormap);

              div.innerHTML = labels.join('');
              return div;

            }

            plugin_settings.maps.right.controls.legend.addTo(plugin_settings.maps.right.object)

          })
          .fail(function (err) {
            console.log(err.responseText)
          });

      }


    },

    update_layer: function(fn_options) {

      var plugin_instance   = this
      var plugin_item       = this.item
      var plugin_settings   = plugin_instance.options
      var plugin_elements   = plugin_settings.elements

      // options

      var settings = $.extend(true, {
        change_var: false,
        map_id: 'main'
      }, fn_options);

//       console.log(plugin_settings.maps.main.panes.data.type)

      if (settings.change_var == true) {

        plugin_instance._build_panes({
          map_id: 'main'
        })

      }

      if (plugin_settings.maps.main.panes.data.type == 'wms') {

        plugin_instance._get_wms(plugin_settings.maps.main)

        if (plugin_settings.compare == true) {
          plugin_instance._get_wms(plugin_settings.maps.right)
        }

      } else if (plugin_settings.maps.main.panes.data.type == 'geojson') {

        plugin_instance._get_geojson(plugin_settings.maps.main)

        if (plugin_settings.compare == true) {
          plugin_instance._get_geojson(plugin_settings.maps.right)
        }

      }

      if (settings.change_var == true) {
        plugin_instance.generate_legend()
      }

    },

    _get_geojson: function(this_map) {

      var plugin_instance   = this
      var plugin_item       = this.item
      var plugin_settings   = plugin_instance.options
      var plugin_elements   = plugin_settings.elements

      if (this_map.object.hasLayer(this_map.layers.geojson.choropleth)) {
        this_map.object.removeLayer(this_map.layers.geojson.choropleth)
      }

      //console.log(this_map)

      this_map.layers.geojson.choropleth = L.geoJSON(healthSectorsGeoJson, {
        smoothFactor: 0,
        name: 'geojson',
        pane: 'data',
        onEachFeature: function (feature, layer) {

          if (typeof feature !== 'undefined') {

            layer.setStyle({
              fillColor: plugin_instance._get_color(
                this_map.layers.geojson.values[this_map.query.decade][parseInt(feature.properties.PR_HRUID)],
                this_map.colormap
              ),
              weight: 0.5,
              opacity: 1,
              color: 'white',
              fillOpacity: 1
            })

            layer.on('mouseover',
              function () {

                this.setStyle({
                  weight: 2
                })

                layer
                  .bindTooltip(layer.feature.properties.ENG_LABEL, { sticky: true })
                  .openTooltip(layer.latlng)

              }
            ).on('mouseout',
              function () {

                this.setStyle({
                  weight: 0.5
                })

              }
            )

          }

        }
      }).addTo(this_map.object)

      this_map.object.invalidateSize()

    },

    _get_wms: function(this_map) {

      var plugin_instance   = this
      var plugin_item       = this.item
      var plugin_settings   = plugin_instance.options
      var plugin_elements   = plugin_settings.elements

      console.log('CDC:' + this_map.query.variable + '-' + this_map.query.msys + '-' + this_map.query.rcp + '-p50-' + plugin_settings.maps.main.query.mora + '-30year')

      if (this_map.object.hasLayer(this_map.panes.data.layer)) {

        this_map.object.invalidateSize()

        this_map.panes.data.layer.setParams({
          format: 'image/png',
          opacity: 0.8,
          transparent: true,
          pane: 'data',
          VERSION: '1.3.0',
          TIME: this_map.query.decade + '-01-00T00:00:00Z/' + (this_map.query.decade + 30) + '-01-01T00:00:00Z',
          layers: 'CDC:' + this_map.query.variable + '-' + this_map.query.msys + '-' + this_map.query.rcp + '-p50-' + plugin_settings.maps.main.query.mora + '-30year'
        })

      } else {

        this_map.panes.data.layer = L.tileLayer.wms(plugin_settings.hosturl + '/geoserver/ows?', {
          format: 'image/png',
          opacity: 0.8,
          transparent: true,
          pane: 'data',
          VERSION: '1.3.0',
          TIME: this_map.query.decade + '-01-00T00:00:00Z/' + (this_map.query.decade + 30) + '-01-01T00:00:00Z',
          layers: 'CDC:' + this_map.query.variable + '-' + this_map.query.msys + '-' + this_map.query.rcp + '-p50-' + this_map.query.mora + '-30year'
        }).addTo(this_map.object)

        this_map.object.invalidateSize()
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
