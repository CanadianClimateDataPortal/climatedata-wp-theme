// map functions

(function ($) {
  function map_app(item, options) {
    // options

    var defaults = {
      globals: ajax_data.globals,
      lang: 'en',
      post_id: null,
      status: 'init',
      maps: {
        low: {
          container: null,
          object: null,
          layers: {
            raster: null,
            grid: null,
            station_clusters: null,
            stations: null,
          },
        },
        medium: {
          container: null,
          object: null,
          layers: {
            raster: null,
            grid: null,
            station_clusters: null,
            stations: null,
          },
        },
        high: {
          container: null,
          object: null,
          layers: {
            raster: null,
            grid: null,
            station_clusters: null,
            stations: null,
          },
        },
      },
      legend: {
        colormap: {
          colours: [],
          quantities: [],
          labels: null, // placeholder for special labels
        },
        opacity: 1,
      },
      grid: {
        hover_timeout: null,
        hover_ajax: null,
        highlighted: null,
        selected: null,
        style_obj: {},
        colors: {
          default: '#fff',
          hovered: '#fff',
          selected: '#00f',
        },
      },
      query: {
        coords: [62.51231793838694, -98.48144531250001, 4],
        dataset: 'cmip6',
        decade: 2040,
        delta: '',
        frequency: 'ann',
        opacity: [100, 100, 100],
        scenarios: ['high'],
        sector: 'gridded_data',
        selections: [],
        station: [],
        scheme: 'default',
        scheme_type: 'discrete',
        var: null,
        var_id: null,
      },
      query_str: {
        prev: '',
        current: '',
      },
      var_data: null,
      var_flags: {
        single: false,
        threshold: false,
        station: false,
      },
      frequency: {},
      elements: {
        decade_slider: null,
        threshold_slider: null,
        var_filters: {},
        tooltips: null,
        popovers: null,
      },
      current_layer: null,
      debug: true,
    };

    // coords: x/y/z
    // delta: null, true
    // dataset: cmip6, cmip5
    // geo-select: XXXXX
    // var_id:
    // vars: []
    // mora (frequency): ann, jan...dec, spring, summer, fall, winter
    // rcp (scenarios): low, medium, high
    // decade: 2040
    // sector: canadagrid, era5landgrid, census, health, watershed

    this.options = $.extend(true, defaults, options);

    this.item = $(item);
    this.init();
  }

  map_app.prototype = {
    // init

    init: function () {
      let plugin = this,
        item = plugin.item,
        options = plugin.options;

      //
      // INITIALIZE
      //

      if (options.debug == true) {
        console.log('map', 'init');
      }

      options.lang = options.globals.current_lang_code;

      $('#control-bar').tab_drawer({
        debug: false,
      });

      // things that need to happen
      // 1. set up options.query using the defaults and/or the URL
      // 2. make sure a variable ID exists
      // 3. get the variable's data and var_names
      // 4. set up UX components
      // 5. set up events
      // 6. update controls with initial query data
      // 7. evaluate the query & convert to URL string

      // 1. set up options.query using the defaults and/or the URL

      $('#status').text('initializing');

      console.log('map', 'setup query');

      $(document).cdc_app(
        'query.url_to_obj',
        options.query,
        options.status,
        function (query) {
          // replace options.query with the resulting object
          options.query = { ...query };

          console.log('done');

          // 2. make sure a variable ID exists

          // var_id and var are required but not necessarily given

          if (options.query.var_id == null) {
            $('#status').text('loading variable');

            // console.log('map', 'get var ID');

            // if it's not set, grab the 'default' variable

            $.ajax({
              url: ajax_data.rest_url + 'cdc/v2/get_default_var/',
              type: 'GET',
              dataType: 'json',
              async: false,
              success: function (data) {
                if (data != null) {
                  // set the var_id
                  // options.query.var_id = parseInt(data);

                  options.query.var_id = $(document).cdc_app(
                    'query.update_value',
                    options.query,
                    {
                      item: $('[data-query-key="var_id"]'),
                      key: 'var_id',
                      val: parseInt(data),
                    },
                  );
                }

                console.log('done');
              },
            });
          }

          // 3. get the variable's data and var_names

          $('#status').text('setting up variable ID ' + options.query.var_id);

          console.log('map', 'get var data');

          // ajax call in get_var_data is also async: false

          $(document).cdc_app(
            'get_var_data',
            options.query.var_id,
            function (data) {
              options.var_data = data;

              if (
                typeof options.var_data.acf.var_names != 'undefined' &&
                options.query.var == null
              ) {
                // update var in options.query
                options.query.var = options.var_data.acf.var_names[0].variable;
              }

              console.log('done');
            },
          );

          // 4. set up UX components

          $('#status').text('adding components');

          plugin.init_components();

          // 5. set up events

          plugin.init_events();

          // 6. update controls with initial query data

          $('#status').text('setting inputs');

          console.log('map', 'refresh inputs');

          plugin.refresh_inputs(options.query);

          console.log('done');

          // 7. evaluate the query

          $('#status').text('running query');

          console.log('map', 'eval');

          options.query_str.current = $(document).cdc_app('query.eval', {
            query: options.query,
            do_history: 'replace',
            callback: function () {
              // get map layer

              console.log('init get_layer now');

              // load default color scheme
              plugin.update_default_scheme(function () {
                $(document).cdc_app(
                  'maps.get_layer',
                  options.query,
                  options.var_data,
                );
              });

              console.log('done');

              $('#status').hide();

              console.log('status = ready');
              options.status = 'ready';
            },
          });
        },
      );
    },

    init_components: function () {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      // MAPS

      options.maps = $(document).cdc_app(
        'maps.init',
        options.maps,
        options.legend,
        null,
      );

      // BOOTSTRAP

      // enable tooltips

      let tooltip_elements = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]',
      );

      options.elements.tooltips = [...tooltip_elements].map(
        (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl),
      );

      // enable popovers

      let popover_elements = document.querySelectorAll(
        '[data-bs-toggle="popover"]',
      );

      options.elements.popovers = [...popover_elements].map(
        (popoverTriggerEl) =>
          new bootstrap.Popover(popoverTriggerEl, {
            placement: 'right',
            fallbackPlacements: ['right', 'top', 'bottom', 'left'],
            offset: [0, 16],
          }),
      );

      // SLIDERS

      // decade

      options.elements.decade_slider = $('#decade-slider').slider({
        min: 1950,
        max: 2100,
        step: 10,
        animate: true,
        create: function () {
          let val = $(this).slider('value');

          $(this)
            .find('.ui-slider-handle span')
            .text(val + 1 + '–' + (val + 30));

          $('[data-query-key="decade"]').val(val).trigger('change');

          // show decade prompt

          let decade_tooltip = bootstrap.Tooltip.getInstance(
            '#decade-slider-handle',
          );

          if (decade_tooltip != undefined) {
            setTimeout(function () {
              bootstrap.Tooltip.getInstance('#decade-slider-handle').toggle();
            }, 3000);
          }
        },
        slide: function (e, ui) {
          // console.log('SLIDE');
          options.status = 'slide';

          $(this)
            .find('.ui-slider-handle span')
            .text(ui.value + 1 + '–' + (ui.value + 30));

          let clone_query = { ...options.query };

          clone_query.decade = ui.value;

          // eval
          options.query_str.current = $(document).cdc_app('query.eval', {
            query: clone_query,
            do_history: 'none',
            callback: function () {
              // console.log('decade slider get_layer');
              $(document).cdc_app(
                'maps.get_layer',
                clone_query,
                options.var_data,
              );
            },
          });

          // destroy tooltip

          let decade_tooltip = bootstrap.Tooltip.getInstance(
            '#decade-slider-handle',
          );

          if (decade_tooltip != undefined) {
            decade_tooltip.dispose();
          }
        },
        change: function (e, ui) {
          // status = input, changed by the stop function
          // so this input change will fire the history push
          $(this)
            .find('.ui-slider-handle span')
            .text(ui.value + 1 + '–' + (ui.value + 30));

          $('[data-query-key="decade"]').val(ui.value).trigger('change');
        },
        stop: function (e, ui) {
          options.status = 'input';
        },
      });

      // opacity

      item.find('.opacity-slider').each(function (i) {
        $(this).slider({
          min: 0,
          max: 100,
          value: options.query.opacity[i],
          step: 1,
          create: function (e, ui) {
            plugin._opacity_slider_change($(this), e, options.query.opacity[i]);
          },
          slide: function (e, ui) {
            options.status = 'slide';
            plugin._opacity_slider_change($(this), e, ui.value);
          },
          change: function (e, ui) {
            plugin._opacity_slider_change($(this), e, ui.value);

            // update hidden input
            let input_val = $.map(
              item.find('.opacity-slider'),
              function (slider_item) {
                return $(slider_item).slider('value');
              },
            );

            // console.log('opacity val', input_val.join(','));

            item.find('[data-query-key="opacity"]').val(input_val.join(','));

            if (options.status == 'input') {
              item.find('[data-query-key="opacity"]').trigger('change');
            }
          },
          stop: function (e, ui) {
            options.status = 'input';
          },
        });
      });

      // SELECT2

      $('#area-search').select2({
        language: {
          inputTooShort: function () {
            let instructions = '<div class="geo-select-instructions">';

            instructions += '<div class="p-2 mb-2 border-bottom">';

            instructions +=
              '<h6 class="mb-1">' + T('Search communities') + '</h6>';

            instructions +=
              '<p class="mb-1 text-body">' +
              T('Begin typing city name') +
              '</p>';

            instructions += '</div>';

            instructions += '<div class="p-2">';

            instructions +=
              '<h6 class="mb-1">' + T('Search coordinates') + '</h6>';

            instructions +=
              '<p class="mb-0 text-body">' +
              T('Enter latitude & longitude e.g.') +
              ' <code>54,-115</code></p>';

            instructions += '</div>';

            instructions += '</div>';

            return instructions;
          },
        },
        ajax: {
          url: ajax_data.url,
          dataType: 'json',
          delay: 0,
          data: function (params) {
            return {
              action: 'cdc_location_search',
              q: params.term, // search term
              search: params,
              page: params.page,
            };
          },
          transport: function (params, success, failure) {
            var $request = $.ajax(params);

            // console.log(params, success, failure);

            var llcheck = new RegExp(
              '^[-+]?([1-8]?\\d(\\.\\d+)?|90(\\.0+)?)\\s*,\\s*[-+]?(180(\\.0+)?|((1[0-7]\\d)|([1-9]?\\d))(\\.\\d+)?)$',
            );

            term = params.data.q;

            if (llcheck.test(term)) {
              $request.fail(failure);
              // $('.select2-results__option').text('custom');
              $('.select2-results__options').empty();

              var term_segs = term.split(',');
              var term_lat = term_segs[0];
              var term_lon = term_segs[1];

              $('.select2-results__options').append(
                '<div class="geo-select-instructions p-4"><h6 class="mb-3">' +
                  T('Coordinates detected') +
                  '</h6><p class="mb-0"><span class="geo-select-pan-btn btn btn-outline-secondary btn-sm rounded-pill px-4" data-lat="' +
                  term_lat +
                  '" data-lon="' +
                  term_lon +
                  '">' +
                  T('Set map view') +
                  '</span></p></div>',
              );
            } else {
              $request.then(success);
              return $request;
            }
          },
          processResults: function (data, page) {
            // parse the results into the format expected by Select2.
            // since we are using custom formatting functions we do not need to
            // alter the remote JSON data
            return {
              results: data.items,
            };
          },
          cache: true,
        },
        escapeMarkup: function (markup) {
          return markup;
        }, // let our custom formatter work
        minimumInputLength: 1,
        width: '100%',
        templateResult: plugin._select2_format_item,
      });

      // FREQUENCY

      // re-populate frequency select

      item
        .find('select[data-query-key="frequency"]')
        .children()
        .each(function () {
          let opt_key = $(this).attr('data-field');

          if ($(this).is('option')) {
            options.frequency[opt_key] = {
              value: $(this).attr('value'),
              field: $(this).attr('data-field'),
              label: $(this).text(),
            };
          } else if ($(this).is('optgroup')) {
            let new_group = [];

            options.frequency[opt_key] = {
              group: $(this).attr('label'),
              options: [],
            };

            $(this)
              .children()
              .each(function () {
                options.frequency[opt_key].options.push({
                  value: $(this).attr('value'),
                  field: $(this).attr('data-field'),
                  label: $(this).text(),
                });
              });
          }
        });

      // console.log('frequency', options.frequency);

      // OFFCANVAS

      let offcanvas_els = {
        help: document.getElementById('help'),
        info: document.getElementById('info'),
      };

      for (let key in offcanvas_els) {
        offcanvas_els[key].addEventListener('hide.bs.offcanvas', function (e) {
          $('body')
            .removeClass('offcanvas-open')
            .removeAttr('data-offcanvas-active');
        });

        offcanvas_els[key].addEventListener('show.bs.offcanvas', function (e) {
          $('body')
            .addClass('offcanvas-open')
            .attr('data-offcanvas-active', key);
        });
      }

      item.on('fw_query_success', function (e, query_item) {
        let query_items = query_item.find('.fw-query-items');

        if (query_items.data('flex_drawer') == undefined) {
          query_items.flex_drawer({
            item_selector: '.fw-query-item',
          });
        } else {
          // reinit if plugin is already loaded
          query_items.flex_drawer('init_items');
        }

        item.find('#data-variable .control-tab-body').scrollTop(0);
      });

      item.find('#var-select-query').fw_query();

      //

      $(document).cdc_app(
        'add_hook',
        'maps.get_layer',
        500,
        plugin,
        plugin.apply_scheme,
      );
    },

    _select2_format_item: function (item) {
      if (!item.id) {
        return item.text;
      }
      if (item.location === null) {
        show_comma = '';
        item.location = '';
      } else {
        show_comma = ', ';
      }

      return $(
        '<span><div class="geo-select-title">' +
          item.text +
          ' (' +
          item.term +
          ')</div>' +
          item.location +
          show_comma +
          item.province +
          '</sup></span>',
      );
    },

    _opacity_slider_change: function (slider, e, value) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      // set handle text
      slider.find('.ui-slider-handle').text(value);

      let this_pane = slider.attr('data-pane');
      let new_opacity = value / 100;

      // always set the given pane opacity
      // so it's consistent if we switch sectors
      item
        .find('.leaflet-pane.leaflet-' + this_pane + '-pane')
        .css('opacity', new_opacity);

      // grid layer defaults to 1
      item.find('.leaflet-pane.leaflet-grid-pane').css('opacity', 1);

      // if setting a data layer
      if (this_pane != 'labels' && this_pane != 'marker') {
        // also set the legend
        options.legend.opacity = new_opacity;

        item
          .find('.legend')
          .find('.legendbox')
          .css('fill-opacity', new_opacity);
      }

      // if setting the marker layer
      if (this_pane == 'marker') {
        // also set the shadow
        item
          .find('.leaflet-pane.leaflet-shadow-pane')
          .css('opacity', new_opacity);
      }

      // if this is the 'data' slider, and
      // we're looking at a sector layer
      if (this_pane == 'raster' && options.query.sector != 'gridded_data') {
        // also adjust the grid pane
        item
          .find('.leaflet-pane.leaflet-grid-pane')
          .css('opacity', new_opacity);
      }
    },

    init_events: function () {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      // MAP

      for (let key in options.maps) {
        // create zoomend/dragend events
        // for each map

        options.maps[key].object
          .on('zoomend dragend', function (e) {
            // console.log(e, this);

            if (options.status != 'init') {
              options.status = 'mapdrag';
            }

            // update coord text fields
            $('#coords-lat').val(this.getCenter().lat);
            $('#coords-lng').val(this.getCenter().lng);
            $('#coords-zoom').val(this.getZoom());

            // update hidden coords field
            $('[data-query-key="coords"]').val(
              $('#coords-lat').val() +
                ',' +
                $('#coords-lng').val() +
                ',' +
                $('#coords-zoom').val(),
            );

            if (options.status == 'mapdrag') {
              options.status = 'input';
            }

            // console.log('moved map', options.status);

            // simulate input event on coords field
            $('#coords-lat').trigger('change');

            if (options.status != 'init') {
              // update query value
              $('[data-query-key="coords"]').each(function () {
                $(document).cdc_app('query.update_value', options.query, {
                  item: $(this),
                  key: 'coords',
                  val: $(this).val(),
                });
              });
            }

            // update query string
            options.query_str.prev = options.query_str.current;

            options.query_str.current = $(document).cdc_app(
              'query.obj_to_url',
              options.query,
              'replace',
            );

            // hide the zoom alert
          })
          .on('zoomend', function (e) {
            if (options.query.sector != 'station') {
              if (this.getZoom() >= 7) {
                item.find('#zoom-alert').fadeOut(250);
              }
            }
          });
      }

      //

      item.on(
        'map_item_mouseover',
        function (e, mouse_event, this_gid, style_obj) {
          let decade_value = parseInt(options.query.decade) + 1,
            hasdelta = options.var_data.acf.hasdelta,
            delta7100 = options.query.delta !== '' ? '&delta7100=true' : '';

          plugin._grid_hover_cancel(mouse_event);

          // tooltip
          if (hasdelta !== false) {
            options.grid.hover_timeout = setTimeout(function () {
              // build query URL for tooltip content

              // var name
              let var_name =
                options.query.var == 'building_climate_zones'
                  ? 'hddheat_18'
                  : options.query.var;

              // request endpoint
              let endpoint =
                'get-delta-30y-regional-values/' +
                options.query.sector +
                '/' +
                mouse_event.layer.properties.id;

              // query string
              let params =
                'period=' +
                decade_value +
                '&decimals=' +
                options.var_data.acf.decimals +
                delta7100 +
                '&dataset_name=' +
                options.query.dataset;

              // adjust for grid
              if (options.query.sector == 'gridded_data') {
                endpoint =
                  'get-delta-30y-gridded-values/' +
                  mouse_event.latlng['lat'] +
                  '/' +
                  mouse_event.latlng['lng'];
              }

              values_url =
                geoserver_url +
                '/' +
                endpoint +
                '/' +
                var_name +
                '/' +
                options.query.frequency +
                '?' +
                params;

              options.grid.hover_ajax = $.ajax({
                url: values_url,
                dataType: 'json',
                success: function (data) {
                  for (let key in options.maps) {
                    options.maps[key].layers.grid
                      .bindTooltip(
                        plugin._format_grid_hover_tooltip(
                          data,
                          scenario_names[options.query.dataset][key]
                            .replace(/[\W_]+/g, '')
                            .toLowerCase(),
                          options.var_data,
                          hasdelta,
                          options.query.sector,
                          mouse_event,
                        ),
                        { sticky: true },
                      )
                      .openTooltip(mouse_event.latlng);
                  }
                },
                // jQuery throws parsererror if the JSON includes NaN. The API returns NaN when no data is available
                error: function (_, status) {
                  if (status !== 'abort') {
                    let tip = [];

                    if (options.query.sector !== 'gridded_data') {
                      tip.push(
                        mouse_event.layer.properties[l10n_labels.label_field] +
                          '<br>',
                      );
                    }

                    tip.push(T('No data available for this area.'));

                    for (let key in options.maps) {
                      options.maps[key].layers.grid
                        .bindTooltip(tip.join('\n'), { sticky: true })
                        .openTooltip(mouse_event.latlng);
                    }
                  }
                },
              });
            }, 100); // timeout
          } // if delta

          // highlight
          options.grid.highlighted = this_gid;

          for (let key in options.maps) {
            options.maps[key].layers.grid.setFeatureStyle(this_gid, style_obj);
          }
        },
      );

      //

      item.on(
        'map_item_mouseout',
        function (e, mouse_event, this_gid, style_obj) {
          options.grid.highlighted = null;

          // reset this
          if (options.grid.selected != this_gid) {
            for (let key in options.maps) {
              options.maps[key].layers.grid.resetFeatureStyle(this_gid);
            }
          }
        },
      );

      // click grid item

      item.on(
        'map_item_select',
        function (e, mouse_event, this_gid, style_obj) {
          // console.log('grid click', mouse_event);

          options.grid.style_obj = style_obj;

          // load location details
          plugin.set_location(mouse_event.latlng, mouse_event);
        },
      );

      // mouseover marker

      item.on('marker_mouseover', function (e, mouse_event) {
        plugin._grid_hover_cancel(mouse_event);
      });

      // click station

      item.on('map_station_select', function (e, mouse_event) {
        // console.log('station click', mouse_event);

        if (options.query.var == 'idf') {
          // popups

          console.log('do popup', mouse_event);

          $.ajax({
            url: ajax_data.url,
            data: {
              action: 'cdc_get_idf_files',
              idf: mouse_event.layer.feature.properties.ID,
            },
            dataType: 'json',
            success: function (data) {
              console.log(data);
            },
          });
        } else {
          // normals

          // console.log('set station');

          // load location details
          plugin.set_station(mouse_event);
        }
      });

      // click marker

      item.on('click_marker', function (e, mouse_event) {
        let list_item = item.find(
          '#recent-locations [data-coords="' +
            mouse_event.latlng.lat +
            ',' +
            mouse_event.latlng.lng +
            '"]',
        );

        $(document).cdc_app('maps.set_center', mouse_event.latlng, 10, 0.75);

        list_item.trigger('click');
      });

      // change tabs

      item.on('td_update_path', function (e, prev_id, current_id) {
        if (prev_id == '#location-detail' && options.grid.selected != null) {
          for (let key in options.maps) {
            options.maps[key].layers.grid.resetFeatureStyle(
              options.grid.selected,
            );
          }

          options.grid.selected = null;
        }
      });

      // click item in 'recent locations'

      item.on('click', '#recent-locations .clear', function (e) {
        let this_item = $(this).closest('.list-group-item');

        $(document).cdc_app('maps.remove_marker', this_item.attr('data-index'));
      });

      item.on('click', '#recent-locations .view', function (e) {
        let this_item = $(this).closest('.list-group-item');

        let coords = {
          lat: this_item.attr('data-coords').split(',')[0],
          lng: this_item.attr('data-coords').split(',')[1],
        };

        if (this_item.attr('data-sector') == options.query.sector) {
          plugin.set_location(coords, {
            layer: {
              properties: {
                id: $(this).attr('data-grid-id'),
                label_en: this_item.find('.title').text(),
              },
            },
          });
        } else {
          if (window.location.hash == '#location-detail') {
            $('#control-bar').tab_drawer('update_path', '#location');
          }

          $(document).cdc_app('maps.set_center', coords, 10, false);
        }
      });

      // clear 'recent locations' list

      item.on('click', '#recent-locations-clear', function () {
        $(document).cdc_app('maps.remove_markers');
      });

      //
      // CHARTS
      //

      // change the chart values

      item.on('change', '[data-chart-key]', function () {
        let this_val;

        if ($(this).is(':input')) {
          this_val = $(this).val();
        } else {
          this_val = $(this).attr('data-chart-val');
        }

        $(document).cdc_app('charts.update_data', {
          input: {
            key: $(this).attr('data-chart-key'),
            value: this_val,
          },
          var_data: options.var_data,
        });
      });

      // chart print/export

      item.on('click', '.export-btn', function () {
        $(document).cdc_app(
          'charts.do_export',
          $(this).attr('data-export-type'),
        );
      });

      //
      // SIDEBAR CONTROLS
      //

      // search selection

      item.find('#area-search').on('select2:select', function (e) {
        console.log('selected', e.params.data);

        plugin.set_location(
          { lat: e.params.data.lat, lng: e.params.data.lon },
          null,
          true,
        );
      });

      // triggerable handler

      item.on('update_input', function (event, item, status = null) {
        if (status == null) status = options.status;
        if (item) {
          // reset history push counter
          pushes_since_input = 0;
          plugin.handle_input($(item), status);
        }
      });

      // select a variable

      item.on('click', '.var-select', function () {
        item
          .find('[data-query-key="var_id"]')
          .val($(this).attr('data-var-id'))
          .trigger('change');
      });

      // click a link element with a query key

      item.on('click', 'a[data-query-key]', function () {
        console.log('status = input');
        options.status = 'input';
        $(document).trigger('update_input', [$(this)]);
      });

      // change an input with a query key

      item.on('change', ':input[data-query-key]', function () {
        // console.log(
        //   'change input',
        //   $(this).attr('data-query-key'),
        //   options.query[$(this).attr('data-query-key')] +
        //     ' -> ' +
        //     $(this).val(),
        // );

        if ($(this).val() != options.query[$(this).attr('data-query-key')]) {
          if (
            options.status != 'slide' &&
            options.status != 'mapdrag' &&
            options.status != 'init' &&
            options.status != 'eval'
          ) {
            console.log('status = input');
            options.status = 'input';
          }

          $(document).trigger('update_input', [$(this)]);
        }
      });

      // manually update coord fields

      item.on('click', '#map-control-coords .btn', function () {
        let this_input = $(this).siblings().filter('[type="text"]'),
          this_val = parseFloat(this_input.val()),
          zoom_val = parseInt(item.find('#coords-zoom').val());

        if (this_input.attr('id') == 'coords-zoom') {
          // if changing the zoom, plus or minus 1 will suffice
          if ($(this).hasClass('down-btn')) {
            this_val -= 1;
          } else if ($(this).hasClass('up-btn')) {
            this_val += 1;
          }
        } else {
          // generate a number of degrees to pan
          // based on the zoom level

          let multiplier = 1;

          if (zoom_val <= 10 && zoom_val >= 8) {
            multiplier = 2;
          } else if (zoom_val >= 5) {
            multiplier = 4;
          } else if (zoom_val < 5) {
            multiplier = 8;
          }

          if ($(this).hasClass('down-2')) {
            this_val -= 0.4 * multiplier;
          } else if ($(this).hasClass('down-1')) {
            this_val -= 0.1 * multiplier;
          } else if ($(this).hasClass('up-1')) {
            this_val += 0.1 * multiplier;
          } else if ($(this).hasClass('up-2')) {
            this_val += 0.4 * multiplier;
          }
        }

        // update & trigger
        this_input.val(this_val.toFixed(1)).trigger('change');
      });

      item.on('change', '.coord-field', function () {
        // repopulate the hidden coords field
        $('[data-query-key="coords"]').val(
          $('#coords-lat').val() +
            ',' +
            $('#coords-lng').val() +
            ',' +
            $('#coords-zoom').val(),
        );

        if (options.status != 'init') {
          options.status = 'input';
        }

        // trigger update event
        $(document).trigger('update_input', [$('[data-query-key="coords"]')]);
      });

      // MISC

      // colour scheme dropdown selection

      item.on('click', '#display-scheme-select .dropdown-item', function () {
        // update hidden input
        $('[data-query-key="scheme"]')
          .val($(this).attr('data-scheme-id'))
          .trigger('change');
      });

      // SAVE MAP AS IMAGE

      item.find('#download-map-image').click(function (event) {
        event.preventDefault();
        const page_url = new URL(window.location.href);
        page_url.hash = ''; // Make sure to remove #download so no tab is opened at the time of the screenshot
        const encoded_url = encodeURL(
          page_url.toString(),
          URL_ENCODER_SALT,
        ).encoded;
        const api_url = DATA_URL + '/raster?url=' + encoded_url;
        window.open(api_url, '_blank');
      });

      // "Download" button

      // Handle of the click on the "Download" button of the "Share" tab.
      // Takes the current page's query and builds a URL for the "Download Data" page. That way, some of the inputs of
      // the "Download" page are pre-filled.
      $('#download-btn').on('click', function (event) {
        event.preventDefault();
        const download_query = $.extend(true, {}, options.query);

        // We do some conversions of the "map" page query to adjust it for the "download" page query

        const period = options.query.decade;

        if (period != null) {
          const period_start = parseInt(period);
          download_query['start_year'] = period_start;
          download_query['end_year'] = period_start + 30;
        }

        const base_href = this.href;
        const query_string = $(document).cdc_app(
          'query.obj_to_url',
          download_query,
          null,
        );

        window.location.href = base_href + query_string + '#data'; // Pre-open the "Data" tab on the "Download" page
      });

      // var select filters

      item.on('mouseup', '#var-select-query .filter-item', function (e) {
        console.log('close');

        let this_filter = $(this).closest('.fw-query-filter'),
          this_toggle = this_filter.find('.dropdown-toggle'),
          this_menu = $(this).closest('.dropdown-menu');

        // toggle 'show' class

        this_toggle.removeClass('show');

        // close the dropdown

        let this_dropdown = bootstrap.Dropdown.getOrCreateInstance(
          document.getElementById($(this).closest('.dropdown-menu').attr('id')),
        );

        this_dropdown.toggle();

        setTimeout(function () {
          // add selection to toggle btn
          console.log(this_menu);
          console.log();

          if (this_menu.find('.selected').length) {
            this_toggle
              .find('.selection')
              .text(this_menu.find('.selected').text())
              .show();
          } else {
            this_toggle.find('.selection').text('').hide();
          }
        }, 250);
      });

      $(document).on('fw_query_reset', function () {
        item
          .find('.fw-query-filter .dropdown-toggle .selection')
          .text('')
          .hide();
      });

      // HISTORY

      window.addEventListener('popstate', function (e) {
        console.log('POP');
        options.status = 'eval';
        plugin.handle_pop(e);
      });
    },

    handle_input: function (input, status) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      if (!status) status = options.status;

      let this_key = input.attr('data-query-key'),
        this_val = input.val();

      // console.log('input: ' + this_key, 'status: ' + status);

      // if not a form element with a value attribute,
      // look for a data-query-val
      if (input.is('a')) {
        this_val = input.attr('data-query-val');
      }

      // custom UX behaviours by input key

      switch (this_key) {
        case 'var_id':
          plugin.update_var(this_val, status);
          break;
        case 'dataset':
          // each scenario label
          item.find('.scenario-name').each(function () {
            let this_item = $(this),
              old_dataset = this_item.attr('data-dataset'),
              old_name = this_item.attr('data-name'),
              new_key = '';

            if (old_dataset != this_val) {
              // update data-dataset attr

              this_item.attr('data-dataset', this_val);

              // update the data-name attr

              // find the scenario name in the correlating dataset
              DATASETS[old_dataset].scenarios.forEach(function (scenario) {
                if (new_key == '' && scenario.name == old_name) {
                  // found it - store the correlating name
                  new_key = scenario.correlations[this_val];
                  // set the item's data-name to the new key
                  this_item.attr('data-name', new_key);
                }
              });

              // update the label's text

              // find the selected key in the new dataset object
              DATASETS[this_val].scenarios.forEach(function (scenario) {
                if (scenario.name == new_key) this_item.text(scenario.label);
              });
            }
          });

          if (this_val == 'cmip6') {
            item.find('.scenario-name.low').text(scenario_names[this_val].low);
            item
              .find('.scenario-name.medium')
              .text(scenario_names[this_val].medium);
            item
              .find('.scenario-name.high')
              .text(scenario_names[this_val].high);
          }
          break;
        case 'scenarios':
          // ssp1/2/5 switches

          item.find('[data-query-key="scenarios"]').each(function () {
            // each radio

            // find the matching map panel
            let this_panel = $('#map-' + $(this).val());

            // show the panel if checked
            if ($(this).prop('checked') == true) {
              this_panel.removeClass('hidden');
            } else {
              this_panel.addClass('hidden');
            }
          });

          // if only 1 switch is on, disable it
          // so the user can't select zero scenarios
          if (item.find('[data-query-key="scenarios"]:checked').length <= 1) {
            item
              .find('[data-query-key="scenarios"]:checked')
              .prop('disabled', true);
          } else {
            item.find('[data-query-key="scenarios"]').prop('disabled', false);
          }

          // console.log(options.query.scenarios);

          // wait for CSS transition
          // ideally with something better than
          // a setTimeout
          setTimeout(function () {
            $(document).cdc_app('maps.invalidate_size');
          }, 500);

          break;

        case 'sector':
          item.find('.leaflet-pane.leaflet-grid-pane').css('opacity', 1);

          if (this_val != 'gridded_data') {
            item
              .find('.leaflet-pane.leaflet-grid-pane')
              .css('opacity', $('#display-data-slider').slider('value') / 100);
          }

          // adjust 'view location' label in recent locations
          item.find('#recent-locations .list-group-item').each(function () {
            if ($(this).attr('data-sector') == this_val) {
              $(this).find('.view').text(T('Select'));
            } else {
              $(this).find('.view').text(T('Show on map'));
            }
          });

          break;
        case 'coords':
          // coordinates

          if (status != 'mapdrag') {
            // if the input wasn't triggered
            // by a map drag/zoom event

            let coords = $('#coords').val().split(','),
              lat = parseFloat(coords[0]),
              lng = parseFloat(coords[1]),
              zoom = parseInt(coords[2]);

            // console.log('coords', lat, lng, zoom);

            if (!isNaN(lat) && !isNaN(lng) && !isNaN(zoom)) {
              // only if all values exist
              $('#coords-lat').val(lat);
              $('#coords-lng').val(lng);
              $('#coords-zoom').val(zoom);

              // update the map view
              // console.log('set view', lat, lng, zoom);
              Object.values(options.maps)[0].object.setView([lat, lng], zoom, {
                animate: false,
              });
            }
          }

          break;
      }

      if (status == 'input' || status == 'slide') {
        // whether to pushstate on eval or not
        let do_history = status == 'slide' ? 'none' : 'push';

        // use cdc helper function to
        // update the value in the query object
        $(document).cdc_app('query.update_value', options.query, {
          item: input,
          key: this_key,
          val: this_val,
        });

        // perform triggers based on input key, but with updated query object
        switch (this_key) {
          case 'var_id':
          case 'frequency':
          case 'delta':
            // console.log(options.query.delta);

            // update_default = plugin.update_default_scheme(function () {
            // console.log('delta get_layer');
            // $(document).cdc_app(
            //   'maps.get_layer', // todo: not ideal, may generates a flicker of the map layer
            //   options.query,
            //   options.var_data,
            // );
            // });
            break;
          case 'scheme':
            plugin.update_scheme();
            break;
          case 'scheme_type':
            options.legend.colormap.scheme_type = options.query.scheme_type;
            break;
        }

        // run the query

        options.query_str.prev = options.query_str.current;

        // console.log('handle_input call eval now, history: ' + do_history);

        options.query_str.current = $(document).cdc_app('query.eval', {
          query: options.query,
          do_history: do_history,
          callback: function () {
            plugin.update_default_scheme(function () {
              console.log('handle input get_layer', options.status);

              $(document).cdc_app(
                'maps.get_layer',
                options.query,
                options.var_data,
              );

              let decade_tooltip = bootstrap.Tooltip.getInstance(
                '#decade-slider-handle',
              );

              if (decade_tooltip != undefined) {
                setTimeout(function () {
                  decade_tooltip.update();
                }, 500);
              }

              console.log('status = ready');
              options.status = 'ready';
            });
          },
        });
      } else if (status != 'init' && status != 'eval') {
        // console.log('status = ready');
        // options.status = 'ready';
      }
    },

    refresh_inputs: function (query, status) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      // console.log('refresh');
      // console.log(JSON.stringify(query, null, 4));

      // update control bar inputs from query

      for (let key in query) {
        // console.log(key);

        // for each key in the query object

        // find input(s) that matches this key
        let this_input = item.find('[data-query-key="' + key + '"]');

        if (Array.isArray(query[key])) {
          // query option is an array
          // that means the input allows multiple selections
          // i.e. checkboxes

          if (this_input.length) {
            this_input.each(function (i) {
              let do_update = false;

              if (key == 'coords') {
                // specific action for hidden coords field
                $(this).val(query[key].join(','));
                do_update = true;
              } else if (
                $(this).is('[type="checkbox"]') &&
                query[key].includes($(this).val()) &&
                $(this).prop('checked') == false
              ) {
                // checkbox
                // this value is in the object
                // but the box is not checked
                $(this).prop('checked', true);

                // maybe don't trigger the input change here
                // it conflicts with map stuff that's happening
                // concurrently
                do_update = true;
              } else if ($(this).hasClass('select2')) {
                console.log('update select');
                console.log('status', options.status);
                $(this).val(query[key]).trigger('change');
              }

              if (do_update == true) {
                $(document).trigger('update_input', [$(this), options.status]);
              }
            });
          }
        } else {
          // query option is a single value
          // check out what type of input goes with it

          if (this_input.is('[type="hidden"]')) {
            // hidden input
            // likely controlled by some other UX element
            // console.log(query[key]);

            this_input.val(query[key]);

            switch (key) {
              case 'var_id':
                // var ID
                plugin.update_var(query[key], status);
                break;

              // decade
              case 'decade':
                // update UI slider
                options.elements.decade_slider.slider(
                  'value',
                  parseInt(query[key]),
                );
                break;

              // colour scheme
              case 'scheme':
                // update colour scheme dropdown
                plugin.update_scheme();
                break;

              // location
              case 'location':
                if (query[key] != '') {
                  console.log('get location ' + query[key]);

                  $.ajax({
                    url: ajax_data.url,
                    dataType: 'json',
                    data: {
                      action: 'cdc_get_location_by_id',
                      lang: options.lang,
                      loc: query[key],
                    },
                    success: function (data) {
                      let open_location = false;

                      if (window.location.hash == '#location-detail') {
                        open_location = true;
                      }

                      plugin.set_location(
                        { lat: data.lat, lng: data.lng },
                        null,
                        open_location,
                      );
                    },
                  });
                }
                break;
            }
          } else if (this_input.is('[type="radio"]')) {
            // radio

            this_radio = item.find(
              '[data-query-key="' + key + '"][value="' + query[key] + '"]',
            );

            if (this_radio.prop('checked') != true) {
              // console.log('change val');
              this_radio.prop('checked', true);
              $(document).trigger('update_input', [$(this_radio), 'eval']);
            }
          } else if (this_input.is('select')) {
            if (this_input.val() != query[key]) {
              // console.log('change val');
              this_input.val(query[key]);
              $(document).trigger('update_input', [$(this_input), 'eval']);
            }
          }

          // console.log('---');
        }
      }
    },

    handle_pop: function (e) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      console.log('handle pop', e);

      // update query object from URL
      $(document).cdc_app(
        'query.url_to_obj',
        options.query,
        options.status,
        function (query) {
          // replace query object
          options.query = { ...query };
          // refresh inputs
          plugin.refresh_inputs(options.query, options.status);
        },
      );

      console.log(options.query_str.current + ' -> ' + window.location.search);

      // run the query

      if (options.query_str.current != window.location.search) {
        // only if the query string has changed
        // i.e. not switching between tabs

        options.query_str.prev = options.query_str.current;

        options.query_str.current = $(document).cdc_app('query.eval', {
          query: options.query,
          do_history: 'none',
          callback: function () {
            console.log('eval get_layer');
            $(document).cdc_app(
              'maps.get_layer',
              options.query,
              options.var_data,
            );

            console.log('status = ready');
            options.status = 'ready';
          },
        });
      }
    },

    update_var: function (var_id, status = null, callback = null) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      let fields;

      if (status == null) status = options.status;

      options.var_flags.single = false;
      options.var_flags.inputs = false;
      options.var_flags.threshold = false;
      options.var_flags.station = false;

      console.log('updating ' + var_id + ', ' + status);

      let hidden_input = item.find('[data-query-key="var"]');

      if (
        options.var_data.hasOwnProperty('id') &&
        options.var_data.id == var_id
      ) {
        // do nothing
      } else if (var_id != null) {
        // console.log('get_var_data because var_id changed');
        $(document).cdc_app('get_var_data', var_id, function (data) {
          // console.log('get var data', data);

          // update var_data
          options.var_data = data;

          if (typeof data.acf.var_names != 'undefined') {
            if (status != 'init' && status != 'eval') {
              // update var in options.query
              options.query.var = options.var_data.acf.var_names[0].variable;

              // set hidden input
              hidden_input.val(data.acf.var_names[0].variable);
            }

            if (status == 'input') {
              hidden_input.trigger('change');
            }
          }
        });
      }

      fields = options.var_data.acf;

      if (typeof fields.var_names != 'undefined') {
        // set breadcrumb title

        item
          .find('#breadcrumb-variable')
          .text(
            options.lang != 'en'
              ? options.var_data.meta.title_fr
              : options.var_data.title.rendered,
          );

        // populate var info overlay

        let desc_key = 'var_description' + (options.lang != 'en' ? '_fr' : ''),
          tech_key =
            'var_tech_description' + (options.lang != 'en' ? '_fr' : '');

        item.find('#info-description').html(options.var_data.acf[desc_key]);
        item
          .find('#info-tech-description')
          .html(options.var_data.acf[tech_key]);

        // if the var is station data

        if (options.var_data.var_types.includes('Station Data')) {
          // set 'sector' parameter
          options.var_flags.station = true;
        } else {
          // console.log('not station');
          // find and trigger the checked sector radio
          // so that query.sector updates
          item
            .find('#map-control-aggregation .form-check-input:checked')
            .trigger('change');
        }

        // SET CONTROLS

        plugin.set_controls(fields);

        if (typeof callback == 'function') {
          callback(data);
        }
      }
    },

    set_controls: function (fields) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      console.log('SET CONTROLS');

      // VAR FLAGS

      // each item with display conditions
      item.find('[data-flags]').each(function () {
        let condition_met = false;

        // each condition
        $(this)
          .attr('data-flags')
          .split(',')
          .forEach(function (condition) {
            // split key & val
            let split_attr = condition.split(':');
            split_attr[1] = split_attr[1] == '1' ? true : false;

            // console.log(split_attr[0] + ' has to be ' + split_attr[1]);

            if (options.var_flags[split_attr[0]] == split_attr[1]) {
              // console.log('condition met');
              condition_met = true;
            }
          });

        if (condition_met == true) {
          $(this).find(':input').prop('disabled', false);
        } else {
          $(this).find(':input').prop('disabled', true);
        }
      });

      // ADJUST FOR VAR DETAIL FIELDS

      // console.log('acf', fields);

      // DATA TAB

      // thresholds

      if (
        typeof fields.var_names != 'undefined' &&
        fields.var_names.length > 1
      ) {
        // variable has thresholds

        // set var_flag
        options.var_flags.threshold = true;

        // destroy the existing slider
        if (options.elements.threshold_slider != null) {
          options.elements.threshold_slider
            .off('slide')
            .off('change')
            .off('stop');

          options.elements.threshold_slider.slider('destroy');
        }

        // reinit with current settings

        options.elements.threshold_slider = item
          .find('#threshold-slider')
          .slider({
            min: 0,
            max: fields.var_names.length - 1,
            step: 1,
            slide: function (e, ui) {
              // update the hidden input/query

              options.status = 'slide';

              $(this)
                .find('.ui-slider-handle')
                .text(fields.var_names[ui.value].label);

              let clone_query = { ...options.query };

              clone_query.var = fields.var_names[ui.value].variable;

              options.query_str.current = $(document).cdc_app('query.eval', {
                query: clone_query,
                do_history: 'none',
                callback: function () {
                  console.log('threshold get_layer');
                  $(document).cdc_app(
                    'maps.get_layer',
                    clone_query,
                    options.var_data,
                  );
                },
              });
            },
            change: function (e, ui) {
              item
                .find('[data-query-key="var"]')
                .val(fields.var_names[ui.value].variable)
                .trigger('change');
            },
            stop: function (e, ui) {
              options.status = 'input';
            },
          });

        // find out which index of the var_names array
        // is the field's value

        fields.var_names.forEach(function (var_name, i) {
          if (Object.values(var_name).includes(options.query.var)) {
            options.elements.threshold_slider.slider('option', 'value', i);

            // set handle text
            options.elements.threshold_slider
              .find('.ui-slider-handle')
              .text(fields.var_names[i].label);
          }
        });
      }

      // dataset

      // enable all
      item.find('#map-control-dataset .btn-check').prop('disabled', false);

      item.find('#map-control-dataset .btn-check').each(function () {
        // dataset isn't available to the variable
        if (!fields.dataset_availability.includes($(this).val())) {
          $(this).prop('disabled', true);

          if ($(this).prop('checked') == true) $(this).prop('checked', false);
        }
      });

      if (!item.find('#map-control-dataset :checked').length) {
        // nothing is checked
        // find the first enabled input and check it

        item
          .find('#map-control-dataset .btn-check:not([disabled])')
          .first()
          .prop('checked', true)
          .trigger('change');
      }

      // frequency
      // fields.timestep
      // checkboxes - Annual, Monthly, 2QS-APR, QS-DEC (Seasonal), Daily

      plugin.update_frequency();

      // DISPLAY TAB

      // delta
      // fields.hasdelta
      // true/false

      if (fields.hasdelta == true) {
        // delta is available to the variable
        // enable all
        item
          .find('#map-control-delta .form-check-input')
          .prop('disabled', false);
      } else {
        // no delta, select 'absolute' and disable
        item
          .find('#display-delta-absolute')
          .prop('checked', true)
          .trigger('change');

        item
          .find('#map-control-delta .form-check-input')
          .prop('disabled', true);
      }

      // aggregration
      // fields.availability
      // checkboxes - grid/census/health/watershed

      // enable all
      item
        .find('#map-control-aggregation .form-check-input')
        .prop('disabled', false);

      item.find('#map-control-aggregation .form-check-input').each(function () {
        // sector isn't available to the variable
        if (!fields.availability.includes($(this).val())) {
          $(this).prop('disabled', true);

          if ($(this).prop('checked') == true) $(this).prop('checked', false);
        }
      });

      if (!item.find('#map-control-aggregation :checked').length) {
        // nothing is checked
        // find the first enabled input and check it

        item
          .find('#map-control-aggregation .form-check-input:not([disabled])')
          .first()
          .prop('checked', true)
          .trigger('change');
      }

      // colour scheme

      // DECADE SLIDER

      // set min/max

      options.elements.decade_slider.slider(
        'option',
        'min',
        fields.time_slider_min_value,
      );

      options.elements.decade_slider.slider(
        'option',
        'max',
        fields.time_slider_max_value,
      );

      // slider min/max labels

      item.find('#decade-slider-min').text(fields.time_slider_min_value);
      item.find('#decade-slider-max').text(fields.time_slider_max_value + 30);

      // validate slider value

      if (
        options.elements.decade_slider.slider('value') >
        fields.time_slider_max_value
      ) {
        options.elements.decade_slider.slider(
          'value',
          fields.time_slider_max_value,
        );
      }

      if (
        options.elements.decade_slider.slider('value') <
        fields.time_slider_min_value
      ) {
        options.elements.decade_slider.slider(
          'value',
          fields.time_slider_min_value,
        );
      }

      // ADJUST CONTROLS FOR INDIVIDUAL VARS

      // building climate zones
      // todo: add field to var data to allow/disallow colour schemes

      if (
        options.var_data.acf.var_names[0].variable == 'building_climate_zones'
      ) {
        // set & disable colour schemes
        item.find('[data-query-key="scheme"]').val('default').trigger('change');
        item
          .find('#display-scheme-select .dropdown-toggle')
          .prop('disabled', true);
      }

      // console.log('---');
    },

    update_frequency: function () {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      let frequency_select = item.find('select[data-query-key="frequency"]');

      // empty the existing select
      frequency_select.empty();

      console.log('variable timesteps', options.var_data.acf.timestep);

      if (!options.var_data.acf.timestep.length) {
        // no timesteps
        frequency_select.prop('disabled', true);
      } else {
        frequency_select.prop('disabled', false);

        options.var_data.acf.timestep.forEach(function (option) {
          if (options.frequency.hasOwnProperty(option)) {
            let this_option = options.frequency[option];

            if (this_option.hasOwnProperty('group')) {
              let new_optgroup = $(
                '<optgroup label="' + this_option.group + '">',
              ).appendTo(frequency_select);

              this_option.options.forEach(function (item) {
                new_optgroup.append(
                  '<option value="' +
                    item.value +
                    '" data-field="' +
                    item.field +
                    '">' +
                    item.label +
                    '</option>',
                );
              });
            } else {
              frequency_select.append(
                '<option value="' +
                  this_option.value +
                  '" data-field="' +
                  this_option.field +
                  '">' +
                  this_option.label +
                  '</option>',
              );
            }
          }
        });

        // console.log('available', options.var_data.acf.timestep);
        // console.log('selected', options.query.frequency);

        if (!options.var_data.acf.timestep.includes(options.query.frequency)) {
          // console.log('select first', frequency_select.find('option').first());

          frequency_select.val(
            frequency_select.find('option').first().attr('value'),
          );
        }

        frequency_select.trigger('change');
      }
    },

    redraw_colour_scheme: function (element) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      $(element).find('svg').empty();
      let colours = $(element).data('scheme-colours');

      if (colours != undefined) {
        let interval = 100 / colours.length;
        $.each(colours, function (idx, colour) {
          let rect = document.createElementNS(svgNS, 'rect');
          rect.setAttribute('height', '100%');
          rect.setAttribute('width', interval + 1 + '%');
          rect.setAttribute('x', interval * idx + '%');
          rect.setAttribute('fill', colour);
          $(element).find('svg').append(rect);
        });
      }
    },

    // fetch colours of default scheme from Geoserver
    // and update the data of the default
    // one in the dropdown
    update_default_scheme: function (callback) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      // console.log('update default scheme');

      let default_scheme_element = item.find(
        '#display-scheme-select .dropdown-item[data-scheme-id="default"]',
      );

      if (
        special_variables.hasOwnProperty(
          options.var_data.acf.var_names[0].variable,
        )
      ) {
        const special_var =
          special_variables[options.var_data.acf.var_names[0].variable];
        default_scheme_element.data(
          'scheme-colours',
          special_var.colormap.colours,
        );
        default_scheme_element.data(
          'scheme-quantities',
          special_var.colormap.quantities,
        );
        plugin.update_scheme();

        if (typeof callback === 'function') {
          callback();
        }
      } else {
        let layer_name = $(document).cdc_app(
          'maps.get_layer_name',
          options.query,
        );

        // console.log('current', options.current_layer);
        // console.log('layer name', layer_name);

        if (options.current_layer != layer_name) {
          $.getJSON(
            geoserver_url +
              '/geoserver/wms?service=WMS&version=1.1.0&request=GetLegendGraphic' +
              '&format=application/json&layer=' +
              layer_name,
          )
            .then(function (data) {
              options.current_layer == layer_name;

              let colour_map =
                data.Legend[0].rules[0].symbolizers[0].Raster.colormap.entries;

              default_scheme_element.data(
                'scheme-colours',
                colour_map.map((e) => e.color),
              );
              default_scheme_element.data(
                'scheme-quantities',
                colour_map.map((e) => parseFloat(e.quantity)),
              );
              plugin.update_scheme();
            })
            .always(function () {
              if (typeof callback == 'function') {
                callback();
              }
            });
        }
      }
    },

    // Hook that update leaflet params object depending on selected scheme
    apply_scheme: function (query, layer_params) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      // console.log('apply scheme');

      if (
        special_variables.hasOwnProperty(
          options.var_data.acf.var_names[0].variable,
        )
      ) {
        const special_var =
          special_variables[options.var_data.acf.var_names[0].variable];
        layer_params.tiled = false;
        delete layer_params.sld_body;
        layer_params.layers = layer_params.layers.replace(
          ...special_var.layers_replace,
        );
        layer_params.styles = special_var.styles;
        return;
      }

      let selected_item = item.find(
        '#display-scheme-select .dropdown-item[data-scheme-id="' +
          query.scheme +
          '"]',
      );

      if (query.scheme === 'default') {
        delete layer_params.styles;
        layer_params.tiled = true;
        delete layer_params.sld_body;
      } else {
        layer_params.tiled = false;
        layer_params.sld_body = plugin.generate_sld(
          layer_params.layers,
          query.scheme_type === 'discrete',
        );
      }
    },

    // handle colour scheme change
    update_scheme: function () {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      // console.log('update scheme');

      // reset active
      let selected_item = item.find(
          '#display-scheme-select .dropdown-item[data-scheme-id="' +
            options.query.scheme +
            '"]',
        ),
        discrete_btns = selected_item
          .closest('.map-control-item')
          .find('#display-colours-toggle .btn');

      selected_item
        .closest('.dropdown-menu')
        .find('.dropdown-item')
        .removeClass('active');

      selected_item.addClass('active');

      // enable/disable discrete/continuous

      if (selected_item.hasClass('default')) {
        let discrete_or_continuous =
          selected_item.data('scheme-type') === 'ramp'
            ? 'continuous'
            : 'discrete';

        $(`[data-query-key="scheme_type"][value="${discrete_or_continuous}"]`)
          .prop('checked', true)
          .trigger('change');

        discrete_btns.addClass('disabled');
      } else {
        discrete_btns.removeClass('disabled');
      }

      // copy item data to toggle
      selected_item
        .closest('.dropdown')
        .find('.dropdown-toggle')
        .data(selected_item.data());

      // redraw the schemes
      item.find('#display-scheme-select .scheme-dropdown').each(function () {
        plugin.redraw_colour_scheme(this);
      });

      plugin.generate_ramp(selected_item);
    },

    // generate ramp colours and keypoints, used by SLD or choro, and legend
    generate_ramp: function (selected_scheme_item) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      // console.log('generate ramp', selected_scheme_item.data('scheme-colours'));

      let colours = selected_scheme_item.data('scheme-colours');
      let query = options.query;
      let quantity;

      if (
        special_variables.hasOwnProperty(
          options.var_data.acf.var_names[0].variable,
        )
      ) {
        $.extend(
          options.legend.colormap,
          special_variables[options.var_data.acf.var_names[0].variable]
            .colormap,
        );
      } else {
        options.legend.colormap.colours = colours;
        options.legend.colormap.quantities = [];
        options.legend.colormap.labels = null;
        options.legend.colormap.scheme_type = query.scheme_type;
        options.legend.colormap.categorical = false;

        if (options.query.scheme === 'default') {
          options.legend.colormap.quantities =
            selected_scheme_item.data('scheme-quantities');
        } else {
          let variable_data =
            variables_data[query.var][period_frequency_lut[query.frequency]];
          let absolute_or_delta = query.delta === 'true' ? 'delta' : 'absolute';

          let low = variable_data[absolute_or_delta].low;
          let high = variable_data[absolute_or_delta].high;
          let scheme_length = colours.length;
          let decimals = options.var_data.acf.decimals;

          // if we have a diverging ramp, we center the legend at zero
          if (selected_scheme_item.data('scheme-type') === 'divergent') {
            high = Math.max(Math.abs(low), Math.abs(high));
            low = high * -1;
            // workaround to avoid legend with repeated values for very low range variables
            if ((high - low) * 10**decimals < scheme_length) {
              low = -(scheme_length / 10**decimals / 2.0);
              high = scheme_length / 10**decimals / 2.0;
            }
          } else {
            // workaround to avoid legend with repeated values for very low range variables
            if ((high - low) * 10**decimals < scheme_length) {
              high = low + scheme_length / 10**decimals;
            }
          }

          // temperature raster data files are in Kelvin, but in °C in variable_data
          if (variable_data.unit === 'K' && query.delta !== 'true') {
            low += 273.15;
            high += 273.15;
          }

          let step = (high - low) / scheme_length;

          for (let i = 0; i < scheme_length - 1; i++) {
            quantity = low + i * step;
            options.legend.colormap.quantities.push(quantity);
          }
          // we need a virtually high value for highest bucket
          options.legend.colormap.quantities.push((high + 1) * (high + 1));
        }
      }
    },

    generate_sld: function (layer_name, discrete) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      let colormap = options.legend.colormap;
      let colormap_type = discrete ? 'intervals' : 'ramp';

      let sld_body = `<?xml version="1.0" encoding="UTF-8"?>
        <StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc"
        xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd">
        <NamedLayer><Name>${layer_name}</Name><UserStyle><IsDefault>1</IsDefault><FeatureTypeStyle><Rule><RasterSymbolizer>
        <Opacity>1.0</Opacity><ColorMap type="${colormap_type}">`;

      for (let i = 0; i < colormap.colours.length; i++) {
        sld_body += `<ColorMapEntry color="${colormap.colours[i]}" quantity="${colormap.quantities[i]}"/>`;
      }

      sld_body +=
        '</ColorMap></RasterSymbolizer></Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>';
      return sld_body;
    },

    set_station: function (click_event, open_tab = true) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      console.log('station fn', click_event);

      const station_id = click_event.layer.feature.properties.STN_ID,
        coords = { lat: click_event.latlng.lat, lng: click_event.latlng.lng };

      // create chart

      if (open_tab == true) {
        console.log('load station now');

        // set map center to marker location w/ offset
        $(document).cdc_app('maps.set_center', coords, 10);

        // hidden input
        item
          .find('[data-query-key="station"]')
          .val(station_id)
          .trigger('change');

        // tab headings
        item
          .find('#station-detail .control-tab-head h5')
          .text(click_event.layer.feature.properties.STATION_NAME);

        // open location tab drawer

        if (window.location.hash != '#location-detail') {
          $('#control-bar').tab_drawer('update_path', '#station-detail');
        }

        // remove legend rows
        item.find('.chart-series-items .cloned').remove();

        // chart

        $(document).cdc_app('charts.render_station', {
          query: options.query,
          var_data: options.var_data,
          station: {
            id: station_id,
            name: click_event.layer.feature.properties.STATION_NAME,
            coords: coords,
          },
          download_url: null,
          container: item.find('#station-chart-container')[0],
        });

        console.log('done');
      }
    },

    set_location: function (coords, location_data = null, open_tab = true) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      console.log('set location');
      console.log(coords);
      console.log(location_data);

      let feature_id = null,
        zoom_level = 8;

      if (typeof location_data == 'string') {
        feature_id = parseInt(location_data);
      }

      let get_location_data = function (coords, location_data) {
        switch (options.query.sector) {
          case 'gridded_data':
            console.log('grid', coords);

            if (
              feature_id == null &&
              location_data != null &&
              typeof location_data == 'object'
            ) {
              if (location_data.hasOwnProperty('layer')) {
                console.log(location_data);
                feature_id = location_data.layer.properties.gid;
              }
            }

            zoom_level = 10;

            return $.ajax({
              url: ajax_data.url,
              dataType: 'json',
              data: {
                action: 'cdc_get_location_by_coords',
                lang: options.lang,
                lat: coords.lat,
                lng: coords.lng,
                sealevel: false,
              },
              success: function (data) {
                // console.log('success');
                // console.log(data);

                return data;
              },
            });
            break;

          default:
            console.log('sector', location_data);

            let location_obj = {
              lat: coords.lat,
              lng: coords.lng,
              coords: [coords.lat, coords.lng],
              geo_name: 'Point',
              title: 'Point (' + coords.lat + ', ' + coords.lng + ')',
            };

            if (feature_id == null && typeof location_data == 'object') {
              feature_id = location_data.layer.properties.gid;

              location_obj.geo_name = location_data.layer.properties.label_en;
              location_obj.title = location_data.layer.properties.label_en;
            }

            return location_obj;
        }
      };

      // wait until location data exists
      $.when(get_location_data(coords, location_data)).done(
        function (location) {
          console.log('LOCATION');
          console.log(location);

          // add marker

          $(document).cdc_app(
            'maps.add_marker',
            location,
            location_data,
            function () {},
          );

          // match coords var to lat/lng returned by the function
          coords = { lat: location.lat, lng: location.lng };

          // search field value
          if (location.geo_name != 'Point') {
            item.find('#area-search').val(location.title);
          }

          // set the hidden input with the location code
          // if it exists

          item
            .find('[data-query-key="location"]')
            .val(location.geo_id)
            .trigger('change');

          // tab headings
          item
            .find('#location-detail .control-tab-head h5')
            .text(location.title);

          if (open_tab == true) {
            console.log('open location detail now');

            if (window.location.hash != '#location-detail') {
              $('#control-bar').tab_drawer('update_path', '#location-detail');
            }

            // generate chart
            $.ajax({
              url:
                geoserver_url +
                '/generate-charts/' +
                coords.lat +
                '/' +
                coords.lng +
                '/' +
                options.query.var +
                '/' +
                options.query.frequency +
                '?decimals=' +
                options.var_data.acf.decimals +
                '&dataset_name=' +
                options.query.dataset,
              dataType: 'json',
              success: function (data) {
                // console.log('chart data', data);

                // remove legend rows
                item.find('.chart-series-items .cloned').remove();

                $(document).cdc_app('charts.render', {
                  data: data,
                  query: options.query,
                  var_data: options.var_data,
                  coords: coords,
                  download_url: null,
                  container: item.find('#location-chart-container')[0],
                });
              },
            });
          }

          // highlight map feature

          if (options.grid.selected != null) {
            // an item is already selected,
            // deselect that first
            // console.log('reset', options.grid.selected);
            for (let key in options.maps) {
              options.maps[key].layers.grid.resetFeatureStyle(
                options.grid.selected,
              );
            }
          }

          // get ready to select the new item

          if (feature_id != null) {
            // console.log('select', feature_id);

            options.grid.style_obj.color = '#00f';

            console.log(options.grid.style_obj);

            for (let key in options.maps) {
              options.maps[key].layers.grid.setFeatureStyle(
                feature_id,
                options.grid.style_obj,
              );
            }

            // update the selected id
            options.grid.selected = feature_id;
          }

          // set map center to marker location w/ offset
          $(document).cdc_app('maps.set_center', coords, zoom_level);
        },
      );
    },

    /**
     *
     * @param data Data sent by climatedata-api ( get-delta-30y-gridded-values or get-delta-30y-regional-values)
     * @param rcp RCP scenario selection
     * @param varDetails Variable details object provided by Wordpress
     * @param delta If true, the value is formatted as a delta
     * @param sector Selected sector (ex: 'census'). "" if none
     * @param event Javascript event that triggered the grid_hover
     * @returns {string}
     */

    _format_grid_hover_tooltip: function (
      data,
      rcp,
      varDetails,
      delta,
      sector,
      event,
    ) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      let to_label = options.var_data.acf.units == 'doy' ? 'to_doy' : 'to',
        tip = [];

      if (event.layer.properties.hasOwnProperty(l10n_labels.label_field)) {
        tip.push(event.layer.properties[l10n_labels.label_field] + '<br>');
      }

      // median

      // (value, var_acf, delta, lang)
      let val1 = value_formatter(
        data[rcp]['p50'],
        varDetails.acf,
        delta,
        options.lang,
      );

      tip.push(
        '<span style="color:#00F">●</span> ' +
          l10n_labels.median +
          ' <b>' +
          val1 +
          '</b><br/>',
      );

      // range
      val1 = value_formatter(
        data[rcp]['p10'],
        varDetails.acf,
        delta,
        options.lang,
      );

      let val2 = value_formatter(
        data[rcp]['p90'],
        varDetails.acf,
        delta,
        options.lang,
      );

      tip.push(
        '<span style="color:#00F">●</span> ' +
          l10n_labels.range +
          ' <b>' +
          val1 +
          '</b> ' +
          l10n_labels[to_label] +
          ' <b>' +
          val2 +
          '</b><br/>',
      );
      return tip.join('\n');
    },

    _grid_hover_cancel: function (e) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      // cancel current timeout
      if (options.grid.hover_timeout !== null) {
        clearTimeout(options.grid.hover_timeout);

        for (let key in options.maps) {
          options.maps[key].layers.grid.unbindTooltip();
        }

        options.grid.hover_timeout = null;
      }

      // cancel in-flight ajax call to avoid duplicated tooltips

      if (options.grid.hover_ajax !== null) {
        options.grid.hover_ajax.abort();
        options.grid.hover_ajax = null;
      }
    },
  };

  // jQuery plugin interface

  $.fn.map_app = function (opt) {
    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {
      var item = $(this);
      var instance = item.data('map_app');

      if (!instance) {
        // create plugin instance if not created
        item.data('map_app', new map_app(this, opt));
      } else {
        // otherwise check arguments for method call
        if (typeof opt === 'string') {
          instance[opt].apply(instance, args);
        }
      }
    });
  };

  /**
   * Prepare the UI of the "Explore Maps" page for a screenshot.
   *
   * If on the "Explore Maps" page, calling this function will adapt the UI so that the map is displayed full screen
   * (hiding UI elements as required).
   *
   * This function is not intended to be called from the JavaScript. It's intended to be called by the API server
   * when it needs to take a screenshot of the page. See the "Save map as image" button.
   *
   * There is no "reverse" function. Once this function is called, the UI stays modified until the page is reloaded.
   */
  $.fn.prepare_raster = function () {
    $('#control-bar').remove();
    $('#map-control-footer').remove();
    $('#map-breadcrumb').remove();
    $('#map-objects').addClass('to-raster');
  };
})(jQuery);
