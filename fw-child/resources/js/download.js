// map functions
(function ($) {
  function download_app(item, options) {
    // options

    var defaults = {
      globals: ajax_data.globals,
      lang: 'en',
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
        var: null,
        var_group: '',
        frequency: 'ann',
        scenarios: ['low'],
        decade: 2040,
        sector: '',
        scheme: 'scheme1',
        inputs: [],
      },
      query_str: {
        prev: '',
        current: '',
      },
      elements: {
        threshold_accordion: null,
        threshold_slider: null,
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
        console.log('map', 'init');
      }

      options.lang = options.globals.current_lang_code;

      //
      // MAP
      //

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

      item.on('update_input', function (event, item, status) {
        console.log('update input event');
        if (item) {
          // reset history push counter
          pushes_since_input = 0;
          plugin.handle_input($(item), status);
        }
      });

      //
      // QUERY OBJECT
      //

      console.log('download', 'init', 'url to obj');

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

      $('#control-bar').tab_drawer({
        history: {
          enabled: false,
        },
      });

      //
      // JQUERY UI WIDGETS
      //

      options.elements.threshold_slider = item
        .find('#threshold-slider')
        .slider({
          min: 0,
          step: 1,
        });

      //
      // BOOTSTRAP COMPONENTS
      //

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

            options.query.inputs = [];

            item
              .find('#threshold-custom .accordion-body :input')
              .each(function () {
                options.query.inputs.push($(this).val());
              });
          } else {
            // preset:
            // populate options.query.inputs with the slider value

            options.query.inputs = [
              options.elements.threshold_slider.slider('value'),
            ];

            // show the data layer
            item.find('.leaflet-raster-pane').show();
          }
        },
      );

      //
      // EVENTS
      //

      // select a variable grid item

      item.on('click', '.var-select', function () {
        // get variable by ID

        $(document).cdc_app(
          'get_var_data',
          $(this).attr('data-var-id'),
          function (data) {
            options.var_data = data;

            // get the first var_names entry

            if (typeof options.var_data.acf.var_names != 'undefined') {
              // setup slider and custom inputs

              if (options.var_data.acf.var_names.length > 1) {
                // multiple vars

                // populate presets

                // set slider max
                options.elements.threshold_slider.slider(
                  'option',
                  'max',
                  options.var_data.acf.var_names.length - 1,
                );

                options.elements.threshold_slider.slider('option', 'value', 0);

                // set handle text
                options.elements.threshold_slider
                  .find('.ui-slider-handle')
                  .text(options.var_data.acf.var_names[0].label);

                // redo slide function
                options.elements.threshold_slider.on('slide', function (e, ui) {
                  $(this)
                    .find('.ui-slider-handle')
                    .text(options.var_data.acf.var_names[ui.value].label);

                  // update the hidden input/query
                  options.status = 'input';

                  item
                    .find('[data-query-key="var"]')
                    .val(options.var_data.acf.var_names[ui.value].variable)
                    .trigger('change');
                });

                // populate inputs

                let output = '<p>';

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
                        (element.min != ''
                          ? 'min="' + element.min + '" '
                          : '') +
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

                // show

                item.find('#var-thresholds').show();
              }
            }
          },
        );
      });

      item.on('click', 'a[data-query-key]', function () {
        options.status = 'input';
        $(document).trigger('update_input', [$(this)]);
      });

      item.on('change', ':input[data-query-key]', function () {
        if (options.status != 'slide' && options.status != 'mapdrag') {
          options.status = 'input';
        }

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

      //
      // RUN INITIAL QUERY
      //

      console.log('download', 'init', 'eval');

      $(document).cdc_app('maps.get_grid_layer');

      // options.query_str.current = $(document).cdc_app(
      //   'query.eval',
      //   'replace',
      //   function () {
      //     options.status = 'ready';
      //   },
      // );
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
          // plugin.update_var(this_val);
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
            if (options.query.var != null) {
              $(document).cdc_app('maps.get_data_layer');
            }

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

        console.log(key, this_input);

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
                console.log('trigger now');
                $(document).trigger('update_input', [$(this), options.status]);
              }
            });
          }
        } else {
          // query option is a single value
          // check out what type of input goes with it

          if (key == 'var') {
            console.log('var', options.query[key]);

            if (options.query[key] != null) {
              // plugin.update_var(options.query[key]);
            }
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

    update_var: function (var_name) {
      let plugin = this,
        options = plugin.options,
        item = plugin.item;

      //       $(document).cdc_app('get_var_data', var_name, function (data) {
      //         options.var_data = data[0];
      //
      //         // console.log(options.var_data);
      //
      //         let new_var_name =
      //           options.lang != 'en'
      //             ? options.var_data.meta.title_fr
      //             : options.var_data.title.rendered;
      //
      //         item.find('.tab-drawer-trigger.var-name').text(new_var_name);
      //       });
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
