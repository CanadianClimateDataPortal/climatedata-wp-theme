// global CDC functions

(function ($) {
  function cdc_app(item, options) {
    // options

    var defaults = {
      globals: ajax_data.globals,
      lang: ajax_data.globals.lang,
      post_id: null,
      page_title: document.title,
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
            slrgrid: function (properties, zoom) {
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
      bdv_data: null,
      normals_data: null,
      ahccd_data: null,
      coords: {
        lat: null,
        lng: null,
        zoom: null,
      },
      first_map: null,
      current_sector: 'gridded_data',
      current_dataset: null,
      current_var: null,
      current_var_id: null,
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

      get_layer: function (query, var_data, request = null, callback = null) {
        let plugin = !this.item ? this.data('cdc_app') : this,
          item = plugin.item,
          options = plugin.options;

        console.log('spinner on');
        $('body').addClass('spinner-on');

        // console.log('---');
        // console.log('get layer', var_data, query);

        if (var_data == undefined || var_data == null) {
          console.log('spinner off');
          $('body').removeClass('spinner-on');

          return 'no variable';
        }

        if (request != null) {
          options.request = request;
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

        // Remove the AHCCD legend if not showing station data
        if (query.sector !== 'station') {
          for (let key in options.maps) {
            const map = options.maps[key];
            if (map.ahccd_legend) {
              map.object.removeControl(map.ahccd_legend);
            }
          }
        }

        if (options.page != 'map') {

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
        }

        let first_map = options.maps[Object.keys(options.maps)[0]];

        switch (query.sector) {
          case 'gridded_data':
            console.log('RASTER');

            options.choro.path = null;

            plugin.maps.do_legend.apply(item, [
              query,
              var_data,
              function () {
                console.log('did legend');
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

                  // Add/update the raster layer of the map
                  if (!this_map.no_raster) {
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
                        // console.log('UPDATE RASTER LAYER');

                        // Parameters that must be removed are not removed, so we remove them manually
                        // Issue: https://github.com/Leaflet/Leaflet/issues/3441
                        delete this_map.layers.raster.wmsParams.sld_body;
                        this_map.layers.raster.setParams(params);

                        this_map.layers.raster.cdc_params =
                          window.lodash.cloneDeep(params);
                      }
                    } else {
                      // create layer

                      let saved_params = window.lodash.cloneDeep(params);

                      // console.log('CREATE RASTER LAYER');

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
                          null,
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

                  if (typeof callback == 'function') {
                    console.log('get_layer callback');
                    callback();
                  }
                }
              },
            ]);

            break;
          case 'station':
            let is_ahccd = (request && request.type === 'ahccd') || query.var === 'ahccd';

            if (query.var === '') {
              is_ahccd = query.dataset === 'ahccd';
            }

            if (query.var_id === options.current_var_id && query.dataset === options.current_dataset) {
              // apply hooks
              options.hooks['maps.get_layer'].forEach(function (hook) {
                hook.fn.apply(hook.obj, [query, null]);
              });
              break;
            }

            const marker_fill = query.var == 'climate-normals' ? '#f00' : '#00f';

            options.choro.path = null;

            for (let key in options.maps) {
              const map = options.maps[key];
              // remove the legend
              map.object.removeControl(map.legend);

              // Remove the AHCCD legend
              if (map.ahccd_legend) {
                map.object.removeControl(map.ahccd_legend);
              }
            }

            // Show the AHCCD legend, if applicable
            if (is_ahccd) {
              for (let key in options.maps) {
                const map = options.maps[key];

                map.ahccd_legend = L.control({position: 'topright'});
                map.ahccd_legend.onAdd = function () {
                  let variable_types = var_data['acf']['ahccd_station_type'];

                  if (!variable_types.length) {
                    variable_types = ['P', 'T'];
                  }

                  const div = document.createElement('div');
                  div.className = 'ahccd_legend';
                  let innerHTML = ['<div class="title">' + T('Station\'s data') + '</div>'];

                  const values = {
                    'P': T('Precipitation only'),
                    'T': T('Temperature only'),
                    'B': T('Precipitation and temperature'),
                  }

                  for (let key of [...variable_types, 'B']) {
                    const label = values[key];
                    if (!label) {
                      continue;
                    }
                    innerHTML.push('<div class="entry"><img src="' + ahccd_icons[key].options.iconUrl + '"><span>');
                    innerHTML.push(label);
                    innerHTML.push('</span></div>');
                  }

                  div.innerHTML = innerHTML.join('');
                  return div;
                };

                map.ahccd_legend.addTo(map.object);
              }
            }

            // hide upload pane
            item.find('.leaflet-custom_shapefile-pane').hide();

            let get_layer_data = function (query_var) {
              console.log('get data', query_var);

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
                      error: function () {
                        $('body').removeClass('spinner-on');
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

                case 'bdv':
                  if (options.bdv_data == null) {
                    // bdv geojson not yet loaded

                    return $.ajax({
                      url:
                        `${geoserver_url}/fileserver/bdv/bdv.json`,
                      dataType: 'json',
                      success: function (data) {
                        options.bdv_data = data;
                        return { ...options.bdv_data };
                      },
                    });
                  } else {
                    return { ...options.bdv_data };
                  }

                  break;

                case 'ahccd':
                  if (options.ahccd_data == null) {
                    // ahccd data not yet loaded

                    return $.ajax({
                      url:
                        `${geoserver_url}/fileserver/ahccd/ahccd.json`,
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
                          `${geoserver_url}/fileserver/ahccd/ahccd.json`,
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
              // console.log('normals', options.normals_data);
              // console.log('idf', options.idf_data);

              let list_name = query.var;

              if (request && request.type === 'ahccd') {
                list_name = 'ahccd';
              } else if (list_name === '' && query.dataset === 'ahccd') {
                list_name = 'ahccd';
              }

              if (item.find('#station-select').attr('data-list') != list_name) {
                // repopulate the stations select2 menu
                plugin.query.update_station_select.apply(item, [
                  query,
                  layer_data,
                  list_name,
                ]);
              }

              // each map
              Object.keys(options.maps).forEach(function (key) {
                // console.log('map key', key);
                let this_map = options.maps[key];

                // remove raster layer
                if (
                  this_map.layers.raster &&
                  this_map.object.hasLayer(this_map.layers.raster)
                ) {
                  this_map.object.removeLayer(this_map.layers.raster);
                }

                // remove grid layer
                if (
                  this_map.layers.grid != undefined &&
                  this_map.layers.grid != null
                ) {
                  // console.log('grid layer exists');

                  if (this_map.object.hasLayer(this_map.layers.grid)) {
                    // console.log('map has layer');
                    this_map.object.removeLayer(this_map.layers.grid);
                    this_map.layers.grid = undefined;
                  }
                }

                // Remove stations
                if (this_map.layers.stations && this_map.object.hasLayer(this_map.layers.stations)) {
                  this_map.object.removeLayer(this_map.layers.station_clusters);
                }

                if (this_map.layers.station_clusters && this_map.object.hasLayer(this_map.layers.station_clusters)) {
                  this_map.object.removeLayer(this_map.layers.station_clusters);
                }

                this_map.layers.station_clusters = L.markerClusterGroup();

                if (!layer_data) {
                  return;
                }

                // create the layer

                const filtered_layer_data = {...layer_data};

                // If AHCCD, we keep only stations whose type matches the variable type(s)
                if (is_ahccd) {
                  const variable_types = var_data['acf']['ahccd_station_type'];

                  // If no type has been defined, we default to not filter any station
                  if (variable_types.length) {
                    filtered_layer_data.features = layer_data.features.filter(function (feature) {
                      const type = feature.properties.type;
                      return (type === 'B' || variable_types.includes(type));
                    });
                  }
                }

                this_map.layers.stations = L.geoJson(filtered_layer_data, {
                  pointToLayer: function (feature, latlng) {

                    if (is_ahccd) {
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
                    let station_name;
                    const feature_properties = e.layer.feature.properties;
                    switch(query.var) {
                      case 'climate-normals':
                        station_name = feature_properties.STATION_NAME;
                        break;
                      case 'station-data':
                        station_name = `${feature_properties.STATION_NAME} (${feature_properties.STN_ID})`;
                        break;
                      case 'idf':
                        station_name = `${feature_properties.Name} (${feature_properties.Elevation_})`;
                        break;
                      case 'bdv':
                        station_name = feature_properties.Location;
                        break;
                      default:
                        station_name = feature_properties.Name
                    }

                    e.layer.bindTooltip(station_name).openTooltip(e.latlng);
                  })
                  .on('click', function (e) {
                    let station_id = e.layer.feature.properties.ID;

                    if (query.var === 'climate-normals') {
                      station_id = e.layer.feature.id;
                    } else if (query.var === 'station-data') {
                      station_id = e.layer.feature.properties.STN_ID;
                    }

                    let style_obj = {
                      color: marker_fill,
                      fillColor: '#fff',
                    };

                    if (query.var === 'ahccd' || (request && request.type === 'ahccd')) {
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

                this_map.object.addLayer(this_map.layers.station_clusters);
              });

              // apply hooks
              options.hooks['maps.get_layer'].forEach(function (hook) {
                hook.fn.apply(hook.obj, [query, null]);
              });
            });

            break;
          case 'upload':
            console.log('custom shapefile');

            item.find('.leaflet-custom_shapefile-pane').show();

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

                console.log('custom');

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

                  // console.log('get data', choro_path);

                  return $.ajax({
                    url: choro_path,
                    dataType: 'json',
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
              !first_map.layers.grid ||
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
                }

                if (options.current_var != query.var) {
                  // console.log('change var');
                  remove_grid = true;
                }

                // each map
                Object.keys(options.maps).forEach(function (key) {
                  let this_map = options.maps[key];

                  $.when(get_choro_data(query, key)).done(
                    function (layer_data) {
                      // console.log(key, layer_data);

                      if (layer_data == null) {
                        options.choro.reset_features = true;

                        if (
                          options.choro.data.hasOwnProperty('key') &&
                          options.choro.data[key].length
                        ) {
                          for (i = 0; i < options.choro.data[key]; i += 1) {
                            options.choro.data[key][i] = 0;
                          }
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

                        // if (
                        //   layer_data != null ||
                        //   (options.choro.data.hasOwnProperty('key') &&
                        //     Array.isArray(options.choro.data[key]))
                        // ) {
                        //   console.log('HAS ARRAY');
                        // }

                        // if we have a grid layer
                        // AND a data array that we can work with

                        // choro_path has changed AND
                        // the grid layer already exists, AND
                        // fetched layer_data is not null,
                        // so reset each feature

                        if (layer_data != null) {
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

                              if ('selections' in query && query.selections.includes(String(i))) {
                                style_obj.weight = 1.5;
                                style_obj.color = '#f00';
                              }
                            }

                            options.maps[key].layers.grid.setFeatureStyle(
                              i,
                              style_obj,
                            );
                          }
                        }
                      } else {
                        // new layer

                        // console.log(layer_data);

                        // console.log('NEW LAYER');
                        let vectorTileLayerStyles = {};
                        vectorTileLayerStyles[query.sector] =
                          function (properties, zoom) {
                            let style_obj = {
                              weight: 1,
                              color: layer_data ? '#fff' : '#999',
                              fillColor: 'transparent',
                              opacity: 0.5,
                              fill: true,
                              radius: 4,
                              fillOpacity: 1,
                            };

                            if (layer_data && properties.id) {
                              style_obj.fillColor = plugin.maps.get_color.apply(
                                item,
                                [layer_data[properties.id]],
                              );
                            }

                            return style_obj;
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
                              vectorTileLayerStyles: vectorTileLayerStyles,
                            },
                          )
                          .on('mouseover', function (e) {
                            let style_obj = {
                              weight: 1.5,
                              fill: false,
                            };

                            if (options.choro.reset_features == false) {
                              style_obj.fill = true;
                              style_obj.fillColor = plugin.maps.get_color.apply(
                                item,
                                [
                                  options.choro.data[key][
                                    e.layer.properties.id
                                  ],
                                ],
                              );
                              style_obj.fillOpacity = 1;
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
                              color: '#fff',
                              fill: false,
                              opacity: 0.5,
                            };

                            if (options.choro.reset_features == false) {
                              style_obj.fill = true;
                              style_obj.fillOpacity = 1;
                              style_obj.fillColor = plugin.maps.get_color.apply(
                                item,
                                [
                                  options.choro.data[key][
                                    e.layer.properties.id
                                  ],
                                ],
                              );
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
                            };

                            if (options.choro.reset_features == false) {
                              style_obj.fill = true;
                              style_obj.fillOpacity = 1;
                              style_obj.fillColor = plugin.maps.get_color.apply(
                                item,
                                [
                                  options.choro.data[key][
                                    e.layer.properties.id
                                  ],
                                ],
                              );
                            }

                            $(document).trigger('map_item_select', [
                              e,
                              e.layer.properties.id,
                              style_obj,
                            ]);
                          })
                          .addTo(this_map.object);

                        // apply hooks
                        options.hooks['maps.get_layer'].forEach(
                          function (hook) {
                            hook.fn.apply(hook.obj, [query]);
                          },
                        );
                      }
                    },
                  ); // when choro data
                }); // each map
              }); // when legend
            }
        } // switch

        options.current_sector = query.sector;
        options.current_var = query.var;
        options.current_var_id = query.var_id;
        options.current_dataset = query.dataset;

        $('body').removeClass('spinner-on');
      },

      do_legend: function (query, var_data, callback = null) {
        let plugin = !this.item ? this.data('cdc_app') : this,
          options = plugin.options;

        if (options.legend.display) {
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

              if (query.scheme_type === 'discrete') {
                for (let i = 0; i < colours.length; i++) {
                  svg += `<rect class="legendbox" width="${legend_item_width}" height="${legend_item_height}"
                        y="${legend_item_height * i}" fill="${colours[colours.length - i - 1]}" style="fill-opacity: ${opacity}"/>`;
                }
              } else {
                svg += `<defs><linearGradient id="legendGradient" gradientTransform="rotate(90)">`;
                for (let i = 0; i < colours.length; i++) {
                  svg += `<stop offset="${
                    (i / colours.length) * 100
                  }%" stop-color="${colours[colours.length - i - 1]}"/>`;
                }
                svg += `</linearGradient> </defs>`;
                svg += `<rect class="legendbox" width="${legend_item_width}" height="${
                  legend_item_height * colours.length
                }" fill="url(#legendGradient)" style="fill-opacity: ${opacity}" />`;
              }

              svg += `</g><g transform="translate(${
                legend_width - legend_item_width - legend_tick_width
              },0)">`;

              /**
               * For each unique legend label, holds the indexed positions where it would be shown.
               *
               * For some variables, the number of decimals to show is fixed. In some cases, it would create a
               * legend with identical values. For example, the raw legend values are 1.0, 1.3, 1.7 and 2.0, but the
               * number of decimals is set to 0, it would thus create a legend with the repeated values: 1, 1, 2 and 2.
               *
               * This array contains one element for each **unique** label and an array of their indexed positions.
               * For the example above, it would thus be:
               *
               *  unique_labels = [
               *    {value: "1", positions: [0, 1]},
               *    {value: "2", positions: [2, 3]},
               *  ]
               *
               *  Later on, this array of unique labels and their positions is used to display a unique label correctly
               *  positioned.
               *
               * @type {{value: string, positions: Number[]}[]}
               */
              const unique_labels = []

              for (let i = 0; i < colours.length - (categorical ? 0 : 1); i++) {
                let label;
                if (labels) {
                  label = unit_localize(labels[labels.length - i - 1], options.lang);
                } else {
                  label = value_formatter(
                    quantities[colours.length - i - 2],
                    var_data.acf.units,
                    var_data.acf.decimals,
                    query.delta === 'true',
                    options.lang,
                  );
                }

                // Add the label and its position to the list of unique labels
                const last_label = unique_labels.length ? unique_labels[unique_labels.length - 1] : null;
                if (last_label && last_label.value === label) {
                  last_label.positions.push(i);
                } else {
                  unique_labels.push({value: label, positions: [i]});
                }
              }

              // Render the (unique) labels
              unique_labels.forEach(function (unique_label) {
                // For discrete schemes, show a unique label only at its first position
                let position = unique_label.positions[0];

                // For continuous schemes, show a unique label at its average position
                if (query.scheme_type === 'continuous') {
                  position = unique_label.positions.reduce(function (total, current) {
                    return total + current;
                  }, 0);
                  position /= unique_label.positions.length;
                }

                svg += `
                    <g opacity="1" transform="translate(0,${legend_item_height * (position + 1) - label_offset})">
                      <line stroke="currentColor" x2="4"/>
                      <text fill="currentColor" dominant-baseline="middle" text-anchor="end" x="-5">
                      ${unique_label.value}
                      </text>
                    </g>
                `;
              });

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
            return options.legend.colormap.colours[options.legend.colormap.colours.length-1];
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
                grid_id = location_data.layer.feature.id;
              }
            }
          }

          let location_type = options.current_sector;

          switch (options.current_sector) {
            case 'gridded_data':
              location_type = T('Grid Point');

              if (location.hasOwnProperty('generic_term')) {
                location_type = location.generic_term;
              }
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

          // item attributes
          new_item
            .attr('data-location', location.geo_id)
            .attr('data-coords', location.coords.join(','))
            .attr('data-var', options.query.var)
            .attr('data-sector', options.query.sector)
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

      set_center: function (coords, zoom = null, offset = 0) {
        let plugin = !this.item ? this.data('cdc_app') : this,
          options = plugin.options,
          item = plugin.item;

        let visible_maps = item.find('.map-panel:not(.hidden)'),
          first_map_key = visible_maps.first().attr('data-map-key'),
          map = options.maps[first_map_key].object,
          container = options.maps[first_map_key].container;

        console.log('cdc', 'set center');

        // zoom
        if (zoom == null) zoom = map.getZoom();

        map.setZoom(zoom);

        // console.log('pan to', coords);

        // pan to center
        map.panTo([coords.lat, coords.lng], { animate: false });

        if (offset !== 0) {
          map_offset = container.width() * offset;
          // pan by offset
          map.panBy(new L.Point(-map_offset, 0), { animate: false });
        }
      },
    },

    query: {
      obj_to_url: function (query, var_data = null, do_history = 'push') {
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

        let new_title = options.page_title;

        // console.log('obj to url', result);

        if (var_data != null) {
          let new_title =
            (options.lang != 'en'
              ? var_data.meta.title_fr
              : var_data.title.rendered) +
            ' — ' +
            options.page_title;
        }
        // console.log('new title', new_title);

        document.title = new_title;

        if (do_history == 'push') {
          // console.log('cdc', 'push');

          if (pushes_since_input < 1) {
            pushes_since_input += 1;
            // console.log('push', result);
            history.pushState(
              {
                title: new_title,
              },
              new_title,
              result,
            );
          } else {
            history.replaceState(
              {
                title: new_title,
              },
              new_title,
              result,
            );
          }
        } else if (do_history == 'replace') {
          // console.log('cdc', 'replace');
          history.replaceState(
            {
              title: new_title,
            },
            new_title,
            result,
          );
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
            var_data: null,
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
          settings.var_data,
          settings.do_history,
        ]);
      },

      update_station_select: function (query, station_data, list_name) {
        let plugin = !this.item ? this.data('cdc_app') : this;
        let options = plugin.options,
          item = plugin.item;

        item.find('#station-select').empty().attr('data-list', list_name);

        let station_options = [];

        if (station_data != undefined) {
          station_data.features.forEach(function (station) {
            switch (query.var) {
              case 'climate-normals':
                station_options.push({
                  id: station.id,
                  name: station.properties.STATION_NAME,
                });
                break;
              case 'station-data':
                station_options.push({
                  id: station.properties.STN_ID,
                  name: station.properties.STATION_NAME,
                });
                break;
              case 'bdv':
                station_options.push({
                  id: station.properties.ID,
                  name: station.properties.Location,
                });
                break;
              default:
                station_options.push({
                  id: station.properties.ID,
                  name: station.properties.Name,
                });
                break;
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
        }
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
          var_fields.units === 'kelvin' ? '°C' : var_fields.units;

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

        // more to this to add later
        const localized_chart_unit = unit_localize(options.chart.unit, options.lang);

        /**
         * Default tooltip value's label formatter.
         *
         * @return {string} -The unit value with its label. For 'doy' units, the returned value is a date.
         */
        const labelFormatter = function () {
          const value = this.axis.defaultLabelFormatter.call(this);
          if (localized_chart_unit === 'doy') {
            return value_formatter(value, options.chart.unit, var_fields.decimals, false, options.lang);
          } else {
            return value + ' ' + localized_chart_unit;
          }
        };

        /**
         * Default tooltip point formatter.
         *
         * @return {string} - An HTML line for a single point.
         */
        const pointFormatter = function() {
          if (this.series.type === 'line') {
            return '<span style="color:' + this.series.color + '">●</span> ' + this.series.name + ': <b>'
              + value_formatter(this.y, options.chart.unit, var_fields.decimals, false, options.lang)
              + '</b><br/>';
          } else {
            return '<span style="color:' + this.series.color + '">●</span> ' + this.series.name + ': <b>'
              + value_formatter(this.low, options.chart.unit, var_fields.decimals, false, options.lang)
              + '</b> - <b>'
              + value_formatter(this.high, options.chart.unit, var_fields.decimals, false, options.lang)
              + '</b><br/>';
          }
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

        const decade = Math.floor(parseInt(settings.query.decade) / 10),
          decade_vals = [],
          delta_vals = [];

        scenarios.forEach(function (scenario) {

          // Retrieve median time series data
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

          // Retrieve range time series data
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

          // Retrieve the current decade's 30 years median value
          const thirty_years_medians = settings.data['30y_{0}_median'.format(scenario.name)];
          if (thirty_years_medians && Object.keys(thirty_years_medians).length > 0) {
            for (let timestamp in settings.data['30y_{0}_median'.format(scenario.name)]) {
              const data_date = new Date(parseInt(timestamp));
              const data_decade = Math.floor(data_date.getUTCFullYear() / 10);
              if (data_decade === decade) {
                decade_vals.push(
                  settings.data['30y_{0}_median'.format(scenario.name)][timestamp],
                );
              }
            }
          }

          // Retrieve the current decade's median delta value (i.e. vs the reference period)
          const delta_medians = settings.data['delta7100_{0}_median'.format(scenario.name)];
          if (delta_medians && Object.keys(delta_medians).length > 0) {
            for (let timestamp in settings.data['delta7100_{0}_median'.format(scenario.name)]) {
              const data_date = new Date(parseInt(timestamp));
              const data_decade = Math.floor(data_date.getUTCFullYear() / 10);
              if (data_decade === decade) {
                delta_vals.push(
                  settings.data['delta7100_{0}_median'.format(scenario.name)][timestamp],
                );
              }
            }
          }
        });

        /*
         * Render the median header
         */

        if (decade_vals.length !== scenarios.length) {
          item.find('#location-summary').hide();
          item.find('#location-val-scenarios').hide();
        } else {
          item.find('#location-summary')
            .show()
            .find('.location-value-median .decade')
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
              value_formatter(
                decade_vals[i],
                options.chart.unit,
                settings.var_data.acf.decimals,
                false,
                options.lang,
              ) +
              '</div>',
            );

            // delta value
            let delta_icon = 'fa-caret-up text-primary';

            if (delta_vals[i] === 0) {
              delta_icon = 'fa-equals';
            } else if (delta_vals[i] < 0) {
              delta_icon = 'fa-caret-down text-secondary';
            }

            new_val_row.append(
              '<div class="col"><i class="fas ' +
              delta_icon +
              ' me-3"></i>' +
              value_formatter(
                delta_vals[i],
                options.chart.unit,
                settings.var_data.acf.decimals,
                true,
                options.lang,
              ) +
              ' ' +
              '</div>',
            );

            new_val_row.appendTo(item.find('#location-summary .value-table'));
          });

          item
            .find('#location-val-scenarios')
            .show()
            .find('.btn-check[value="' + settings.query.scenarios[0] + '"]')
            .trigger('click');
        }

        // render the chart

        if (options.chart.series.length == 0) {
          settings.container.innerHTML =
            '<span class="text-primary text-center"><h1>' +
            T('No data available for selected location') +
            '</h1></span>';
        } else {

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
              valueSuffix: ' ' + localized_chart_unit,
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

          if (options.chart.query.var === 'building_climate_zones') {
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
            'https://api.weather.gc.ca/collections/climate-normals/items?f=json&CLIMATE_IDENTIFIER=' +
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
            navigation: {
              buttonOptions: {
                enabled: false,
              },
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
                    tooltip: {
                      formatter: function (tooltip) {
                        return plugin.charts.format_tooltip.apply(this, [plugin, 'annual', settings.var_data.acf.units, settings.var_data.acf.decimals, tooltip]);
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
                        return plugin.charts.format_tooltip.apply(this, [plugin, '30y', settings.var_data.acf.units, settings.var_data.acf.decimals, tooltip]);
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
                        return plugin.charts.format_tooltip.apply(this, [plugin, 'delta', settings.var_data.acf.units, settings.var_data.acf.decimals, tooltip]);
                      },
                    },
                  });

                  break;
              }

              break;
          }
        }
      },

      /**
       * Generate the tooltip's content and return its lines as a list of HTML strings.
       *
       * @param {cdc_app} plugin
       * @param {('annual'|'delta'|'30y')} type - The type of data aggregation for the tooltip data.
       * @param {string} units - The unit of the data.
       * @param {int} decimals - Number of decimals for formatting.
       * @param {object} tooltip - The HighChart tooltip object.
       * @return {String[]} - Tooltip content, one HTML string for each tooltip line.
       */
      format_tooltip: function (plugin, type, units, decimals, tooltip) {
        const options = plugin.options;
        options.chart.object.xAxis[0].removePlotBand('30y-plot-band',);

        /*
         * For 'annual' aggregation type, we simply default to the default formatter.
         */

        if (type === 'annual') {
          return tooltip.defaultFormatter.call(this, tooltip);
        }

        /*
         * From here on, the type is either '30y' or 'delta'.
         */

        const tip = [];
        const [decade, decade_ms] = formatDecade(this.x, options.chart.query.frequency);
        const scenarios = DATASETS[options.chart.query.dataset].scenarios;

        // Show a band for the 30-year period covered
        options.chart.object.xAxis[0].addPlotBand({
          from: Date.UTC(decade, 0, 1),
          to: Date.UTC(decade + 29, 11, 31),
          id: '30y-plot-band',
        });

        // Top label for the 30-year period covered
        let decade_label =
          '<span style="font-size: 0.75rem; font-weight: bold;">' +
          decade + ' – ' + (decade + 29);

        if (type === 'delta') {
          decade_label += ' (' + chart_labels.change_from_1971_2000 + ')';
        }

        decade_label += '</span><br>';
        tip.push(decade_label);

        // For '30y' type, add the "Gridded Historical Data" line, if available for the current 30-year period
        if (type === '30y') {
          let value = null;

          if (decade_ms in options.chart.data['30y_observations']) {
            value = options.chart.data['30y_observations'][decade_ms][0];
          }

          if (value !== null) {
            if (units === 'kelvin') {
              value += 273.15;
            }

            tip.push(
              '<span style="color:#F47D23">●</span> ' +
              chart_labels.observation +
              ' <b>' +
              value_formatter(value, units, decimals, false, options.lang) +
              '</b><br>',
            );
          }
        }

        const is_delta = type === 'delta';
        const to_label = (units === 'doy' && !is_delta) ? 'to_doy' : 'to';

        // Render the two lines (median and range) for each scenario
        scenarios.forEach(function (scenario) {
          let median, lower, upper, range;

          switch (type) {
            case '30y':
              range = options.chart.data['30y_{0}_range'.format(scenario.name)][decade_ms];
              median = options.chart.data['30y_{0}_median'.format(scenario.name)][decade_ms][0];
              lower = range[0];
              upper = range[1];
              break
            case 'delta':
              range = options.chart.data['delta7100_{0}_range'.format(scenario.name)][decade_ms];
              median = options.chart.data['delta7100_{0}_median'.format(scenario.name)][decade_ms][0];
              lower = range[0];
              upper = range[1];
              break
            default:
              const point_index = this.point.index;
              range = options.chart.data['{0}_range'.format(scenario.name)][point_index];
              median = options.chart.data['{0}_median'.format(scenario.name)][point_index][1];
              lower = range[1];
              upper = range[2];
              break
          }

          if (!is_delta && units === 'kelvin') {
            median += 273.15;
            lower += 273.15;
            upper += 273.15;
          }

          tip.push(
            '<span style="color:{0};">●</span> '.format(
              scenario.chart_color,
            ) +
            T('{0} Median').format(scenario.label) +
            ': <b>' +
            value_formatter(median, units, decimals, is_delta, options.lang) +
            '</b><br>',
          );

          tip.push(
            '<span style="color:{0}">●</span> '.format(
              scenario.chart_color,
            ) +
            T('{0} Range').format(scenario.label) +
            ': <b>' +
            value_formatter(lower, units, decimals, is_delta, options.lang) +
            '</b> ' + l10n_labels[to_label] + ' <b>' +
            value_formatter(upper, units, decimals, is_delta, options.lang) +
            '</b><br>',
          );
        }, this);

        return tip;
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
        success: callback,
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
