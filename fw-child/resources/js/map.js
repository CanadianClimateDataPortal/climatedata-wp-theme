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
      legend: {
        colormap: {
          colours: [],
          quantities: [],
          labels: null, // placeholder for special labels
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
        scheme: 'default',
        scheme_type: 'discrete',
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

      options.maps = $(document).cdc_app(
        'maps.init',
        options.maps,
        options.legend,
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
        },
        slide: function (e, ui) {
          // console.log('SLIDE');
          options.status = 'slide';

          $(this)
            .find('.ui-slider-handle span')
            .text(ui.value + 1 + '–' + (ui.value + 30));

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
            .text(ui.value + 1 + '–' + (ui.value + 30));

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

      // load default color scheme
      plugin.update_default_scheme(function () {
        $(document).cdc_app('maps.get_layer', options.query, options.var_data);
      });

      $(document).cdc_app(
        'add_hook',
        'maps.get_layer',
        500,
        plugin,
        plugin.apply_scheme,
      );
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

      if (
        this_pane == 'raster' &&
        options.query.sector != 'canadagrid' &&
        options.query.sector != 'era5landgrid'
      ) {
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

      //

      item.on('map_item_mouseout', function (e, click_event) {
        // TO FIX
        /*// reset highlighted
        options.grid.highlighted.forEach(function (feature) {
          new_layer.resetFeatureStyle(feature);
        });

        // update highlighted grid
        options.grid.highlighted = [e.layer.properties.gid];

        new_layer.setFeatureStyle(options.grid.highlighted, {
          weight: options.grid.styles.line.hover.weight,
          color: options.grid.styles.line.hover.color,
          opacity: options.grid.styles.line.hover.opacity,
          fillColor: options.grid.styles.fill.hover.color,
          fill: true,
          fillOpacity: options.grid.styles.fill.hover.opacity,
        });*/
      });

      // click grid item

      item.on('map_item_select', function (e, click_event) {
        console.log('grid click', click_event);

        // load location details

        plugin.set_location(click_event.latlng);
      });

      // click marker

      item.on('click_marker', function (e, click_event) {
        let list_item = item.find(
          '#recent-locations [data-coords="' +
            click_event.latlng.lat +
            ',' +
            click_event.latlng.lng +
            '"]',
        );

        console.log('clicked a marker', click_event, list_item);

        list_item.trigger('click');
      });

      // click item in 'recent locations'

      item.on('click', '#recent-locations .list-group-item', function () {
        let item_coords = $(this).attr('data-coords').split(',');

        plugin.set_location({
          lat: item_coords[0],
          lng: item_coords[1],
          marker_index: $(this).attr('data-index'),
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

          if (this_val != 'canadagrid' && this_val != 'era5landgrid') {
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

        // perform triggers based in input key, but with updated query object
        switch (this_key) {
          case 'var_id':
          case 'frequency':
          case 'delta':
            plugin.update_default_scheme(function () {
              $(document).cdc_app(
                'maps.get_layer', // todo: not ideal, may generates a flicker of the map layer
                options.query,
                options.var_data,
              );
            });
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

            // location
            if (key == 'location') {
              console.log('get location ' + options.query[key]);

              $.ajax({
                url: ajax_data.url,
                dataType: 'json',
                data: {
                  action: 'cdc_get_location_by_id',
                  lang: options.lang,
                  loc: options.query[key],
                },
                success: function (data) {
                  let open_location = false;

                  if (window.location.hash == '#location-detail') {
                    open_location = true;
                  }

                  plugin.set_location(
                    { lat: data.lat, lng: data.lng },
                    open_location,
                  );
                },
              });
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

      let fields;

      if (status == null) status = options.status;

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
          }
        });
      }

      // always do this stuff
      // console.log(options.var_data);

      // ADJUST CONTROLS BY VAR SETTINGS

      // fields var
      fields = options.var_data.acf;

      // console.log('fields');
      // console.log(fields);

      // dataset availability
      item.find('#map-control-dataset .btn-check').prop('disabled', false);

      item.find('#map-control-dataset .btn-check').each(function () {
        if (!fields.dataset_availability.includes($(this).val())) {
          $(this).prop('disabled', true);

          if ($(this).prop('checked') == true) {
            $(this).prop('checked', false);
          }
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

      // decade & threshold slider

      if (typeof fields.var_names != 'undefined') {
        // decade min/max

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

        if (fields.var_names.length > 1) {
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
              create: function () {
                // console.log('threshold slider', 'create');
              },
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
                    $(document).cdc_app(
                      'maps.get_layer',
                      clone_query,
                      options.var_data,
                    );
                  },
                });
              },
              change: function (e, ui) {
                hidden_input
                  .val(fields.var_names[ui.value].variable)
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
        }

        // set breadcrumb & overlay content

        item
          .find('#breadcrumb-variable')
          .text(
            options.lang != 'en'
              ? options.var_data.meta.title_fr
              : options.var_data.title.rendered,
          );

        let desc_key = 'var_description' + (options.lang != 'en' ? '_fr' : ''),
          tech_key =
            'var_tech_description' + (options.lang != 'en' ? '_fr' : '');

        item.find('#info-description').html(options.var_data.acf[desc_key]);
        item
          .find('#info-tech-description')
          .html(options.var_data.acf[tech_key]);

        // update frequency select
        plugin.update_frequency();

        // set 'sector' parameter to stations
        // if the var has that term
        if (options.var_data.var_types.includes('Station Data')) {
          options.query.sector = 'station';
        } else {
          options.query.sector = item
            .find('[data-query-key="sector"]:checked')
            .val();
        }

        // ADJUST CONTROLS FOR INDIVIDUAL VARS

        // building climate zones

        if (options.var_data.slug == 'building_climate_zones') {
          item
            .find('#display-aggregation-grid')
            .prop('checked', true)
            .trigger('change');

          item.find('[data-query-key="scheme"]')
            .val('default')
            .trigger('change');
          item.find('#display-scheme-select .dropdown-toggle').prop('disabled', true);

          item
            .find(
              '#map-control-aggregation .form-check-input:not(#display-aggregation-grid)',
            )
            .prop('disabled', true);
        } else {
          item
            .find(
              '#map-control-aggregation .form-check-input:not(#display-aggregation-grid)',
            )
            .prop('disabled', false);
          item.find('#display-scheme-select .dropdown-toggle').prop('disabled', false);
        }

        if (typeof callback == 'function') {
          callback(data);
        }
      }
    },

    update_frequency: function (var_name) {
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

    // fetch colours of default scheme from Geoserver and update the data of the default
    // one in the dropdown
    update_default_scheme: function (callback) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      let default_scheme_element = item.find(
        '#display-scheme-select .dropdown-item[data-scheme-id="default"]',
      );

      if (special_variables.hasOwnProperty(options.var_data.slug)) {
        const special_var = special_variables[options.var_data.slug];
        default_scheme_element.data('scheme-colours', special_var.colormap.colours);
        default_scheme_element.data('scheme-quantities', special_var.colormap.quantities);
        plugin.update_scheme();

        if (typeof callback === 'function') {
          callback();
        }
      } else {
        let layer_name = $(document).cdc_app(
          'maps.get_layer_name',
          options.query,
        );
        $.getJSON(
          geoserver_url +
          '/geoserver/wms?service=WMS&version=1.1.0&request=GetLegendGraphic' +
          '&format=application/json&layer=' +
          layer_name,
        )
          .then(function (data) {
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
    },

    // Hook that update leaflet params object depending on selected scheme
    apply_scheme: function (query, layer_params) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      if (special_variables.hasOwnProperty(options.var_data.slug)) {
        const special_var = special_variables[options.var_data.slug];
        layer_params.tiled = false;
        delete layer_params.sld_body;
        layer_params.layers = layer_params.layers.replace(...special_var.layers_replace);
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

      let colours = selected_scheme_item.data('scheme-colours');
      let query = options.query;
      let quantity;

      if (special_variables.hasOwnProperty(options.var_data.slug)) {
        $.extend(options.legend.colormap, special_variables[options.var_data.slug].colormap);
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

          // if we have a diverging ramp, we center the legend at zero
          if (selected_scheme_item.data('scheme-type') === 'divergent') {
            high = Math.max(Math.abs(low), Math.abs(high));
            low = high * -1;
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

    set_location: function (coords, open_tab = true) {
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

          // add marker

          $(document).cdc_app('maps.add_marker', data, function () {});

          // search field value
          if (data.geo_name != 'Point') {
            item.find('#area-search').val(data.title);
          }

          // hidden input
          item
            .find('[data-query-key="location"]')
            .val(data.geo_id)
            .trigger('change');

          // tab headings
          item.find('#location-detail .control-tab-head h5').text(data.title);
        },
      }).then(function () {
        if (open_tab == true) {
          console.log('load location now');

          if (window.location.hash != '#location-detail') {
            $('#control-bar').tab_drawer('update_path', '#location-detail');
          }

          // console.log(options.var_data);

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
              console.log('chart data', data);

              item.find('#chart-series-items .cloned').remove();

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
      });
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
