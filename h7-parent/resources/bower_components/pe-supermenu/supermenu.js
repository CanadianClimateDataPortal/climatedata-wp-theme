// supermenu
// v1.0

(function ($) {
  
  // custom select class

  function supermenu(item, options) {

    this.item = $(item);
    
    // options
  
    var defaults = {
      open: false,
      enabled: true,
      current: null,
      debug: false,
      elements: {
        carousel: null
      },
      events: {
        slide_change: null
      }
    };
    
    this.options = $.extend(true, defaults, options);
    this.init();
  }

  supermenu.prototype = {

    // init

    init: function () {

      var plugin_instance = this;
      var plugin_item = plugin_instance.item;
      var plugin_settings = plugin_instance.options;
      var plugin_elements = plugin_settings.elements;
      
      plugin_item.addClass('supermenu-initialized');
      
      // CAROUSEL
      
      plugin_elements.carousel = plugin_item.find('[data-slick]');
      
      // destroy, set 'beforeChange' function and re-initialize
      
      console.log(plugin_elements.carousel);
      
      if (plugin_elements.carousel.hasClass('slick-initialized')) {
        plugin_elements.carousel.slick('unslick');
        console.log('unslick');
      }
      
      plugin_elements.carousel.on('beforeChange', function(event, slick, currentSlide, nextSlide) {
        plugin_elements.carousel.addClass('sliding');
        
        var next_slug = $('.supermenu-slide').eq(nextSlide).attr('data-slug');
        
        $('#header-primary .supermenu-toggle').removeClass('supermenu-active');
        $('#header-primary .supermenu-toggle[href*="' + next_slug + '"]').addClass('supermenu-active');
        
      });
      
      plugin_elements.carousel.on('afterChange', function(event, slick, currentSlide) {
        plugin_elements.carousel.removeClass('sliding');
        
        plugin_settings.current = $('.supermenu-slide').eq(currentSlide).attr('data-slug');
        
        if (typeof plugin_settings.events.slide_change == 'function') {
          plugin_settings.events.slide_change.call(this);
        }
      });
      
      plugin_elements.carousel.slick();
      
      //
      // ACTIONS
      //
      
      $('.supermenu-toggle').click(function(e) {
        e.preventDefault();
        
        if (plugin_settings.enabled == true) {
        
          var link_href = $(this).attr('href');

          var link_slug = link_href.split('/').filter(function (el) {
            return el != "";
          }).pop();
          
          //var link_slug = link_href.replace(base_href, '');
          //link_slug = link_slug.replace(new RegExp('/', 'g'), '');
          
          console.log(plugin_settings.open);
          console.log(plugin_settings.current,link_slug);
          
          if (plugin_settings.open && plugin_settings.current == link_slug) {
            
            // if the menu is open and the active link was clicked,
            // close the menu
            
            if (plugin_settings.debug == true) {
              console.log('hide supermenu');
            }
            
            plugin_instance.hide({
              href: link_href,
              slug: link_slug
            });
            
          } else {
            
            // open the menu and go to the selected slide
            
            if (plugin_settings.debug == true) {
              console.log('supermenu', link_slug);
            }
            
            plugin_instance.slide_carousel({
              href: link_href,
              slug: link_slug
            });
            
          }
        
        }
        
      }); 
      
             
      
      if (plugin_settings.debug == true) {
        console.log('supermenu', 'initialized');
      }
      
    },
    
    hide: function(fn_options) {
      
      var plugin_instance = this;
      var plugin_item = this.item;
      var plugin_settings = plugin_instance.options;
      var plugin_elements = plugin_settings.elements;
      
      // options

      var defaults = {
        href: null,
        slug: null
      };

      var settings = $.extend(true, defaults, fn_options);
      
      $('#header-primary .supermenu-toggle').removeClass('supermenu-active');
      
      //plugin_item.find('.collapse').collapse('hide');
      
      $('body').removeClass('supermenu-open');
      
      plugin_settings.open = false;
  	  
    },
    
    show: function(fn_options) {
      
      var plugin_instance = this;
      var plugin_item = this.item;
      var plugin_settings = plugin_instance.options;
      var plugin_elements = plugin_settings.elements;
      
      // options

      var defaults = {
        href: null,
        slug: null
      };

      var settings = $.extend(true, defaults, fn_options);
      
      console.log('supermenu', 'show');
      
      //plugin_item.find('.collapse').collapse('show');
      
      $('body').addClass('supermenu-open');
      
      plugin_settings.open = true;
  	  
    },
    
    slide_carousel: function(fn_options) {
      
      var plugin_instance = this;
      var plugin_item = this.item;
      var plugin_settings = plugin_instance.options;
      var plugin_elements = plugin_settings.elements;
      
      // options

      var defaults = {
        href: null,
        slug: null
      };

      var settings = $.extend(true, defaults, fn_options);
      
      console.log('slide')
      
      //plugin_item.find('.collapse').collapse('show');
      
      plugin_instance.show();
      
      if (plugin_settings.debug == true) {
        console.log('supermenu', 'slide #' + plugin_instance._get_slide_index(settings.slug));
      }
      
      if (typeof plugin_instance._get_slide_index(settings.slug) != 'undefined') {
        plugin_elements.carousel.slick('slickGoTo', plugin_instance._get_slide_index(settings.slug));
      }
      
      plugin_settings.current = settings.slug;
      
    },
    
    disable: function(fn_options) {
      
      var plugin_instance = this;
      var plugin_item = this.item;
      var plugin_settings = plugin_instance.options;
      var plugin_elements = plugin_settings.elements;
      
      // options

      var defaults = {
        href: null,
        slug: null
      };

      var settings = $.extend(true, defaults, fn_options);
      
      $('body').addClass('supermenu-disabled');
      
      plugin_settings.enabled = false;
      
    },
    
    enable: function(fn_options) {
      
      var plugin_instance = this;
      var plugin_item = this.item;
      var plugin_settings = plugin_instance.options;
      var plugin_elements = plugin_settings.elements;
      
      // options

      var defaults = {
        href: null,
        slug: null
      };

      var settings = $.extend(true, defaults, fn_options);
      
      $('body').removeClass('supermenu-disabled');
      
      plugin_settings.enabled = true;
      
    },
    
    _get_slide_index: function(link_href) {
      
      var plugin_instance = this;
      var plugin_item = this.item;
      var plugin_settings = plugin_instance.options;
      
      return plugin_item.find('[data-slug="' + link_href + '"]').index('.supermenu-slide');
      
    },
    
    _get_toggle_index: function(slide) {
      
      var plugin_instance = this;
      var plugin_item = this.item;
      var plugin_settings = plugin_instance.options;
      
      console.log(slide);
      
    }
    
  }

  // jQuery plugin interface

  $.fn.supermenu = function (opt) {
    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {

      var item = $(this);
      var instance = item.data('supermenu');

      if (!instance) {

        // create plugin instance if not created
        item.data('supermenu', new supermenu(this, opt));

      } else {

        // otherwise check arguments for method call
        if (typeof opt === 'string') {
          instance[opt].apply(instance, args);
        }

      }
    });
  }

}(jQuery));