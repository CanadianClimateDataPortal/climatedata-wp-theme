// map functions

var result = {};

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
          },
        },
        medium: {
          container: null,
          object: null,
          layers: {
            raster: null,
            grid: null,
          },
        },
        high: {
          container: null,
          object: null,
          layers: {
            raster: null,
            grid: null,
          },
        },
      },
      query: {
        coords: [62.51231793838694, -98.48144531250001, 4],
        delta: '',
        dataset: 'cmip6',
        var_id: null,
        var: null,
        frequency: 'ann',
        scenarios: ['medium'],
        decade: 2040,
        sector: 'canadagrid',
        scheme: 'scheme1',
      },
      query_str: {
        prev: '',
        current: '',
      },
      var_data: null,
      frequency: {},
      elements: {
        decade_slider: null,
        threshold_slider: null,
      },
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
    // sector: canadagrid, census, health, watershed

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
            $('#status').text('getting random variable');

            console.log('map', 'get var ID');

            // if it's not set, grab a random variable

            $.ajax({
              url: ajax_data.url,
              type: 'GET',
              async: false, // don't continue until this is done
              data: {
                action: 'cdc_get_random_var',
              },
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

          console.log('processed query object');
          console.log(JSON.stringify(options.query, null, 4));

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
              $(document).cdc_app(
                'maps.get_layer',
                options.query,
                options.var_data,
              );

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

      options.maps = $(document).cdc_app('maps.init', options.maps);

      // SLIDERS

      // decade

      options.elements.decade_slider = $('#decade-slider').slider({
        min: 1970,
        max: 2100,
        step: 10,
        create: function () {
          let val = $(this).slider('value');

          $(this)
            .find('.ui-slider-handle span')
            .text(val + '–' + (val + 10));

          $('[data-query-key="decade"]').val(val).trigger('change');
        },
        slide: function (e, ui) {
          // console.log('SLIDE');
          options.status = 'slide';

          $(this)
            .find('.ui-slider-handle span')
            .text(ui.value + '–' + (ui.value + 10));

          let clone_query = { ...options.query };

          clone_query.decade = ui.value;

          options.query_str.current = $(document).cdc_app('query.eval', {
            query: clone_query,
            do_history: 'none',
            callback: function () {
              $(document).cdc_app(
                'maps.get_layer',
                clone_query,
                options.var_data,
              );
            },
          });
        },
        change: function (e, ui) {
          // status = input, changed by the stop function
          // so this input change will fire the history push
          $(this)
            .find('.ui-slider-handle span')
            .text(ui.value + '–' + (ui.value + 10));

          $('[data-query-key="decade"]').val(ui.value).trigger('change');
        },
        stop: function (e, ui) {
          options.status = 'input';
        },
      });

      // opacity

      item.find('.opacity-slider').slider({
        min: 0,
        max: 100,
        value: 100,
        step: 1,
        slide: function (e, ui) {
          plugin._opacity_slider_change($(this), e, ui);
        },
        change: function (e, ui) {
          plugin._opacity_slider_change($(this), e, ui);
        },
      });
    },

    _opacity_slider_change: function (slider, e, ui) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      // set handle text
      slider.find('.ui-slider-handle').text(ui.value);

      let this_pane = slider.attr('data-pane');

      // always set the given pane opacity
      // so it's consistent if we switch sectors
      item
        .find('.leaflet-pane.leaflet-' + this_pane + '-pane')
        .css('opacity', ui.value / 100);

      // grid layer defaults to 1
      item.find('.leaflet-pane.leaflet-grid-pane').css('opacity', 1);

      if (this_pane == 'raster' && options.query.sector != 'canadagrid') {
        // if this is the 'data' slider, and
        // we're looking at a sector layer
        // adjust the grid pane
        item
          .find('.leaflet-pane.leaflet-grid-pane')
          .css('opacity', ui.value / 100);
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

      // click grid item

      item.on('select_map_item', function (e, click_event) {
        console.log('grid click', click_event);

        // add marker

        $(document).cdc_app(
          'maps.add_marker',
          click_event.latlng.lat,
          click_event.latlng.lng,
        );

        // load location details

        $('#control-bar').tab_drawer('update_path', '#location-detail');

        item
          .find('#location-detail .control-tab-head h5')
          .text(click_event.latlng.lat + ', ' + click_event.latlng.lng);

        // console.log(options.var_data);

        $.ajax({
          url:
            geoserver_url +
            '/generate-charts/' +
            click_event.latlng.lat +
            '/' +
            click_event.latlng.lng +
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
            console.log('chart data', data);

            $(document).cdc_app('charts.render', {
              data: data,
              query: options.query,
              var_data: options.var_data,
              coords: click_event.latlng,
              download_url: null,
              container: item.find('#location-chart-container')[0],
            });
          },
        });
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

      //
      // SIDEBAR CONTROLS
      //

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

      // MISC

      // colour scheme dropdown selection

      item.on('click', '#display-scheme-select .dropdown-item', function () {
        // update hidden input
        $('[data-query-key="scheme"]')
          .val($(this).attr('data-scheme-id'))
          .trigger('change');

        plugin.update_scheme();
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

      console.log('handle input, status ' + status);

      let this_key = input.attr('data-query-key'),
        this_val = input.val();

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

          if (this_val != 'canadagrid') {
            item
              .find('.leaflet-pane.leaflet-grid-pane')
              .css('opacity', $('#display-data-slider').slider('value') / 100);
          }
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

        // run the query

        options.query_str.prev = options.query_str.current;

        console.log('handle_input call eval now, history: ' + do_history);

        options.query_str.current = $(document).cdc_app('query.eval', {
          query: options.query,
          do_history: do_history,
          callback: function () {
            console.log('get_layer', options.status);

            $(document).cdc_app(
              'maps.get_layer',
              options.query,
              options.var_data,
            );

            console.log('status = ready');
            options.status = 'ready';
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

      console.log('refresh');

      // update control bar inputs from query

      for (let key in options.query) {
        // console.log(key, options.query[key]);

        // for each key in the query object

        // find input(s) that matches this key
        let this_input = item.find('[data-query-key="' + key + '"]');

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

                // maybe don't trigger the input change here
                // it conflicts with map stuff that's happening
                // concurrently
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

            // var ID
            if (key == 'var_id') {
              plugin.update_var(options.query[key], status);
            }

            // decade
            if (key == 'decade') {
              // update UI slider
              options.elements.decade_slider.slider(
                'value',
                parseInt(options.query[key]),
              );
            }

            // colour scheme
            if (key == 'scheme') {
              // update colour scheme dropdown
              plugin.update_scheme();
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
              // console.log('change val');
              this_radio.prop('checked', true);
              $(document).trigger('update_input', [$(this_radio), 'eval']);
            }
          } else if (this_input.is('select')) {
            if (this_input.val() != options.query[key]) {
              // console.log('change val');
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

    update_var: function (var_id, status = null, callback = null) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      if (status == null) status = options.status;

      console.log('updating ' + var_id + ', ' + status);

      if (var_id != null) {
        $(document).cdc_app('get_var_data', var_id, function (data) {
          // console.log('get var data', data);

          // update var_data
          options.var_data = data;

          let hidden_input = item.find('[data-query-key="var"]');

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

            // setup slider and custom inputs

            if (options.var_data.acf.var_names.length > 1) {
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
                  create: function () {
                    // console.log('threshold slider', 'create');
                  },
                  slide: function (e, ui) {
                    // update the hidden input/query

                    options.status = 'slide';

                    $(this)
                      .find('.ui-slider-handle')
                      .text(options.var_data.acf.var_names[ui.value].label);

                    let clone_query = { ...options.query };

                    clone_query.decade = ui.value;

                    options.query_str.current = $(document).cdc_app(
                      'query.eval',
                      {
                        query: clone_query,
                        do_history: 'none',
                        callback: function () {
                          $(document).cdc_app(
                            'maps.get_layer',
                            clone_query,
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

              console.log('find ' + options.query.var + ' in var_data');

              options.var_data.acf.var_names.forEach(function (var_name, i) {
                if (Object.values(var_name).includes(options.query.var)) {
                  console.log(i, var_name);

                  options.elements.threshold_slider.slider(
                    'option',
                    'value',
                    i,
                  );

                  // set handle text
                  options.elements.threshold_slider
                    .find('.ui-slider-handle')
                    .text(options.var_data.acf.var_names[i].label);
                }
              });
            }

            // TODO
            // plugin.update_frequency();

            if (typeof callback == 'function') {
              callback(data);
            }
          }
        });
      }
    },

    update_frequency: function (var_name) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      let frequency_select = item.find('select[data-query-key="frequency"]');

      frequency_select.empty();

      // console.log('variable timesteps', options.var_data.acf.timestep);

      options.var_data.acf.timestep.forEach(function (option) {
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
      });

      // console.log('available', options.var_data.acf.timestep);
      // console.log('selected', options.query.frequency);

      if (!options.var_data.acf.timestep.includes(options.query.frequency)) {
        // console.log('select first', frequency_select.find('option').first());

        frequency_select
          .val(frequency_select.find('option').first().attr('value'))
          .trigger('change');
      }
    },

    update_scheme: function () {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      console.log('select', options.query.scheme);

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

      // copy item style to toggle
      selected_item
        .closest('.dropdown')
        .find('.dropdown-toggle .gradient')
        .attr('style', selected_item.find('.gradient').attr('style'));
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
})(jQuery);
