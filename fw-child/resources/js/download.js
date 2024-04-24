// download functions

(function ($) {
  function download_app(item, options) {
    // options

    var defaults = {
      globals: ajax_data.globals,
      lang: 'en',
      post_id: null,
      page: 'download',
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
        decimals: false,
      },
      frequency: {},
      current_layer: null,
      selection_mode: 'select',
      selection_data: {},
      current_grid: null,
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
        result: {
          tab: null,
          head: null,
          content: null,
          btn: null,
          status: null,
        },
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
                  options.var_data.acf.var_names != null &&
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
                    options.request,
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

      item.find('#station-select').select2({
        theme: 'bootstrap-5',
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

      // threshold/custom accordion

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
            console.log('hide raster pane');
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
          // options.query_str.prev = options.query_str.current;

          // options.query_str.current = $(document).cdc_app('query.eval', {
          //   query: options.query,
          //   do_history: 'replace',
          //   callback: function () {
          //     plugin.update_default_scheme(function () {
          //       console.log('accordion get layer');

          // $(document).cdc_app(
          //   'maps.get_layer',
          //   options.query,
          //   options.var_data,
          //   options.request,
          // );

          //   options.status = 'ready';
          // });
          // },
          // });
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

        item.find('#data-variable .control-tab-body').scrollTop(0);
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
        theme: 'bootstrap-5',
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
          url: ajax_data.rest_url + 'cdc/v2/location_search/',
          dataType: 'json',
          delay: 0,
          data: function (params) {
            return {
              q: params.term,
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

      // SUBMIT ELEMENTS

      options.elements.result.tab = item.find('#submit-result');
      options.elements.result.head = item.find('#result-head');
      options.elements.result.content = item.find('#result-message');
      options.elements.result.btn = item.find('#result-btn a');
      options.elements.result.status = item.find('#result-status');
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
              $('#coords-lat').val(this.getCenter().lat.toFixed(4));
              $('#coords-lng').val(this.getCenter().lng.toFixed(4));
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

              $('body').removeClass('spinner-on');
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

          console.log('select', this_gid, style_obj);

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
                  options.maps[key].layers.grid.resetFeatureStyle(selection);
                }
              }
            });

            selections = [selections[selections.length - 1]];
          }

          // console.log('selections', selections.join(','));

          // update input
          options.status = 'select';

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

          if (selections.includes(this_gid)) {
            // console.log('remove ' + this_gid);

            for (var i = selections.length - 1; i >= 0; i--) {
              if (selections[i] === this_gid) selections.splice(i, 1);
            }

            delete options.selection_data[this_gid];
          } else {
            if (options.query.var == 'idf') {
              // reset existing
              selections.forEach(function (gid) {
                plugin.update_station_markers([], gid, style_obj);
              });

              selections = [this_gid];

              // switch to submit tab
              $('#control-bar').tab_drawer('update_path', '#submit');
            } else {
              // console.log('add ' + this_gid);
              selections.push(this_gid);
            }

            options.selection_data[this_gid] = {
              properties: mouse_event.layer.feature.properties,
              latlng: mouse_event.latlng,
            };
          }

          plugin.update_station_markers(selections, this_gid, style_obj);

          // set station select2
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

        plugin.set_location({
          lat: e.params.data.lat,
          lng: e.params.data.lon,
        });
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

      item.find('#station-select').on('select2:selecting', function (e) {
        if (options.query.var == 'idf') {
          $(this)
            .val()
            .forEach(function (gid) {
              plugin.update_station_markers([], gid);
            });

          $(this).val(null);
        }
      });

      item.find('#station-select').on('select2:select', function (e) {
        let this_gid = String(e.params.data.id);

        options.selection_data[this_gid] = {
          properties: {
            ID: e.params.data.id,
            Name: e.params.data.text,
          },
        };

        plugin.update_station_markers($(this).val(), this_gid);
      });

      item.find('#station-select').on('select2:unselect', function (e) {
        let this_gid = String(e.params.data.id);
        plugin.update_station_markers($(this).val(), this_gid);
      });

      // select/draw mode

      item.on('change', '[name="area-selection"]', function () {
        options.selection_mode = $(this).val();

        plugin.reset_selections();

        switch (options.selection_mode) {
          case 'draw':
            // console.log('ENABLE DRAW');
            plugin.enable_bbox();
            break;
          case 'select':
            // console.log('DISABLE DRAW');
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

      // clear selections

      item.on('click', '#area-selections-reset', function () {
        plugin.reset_selections();
      });

      // triggerable handler for [data-query-key] inputs

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
            options.status != 'select' &&
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

        // trigger update event
        $(document).trigger('update_input', [$('[data-query-key="coords"]')]);
      });

      // TAB DRAWER

      // path change trigger

      item.on(
        'td_update_path',
        function (event, prev_id = null, new_id = null) {
          // console.log('validate', prev_id + ' > ' + new_id);

          let prev_tab = null,
            new_tab = null;

          if (prev_id == '#') prev_id = null;
          if (new_id == '#') new_id = null;

          if (prev_id != null) {
            prev_tab = item.find(prev_id);
          }

          if (new_id != null) {
            new_tab = item.find(new_id);
          }

          if (prev_id == null || new_id == null || prev_id == new_id) {
            // console.log("tab didn't change");
          } else if (new_tab != null && new_tab.closest(prev_tab).length) {
            // console.log('tab is a child');
          } else if (prev_id != null) {
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
        },
      );

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

      item.find('#submit :input').on('input', function () {
        plugin.validate_tab('#submit');
      });

      item.on('click', '#submit-btn', function () {
        console.log('SUBMIT DATA');
        console.log(JSON.stringify(options.query, null, 4));

        plugin.process(options.query);
      });

      item.on('click', '#result-status-refresh', function () {
        $.ajax({
          url: $(this).attr('data-url'),
          dataType: 'json',
          cache: false,
          success: function (data) {
            if (data.finished == null) {
              item
                .find('#result-status-text span')
                .text(data.percentCompleted + '%');
            } else {
              item.find('#result-status-text span').text(T('complete'));
            }
          },
        });
      });

      // HISTORY

      window.addEventListener('popstate', function (e) {
        console.log('POP');
        console.log('status = eval');
        options.status = 'eval';
        plugin.handle_pop(e);
      });

      // HOOKS

      $(document).cdc_app(
        'add_hook',
        'maps.get_layer',
        500,
        plugin,
        function (query) {
          let plugin = this,
            options = plugin.options,
            item = plugin.item;

          // console.log('get layer hook bbox');

          // whether to re-enable bbox after changing/updating layers
          if (query.sector == 'gridded_data') {
            if (options.selection_mode == 'draw') {
              // console.log('enable');
              plugin.enable_bbox();
            } else {
              // console.log('disable');
              plugin.disable_bbox();
            }
          }

          console.log('get layer hook');
          $('body').removeClass('spinner-on');
        },
      );
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

          if (
            options.query.var == 'climate-normals' ||
            options.query.var == 'station-data'
          ) {
            feature_ID = layer.feature.properties.STN_ID;
          }

          if (feature_ID == this_gid) {
            if (selections.includes(this_gid)) {
              if (
                options.query.var == 'ahccd' ||
                options.query.dataset == 'ahccd'
              ) {
                layer.setIcon(ahccd_icons[layer.feature.properties.type + 'r']);
              } else {
                layer.setStyle({
                  fillColor: '#fff',
                  color: options.station.color,
                });
              }
            } else {
              if (
                options.query.var == 'ahccd' ||
                options.query.dataset == 'ahccd'
              ) {
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
      // console.log('--- start handle_input');

      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      if (!status) status = options.status;

      // console.log('handle input', input, status);

      let this_key = input.attr('data-query-key'),
        this_val = input.val();

      // console.log(this_key, this_val, input);

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

            // set request type to single

            options.request.type = 'single';

            if (
              item.find('#var-thresholds').is(':visible') &&
              item.find('#threshold-custom').hasClass('show')
            ) {
              // unless the 'custom' accordion is open
              // console.log("no it's custom");

              options.request.type = 'custom';
            }

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

            // console.log('--- MODELS ---');
            // console.log(options.query.models);

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

              // if query.model's value still has an existing input
              // check it

              if (item.find('#details-models-' + options.query.model).length) {
                item
                  .find('#details-models-' + options.query.model)
                  .prop('checked', true)
                  .trigger('change');
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
          if (this_val == 'all') {
            item
              .find('[name="details-percentiles"]:not(#details-percentiles-all')
              .prop('checked', false);
          } else {
            item.find('#details-percentiles-all').prop('checked', false);
          }

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

          // convert to array
          this_val = this_val.split(',').filter(function (i) {
            return i;
          });

          // update query val
          options.query.selections = this_val;

          // update count
          plugin.update_selection_count();

          // console.log('result', selection_count);

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
          console.log('CHANGE SECTOR');
          // clear the current selections
          plugin.reset_selections();

          // item.find('[data-query-key="selections"]').val('').trigger('change');

          // item
          //   .find('#area-selection-select')
          //   .prop('checked', true)
          //   .trigger('change');

          // hide the shapefile layer
          options.elements.shapefile_upload.shapefile_upload('hide');

          switch (this_val) {
            case 'gridded_data':
              // console.log('gridded');
              if (options.request.type != 'custom') {
                // console.log('show raster pane');
                item.find('.leaflet-raster-pane').show();
              }
              break;
            case 'upload':
              plugin.disable_bbox();
              options.elements.shapefile_upload.shapefile_upload('show');
              break;
          }

          break;
      }

      console.log('status', status);

      if (status == 'input' || status == 'slide') {
        // whether to pushstate on eval or not
        let do_history = status == 'slide' ? 'none' : 'push';

        if (this_key == 'coords') {
          do_history = 'replace';
        }

        // use cdc helper function to
        // update the value in the query object
        $(document).cdc_app('query.update_value', options.query, {
          item: input,
          key: this_key,
          val: this_val,
        });

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
                options.request,
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

      plugin.set_controls();

      // console.log('--- end of handle_input');
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

      // console.log('end of refresh_inputs');
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
              options.request,
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
            console.log('get var data', data);

            // update var_data
            options.var_data = data;

            if (
              typeof options.var_data.acf.var_names != 'undefined' &&
              options.var_data.acf.var_names != null
            ) {
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
            } else {
              hidden_input.val('');

              if (status == 'input') {
                hidden_input.trigger('change');
              }
            }

            // console.log('sector: ' + options.query.sector);

            if (typeof callback == 'function') {
              callback(data);
            }
          });
        }

        // populate var info overlay

        let desc_key = 'var_description' + (options.lang != 'en' ? '_fr' : ''),
          tech_key =
            'var_tech_description' + (options.lang != 'en' ? '_fr' : '');

        item.find('#info-description').html(options.var_data.acf[desc_key]);
        item
          .find('#info-tech-description')
          .html(options.var_data.acf[tech_key]);

        item.find('#breadcrumb-overlay-trigger').show();

        plugin.populate_relevant(var_id);

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

        //
        // VAR FLAG: AHCCD
        //

        if (fields.dataset_availability.includes('ahccd')) {
          options.var_flags.ahccd = true;
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

          item
            .find('#threshold-custom .accordion-body')
            .html(plugin.generate_custom_inputs(fields.thresholds));

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

        if (typeof fields.var_names != 'undefined') {
          // var has at least 1 value in var_names

          if (fields.var_names != null) {
            if (
              fields.var_names.length > 1 ||
              (fields.var_names.length == 1 && options.var_flags.custom)
            ) {
              //
              // VAR FLAG: THRESHOLD
              //

              options.var_flags.threshold = true;

              if (fields.var_names.length > 1) {
                // multiple vars

                item.find('#threshold-preset .map-control-slider-well').show();

                item.find('#threshold-preset .single-preset-label').hide();

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

                      options.query.var = fields.var_names[ui.value].variable;

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
                              options.query,
                              options.var_data,
                              options.request,
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

                    options.elements.threshold_slider.slider(
                      'option',
                      'value',
                      i,
                    );

                    // set handle text
                    options.elements.threshold_slider
                      .find('.ui-slider-handle')
                      .text(fields.var_names[i].label);
                  }
                });
              } else {
                // 1 var

                item.find('#threshold-preset .map-control-slider-well').hide();

                item
                  .find('#threshold-preset .single-preset-label')
                  .text(fields.var_names[0].label)
                  .show();
              }

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
          }

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

        // console.log(options.query.sector);
        // console.log(options.current_grid, fields.grid);

        // if (options.var_data.acf.var_names[0].variable == 'slr') {
        //   item
        //     .find('#area-aggregation-grid')
        //     .prop('checked', true)
        //     .trigger('change');
        // }

        if (options.query.sector == 'gridded_data') {
          // if the grid name changes
          // i.e. canadagrid > canadagrid1deg
          if (options.current_grid != fields.grid) {
            options.current_grid = fields.grid;
            plugin.reset_selections();
          }
        } else if (options.query.sector == 'station') {
          item.find('#station-select').val('').trigger('change');
        }

        if (options.query.var == 'idf') {
          item.find('#map-control-idf').show();
        } else {
          item.find('#map-control-idf').hide();
        }

        // set request type

        if (
          options.var_flags.custom == true &&
          (options.var_flags.threshold == false ||
            item.find('#var-thresholds .collapse.show').attr('id') ==
              'threshold-custom')
        ) {
          // custom or AHCCD
          options.request.type = 'custom';

          if (
            options.var_flags.ahccd == true &&
            options.query.dataset == 'ahccd'
          ) {
            options.request.type = 'ahccd';
          }
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

    populate_relevant: function (var_id) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      item.find('#info-relevant-vars').empty();
      item.find('#info-relevant-vars-btn').hide();
      item.find('#info-relevant-sectors').empty();
      item.find('#info-relevant-sectors-btn').hide();
      item.find('#info-relevant-training').empty();
      item.find('#info-relevant-training-btn').hide();

      $.ajax({
        url: ajax_data.rest_url + 'cdc/v2/related/',
        type: 'GET',
        dataType: 'json',
        data: {
          var_id: var_id,
        },
        success: function (data) {
          // vars

          let item_card =
            '<div class="card text-bg-dark bg-opacity-40 mb-3 p-3">';

          if (data.vars.length > 0) {
            item.find('#info-relevant-vars-btn').show();

            data.vars.forEach(function (query_item, i) {
              let new_item = $(item_card);

              new_item.append(
                '<h4 class="card-title">' + query_item.title + '</h4>',
              );
              new_item.append(
                '<a href="#" data-query-key="var_id" data-query-val="' +
                  query_item.id +
                  '">' +
                  'View on map' +
                  '</a>',
              );

              item.find('#info-relevant-vars').append(new_item);
            });
          } else {
          }

          // sectors

          if (data.sectors.length > 0) {
            item.find('#info-relevant-sectors-btn').show();

            data.sectors.forEach(function (query_item, i) {
              let new_item = $(item_card);

              new_item.append(
                '<h4 class="card-title">' + query_item.title + '</h4>',
              );
              new_item.append(
                '<a href="' + query_item.url + '">' + 'View' + '</a>',
              );

              item.find('#info-relevant-sectors').append(new_item);
            });
          }

          // resources

          if (data.training.length > 0) {
            item.find('#info-relevant-training-btn').show();

            data.training.forEach(function (query_item, i) {
              let new_item = $(item_card);

              new_item.append(
                '<h4 class="card-title">' + query_item.title + '</h4>',
              );
              new_item.append(
                '<a href="' + query_item.url + '">' + 'View' + '</a>',
              );

              item.find('#info-relevant-training').append(new_item);
            });
          }

          item
            .find('#info-relevant-tabs .btn:visible')
            .first()
            .trigger('click');
        },
      });
    },

    set_controls: function (fields) {
      // console.log('--- start set_controls');

      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      let items_to_hide = [],
        items_to_show = [];

      // VAR FLAGS

      // console.log(options.var_flags);

      // console.log('set controls');
      // console.log('request type', options.request.type);

      switch (options.request.type) {
        case 'single':
        case 'threshold':
          item.find('.leaflet-raster-pane').show();
          // console.log('show legend');
          // item.find('.info.legend').show();
          break;
        case 'ahccd':
        case 'station':
          options.query.sector = 'station';

          // console.log('hide legend');
          // item.find('.info.legend').hide();
          break;
      }

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

      // DATA TAB

      // dataset

      if (fields) {
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

        // console.log('done enabling datasets');

        if (
          !item.find('#map-control-dataset :input:not([disabled]):checked')
            .length
        ) {
          // nothing is checked
          // find the first enabled input and check it

          item
            .find('#map-control-dataset :input:not([disabled])')
            .first()
            .prop('checked', true);
        }

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
                console.log('uncheck', $(this));

                $(this).prop('disabled', true);

                if ($(this).prop('checked') == true)
                  $(this).prop('checked', false);
              }
            });

          if (
            !item.find(
              '#map-control-aggregation [data-query-key="sector"] :checked',
            ).length
          ) {
            // nothing is checked
            // find the first enabled input and check it

            item
              .find(
                '#map-control-aggregation .form-check-input[data-query-key="sector"]:not([disabled])',
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

      // scenarios

      if (options.request.type !== 'custom') {
        item
          .find('#map-control-panels .form-check-input')
          .prop('checked', false);

        item
          .find('#details-scenarios-high')
          .prop('checked', true)
          .trigger('change');
      }

      // console.log('--- end of set_controls');
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
        url: ajax_data.rest_url + 'cdc/v2/get_location_by_coords/',
        dataType: 'json',
        data: {
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
        $(document).cdc_app('maps.set_center', coords, 10, false);

        $('#coords-lat').val(coords.lat);
        $('#coords-lng').val(coords.lng);
        $('#coords-zoom').val(10);

        $('[data-query-key="coords"]')
          .val(
            $('#coords-lat').val() +
              ',' +
              $('#coords-lng').val() +
              ',' +
              $('#coords-zoom').val(),
          )
          .trigger('change');

        // $(document).trigger('update_input', [$('[data-query-key="coords"]')]);
      });
    },

    validate_tabs: function (tabs) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      function process_validate_queue(tabs) {
        $.when(plugin.validate_tab(tabs[0])).done(function (is_valid) {
          console.log(tabs[0], is_valid);

          const shift_tab = tabs.shift();

          if (tabs.length > 0) {
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

      // console.log('validate tab', prev_id);

      let prev_tab = item.find(prev_id),
        new_tab = new_id != null ? item.find(new_id) : null,
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

          if (!this_input.is(':visible') && !this_input.is('[type="hidden"]')) {
            validate_this = false;
          } else if (
            this_input.attr('data-optional') != undefined &&
            this_input.attr('data-optional') == 'true'
          ) {
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
                // console.log(options.query.sector + ' is in the array');
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

            if (
              input_to_check.is('[type="radio"]') &&
              !item.find(
                '[type="radio"][name="' +
                  input_to_check.attr('name') +
                  '"]:checked',
              ).length
            ) {
              invalid_messages.push(input_to_check.attr('data-validate'));
            } else if (
              input_to_check.val() == '' ||
              input_to_check.val() == 'null'
            ) {
              // check for blank value
              tab_items.find('[href="' + prev_id + '"]').addClass('invalid');
              invalid_messages.push(valid_msg);
            }
          }
        });

      // custom validation by tab

      switch (prev_id) {
        case '#data':
          break;
        case '#area':
          // check for selection limit

          if (options.query.sector == 'gridded_data') {
            if (
              options.selection_mode == 'draw' &&
              !options.query.hasOwnProperty('bbox')
            ) {
              // no box
              invalid_messages.push('Draw an area on the map');
            }

            let limit = plugin.get_download_limits();

            if (plugin.count_selections() > limit) {
              // too many boxes D:
              invalid_messages.push(
                T(
                  'With the current frequency and format setting, the maximum number of grid boxes that can be selected per request is {0}',
                ).format(limit),
              );
            }
          } else if (options.query.sector === 'upload') {
            // Validate the custom shapefile
            const validation_message =
              options.elements.shapefile_upload.shapefile_upload('validate');
            if (validation_message != null) {
              invalid_messages.push(validation_message);
            }
          }

          break;
        case '#submit':
          // if (options.query.var == 'idf') {
          //   if ($()
          // }
          break;
      }

      // console.log(invalid_messages);

      if (invalid_messages.length) {
        is_valid = false;

        tab_items.find('[href="' + prev_id + '"]').addClass('invalid');

        invalid_messages = [...new Set(invalid_messages)];

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
      }

      //

      if (tab_items.find('.invalid').length) {
        item.find('#submit-btn').addClass('disabled');
      } else {
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

    process: function (query) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      console.log('PROCESS');
      console.log('type', options.request.type);
      console.log('query', query);

      let form_obj, submit_data;

      // reset elements
      options.elements.result.head.text('');
      options.elements.result.content.html('');
      options.elements.result.status.hide();
      options.elements.result.tab.removeClass('error').removeClass('success');

      if (!options.elements.result.tab.hasClass('td-selected')) {
        $('#control-bar').tab_drawer('update_path', '#submit-result', false);
      }

      switch (options.request.type) {
        case 'station':
          plugin._process_station(query);
          break;

        case 'ahccd':
          plugin._process_ahccd(query);
          break;

        case 'custom':
          plugin._process_custom(query);
          break;

        case 'threshold':
        case 'single':
          plugin._process_single(query);
          break;
      }
    },

    _process_station: function (query) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      let station_url;

      switch (query.var) {
        case 'station-data':
          station_url =
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

          options.elements.result.head.text(T('Success') + '!');
          options.elements.result.content.text(
            T('Click below to download your data'),
          );

          options.elements.result.btn.attr('href', station_url);
          options.elements.result.btn.show();

          options.elements.result.tab.removeClass('error').addClass('success');

          break;
        case 'idf':
          let data_request = item.find('[name="submit-idf"]:checked').val();

          $.ajax({
            url: ajax_data.rest_url + 'cdc/v2/get_idf_url/',
            dataType: 'json',
            data: {
              station: options.query.station.join(''),
              data: data_request,
            },
            success: function (data) {
              console.log(data);

              if (data.files.length) {
                options.elements.result.head.text(T('Success') + '!');
                options.elements.result.content.text(
                  T('Click below to download your data'),
                );

                options.elements.result.btn.attr('href', data.files[0]);
                options.elements.result.btn.show();

                options.elements.result.tab
                  .removeClass('error')
                  .addClass('success');
              } else {
                options.elements.result.head.text(T('Error'));
                options.elements.result.content.text(
                  T('No data found matching your request.') +
                    ' ' +
                    T('Please try again.'),
                );

                options.elements.result.tab
                  .addClass('error')
                  .removeClass('success');
              }
            },
          });

          break;
        case 'ahccd':
          station_url =
            geoserver_url +
            '/download-ahccd?format=' +
            query.format +
            '&zipped=true' +
            '&stations=' +
            query.station.join(',');

          options.elements.result.head.text(T('Success') + '!');
          options.elements.result.content.text(
            T('Click below to download your data'),
          );

          options.elements.result.btn.attr('href', station_url);
          options.elements.result.btn.show();

          options.elements.result.tab.removeClass('error').addClass('success');

          break;
        case 'climate-normals':
          station_url =
            'https://api.weather.gc.ca/collections/climate-normals/items?CLIMATE_IDENTIFIER=' +
            query.station.join('|') +
            '&sortby=MONTH&f=' +
            query.format +
            '&limit=150000&startindex=0';

          options.elements.result.head.text(T('Success') + '!');
          options.elements.result.content.text(
            T('Click below to download your data'),
          );

          options.elements.result.btn.attr('href', station_url);
          options.elements.result.btn.show();

          options.elements.result.tab.removeClass('error').addClass('success');

          break;
      }
    },

    _process_ahccd: function (query) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

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
        console.log($(this).attr('name'), $(this).val());

        if ($(this).val() != '') {
          let this_data = $(this).val();

          if (
            $(this).attr('data-units') != undefined &&
            $(this).attr('data-units') != ''
          ) {
            this_data += ' ' + $(this).attr('data-units');
          }

          form_obj.inputs.push({
            id: $(this).attr('name'),
            data: this_data,
          });
        }
      });

      // frequency

      let frequency_code = query.frequency.toLowerCase();

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
        required_variables: options.var_data.acf.required_variables.split('|'),
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
            options.elements.result.head.text(T('Success') + '!');
            options.elements.result.content.html(data.description);

            // status
            options.elements.result.status
              .find('#result-status-text span')
              .html(data.status);

            options.elements.result.status
              .find('#result-status-refresh')
              .attr('data-url', data.location);

            options.elements.result.status.show();

            options.elements.result.tab
              .removeClass('error')
              .addClass('success');
          } else {
            options.elements.result.head.text(T('Error'));
            options.elements.result.content.html(
              'Captcha failed. Please try again.',
            );

            options.elements.result.tab
              .removeClass('success')
              .addClass('error');

            plugin.refresh_captcha();
          }
        },
        complete: function () {
          plugin.refresh_captcha();
        },
      });
    },

    _process_custom: function (query) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      let submit_path = 'grid_point',
        frequency_code = query.frequency.toLowerCase();

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
        console.log($(this).attr('name'), $(this).val());

        if ($(this).val() != '') {
          let this_data = $(this).val();

          if (
            $(this).attr('data-units') != undefined &&
            $(this).attr('data-units') != ''
          ) {
            this_data += ' ' + $(this).attr('data-units');
          }

          form_obj.inputs.push({
            id: $(this).attr('name'),
            data: this_data,
          });
        }
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

      // percentiles

      if (query.percentiles.join(',') != 'all') {
        form_obj.inputs.push({
          id: 'ensemble_percentiles',
          data: query.percentiles.join(','),
        });
      }

      // lat/lng

      switch (query.sector) {
        case 'gridded_data':
          // bbox or selected grids

          if (query.hasOwnProperty('bbox')) {
            submit_path = 'bbox';

            console.log('bbox', query.bbox);

            form_obj.inputs.push(
              {
                id: 'lat0',
                data: query.bbox[0],
              },
              {
                id: 'lon0',
                data: query.bbox[1],
              },
              {
                id: 'lat1',
                data: query.bbox[2],
              },
              {
                id: 'lon1',
                data: query.bbox[3],
              },
            );
          } else {
            // gridded: comma separated values of each selection

            let lat_str = '',
              lng_str = '';

            Object.keys(options.selection_data).forEach(function (gid, i) {
              if (
                options.selection_data[gid].lat != undefined &&
                options.selection_data[gid].lat != undefined
              ) {
                if (i != 0) {
                  lat_str += ',';
                  lng_str += ',';
                }

                lat_str += options.selection_data[gid].lat;
                lng_str += options.selection_data[gid].lng;
              }
            });

            form_obj.inputs.push({
              id: 'lat',
              data: lat_str,
            });

            form_obj.inputs.push({
              id: 'lon',
              data: lng_str,
            });
          }
          break;
        case 'upload':
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
          break;
        default:
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
      } // switch sector

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
            options.elements.result.head.text(T('Success') + '!');
            options.elements.result.content.html(data.description);

            // status
            options.elements.result.status
              .find('#result-status-text span')
              .html(data.status);

            options.elements.result.status
              .find('#result-status-refresh')
              .attr('data-url', data.location);

            options.elements.result.status.show();

            options.elements.result.tab
              .removeClass('error')
              .addClass('success');
          } else {
            options.elements.result.head.text(T('Error'));
            options.elements.result.content.html(
              'Captcha failed. Please try again.',
            );

            options.elements.result.tab
              .removeClass('success')
              .addClass('error');
            plugin.refresh_captcha();
          }
        },
        complete: function () {
          plugin.refresh_captcha();
        },
      });
    },

    _process_single: function (query) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      let pointsInfo = '',
        pointsData,
        frequency_code = query.frequency;

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
              options.elements.result.head.text(T('Success') + '!');
              options.elements.result.content.text(
                T('Click below to download your data'),
              );

              options.elements.result.btn
                .attr('href', window.URL.createObjectURL(xhttp.response))
                .attr(
                  'download',
                  'file_name_goes_here' + '.' + format_extension,
                )
                .show();

              options.elements.result.tab
                .removeClass('error')
                .addClass('success');

              $('body').removeClass('spinner-on');
            } else {
              options.elements.result.head.text(T('An error occurred'));
              options.elements.result.content.text(T('Please try again later'));
              options.elements.result.btn.hide();
              options.elements.result.tab
                .removeClass('success')
                .addClass('error');
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

      options.legend.colormap.colours = [];
      options.legend.colormap.quantites = [];

      // console.log('default scheme', options.query.var);

      if (
        options.query.dataset == 'ahccd' ||
        options.query.var == null ||
        options.query.var == '' ||
        options.query.var == 'null' ||
        options.var_data == null ||
        options.var_data.var_types.includes('Station Data')
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

    generate_custom_inputs: function (thresholds) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      // populate custom inputs
      let output = '<p>';

      thresholds.forEach(function (element) {
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
              '" ';

            if (element.min != '') output += 'min="' + element.min + '" ';
            if (element.max != '') output += 'max="' + element.max + '" ';

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
              T('Make sure a value is entered for each variable threshold.') +
              '"';

            output += '>';
            break;

          case 'select':
            console.log('select', element);
            output += '<select ';
            output += 'class="form-select form-select-sm threshold-input" ';
            output += 'name="' + element.id + '" ';
            output += 'data-units="' + element.units + '"';
            output += '>';

            labels = element.labels.split('|');

            $.each(element.values.split('|'), function (idx, v) {
              output += '<option ';
              output += 'value="' + v + '">';
              output += labels[idx];
              output += '</option>';
            });

            output += '</select>';

            break;
          case 'mm_dd':
            output += '<input ';
            output += 'type="text" ';
            output += 'placeholder="MM-DD" ';
            output += 'class="form-control form-control-sm threshold-input" ';
            output += 'size="5" ';
            output += 'autocomplete="off" ';
            output += 'data-units="' + element.units + '" ';

            if (element.optional != true) {
              output +=
                'data-validate="' +
                T('Make sure a value is entered for each variable threshold.') +
                +'" ';
            }
            output += 'name="' + element.id + '" ';
            output += '>';
            break;
        }
      });

      output += '</p>';

      return output;
    },

    enable_bbox: function () {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      Object.keys(options.maps).forEach(function (key) {
        let this_map = options.maps[key];

        // hide grid
        if (
          this_map.layers.grid &&
          this_map.object.hasLayer(this_map.layers.grid)
        ) {
          this_map.object.removeLayer(this_map.layers.grid);
        }

        if (
          !this_map.layers.hasOwnProperty('bbox') ||
          this_map.layers.bbox == null
        ) {
          // console.log('enable draw');

          // initialize bbox layer
          this_map.layers.bbox = null;

          // enable drawing
          this_map.object.pm.enableDraw('Rectangle', {});

          // add event handler
          this_map.object.on('pm:create', function (e) {
            // console.log('create');
            // sync layers
            for (let key2 in options.maps) {
              options.maps[key2].layers.bbox = e.layer;
            }

            // enable editing
            this_map.layers.bbox.pm.enable({});

            // add edit handler
            this_map.layers.bbox.on('pm:edit', function (e) {
              plugin.handle_bbox_event(e);
            });

            // initial handler
            plugin.handle_bbox_event(e);
          });
        } else {
          // console.log('layer exists, enable edit');

          // enable editing
          this_map.layers.bbox.pm.enable({});
        }
      });
    },

    disable_bbox: function () {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      // console.log('disabling');

      Object.keys(options.maps).forEach(function (key) {
        let this_map = options.maps[key];

        // show the grid layer
        if (this_map.layers.grid != null) {
          this_map.object.addLayer(this_map.layers.grid);
        }

        // remove bbox
        if (
          this_map.layers.hasOwnProperty('bbox') &&
          this_map.layers.bbox != null &&
          this_map.object.hasLayer(this_map.layers.bbox)
        ) {
          this_map.object.removeLayer(this_map.layers.bbox);

          // destroy events
          this_map.object.off('pm:create').off('pm:edit');

          // delete objects
          delete this_map.layers.bbox;
          delete options.query.bbox;
        }

        this_map.object.pm.disableDraw();
      });
    },

    handle_bbox_event: function (e) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      // console.log('bbox event', e);

      let bounds = e.layer.getBounds();
      let sw = bounds.getSouthWest();
      let ne = bounds.getNorthEast();

      // store the bounds in #download-coords
      // $('#download-coords').val([sw.lat, sw.lng, ne.lat, ne.lng].join('|'));
      options.query.bbox = [sw.lat, sw.lng, ne.lat, ne.lng];

      plugin.update_selection_count();

      //       let cells = count_selected_gridcells();
      //
      //       $('#download-location')
      //         .parent()
      //         .find('.select2-selection__rendered')
      //         .text(T('Around {0} grid boxes selected').format(cells));
      //       checkform();
    },

    get_download_limits: function () {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      switch (options.query.frequency) {
        case 'all':
          return 80;
        case 'daily':
          switch (options.query.format) {
            case 'netcdf':
              return 200;
            case 'csv':
              return 20;
          }
        default:
          return 1000;
      }
    },

    update_selection_count: function () {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      let selection_count = plugin.count_selections();

      // update count
      item.find('#area-selections-count span').text(selection_count);

      // disable reset
      item.find('#area-selections-reset').addClass('disabled');

      // and re-enable if necessary
      if (selection_count != 0) {
        if (options.selection_mode == 'draw')
          item.find('#area-selections-count span').prepend('~ ');

        item.find('#area-selections-reset').removeClass('disabled');
      }
    },

    reset_selections: function () {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      // grid selections
      options.query.selections.forEach(function (this_gid) {
        console.log('deselect', this_gid);
        item.trigger('map_item_select', [null, this_gid, {}]);
      });

      console.log('selections now', options.query.selections);

      // bbox
      plugin.disable_bbox();

      switch (options.query.sector) {
        case 'gridded_data':
          console.log('mode', options.selection_mode);

          if (options.selection_mode == 'draw') {
            // re-enable so user can draw a new box
            plugin.enable_bbox();
          }

          break;
        case 'station':
        case 'ahccd':
          break;
      }

      // reset the hidden input
      // item.find('[data-query-key="selections"]').val('').trigger('change');

      plugin.update_selection_count();
    },

    count_selections: function () {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      let result = 0;

      if (options.selection_mode == 'select') {
        if (options.query.selections) {
          result = options.query.selections.length;
        }
      } else if (options.selection_mode == 'draw') {
        if (options.query.hasOwnProperty('bbox')) {
          let coords = options.query.bbox,
            var_grid =
              options.var_data == null
                ? 'canadagrid'
                : options.var_data.acf.grid;

          result = Math.round(
            ((coords[2] - coords[0]) * (coords[3] - coords[1])) /
              grid_resolution[var_grid] ** 2,
          );
        }
      }

      return result;
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
