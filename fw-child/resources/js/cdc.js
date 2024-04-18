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
        markers: {},
        highlighted: null,
        styles: {
          line: {
            default: {
              color: '#fff',
              weight: 0.5,
              opacity: 0.6,
            },
            hover: {
              color: '#fff',
              weight: 1,
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
        path: null,
        reset_features: false,
      },
      maps: {},
      station_data: null,
      idf_data: null,
      normals_data: null,
      ahccd_data: null,
      coords: {
        lat: null,
        lng: null,
        zoom: null,
      },
      first_map: null,
      current_sector: 'gridded_data',
      current_var: null,
      current_grid: null,
      hooks: {
        'maps.get_layer': Array(1000),
      },
      query: {},
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
        iconUrl: theme_data.child_theme_dir + '/resources/img/marker-icon.png',
        shadowUrl:
          theme_data.child_theme_dir + '/resources/img/marker-shadow.png',
        iconSize: [32, 40],
        shadowSize: [32, 40],
        iconAnchor: [10, 40],
        shadowAnchor: [10, 40],
        popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
      });

      options.icons.small = L.icon({
        iconUrl:
          theme_data.child_theme_dir + '/resources/img/marker-sm-icon.png',
        shadowUrl:
          theme_data.child_theme_dir + '/resources/img/marker-sm-shadow.png',
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

        let first_visible = item
            .find('.map-panel:not(.hidden)')
            .first()
            .attr('data-map-key'),
          first_map = options.maps[first_visible],
          current_zoom = first_map.object.getZoom(),
          new_zoom = current_zoom + 1;

        if ($(this).hasClass('zoom-out')) {
          new_zoom = current_zoom - 1;
        }

        first_map.object.setZoom(new_zoom);
      });

      // click map

      item.find('#map-objects').on('mouseup', function (e) {
        let first_visible = item
            .find('.map-panel:not(.hidden)')
            .first()
            .attr('data-map-key'),
          first_map = options.maps[first_visible];

        // if the map is zoomed out too far
        // to show the grid layer

        // conditions:
        // - sector = gridded
        // and one of:
        //   - select mode inputs exist and 'draw' is NOT checked
        //   - select mode inputs don't exist

        if (
          options.current_sector == 'gridded_data' &&
          ((item.find('#area-selection-draw').length &&
            item.find('#area-selection-draw').prop('checked') == false) ||
            !item.find('#area-selection-draw').length)
        ) {
          if (first_map.object.getZoom() < options.grid.leaflet.minZoom) {
            // show the zoom alert
            item.find('#zoom-alert').fadeIn(250, function () {
              setTimeout(function () {
                item.find('#zoom-alert').fadeOut(250);
              }, 2000);
            });
          }
        }
      });

      //
      // MISC INTERACTIONS
      //

      // toggle conditional form elements

      plugin.toggle_conditionals();

      $('body').on('change', '.conditional-trigger :input', function () {
        plugin.toggle_conditionals();
      });

      //

      // reset marker

      item.on('td_update_path', function (e, prev_id, current_id) {
        if (prev_id == '#location-detail') {
          for (let key in options.maps) {
            options.grid.markers[key].forEach(function (marker, i) {
              marker.setIcon(options.icons.small);
            });
          }
        }
      });
    },

    set_option: function (opt_name, opt_val) {
      this.options[opt_name] = opt_val;
      // console.log(this.options);
      // console.log(this.options[opt_name]);
    },

    get_option: function (opt_name) {
      console.log(this.options[opt_name]);
      if (this.options.hasOwnProperty(opt_name)) return this.options[opt_name];
    },

    add_hook: function (hook_name, priority, obj, hook_function) {
      this.options.hooks[hook_name][priority] = { obj: obj, fn: hook_function };
    },

    maps: {
      init: function (maps, legend, request, callback) {
        let plugin = !this.item ? this.data('cdc_app') : this,
          options = plugin.options;

        // console.log('cdc', 'init maps', maps);

        options.maps = maps;
        options.legend = legend;
        options.request = request;

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
          this_object.getPane('basemap').style.zIndex = 200;
          this_object.getPane('basemap').style.pointerEvents = 'none';

          this_object.createPane('raster');
          this_object.getPane('raster').style.zIndex = 300;
          this_object.getPane('raster').style.pointerEvents = 'none';

          this_object.createPane('grid');
          this_object.getPane('grid').style.zIndex = 350;
          this_object.getPane('grid').style.pointerEvents = 'all';

          this_object.createPane('labels');
          this_object.getPane('labels').style.zIndex = 360;
          this_object.getPane('labels').style.pointerEvents = 'none';

          this_object.createPane('stations');
          this_object.getPane('stations').style.zIndex = 370;
          this_object.getPane('stations').style.pointerEvents = 'all';

          this_object.createPane('custom_shapefile');
          this_object.getPane('custom_shapefile').style.zIndex = 700;
          this_object.getPane('custom_shapefile').style.pointerEvents = 'all';

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

        if (DATASETS.hasOwnProperty(query.dataset)) {
          let freq_lower = query.frequency.toLowerCase().replaceAll('-', '');

          // ann > ys
          let frequency_code1 = freq_lower;

          if (period_frequency_lut.hasOwnProperty(freq_lower)) {
            frequency_code1 = period_frequency_lut[freq_lower];
          }

          // ys > ann
          let frequency_code2 = freq_lower;

          freq_keys = Object.keys(period_frequency_lut);
          freq_vals = Object.values(period_frequency_lut);

          if (freq_vals.indexOf(freq_lower) !== -1) {
            frequency_code2 = freq_keys[freq_vals.indexOf(freq_lower)];
          }

          // console.log('get_layer_name', query);

          return (
            'CDC:' +
            dataset_details.layer_prefix +
            query.var +
            '-' +
            frequency_code1 +
            '-' +
            scenario_names[query.dataset][scenario]
              .replace(/[\W_]+/g, '')
              .toLowerCase() +
            '-p50-' +
            frequency_code2 +
            '-30year' +
            (query.delta == 'true' ? '-delta7100' : '')
          );
        } else {
          console.log('no layer name');
        }
      },

      get_layer: function (query, var_data, callback = null) {
        let plugin = !this.item ? this.data('cdc_app') : this,
          item = plugin.item,
          options = plugin.options;

        // console.log('---');
        // console.log('get layer', var_data, query);

        if (var_data == undefined || var_data == null) {
          return 'no variable';
        }

        // remove geoman bbox layer
        // if the layer is not gridded

        if (query.sector != 'gridded_data') {
          Object.keys(options.maps).forEach(function (key) {
            let this_map = options.maps[key];

            if (
              this_map.layers.bbox != undefined &&
              this_map.layers.bbox != null
            ) {
              // console.log(options.maps[key].object);

              if (this_map.object.hasLayer(this_map.layers.bbox)) {
                this_map.object.removeLayer(this_map.layers.bbox);
              }
            }
          });
        }

        if (
          options.request == null ||
          options.request.type == 'custom' ||
          options.request.type == 'ahccd' ||
          query.sector == 'station'
        ) {
          options.legend.display = false;
        } else {
          options.legend.display = true;
        }

        let first_map = options.maps[Object.keys(options.maps)[0]];

        // console.log('switch sector: ' + query.sector);

        switch (query.sector) {
          case 'gridded_data':
            console.log('RASTER');

            options.choro.path = null;

            plugin.maps.do_legend.apply(item, [
              query,
              var_data,
              function () {
                // get grid and raster

                // are we switching to raster from another sector

                let do_grid = null;

                if (query.sector != options.current_sector) {
                  // switching sectors so later
                  // we'll need to replace the grid layer

                  console.log(options.current_sector + ' > ' + query.sector);
                  do_grid = true;
                } else {
                  // sector hasn't changed
                  // if the maps have a bbox layer,
                  // don't replace the grid layer

                  for (let key in options.maps) {
                    if (options.maps[key].layers.hasOwnProperty('bbox')) {
                      do_grid = false;
                    }
                  }
                }

                if (options.current_grid != var_data.acf.grid) {
                  options.current_grid = var_data.acf.grid;
                  do_grid = true;
                }

                for (let key in options.maps) {
                  let this_map = options.maps[key];

                  // remove stations layer

                  if (
                    this_map.layers.station_clusters &&
                    this_map.object.hasLayer(this_map.layers.station_clusters)
                  ) {
                    this_map.object.removeLayer(
                      this_map.layers.station_clusters,
                    );
                  }

                  // generate layer name

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

                  // apply hooks
                  options.hooks['maps.get_layer'].forEach(function (hook) {
                    hook.fn.apply(hook.obj, [query, params]);
                  });

                  if (
                    this_map.layers.raster &&
                    this_map.object.hasLayer(this_map.layers.raster)
                  ) {
                    // map already has a raster layer
                    // if any map parameters have changed
                    if (
                      !window.lodash.isEqual(
                        this_map.layers.raster.cdc_params,
                        params,
                      )
                    ) {
                      // delete all parameters from layer before updating
                      // see: https://github.com/Leaflet/Leaflet/issues/3441
                      delete this_map.layers.raster.wmsParams.parameter;
                      this_map.layers.raster.setParams(params);

                      this_map.layers.raster.cdc_params =
                        window.lodash.cloneDeep(params);
                    }
                  } else {
                    // create layer

                    let saved_params = window.lodash.cloneDeep(params);

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
                    (this_map.layers.grid == undefined ||
                      !this_map.object.hasLayer(this_map.layers.grid)) &&
                    do_grid != false
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
                    this_map.object.removeLayer(this_map.layers.grid);
                  }

                  if (do_grid == true) {
                    // console.log('new grid layer', options.current_grid);

                    let new_layer = L.vectorGrid.protobuf(
                      geoserver_url +
                        '/geoserver/gwc/service/tms/1.0.0/CDC:' +
                        var_data.acf.grid +
                        '@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf',
                      options.grid.leaflet,
                    );

                    new_layer
                      .on('mouseover', function (e) {
                        $(document).trigger('map_item_mouseover', [
                          e,
                          e.layer.properties.gid,
                          {
                            fill: true,
                            fillOpacity: options.grid.styles.fill.hover.opacity,
                            fillColor: options.grid.styles.fill.hover.color,
                          },
                        ]);
                      })
                      .on('mouseout', function (e) {
                        $(document).trigger('map_item_mouseout', [
                          e,
                          e.layer.properties.gid,
                          {},
                        ]);
                      })
                      .on('click', function (e) {
                        $(document).trigger('map_item_select', [
                          e,
                          e.layer.properties.gid,
                          {},
                        ]);
                      });

                    this_map.layers.grid = new_layer.addTo(this_map.object);
                  }

                  options.current_sector = query.sector;
                  options.current_var = query.var;

                  if (typeof callback == 'function') {
                    console.log('get_layer callback');
                    callback();
                  }
                }
              },
            ]);

            break;
          case 'station':
            console.log('STATIONS');

            let do_stations = false,
              layer_data,
              marker_fill = query.var == 'climate-normals' ? '#f00' : '#00f';

            options.choro.path = null;

            // remove the legend
            for (let key in options.maps) {
              options.maps[key].object.removeControl(options.maps[key].legend);
            }

            let get_layer_data = function (query_var) {
              console.log('get data', query_var);

              // station data
              // https://api.weather.gc.ca/collections/climate-stations/items?f=json&limit=10000&properties=STATION_NAME,STN_ID,LATITUDE,LONGITUDE

              // idf
              // https://climatedata.ca/site/assets/themes/climate-data-ca/resources/app/run-frontend-sync/assets/json/idf_curves.json

              // ahccd
              // https://climatedata.ca/site/assets/themes/climate-data-ca/resources/app/ahccd/ahccd.json

              // normals
              // https://api.weather.gc.ca/collections/climate-stations/items?f=json&limit=10000&properties=CLIMATE_IDENTIFIER,STATION_NAME,STN_ID&startindex=0&HAS_NORMALS_DATA=Y

              switch (query_var) {
                case 'station-data':
                  if (options.station_data == null) {
                    // console.log('get stations');

                    return $.ajax({
                      url: 'https://api.weather.gc.ca/collections/climate-stations/items?f=json&limit=10000&properties=STATION_NAME,STN_ID,LATITUDE,LONGITUDE',
                      dataType: 'json',
                      success: function (data) {
                        options.station_data = data;
                        return { ...options.station_data };
                      },
                    });
                  } else {
                    return { ...options.station_data };
                  }

                  break;

                case 'idf':
                  if (options.idf_data == null) {
                    // idf data not yet loaded

                    return $.ajax({
                      url:
                        theme_data.child_theme_dir +
                        '/resources/app/idf_curves.json',
                      dataType: 'json',
                      success: function (data) {
                        options.idf_data = data;
                        return { ...options.idf_data };
                      },
                    });
                  } else {
                    return { ...options.idf_data };
                  }

                  break;

                case 'ahccd':
                  if (options.ahccd_data == null) {
                    // idf data not yet loaded

                    return $.ajax({
                      url:
                        theme_data.child_theme_dir +
                        '/resources/app/ahccd/ahccd.json',
                      dataType: 'json',
                      success: function (data) {
                        options.ahccd_data = data;
                        return { ...options.ahccd_data };
                      },
                    });
                  } else {
                    return { ...options.ahccd_data };
                  }

                  break;
                case 'climate-normals':
                  if (options.normals_data == null) {
                    // console.log('get stations');

                    return $.ajax({
                      url: 'https://api.weather.gc.ca/collections/climate-stations/items?f=json&limit=10000&properties=STATION_NAME,STN_ID&startindex=0&HAS_NORMALS_DATA=Y',
                      dataType: 'json',
                      success: function (data) {
                        options.normals_data = data;
                        return { ...options.normals_data };
                      },
                    });
                  } else {
                    return { ...options.normals_data };
                  }

                  break;
                default:
                  // stations are not defined by the variable

                  if (query.dataset == 'ahccd') {
                    if (options.ahccd_data == null) {
                      // we're doing an AHCCD analysis

                      // console.log('get AHCCD json now');

                      return $.ajax({
                        url:
                          theme_data.child_theme_dir +
                          '/resources/app/ahccd/ahccd.json',
                        dataType: 'json',
                        success: function (data) {
                          options.ahccd_data = data;
                          return { ...options.ahccd_data };
                        },
                      });
                    } else {
                      return { ...options.ahccd_data };
                    }
                  }

                  break;
              }
            };

            // get or load station data
            $.when(get_layer_data(query.var)).done(function (layer_data) {
              // console.log(layer_data);
              // console.log('ahccd', options.ahccd_data);
              // console.log('station', options.station_data);
              // console.log('idf', options.idf_data);

              let list_name = query.dataset == 'ahccd' ? 'ahccd' : query.var;

              if (item.find('#station-select').attr('data-list') != list_name) {
                // repopulate the stations select2 menu
                plugin.query.update_station_select.apply(item, [
                  query,
                  layer_data,
                ]);
              }

              if (
                query.dataset == 'ahccd' &&
                query.var == options.current_var
              ) {
                // variable hasn't changed
                do_stations = false;
              }

              if (
                first_map.layers.stations == undefined ||
                first_map.layers.stations == null ||
                query.var != options.current_var
              ) {
                // no station layer exists
                do_stations = true;
              }

              // each map
              Object.keys(options.maps).forEach(function (key) {
                console.log('map key', key);
                let this_map = options.maps[key];

                // remove raster layer
                if (
                  this_map.layers.raster &&
                  this_map.object.hasLayer(this_map.layers.raster)
                ) {
                  this_map.object.removeLayer(this_map.layers.raster);
                  this_map.object.removeLayer(this_map.layers.grid);
                }

                // remove grid layer
                if (
                  this_map.layers.grid &&
                  this_map.object.hasLayer(this_map.layers.grid)
                ) {
                  this_map.object.removeLayer(this_map.layers.grid);
                  this_map.object.removeLayer(this_map.layers.grid);
                }

                if (do_stations == true) {
                  if (
                    this_map.layers.station_clusters &&
                    this_map.layers.stations &&
                    this_map.object.hasLayer(this_map.layers.station_clusters)
                  ) {
                    this_map.object.removeLayer(
                      this_map.layers.station_clusters,
                    );
                  }

                  // console.log('create clusters');
                  this_map.layers.station_clusters = L.markerClusterGroup();

                  // create the layer

                  // console.log('create layer');
                  // console.log(layer_data);

                  this_map.layers.stations = L.geoJson(layer_data, {
                    pointToLayer: function (feature, latlng) {
                      if (query.var == 'ahccd' || query.dataset == 'ahccd') {
                        return new L.Marker(latlng, {
                          icon: ahccd_icons[feature.properties.type],
                        });
                      } else {
                        return L.circleMarker(latlng, {
                          color: '#fff',
                          opacity: 1,
                          weight: 2,
                          pane: 'stations',
                          fillColor: marker_fill,
                          fillOpacity: 1,
                          radius: 6,
                        });
                      }
                    },
                  })
                    .on('mouseover', function (e) {
                      let station_name =
                        query.var == 'climate-normals' ||
                        query.var == 'station-data'
                          ? e.layer.feature.properties.STATION_NAME
                          : e.layer.feature.properties.Name;

                      if (query.var == 'idf') {
                        station_name +=
                          ' (' + e.layer.feature.properties.Elevation_ + ')';
                      }

                      e.layer.bindTooltip(station_name).openTooltip(e.latlng);
                    })
                    .on('click', function (e) {
                      let station_id =
                        query.var == 'climate-normals' ||
                        query.var == 'station-data'
                          ? e.layer.feature.properties.STN_ID
                          : e.layer.feature.properties.ID;

                      let style_obj = {
                        color: marker_fill,
                        fillColor: '#fff',
                      };

                      if (query.var == 'ahccd' || query.dataset == 'ahccd') {
                        style_obj =
                          ahccd_icons[e.layer.feature.properties.type + 'r'];
                      }

                      $(document).trigger('map_station_select', [
                        e,
                        station_id,
                        style_obj,
                      ]);
                    });

                  this_map.layers.station_clusters.addLayer(
                    this_map.layers.stations,
                  );
                }

                // console.log('addlayer');
                // console.log(this_map.object);
                // console.log(this_map.layers.stations);
                // console.log(this_map.layers.station_clusters);

                this_map.object.addLayer(this_map.layers.station_clusters);
              });

              options.current_sector = query.sector;
              options.current_var = query.var;

              // apply hooks
              options.hooks['maps.get_layer'].forEach(function (hook) {
                hook.fn.apply(hook.obj, [query, null]);
              });
            });

            break;
          case 'upload':
            console.log('custom shapefile');

            Object.keys(options.maps).forEach(function (key) {
              let this_map = options.maps[key];

              // remove raster
              if (
                this_map.layers.raster &&
                this_map.object.hasLayer(this_map.layers.raster)
              ) {
                this_map.object.removeLayer(this_map.layers.raster);
                this_map.object.removeLayer(this_map.layers.grid);
              }

              // remove stations

              if (
                this_map.layers.station_clusters &&
                this_map.object.hasLayer(this_map.layers.station_clusters)
              ) {
                console.log('remove stations');
                this_map.object.removeLayer(this_map.layers.station_clusters);
              }

              // remove grid

              if (
                this_map.layers.grid &&
                this_map.object.hasLayer(this_map.layers.grid)
              ) {
                this_map.object.removeLayer(this_map.layers.grid);
              }
            });

            break;
          default:
            // choropleth

            console.log('CHORO');

            // console.log('delta', query.delta);
            // console.log(choro_path);

            let get_choro_data = function (query, scenario) {
              if (options.request != null && options.request.type == 'custom') {
                // blank sector grid
                // choro values not needed

                options.grid.leaflet.vectorTileLayerStyles[query.sector] =
                  function (properties, zoom) {
                    let style_obj = {
                      weight: 1,
                      color: '#444',
                      fillColor: 'transparent',
                      fill: true,
                      opacity: 0.5,
                      radius: 4,
                      fillOpacity: 1,
                    };

                    return style_obj;
                  };

                return null;
              } else {
                if (
                  first_map.layers.grid == undefined ||
                  first_map.object.hasLayer(first_map.layers.grid) ||
                  !window.lodash.isEqual(query, options.query)
                ) {
                  // grid layer doesn't exist yet
                  // or the query object has changed

                  // build the choro data path
                  // make sure we have the right frequency code
                  // i.e. ys/ann

                  let frequency_code = query.frequency
                    .toLowerCase()
                    .replaceAll('-', '');

                  freq_keys = Object.keys(period_frequency_lut);
                  freq_vals = Object.values(period_frequency_lut);

                  if (freq_vals.indexOf(frequency_code) !== -1) {
                    frequency_code =
                      freq_keys[freq_vals.indexOf(frequency_code)];
                  }

                  let choro_path =
                    geoserver_url +
                    '/get-choro-values/' +
                    query.sector +
                    '/' +
                    query.var +
                    '/' +
                    scenario_names[query.dataset][scenario]
                      .replace(/[\W_]+/g, '')
                      .toLowerCase() +
                    '/' +
                    frequency_code +
                    '/?period=' +
                    (parseInt(query.decade) + 1) +
                    (query.delta == 'true' ? '&delta7100=true' : '') +
                    '&dataset_name=' +
                    query.dataset +
                    '&decimals=' +
                    var_data.acf.decimals;

                  // get/update layer

                  options.choro.path = choro_path;

                  console.log('get data', choro_path);

                  return $.ajax({
                    url: choro_path,
                    dataType: 'json',
                    success: function (data) {
                      options.grid.leaflet.vectorTileLayerStyles[query.sector] =
                        function (properties, zoom) {
                          let style_obj = {
                            weight: 1,
                            color: '#fff',
                            fillColor: 'transparent',
                            opacity: 0.5,
                            fill: true,
                            radius: 4,
                            fillOpacity: 1,
                          };

                          if (properties.id) {
                            style_obj.fillColor = plugin.maps.get_color.apply(
                              item,
                              [data[properties.id]],
                            );
                          }

                          return style_obj;
                        };

                      console.log('got choro data');
                      return data;
                    },
                  });
                }
              }
            };

            let get_choro_legend = function (query_var) {
              if (options.legend.display == false) {
                // blank sector grid
                // choro values not needed

                return false;
              } else {
                plugin.maps.do_legend.apply(item, [
                  query,
                  var_data,
                  function () {
                    return true;
                  },
                ]);
              }
            };

            if (
              first_map.layers.grid == undefined ||
              first_map.object.hasLayer(first_map.layers.grid) ||
              !window.lodash.isEqual(query, options.query)
            ) {
              // grid layer doesn't exist yet
              // or the query object has changed

              $.when(get_choro_legend()).done(function (legend_data) {
                let remove_grid = false;

                if (options.current_sector != query.sector) {
                  // console.log('change sector');
                  remove_grid = true;
                  options.current_sector = query.sector;
                }

                if (options.current_var != query.var) {
                  // console.log('change var');
                  remove_grid = true;
                  options.current_var = query.var;
                }

                // each map
                Object.keys(options.maps).forEach(function (key) {
                  let this_map = options.maps[key];

                  $.when(get_choro_data(query, key)).done(
                    function (layer_data) {
                      // console.log(key, layer_data);

                      if (layer_data == null) {
                        options.choro.reset_features = true;

                        for (i = 0; i < options.choro.data[key]; i += 1) {
                          options.choro.data[key][i] = 0;
                        }
                      } else {
                        options.choro.reset_features = false;

                        // only update choro.data if
                        // get_layer_data returned something
                        // otherwise, keep the features
                        // and reset them
                        options.choro.data[key] = layer_data;
                      }

                      // get/update layer

                      // remove raster layer
                      if (
                        this_map.layers.raster &&
                        this_map.object.hasLayer(this_map.layers.raster)
                      ) {
                        this_map.object.removeLayer(this_map.layers.raster);
                        this_map.object.removeLayer(this_map.layers.grid);
                      }

                      // remove stations layer

                      if (
                        this_map.layers.station_clusters &&
                        this_map.object.hasLayer(
                          this_map.layers.station_clusters,
                        )
                      ) {
                        this_map.object.removeLayer(
                          this_map.layers.station_clusters,
                        );
                      }

                      // are we swapping between sectors

                      if (
                        remove_grid == true &&
                        this_map.layers.grid != undefined &&
                        this_map.object.hasLayer(this_map.layers.grid)
                      ) {
                        // sector or var has changed,
                        // remove the layer entirely
                        this_map.object.removeLayer(this_map.layers.grid);
                      }

                      if (
                        this_map.layers.grid != undefined &&
                        this_map.object.hasLayer(this_map.layers.grid)
                      ) {
                        // console.log('HAS LAYER');

                        // choro_path has changed and
                        // the grid layer already exists,
                        // so reset each feature

                        for (
                          let i = 0;
                          i < options.choro.data[key].length;
                          i++
                        ) {
                          let style_obj = {
                            weight: 1,
                            color: '#444',
                            opacity: 0.5,
                            fill: false,
                            radius: 4,
                            fillOpacity: 1,
                          };

                          if (options.choro.reset_features == true) {
                            options.choro.data[key][i] = 0;
                          } else {
                            style_obj.color = '#fff';
                            style_obj.fill = true;
                            style_obj.fillColor = plugin.maps.get_color.apply(
                              item,
                              [options.choro.data[key][i]],
                            );
                          }

                          options.maps[key].layers.grid.setFeatureStyle(
                            i,
                            style_obj,
                          );
                        }
                      } else {
                        // new layer

                        // console.log(layer_data);

                        // console.log('NEW LAYER');

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
                            let style_obj = {
                              weight: 1.5,
                              fill: false,
                              fillOpacity: 1,
                              fillColor: plugin.maps.get_color.apply(item, [
                                options.choro.data[key][e.layer.properties.id],
                              ]),
                            };

                            // console.log(options.choro.reset_features);

                            if (options.choro.reset_features == false) {
                              style_obj.fill = true;
                            }

                            $(document).trigger('map_item_mouseover', [
                              e,
                              e.layer.properties.id,
                              style_obj,
                            ]);
                          })
                          .on('mouseout', function (e) {
                            let style_obj = {
                              weight: 1.5,
                              fill: false,
                              fillOpacity: 1,
                              fillColor: plugin.maps.get_color.apply(item, [
                                options.choro.data[key][e.layer.properties.id],
                              ]),
                            };

                            if (options.choro.reset_features == false) {
                              style_obj.fill = true;
                            }

                            $(document).trigger('map_item_mouseout', [
                              e,
                              e.layer.properties.id,
                              style_obj,
                            ]);
                          })
                          .on('click', function (e) {
                            let style_obj = {
                              weight: 1.5,
                              fill: false,
                              fillOpacity: 1,
                              fillColor: plugin.maps.get_color.apply(item, [
                                options.choro.data[key][e.layer.properties.id],
                              ]),
                            };

                            // console.log(e);

                            if (options.choro.reset_features == false) {
                              // console.log(e.layer.properties.id);
                              // console.log(layer_data[e.layer.properties.id]);

                              style_obj.fill = true;
                            }

                            $(document).trigger('map_item_select', [
                              e,
                              e.layer.properties.id,
                              style_obj,
                            ]);
                          })
                          .addTo(this_map.object);
                      }
                    },
                  ); // when choro data
                }); // each map

                // apply hooks
                options.hooks['maps.get_layer'].forEach(function (hook) {
                  hook.fn.apply(hook.obj, [query, null]);
                });
              }); // when legend
            }
        } // switch
      },

      do_legend: function (query, var_data, callback = null) {
        let plugin = !this.item ? this.data('cdc_app') : this,
          item = plugin.item,
          options = plugin.options;

        if (options.legend.display == true) {
          console.log('do legend', query.var);

          const legend_item_height = 25,
            legend_item_width = 25,
            legend_width = 200,
            legend_tick_width = 4;

          const colours = options.legend.colormap.colours,
            quantities = options.legend.colormap.quantities,
            labels = options.legend.colormap.labels,
            categorical = options.legend.colormap.categorical,
            opacity = options.legend.opacity,
            label_offset = categorical ? legend_item_height / 2 : 0;

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
                  svg += `<rect class="legendbox" width="${legend_item_width}" height="${legend_item_height}"
                        y="${legend_item_height * i}" fill="${colours[i]}" style="fill-opacity: ${opacity}"/>`;
                }
              } else {
                svg += `<defs><linearGradient id="legendGradient" gradientTransform="rotate(90)">`;
                for (let i = 0; i < colours.length; i++) {
                  svg += `<stop offset="${
                    (i / colours.length) * 100
                  }%" stop-color="${colours[i]}"/>`;
                }
                svg += `</linearGradient> </defs>`;
                svg += `<rect class="legendbox" width="${legend_item_width}" height="${
                  legend_item_height * colours.length
                }" fill="url(#legendGradient)" style="fill-opacity: ${opacity}" />`;
              }

              svg += `</g><g transform="translate(${
                legend_width - legend_item_width - legend_tick_width
              },0)">`;

              for (let i = 0; i < colours.length - (categorical ? 0 : 1); i++) {
                let label;
                if (labels) {
                  label = unit_localize(labels[i], options.lang);
                } else {
                  label = value_formatter(
                    quantities[i],
                    var_data.acf,
                    query.delta === 'true',
                    options.lang,
                  );
                }

                svg += `<g opacity="1" transform="translate(0,${
                  legend_item_height * (i + 1) - label_offset
                })">
                        <line stroke="currentColor" x2="4"/>
                        <text fill="currentColor" dominant-baseline="middle" text-anchor="end" x="-5">
                        ${label}
                        </text></g>`;
              }

              svg += '</g>';
              svg += '</svg>';
              div.innerHTML = svg;
              return div;
            };

            options.maps[key].legend.addTo(options.maps[key].object);
          }
        }

        // item.find('.info.legend').show();

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

      update_recent: function (location, location_data, var_data) {
        let plugin = !this.item ? this.data('cdc_app') : this,
          item = plugin.item,
          options = plugin.options;

        let recent_list = item.find('#recent-locations');

        // console.log('add marker', location.coords.join(','), location);
        console.log('add recent', location, location_data);

        // remove any existing 'active' class
        recent_list.find('.list-group-item').removeClass('active');

        location.coords.forEach(function (coord, i) {
          // console.log(coord);
          location.coords[i] = parseFloat(coord).toFixed(4);
        });

        if (
          recent_list.find('[data-coords="' + location.coords.join(',') + '"]')
            .length
        ) {
          // marker already exists

          // select the item

          let recent_item = recent_list.find(
            '[data-coords="' + location.coords.join(',') + '"]',
          );

          recent_item.addClass('active');
        } else {
          if (recent_list.find('.list-group-item').length > 5) {
            // remove last from recents
            recent_list.find('.list-group-item').last().remove();
          }

          // add location to recents

          grid_id = '';

          if (location_data != null) {
            if (location_data.hasOwnProperty('layer')) {
              if (location_data.layer.hasOwnProperty('properties')) {
                if (location_data.layer.properties.gid) {
                  // gid
                  grid_id = location_data.layer.properties.gid;
                } else if (location_data.layer.properties.id) {
                  // id
                  grid_id = location_data.layer.properties.id;
                }
              } else if (location_data.layer.hasOwnProperty('feature')) {
                // STN_ID
                grid_id = location_data.layer.feature.properties.STN_ID;
              }
            }
          }

          let location_type = options.current_sector;

          switch (options.current_sector) {
            case 'gridded_data':
              location_type = T('Grid Point');
              break;
            case 'census':
              location_type = T('Census Subdivision');
              break;
            case 'health':
              location_type = T('Health Region');
              break;
          }

          let new_item = $(
            '<div class="list-group-item list-group-item-action active">',
          );

          console.log(JSON.stringify(options.query, null, 4));

          // item attributes
          new_item
            .attr('data-location', location.geo_id)
            .attr('data-coords', location.coords.join(','))
            .attr('data-var', options.query.var)
            .attr('data-sector', options.current_sector)
            .attr('data-grid-id', grid_id);

          new_item.data('query', { ...options.query });
          new_item.data('var_data', { ...var_data });

          // type
          $('<div class="location-type">' + location_type + '</div>').appendTo(
            new_item,
          );

          // title
          $('<div class="title">' + location.title + '</div>').appendTo(
            new_item,
          );

          // actions div

          let item_actions = $('<div class="item-actions">').appendTo(new_item);

          // view btn
          $('<span class="view">' + T('View location') + '</span>').appendTo(
            item_actions,
          );

          // clear btn
          $('<span class="clear">' + T('Remove pin') + '</span>').appendTo(
            item_actions,
          );

          recent_list.prepend(new_item);

          // reorder index attributes for the whole list
          recent_list.find('.list-group-item').each(function (i) {
            $(this).attr('data-index', i);
          });
        }

        item.find('#recent-locations-clear').show();
      },

      add_marker: function (location, location_data, callback = null) {
        let plugin = !this.item ? this.data('cdc_app') : this,
          item = plugin.item,
          options = plugin.options;

        let recent_list = item.find('#recent-locations');

        if (
          recent_list.find('[data-coords="' + location.coords.join(',') + '"]')
            .length
        ) {
          // marker already exists

          let recent_item = recent_list.find(
            '[data-coords="' + location.coords.join(',') + '"]',
          );

          let marker_index = parseInt($(recent_item).attr('data-index'));
          let this_marker = options.grid.markers['low'][marker_index];

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
              }).bindTooltip(location.title, {
                direction: 'top',
                offset: [0, -30],
              }),
              popped_marker = null;

            if (options.grid.markers[key] == undefined) {
              options.grid.markers[key] = [];
            }

            // add new marker to beginning of array
            options.grid.markers[key].unshift(new_marker);

            if (options.grid.markers[key].length >= 5) {
              // pop the last if there are more than 5
              popped_marker = options.grid.markers[key].pop();
              popped = true;

              options.maps[key].object.removeLayer(popped_marker);
            }

            new_marker
              .on('mouseover', function (e) {
                $(document).trigger('marker_mouseover', [e]);
              })
              .on('click', function (e) {
                $(document).trigger('click_marker', [e]);
              })
              .addTo(options.maps[key].object);
          }

          // swap active markers
          for (let key in options.maps) {
            options.grid.markers[key].forEach(function (marker, i) {
              if (i != 0) {
                marker.setIcon(options.icons.small);
              }
            });
          }

          if (typeof callback == 'function') {
            callback(data);
          }
        }
      },

      remove_marker: function (item_index) {
        let plugin = !this.item ? this.data('cdc_app') : this,
          options = plugin.options,
          item = plugin.item;

        // console.log('remove', item_index);

        let no_markers = true;

        // delete the item in the sidebar
        item.find('#recent-locations .list-group-item').eq(item_index).remove();

        for (let key in options.maps) {
          // remove from map
          options.maps[key].object.removeLayer(
            options.grid.markers[key][item_index],
            options.grid.markers[key][item_index],
          );

          // splice from the markers array
          options.grid.markers[key].splice(item_index, 1);

          if (options.grid.markers[key].length > 0) {
            no_markers = false;
          }
        }

        // reorder index attributes for the whole list
        item.find('#recent-locations .list-group-item').each(function (i) {
          $(this).attr('data-index', i);
        });

        if (no_markers == true) {
          item.find('#recent-locations-clear').hide();
        } else {
          item.find('#recent-locations-clear').show();
        }
      },

      remove_markers: function () {
        let plugin = !this.item ? this.data('cdc_app') : this,
          options = plugin.options,
          item = plugin.item;

        for (let key in options.maps) {
          for (i = options.grid.markers[key].length - 1; i >= 0; i -= 1) {
            plugin.maps.remove_marker.apply(item, [i]);
          }
        }
      },

      set_center: function (coords, zoom = null, do_offset = true) {
        let plugin = !this.item ? this.data('cdc_app') : this,
          options = plugin.options,
          item = plugin.item;

        let visible_maps = item.find('.map-panel:not(.hidden)'),
          first_map_key = visible_maps.first().attr('data-map-key'),
          map = options.maps[first_map_key].object,
          offset = 0;

        // console.log('cdc', 'set center');

        // zoom
        if (zoom == null) zoom = map.getZoom();

        map.setZoom(zoom);

        // console.log('pan to', coords);

        // pan to center
        map.panTo([coords.lat, coords.lng], { animate: false });

        if (typeof do_offset == 'integer') {
          offset = do_offset;
        } else if (do_offset == true) {
          switch (visible_maps.length) {
            case 3:
              offset = 0;
              break;
            case 2:
              offset = 0.1;
              break;
            default:
              offset = 0.25;
              break;
          }

          // console.log('offset', offset);

          // calculate pixel value for offset
          map_offset = map.getSize().x * offset;

          // console.log('pan by', map_offset);

          // pan by offset
          map.panBy(new L.Point(-map_offset, 0), { animate: false });
        }
      },
    },

    query: {
      obj_to_url: function (query, do_history = 'push') {
        let plugin = !this.item ? this.data('cdc_app') : this,
          options = plugin.options;

        console.log('obj to url', do_history);

        let query_str = [];

        // parameters to exclude
        let exclude_keys = ['bbox'];

        for (let key in query) {
          if (!exclude_keys.includes(key)) {
            // console.log(key, options.query[key]);

            if (query.hasOwnProperty(key)) {
              query_str.push(
                key +
                  '=' +
                  (query[key] != '' ? encodeURIComponent(query[key]) : ''),
              );
            }
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
            console.log('push', result);
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
          // console.log('convert', window.location.search);

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

                if (return_val.includes(',')) {
                  return_val = return_val.split(',');

                  return_val.forEach(function (el, i) {
                    if (!window.lodash.isNaN(window.lodash.toNumber(el))) {
                      // console.log(el + ' is number');
                      return_val[i] = parseFloat(el);
                    }
                  });
                }
              }

              return return_val;
            },
          );

          // console.log(JSON.stringify(url_query, null, 4));
          // console.log(JSON.stringify(query, null, 4));

          query = { ...query, ...url_query };

          // force scenarios to be an array

          ['scenarios', 'percentiles', 'station', 'selections', 'bbox'].forEach(
            function (key) {
              if (query.hasOwnProperty(key)) {
                if (query[key] == '') {
                  query[key] = [];
                } else if (typeof query[key] == 'string') {
                  query[key] = [query[key]];
                }
              }
            },
          );

          // console.log('merged query');
          // console.log(JSON.stringify(query, null, 4));
        }

        // set cdc_app's options.query too
        options.query = { ...query };

        // options.current_sector = query.sector;

        // console.log('the query');
        // console.log(JSON.stringify(options.query, null, 4));

        if (typeof callback == 'function') {
          callback(query);
        }

        return query;
      },

      update_value: function (query, fn_options, status) {
        let plugin = !this.item ? this.data('cdc_app') : this,
          options = plugin.options,
          item = plugin.item;

        console.log('cdc', 'update_value', fn_options);

        // check for necessary parameters

        if (
          typeof fn_options == 'object' &&
          fn_options.hasOwnProperty('item') &&
          fn_options.hasOwnProperty('key') &&
          fn_options.hasOwnProperty('val')
        ) {
          // console.log(fn_options.key + ': ' + fn_options.val);

          let new_val = null;

          if (Array.isArray(query[fn_options.key])) {
            // the existing query value is an array

            // console.log(fn_options.key, 'array');

            // reset it to []
            new_val = [];

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

                  if ($(this).prop('checked') == true) {
                    new_val.push($(this).val());
                  }
                });
            } else if (fn_options.item.is('[type="text"]')) {
              fn_options.item
                .closest('.map-control-item')
                .find('[type="text"][data-query-key="' + fn_options.key + '"]')
                .each(function () {
                  new_val.push($(this).val());
                });
            } else if (fn_options.item.is('select')) {
              // console.log('update select');
              // console.log(fn_options);

              new_val = fn_options.val;
            } else if (fn_options.key == 'coords' || fn_options.key == 'bbox') {
              new_val = fn_options.val.split(',').filter(function (i) {
                return i;
              });
            } else {
              new_val = fn_options.val;
            }
          } else {
            new_val = fn_options.val;
          }

          // console.log('updated ' + fn_options.key, query[fn_options.key]);

          query[fn_options.key] = new_val;
          options.query[fn_options.key] = new_val;

          return new_val;
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

      update_station_select: function (query, station_data) {
        let plugin = !this.item ? this.data('cdc_app') : this;
        let options = plugin.options,
          item = plugin.item;

        let list_name = query.dataset == 'ahccd' ? 'ahccd' : query.var;

        console.log('update stations', list_name);

        item.find('#station-select').empty().attr('data-list', list_name);

        let station_options = [];

        station_data.features.forEach(function (station) {
          if (query.var == 'climate-normals' || query.var == 'station-data') {
            station_options.push({
              id: station.properties.STN_ID,
              name: station.properties.STATION_NAME,
            });
          } else {
            station_options.push({
              id: station.properties.ID,
              name: station.properties.Name,
            });
          }
        });

        station_options.forEach(function (station) {
          let preselect = false;

          if (query.station.includes[station]) {
            console.log(query.station + ' includes ' + station);
            preselect = true;
          }

          let newOption = new Option(
            station.name,
            station.id,
            false,
            preselect,
          );

          item.find('#station-select').append(newOption);
        });
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

        console.log('CHART');

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
        let pointFormatter;

        // more to this to add later
        var labelFormatter = function () {
          return (
            this.axis.defaultLabelFormatter.call(this) +
            ' ' +
            options.chart.unit
          );
        };

        // reset the series array
        options.chart.series = [];

        if (settings.data.hasOwnProperty('observations')) {
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
        }

        if (settings.data.hasOwnProperty('modeled_historical_median')) {
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
        }

        if (settings.data.hasOwnProperty('modeled_historical_range')) {
          if (settings.data.modeled_historical_range.length > 0) {
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
          }
        }

        let decade_utc = Date.UTC(settings.query.decade),
          delta_utc = Date.UTC(parseInt(settings.query.decade) + 1),
          decade_vals = [],
          delta_vals = [];

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

          // console.log(
          //   settings.data['30y_{0}_median'.format(scenario.name)],
          //   settings.data['30y_{0}_median'.format(scenario.name)].length,
          // );

          // find the median values for the queried decade

          if (
            Object.keys(settings.data['30y_{0}_median'.format(scenario.name)])
              .length > 0
          ) {
            for (let timestamp in settings.data[
              '30y_{0}_median'.format(scenario.name)
            ]) {
              if (parseInt(timestamp) == delta_utc)
                decade_vals.push(
                  settings.data['30y_{0}_median'.format(scenario.name)][
                    timestamp
                  ],
                );
            }
          }

          // find the delta values for the queried decade

          if (
            Object.keys(
              settings.data['delta7100_{0}_median'.format(scenario.name)],
            ).length > 0
          ) {
            for (let timestamp in settings.data[
              'delta7100_{0}_median'.format(scenario.name)
            ]) {
              if (parseInt(timestamp) == delta_utc)
                delta_vals.push(
                  settings.data['delta7100_{0}_median'.format(scenario.name)][
                    timestamp
                  ],
                );
            }
          }
        });

        // console.log('decade', decade_vals);
        // console.log('delta', delta_vals);

        // change median header decade value
        item
          .find('#location-summary .location-value-median .decade')
          .text(
            parseInt(settings.query.decade) +
              1 +
              ' – ' +
              (parseInt(settings.query.decade) + 30),
          );

        item.find('#location-summary .value-table').empty();

        scenarios.forEach(function (scenario, i) {
          // new row
          let new_val_row = $(
            '<div class="row" data-scenario="' + scenario.name + '">',
          );

          // median value
          new_val_row.append(
            '<div class="col-3-of-7">' +
              decade_vals[i] +
              ' ' +
              options.chart.unit +
              '</div>',
          );

          // delta value
          let delta_icon = 'fa-caret-up text-primary',
            delta_label = T('higher');

          if (delta_vals[i] == 0) {
            delta_icon = 'fa-equals';
            delta_label = '';
          } else if (delta_vals[i] < 0) {
            delta_icon = 'fa-caret-down text-secondary';
            delta_label = T('lower');
            delta_vals[i] = Math.abs(delta_vals[i]);
          }

          new_val_row.append(
            '<div class="col"><i class="fas ' +
              delta_icon +
              ' me-3"></i>' +
              delta_vals[i] +
              ' ' +
              options.chart.unit +
              ' ' +
              delta_label +
              '</div>',
          );

          new_val_row.appendTo(item.find('#location-summary .value-table'));
        });

        item
          .find(
            '#location-val-scenarios .btn-check[value="' +
              settings.query.scenarios[0] +
              '"]',
          )
          .trigger('click');

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
              backgroundColor: 'transparent',
              style: {
                fontFamily: 'CDCSans',
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
              crosshairs: true,
              shared: true,
              split: false,
              padding: 4,
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

          plugin.charts.do_legend.apply(item, [settings]);
        }
      },

      render_station: function (fn_options) {
        let plugin = !this.item ? this.data('cdc_app') : this;
        let options = plugin.options,
          item = plugin.item;

        let settings = $.extend(
          true,
          {
            data: null,
            query: null,
            var_data: null,
            station: {},
            series_data: [
              {
                id: 1,
                key: 'daily_avg_temp',
                type: 'line',
                unit: '°C',
                color: '#000',
                tooltip: null,
                opacity: 1,
                zIndex: 4,
                yAxis: 0,
              },
              {
                id: 5,
                key: 'daily_max_temp',
                type: 'line',
                unit: '°C',
                color: '#f00',
                tooltip: null,
                opacity: 1,
                zIndex: 3,
                yAxis: 0,
              },
              {
                id: 8,
                key: 'daily_min_temp',
                type: 'line',
                unit: '°C',
                color: '#00f',
                tooltip: null,
                opacity: 1,
                zIndex: 2,
                yAxis: 0,
              },
              {
                id: 56,
                key: 'precipitation',
                type: 'column',
                unit: 'mm',
                color: '#0f0',
                opacity: 0.75,
                zIndex: 1,
                yAxis: 1,
                tooltip: {
                  valueSuffix: ' mm',
                },
              },
            ],
            download_url: null,
            container: null,
            object: null,
          },
          fn_options,
        );

        settings.object = $(settings.container).find('.chart-object')[0];

        // reset the series array
        options.chart.series = [];

        let chartUnit = ' °C';

        let allAJAX = settings.series_data.map((chart_series) => {
          // console.log('getting ' + chart_series.id);

          return $.getJSON(
            'https://api.weather.gc.ca/collections/climate-normals/items?f=json&STN_ID=' +
              settings.station.id +
              '&NORMAL_ID=' +
              chart_series.id +
              '&sortby=MONTH',
            function (data) {
              let timeSeries = [];

              $.each(data.features, function (k, v) {
                if (k < 12) {
                  timeSeries.push([month_names[k], v.properties.VALUE]);
                }
              });

              options.chart.series.push({
                name:
                  chart_labels[chart_series.key] +
                  ' (' +
                  chart_series.unit +
                  ')',
                data: timeSeries,
                showInNavigator: true,
                type: chart_series.type,
                color: chart_series.color,
                opacity: chart_series.opacity,
                tooltip: chart_series.tooltip,
                yAxis: chart_series.yAxis,
                zIndex: chart_series.zIndex,
                marker: {
                  fillColor: chart_series.color,
                  lineWidth: 0,
                  radius: 0,
                  opacity: chart_series.opacity,
                  lineColor: chart_series.color,
                },
              });
            },
          );
        });

        Promise.all(allAJAX).then(function () {
          // console.log('done ajax');

          // console.log('create chart', settings.object);
          // console.log('series', options.chart.series);

          options.chart.object = Highcharts.chart(settings.object, {
            title: {
              text: '',
              align: 'left',
            },
            subtitle: {
              align: 'left',
            },
            xAxis: {
              categories: month_names,
            },
            yAxis: [
              {
                lineWidth: 1,
                title: {
                  text: chart_labels.temperature + ' (°C)',
                },
              },
              {
                lineWidth: 1,
                opposite: true,
                title: {
                  text: chart_labels.precipitation + ' (mm)',
                },
              },
            ],
            legend: {
              enabled: false,
            },
            plotOptions: {
              series: {
                pointWidth: 20,
              },
            },
            tooltip: {
              valueSuffix: chartUnit,
            },
            exporting: {
              csv: {
                dateFormat: '%Y-%m-%d',
              },
              chartOptions: {
                title: {
                  text: T('Climate normals 1981–2010'),
                },
                subtitle: {
                  text: settings.station.name,
                },
                legend: {
                  enabled: true,
                },
              },
            },
            series: options.chart.series,
          });

          plugin.charts.do_legend.apply(item, [settings]);
        });
      },

      do_legend: function (settings) {
        let plugin = !this.item ? this.data('cdc_app') : this;
        let options = plugin.options,
          item = plugin.item;

        // console.log('chart legend', options.chart.series);

        if (settings.hasOwnProperty('station')) {
          options.chart.legend = item.find(
            '#station-chart-accordions .chart-series-items',
          );
        } else {
          options.chart.legend = item.find(
            '#location-chart-accordions .chart-series-items',
          );
        }

        // console.log(options.chart.legend);

        // clone the row markup
        let legend_item = options.chart.legend.find('.row').clone();
        legend_item = legend_item[0];

        let row_markup = legend_item.outerHTML;

        options.chart.series.forEach(function (series, i) {
          // console.log('new row', series);

          let new_row = $(row_markup.replaceAll('row-X', 'row-' + i));

          if (series.visible == false) {
            new_row
              .find('[type="checkbox"]')
              .prop('checked', false)
              .trigger('change');
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

        options.chart.legend
          .find('[type="checkbox"]')
          .on('change', function () {
            let this_series_i = parseInt(
              $(this).closest('.row').attr('data-series'),
            );

            options.chart.object.series[this_series_i].update({
              visible: $(this).prop('checked') == true ? true : false,
            });
          });

        // TODO: set series states
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
                      followPointer: true,
                      formatter: function (tooltip) {
                        let [decade, decade_ms] = formatDecade(
                          this.x,
                          options.chart.query.frequency,
                        );

                        // remove existing plot band
                        options.chart.object.xAxis[0].removePlotBand(
                          '30y-plot-band',
                        );

                        // add new plot band
                        options.chart.object.xAxis[0].addPlotBand({
                          from: Date.UTC(decade, 0, 1),
                          to: Date.UTC(decade + 29, 11, 31),
                          id: '30y-plot-band',
                        });

                        this.chart = tooltip.chart;
                        this.axis = tooltip.chart.yAxis[0];

                        let val1, val2;

                        let tip = [];

                        let decade_label =
                          '<span style="font-size: 0.75rem; font-weight: bold;">' +
                          decade +
                          ' – ' +
                          (decade + 29) +
                          '</span><br>';

                        tip.push(decade_label);

                        if (
                          decade_ms in options.chart.data['30y_observations']
                        ) {
                          this.value =
                            options.chart.data['30y_observations'][
                              decade_ms
                            ][0];

                          tip.push(
                            '<span style="color:#F47D23">●</span> ' +
                              chart_labels.observation +
                              ' <b>' +
                              this.value +
                              ' ' +
                              options.chart.unit +
                              '</b><br>',
                          );
                        }

                        scenarios.forEach(function (scenario) {
                          this.value =
                            options.chart.data[
                              '30y_{0}_median'.format(scenario.name)
                            ][decade_ms][0];

                          // console.log(scenario.name, this.value);

                          tip.push(
                            '<span style="color:{0};">●</span> '.format(
                              scenario.chart_color,
                            ) +
                              T('{0} Median').format(scenario.label) +
                              ' <b>' +
                              this.value +
                              ' ' +
                              options.chart.unit +
                              '</b><br>',
                          );

                          this.value =
                            options.chart.data[
                              '30y_{0}_range'.format(scenario.name)
                            ][decade_ms][0];

                          val1 = this.value;

                          this.value =
                            options.chart.data[
                              '30y_{0}_range'.format(scenario.name)
                            ][decade_ms][1];

                          val2 = this.value;

                          tip.push(
                            '<span style="color:{0}">●</span> '.format(
                              scenario.chart_color,
                            ) +
                              T('{0} Range').format(scenario.label) +
                              ' <b>' +
                              val1 +
                              ' – ' +
                              val2 +
                              ' ' +
                              options.chart.unit +
                              '</b><br>',
                          );
                        }, this);

                        return tip;
                      },
                    },
                  });

                  break;

                case 'delta':
                  // add 1970-2000 band

                  // console.log(options.chart.object.xAxis[0]);

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

                          val1 =
                            options.chart.data[
                              'delta7100_{0}_range'.format(scenario.name)
                            ][decade_ms][0];

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

          item.find('.tab-drawer-trigger .var-name').text(var_title);

          if (
            typeof data.acf.var_names != 'undefined' &&
            data.acf.var_names != null
          ) {
            if (data.acf.var_names.length == 1) {
              // hide the threshold inputs
              item.find('#var-thresholds').hide();
            } else {
              item.find('#var-thresholds').show();
            }
          }

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
