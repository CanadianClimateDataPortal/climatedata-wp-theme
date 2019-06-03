var site_url = '//' + window.location.host + '/';

var scripts = document.querySelectorAll('script[src]'),
    src = scripts[scripts.length-1].src,
    filename = src.split('/').pop();

var theme_dir = src.replace('/resources/js/' + filename, '');

// query filter
// dependencies: jquery
// v1.0

(function ($) {
  
  // custom select class

  function query_filter(item, options) {
    
    this.item = $(item);
    
    // options
  
    var defaults = {
      debug: true
    };
    
    this.options = $.extend(true, defaults, options);
    
    this.init();
  }

  query_filter.prototype = {

    // init

    init: function () {

      var plugin_instance = this;
      var plugin_item = plugin_instance.item;
      var plugin_settings = plugin_instance.options;
      var plugin_classes = plugin_settings.classes;
      var plugin_elements = plugin_settings.elements;
      
      if (plugin_settings.debug == true) {
        console.log('query filter init');
        console.log(plugin_settings);
      }
      
      //
      // FEATURES
      //
      
      
      
      //
      // ELEMENTS
      //
      
      
      
      
      //
      // INIT
      //
      
      
      
    },
    
    _evaluate: function(fn_options) {

      var plugin_instance = this;
      var plugin_item = this.item;
      var plugin_settings = plugin_instance.options;
      var plugin_classes = plugin_settings.classes;
      var plugin_elements = plugin_settings.elements;
      
      // options
      
      var defaults = {
        clicked: null,
        append: false
      };
      
      var settings = $.extend(true, defaults, fn_options);
      
      
      
    },
    
    _load_items: function(fn_options) {

    }
    
  }

  // jQuery plugin interface

  $.fn.query_filter = function (opt) {
    
    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {

      var item = $(this);
      var instance = item.data('query_filter');

      if (!instance) {

        // create plugin instance if not created
        item.data('query_filter', new query_filter(this, opt));

      } else {

        // otherwise check arguments for method call
        if (typeof opt === 'string') {
          instance[opt].apply(instance, args);
        }

      }
    });
  }

}(jQuery));