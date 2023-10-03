// map functions
(function ($) {
  function download_app(item, options) {
    // options

    var defaults = {
      globals: ajax_data.globals,
      lang: ajax_data.globals.lang,
      post_id: null,
      maps: {
        download: {
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

      //
      // MAP
      //

      for (let key in options.maps) {
        // create the map

        options.maps[key].object = L.map('map-object-' + key, {
          center: [62.51231793838694, -98.48144531250001],
          zoomControl: false,
          zoom: 4,
        });

        options.maps[key].container = $('#map-object-' + key);

        let this_map = options.maps[key],
          this_object = this_map.object;

        // layers

        this_object.createPane('basemap');
        this_object.getPane('basemap').style.zIndex = 399;
        this_object.getPane('basemap').style.pointerEvents = 'none';

        this_object.createPane('raster');
        this_object.getPane('raster').style.zIndex = 400;
        this_object.getPane('raster').style.pointerEvents = 'none';

        this_object.createPane('grid');
        this_object.getPane('grid').style.zIndex = 500;
        this_object.getPane('grid').style.pointerEvents = 'all';

        this_object.createPane('labels');
        this_object.getPane('labels').style.zIndex = 550;
        this_object.getPane('labels').style.pointerEvents = 'none';

        L.tileLayer(
          '//cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png',
          {
            attribution: '',
            subdomains: 'abcd',
            pane: 'basemap',
            maxZoom: 12,
          },
        ).addTo(this_object);
      }

      for (let key in options.maps) {
        Object.keys(options.maps).forEach(function (map) {
          if (map != key)
            options.maps[key].object.sync(options.maps[map].object);
        });
      }

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
