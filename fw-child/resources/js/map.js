// map functions

var result = {};

(function ($) {
  function map_app(item, options) {
    // options

    var defaults = {
      globals: ajax_data.globals,
      lang: ajax_data.globals.lang,
      post_id: null,
      map: {
        object: null,
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

      // object

      options.map.object = L.map('map-object', {
        center: [62.51231793838694, -98.48144531250001],
        zoomControl: false,
        zoom: 4,
      });

      // layers

      options.map.object.createPane('basemap');
      options.map.object.getPane('basemap').style.zIndex = 399;
      options.map.object.getPane('basemap').style.pointerEvents = 'none';

      options.map.object.createPane('raster');
      options.map.object.getPane('raster').style.zIndex = 400;
      options.map.object.getPane('raster').style.pointerEvents = 'none';

      options.map.object.createPane('grid');
      options.map.object.getPane('grid').style.zIndex = 500;
      options.map.object.getPane('grid').style.pointerEvents = 'all';

      options.map.object.createPane('labels');
      options.map.object.getPane('labels').style.zIndex = 550;
      options.map.object.getPane('labels').style.pointerEvents = 'none';

      L.tileLayer(
        '//cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png',
        {
          attribution: '',
          subdomains: 'abcd',
          pane: 'basemap',
          maxZoom: 12,
        },
      ).addTo(options.map.object);

      //
      // TABS
      //

      $('#control-bar').tab_drawer();

      //
      // EVENTS
      //

      item.on('click', '.map-zoom-btn', function (e) {
        let current_zoom = options.map.object.getZoom(),
          new_zoom = current_zoom + 1;

        if ($(this).hasClass('zoom-out')) {
          new_zoom = current_zoom - 1;
        }

        options.map.object.setZoom(new_zoom);
      });
    },

    method_fn: function (fn_options) {
      let plugin = this,
        options = plugin.options;

      let fn_settings = $.extend(true, {}, fn_options);
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
