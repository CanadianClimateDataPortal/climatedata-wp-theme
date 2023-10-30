// map functions

var result = {};

(function ($) {
  function map_app(item, options) {
    // options

    var defaults = {
      globals: ajax_data.globals,
      lang: ajax_data.globals.lang,
      post_id: null,
      maps: {
        ssp1: {
          container: null,
          object: null,
        },
        ssp2: {
          container: null,
          object: null,
        },
        ssp5: {
          container: null,
          object: null,
        },
      },
      debug: true,
    };

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

      //
      // MAP
      //

      options.maps = $(document).cdc_app('init_maps', options.maps);

      //

      //
      // TABS
      //

      $('#control-bar').tab_drawer();

      $('#location-tabs-container').tabs();

      //
      // UI WIDGETS
      //

      $('#display-colour-table').sortable({
        items: '> div',
        handle: '.display-colour-sort-handle',
        placeholder: 'ui-state-highlight bg-white',
        forcePlaceholderSize: true,
      });

      $('#display-colours-table').disableSelection();

      //
      // EVENTS
      //

      // MAP CONTROLS

      // SIDEBAR CONTROLS

      item.on('change', '#map-control-panels input', function () {
        let this_panel = $('#map-' + $(this).val());

        if ($(this).prop('checked') == true) {
          this_panel.removeClass('hidden');
        } else {
          this_panel.addClass('hidden');
        }

        setTimeout(function () {
          $(document).cdc_app('invalidate_size');
        }, 500);
      });
    },

    invalidate_size: function () {},
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
