// map functions

var result = {};

(function ($) {
  function map_app(item, options) {
    // options

    var defaults = {
      globals: ajax_data.globals,
      lang: ajax_data.globals.lang,
      status: 'init',
      post_id: null,
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
        var: 'tx_max',
        var_group: '',
        frequency: 'ann',
        scenarios: ['medium'],
        decade: 2040,
        sector: '',
        scheme: 'scheme1',
      },
      query_str: {
        prev: '',
        current: '',
      },
      var_data: null,
      frequency: {},
      debug: true,
    };

    // coords: x/y/z
    // delta: null, true
    // dataset: cmip6, cmip5
    // geo-select: XXXXX
    // var:
    // var-group: temperature, precipitation, other
    // mora (frequency): ann, jan...dec, spring, summer, fall, winter
    // rcp (scenarios): low, medium, high
    // decade: 2040
    // sector: none (gridded), census, health, watershed

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

      options.lang = options.globals.current_lang_code;

      //
      // INITIALIZE
      //

      if (options.debug == true) {
        console.log('map', 'init');
      }

      //
      // MAP
      //

      console.log('map', 'init', 'maps');

      // initialize map objects
      options.maps = $(document).cdc_app('maps.init', options.maps);

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

          // console.log('moved map', options.status);

          // simulate input event on coords field
          plugin.handle_input($('[data-query-key="coords"]'));

          if (options.status != 'init') {
            // update query value
            $('[data-query-key="coords"]').each(function () {
              // console.log('update val', $(this).attr('name'), $(this).val());

              $(document).cdc_app('query.update_value', {
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
            'replace',
          );
        });
      }

      //
      // EVENTS
      //

      item.on('update_input', function (event, item, status) {
        if (item) {
          // reset history push counter
          pushes_since_input = 0;
          plugin.handle_input($(item), status);
        }
      });

      //
      // UI WIDGETS
      //

      // SLIDERS

      // decade

      let handle = $('#decade-slider-handle span');

      $('#decade-slider').slider({
        min: 1970,
        max: 2100,
        step: 10,
        create: function () {
          // console.log('decade slider', 'create');
          let val = $(this).slider('value');
          handle.text(val + '–' + (val + 10));
          $('[data-query-key="decade"]').val(val).trigger('change');
        },
        slide: function (e, ui) {
          // console.log('decade slider', 'slide');
          options.status = 'slide';
          handle.text(ui.value + '–' + (ui.value + 10));
          $('[data-query-key="decade"]').val(ui.value).trigger('change');
        },
        change: function (e, ui) {
          handle.text(ui.value + '–' + (ui.value + 10));
        },
        stop: function (e, ui) {
          // console.log('decade slider', 'stop');
          options.status = 'input';
          $('[data-query-key="decade"]').val(ui.value).trigger('change');
        },
      });

      // opacity

      $('.opacity-slider').slider({
        min: 0,
        max: 100,
        value: 100,
        step: 1,
        create: function () {},
        slide: function (e, ui) {
          $(this).find('.ui-slider-handle').text(ui.value);

          item
            .find(
              '.leaflet-pane.leaflet-' + $(this).attr('data-pane') + '-pane',
            )
            .css('opacity', ui.value / 100);
        },
        change: function (e, ui) {
          $(this).find('.ui-slider-handle').text(ui.value);

          item
            .find(
              '.leaflet-pane.leaflet-' + $(this).attr('data-pane') + '-pane',
            )
            .css('opacity', ui.value / 100);
        },
      });

      //
      // QUERY OBJECT
      //

      console.log('map', 'init', 'url to obj');

      // merge URL string with default query
      $(document).cdc_app(
        'query.url_to_obj',
        options.query,
        options.status,
        function (query) {
          plugin.refresh_inputs(query);
        },
      );

      //
      // TABS
      //

      $('#control-bar').tab_drawer();

      //
      // MISC UX
      //

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

      // colour selector

      item.on('click', '#display-scheme-select .dropdown-item', function () {
        // update hidden input
        $('[data-query-key="scheme"]')
          .val($(this).attr('data-scheme-id'))
          .trigger('change');

        plugin.update_scheme();
      });

      //
      // EVENTS
      //

      // MAP CONTROLS

      // SIDEBAR CONTROLS

      item.on('click', 'a[data-query-key]', function () {
        options.status = 'input';
        $(document).trigger('update_input', [$(this)]);
      });

      item.on('change', ':input[data-query-key]', function () {
        if (options.status != 'slide' && options.status != 'mapdrag') {
          options.status = 'input';
        }

        console.log('HEEYYYYY');
        $(document).trigger('update_input', [$(this)]);
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

      // HISTORY

      window.addEventListener('popstate', function (e) {
        // console.log('map', 'pop', e);
        // console.log('set status to eval');
        options.status = 'eval';
        plugin.handle_pop(e);
      });

      //
      // RUN INITIAL QUERY
      //

      console.log('map', 'init', 'eval');

      options.query_str.current = $(document).cdc_app(
        'query.eval',
        'replace',
        function () {
          options.status = 'ready';
        },
      );
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
        case 'var':
          plugin.update_var(this_val);
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

        // console.log('call update_value');

        // update the value in the query object
        $(document).cdc_app('query.update_value', {
          item: input,
          key: this_key,
          val: this_val,
        });

        // console.log('call eval');

        // run the query

        options.query_str.prev = options.query_str.current;

        options.query_str.current = $(document).cdc_app(
          'query.eval',
          do_history,
          function () {
            options.status = 'ready';
          },
        );
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

          if (key == 'var') {
            plugin.update_var(options.query[key]);
          } else if (this_input.is('[type="hidden"]')) {
            // hidden input
            // likely controlled by some other UX element

            this_input.val(options.query[key]);

            if (
              key == 'decade' &&
              typeof item.find('#decade-slider').data('uiSlider') != 'undefined'
            ) {
              // update UI slider
              item.find('#decade-slider').slider('value', options.query[key]);
            } else if (key == 'scheme') {
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

      // console.log('handle pop', e);

      // update query object from URL
      options.query = $(document).cdc_app(
        'query.url_to_obj',
        options.query,
        options.status,
        function (query) {
          plugin.refresh_inputs(query);
        },
      );

      // run the query

      if (options.query_str.current != window.location.search) {
        // only if the query string has changed
        // i.e. not switching between tabs

        options.query_str.prev = options.query_str.current;

        options.query_str.current = $(document).cdc_app(
          'query.eval',
          'replace',
          function () {
            options.status = 'ready';
          },
        );
      }
    },

    update_var: function (var_name) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      $(document).cdc_app('get_var_data', var_name, function (data) {
        options.var_data = data[0];

        // console.log(options.var_data);

        let new_var_name =
          options.lang != 'en'
            ? options.var_data.meta.title_fr
            : options.var_data.title.rendered;

        item.find('.tab-drawer-trigger.var-name').text(new_var_name);

        item.find('#location-detail .variable-name').text(new_var_name);

        plugin.update_frequency();
      });
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

    draw_colour_scheme: function(element) {
      let plugin = this,
          options = plugin.options,
          item = plugin.item;

      $(element).find('svg').empty();
      let colours = $(element).data('scheme-colours');
      let interval = (100 / colours.length);
      $.each(colours, function (idx, colour) {
        let rect = document.createElementNS(svgNS, 'rect');
        rect.setAttribute('height', '100%');
        rect.setAttribute('width', interval + '%');
        rect.setAttribute('x', (interval * idx) + '%');
        rect.setAttribute('fill', colour);
        $(element).find('svg').append(rect);
      });
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

      // copy item data to toggle
      selected_item
        .closest('.dropdown')
        .find('.dropdown-toggle').data(selected_item.data());

      // redraw the schemes
      item.find('#display-scheme-select .scheme-dropdown').each(function() {
        plugin.draw_colour_scheme(this);
      })

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
