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
          layers: {},
        },
        medium: {
          container: null,
          object: null,
          layers: {},
        },
        high: {
          container: null,
          object: null,
          layers: {},
        },
      },
      query: {
        coords: [62.51231793838694, -98.48144531250001, 4],
        delta: '',
        dataset: 'cmip6',
        var_id: null,
        var: null,
        percentiles: ['5'],
        frequency: 'YS',
        scenarios: ['medium'],
        decade: 2040,
        sector: 'canadagrid',
        scheme: 'default',
        scheme_type: 'discrete',
        start_date: 1950,
        end_date: 1955,
        format: 'csv',
        input_type: 'preset',
        inputs: [],
      },
      query_str: {
        prev: '',
        current: '',
      },
      var_data: null,
      has_thresholds: false,
      elements: {
        start_slider: null,
        end_slider: null,
        threshold_accordion: null,
        threshold_slider: null,
        shapefile_upload: null,
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

          console.log('download', 'refresh inputs');

          plugin.refresh_inputs(options.query, options.status);

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

                console.log('init get_layer now');

                $(document).cdc_app(
                  'maps.get_layer',
                  options.query,
                  options.var_data,
                );
              }

              console.log('done');

              $('#status').hide();

              console.log('status = ready');
              options.status = 'ready';
            },
          });
          // } else {
          //   options.status = 'ready';
          // }
        },
      );


      //
      // EVENTS
      //

      //
      // RUN INITIAL QUERY
      //

      //       console.log('download', 'init', 'eval');
      //
      //       $(document).cdc_app('maps.get_grid_layer');

      // options.query_str.current = $(document).cdc_app(
      //   'query.eval',
      //   'replace',
      //   function () {
      //     options.status = 'ready';
      //   },
      // );
    },

    init_components: function () {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      // MAPS

      options.maps = $(document).cdc_app('maps.init', options.maps);

      // JQUERY UI WIDGETS

      options.elements.threshold_slider = item
        .find('#threshold-slider')
        .slider({
          min: 0,
          max: 1,
          step: 1,
        });

      let start_hidden = item.find('[data-query-key="start_date"]'),
        end_hidden = item.find('[data-query-key="end_date"]');

      options.elements.start_slider = item
        .find('#details-time-slider-start')
        .slider({
          min: 1950,
          max: 2100,
          value: start_hidden.val(),
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
            options.status = 'input';
          },
        });

      options.elements.end_slider = item
        .find('#details-time-slider-end')
        .slider({
          min: 1950,
          max: 2100,
          value: end_hidden.val(),
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
          options.status = 'input';
        },
      });

      // BOOTSTRAP COMPONENTS

      options.elements.threshold_accordion = document.getElementById(
        'var-threshold-accordion',
      );

      options.elements.threshold_accordion.addEventListener(
        'show.bs.collapse',
        (e) => {
          // adjust download query based on
          // type of threshold

          if ($(e.target).attr('id') == 'threshold-custom') {
            // custom:
            // populate options.query.inputs with the field values

            // hide the data layer - it's not applicable to a
            // custom threshold query
            item.find('.leaflet-raster-pane').hide();

            // options.query.inputs = [];

            // item
            //   .find('#threshold-custom .accordion-body :input')
            //   .each(function () {
            //     options.query.inputs.push($(this).val());
            //   });
          } else {
            // preset:
            // populate options.query.inputs with the slider value

            // options.query.inputs = [
            //   options.elements.threshold_slider.slider('value'),
            // ];

            // show the data layer
            item.find('.leaflet-raster-pane').show();
          }
        },
      );

      // Custom shapefile component
      options.elements.shapefile_upload = item.find('#area-aggregation-shapefile-input').first()
          .shapefile_upload({
            message_container: '#area-aggregation-shapefile-message',
            maps: options.maps,
          });
    },

    init_events: function () {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      // MAP

      for (let key in options.maps) {
        // create zoomend/dragend events
        // for each map

        options.maps[key].object.on('zoomend dragend', function (e) {
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
        });
      }

      //
      // SIDEBAR CONTROLS
      //

      // triggerable handler

      item.on('update_input', function (event, item, status) {
        // console.log('update input event', event, item, status);
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

      // select a variable grid item

      //       item.on('click', '.var-select', function () {
      //         // get variable by ID
      //

      //       });

      // click a link element with a query key

      item.on('click', 'a[data-query-key]', function () {
        console.log('status = input');
        options.status = 'input';
        $(document).trigger('update_input', [$(this)]);
      });

      // change an input with a query key

      item.on('change', ':input[data-query-key]', function () {
        console.log(
          'change input',
          options.query[$(this).attr('data-query-key')] +
            ' -> ' +
            $(this).val(),
        );

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

        let prev_tab = $(prev_id),
          new_tab = $(new_id);

        if (prev_id == new_id) {
          // console.log("tab didn't change");
        } else if (new_tab.closest(prev_tab).length) {
          // console.log('tab is a child');
        } else {
          let invalid_messages = [],
            tab_items = item.find('#control-bar-tabs'),
            tab_alert = $(prev_id).find('.invalid-alert'),
            msg_list = tab_alert.find('ul');

          tab_items.find('[href="' + new_id + '"]').removeClass('invalid');

          msg_list.empty();

          // each validate-able input in this tab

          $(prev_id)
            .find('[data-validate]')
            .each(function () {
              // check for blank value
              // console.log($(this), $(this).val());
              if ($(this).val() == '' || $(this).val() == 'null') {
                tab_items.find('[href="' + prev_id + '"]').addClass('invalid');
                invalid_messages.push($(this).attr('data-validate'));
              }
            });

          // custom validation by tab

          if (prev_id == '#data') {
            let open_accordion = prev_tab.find('.accordion-collapse.show');

            // which input accordion is shown
            options.query.input_type = open_accordion.attr('id').split('-')[1];

            if (options.query.input_type == 'custom') {
              open_accordion.find(':input').each(function () {
                if ($(this).val() == '' || $(this).val() == 'null') {
                  tab_items
                    .find('[href="' + prev_id + '"]')
                    .addClass('invalid');

                  invalid_messages.push('All custom inputs are required.');

                  return false;
                }
              });
            }
          }

          // console.log(invalid_messages);

          if (invalid_messages.length) {
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
        }
      });

      // Show/hide the user custom shapefile when the "Custom shapefile" radio button is selected/deselected
      item.find('input[name=area-aggregation]').on('change', function() {
        if (this.value === 'custom') {
          options.elements.shapefile_upload.shapefile_upload('show');
        } else {
          options.elements.shapefile_upload.shapefile_upload('hide');
        }
      });

      // SUBMIT

      item.on('click', '#submit', function (event) {
        // Validate the custom shapefile (if selected)
        if (options.query.sector === 'custom') {
          const shapefile_upload_valid = options.elements.shapefile_upload.shapefile_upload('validate');
          if (!shapefile_upload_valid) {
            return;
          }
          console.log(options.elements.shapefile_upload.shapefile_upload('selected_shapes_json'));
        }

        console.log(JSON.stringify(options.query, null, 4));
        let submit_output = $('<div id="submit-modal">').appendTo('body');

        const submit_modal = new bootstrap.Modal(submit_output);

        // submit_modal.modal('show');
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

      // console.log('handle input', input, status);

      let this_key = input.attr('data-query-key'),
        this_val = input.val();

      // if not a form element with a value attribute,
      // look for a data-query-val
      if (input.is('a')) {
        this_val = input.attr('data-query-val');
      }

      // custom UX behaviours by input key

      console.log('input change', input, this_key, this_val);

      switch (this_key) {
        case 'var_id':
          plugin.update_var(this_val, options.query.var, status);
          break;

        case 'percentiles':
          // if only 1 switch is on, disable it
          // so the user can't select zero scenarios
          if (item.find('[data-query-key="percentiles"]:checked').length <= 1) {
            item
              .find('[data-query-key="percentiles"]:checked')
              .prop('disabled', true);
          } else {
            item.find('[data-query-key="percentiles"]').prop('disabled', false);
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

        console.log('call update_value');

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
            if (
              options.query.var != null &&
              options.query.var != 'null' &&
              options.var_data != null
            ) {
              console.log('get layer');
              $(document).cdc_app(
                'maps.get_layer',
                options.query,
                options.var_data,
              );
            }

            options.status = 'ready';
          },
        });
      } else {
        options.status = 'ready';
      }
    },

    refresh_inputs: function (query) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      // sync query objects
      options.query = query;

      // update control bar inputs from query

      for (let key in options.query) {
        // for each key in the query object

        // find input(s) that matches this key
        let this_input = item.find('[data-query-key="' + key + '"]');
        console.log('refresh', key, this_input.val(), options.query[key]);

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

            this_input.val(options.query[key]);

            if (key == 'start_date') {
              options.elements.start_slider.slider(
                'value',
                parseInt(options.query[key]),
              );
            } else if (key == 'end_date') {
              options.elements.end_slider.slider(
                'value',
                parseInt(options.query[key]),
              );
            } else if (key == 'var_id' || key == 'var') {
              console.log('var', options.query[key]);

              if (options.query[key] != null) {
                plugin.update_var(
                  options.query.var_id,
                  options.query.var,
                  options.status,
                );
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
              console.log('radio', item.find('[data-query-key="' + key + '"]'));
              this_radio.prop('checked', true);
              $(document).trigger('update_input', [$(this_radio), 'eval']);
            }
          } else if (this_input.is('select')) {
            if (this_input.val() != options.query[key]) {
              this_input.val(options.query[key]);
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

    update_var: function (var_id, var_name, status = null, callback = null) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      if (status == null) status = options.status;

      options.has_thresholds = false;

      console.log('updating ' + var_id + ', ' + var_name + ', ' + status);

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
          console.log('skip get_var_data');
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

            // TODO
            // plugin.update_frequency();

            if (options.var_data.var_types.includes('Station Data')) {
              console.log('station station station station ');
              options.query.sector = 'station';
            } else {
              console.log('NOT STATIONNNNN');
              options.query.sector = item
                .find('[data-query-key="sector"]:checked')
                .val();
            }

            console.log('sector: ' + options.query.sector);

            if (typeof callback == 'function') {
              callback(data);
            }
          });
        }

        // always do this stuff
        // console.log(options.var_data);

        if (typeof options.var_data.acf.var_names != 'undefined') {
          // setup slider and custom inputs

          options.query_str.prev = options.query_str.current;

          options.query_str.current = $(document).cdc_app('query.eval', {
            query: options.query,
            do_history: 'none',
            callback: function () {
              $(document).cdc_app(
                'maps.get_layer',
                options.query,
                options.var_data,
              );
            },
          });

          item.find('#var-thresholds').show();

          // populate custom inputs
          let output = '<p>';

          if (options.var_data.acf.thresholds != undefined) {
            options.var_data.acf.thresholds.forEach(function (element) {
              switch (element.acf_fc_layout) {
                case 'text':
                  output += element.text;
                  break;

                case 'input':
                  output +=
                    '<input type="number" size="4" class="" autocomplete="off"' +
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

                  output += '>';
              }
            });

            output += '</p>';

            item.find('#threshold-custom .accordion-body').html(output);
          }

          if (options.var_data.acf.var_names.length > 1) {
            options.has_thresholds = true;

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
                max: options.var_data.acf.var_names.length - 1,
                step: 1,
                animate: true,
                create: function (e, ui) {
                  // console.log('threshold slider', 'create');

                  $(this)
                    .find('.ui-slider-handle')
                    .text(options.var_data.acf.var_names[0].label);
                },
                slide: function (e, ui) {
                  // update the hidden input/query

                  options.status = 'slide';

                  $(this)
                    .find('.ui-slider-handle')
                    .text(options.var_data.acf.var_names[ui.value].label);

                  // let clone_query = { ...options.query };

                  // clone_query.var =
                  //   options.var_data.acf.var_names[ui.value].variable;

                  options.query_str.prev = options.query_str.current;

                  options.query_str.current = $(document).cdc_app(
                    'query.eval',
                    {
                      query: options.query, //clone_query,
                      do_history: 'none',
                      callback: function () {
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
                    .val(options.var_data.acf.var_names[ui.value].variable)
                    .trigger('change');
                },
                stop: function (e, ui) {
                  // if (status != 'init') {
                  options.status = 'input';
                  // }
                },
              });

            // find out which index of the var_names array
            // is the field's value

            // console.log('find ' + options.query.var + ' in var_data');

            options.var_data.acf.var_names.forEach(function (var_name, i) {
              if (Object.values(var_name).includes(options.query.var)) {
                // console.log(i, var_name);

                options.elements.threshold_slider.slider('option', 'value', i);

                // set handle text
                options.elements.threshold_slider
                  .find('.ui-slider-handle')
                  .text(options.var_data.acf.var_names[i].label);
              }
            });

            item
              .find('#threshold-preset-head .accordion-button')
              .prop('disabled', false);
          } else {
            item
              .find('#threshold-custom-head .accordion-button')
              .trigger('click');

            item
              .find('#threshold-preset-head .accordion-button')
              .addClass('disabled')
              .prop('disabled', true);
          }
        }

        plugin.set_controls();
      }
    },

    set_controls: function () {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      let items_to_hide = [],
        items_to_show = [];

      if (options.has_thresholds == true) {
        // show all data-display="threshold"
        item.find('[data-display="threshold"]').show();
        item.find('[data-display="single"]').hide();
      } else {
        item.find('[data-display="threshold"]').hide();
        item.find('[data-display="single"]').show();
      }
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
