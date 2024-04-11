// download functions

(function ($) {
  function download_app(item, options) {
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
          scheme_type: 'discrete',
        },
        opacity: 1,
      },
      // current_selections: [],
      query: {
        coords: [62.51231793838694, -98.48144531250001, 4],
        delta: '',
        dataset: 'cmip6',
        var_id: null,
        var: null,
        percentiles: ['5'],
        frequency: 'ann',
        scenarios: ['medium'],
        decade: 2040,
        sector: 'gridded_data',
        scheme: 'default',
        scheme_type: 'discrete',
        start_year: 1950,
        end_year: 1955,
        start_date:
          new Date().getFullYear() - 30 + new Date().toJSON().substr(4, 6),
        end_date: new Date().toJSON().slice(0, 10),
        format: 'csv',
        models: '',
        station: [],
        selections: [],
        check_missing: '0.05',
      },
      query_str: {
        prev: '',
        current: '',
      },
      var_data: null,
      var_flags: {
        single: false,
        custom: false,
        threshold: false,
        station: false,
        ahccd: false,
      },
      frequency: {},
      current_layer: null,
      selection_data: {},
      station: {
        color: '#00f',
      },
      request: {
        type: 'single',
        inputs: [],
        is_valid: false,
      },
      elements: {
        start_slider: null,
        end_slider: null,
        threshold_accordion: null,
        threshold_slider: null,
        start_picker: null,
        end_picker: null,
        shapefile_upload: null,
        popovers: null,
      },
      debug: true,
    };

    this.options = $.extend(true, defaults, options);

    this.item = $(item);
    this.init();
  }

  download_app.prototype = {
    // init

    init: function () {
      let plugin = this,
        item = plugin.item,
        options = plugin.options;

      //
      // INITIALIZE
      //

      if (options.debug == true) {
        console.log('download', 'init');
      }

      options.lang = options.globals.current_lang_code;

      $('#control-bar').tab_drawer();

      // 1. set up options.query using the defaults and/or the URL

      console.log('download', 'setup query');

      $(document).cdc_app(
        'query.url_to_obj',
        options.query,
        options.status,
        function (query) {
          // replace options.query with the resulting object
          options.query = { ...query };

          // 3. get the variable's data and var_names

          if (options.query.var_id != null && options.query.var_id != 'null') {
            $('#status').text('setting up variable ID ' + options.query.var_id);

            console.log('download', 'get var data');

            // ajax call in get_var_data is also async: false

            $(document).cdc_app(
              'get_var_data',
              options.query.var_id,
              function (data) {
                options.var_data = data;

                if (
                  typeof options.var_data.acf.var_names != 'undefined' &&
                  (options.query.var == null || options.query.var == 'null')
                ) {
                  // update var in options.query
                  options.query.var =
                    options.var_data.acf.var_names[0].variable;
                }

                console.log('done');
                // console.log(JSON.stringify(options, null, 4));
              },
            );
          }

          // 4. set up UX components

          plugin.init_components();

          // 5. set up events

          plugin.init_events();

          // 6. update controls with initial query data

          options.query.selections = [];
          options.query.station = [];

          console.log('download', 'refresh inputs', options.status);

          plugin.refresh_inputs(options.query, 'init');

          console.log('done');

          // 7. evaluate the query

          options.query_str.prev = options.query_str.current;

          options.query_str.current = $(document).cdc_app('query.eval', {
            query: options.query,
            do_history: 'replace',
            callback: function () {
              // get map layer

              if (options.query.var != null && options.query.var != 'null') {
                // page loaded with a variable set

                console.log('init get_layer');

                // load default color scheme
                plugin.update_default_scheme(function () {
                  $(document).cdc_app(
                    'maps.get_layer',
                    options.query,
                    options.var_data,
                  );
                });
              }

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
        options.request,
      );

      // JQUERY UI WIDGETS

      options.elements.threshold_slider = item
        .find('#threshold-slider')
        .slider({
          min: 0,
          max: 1,
          step: 1,
        });

      let start_hidden = item.find('[data-query-key="start_year"]'),
        end_hidden = item.find('[data-query-key="end_year"]');

      options.elements.start_slider = item
        .find('#details-time-slider-start')
        .slider({
          min: 1950,
          max: 2100,
          value: parseInt(options.query.start_year),
          step: 5,
          animate: true,
          create: function (e, ui) {
            $(this).find('.ui-slider-handle').text($(this).slider('value'));
          },
          slide: function (e, ui) {
            $(this).find('.ui-slider-handle').text(ui.value);
            if (ui.value >= options.elements.end_slider.slider('value')) {
              options.elements.end_slider.slider('value', ui.value);
            }
          },
          change: function (e, ui) {
            $(this).find('.ui-slider-handle').text(ui.value);
            item.find('#details-time-start').val(ui.value).trigger('change');
          },
          stop: function (e, ui) {
            console.log('status = input');
            options.status = 'input';
          },
        });

      options.elements.end_slider = item
        .find('#details-time-slider-end')
        .slider({
          min: 1950,
          max: 2100,
          value: parseInt(options.query.end_year),
          step: 5,
          animate: true,
          create: function (e, ui) {
            $(this).find('.ui-slider-handle').text($(this).slider('value'));
          },
          slide: function (e, ui) {
            $(this).find('.ui-slider-handle').text(ui.value);
            if (ui.value <= options.elements.start_slider.slider('value')) {
              options.elements.start_slider.slider('value', ui.value);
            }
          },
          change: function (e, ui) {
            $(this).find('.ui-slider-handle').text(ui.value);
            item.find('#details-time-end').val(ui.value).trigger('change');
          },
          stop: function (e, ui) {
            console.log('status = input');
            options.status = 'input';
          },
        });

      item.find('#details-decimals-slider').slider({
        min: 0,
        max: 10,
        value: 2,
        animate: true,
        create: function (e, ui) {
          $(this).find('.ui-slider-handle').text($(this).slider('value'));
        },
        slide: function (e, ui) {
          $(this).find('.ui-slider-handle').text(ui.value);
        },
        change: function (e, ui) {
          $(this).find('.ui-slider-handle').text($(this).slider('value'));
          item.find('#details-decimals').val(ui.value).trigger('change');
        },
        stop: function (e, ui) {
          console.log('status = input');
          options.status = 'input';
        },
      });

      // datepicker

      item.find('.ui-datepicker-calendar a').click(function (e) {
        e.preventDefault();
      });

      let datepicker_options = {
        dateFormat: 'yy-mm-dd',
        changeMonth: true,
        changeYear: true,
        yearRange: '1840:2030',
        numberOfMonths: 1,
        classes: {
          'ui-datepicker-div': 'shadow',
          'ui-datepicker-month': 'custom-select',
        },
      };

      options.elements.start_picker = $('#details-datepicker-start')
        .datepicker(datepicker_options)
        .on('change', function (e) {
          console.log($(this));
          $(document).trigger('update_input', [$(this), 'input']);

          options.elements.end_picker.datepicker(
            'option',
            'minDate',
            options.elements.start_picker.datepicker('getDate'),
          );
        });

      options.elements.end_picker = $('#details-datepicker-end')
        .datepicker(datepicker_options)
        .on('change', function (e) {
          $(document).trigger('update_input', [$(this), 'input']);

          options.elements.start_picker.datepicker(
            'option',
            'maxDate',
            options.elements.end_picker.datepicker('getDate'),
          );
        });

      // SELECT2

      $('#station-select').select2({
        language: options.lang,
        multiple: true,
        closeOnSelect: false,
        width: '100%',
        placeholder: $(this).attr('data-placeholder'),
      });

      // BOOTSTRAP COMPONENTS

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

      // overlays

      let offcanvas_els = {
        help: document.getElementById('help'),
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

      // threshold accordion

      options.elements.threshold_accordion = document.getElementById(
        'var-threshold-accordion',
      );

      options.elements.threshold_accordion.addEventListener(
        'show.bs.collapse',
        (e) => {
          // adjust download query based on
          // type of threshold

          console.log('show accordion', $(e.target).attr('id'));

          if ($(e.target).attr('id') == 'threshold-custom') {
            // custom:

            // hide the data layers - they're not applicable to a
            // custom input query
            // console.log('hide raster pane');
            item.find('.leaflet-raster-pane').hide();

            // set the request type
            options.request.type =
              options.query.dataset == 'ahccd' ? 'ahccd' : 'custom';
          } else {
            // preset:

            // show the data layer
            item.find('.leaflet-raster-pane').show();

            console.log('set request type to threshold');
            options.request.type = 'threshold';
          }

          // update controls
          plugin.set_controls(options.var_data.acf);

          // trigger any input change
          options.query_str.prev = options.query_str.current;

          options.query_str.current = $(document).cdc_app('query.eval', {
            query: options.query,
            do_history: 'replace',
            callback: function () {
              plugin.update_default_scheme(function () {
                console.log('accordion get layer');

                $(document).cdc_app(
                  'maps.get_layer',
                  options.query,
                  options.var_data,
                );

                options.status = 'ready';
              });
            },
          });
        },
      );

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
      });

      item.find('#var-select-query').fw_query({
        debug: false,
      });

      // Custom shapefile component
      options.elements.shapefile_upload = item
        .find('#area-aggregation-shapefile-input')
        .first()
        .shapefile_upload({
          message_container: '#area-aggregation-shapefile-message',
          maps: options.maps,
        });

      // SELECT2

      $('#area-search').select2({
        language: {
          inputTooShort: function () {
            let instructions = '<div class="geo-select-instructions">';

            instructions += '<div class="p-2 mb-2 border-bottom">';

            instructions +=
              '<h6 class="mb-1 text-gray-600 all-caps">' +
              T('Search communities') +
              '</h6>';

            instructions +=
              '<p class="mb-1 small">' + T('Begin typing city name') + '</p>';

            instructions += '</div>';

            instructions += '<div class="p-2">';

            instructions +=
              '<h6 class="mb-1 text-gray-600 all-caps">' +
              T('Search coordinates') +
              '</h6>';

            instructions +=
              '<p class="mb-0 small">' +
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
                '<div class="geo-select-instructions p-3"><h6 class="mb-3 text-gray-600 all-caps">' +
                  T('Coordinates detected') +
                  '</h6><p class="mb-0"><span class="geo-select-pan-btn btn btn-outline-secondary btn-sm rounded-pill px-4" data-lat="' +
                  term_lat +
                  '" data-lng="' +
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
    },

    init_events: function () {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      // MAP INTERACTIONS

      // zoom/drag

      for (let key in options.maps) {
        // create zoomend/dragend events
        // for each map

        options.maps[key].object
          .on('zoomend dragend', function (e) {
            // console.log(e, this);

            if (options.status != 'init') {
              console.log('zoomend start');
              // options.status = 'mapdrag';

              // update coord text fields
              $('#coords-lat').val(this.getCenter().lat);
              $('#coords-lng').val(this.getCenter().lng);
              $('#coords-zoom').val(this.getZoom());

              // if (options.status == 'mapdrag') {
              //   options.status = 'input';
              // }

              // update hidden coords field
              $('[data-query-key="coords"]')
                .val(
                  $('#coords-lat').val() +
                    ',' +
                    $('#coords-lng').val() +
                    ',' +
                    $('#coords-zoom').val(),
                )
                .trigger('change');

              // console.log('moved map', options.status);

              // simulate input event on coords field
              // $('#coords-lat').trigger('change');

              // if (options.status != 'init') {
              // update query value
              // $('[data-query-key="coords"]').each(function () {
              //   $(document).cdc_app('query.update_value', options.query, {
              //     item: $(this),
              //     key: 'coords',
              //     val: $(this).val(),
              //   });
              // });
              // }

              // update query string
              // options.query_str.prev = options.query_str.current;

              // options.query_str.current = $(document).cdc_app(
              //   'query.obj_to_url',
              //   options.query,
              //   'replace',
              // );

              console.log('zoomend done');
            }
          })
          .on('zoomend', function (e) {
            if (options.query.sector != 'station') {
              if (this.getZoom() >= 7) {
                item.find('#zoom-alert').fadeOut(250);
              }
            }
          });
      }

      // mouseover

      item.on(
        'map_item_mouseover',
        function (e, mouse_event, this_gid, style_obj) {
          this_gid = String(this_gid);

          style_obj = {
            ...{
              color: '#444',
              weight: 1,
              opacity: 1,
            },
            ...style_obj,
          };

          if (
            !options.query.selections.length ||
            (options.query.selections.length &&
              !options.query.selections.includes(this_gid))
          ) {
            for (let key in options.maps) {
              options.maps[key].layers.grid.setFeatureStyle(
                this_gid,
                style_obj,
              );
            }
          }
        },
      );

      // mouseout

      item.on(
        'map_item_mouseout',
        function (e, mouse_event, this_gid, style_obj) {
          this_gid = String(this_gid);

          style_obj = {
            ...{
              color: '#444',
              weight: 1,
              opacity: 1,
            },
            ...style_obj,
          };

          // console.log('mouseout', this_gid, options.query.selections);

          if (!options.query.selections.includes(this_gid)) {
            // not selected
            for (let key in options.maps) {
              options.maps[key].layers.grid.resetFeatureStyle(this_gid);
            }
          } else {
            style_obj.color = '#f00';

            for (let key in options.maps) {
              options.maps[key].layers.grid.setFeatureStyle(
                this_gid,
                style_obj,
              );
            }
          }
        },
      );

      // click

      item.on(
        'map_item_select',
        function (e, mouse_event, this_gid, style_obj) {
          // console.log('select ' + this_gid);

          this_gid = String(this_gid);

          // reset query.selections
          let selections = item
            .find('#area-selections')
            .val()
            .split(',')
            .filter(function (i) {
              return i;
            });

          // selections.forEach(function (selection, i) {
          //   if (selection != '') selections[i] = parseInt(selection);
          // });

          style_obj = {
            ...{
              color: '#f00',
              weight: 1,
              opacity: 1,
            },
            ...style_obj,
          };

          // console.log('select', this_gid, style_obj);

          // array includes the clicked area
          if (selections.includes(this_gid)) {
            // deselect - splice the gid from selections
            for (var i = selections.length - 1; i >= 0; i--) {
              if (selections[i] === this_gid) selections.splice(i, 1);
            }

            delete options.selection_data[this_gid];

            for (let key in options.maps) {
              options.maps[key].layers.grid.resetFeatureStyle(this_gid);
            }
          } else {
            // select - add gid to the array
            selections.push(this_gid);

            if (mouse_event.hasOwnProperty('latlng')) {
              options.selection_data[this_gid] = mouse_event.latlng;
            }

            for (let key in options.maps) {
              options.maps[key].layers.grid.setFeatureStyle(
                this_gid,
                style_obj,
              );
            }
          }

          if (options.query.sector != 'gridded_data' && selections.length > 1) {
            style_obj.color = '#fff';

            selections.forEach(function (selection, i) {
              if (i < selections.length - 1) {
                console.log('reset ' + selection);

                for (let key in options.maps) {
                  options.maps[key].layers.grid.setFeatureStyle(
                    selection,
                    style_obj,
                  );
                }
              }
            });

            selections = [selections[selections.length - 1]];
          }

          // console.log('selections', selections.join(','));

          // update input
          item
            .find('#area-selections')
            .val(selections.join(','))
            .trigger('change');
        },
      );

      // stations

      item.on(
        'map_station_select',
        function (e, mouse_event, this_gid, style_obj) {
          console.log('station click', this_gid);

          this_gid = String(this_gid);

          options.station.color = style_obj.color;

          let selections = item.find('#station-select').val();

          // convert values to integers
          // selections.forEach(function (selection, i) {
          //   if (selection != '') selections[i] = parseInt(selection);
          // });

          // console.log('current selections', selections);

          if (selections.includes(this_gid)) {
            // console.log('remove ' + this_gid);

            for (var i = selections.length - 1; i >= 0; i--) {
              if (selections[i] === this_gid) selections.splice(i, 1);
            }

            delete options.selection_data[this_gid];
          } else {
            // console.log('add ' + this_gid);
            selections.push(this_gid);

            options.selection_data[this_gid] = {
              properties: mouse_event.layer.feature.properties,
              latlng: mouse_event.latlng,
            };
          }

          plugin.update_station_markers(selections, this_gid, style_obj);

          // set station select2

          console.log('station select', selections);
          console.log('status = input');
          options.status = 'input';
          item.find('#station-select').val(selections).trigger('change');
        },
      );

      //
      // SIDEBAR CONTROLS
      //

      // search selection

      item.find('#area-search').on('select2:select', function (e) {
        console.log('selected', e.params.data);

        plugin.set_location({ lat: e.params.data.lat, lng: e.params.data.lon });
      });

      // area search pan to coords btn

      item.on('click', '.geo-select-pan-btn', function () {
        let first_map = options.maps[Object.keys(options.maps)[0]];

        let thislat = parseFloat($(this).attr('data-lat')),
          thislon = parseFloat($(this).attr('data-lng')),
          this_zoom = first_map.object.getZoom();

        if (this_zoom < 9) this_zoom = 9;

        first_map.object.setView([thislat, thislon], this_zoom);

        item
          .find('#select2-area-search-container')
          .text($(this).attr('data-lat') + ', ' + $(this).attr('data-lng'));

        item.find('#area-search').select2('close');
      });

      // station selection

      item.find('#station-select').on('select2:select', function (e) {
        let this_gid = String(e.params.data.id),
          selections = $(this).val();

        options.selection_data[this_gid] = {
          properties: {
            ID: e.params.data.id,
            Name: e.params.data.text,
          },
        };

        plugin.update_station_markers(selections, this_gid);
      });

      item.find('#station-select').on('select2:unselect', function (e) {
        let this_gid = String(e.params.data.id); //parseInt(e.params.data.id);
        let selections = $(this).val();

        // convert values to integers
        // selections.forEach(function (selection, i) {
        //   if (selection != '') selections[i] = parseInt(selection);
        // });

        plugin.update_station_markers(selections, this_gid);
      });

      // select/draw mode

      item.on('change', '[name="area-selection"]', function () {
        switch ($(this).val()) {
          case 'draw':
            plugin.enable_bbox();
            break;
          case 'select':
            plugin.disable_bbox();
            break;
        }
      });

      for (let key in options.maps) {
        options.maps[key].object.on('pm:create', function (e) {
          for (let key2 in options.maps) {
            options.maps[key2].layers.bbox = e.layer;
          }
          options.maps[key].layers.bbox.pm.enable({}); // enable editing
          options.maps[key].layers.bbox.on('pm:edit', function (e) {
            plugin.handle_bbox_event(e);
          });

          plugin.handle_bbox_event(e);
        });
      }

      // triggerable handler

      item.on('update_input', function (event, item, status) {
        // console.log('update input event', item.attr('id'), status);

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
        if ($(this).attr('data-query-key') == 'selections') {
          console.log(
            $(this).attr('data-query-key') +
              ': ' +
              options.query[$(this).attr('data-query-key')] +
              ' -> ' +
              $(this).val(),
          );
        }

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

      item.on('change', '.coord-field', function () {
        // repopulate the hidden coords field
        $('[data-query-key="coords"]').val(
          $('#coords-lat').val() +
            ',' +
            $('#coords-lng').val() +
            ',' +
            $('#coords-zoom').val(),
        );

        // trigger update event
        $(document).trigger('update_input', [$('[data-query-key="coords"]')]);
      });

      // TAB DRAWER

      // path change trigger

      item.on('td_update_path', function (event, prev_id, new_id) {
        // console.log('validate', prev_id + ' > ' + new_id);

        let prev_tab = item.find(prev_id),
          new_tab = item.find(new_id);

        if (prev_id == new_id) {
          // console.log("tab didn't change");
        } else if (new_tab.closest(prev_tab).length) {
          // console.log('tab is a child');
        } else {
          plugin.validate_tab(prev_id, new_id);
        }

        if (new_id != '#submit-result') {
          item
            .find('#submit-result')
            .removeClass('success')
            .removeClass('error');

          item.find('#result-head').text('');
          item.find('#result-btn .btn').hide();
        }
      });

      //
      // CUSTOM SHAPEFILE
      //

      // Show/hide the user custom shapefile on the map when the "Custom shapefile" radio button is selected/deselected
      item.find('input[name=area-aggregation]').on('change', function () {
        if (this.value === 'upload') {
          options.elements.shapefile_upload.shapefile_upload('show');
        } else {
          options.elements.shapefile_upload.shapefile_upload('hide');
        }
      });

      // Show information with the "more info" button.
      const tooltip_trigger = item
        .find('#area-aggregation-upload-tooltip')
        .first();
      tooltip_trigger.popover({
        trigger: 'hover',
        html: true,
        content: () => {
          return tooltip_trigger.find('span').first().html();
        },
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

      //
      // SUBMIT
      //

      item.find('#submit-email').on('change', function () {
        plugin.validate_tab('#submit');
      });

      item.find('#submit-captcha').on('input', function () {
        plugin.validate_tab('#submit');
      });

      item.on('click', '#submit-btn', function () {
        console.log('SUBMIT DATA');
        console.log(JSON.stringify(options.query, null, 4));

        plugin.process(options.query);
      });

      // HISTORY

      window.addEventListener('popstate', function (e) {
        console.log('POP');
        console.log('status = eval');
        options.status = 'eval';
        plugin.handle_pop(e);
      });
    },

    update_station_markers: function (selections, this_gid) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      let style_obj;

      this_gid = String(this_gid);
      console.log('update stations', selections, this_gid);

      // each map
      for (let key in options.maps) {
        // each marker
        options.maps[key].layers.stations.eachLayer(function (layer) {
          let feature_ID = layer.feature.properties.ID; //parseInt(layer.feature.properties.ID);

          if (options.query.var == 'weather-stations') {
            feature_ID = layer.feature.properties.STN_ID;
          }

          if (feature_ID == this_gid) {
            if (selections.includes(this_gid)) {
              if (options.query.dataset == 'ahccd') {
                layer.setIcon(ahccd_icons[layer.feature.properties.type + 'r']);
              } else {
                layer.setStyle({
                  fillColor: '#fff',
                  color: options.station.color,
                });
              }
            } else {
              if (options.query.dataset == 'ahccd') {
                layer.setIcon(ahccd_icons[layer.feature.properties.type]);
              } else {
                layer.setStyle({
                  fillColor: options.station.color,
                  color: '#fff',
                });
              }
            }
          }
        });
      }
    },

    handle_input: function (input, status) {
      console.log('--- start handle_input');

      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      if (!status) status = options.status;

      // console.log('handle input', input, status);

      let this_key = input.attr('data-query-key'),
        this_val = input.val();

      console.log(this_key, this_val, input);

      // if not a form element with a value attribute,
      // look for a data-query-val
      if (input.is('a')) {
        this_val = input.attr('data-query-val');
      }

      if (
        (input.attr('type') == 'text' || input.attr('type') == 'hidden') &&
        window.lodash.isEqual(options.query[this_key], this_val)
      ) {
        console.log("value hasn't changed");
        return true;
      }

      // custom UX behaviours by input key

      // console.log('input change', input, this_key, this_val);

      switch (this_key) {
        case 'var_id':
          plugin.update_var(this_val, status);
          break;

        case 'dataset':
          if (this_val == 'ahccd') {
            console.log('AHCCD STATIONS');
            options.query.sector = 'station';
            options.request.type = 'ahccd';

            // if AHCCD, disable sector

            // console.log('current', options.query.dataset);

            // item.find('#map-control-aggregation').hide();

            // show custom inputs
            if (!item.find('#threshold-custom').hasClass('show')) {
              item
                .find('#threshold-custom-head .accordion-button')
                .trigger('click');
            }

            // disable threshold
            item.find('#threshold-preset-btn').prop('disabled', true);
          } else {
            // console.log('NOT AHCCD');

            options.request.type = 'single';

            // enable threshold
            item.find('#threshold-preset-btn').prop('disabled', false);

            // if not AHCCD, make sure aggregation is set correctly
            // item.find('#map-control-aggregation').show();

            if (
              item.find(
                '#map-control-aggregation [value="' +
                  options.query.sector +
                  '"]',
              ).length
            ) {
              // query.sector has a matching input
              // make sure it's checked

              item
                .find(
                  '#map-control-aggregation [value="' +
                    options.query.sector +
                    '"]',
                )
                .prop('checked', true);
            } else if (
              item.find('#map-control-aggregation .form-check-input:checked')
                .length
            ) {
              // some other sector input is selected

              options.query.sector = item
                .find('#map-control-aggregation .form-check-input:checked')
                .val();
            } else {
              // nothing selected, trigger the first item

              item
                .find('#map-control-aggregation .form-check-input')
                .first()
                .prop('checked', true)
                .trigger('change');
            }

            // console.log('sector now: ' + options.query.sector);

            // update scenario names
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

            // populate the 'models' inputs

            console.log('--- MODELS ---');
            console.log(this_val);

            if (DATASETS.hasOwnProperty(this_val)) {
              let models_placeholder = item.find('#models-placeholder');

              models_placeholder.empty();

              DATASETS[this_val].model_lists.forEach(function (model) {
                let to_add =
                  '\n<div class="col">' +
                  '\n\t<div class="form-check">' +
                  '\n\t\t<input class="form-check-input" type="radio" name="details-models" id="details-models-{0}" value="{0}" data-query-key="models">' +
                  '\n\t\t<label class="form-check-label" for="details-models-{0}">{1}</label>' +
                  '\n\t</div>' +
                  '\n</div>';

                to_add = to_add.format(model.name, T(model.label));

                $(to_add).appendTo(models_placeholder);
              });

              if (item.find('[name="details-models"]:checked').length) {
                item.find('[name="details-models"]:checked').trigger('change');
              } else {
                item
                  .find('[name="details-models"]')
                  .first()
                  .prop('checked', true)
                  .trigger('change');
              }
            }
          }

          break;

        case 'percentiles':
          break;

        case 'scenarios':
          // ssp1/2/5 switches

          item.find('[data-query-key="scenarios"]').each(function () {
            // each radio

            // find the matching map panel
            let this_panel = $('#map-' + $(this).val());

            // hide it by default
            this_panel.addClass('hidden');

            if ($(this).prop('checked') == true) {
              this_panel.removeClass('hidden');
            }
          });

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

        case 'selections':
          console.log('handle selections', this_val);

          // convert string value to array of integers

          this_val = this_val.split(',').filter(function (i) {
            return i;
          });

          // this_val = [];

          // each selection
          // selections.forEach(function (this_gid) {
          //   this_val.push(parseInt(this_gid));
          // });

          options.query.selections = this_val;

          break;
        case 'station':
          // options.query.station = [];

          // rebuild array with integers
          // this_val.forEach(function (this_gid) {
          //   options.query.station.push(parseInt(this_gid));
          // });

          // keep this_val for later
          // this_val = options.query.station;

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

        case 'sector':
          // clear the current selections

          item.find('[data-query-key="selections"]').val('').trigger('change');

          item
            .find('#area-selection-select')
            .prop('checked', true)
            .trigger('change');

          // if (this_val == 'upload') {
          //   item.find('.leaflet-raster-pane').hide();
          //   item.find('.leaflet-grid-pane').hide();
          //   item.find('.leaflet-stations-pane').hide();
          // } else {
          //   item.find('.leaflet-raster-pane').show();
          //   item.find('.leaflet-grid-pane').show();
          //   item.find('.leaflet-stations-pane').show();
          // }

          break;
      }

      console.log('status', status);

      if (status == 'input' || status == 'slide') {
        // whether to pushstate on eval or not
        let do_history = status == 'slide' ? 'none' : 'push';

        if (this_key == 'coords') {
          do_history = 'replace';
        }

        // console.log(
        //   'call update_value',
        //   this_key,
        //   options.query[this_key],
        //   this_val,
        // );

        // use cdc helper function to
        // update the value in the query object
        $(document).cdc_app('query.update_value', options.query, {
          item: input,
          key: this_key,
          val: this_val,
        });

        // console.log('call eval');
        // console.log(JSON.stringify(options.query, null, 4));

        // run the query
        options.query_str.prev = options.query_str.current;

        options.query_str.current = $(document).cdc_app('query.eval', {
          query: options.query,
          do_history: do_history,
          callback: function () {
            console.log('eval callback');

            plugin.update_default_scheme(function () {
              console.log('handle_input get layer');

              $(document).cdc_app(
                'maps.get_layer',
                options.query,
                options.var_data,
              );

              if (status != 'init') {
                console.log('status ready');
                options.status = 'ready';
              }
            });
          },
        });
      } else {
        if (status != 'init') {
          console.log('status ready');
          options.status = 'ready';
        }
      }

      // eval/toggle conditional elements
      // based on new query values
      $(document).cdc_app('toggle_conditionals');

      // validate previous tabs
      // and reset next tabs

      let prev_tabs = $.map(
        item.find('.control-bar-tab-link.active').prevAll(),
        function (tab_link) {
          return $(tab_link).attr('href');
        },
      );

      let next_tabs = $.map(
        item.find('.control-bar-tab-link.active').nextAll(),
        function (tab_link) {
          return $(tab_link).attr('href');
        },
      );

      if (prev_tabs.length) plugin.validate_tabs(prev_tabs);
      if (next_tabs.length) plugin.reset_tabs(next_tabs);

      // plugin.validate_request();
      plugin.set_controls();

      console.log('--- end of handle_input');
    },

    refresh_inputs: function (query) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      status = options.status;

      // sync query objects
      options.query = query;

      // update control bar inputs from query

      for (let key in options.query) {
        // for each key in the query object

        // find input(s) that matches this key
        let this_input = item.find('[data-query-key="' + key + '"]');

        if (this_input.length) {
          // if (key == 'sector') {
          // console.log('refresh', key, this_input.val(), options.query[key]);
          // }

          if (Array.isArray(options.query[key])) {
            // query option is an array
            // that means the input allows multiple selections
            // i.e. checkboxes

            if (this_input.length) {
              this_input.each(function (i) {
                let do_update = false;
                if (key == 'coords') {
                  // specific action for hidden coords field
                  $(this).val(options.query[key].join(','));
                  do_update = true;
                } else if (key == 'selections') {
                  // console.log('UPDATE SELECTIONS');
                } else if (
                  $(this).is('[type="checkbox"]') &&
                  options.query[key].includes($(this).val()) &&
                  $(this).prop('checked') == false
                ) {
                  // checkbox
                  // this value is in the object
                  // but the box is not checked
                  $(this).prop('checked', true);
                  do_update = true;
                } else if ($(this).is('[type="hidden"]')) {
                  $(this).val(options.query[key].join(',')).trigger('change');
                  do_update = true;
                } else if ($(this).hasClass('select2')) {
                  console.log('update select');
                  console.log('status', status);
                  $(this).val(options.query[key]).trigger('change');
                }

                if (do_update == true) {
                  $(document).trigger('update_input', [$(this), status]);
                }
              });
            }
          } else {
            // query option is a single value
            // check out what type of input goes with it

            if (this_input.is('[type="hidden"]')) {
              // hidden input
              // likely controlled by some other UX element

              let this_val = parseInt(options.query[key]);

              if (key == 'start_year') {
                options.elements.start_slider.slider('value', this_val);
              } else if (key == 'end_year') {
                if (this_val <= parseInt(options.query.start_year)) {
                  this_val = options.query.end_year =
                    parseInt(options.query.start_year) + 5;
                }

                options.elements.end_slider.slider('value', this_val);
              }

              this_input.val(options.query[key]);

              if (key == 'var_id') {
                // console.log('var', options.query[key]);

                if (options.query[key] != null) {
                  plugin.update_var(options.query.var_id, status);
                }
              }
            } else if (this_input.is('[type="radio"]')) {
              // radio

              this_radio = item.find(
                '[data-query-key="' +
                  key +
                  '"][value="' +
                  options.query[key] +
                  '"]',
              );

              if (this_radio.prop('checked') != true) {
                // console.log('radio', this_radio);
                this_radio.prop('checked', true);
                $(document).trigger('update_input', [$(this_radio), 'init']);
              }
            } else if (this_input.is('select')) {
              if (this_input.val() != options.query[key]) {
                this_input.val(options.query[key]);
                $(document).trigger('update_input', [$(this_input), 'init']);
              }
            }

            // console.log('---');
          }
        } // if input
      }

      console.log('end of refresh_inputs');
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
            console.log('pop get_layer');
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

      if (status == null) status = options.status;

      options.var_flags.single = false;
      options.var_flags.custom = false;
      options.var_flags.threshold = false;
      options.var_flags.station = false;
      options.var_flags.ahccd = false;

      console.log('updating ' + var_id + ', ' + status);

      let hidden_input = item.find('[data-query-key="var"]');

      if (var_id != null && var_id != 'null') {
        // do we need to get var data

        if (
          options.var_data != undefined &&
          options.var_data.hasOwnProperty('id') &&
          options.var_data.id == var_id
        ) {
          // do nothing -
          // var data is already set,
          // and the ID is the same as
          // the one that was sent to the function
          // console.log('skip get_var_data');
        } else {
          console.log('get_var_data because var_id changed');
          $(document).cdc_app('get_var_data', var_id, function (data) {
            // console.log('get var data', data);

            // update var_data
            options.var_data = data;

            if (typeof options.var_data.acf.var_names != 'undefined') {
              if (status != 'init' && status != 'eval') {
                // update var in options.query
                options.query.var = options.var_data.acf.var_names[0].variable;

                // set hidden input
                hidden_input.val(data.acf.var_names[0].variable);
              }

              if (status == 'input') {
                hidden_input.trigger('change');
              }

              console.log('done');
            }

            // console.log('sector: ' + options.query.sector);

            if (typeof callback == 'function') {
              callback(data);
            }
          });
        }

        fields = options.var_data.acf;

        // set var_flags
        // for conditional showing/hiding of controls

        //
        // VAR FLAG: STATION
        //

        if (options.var_data.var_types.includes('Station Data')) {
          options.var_flags.station = true;
        } else {
          // find and trigger the checked sector radio
          // so that query.sector updates
          item.find('#map-control-aggregation .form-check-input:checked');
          // .trigger('change');
        }

        if (typeof fields.var_names != 'undefined') {
          //
          // VAR FLAG: AHCCD
          //

          if (fields.dataset_availability.includes('ahccd')) {
            options.var_flags.ahccd = true;
          }

          // var has at least 1 value in var_names

          if (fields.var_names.length > 1) {
            //
            // VAR FLAG: THRESHOLD
            //

            options.var_flags.threshold = true;

            // multiple vars

            if (options.elements.threshold_slider != null) {
              options.elements.threshold_slider
                .off('slide')
                .off('change')
                .off('stop');

              options.elements.threshold_slider.slider('destroy');
            }

            options.elements.threshold_slider = item
              .find('#threshold-slider')
              .slider({
                min: 0,
                max: fields.var_names.length - 1,
                step: 1,
                animate: true,
                create: function (e, ui) {
                  // console.log('threshold slider', 'create');

                  $(this)
                    .find('.ui-slider-handle')
                    .text(fields.var_names[0].label);
                },
                slide: function (e, ui) {
                  // update the hidden input/query

                  options.status = 'slide';

                  $(this)
                    .find('.ui-slider-handle')
                    .text(fields.var_names[ui.value].label);

                  options.query_str.prev = options.query_str.current;

                  options.query_str.current = $(document).cdc_app(
                    'query.eval',
                    {
                      query: options.query,
                      do_history: 'none',
                      callback: function () {
                        console.log('threshold slide get_layer');
                        $(document).cdc_app(
                          'maps.get_layer',
                          options.query, //clone_query,
                          options.var_data,
                        );
                      },
                    },
                  );
                },
                change: function (e, ui) {
                  hidden_input
                    .val(fields.var_names[ui.value].variable)
                    .trigger('change');
                },
                stop: function (e, ui) {
                  // if (status != 'init') {
                  console.log('status = input');
                  options.status = 'input';
                  // }
                },
              });

            // find out which index of the var_names array
            // is the field's value

            // console.log('find ' + options.query.var + ' in var_data');

            fields.var_names.forEach(function (var_name, i) {
              if (Object.values(var_name).includes(options.query.var)) {
                // console.log(i, var_name);

                options.elements.threshold_slider.slider('option', 'value', i);

                // set handle text
                options.elements.threshold_slider
                  .find('.ui-slider-handle')
                  .text(fields.var_names[i].label);
              }
            });

            // enable the thresholds accordion

            item
              .find('#threshold-preset-head .accordion-button')
              .prop('disabled', false);

            // show the thresholds accordion

            if (!item.find('#threshold-preset').hasClass('show')) {
              item
                .find('#threshold-preset-head .accordion-button')
                .trigger('click');
            }
          }

          if (
            fields.thresholds != undefined &&
            Array.isArray(fields.thresholds) &&
            fields.thresholds.length > 1
          ) {
            //
            // VAR FLAG: CUSTOM
            //

            options.var_flags.custom = true;

            // setup slider and custom inputs

            // populate custom inputs
            let output = '<p>';

            fields.thresholds.forEach(function (element) {
              switch (element.acf_fc_layout) {
                case 'text':
                  output += element.text;
                  break;

                case 'input':
                  output +=
                    '<input type="number" size="4" class="form-control form-control-sm threshold-input" autocomplete="off"' +
                    'name="' +
                    element.id +
                    '" ' +
                    'data-units="' +
                    element.units +
                    '" ' +
                    (element.min != '' ? 'min="' + element.min + '" ' : '') +
                    (element.max != '' ? 'max="' + element.max + '" ' : '');

                  if (element.decimals != '' && element.decimals != '0') {
                    output += 'step="0.';

                    decimal_places = parseInt(element.decimals);

                    for (i = 1; i < decimal_places; i++) {
                      output += '0';
                    }

                    output += '1"';
                  }

                  output +=
                    'data-validate="' +
                    T(
                      'Make sure a value is entered for each variable threshold.',
                    ) +
                    '"';

                  output += '>';
              }
            });

            output += '</p>';

            item.find('#threshold-custom .accordion-body').html(output);

            // enable the custom accordion

            item
              .find('#threshold-custom-head .accordion-button')
              .prop('disabled', false);

            if (options.var_flags.threshold == false) {
              if (!item.find('#threshold-custom').hasClass('show')) {
                item
                  .find('#threshold-custom-head .accordion-button')
                  .trigger('click');
              }
            }
          }

          console.log('flags now', options.var_flags);

          if (
            options.var_flags.station == false &&
            options.var_flags.threshold == false &&
            options.var_flags.custom == false
          ) {
            //
            // VAR FLAG: SINGLE
            // no flags were set so assume single
            //

            options.var_flags.single = true;

            item
              .find('#threshold-preset-head .accordion-button')
              .addClass('disabled')
              .prop('disabled', true);

            // if (!item.find('#threshold-custom').hasClass('show')) {
            //   item
            //     .find('#threshold-custom-head .accordion-button')
            //     .trigger('click');
            // }
          }

          // console.log('flags');
          // console.log(options.var_flags);

          // set breadcrumb & overlay content

          item
            .find('#breadcrumb-variable')
            .text(
              options.lang != 'en'
                ? options.var_data.meta.title_fr
                : options.var_data.title.rendered,
            )
            .show();
        }

        // set request type

        if (
          options.var_flags.custom == true &&
          (options.var_flags.threshold == false ||
            item.find('#var-thresholds .collapse.show').attr('id') ==
              'threshold-custom')
        ) {
          options.request.type = 'custom';
        } else if (
          options.var_flags.threshold == true &&
          (options.var_flags.custom == false ||
            item.find('#var-thresholds .collapse.show').attr('id') ==
              'threshold-preset')
        ) {
          // console.log('set request type to threshold');
          options.request.type = 'threshold';
        } else if (options.var_flags.station == true) {
          options.request.type = 'station';
        } else if (options.var_flags.single == true) {
          options.request.type = 'single';
        }

        console.log('request type is now ' + options.request.type);

        plugin.set_controls(fields);
      }
    },

    set_controls: function (fields) {
      console.log('--- start set_controls');

      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      let items_to_hide = [],
        items_to_show = [];

      // VAR FLAGS

      // console.log(options.var_flags);

      console.log('set controls');
      console.log('request type', options.request.type);

      // each item with flag conditions
      item.find('[data-flags]').each(function () {
        let condition_met = false;

        // each condition
        $(this)
          .attr('data-flags')
          .split(',')
          .forEach(function (condition) {
            // split key & val
            let split_attr = condition.split(':');
            // split_attr[1] = split_attr[1] == '1' ? true : false;

            // console.log(split_attr[0] + ' has to be ' + split_attr[1]);

            if (options.var_flags[split_attr[0]] == split_attr[1]) {
              // console.log('condition met');
              condition_met = true;
            }
          });

        if (condition_met == true) {
          $(this).show();
        } else {
          $(this).hide();
        }
      });

      // each item with request conditions
      item.find('[data-request]').each(function () {
        let condition_met = false;

        // each condition
        $(this)
          .attr('data-request')
          .split(',')
          .forEach(function (condition) {
            // console.log('request has to be ' + options.request.type);

            if (options.request.type == condition) {
              condition_met = true;
            }
          });

        if (condition_met == true) {
          $(this).show();
        } else {
          $(this).hide();
        }
      });

      // THRESHOLDS

      if (options.request.type == 'threshold') {
        // console.log('select threshold accordion');

        if (item.find('#threshold-preset-btn').hasClass('collapsed')) {
          item.find('#threshold-preset-btn').trigger('click');
        }
      }

      // dataset

      if (fields) {
        // console.log('DATASETS', fields.dataset_availability);

        // enable all
        item
          .find('#map-control-dataset .form-check-input')
          .prop('disabled', false);

        item.find('#map-control-dataset .form-check-input').each(function () {
          // dataset isn't available to the variable
          if (!fields.dataset_availability.includes($(this).val())) {
            $(this).prop('disabled', true);

            if ($(this).prop('checked') == true) $(this).prop('checked', false);
          }
        });

        console.log('done enabling datasets');

        console.log(item.find('#map-control-dataset :checked'));

        if (
          !item.find('#map-control-dataset :input:not([disabled]):checked')
            .length
        ) {
          console.log('nothing is checked');

          // nothing is checked
          // find the first enabled input and check it

          console.log(
            'first',
            item.find('#map-control-dataset :input:not([disabled])').first(),
          );

          item
            .find('#map-control-dataset :input:not([disabled])')
            .first()
            .prop('checked', true);
        }

        console.log(
          'trigger',
          item.find('#map-control-dataset :input:checked'),
        );

        item.find('#map-control-dataset :input:checked').trigger('change');

        // AREA TAB

        // aggregration
        // fields.availability
        // checkboxes - grid/census/health/watershed

        if (
          options.request.type != 'station' &&
          options.request.type != 'ahccd'
        ) {
          item.find('#map-control-aggregation').show();

          // enable all
          item
            .find('#map-control-aggregation .form-check-input')
            .prop('disabled', false);

          item
            .find(
              '#map-control-aggregation .form-check-input:not(#area-aggregation-upload)',
            )
            .each(function () {
              // sector isn't available to the variable
              if (!fields.availability.includes($(this).val())) {
                $(this).prop('disabled', true);

                console.log('unchek', $(this));
                if ($(this).prop('checked') == true)
                  $(this).prop('checked', false);
              }
            });

          if (!item.find('#map-control-aggregation :checked').length) {
            // nothing is checked
            // find the first enabled input and check it

            item
              .find(
                '#map-control-aggregation .form-check-input:not([disabled])',
              )
              .first()
              .prop('checked', true);
            // .trigger('change');
          }

          item.find('#map-control-aggregation :checked').trigger('change');
        } else {
          item.find('#map-control-aggregation').hide();
        }

        // selection mode

        if (options.var_data.var_types.includes('Station Data')) {
          item
            .find('#area-selection-select')
            .prop('checked', true)
            .trigger('change');
        }

        // DETAILS TAB

        // frequency
        // fields.timestep
        // checkboxes - Annual, Monthly, 2QS-APR, QS-DEC (Seasonal), Daily

        plugin.update_frequency();
      }

      console.log('--- end of set_controls');
    },

    update_frequency: function () {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      // console.log('UPDATE FREQUENCY');

      // select or radio

      if (item.find('#map-control-frequency-radio').is(':visible')) {
        if (
          item.find(
            '#map-control-frequency-radio [value="' +
              options.query.frequency +
              '"]',
          ).length
        ) {
          item
            .find(
              '#map-control-frequency-radio [value="' +
                options.query.frequency +
                '"]',
            )
            .prop('checked', true)
            .trigger('change');
        } else {
          // select first item
          item
            .find('[type="radio"][name="details-frequency"]')
            .first()
            .prop('checked', true)
            .trigger('change');
        }
      } else if (item.find('#map-control-frequency-select').is(':visible')) {
        // console.log('select');

        let frequency_select = item.find('select[data-query-key="frequency"]');

        // empty the existing select
        frequency_select.empty();

        // console.log('variable timesteps', options.var_data.acf.timestep);

        if (!options.var_data.acf.timestep.length) {
          // no timesteps
          frequency_select.prop('disabled', true);
        } else {
          frequency_select.prop('disabled', false);

          options.var_data.acf.timestep.forEach(function (option) {
            if (options.frequency.hasOwnProperty(option)) {
              let this_option = options.frequency[option];

              // console.log('preselect', options.query.frequency);

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
                      '"' +
                      (options.query.frequency == item.value
                        ? ' selected'
                        : '') +
                      '>' +
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
                    '"' +
                    (options.query.frequency == item.value ? ' selected' : '') +
                    '>' +
                    this_option.label +
                    '</option>',
                );
              }
            }
          });

          // console.log('available', options.var_data.acf.timestep);
          // console.log('selected', options.query.frequency);

          if (
            frequency_select.find('[value="' + options.query.frequency + '"]')
              .length
          ) {
            frequency_select.val(options.query.frequency);
          } else if (
            !options.var_data.acf.timestep.includes(options.query.frequency)
          ) {
            console.log(
              'select first',
              frequency_select.find('option').first(),
            );

            frequency_select.val(
              frequency_select.find('option').first().attr('value'),
            );
          }

          frequency_select.trigger('change');
        }
      }
    },

    set_location: function (coords) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      $.ajax({
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
          console.log('LOCATION');
          console.log(data);

          // match coords var to lat/lng returned by the function
          coords = { lat: data.lat, lng: data.lng };

          // search field value
          if (data.geo_name != 'Point') {
            item.find('#area-search').val(data.title);
          }
        },
      }).then(function () {
        console.log('set offset');
        // set map center to marker location w/ offset
        $(document).cdc_app('maps.set_center', coords, 10);
      });
    },

    validate_tabs: function (tabs) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      console.log(tabs);

      function process_validate_queue(tabs) {
        $.when(plugin.validate_tab(tabs[0])).done(function (is_valid) {
          console.log(tabs[0], is_valid);

          const shift_tab = tabs.shift();

          if (tabs.length > 0) {
            // console.log('again', tabs[0]);
            process_validate_queue(tabs);
          }
        });
      }

      process_validate_queue(tabs);
    },

    validate_tab: function (prev_id, new_id) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      console.log('validate tab', prev_id);

      let prev_tab = item.find(prev_id),
        new_tab = item.find(new_id),
        is_valid = true,
        invalid_messages = [],
        tab_items = item.find('#control-bar-tabs'),
        tab_alert = $(prev_id).find('.invalid-alert'),
        msg_list = tab_alert.find('ul');

      tab_items.find('[href="' + new_id + '"]').removeClass('invalid');

      msg_list.empty();

      // each validate-able input in this tab

      $(prev_id)
        .find('[data-validate]')
        .each(function () {
          let this_input = $(this),
            validate_this = true;

          // console.log('checking', this_input);

          if (!this_input.is(':visible') && !this_input.is('[type="hidden"]')) {
            validate_this = false;
          } else {
            // console.log(':visible or [hidden]');

            if (this_input.attr('data-request') !== undefined) {
              // console.log('has request attr');
              let this_request = this_input.attr('data-request').split(',');

              if (!this_request.includes(options.request.type)) {
                validate_this = false;
              }
            }

            if (this_input.attr('data-query-key') == 'selections') {
              // console.log('checking selections');

              // is the right sector radio is selected

              if (
                ['ahccd', 'station', 'upload'].includes(options.query.sector)
              ) {
                console.log(options.query.sector + ' is in the array');

                validate_this = false;
              }

              // if gridded, is 'select' mode turned on
              if (options.query.sector == 'gridded_data') {
                validate_this = item
                  .find('#area-selection-select')
                  .prop('checked');
              }
            }
          }

          if (validate_this == true) {
            let input_to_check = this_input,
              valid_msg = this_input.attr('data-validate');

            // if data-validate is an ID,
            // check the value of that input instead

            if (valid_msg.charAt(0) == '#') {
              input_to_check = item.find(valid_msg);
              valid_msg = input_to_check.attr('data-validate');
            }

            // console.log('check', input_to_check, valid_msg);

            // check for blank value
            if (input_to_check.val() == '' || input_to_check.val() == 'null') {
              tab_items.find('[href="' + prev_id + '"]').addClass('invalid');
              invalid_messages.push(valid_msg);
            }
          }
        });

      // custom validation by tab

      if (prev_id == '#data') {
      } else if (prev_id == '#area') {
        console.log(options.request);

        if (
          options.query.sector == 'gridded_data' &&
          item.find('#area-selection-draw').prop('checked') == true &&
          !options.query.hasOwnProperty('bbox')
        ) {
          invalid_messages.push('Draw an area on the map');
        }

        if (options.query.sector === 'upload') {
          // Validate the custom shapefile
          const validation_message =
            options.elements.shapefile_upload.shapefile_upload('validate');
          if (validation_message != null) {
            invalid_messages.push(validation_message);
          }
        }
      }

      // console.log(invalid_messages);

      if (invalid_messages.length) {
        is_valid = false;

        tab_items.find('[href="' + prev_id + '"]').addClass('invalid');

        // append messages
        invalid_messages.forEach(function (msg) {
          msg_list.append('<li> ' + msg + '</li>');
        });

        // show the alert
        tab_alert.show();
      } else {
        // no invalid messages
        tab_items.find('[href="' + prev_id + '"]').removeClass('invalid');
        // hide the alert
        tab_alert.hide();
      }

      if (new_id == '#submit') {
        // refresh captcha

        if (
          options.request.type == 'custom' ||
          options.request.type == 'ahccd'
        ) {
          plugin.refresh_captcha();
        }

        // validate this tab right away
        // so that the submit button isn't
        // incorrectly enabled

        plugin.validate_tabs(
          $.map(item.find('.control-bar-tab-link'), function (tab_link) {
            return $(tab_link).attr('href');
          }),
        );

        // plugin.validate_request();
      }

      //

      if (tab_items.find('.invalid').length) {
        console.log('disable btn');
        item.find('#submit-btn').addClass('disabled');
      } else {
        console.log('enable btn');
        item.find('#submit-btn').removeClass('disabled');
      }

      return is_valid;
    },

    reset_tabs: function (tabs) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      tabs.forEach(function (tab_id) {
        plugin.reset_tab(tab_id);
      });
    },

    reset_tab: function (tab_id) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      let tab_alert = $(tab_id).find('.invalid-alert');

      // remove alert icon
      item
        .find('#control-bar-tabs')
        .find('[href="' + tab_id + '"]')
        .removeClass('invalid');

      // empty and hide alert message
      tab_alert.find('ul').empty();
      tab_alert.hide();
    },

    validate_request: function () {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      options.request.is_valid = true;
      options.request.inputs = [];

      console.log('validating request');

      // console.log(JSON.stringify(options.query, null, 4));

      // what kind of request is it
      // single - straight variable data
      // inputs - var with custom thresholds
      // station - station data
      // ahccd - var data with station selections

      // console.log('flags', options.var_flags);

      console.log('request type', options.request.type);

      switch (options.request.type) {
        case 'station':
          // station data

          // check start/end dates

          // check for station selection

          // if (options.query.station.length < 1) {
          //   console.warn('validate', 'no stations selected');
          //   options.request.is_valid = false;
          // }

          break;

        case 'custom':
          // custom inputs

          item.find('#threshold-custom :input').each(function () {
            if ($(this).val() == '') {
              console.warn('validate', 'empty threshold input');
              options.request.is_valid = false;
            }

            options.request.inputs.push({
              name: $(this).attr('name'),
              value: $(this).val(),
              units: $(this).attr('data-units'),
            });
          });

          // selections

          if (options.query.dataset == 'ahccd') {
            options.request.type = 'ahccd';

            if (options.query.station.length < 1) {
              console.warn('validate', 'no stations selected');
              options.request.is_valid = false;
            }
          } else {
            if (options.query.sector == 'upload') {
              // check for selected feature
              let shapefile_selection =
                options.elements.shapefile_upload.shapefile_upload(
                  'selected_shapes_json',
                );

              if (shapefile_selection.includes('[null]')) {
                console.warn('validate', 'no custom shapefile items selected');
                options.request.is_valid = false;
              }
            }

            if (options.query.selections.length < 1) {
              console.warn('validate', 'no items selected');
              options.request.is_valid = false;
            }
          }

          // email address

          if (validate_email(item.find('#submit-email').val()) !== true) {
            console.warn('validate', 'invalid email');
            options.request.is_valid = false;
          }

          break;

        case 'threshold':
        case 'single':
          if (options.query.selections.length < 1) {
            console.warn('validate', 'no items selected');
            options.request.is_valid = false;
          }

          break;
      }

      console.log('validate query', options.request.is_valid);

      if (options.request.is_valid == true) {
        console.log('enable btn');
        item.find('#submit-btn').removeClass('disabled');
      } else {
        console.log('disable btn');
        item.find('#submit-btn').addClass('disabled');
      }

      // console.log(JSON.stringify(options.query, null, 4));
    },

    process: function (query) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      console.log('PROCESS');
      console.log('type', options.request.type);
      console.log('query', query);

      let form_obj, submit_data;

      let frequency_code = query.frequency.toLowerCase();

      let result_tab = item.find('#submit-result'),
        result_head = result_tab.find('#result-head'),
        result_content = result_tab.find('#result-message'),
        result_btn = result_tab.find('#result-btn a');

      result_head.text('');
      result_content.html('');

      result_tab.removeClass('error').removeClass('success');

      if (!result_tab.hasClass('td-selected')) {
        $('#control-bar').tab_drawer('update_path', '#submit-result', false);
      }

      switch (options.request.type) {
        case 'station':
          let station_url =
            'https://api.weather.gc.ca/collections/climate-daily/items' +
            '?datetime=' +
            query.start_date +
            '%2000:00:00/' +
            query.end_date +
            '%2000:00:00' +
            '&STN_ID=' +
            query.station.join('|') +
            '&sortby=PROVINCE_CODE,STN_ID,LOCAL_DATE&f=' +
            query.format +
            '&limit=150000&startindex=0';

          result_head.text(T('Success') + '!');
          result_content.text(T('Click below to download your data'));

          result_btn.attr('href', station_url).show();
          result_btn.show();

          result_tab.removeClass('error').addClass('success');

          // item
          //   .find('#station-submit-btn')
          //   .attr('href', station_url)
          //   .removeClass('disabled');

          break;

        case 'ahccd':
          console.log('AHCCD');

          form_obj = {
            inputs: [
              {
                id: 'output_format',
                data: query.format,
              },
            ],
            response: 'document',
            mode: 'auto',
            outputs: [
              {
                transmissionMode: 'reference',
                id: 'output',
              },
            ],
            notification_email: item.find('#submit-email').val(),
          };

          // inputs

          item.find('#threshold-custom :input').each(function () {
            form_obj.inputs.push({
              id: $(this).attr('name'),
              data: $(this).val() + ' ' + $(this).attr('data-units'),
            });
          });

          // frequency

          if (period_frequency_lut.hasOwnProperty(frequency_code)) {
            frequency_code = period_frequency_lut[frequency_code];
          }

          form_obj.inputs.push({
            id: 'freq',
            data: frequency_code.toUpperCase(),
          });

          // missing data options

          let missing = query.check_missing;

          if (missing != 'wmo') {
            missing = 'pct';

            form_obj.inputs.push({
              id: 'missing_options',
              data: JSON.stringify({
                pct: {
                  tolerance: parseFloat(query.check_missing),
                },
              }),
            });
          }

          form_obj.inputs.push({
            id: 'check_missing',
            data: missing,
          });

          // filename

          let filename = options.var_data.acf.finch_var;

          if (query.station.length == 1) {
            let first_station = options.selection_data[query.station[0]];

            if (first_station.hasOwnProperty('properties')) {
              if (first_station.properties.hasOwnProperty('Name')) {
                filename += '_' + first_station.properties.Name;
              }
            }
          }

          form_obj.inputs.push({
            id: 'output_name',
            data: filename,
          });

          // decimals

          if (query.format == 'csv') {
            form_obj.inputs.push({
              id: 'csv_precision',
              data: query.hasOwnProperty('decimals') ? query.decimals : 2,
            });
          }

          //

          console.log(query.station);

          submit_data = {
            captcha_code: item.find('#submit-captcha').val(),
            namespace: 'analyze',
            signup: item.find('#submit-subscribe').is(':checked'),
            request_data: form_obj,
            required_variables:
              options.var_data.acf.required_variables.split('|'),
            stations: query.station.join(','),
            submit_url:
              '/providers/finch/processes/' +
              options.var_data.acf.finch_var +
              '/jobs',
          };

          console.log('submit data');
          console.log(JSON.stringify(submit_data, null, 4));

          // submit
          $.ajax({
            url: ajax_data.rest_url + 'cdc/v2/finch_submit/',
            method: 'POST',
            data: submit_data,
            dataType: 'json',
            success: function (data) {
              console.log(data);

              if (data.status == 'accepted') {
                result_head.text(T('Success') + '!');
                result_content.html(data.description);

                result_tab.removeClass('error').addClass('success');
              } else {
                result_head.text(T('Error'));
                result_content.html('Captcha failed. Please try again.');

                result_tab.removeClass('success').addClass('error');

                plugin.refresh_captcha();
              }
            },
            complete: function () {
              plugin.refresh_captcha();
            },
          });

          break;

        case 'custom':
          let submit_path = 'grid_point';

          form_obj = {
            inputs: [
              {
                id: 'average',
                data: query.sector != 'gridded_data' ? 'True' : 'False',
              },
              {
                id: 'start_date',
                data: query.start_year,
              },
              {
                id: 'end_date',
                data: query.end_year,
              },
              {
                id: 'ensemble_percentiles',
                data: query.percentiles.join(','),
              },
              {
                id: 'dataset',
                data: DATASETS[query.dataset].finch_name,
              },
              {
                id: 'output_format',
                data: query.format,
              },
              {
                id: 'data_validation',
                data: 'warn',
              },
            ],
            response: 'document',
            mode: 'auto',
            outputs: [
              {
                transmissionMode: 'reference',
                id: 'output',
              },
            ],
            notification_email: item.find('#submit-email').val(),
          };

          // inputs

          item.find('#threshold-custom :input').each(function () {
            form_obj.inputs.push({
              id: $(this).attr('name'),
              data: $(this).val() + ' ' + $(this).attr('data-units'),
            });
          });

          // frequency

          if (period_frequency_lut.hasOwnProperty(frequency_code)) {
            frequency_code = period_frequency_lut[frequency_code];
          }

          form_obj.inputs.push({
            id: 'freq',
            data: frequency_code.toUpperCase(),
          });

          // scenario
          query.scenarios.forEach(function (scenario) {
            form_obj.inputs.push({
              id: 'scenario',
              data: scenario_names[query.dataset][scenario]
                .replace(/[\W_]+/g, '')
                .toLowerCase(),
            });
          });

          // lat/lng

          if (query.sector == 'gridded_data') {
            // gridded: comma separated values of each selection

            let lat_str = '',
              lng_str = '';

            Object.keys(options.selection_data).forEach(function (gid, i) {
              if (i != 0) {
                lat_str += ',';
                lng_str += ',';
              }

              lat_str += options.selection_data[gid].lat;
              lng_str += options.selection_data[gid].lng;
            });

            form_obj.inputs.push({
              id: 'lat',
              data: lat_str,
            });

            form_obj.inputs.push({
              id: 'lon',
              data: lng_str,
            });
          } else if (query.sector == 'upload') {
            // custom shapefile

            let shapefile_selection =
              options.elements.shapefile_upload.shapefile_upload(
                'selected_shapes_json',
              );

            submit_path = 'polygon';

            form_obj.inputs.push({
              id: 'shape',
              data: shapefile_selection,
            });
          } else {
            // sector: convert sector bounds to coords

            $.ajax({
              url:
                geoserver_url +
                '/partition-to-points/' +
                options.var_data.acf.grid +
                '/' +
                query.sector +
                '/' +
                query.selections.join('') +
                '.json',
              dataType: 'json',
              async: false,
              success: function (lutBySectorId) {
                // console.log(sectorCoord);

                form_obj.inputs.push({
                  id: 'lat',
                  data: lutBySectorId.map((x) => x[0]).join(','),
                });

                form_obj.inputs.push({
                  id: 'lon',
                  data: lutBySectorId.map((x) => x[1]).join(','),
                });
              },
            });
          }

          // models

          if (query.models == '') {
            query.models = item.find('[name="details-models"]:checked').val();
          }

          form_obj.inputs.push({
            id: 'models',
            data: query.models,
          });

          // decimals
          if (query.format == 'csv') {
            form_obj.inputs.push({
              id: 'csv_precision',
              data: query.hasOwnProperty('decimals') ? query.decimals : 2,
            });
          }

          submit_data = {
            captcha_code: item.find('#submit-captcha').val(),
            namespace: 'analyze',
            signup: item.find('#submit-subscribe').is(':checked'),
            request_data: form_obj,
            submit_url:
              '/providers/finch/processes/ensemble_' +
              submit_path +
              '_' +
              options.var_data.acf.finch_var +
              '/jobs', // ex: wetdays/jobs
          };

          console.log('submit data');
          console.log(JSON.stringify(submit_data, null, 4));

          // check captcha
          $.ajax({
            url: ajax_data.rest_url + 'cdc/v2/finch_submit/',
            method: 'POST',
            data: submit_data,
            dataType: 'json',
            success: function (data) {
              // let response = JSON.parse(data);

              console.log(data);

              if (data.status == 'accepted') {
                result_head.text(T('Success') + '!');
                result_content.html(data.description);

                result_tab.removeClass('error').addClass('success');
              } else {
                result_head.text(T('Error'));
                result_content.html('Captcha failed. Please try again.');

                result_tab.removeClass('success').addClass('error');
                plugin.refresh_captcha();
              }
            },
            complete: function () {
              plugin.refresh_captcha();
            },
          });

          break;

        case 'threshold':
        case 'single':
          let pointsInfo = '',
            pointsData;

          dataLayerEventName = getGA4EventNameForVariableDataBCCAQv2();

          // console.log(query);

          // aggregation
          // - bbox
          // - selected grid items

          if (query.hasOwnProperty('bbox')) {
            pointsInfo = 'BBox: ' + query.bbox.join(',');
            pointsData = {
              bbox: query.bbox,
            };
          } else {
            pointsData = { points: [] };

            for (var i = 0; i < query.selections.length; i++) {
              point = options.selection_data[query.selections[i]];

              // console.log(point);

              if (i != 0) pointsInfo += ' ; ';

              pointsInfo +=
                'GridID: ' +
                query.selections[i] +
                ', Lat: ' +
                point.lat +
                ', Lng: ' +
                point.lng;

              pointsData.points.push([point.lat, point.lng]);
            }
          }

          // format = query.format;
          let dataset_name = query.dataset;

          // TODO: add input to select 'allyears' or '30ygraph'
          let selectedDatasetType = 'allyears';
          //$(
          //  'input[name="download-dataset-type"]:checked',
          //).val();

          let format_extension = query.format == 'netcdf' ? 'nc' : query.format;

          if (query.var !== 'all') {
            $('body').addClass('spinner-on');

            let frequency_code = query.frequency;

            freq_keys = Object.keys(period_frequency_lut);
            freq_vals = Object.values(period_frequency_lut);

            if (freq_vals.indexOf(query.frequency) !== -1) {
              frequency_code = freq_keys[freq_vals.indexOf(query.frequency)];
            }

            request_args = {
              var: query.var,
              month: frequency_code,
              dataset_name: query.dataset,
              dataset_type: selectedDatasetType,
              format: query.format,
            };

            Object.assign(request_args, pointsData);

            let xhttp = new XMLHttpRequest();

            xhttp.onreadystatechange = function () {
              if (xhttp.readyState === XML_HTTP_REQUEST_DONE_STATE) {
                if (xhttp.status === 200) {
                  result_head.text(T('Success') + '!');
                  result_content.text(T('Click below to download your data'));

                  result_btn
                    .attr('href', window.URL.createObjectURL(xhttp.response))
                    .attr(
                      'download',
                      'file_name_goes_here' + '.' + format_extension,
                    )
                    .show();

                  result_tab.removeClass('error').addClass('success');

                  $('body').removeClass('spinner-on');
                } else {
                  result_head.text(T('An error occurred'));
                  result_content.text(T('Please try again later'));
                  result_btn.hide();
                  result_tab.removeClass('success').addClass('error');
                }
              }
            };

            console.log('request', request_args);

            xhttp.open('POST', geoserver_url + '/download');
            xhttp.setRequestHeader('Content-Type', 'application/json');
            xhttp.responseType = 'blob';
            xhttp.send(JSON.stringify(request_args));
          } else {
            /*
            
            TODO
            
            // call download for all matching variables and build a zip file
            selectedTimeStepCategory = $('#download-frequency')
              .find(':selected')
              .data('timestep');
            varToProcess = [];

            varData.forEach(function (varDetails, k) {
              if (
                k !== 'all' &&
                varDetails.grid === 'canadagrid' &&
                varDetails.timestep.includes(selectedTimeStepCategory)
              ) {
                varToProcess.push(k);
              }
            });

            $('body').addClass('spinner-on');
            var dl_status = 0;
            var dl_fraction = $(
              '<p id="dl-fraction" style="position: absolute; left: 30%; bottom: 30%; width: 40%; padding-bottom: 1em; text-align: center;"><span>' +
                dl_status +
                '</span> / ' +
                varToProcess.length +
                '</p>',
            ).appendTo($('.spinner'));
            var dl_progress = $(
              '<div class="dl-progress" style="position: absolute; left: 0; bottom: 0; width: 0; height: 4px; background: red;">',
            ).appendTo(dl_fraction);
            var i = 0;
            var zip = new JSZip();

            function download_all() {
              if (i < varToProcess.length) {
                request_args = {
                  var: varToProcess[i],
                  month: month,
                  dataset_name: dataset_name,
                  dataset_type: selectedDatasetType,
                  format: format,
                };
                Object.assign(request_args, pointsData);
                let xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                  if (xhttp.readyState === 4 && xhttp.status === 200) {
                    zip.file(
                      $('#download-filename').val() +
                        '-' +
                        varToProcess[i] +
                        '.' +
                        format_extension,
                      xhttp.response,
                    );

                    dl_fraction.find('span').html(i);
                    dl_progress.css(
                      'width',
                      (i / varToProcess.length) * 100 + '%',
                    );
                    if (i == varToProcess.length - 1) {
                      // last one
                      $('body').removeClass('spinner-on');
                      dl_fraction.remove();
                      dl_progress.remove();
                      zip
                        .generateAsync({ type: 'blob' })
                        .then(function (content) {
                          saveAs(
                            content,
                            $('#download-filename').val() + '.zip',
                          );
                        });
                    }

                    i++;
                    download_all();
                  }
                };
                xhttp.open('POST', data_url + '/download');
                xhttp.setRequestHeader('Content-Type', 'application/json');
                xhttp.responseType = 'blob';
                xhttp.send(JSON.stringify(request_args));
              }
            }

            download_all();
            
            */
          }

          break;
      }
    },

    refresh_captcha: function () {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      if (typeof window.captcha_img_audioObj !== 'undefined')
        captcha_img_audioObj.refresh();

      document.getElementById('captcha_img').src =
        '/site/assets/themes/fw-child/resources/php/securimage/securimage_show.php?namespace=analyze&' +
        Math.random();

      item.find('#submit-captcha').val('');
    },

    create_file_name: function (form_inputs) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      let file_name = '{0}_{1}_{2}_{3}_{4}.{5}';
      let dataset = 'CanDCS-u5';
      console.log(form_inputs);

      // dataset
      if (form_inputs['dataset'] == 'cmip6') dataset = 'CanDCS-u6';
      if (form_inputs['dataset'] == 'humidex') dataset = 'HUMIDEX';

      // location
      let location =
        form_inputs['analyze-location'].charAt(0).toUpperCase() +
        form_inputs['analyze-location'].slice(1);
      if (form_inputs['shape'] != '') location += '_' + form_inputs['shape'];

      // time
      let time = 'from_{0}_to_{1}'.format(
        form_inputs['start_date'],
        form_inputs['end_date'],
      );

      // variables
      let variables = {
        wetdays: { label: 'WetDays', vars: '_qt_<thresh>' },
        sdii: { label: 'AverageWetDayPreciIntens', vars: '_qt_<thresh>' },
        cwd: { label: 'MaxConsWetDays', vars: '_qt_<thresh>' },
        cdd: { label: 'MaxConsDryDays', vars: '_qt_<thresh>' },
        tx_tn_days_above: {
          label: 'DaysAboveTmaxAndTmin',
          vars: '_<thresh_tasmin>_to_<thresh_tasmax>',
        },
        tx_days_above: { label: 'DaysAboveTmax', vars: '_<thresh>' },
        tropical_nights: { label: 'DaysAboveTmin', vars: '_<thresh>' },
        tn_days_below: { label: 'DaysBelowTmin', vars: '_<thresh>' },
        cooling_degree_days: {
          label: 'DegDaysAboveThreshold',
          vars: '_<thresh>',
        },
        heating_degree_days: {
          label: 'DegDaysBelowThreshold',
          vars: '_<thresh>',
        },
        degree_days_exceedance_date: {
          label: 'DegDaysExceedDate',
          vars: '_<sum_thresh>_days_<op>_<thresh>_from_<after_date>',
        },
        heat_wave_index: {
          label: 'HeatWave',
          vars: '_<window>_days_at_<thresh>',
        },
        heat_wave_total_length: {
          label: 'HeatWaveTotDuration',
          vars: '_<window>_days_at_<thresh_tasmin>_to_<thresh_tasmax>',
        },
        heat_wave_frequency: {
          label: 'HeatWaveFreq',
          vars: '_<window>_days_at_<thresh_tasmin>_to_<thresh_tasmax>',
        },
        dlyfrzthw: {
          label: 'DaysFreezeThawCycle',
          vars: '_<thresh_tasmin>_to_<thresh_tasmax>',
        },
        cold_spell_days: {
          label: 'ColdSpellDays',
          vars: '_<window>_days_at_<thresh>',
        },
      };

      //       let variable = variables[form_inputs['analyze-location']];
      //       variable = variable.label + variable.vars;
      //
      //       [
      //         'thresh',
      //         'thresh_tasmin',
      //         'thresh_tasmax',
      //         'window',
      //         'after_date',
      //         'sum_thresh',
      //         'op',
      //       ].forEach((v) => {
      //         let val = $(`input[type="hidden"][id=${v}]`).val();
      //         if (['thresh', 'thresh_tasmin', 'thresh_tasmax'].includes(v))
      //           val = val.replaceAll('-', 'neg');
      //         variable = variable.replaceAll('<' + v + '>', val);
      //       });
      //
      //       let options = form_inputs['scenario'].replaceAll(',', '-') + '_';
      //       let ps = form_inputs['ensemble_percentile'].split(',');
      //       for (let i = 0; i < ps.length; i++) ps[i] = 'p' + ps[i];
      //       options += ps.join('-') + '_';
      //
      //       let frequencies = {
      //         YS: 'Annual',
      //         MS: 'Monthly',
      //         'QS-DEC': 'Seasonal',
      //         'AS-JUL': 'July2June',
      //       };
      //       options += frequencies[form_inputs['freq']] + '_';
      //       options += form_inputs['csv_precision'];
      //
      //       let ext = form_inputs['output_format'] == 'csv' ? 'csv' : 'nc';
      //       return file_name.format(dataset, location, time, variable, options, ext);
    },

    update_default_scheme: function (callback) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      let default_scheme_element = item.find(
        '#display-scheme-select .dropdown-item[data-scheme-id="default"]',
      );

      // console.log('default scheme', options.query.var);

      if (
        options.query.dataset == 'ahccd' ||
        options.query.var == null ||
        options.query.var == '' ||
        options.query.var == 'null' ||
        options.var_data == null
      ) {
        // nothing to do,
        // prevents multiple firing of get_layer

        if (typeof callback === 'function') {
          callback();
        }
      } else {
        if (special_variables.hasOwnProperty(options.var_data.slug)) {
          const special_var = special_variables[options.var_data.slug];
          default_scheme_element.data(
            'scheme-colours',
            special_var.colormap.colours,
          );
          default_scheme_element.data(
            'scheme-quantities',
            special_var.colormap.quantities,
          );
          plugin.update_scheme();

          if (typeof callback === 'function') callback();
        } else {
          let layer_name = $(document).cdc_app(
            'maps.get_layer_name',
            options.query,
          );

          if (options.current_layer != layer_name) {
            $.getJSON(
              geoserver_url +
                '/geoserver/wms?service=WMS&version=1.1.0&request=GetLegendGraphic' +
                '&format=application/json&layer=' +
                layer_name,
            )
              .then(function (data) {
                let colour_map =
                  data.Legend[0].rules[0].symbolizers[0].Raster.colormap
                    .entries;

                options.legend.colormap.colours = colour_map.map(
                  (e) => e.color,
                );
                options.legend.colormap.quantities = colour_map.map(
                  (e) => e.quantity,
                );

                plugin.generate_ramp();
              })
              .always(function () {
                if (typeof callback == 'function') callback();
              });
          }
        }
      }
    },

    // Hook that update leaflet params object depending on selected scheme
    apply_scheme: function (query, layer_params) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      console.log('apply scheme');

      if (special_variables.hasOwnProperty(options.var_data.slug)) {
        const special_var = special_variables[options.var_data.slug];
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

      console.log('update scheme');

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

      // console.log('generate ramp', selected_scheme_item);
      // console.log(JSON.stringify(options.legend, null, 4));

      if (special_variables.hasOwnProperty(options.var_data.slug)) {
        $.extend(
          options.legend.colormap,
          special_variables[options.var_data.slug].colormap,
        );
      } else {
        // options.legend.colormap.colours = colours;
        // options.legend.colormap.quantities = [];
        options.legend.colormap.labels = null;
        options.legend.colormap.scheme_type = 'discrete';
        options.legend.colormap.categorical = false;
      }
    },

    generate_sld: function (layer_name, discrete) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      console.log('generate sld');

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

    enable_bbox: function () {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      for (let key in options.maps) {
        // hide grid
        if (options.maps[key].object.hasLayer(options.maps[key].layers.grid)) {
          options.maps[key].object.removeLayer(options.maps[key].layers.grid);
        }

        if (!options.maps[key].layers.hasOwnProperty('bbox')) {
          // initialize bbox layer
          options.maps[key].layers.bbox = null;

          // enable drawing
          options.maps[key].object.pm.enableDraw('Rectangle', {});

          // add event handler
          options.maps[key].object.on('pm:create', function (e) {
            // sync layers
            for (let key2 in options.maps) {
              options.maps[key2].layers.bbox = e.layer;
            }

            // enable editing
            options.maps[key].layers.bbox.pm.enable({});

            // add edit handler
            options.maps[key].layers.bbox.on('pm:edit', function (e) {
              plugin.handle_bbox_event(e);
            });

            // initial handler
            plugin.handle_bbox_event(e);
          });
        }
      }
    },

    disable_bbox: function () {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      for (let key in options.maps) {
        // show the grid layer
        if (options.maps[key].layers.grid != null) {
          options.maps[key].object.addLayer(options.maps[key].layers.grid);
        }

        // remove bbox
        if (
          options.maps[key].layers.hasOwnProperty('bbox') &&
          options.maps[key].layers.bbox != null &&
          options.maps[key].object.hasLayer(options.maps[key].layers.bbox)
        ) {
          options.maps[key].object.removeLayer(options.maps[key].layers.bbox);

          // destroy events
          options.maps[key].object.off('pm:create').off('pm:edit');

          // delete objects
          delete options.maps[key].layers.bbox;
          delete options.query.bbox;
        }

        options.maps[key].object.pm.disableDraw();
      }
    },

    handle_bbox_event: function (e) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      let bounds = e.layer.getBounds();
      let sw = bounds.getSouthWest();
      let ne = bounds.getNorthEast();

      // store the bounds in #download-coords
      // $('#download-coords').val([sw.lat, sw.lng, ne.lat, ne.lng].join('|'));
      options.query.bbox = [sw.lat, sw.lng, ne.lat, ne.lng];

      //       let cells = count_selected_gridcells();
      //
      //       $('#download-location')
      //         .parent()
      //         .find('.select2-selection__rendered')
      //         .text(T('Around {0} grid boxes selected').format(cells));
      //       checkform();
    },
  };

  // jQuery plugin interface

  $.fn.download_app = function (opt) {
    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {
      var item = $(this);
      var instance = item.data('download_app');

      if (!instance) {
        // create plugin instance if not created
        item.data('download_app', new download_app(this, opt));
      } else {
        // otherwise check arguments for method call
        if (typeof opt === 'string') {
          instance[opt].apply(instance, args);
        }
      }
    });
  };
})(jQuery);
