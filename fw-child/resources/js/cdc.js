// global CDC functions
(function ($) {
  function cdc_app(item, options) {
    // options

    var defaults = {
      globals: ajax_data.globals,
      lang: ajax_data.globals.lang,
      post_id: null,
      canadaBounds: L.latLngBounds(L.latLng(41, -141.1), L.latLng(83.6, -49.9)),
      grid: {
        highlighted: [],
        markers: {},
        styles: {
          line: {
            default: {
              color: '#fff',
              weight: 0.2,
              opacity: 0.6,
            },
            hover: {
              color: '#fff',
              weight: 0.2,
              opacity: 0.8,
            },
            active: {
              color: '#fff',
              weight: 1,
              opacity: 1,
            },
          },
          fill: {
            default: {
              color: '#fff',
              opacity: 0,
            },
            hover: {
              color: '#fff',
              opacity: 0.2,
            },
            active: {
              color: '#fff',
              opacity: 0.6,
            },
          },
        },
        leaflet: {
          rendererFactory: L.canvas.tile,
          interactive: true,
          getFeatureId: function (f) {
            return f.properties.gid;
          },
          maxNativeZoom: 12,
          vectorTileLayerStyles: {
            canadagrid: function (properties, zoom) {
              return {
                weight: defaults.grid.styles.line.default.weight,
                color: defaults.grid.styles.line.default.color,
                opacity: defaults.grid.styles.line.default.opacity,
                fill: true,
                radius: 4,
                fillOpacity: defaults.grid.styles.fill.default.opacity,
              };
            },
            canadagrid1deg: function (properties, zoom) {
              return {
                weight: defaults.grid.styles.line.default.weight,
                color: defaults.grid.styles.line.default.color,
                opacity: defaults.grid.styles.line.default.opacity,
                fill: true,
                radius: 4,
                fillOpacity: defaults.grid.styles.fill.default.opacity,
              };
            },
            era5landgrid: function (properties, zoom) {
              return {
                weight: defaults.grid.styles.line.default.weight,
                color: defaults.grid.styles.line.default.color,
                opacity: defaults.grid.styles.line.default.opacity,
                fill: true,
                radius: 4,
                fillOpacity: defaults.grid.styles.fill.default.opacity,
              };
            },
            health: null,
            census: null,
            watershed: null,
          },
          bounds: L.latLngBounds(L.latLng(41, -141.1), L.latLng(83.6, -49.9)),
          maxZoom: 12,
          minZoom: 7,
          pane: 'grid',
        },
      },
      choro: {
        data: {},
      },
      maps: {},
      coords: {
        lat: null,
        lng: null,
        zoom: null,
      },
      first_map: null,
      current_sector: 'canadagrid',
      hooks: {
        'maps.get_layer': Array(1000),
      },
      legend: {},
      chart: {
        object: null,
        series: null,
        legend: null,
        query: null,
        unit: null,
        download_url: null,
      },
      icons: {
        default: null,
        small: null,
      },
      debug: true,
    };

    this.options = $.extend(true, defaults, options);

    this.item = $(item);
    this.init();
  }

  cdc_app.prototype = {
    // init

    init: function () {
      let plugin = this,
        item = plugin.item,
        options = plugin.options;

      //
      // INITIALIZE
      //

      if (options.debug == true) {
        console.log('cdc', 'init');
      }

      options.lang = options.globals.current_lang_code;

      //
      // MAP
      //

      options.icons.default = L.icon({
        iconUrl: '/site/assets/themes/fw-child/resources/img/marker-icon.png',
        shadowUrl:
          '/site/assets/themes/fw-child/resources/img/marker-shadow.png',
        iconSize: [32, 40],
        shadowSize: [32, 40],
        iconAnchor: [10, 40],
        shadowAnchor: [10, 40],
        popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
      });

      options.icons.small = L.icon({
        iconUrl:
          '/site/assets/themes/fw-child/resources/img/marker-sm-icon.png',
        shadowUrl:
          '/site/assets/themes/fw-child/resources/img/marker-sm-shadow.png',
        iconSize: [16, 20],
        shadowSize: [16, 20],
        iconAnchor: [5, 20],
        shadowAnchor: [5, 20],
        popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
      });

      //
      // TABS
      //

      // $('#control-bar').tab_drawer();

      //
      // EVENTS
      //

      // MAP CONTROLS

      // zoom

      item.on('click', '.map-zoom-btn', function (e) {
        // get the first visible map object

        let first_map = null;

        for (let key in options.maps) {
          if (first_map == null && options.maps[key].container.is(':visible')) {
            first_map = options.maps[key];
          }
        }

        let current_zoom = first_map.object.getZoom(),
          new_zoom = current_zoom + 1;

        if ($(this).hasClass('zoom-out')) {
          new_zoom = current_zoom - 1;
        }

        first_map.object.setZoom(new_zoom);
      });

      //
      // MISC INTERACTIONS
      //

      // toggle conditional form elements

      plugin.toggle_conditionals();

      $('body').on('change', '.conditional-trigger :input', function () {
        plugin.toggle_conditionals();
      });
    },

    set_option: function (opt_name, opt_val) {
      this.options[opt_name] = opt_val;
      // console.log(this.options);
      // console.log(this.options[opt_name]);
    },

    add_hook: function (hook_name, priority, obj, hook_function) {
      this.options.hooks[hook_name][priority] = { obj: obj, fn: hook_function };
    },

    maps: {
      init: function (maps, legend, callback) {
        let plugin = !this.item ? this.data('cdc_app') : this,
          options = plugin.options;

        // console.log('cdc', 'init maps', maps);

        options.maps = maps;
        options.legend = legend;

        for (let key in options.maps) {
          // create the map

          options.maps[key].object = L.map('map-object-' + key, {
            center: [canadaCenter[0], canadaCenter[1]],
            zoomControl: false,
            zoom: 4,
            minZoom: 3,
            maxZoom: 11,
          });

          options.maps[key].container = $('#map-object-' + key);

          let this_map = options.maps[key],
            this_object = this_map.object;

          // panes

          this_object.createPane('basemap');
          this_object.getPane('basemap').style.zIndex = 399;
          this_object.getPane('basemap').style.pointerEvents = 'none';

          this_object.createPane('raster');
          this_object.getPane('raster').style.zIndex = 400;
          this_object.getPane('raster').style.pointerEvents = 'none';

          this_object.createPane('grid');
          this_object.getPane('grid').style.zIndex = 499;
          this_object.getPane('grid').style.pointerEvents = 'all';

          this_object.createPane('labels');
          this_object.getPane('labels').style.zIndex = 550;
          this_object.getPane('labels').style.pointerEvents = 'none';

          this_object.createPane('stations');
          this_object.getPane('stations').style.zIndex = 600;
          this_object.getPane('stations').style.pointerEvents = 'all';

          // basemap
          L.tileLayer(
            '//cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png',
            {
              attribution: '',
              subdomains: 'abcd',
              pane: 'basemap',
              maxZoom: 12,
            },
          ).addTo(this_object);

          // labels

          L.tileLayer(
            '//{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png',
            {
              pane: 'labels',
            },
          ).addTo(this_object);

          // stations
          $.ajax({
            url: 'https://api.weather.gc.ca/collections/climate-stations/items?f=json&limit=10000&properties=STATION_NAME,STN_ID&startindex=0&HAS_NORMALS_DATA=Y',
            dataType: 'json',
            async: false,
            success: function (data) {
              options.station_data = data;
            },
          });

          options.maps[key].legend = L.control({ position: 'topright' });
        }

        // sync if multiple maps exist

        if (Object.keys(options.maps).length > 1) {
          for (let key in options.maps) {
            Object.keys(options.maps).forEach(function (map) {
              if (map != key)
                options.maps[key].object.sync(options.maps[map].object);
            });
          }
        }

        if (typeof callback == 'function') {
          callback(options.maps);
        }

        return options.maps;
      },

      // returns Geoserver layer name
      // sample result: CDC:cmip6-HXmax30-ys-ssp585-p50-ann-30year
      get_layer_name: function (query, scenario = 'high') {
        const dataset_details = DATASETS[query.dataset];
        let frequency_code = query.frequency;

        if (period_frequency_lut.hasOwnProperty(query.frequency)) {
          frequency_code = period_frequency_lut[query.frequency];
        }

        return (
          'CDC:' +
          dataset_details.layer_prefix +
          query.var +
          '-' +
          frequency_code +
          '-' +
          scenario_names[query.dataset][scenario]
            .replace(/[\W_]+/g, '')
            .toLowerCase() +
          '-p50-' +
          query.frequency +
          '-30year' +
          (query.delta == 'true' ? '-delta7100' : '')
        );
      },

      get_layer: function (query, var_data) {
        let plugin = !this.item ? this.data('cdc_app') : this,
          item = plugin.item,
          options = plugin.options;

        console.log('---');
        console.log('get layer');

        switch (query.sector) {
          case 'canadagrid':
          case 'canadagrid1deg':
          case 'era5landgrid':
            console.log('RASTER');

            plugin.maps.do_legend.apply(item, [
              query,
              var_data,
              function () {
                // get grid and raster

                // are we switching to raster from another sector

                let do_grid = false;

                if (query.sector != options.current_sector) {
                  // switching sectors so later
                  // we'll need to replace the grid layer
                  console.log(options.current_sector + ' > ' + query.sector);
                  do_grid = true;
                }

                for (let key in options.maps) {
                  // raster
                  let this_map = options.maps[key];

                  // remove stations layer
                  if (
                    this_map.layers.stations &&
                    this_map.object.hasLayer(this_map.layers.stations)
                  ) {
                    this_map.object.removeLayer(this_map.layers.stations);
                    this_map.object.removeLayer(this_map.layers.stations);
                  }

                  query.frequency = query.frequency
                    .toLowerCase()
                    .replaceAll('-', '');

                  // ys/ms/qsdec

                  // ann/spring/summer/

                  let frequency_name = query.frequency;

                  // if (query.frequency == 'ys') {
                  //   frequency_name = 'ann';
                  // } else if (query.frequency == 'ms') {
                  //   frequency_name = 'jan';
                  // } else {
                  //   frequency_name = 'summer';
                  // }

                  this_map.layer_name = plugin.maps.get_layer_name(query, key);

                  // console.log(this_map.layer_name);

                  let params = {
                    format: 'image/png',
                    transparent: true,
                    tiled: true,
                    version: query.dataset == 'cmip6' ? '1.3.0' : '1.1.1',
                    layers: this_map.layer_name,
                    TIME: parseInt(query.decade) + '-01-00T00:00:00Z',
                  };

                  if (var_data.slug == 'building_climate_zones') {
                    params.styles = 'CDC:building_climate_zones';
                  }

                  // apply hooks
                  options.hooks['maps.get_layer'].forEach(function (hook) {
                    hook.fn.apply(hook.obj, [query, params]);
                  });

                  if (
                    this_map.layers.raster &&
                    this_map.object.hasLayer(this_map.layers.raster)
                  ) {
                    // if any map parameters have changed
                    if (!_.isEqual(this_map.layers.raster.cdc_params, params)) {
                      // delete all parameters from layer before updating
                      // see: https://github.com/Leaflet/Leaflet/issues/3441
                      delete this_map.layers.raster.wmsParams.parameter;
                      this_map.layers.raster.setParams(params);
                      this_map.layers.raster.cdc_params = _.cloneDeep(params);
                    }
                  } else {
                    // create layer
                    let saved_params = _.cloneDeep(params);

                    // those three parameters must be specified at creation only
                    // otherwise, a bug in leaflet leaks them to the WMS requests
                    params.opacity = 1;
                    params.pane = 'raster';
                    params.bounds = options.canadaBounds;

                    this_map.layers.raster = L.tileLayer
                      .wms(geoserver_url + '/geoserver/ows?', params)
                      .addTo(this_map.object);
                    this_map.layers.raster.cdc_params = saved_params;
                  }

                  // grid

                  if (
                    this_map.layers.grid == undefined ||
                    !this_map.object.hasLayer(this_map.layers.grid)
                  ) {
                    // grid layer doesn't exist
                    do_grid = true;
                  }

                  if (
                    this_map.layers.grid != undefined &&
                    this_map.object.hasLayer(this_map.layers.grid) &&
                    do_grid == true
                  ) {
                    // grid layer does exist
                    // and needs to be removed

                    // console.log('remove choro');
                    this_map.object.removeLayer(this_map.layers.grid);
                  }

                  if (do_grid == true) {
                    // console.log('new grid layer');
                    let new_layer = L.vectorGrid.protobuf(
                      geoserver_url +
                        '/geoserver/gwc/service/tms/1.0.0/CDC:' +
                        query.sector +
                        '@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf',
                      options.grid.leaflet,
                    );

                    new_layer
                      .on('mouseover', function (e) {
                        $(document).trigger('map_item_mouseover', [e]);
                      })
                      .on('mouseout', function (e) {
                        $(document).trigger('map_item_mouseout', [e]);
                      })
                      .on('click', function (e) {
                        // pan map to clicked coords
                        // var offset = (map1.getSize().x * 0.5) - 100;
                        //
                        // map1.panTo([e.latlng.lat, e.latlng.lng], { animate: false }); // pan to center
                        // map1.panBy(new L.Point(offset, 0), { animate: false }); // pan by offset

                        $(document).trigger('map_item_select', [e]);
                      });

                    this_map.layers.grid = new_layer.addTo(this_map.object);
                  }

                  options.current_sector = query.sector;
                }
              },
            ]);

            break;
          case 'station':
            console.log('ADD STATIONS');

            Object.keys(options.maps).forEach(function (key) {
              let this_map = options.maps[key];

              // remove raster layer
              if (
                this_map.layers.raster &&
                this_map.object.hasLayer(this_map.layers.raster)
              ) {
                // console.log('raster layer exists');
                this_map.object.removeLayer(this_map.layers.raster);
                this_map.object.removeLayer(this_map.layers.grid);
              }

              // remove grid layer
              if (
                this_map.layers.grid &&
                this_map.object.hasLayer(this_map.layers.grid)
              ) {
                // console.log('raster layer exists');
                this_map.object.removeLayer(this_map.layers.grid);
                this_map.object.removeLayer(this_map.layers.grid);
              }

              if (
                this_map.layers.stations == undefined ||
                !this_map.object.hasLayer(this_map.layers.stations)
              ) {
                // console.log(key + " map doesn't have stations");
                this_map.layers.stations = L.geoJson(options.station_data, {
                  pointToLayer: function (feature, latlng) {
                    markerColor = '#e50e40';
                    return L.circleMarker(latlng, {
                      color: '#fff',
                      opacity: 1,
                      weight: 2,
                      pane: 'stations',
                      fillColor: '#f00',
                      fillOpacity: 1,
                      radius: 5,
                    });
                  },
                })
                  .on('mouseover', function (e) {
                    e.layer
                      .bindTooltip(e.layer.feature.properties.STATION_NAME)
                      .openTooltip(e.latlng);
                  })
                  .on('click', function (e) {});

                // console.log(this_map.layers.stations);

                this_map.layers.stations.addTo(this_map.object);
              }
            });

            break;
          default:
            // choropleth

            plugin.maps.do_legend.apply(item, [
              query,
              var_data,
              function () {
                Object.keys(options.maps).forEach(function (key) {
                  // console.log('key', key);

                  let this_map = options.maps[key];

                  let choro_path =
                    geoserver_url +
                    '/get-choro-values/' +
                    query.sector +
                    '/' +
                    query.var +
                    '/' +
                    scenario_names[query.dataset][key]
                      .replace(/[\W_]+/g, '')
                      .toLowerCase() +
                    '/' +
                    query.frequency +
                    '/?period=' +
                    (parseInt(query.decade) + 1) +
                    (query.delta == 'true' ? '&delta7100=true' : '') +
                    '&dataset_name=' +
                    query.dataset +
                    '&decimals=' +
                    var_data.acf.decimals;

                  // console.log('get choro data');

                  $.ajax({
                    url: choro_path,
                    dataType: 'json',
                    async: false,
                    success: function (data) {
                      options.choro.data[key] = data;
                      // console.log('done');
                    },
                  });

                  // remove raster layer
                  if (
                    options.maps[key].layers.raster &&
                    options.maps[key].object.hasLayer(
                      options.maps[key].layers.raster,
                    )
                  ) {
                    // console.log('raster layer exists');
                    options.maps[key].object.removeLayer(
                      this_map.layers.raster,
                    );
                    options.maps[key].object.removeLayer(this_map.layers.grid);
                  }

                  // remove stations layer
                  if (
                    this_map.layers.stations &&
                    this_map.object.hasLayer(this_map.layers.stations)
                  ) {
                    this_map.object.removeLayer(this_map.layers.stations);
                    this_map.object.removeLayer(this_map.layers.stations);
                  }

                  // are we swapping between sectors
                  if (options.current_sector != query.sector) {
                    console.log('change sector');

                    // sector has changed, remove the layer entirely

                    // remove the old layer
                    options.maps[key].object.removeLayer(
                      options.maps[key].layers.grid,
                    );
                  }

                  if (
                    options.maps[key].layers.grid != undefined &&
                    options.maps[key].object.hasLayer(
                      options.maps[key].layers.grid,
                    )
                  ) {
                    // same sector, but the grid layer already exists,
                    // so reset each feature

                    // todo: performance issue: resetFeatureStyle is called often when not required (ex: pan/zoom)
                    for (let i = 0; i < options.choro.data[key].length; i++) {
                      options.maps[key].layers.grid.resetFeatureStyle(i);
                    }
                  } else {
                    console.log('no existing layer');

                    options.grid.leaflet.vectorTileLayerStyles[query.sector] =
                      function (properties, zoom) {
                        return {
                          weight: 0.2,
                          color: 'white',
                          fillColor: plugin.maps.get_color.apply(item, [
                            options.choro.data[key][properties.id],
                          ]),
                          opacity: 0.5,
                          fill: true,
                          radius: 4,
                          fillOpacity: 1,
                        };
                      };

                    options.maps[key].layers.grid = L.vectorGrid
                      .protobuf(
                        geoserver_url +
                          '/geoserver/gwc/service/tms/1.0.0/CDC:' +
                          query.sector +
                          '/{z}/{x}/{-y}.pbf',
                        {
                          rendererFactory: L.canvas.tile,
                          interactive: true,
                          getFeatureId: function (f) {
                            return f.properties.id;
                          },
                          name: 'geojson',
                          pane: 'grid',
                          maxNativeZoom: 12,
                          bounds: options.canadaBounds,
                          maxZoom: 12,
                          minZoom: 3,
                          vectorTileLayerStyles:
                            options.grid.leaflet.vectorTileLayerStyles,
                        },
                      )
                      .on('mouseover', function (e) {
                        options.maps[key].layers.grid.setFeatureStyle(
                          e.layer.properties.id,
                          {
                            color: 'white',
                            fillColor: plugin.maps.get_color.apply(item, [
                              options.choro.data[key][e.layer.properties.id],
                            ]),
                            weight: 1.5,
                            fill: true,
                            radius: 4,
                            opacity: 1,
                            fillOpacity: 1,
                          },
                        );

                        e.target
                          .bindTooltip(
                            '<div>' +
                              e.layer.properties.label_en +
                              '<br>' +
                              options.choro.data[key][e.layer.properties.id] +
                              '</div>',
                            { sticky: true },
                          )
                          .openTooltip(e.latlng);
                      })
                      .on('mouseout', function (e) {
                        options.maps[key].layers.grid
                          .resetFeatureStyle(e.layer.properties.id)
                          .closeTooltip();
                      })
                      .on('click', function (e) {
                        $(document).trigger('map_item_select', e);
                      })

                      .addTo(options.maps[key].object);
                  }
                });

                // update current
                options.current_sector = query.sector;
              },
            ]);
        }
      },

      do_legend: function (query, var_data, callback = null) {
        let plugin = !this.item ? this.data('cdc_app') : this,
          item = plugin.item,
          options = plugin.options;

        const legend_item_height = 25,
          legend_item_width = 25,
          legend_width = 200,
          legend_tick_width = 4;

        // todo move this function if required elsewhere
        /**
         * Format numerical value according to supplied parameters
         * @param value Number to format
         * @param var_acf Variable details object provided by Wordpress
         * @param delta If true, the value is formatted as a delta
         * @returns {string} The formatted value
         */
        function value_formatter(value, var_acf, delta) {
          let unit = var_acf.units;
          if (unit === 'kelvin') {
            unit = '°C';
            value = delta ? value : value - 273.15;
          }

          if (unit === undefined) {
            unit = '';
          }
          let str = '';
          if (delta && value > 0) {
            str += '+';
          }

          switch (var_acf.units) {
            case 'doy':
              if (delta) {
                str += value.toFixed(var_acf.decimals);
                str += ' ' + l10n_labels['days'];
              } else {
                str += doy_formatter(value, options.lang);
              }

              break;
            default:
              str += value.toFixed(var_acf.decimals);
              str += ' ' + unit;
              break;
          }
          return unit_localize(str);
        }

        const colours = options.legend.colormap.colours,
          quantities = options.legend.colormap.quantities;

        for (let key in options.maps) {
          options.maps[key].legend.onAdd = function (map) {
            let div = L.DomUtil.create('div', 'info legend legendTable');

            let svg = `<svg width="${legend_width}" height="${
              legend_item_height * colours.length
            }">`;
            svg += `<g transform="translate(${
              legend_width - legend_item_width
            },0)">`;
            if (query.scheme_type == 'discrete') {
              for (let i = 0; i < colours.length; i++) {
                svg += `<rect width="${legend_item_width}" height="${
                  legend_item_height + 1
                }" y="${legend_item_height * i}" fill="${colours[i]}"/>`;
              }
            } else {
              svg += `<defs><linearGradient id="legendGradient" gradientTransform="rotate(90)">`;
              for (let i = 0; i < colours.length; i++) {
                svg += `<stop offset="${
                  (i / colours.length) * 100
                }%" stop-color="${colours[i]}"/>`;
              }
              svg += `</linearGradient> </defs>`;
              svg += `<rect width="${legend_item_width}" height="${
                legend_item_height * colours.length
              }" fill="url(#legendGradient)" />`;
            }
            svg += `</g><g transform="translate(${
              legend_width - legend_item_width - legend_tick_width
            },0)">`;
            for (let i = 0; i < colours.length - 1; i++) {
              svg += `<g opacity="1" transform="translate(0,${
                legend_item_height * (i + 1)
              })">
                    <line stroke="currentColor" x2="4"/>
                    <text fill="currentColor" dominant-baseline="middle" text-anchor="end" x="-5">
                    ${value_formatter(
                      quantities[i],
                      var_data.acf,
                      query.delta === 'true',
                    )}
                    </text></g>`;
            }

            svg += '</g>';
            svg += '</svg>';
            div.innerHTML = svg;
            return div;
          };

          options.maps[key].legend.addTo(options.maps[key].object);
        }

        if (typeof callback == 'function') {
          callback();
        }
      },

      get_color: function (d) {
        let plugin = !this.item ? this.data('cdc_app') : this,
          options = plugin.options;

        let i = indexOfGT(options.legend.colormap.quantities, d);
        switch (i) {
          case -1:
            // fallback case in case style/legend is wrong
            return 'rgba(0,0,0,0)';
          case 0:
            return options.legend.colormap.colours[0];
          default:
            if (options.legend.colormap.scheme_type === 'discrete') {
              return options.legend.colormap.colours[i];
            } else {
              return interpolate(
                options.legend.colormap.colours[i - 1],
                options.legend.colormap.colours[i],
                (d - options.legend.colormap.quantities[i - 1]) /
                  (options.legend.colormap.quantities[i] -
                    options.legend.colormap.quantities[i - 1]),
              );
            }
        }
      },

      invalidate_size: function () {
        let plugin = !this.item ? this.data('cdc_app') : this,
          options = plugin.options;

        for (let key in options.maps) {
          options.maps[key].object.invalidateSize();
        }
      },

      add_marker: function (location, callback = null) {
        let plugin = !this.item ? this.data('cdc_app') : this,
          item = plugin.item,
          options = plugin.options;

        let recent_list = item.find('#recent-locations'),
          popped = false;

        console.log('add marker', location.coords.join(','), location);

        // remove any existing 'active' class
        recent_list.find('.list-group-item').removeClass('active');

        if (
          recent_list.find('[data-coords="' + location.coords.join(',') + '"]')
            .length
        ) {
          // marker already exists

          // select the item

          let recent_item = recent_list.find(
            '[data-coords="' + location.coords.join(',') + '"]',
          );

          let marker_index = parseInt($(recent_item).attr('data-index'));

          let this_marker = options.grid.markers['low'][marker_index];

          recent_item.addClass('active');

          // swap markers

          for (let key in options.maps) {
            options.grid.markers[key].forEach(function (marker, i) {
              if (i == marker_index) {
                marker.setIcon(options.icons.default);
              } else {
                marker.setIcon(options.icons.small);
              }
            });
          }
        } else {
          // marker doesn't exist, add a new one

          for (let key in options.maps) {
            let new_marker = new L.Marker(location.coords, {
                icon: options.icons.default,
              }),
              popped_marker = null;

            if (options.grid.markers[key] == undefined) {
              options.grid.markers[key] = [];
            }

            // add new marker to beginning of array
            options.grid.markers[key].unshift(new_marker);

            if (options.grid.markers[key].length > 5) {
              // pop the last if there are more than 5
              popped_marker = options.grid.markers[key].pop();
              popped = true;

              options.maps[key].object.removeLayer(popped_marker);
            }

            new_marker
              .on('click', function (e) {
                $(document).trigger('click_marker', [e]);
              })
              .addTo(options.maps[key].object);
          }

          if (popped == true) {
            // remove last from recents
            recent_list.find('.list-group-item').last().remove();
          }

          // add location to recents

          recent_list.prepend(
            '<button class="list-group-item list-group-item-action active" data-location="' +
              location.geo_id +
              '" data-coords="' +
              location.coords.join(',') +
              '">' +
              location.title +
              '</button>',
          );

          recent_list.find('.list-group-item').each(function (i) {
            $(this).attr('data-index', i);
          });

          // swap markers

          for (let key in options.maps) {
            options.grid.markers[key].forEach(function (marker, i) {
              if (i != 0) {
                marker.setIcon(options.icons.small);
              }
            });
          }

          // pan
          // doesn't work as-is, come back later
          // let offset = options.maps['low'].object.getSize().x * 0.75;
          //
          // console.log('offset', offset);
          //
          // options.maps['low'].object
          //   .panTo(location.coords, { animate: false })
          //   .panBy(new L.Point(offset, 0), {
          //     animate: false,
          //   });

          if (typeof callback == 'function') {
            callback(data);
          }
        }
      },
    },

    query: {
      obj_to_url: function (query, do_history = 'push') {
        let plugin = !this.item ? this.data('cdc_app') : this,
          options = plugin.options;

        console.log('obj to url', do_history);

        let query_str = [];

        for (let key in query) {
          // console.log(key, options.query[key]);

          if (query.hasOwnProperty(key)) {
            query_str.push(
              key +
                '=' +
                (query[key] != '' ? encodeURIComponent(query[key]) : ''),
            );
          }
        }

        result =
          window.location.origin +
          window.location.pathname +
          '?' +
          query_str.join('&') +
          window.location.hash;

        // console.log('obj to url', result);

        if (do_history == 'push') {
          // console.log('cdc', 'push');

          if (pushes_since_input < 1) {
            pushes_since_input += 1;
            history.pushState({}, '', result);
          } else {
            history.replaceState({}, '', result);
          }
        } else if (do_history == 'replace') {
          // console.log('cdc', 'replace');
          history.replaceState({}, '', result);
        }

        return '?' + query_str.join('&');
      },

      url_to_obj: function (query, status, callback) {
        let plugin = !this.item ? this.data('cdc_app') : this,
          item = plugin.item,
          options = plugin.options;

        // console.log('cdc', 'url to obj', status);

        if (window.location.search != '') {
          console.log('convert', window.location.search);

          let url_query = JSON.parse(
            '{"' +
              window.location.search
                .substring(1)
                .replace(/&/g, '","')
                .replace(/=/g, '":"') +
              '"}',
            function (key, value) {
              let return_val = value;

              if (key != '') {
                return_val = decodeURIComponent(value);

                if (decodeURIComponent(value).includes(',')) {
                  return_val = decodeURIComponent(value).split(',');
                }
              }

              return return_val;
            },
          );

          // console.log(JSON.stringify(url_query, null, 4));
          // console.log(JSON.stringify(query, null, 4));

          query = { ...query, ...url_query };

          // force scenarios to be an array

          ['scenarios', 'percentiles', 'station'].forEach(function (key) {
            if (typeof query[key] == 'string') {
              query[key] = [query[key]];
            }
          });

          // console.log('merged query');
          // console.log(JSON.stringify(query, null, 4));
        }

        // set cdc_app's options.query too
        // options.query = { ...query };

        options.current_sector = query.sector;

        // console.log('the query');
        // console.log(JSON.stringify(options.query, null, 4));

        if (typeof callback == 'function') {
          callback(query);
        }

        return query;
      },

      update_value: function (query, fn_options) {
        let plugin = !this.item ? this.data('cdc_app') : this,
          options = plugin.options,
          item = plugin.item;

        // console.log('cdc', 'update_value', fn_options.key);

        // check for necessary parameters

        if (
          typeof fn_options == 'object' &&
          fn_options.hasOwnProperty('item') &&
          fn_options.hasOwnProperty('key') &&
          fn_options.hasOwnProperty('val')
        ) {
          // console.log(fn_options.key + ': ' + fn_options.val);

          if (Array.isArray(query[fn_options.key])) {
            // the existing query value is an array

            // console.log(fn_options.key, 'array');

            // reset it to []
            query[fn_options.key] = [];

            // now figure out how to repopulate it

            if (fn_options.item.is('[type="checkbox"]')) {
              // checkboxes

              fn_options.item
                .closest('.map-control-item')
                .find(
                  '[type="checkbox"][data-query-key="' + fn_options.key + '"]',
                )
                .each(function () {
                  // for each matching checkbox,
                  // push its value to the array
                  // if it's checked

                  // console.log($(this), $(this).prop('checked'));

                  if ($(this).prop('checked') == true) {
                    query[fn_options.key].push($(this).val());
                  }
                });
            } else if (fn_options.item.is('[type="text"]')) {
              fn_options.item
                .closest('.map-control-item')
                .find('[type="text"][data-query-key="' + fn_options.key + '"]')
                .each(function () {
                  query[fn_options.key].push($(this).val());
                });
            } else if (fn_options.item.is('select')) {
              // console.log('update select');
              // console.log(fn_options);

              query[fn_options.key] = fn_options.val;
            } else if (fn_options.key == 'coords') {
              query[fn_options.key] = fn_options.val.split(',');
            }
          } else {
            query[fn_options.key] = fn_options.val;
          }

          console.log('updated ' + fn_options.key, query[fn_options.key]);

          return query[fn_options.key];

          // evaluate
          // plugin.query.eval.apply(item, ['']);
        } else {
          console.warn('object missing key and/or value');
        }
      },

      eval: function (fn_options) {
        let plugin = !this.item ? this.data('cdc_app') : this;
        let options = plugin.options,
          item = plugin.item;

        let settings = $.extend(
          true,
          {
            query: null,
            do_history: 'push',
            callback: null,
          },
          fn_options,
        );

        // sync options.query
        // options.query = { ...query };

        console.log('eval', settings.query);

        if (typeof settings.callback == 'function') {
          settings.callback();
        }

        return plugin.query.obj_to_url.apply(item, [
          settings.query,
          settings.do_history,
        ]);
      },
    },

    charts: {
      render: function (fn_options) {
        // recreation of v1 displayChartData()

        let plugin = !this.item ? this.data('cdc_app') : this;
        let options = plugin.options,
          item = plugin.item;

        let settings = $.extend(
          true,
          {
            data: null,
            var_data: null,
            query: null,
            container: null,
            object: null,
          },
          fn_options,
        );

        settings.object = $(settings.container).find('.chart-object')[0];

        console.log('CHART TIME');

        let var_fields = settings.var_data.acf;

        // if kelvin use ºC?
        options.chart.unit =
          var_fields.units === 'kelvin' ? '°C' : UNITS[var_fields.units];

        // deep clone query object
        options.chart.query = { ...settings.query };

        options.chart.data = settings.data;

        //
        options.chart.download_url =
          geoserver_url +
          '/download-30y/' +
          settings.coords.lat +
          '/' +
          settings.coords.lng +
          '/' +
          options.chart.query.var +
          '/' +
          options.chart.query.frequency +
          '?decimals=' +
          settings.var_data.acf.decimals +
          '&dataset_name=' +
          options.chart.query.dataset;

        let scenarios = DATASETS[options.chart.query.dataset].scenarios;
        let pointFormatter, labelFormatter;

        // more to this to add later
        labelFormatter = function () {
          return (
            this.axis.defaultLabelFormatter.call(this) +
            ' ' +
            options.chart.unit
          );
        };

        // reset the series array
        options.chart.series = [];

        if (settings.data.observations.length > 0) {
          options.chart.series.push({
            name: chart_labels.observation,
            data: settings.data.observations,
            zIndex: 1,
            showInNavigator: true,
            color: '#F47D23',
            visible: false,
            marker: {
              fillColor: '#F47D23',
              lineWidth: 0,
              radius: 0,
              lineColor: '#F47D23',
            },
          });
        }

        if (settings.data.modeled_historical_median.length > 0) {
          options.chart.series.push({
            name: chart_labels.historical,
            data: settings.data.modeled_historical_median,
            zIndex: 1,
            showInNavigator: true,
            color: '#000000',
            marker: {
              fillColor: '#000000',
              lineWidth: 0,
              radius: 0,
              lineColor: '#000000',
            },
          });
        }

        if (settings.data.modeled_historical_range.length > 0)
          options.chart.series.push({
            name: chart_labels.historical_range,
            data: settings.data.modeled_historical_range,
            type: 'arearange',
            lineWidth: 0,
            linkedTo: ':previous',
            color: '#000000',
            fillOpacity: 0.2,
            zIndex: 0,
            marker: {
              radius: 0,
              enabled: false,
            },
          });

        scenarios.forEach(function (scenario) {
          if (settings.data['{0}_median'.format(scenario.name)].length > 0) {
            options.chart.series.push({
              name: T('{0} Median').format(scenario.label),
              data: settings.data['{0}_median'.format(scenario.name)],
              zIndex: 1,
              showInNavigator: true,
              color: scenario.chart_color,
              marker: {
                fillColor: scenario.chart_color,
                lineWidth: 0,
                radius: 0,
                lineColor: scenario.chart_color,
              },
            });
          }

          if (settings.data['{0}_range'.format(scenario.name)].length > 0) {
            options.chart.series.push({
              name: T('{0} Range').format(scenario.label),
              data: settings.data['{0}_range'.format(scenario.name)],
              type: 'arearange',
              lineWidth: 0,
              linkedTo: ':previous',
              color: scenario.chart_color,
              fillOpacity: 0.2,
              zIndex: 0,
              marker: {
                radius: 0,
                enabled: false,
              },
            });
          }
        });

        // render the chart

        if (options.chart.series.length == 0) {
          settings.container.innerHTML =
            '<span class="text-primary text-center"><h1>' +
            'No data available for selected location' +
            '</h1></span>';
        } else {
          // console.log('render');
          // console.log(settings.object);
          // console.log('chart series', options.chart.series);

          options.chart.object = Highcharts.stockChart(settings.object, {
            chart: {
              numberFormatter: function (num) {
                return Highcharts.numberFormat(num, var_fields.decimals);
              },
            },
            title: {
              text: '',
            },
            subtitle: {
              align: 'left',
              text: '' /*
                document.ontouchstart === undefined
                  ? chart_labels.click_to_zoom
                  : 'Pinch the chart to zoom in',*/,
            },
            xAxis: {
              type: 'datetime',
            },
            yAxis: {
              title: {
                text: '',
              },
              labels: {
                align: 'left',
                formatter: labelFormatter,
              },
            },
            legend: {
              enabled: false,
            },
            rangeSelector: {
              enabled: false,
            },
            tooltip: {
              pointFormatter: pointFormatter,
              valueDecimals: var_fields.decimals,
              valueSuffix: ' ' + options.chart.unit,
            },
            navigation: {
              buttonOptions: {
                enabled: false,
              },
            },
            exporting: {
              csv: {
                dateFormat: '%Y-%m-%d',
              },
              chartOptions: {
                title: {
                  text:
                    options.lang != 'en'
                      ? settings.var_data.meta['title_' + options.lang]
                      : settings.var_data.title.rendered,
                },
                yAxis: {
                  title:
                    options.lang != 'en'
                      ? settings.var_data.meta['title_' + options.lang]
                      : settings.var_data.title.rendered,
                },
                legend: {
                  enabled: true,
                },
              },
            },
            series: options.chart.series,
          });

          if (options.chart.query.building_climate_zones) {
            // add climate zone colour bands

            const colorTransparency = 0.3;

            options.chart.object.update({
              yAxis: {
                gridLineWidth: 0,
              },
            });
            options.chart.object.yAxis[0].addPlotBand({
              from: 2000,
              to: 2999,
              color: 'rgba(201, 0, 0, ' + colorTransparency.toString() + ')',
              label: { text: unit_localize('Climate Zone 4') },
            });
            options.chart.object.yAxis[0].addPlotBand({
              from: 3000,
              to: 3999,
              color: 'rgba(250, 238, 2, ' + colorTransparency.toString() + ')',
              label: { text: unit_localize('Climate Zone 5') },
            });
            options.chart.object.yAxis[0].addPlotBand({
              from: 4000,
              to: 4999,
              color: 'rgba(0, 201, 54, ' + colorTransparency.toString() + ')',
              label: { text: unit_localize('Climate Zone 6') },
            });
            options.chart.object.yAxis[0].addPlotBand({
              from: 5000,
              to: 5999,
              color: 'rgba(0, 131, 201, ' + colorTransparency.toString() + ')',
              label: { text: unit_localize('Climate Zone 7A') },
            });
            options.chart.object.yAxis[0].addPlotBand({
              from: 6000,
              to: 6999,
              color: 'rgba(20, 0, 201, ' + colorTransparency.toString() + ')',
              label: { text: unit_localize('Climate Zone 7B') },
            });
            options.chart.object.yAxis[0].addPlotBand({
              from: 7000,
              to: 99999,
              color: 'rgba(127, 0, 201, ' + colorTransparency.toString() + ')',
              label: { text: unit_localize('Climate Zone 8') },
            });
          }

          plugin.charts.do_legend.apply(item, []);
        }
      },

      do_legend: function () {
        let plugin = !this.item ? this.data('cdc_app') : this;
        let options = plugin.options,
          item = plugin.item;

        options.chart.legend = item.find('#chart-series-items');

        // clone the row markup
        let legend_item = options.chart.legend.find('.row').clone();
        legend_item = legend_item[0];

        let row_markup = legend_item.outerHTML;

        options.chart.series.forEach(function (series, i) {
          // console.log('new row', series);

          let new_row = $(row_markup.replaceAll('row-X', 'row-' + i));

          if (series.visible == false) {
            new_row.find('[type="checkbox"]').prop('checked', false);
          }

          new_row
            .addClass('cloned')
            .attr('data-series', i)
            .removeAttr('style')
            .appendTo(options.chart.legend)
            .find('.form-check-label')
            .text(series.name);
        });

        // opacity range slider
        options.chart.legend.on('input', '[type="range"]', function () {
          let this_series_i = parseInt(
            $(this).closest('.row').attr('data-series'),
          );

          options.chart.object.series[this_series_i].update({
            opacity: parseInt($(this).val()) / 100,
          });
        });

        // visibility

        options.chart.legend.on('change', '[type="checkbox"]', function () {
          let this_series_i = parseInt(
            $(this).closest('.row').attr('data-series'),
          );

          options.chart.object.series[this_series_i].update({
            visible: $(this).prop('checked') == true ? true : false,
          });
        });

        // for later: to set series states
        // when hovering/clicking a custom legend item
        // chart.series[0].setState('hover')
      },

      update_data: function (fn_options) {
        let plugin = !this.item ? this.data('cdc_app') : this;
        let options = plugin.options,
          item = plugin.item;

        let settings = $.extend(
          true,
          {
            input: {
              key: null,
              value: null,
            },
            var_data: null,
          },
          fn_options,
        );

        // more to this to add later
        function labelFormatter(a, b) {
          return (
            this.axis.defaultLabelFormatter.call(this) +
            ' ' +
            options.chart.unit
          );
        }

        let scenarios = DATASETS[options.chart.query.dataset].scenarios;

        // console.log('update', settings);

        // remove existing bands
        options.chart.object.xAxis[0].removePlotBand('30y-plot-band');
        options.chart.object.xAxis[0].removePlotBand('delta-plot-band');

        if (settings.input.key != null && settings.input.value != null) {
          switch (settings.input.key) {
            case 'values':
              // console.log('vals');

              switch (settings.input.value) {
                case 'annual':
                  options.chart.object.update({
                    tooltip: {
                      formatter: function (tooltip) {
                        // console.log(tooltip.defaultFormatter);
                        return tooltip.defaultFormatter.call(this, tooltip);
                      },
                    },
                    plotOptions: {
                      series: {
                        states: {
                          hover: {
                            enabled: true,
                          },
                          inactive: {
                            enabled: true,
                          },
                        },
                      },
                    },
                  });
                  break;

                case '30y':
                  options.chart.object.update({
                    xAxis: {
                      crosshair: false,
                    },
                    plotOptions: {
                      series: {
                        states: {
                          hover: {
                            enabled: false,
                          },
                          inactive: {
                            enabled: false,
                          },
                        },
                      },
                    },
                    tooltip: {
                      formatter: function (tooltip) {
                        // console.log(tooltip.defaultFormatter);

                        // remove existing plot band every time
                        options.chart.object.xAxis[0].removePlotBand(
                          '30y-plot-band',
                        );

                        let [decade, decade_ms] = formatDecade(
                          this.x,
                          options.chart.query.frequency,
                        );

                        options.chart.object.xAxis[0].addPlotBand({
                          from: Date.UTC(decade, 0, 1),
                          to: Date.UTC(decade + 29, 11, 31),
                          id: '30y-plot-band',
                        });

                        this.chart = tooltip.chart;
                        this.axis = tooltip.chart.yAxis[0];
                        let val1, val2;

                        let tip = [
                          '<span style="font-size: 10px">' +
                            options.chart.query.decade +
                            '-' +
                            (options.chart.query.decade + 29) +
                            '</span><br/>',
                        ];

                        if (
                          decade_ms in options.chart.data['30y_observations']
                        ) {
                          this.value =
                            options.chart.data['30y_observations'][
                              decade_ms
                            ][0];

                          val1 =
                            tooltip.chart.yAxis[0].labelFormatter.call(this);

                          tip.push(
                            '<span style="color:#F47D23">●</span> ' +
                              chart_labels.observation +
                              ' <b>' +
                              val1 +
                              '</b><br/>',
                          );
                        }

                        scenarios.forEach(function (scenario) {
                          this.value =
                            options.chart.data[
                              '30y_{0}_median'.format(scenario.name)
                            ][decade_ms][0];

                          val1 = tooltip.defaultFormatter.call(this, tooltip);
                          // tooltip.chart.yAxis[0].labelFormatter.call(this);

                          tip.push(
                            '<span style="color:{0}">●</span> '.format(
                              scenario.chart_color,
                            ) +
                              T('{0} Median').format(scenario.label) +
                              ' <b>' +
                              val1 +
                              '</b><br/>',
                          );

                          this.value =
                            options.chart.data[
                              '30y_{0}_range'.format(scenario.name)
                            ][decade_ms][0];

                          val1 = tooltip.defaultFormatter.call(this, tooltip);
                          // val1 =
                          // tooltip.chart.yAxis[0].labelFormatter.call(this);

                          this.value =
                            options.chart.data[
                              '30y_{0}_range'.format(scenario.name)
                            ][decade_ms][1];

                          val2 = tooltip.defaultFormatter.call(this, tooltip);
                          // val2 =
                          // tooltip.chart.yAxis[0].labelFormatter.call(this);

                          tip.push(
                            '<span style="color:{0}">●</span> '.format(
                              scenario.chart_color,
                            ) +
                              T('{0} Range').format(scenario.label) +
                              ' <b>' +
                              val1 +
                              '</b>-<b>' +
                              val2 +
                              '</b><br/>',
                          );
                        }, this);

                        return tip;
                      },
                    },
                  });

                  break;

                case 'delta':
                  // add 1970-2000 band

                  console.log(options.chart.object.xAxis[0]);

                  options.chart.object.xAxis[0].addPlotBand({
                    from: Date.UTC(1971, 0, 1),
                    to: Date.UTC(2000, 11, 31),
                    color: 'rgba(51,63,80,0.05)',
                    id: 'delta-plot-band',
                  });

                  // update chart options
                  options.chart.object.update({
                    xAxis: {
                      crosshair: false,
                    },
                    plotOptions: {
                      series: {
                        states: {
                          hover: {
                            enabled: false,
                          },
                          inactive: {
                            enabled: false,
                          },
                        },
                      },
                    },
                    tooltip: {
                      formatter: function (tooltip) {
                        let [decade, decade_ms] = formatDecade(
                          this.x,
                          options.chart.query.frequency,
                        );
                        options.chart.object.xAxis[0].removePlotBand(
                          '30y-plot-band',
                        );
                        options.chart.object.xAxis[0].addPlotBand({
                          from: Date.UTC(decade, 0, 1),
                          to: Date.UTC(decade + 29, 11, 31),
                          id: '30y-plot-band',
                        });

                        function numformat(num) {
                          let str = '';
                          if (num > 0) {
                            str += '+';
                          }
                          str += Highcharts.numberFormat(
                            num,
                            settings.var_data.decimals,
                          );
                          switch (UNITS[settings.var_data.acf.units]) {
                            case 'day of the year':
                              str += ' ' + l10n_labels['days'];
                              break;
                            default:
                              str += ' ' + options.chart.unit;
                              break;
                          }
                          return str;
                        }

                        this.chart = tooltip.chart;
                        this.axis = tooltip.chart.yAxis[0];
                        let val1, val2;

                        let tip = [
                          '<span style="font-size: 10px">' +
                            decade +
                            '-' +
                            (decade + 29) +
                            ' ' +
                            chart_labels.change_from_1971_2000 +
                            '</span><br/>',
                        ];

                        scenarios.forEach(function (scenario) {
                          val1 = numformat(
                            options.chart.data[
                              'delta7100_{0}_median'.format(scenario.name)
                            ][decade_ms][0],
                          );

                          tip.push(
                            '<span style="color:{0}">●</span> '.format(
                              scenario.chart_color,
                            ) +
                              T('{0} Median').format(scenario.label) +
                              ' <b>' +
                              val1 +
                              '</b><br/>',
                          );

                          val1 = numformat(
                            options.chart.data[
                              'delta7100_{0}_range'.format(scenario.name)
                            ][decade_ms][0],
                          );

                          val2 = numformat(
                            options.chart.data[
                              'delta7100_{0}_range'.format(scenario.name)
                            ][decade_ms][1],
                          );

                          tip.push(
                            '<span style="color:{0}">●</span> '.format(
                              scenario.chart_color,
                            ) +
                              T('{0} Range').format(scenario.label) +
                              ' <b>' +
                              val1 +
                              '</b>-<b>' +
                              val2 +
                              '</b><br/>',
                          );
                        }, this);

                        return tip;
                      },
                    },
                  });

                  break;
              }

              break;
          }
        }
      },

      do_export: function (dl_type) {
        let plugin = !this.item ? this.data('cdc_app') : this;
        let options = plugin.options,
          item = plugin.item;

        switch (dl_type) {
          case 'print':
            options.chart.object.print();
            break;

          case 'csv':
            if (
              item.find('[data-chart-key="values"]:checked').val() == 'annual'
            ) {
              options.chart.object.downloadCSV();
            } else {
              window.location.href = options.chart.download_url;
            }
            break;

          default:
            options.chart.object.exportChart({
              type: dl_type,
            });
        }
      },
    },

    get_var_data: function (var_id, callback = null) {
      let plugin = !this.item ? this.data('cdc_app') : this;
      let options = plugin.options,
        item = plugin.item;

      let var_data;

      // console.log('get var', var_id);

      $.ajax({
        url: ajax_data.rest_url + 'wp/v2/variable/' + var_id,
        type: 'GET',
        dataType: 'json',
        async: false,
        beforeSend: function (xhr) {
          xhr.setRequestHeader('X-WP-Nonce', ajax_data.rest_nonce);
        },
        success: function (data) {
          console.log('wp-json var data', data);

          let var_title =
            options.lang != 'en' ? data.meta.title_fr : data.title.rendered;

          // update the control button

          item.find('.tab-drawer-trigger.var-name').text(var_title);

          if (typeof data.acf.var_names != 'undefined') {
            if (data.acf.var_names.length == 1) {
              // hide the threshold inputs
              item.find('#var-thresholds').hide();
            } else {
              item.find('#var-thresholds').show();
            }
          }

          // update var name in #location-detail

          item.find('#location-detail .variable-name').text(var_title);

          if (typeof callback == 'function') {
            callback(data);
          }
        },
      });
    },

    toggle_conditionals: function () {
      let plugin = !this.item ? this.data('cdc_app') : this;
      let options = plugin.options,
        item = plugin.item;

      let conditionals = [];

      item.find('[data-conditional]').each(function () {
        if ($(this).is('[type="radio"]')) {
          if ($(this).prop('checked') == true) {
            conditionals.push({
              items: $(this).attr('data-conditional').split(','),
              action: 'show',
            });
          } else {
            conditionals.push({
              items: $(this).attr('data-conditional').split(','),
              action: 'hide',
            });
          }
        }
      });

      conditionals.forEach(function (conditional) {
        conditional.items.forEach(function (item) {
          if ($(item).length) {
            if (conditional.action == 'show') {
              $(item).show();
            } else {
              $(item).hide();
            }
          }
        });
      });
    },
  };

  // jQuery plugin interface

  $.fn.cdc_app = function (opt) {
    var args = Array.prototype.slice.call(arguments, 1),
      result;

    const method_arr = function (key, obj = cdc_app.prototype) {
      obj = obj[key[0]];
      key.shift();
      if (key.length > 0) obj = method_arr(key, obj);
      return obj;
    };

    this.each(function () {
      var item = $(this);
      var instance = item.data('cdc_app');

      if (!instance) {
        // create plugin instance if not created
        item.data('cdc_app', new cdc_app(this, opt));
      } else {
        // otherwise check arguments for method call
        if (typeof opt === 'string') {
          let method = method_arr(opt.split('.'));

          if (method == undefined) {
            console.warn('cdc', 'method ' + opt + " doesn't exist");
            result = false;
          } else {
            result = method.apply(instance, args);
          }
        }
      }
    });

    return result;
  };
})(jQuery);
