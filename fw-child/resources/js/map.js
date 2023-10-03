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
      // TABS
      //

      $('#control-bar').tab_drawer();

      //
      // EVENTS
      //

      // MAP CONTROLS

      item.on('click', '.map-zoom-btn', function (e) {
        let current_zoom = options.maps.ssp1.object.getZoom(),
          new_zoom = current_zoom + 1;

        if ($(this).hasClass('zoom-out')) {
          new_zoom = current_zoom - 1;
        }

        options.maps.ssp1.object.setZoom(new_zoom);
      });

      // SIDEBAR CONTROLS

      item.on('change', '#map-control-panels input', function () {
        let this_panel = $('#map-' + $(this).val());

        if ($(this).prop('checked') == true) {
          this_panel.removeClass('hidden');
        } else {
          // let this_width = this_panel.outerWidth();

          //           this_panel.css('width', this_panel.outerWidth() + 'px');
          //
          //           setTimeout(function () {
          //             this_panel.animate(
          //               {
          //                 width: '0px',
          //               },
          //               {
          //                 duration: 500,
          //                 complete: function () {
          this_panel.addClass('hidden');
          //       },
          //     },
          //   );
          // }, 1000);
        }

        setTimeout(function () {
          plugin.invalidate_size();
        }, 500);
      });
    },

    invalidate_size: function () {
      let plugin = this,
        options = plugin.options;

      for (let key in options.maps) {
        options.maps[key].object.invalidateSize();
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
})(jQuery);
