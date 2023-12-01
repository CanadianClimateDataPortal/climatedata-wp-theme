// global CDC functions
(function ($) {
  function cdc_app(item, options) {
    // options

    var defaults = {
      globals: ajax_data.globals,
      lang: ajax_data.globals.lang,
      post_id: null,
      canadaBounds: L.latLngBounds(L.latLng(41, -141.1), L.latLng(83.6, -49.9)),
      maps: {},
      coords: {
        lat: null,
        lng: null,
        zoom: null,
      },
      first_map: null,
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

      //
      // MAP
      //

      //
      // TABS
      //

      $('#control-bar').tab_drawer();

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

    maps: {
      init: function (maps, callback) {
        let plugin = !this.item ? this.data('cdc_app') : this,
          options = plugin.options;

        // console.log('cdc', 'init maps', maps);

        options.maps = maps;

        for (let key in options.maps) {
          // create the map

          options.maps[key].object = L.map('map-object-' + key, {
            center: [canadaCenter[0], canadaCenter[1]],
            zoomControl: false,
            zoom: 4,
          });

          options.maps[key].container = $('#map-object-' + key);

          let this_map = options.maps[key],
            this_object = this_map.object;

          // layers

          this_object.createPane('basemap');
          this_object.getPane('basemap').style.zIndex = 399;
          this_object.getPane('basemap').style.pointerEvents = 'none';

          this_object.createPane('raster');
          this_object.getPane('raster').style.zIndex = 400;
          this_object.getPane('raster').style.pointerEvents = 'none';

          this_object.createPane('grid');
          this_object.getPane('grid').style.zIndex = 500;
          this_object.getPane('grid').style.pointerEvents = 'all';

          this_object.createPane('labels');
          this_object.getPane('labels').style.zIndex = 550;
          this_object.getPane('labels').style.pointerEvents = 'none';

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

      get_layer: function () {
        let plugin = !this.item ? this.data('cdc_app') : this,
          options = plugin.options;

        console.log('cdc', 'get layer');

        let map_objects = [];

        for (let key in options.maps) {
          map_objects.push(options.maps[key].object);
        }

        // raster

        for (let key in options.maps) {
          let layer_name =
            'CDC:' +
            (options.query.dataset == 'cmip6'
              ? options.query.dataset + '-'
              : '') +
            options.query.var +
            '-' +
            (options.query.frequency == 'ann' ? 'ys' : 'ms') +
            '-' +
            scenario_names[options.query.dataset][key]
              .replace(/[\W_]+/g, '')
              .toLowerCase() +
            '-p50-' +
            options.query.frequency +
            '-30year';

          let params = {
            format: 'image/png',
            opacity: 1,
            transparent: true,
            tiled: true,
            pane: 'raster',
            version: options.query.dataset == 'cmip6' ? '1.3.0' : '1.1.1',
            bounds: options.canadaBounds,
            layers: layer_name,
            TIME: parseInt(options.query.decade) + '-01-00T00:00:00Z',
          };

          // console.log(key, layer_name);

          if (
            options.maps[key].layers.raster &&
            options.maps[key].object.hasLayer(options.maps[key].layers.raster)
          ) {
            options.maps[key].layers.raster.setParams(params);
          } else {
            options.maps[key].layers.raster = L.tileLayer
              .wms(geoserver_url + '/geoserver/ows?', params)
              .addTo(options.maps[key].object);
          }

          // console.log(options.maps[key].object);
        }

        // grid layer

        let gridline_color = '#fff',
          gridline_color_hover = '#fff',
          gridline_color_active = '#fff',
          gridline_width = '0.2',
          gridline_width_active = '1',
          gridfill_color_hover = '#fff';

        let gridLayer_options = {
          rendererFactory: L.canvas.tile,
          interactive: true,
          getFeatureId: function (f) {
            return f.properties.gid;
          },
          maxNativeZoom: 12,
          vectorTileLayerStyles: {
            canadagrid: function (properties, zoom) {
              return {
                weight: 0.1,
                color: gridline_color,
                opacity: 1,
                fill: true,
                radius: 4,
                fillOpacity: 0,
              };
            },
            canadagrid1deg: function (properties, zoom) {
              return {
                weight: 0.1,
                color: gridline_color,
                opacity: 1,
                fill: true,
                radius: 4,
                fillOpacity: 0,
              };
            },
            era5landgrid: function (properties, zoom) {
              return {
                weight: 0.1,
                color: gridline_color,
                opacity: 1,
                fill: true,
                radius: 4,
                fillOpacity: 0,
              };
            },
          },
          bounds: options.canadaBounds,
          maxZoom: 12,
          minZoom: 7,
          pane: 'grid',
        };

        gridLayer = L.vectorGrid.protobuf(
          geoserver_url +
            '/geoserver/gwc/service/tms/1.0.0/CDC:' +
            'canadagrid' +
            '@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf',
          gridLayer_options,
        );

        for (let key in options.maps) {
          // gridLayer.addTo(options.maps[key].object);
        }
      },

      invalidate_size: function () {
        let plugin = !this.item ? this.data('cdc_app') : this,
          options = plugin.options;

        for (let key in options.maps) {
          options.maps[key].object.invalidateSize();
        }
      },
    },

    query: {
      obj_to_url: function (do_history = 'push') {
        let plugin = !this.item ? this.data('cdc_app') : this,
          options = plugin.options;

        // console.log('obj to url', do_history);

        let query_str = [];

        for (let key in options.query) {
          // console.log(key, options.query[key]);

          if (options.query.hasOwnProperty(key)) {
            query_str.push(
              key +
                '=' +
                (options.query[key] != ''
                  ? encodeURIComponent(options.query[key])
                  : ''),
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

        console.log('cdc', 'url to obj', status);

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

          if (typeof query.scenarios == 'string') {
            query.scenarios = [query.scenarios];
          }

          // console.log('merged query');
          // console.log(JSON.stringify(query, null, 4));
        }

        // set cdc_app's options.query too
        options.query = query;

        console.log('the query', options.query);

        if (typeof callback == 'function') {
          callback(query);
        }

        return query;
      },

      update_value: function (fn_options) {
        let plugin = !this.item ? this.data('cdc_app') : this,
          options = plugin.options,
          item = plugin.item;

        // console.log('update_value');

        // check for necessary parameters

        if (
          typeof fn_options == 'object' &&
          fn_options.hasOwnProperty('item') &&
          fn_options.hasOwnProperty('key') &&
          fn_options.hasOwnProperty('val')
        ) {
          // console.log('updating query val', fn_options);

          if (Array.isArray(options.query[fn_options.key])) {
            // the existing query value is an array

            // console.log(fn_options.key, 'array');

            // reset it to []
            options.query[fn_options.key] = [];

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
                    options.query[fn_options.key].push($(this).val());
                  }
                });
            } else if (fn_options.item.is('[type="text"]')) {
              fn_options.item
                .closest('.map-control-item')
                .find('[type="text"][data-query-key="' + fn_options.key + '"]')
                .each(function () {
                  options.query[fn_options.key].push($(this).val());
                });
            } else if (fn_options.key == 'coords') {
              options.query[fn_options.key] = fn_options.val.split(',');
            }
          } else {
            options.query[fn_options.key] = fn_options.val;
          }

          // console.log(
          //   'updated ' + fn_options.key,
          //   options.query[fn_options.key],
          // );

          // evaluate
          // plugin.query.eval.apply(item, ['']);
        } else {
          console.warn('object missing key and/or value');
        }
      },

      eval: function (do_history = 'push', callback = null) {
        let plugin = !this.item ? this.data('cdc_app') : this;

        let options = plugin.options,
          item = plugin.item;

        // console.log('eval', options.query);

        // get layer

        let new_url = plugin.query.obj_to_url.apply(item, [do_history]);

        plugin.maps.get_layer.apply(item);

        if (typeof callback == 'function') {
          callback();
        }

        return new_url;
      },
    },

    //     update_coord_inputs: function () {
    //       let plugin = this,
    //         item = plugin.item,
    //         options = plugin.options;
    //
    //       options.coords.lat = options.first_map.object.getCenter().lat;
    //       options.coords.lng = options.first_map.object.getCenter().lng;
    //       options.coords.zoom = options.first_map.object.getZoom();
    //
    //       options.query.coords = [
    //         options.coords.lat,
    //         options.coords.lng,
    //         options.coords.zoom,
    //       ];
    //
    //       $('#coords-lat').val(options.coords.lat);
    //       $('#coords-lng').val(options.coords.lng);
    //       $('#coords-zoom').val(options.coords.zoom);
    //     },

    toggle_conditionals: function () {
      let plugin = this,
        item = plugin.item,
        options = plugin.options;

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
