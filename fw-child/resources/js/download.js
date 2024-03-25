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
      legend: {
        colormap: {
          colours: [],
          quantities: [],
        },
      },
      current_selections: [],
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
        start_year: 1950,
        end_year: 1955,
        start_date:
          new Date().getFullYear() - 30 + new Date().toJSON().substr(4, 6),
        end_date: new Date().toJSON().slice(0, 10),
        format: 'csv',
        input_type: 'preset',
        inputs: [],
        station: [],
      },
      query_str: {
        prev: '',
        current: '',
      },
      var_data: null,
      var_flags: {
        single: false,
        inputs: false,
        threshold: false,
        station: false,
      },
      request_type: 'single',
      elements: {
        start_slider: null,
        end_slider: null,
        threshold_accordion: null,
        threshold_slider: null,
        start_picker: null,
        end_picker: null,
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

          console.log('download', 'refresh inputs', options.status);

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
        ajax: {
          url: ajax_data.url,
          dataType: 'json',
          delay: 0,
          data: function (params) {
            return {
              action: 'cdc_station_search',
              q: params.term, // search term
              page: params.page,
            };
          },
          processResults: function (data, page) {
            // parse the results into the format expected by Select2.
            // since we are using custom formatting functions we do not
            // need to alter the remote JSON data
            return {
              results: data,
            };
          },
          cache: true,
        },
        escapeMarkup: function (markup) {
          return markup;
        }, // let our custom formatter work
        width: '100%',
        placeholderOption: 'first',
        placeholder: $('#station-select').attr('data-placeholder'),
      });

      // BOOTSTRAP COMPONENTS

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

          if ($(e.target).attr('id') == 'threshold-custom') {
            // custom:
            // populate options.query.inputs with the field values

            // hide the data layer - it's not applicable to a
            // custom threshold query
            item.find('.leaflet-raster-pane').hide();
          } else {
            // preset:
            // populate options.query.inputs with the slider value

            // show the data layer
            item.find('.leaflet-raster-pane').show();
          }
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

      item.find('#var-select-query').fw_query();

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

      item.on('map_item_mouseover', function (e, click_event) {
        let this_gid = click_event.layer.properties.gid;

        if (
          !options.current_selections.length ||
          (options.current_selections.length &&
            !options.current_selections.includes(this_gid))
        ) {
          for (let key in options.maps) {
            options.maps[key].layers.grid.setFeatureStyle(this_gid, {
              color: '#444',
              weight: 1,
              opacity: 1,
            });
          }
        }
      });

      item.on('map_item_mouseout', function (e, click_event) {
        let this_gid = click_event.layer.properties.gid;

        if (
          !options.current_selections.length ||
          (options.current_selections.length &&
            !options.current_selections.includes(this_gid))
        ) {
          for (let key in options.maps) {
            options.maps[key].layers.grid.resetFeatureStyle(this_gid);
          }
        }
      });

      item.on('map_item_select', function (e, click_event) {
        let this_gid = click_event.layer.properties.gid;

        options.current_selections = [];

        item
          .find('#area-selections')
          .val()
          .split(',')
          .forEach(function (selection) {
            if (selection != '')
              options.current_selections.push(parseInt(selection));
          });

        // console.log('current', current_selections);

        if (options.current_selections.includes(this_gid)) {
          // deselect

          for (var i = options.current_selections.length - 1; i >= 0; i--) {
            if (options.current_selections[i] === this_gid) {
              options.current_selections.splice(i, 1);
            }
          }

          for (let key in options.maps) {
            options.maps[key].layers.grid.resetFeatureStyle(this_gid);
          }
        } else {
          // select

          options.current_selections.push(this_gid);

          for (let key in options.maps) {
            options.maps[key].layers.grid.setFeatureStyle(this_gid, {
              color: '#f00',
              weight: 1,
              opacity: 1,
            });
          }
        }

        item
          .find('#area-selections')
          .val(options.current_selections.join(','))
          .trigger('change');
      });

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
          $(this).attr('data-query-key') +
            ': ' +
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

        let prev_tab = item.find(prev_id),
          new_tab = item.find(new_id);

        if (prev_id == new_id) {
          // console.log("tab didn't change");
        } else if (new_tab.closest(prev_tab).length) {
          // console.log('tab is a child');
        } else {
          plugin.validate_tab(prev_id, new_id);
        }
      });

      //
      // CUSTOM SHAPEFILE
      //

      // Show/hide the user custom shapefile on the map when the "Custom shapefile" radio button is selected/deselected
      item.find('input[name=area-aggregation]').on('change', function() {
        if (this.value === 'upload') {
          options.elements.shapefile_upload.shapefile_upload('show');
        } else {
          options.elements.shapefile_upload.shapefile_upload('hide');
        }
      });

      // Show information with the "more info" button.
      const tooltip_trigger = item.find('#area-aggregation-upload-tooltip').first();
      tooltip_trigger.popover({
        trigger: 'hover',
        html: true,
        content: () => {
          return tooltip_trigger.find('span').first().html();
        },
      });

      //
      // SUBMIT
      //

      item.on('click', '#submit-btn', function () {
        console.log('SUBMIT DATA');
        console.log(JSON.stringify(options.query, null, 4));

        plugin.process();
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

      // console.log('input change', input, this_key, this_val);

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

            if (status != 'init') {
              options.status = 'ready';
            }
          },
        });
      } else {
        if (status != 'init') {
          options.status = 'ready';
        }
      }

      // eval/toggle conditional elements
      // based on new query values
      $(document).cdc_app('toggle_conditionals');
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

        // console.log('refresh', key, this_input.val(), options.query[key]);

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
              } else if ($(this).hasClass('select2')) {
                // console.log('update select');
                // console.log('status', options.status);
                $(this).val(options.query[key]).trigger('change');
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

            if (key == 'start_year') {
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
              // console.log('var', options.query[key]);

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
              // console.log('radio', this_radio);
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

      options.var_flags.single = false;
      options.var_flags.inputs = false;
      options.var_flags.threshold = false;
      options.var_flags.station = false;

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
          // console.log('skip get_var_data');
        } else {
          // console.log('get_var_data because var_id changed');
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

            // console.log('sector: ' + options.query.sector);

            if (typeof callback == 'function') {
              callback(data);
            }
          });
        }

        // set var_flags
        // for conditional showing/hiding of controls

        if (options.var_data.var_types.includes('Station Data')) {
          // console.log('var is station data');
          options.query.sector = 'station';
          options.var_flags.station = true;
        } else {
          // console.log('var is NOT station data');

          // find checked radio
          // or keep default query.sector

          if (item.find('[data-query-key="sector"]:checked').length) {
            options.query.sector = item
              .find('[data-query-key="sector"]:checked')
              .val();
          }
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
          }

          // does the variable have input fields
          if (options.var_data.acf.thresholds !== null) {
            options.var_flags.inputs = true;
          }

          if (
            options.var_flags.inputs == false &&
            options.var_flags.threshold == false
          ) {
            options.var_flags.single = true;

            item
              .find('#threshold-preset-head .accordion-button')
              .addClass('disabled')
              .prop('disabled', true);

            if (!item.find('#threshold-custom').hasClass('show')) {
              item
                .find('#threshold-custom-head .accordion-button')
                .trigger('click');
            }
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

          // let desc_key =
          //     'var_description' + (options.lang != 'en' ? '_fr' : ''),
          //   tech_key =
          //     'var_tech_description' + (options.lang != 'en' ? '_fr' : '');

          // item.find('#info-description').html(options.var_data.acf[desc_key]);
          // item
          //   .find('#info-tech-description')
          //   .html(options.var_data.acf[tech_key]);
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

      // SHOW / HIDE CONTROLS

      // each flag
      for (let key in options.var_flags) {
        // console.log('check', key, options.var_flags[key]);

        // find items with this condition
        item.find('[data-display*="' + key + '"]').each(function () {
          // find its 0/1 value
          let split_attr = $(this)
            .attr('data-display')
            .split(key)[1]
            .substr(1, 1);

          // console.log($(this));
          // console.log(key + ' has to be ' + split_attr);

          if (options.var_flags[key] == true) {
            // flag is false, condition is 1
            split_attr == '1' ? $(this).show() : $(this).hide();
          } else {
            // flag is false, condition is 0
            split_attr == '0' ? $(this).show() : $(this).hide();
          }
        });
      }

      // UPDATE CONTROL SETTINGS

      if (options.var_flags.threshold == true) {
        // console.log('select threshold accordion');

        if (item.find('#threshold-preset-btn').hasClass('collapsed')) {
          item.find('#threshold-preset-btn').trigger('click');
        }
      } else if (options.var_flags.inputs == true) {
        // no thresholds, but
        // does have inputs
      }

      // console.log('---');
    },

    validate_tab: function (prev_id, new_id) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      let prev_tab = item.find(prev_id),
        new_tab = item.find(new_id);

      console.log('validate tab', prev_id);

      let invalid_messages = [],
        tab_items = item.find('#control-bar-tabs'),
        tab_alert = $(prev_id).find('.invalid-alert'),
        msg_list = tab_alert.find('ul');

      tab_items.find('[href="' + new_id + '"]').removeClass('invalid');

      msg_list.empty();

      // each validate-able input in this tab

      $(prev_id)
        .find('[data-validate]:visible')
        .each(function () {
          let input_to_check = $(this),
            valid_msg = $(this).attr('data-validate');

          // if data-validate is an ID,
          // check the value of that input instead

          if (valid_msg.charAt(0) == '#') {
            input_to_check = item.find(valid_msg);
            valid_msg = input_to_check.attr('data-validate');
          }

          console.log('check', input_to_check, valid_msg);

          // check for blank value
          // console.log($(this), $(this).val());
          if (input_to_check.val() == '' || input_to_check.val() == 'null') {
            tab_items.find('[href="' + prev_id + '"]').addClass('invalid');
            invalid_messages.push(valid_msg);
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
              tab_items.find('[href="' + prev_id + '"]').addClass('invalid');

              invalid_messages.push('All custom inputs are required.');

              return false;
            }
          });
        }
      } else if (prev_id == '#area') {
        if (options.var_flags.station == true) {
        }
        
        // Validate the custom shapefile
        if (options.query.sector === 'upload') {
          const validation_message = options.elements.shapefile_upload.shapefile_upload('validate');
          if (validation_message != null) {
            invalid_messages.push(validation_message);
          }
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

      if (new_id == '#submit') {
        plugin.validate_request();
      }
    },

    validate_request: function () {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      options.query.is_valid = true;
      options.query.inputs = [];

      console.log('validating request');
      console.log(JSON.stringify(options.query, null, 4));

      // what kind of request is it

      console.log('flags', options.var_flags);

      if (options.var_flags.threshold == true) {
        options.request_type = 'threshold';
      }

      console.log(item.find('#var-thresholds .collapse.show'));

      if (
        options.var_flags.inputs == true &&
        item.find('#var-thresholds .collapse.show').attr('id') ==
          'threshold-custom'
      ) {
        options.request_type = 'inputs';
      }

      if (options.var_flags.station == true) {
        options.request_type = 'station';
      }

      console.log('request type', options.request_type);

      switch (options.request_type) {
        case 'station':
          // station data

          // check start/end dates

          if (
            options.start_date == '' ||
            options.end_date == '' ||
            parseInt(options.query.start_date) >
              parseInt(options.query.end_date)
          ) {
            options.query.is_valid = false;
          }

          // check for station selection

          if (options.query.station.length < 1) {
            options.query.is_valid = false;
          }

          if (options.query.is_valid == true) {
            // create the weather.gc.ca API link URL

            let station_url =
              'https://api.weather.gc.ca/collections/climate-daily/items' +
              '?datetime=' +
              options.query.start_date +
              '%2000:00:00/' +
              options.query.end_date +
              '%2000:00:00' +
              '&STN_ID=' +
              options.query.station.join('|') +
              '&sortby=PROVINCE_CODE,STN_ID,LOCAL_DATE&f=' +
              options.query.format +
              '&limit=150000&startindex=0';

            console.log('GC URL', station_url);

            item
              .find('#station-submit-btn')
              .attr('href', station_url)
              .removeClass('disabled');
          }

          break;

        case 'threshold':
          // preset threshold

          console.log(
            'var',
            options.query.var,
            options.query.var.replace(/\D/g, ''),
          );

          item.find('#threshold-custom :input').each(function () {
            options.query.inputs.push({
              name: $(this).attr('name'),
              value: options.query.var.replace(/\D/g, ''),
              units: $(this).attr('data-units'),
            });
          });

          break;

        case 'inputs':
          // custom inputs

          item.find('#threshold-custom :input').each(function () {
            options.query.inputs.push({
              name: $(this).attr('name'),
              value: $(this).val(),
              units: $(this).attr('data-units'),
            });
          });

          break;
      }

      console.log('validated query');
      console.log(JSON.stringify(options.query, null, 4));
    },

    process: function () {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      switch (options.request_type) {
        case 'station':
          console.log('gc URL');

          break;

        case 'threshold':
        case 'inputs':
          console.log('create file name');
          console.log(options.query);
          break;
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
