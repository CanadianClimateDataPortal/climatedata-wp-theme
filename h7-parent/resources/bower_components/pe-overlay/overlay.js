// overlay
// v1.0

(function ($) {
  
  // custom select class

  function overlay(item, options) {

    this.item = $(item);
    
    // options
  
    var defaults = {
      open: false,
      current: null,
      position: 'top',
      opacity: 0.6,
      restore_supermenu: false,
      debug: false,
      elements: {
      }
    };
    
    this.options = $.extend(true, defaults, options);
    this.init();
  }

  overlay.prototype = {

    // init

    init: function () {

      var plugin_instance = this;
      var plugin_item = plugin_instance.item;
      var plugin_settings = plugin_instance.options;
      var plugin_elements = plugin_settings.elements;

      if (plugin_settings.debug == true) {
        console.log('overlay');
      }
      
      //
      // ELEMENTS
      //
      
      plugin_item.addClass('overlay-initialized');
      
      plugin_elements.overlay = plugin_item.find('.overlay-content-wrap');
      
      //plugin_elements.position = $('<div id="overlay" class="overlay-position"></div>').appendTo('body');
      plugin_elements.wrap = $('<div class="overlay-wrap container-fluid"></div>').appendTo('body');
      //plugin_elements.container = $('<div class="overlay row" data-position="' + plugin_settings.position + '"></div>');
      
      //
      // ACTIONS
      //
      
      $('.overlay-toggle').click(function(e) {
        e.preventDefault();
        
        var show_overlay = true;
        
        var link_href = $(this).attr('href');
        var overlay_content = $(this).attr('data-overlay-content');
        
        // if the clicked link is already open
        
        if (plugin_settings.open == true && plugin_settings.current.href == link_href && plugin_settings.current.content == overlay_content) {
          show_overlay = false;
        }
        
        if (show_overlay == true) {
          
          var overlay_position = 'top';
          
          if (typeof $(this).attr('data-overlay-position') !== 'undefined') {
            overlay_position = $(this).attr('data-overlay-position');
          }
          
          if (typeof $(this).attr('data-overlay-opacity') !== 'undefined') {
            plugin_settings.opacity = $(this).attr('data-overlay-opacity');
          } else {
            plugin_settings.opacity = 0.6;
          }
          
          if (plugin_settings.debug == true) {
            console.log('overlay', link_href, overlay_content);
          }
          
          plugin_instance.show({
            href: link_href,
            content: overlay_content,
            position: overlay_position
          });
          
        }
        
      });
      
      // close
      
      $('body').on('click', '.overlay-close', function(e) {
        
        plugin_instance.hide();
        
      });
      
      // 'esc' key
      
      $('body').keypress(function(e) {
        if ($('body').hasClass('overlay-open') && e.which == 27){
          plugin_instance.hide();
        }
      });
      
      if (plugin_settings.debug == true) {
        console.log('overlay initialized');
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
        slug: null,
        timeout: 0,
        complete: null
      };
      
      var settings = $.extend(true, defaults, fn_options);
      
      if (plugin_settings.debug == true) {
        console.log('hide overlay');
      }
      
      plugin_item.find('.overlay').removeClass('current');
      
      $('body').removeClass('overlay-open').removeClass('overlay-position-right').removeClass('overlay-position-top');
      
      $('body').attr('data-overlay-content', '');
      
      setTimeout(function() {
        plugin_item.find('.overlay').remove();
        plugin_elements.wrap.find('.overlay-close').remove();
      }, 400);
      
      plugin_settings.open = false;
      plugin_settings.current = null;
      
      $('#supermenu').supermenu('enable');
      
      $(document).trigger('overlay_hide');
  	  
    },
    
    show: function(fn_options) {
      
      var plugin_instance = this;
      var plugin_item = this.item;
      var plugin_settings = plugin_instance.options;
      var plugin_elements = plugin_settings.elements;
      
      // options

      var defaults = {
        href: null,
        data: null,
        content: null,
        position: plugin_settings.position,
        callback: null
      };

      var settings = $.extend(true, defaults, fn_options);
      
      var show_timeout = 0;
      
      if (plugin_settings.open == true) {
        plugin_instance.hide();
        show_timeout = 400;
      }
      
      var ajax_data = {
        content: settings.content
      };
      
      ajax_data = $.extend(ajax_data, settings.data);
      
      plugin_elements.wrap.css('background-color', 'rgba(0,0,0,' + plugin_settings.opacity + ')');
      
      setTimeout(function() {
        
        console.log('show');
        
        if (settings.href.charAt(0) == '#') {
          
          if (plugin_settings.debug == true) {
            console.log('inline');
          }
          
        } else {
          
          $('body').addClass('spinner-on');
          
          var ajax_html = '';
          
          $.ajax({
            url: settings.href,
            data: ajax_data,
            success: function(data) {
              
              ajax_html = data;
              
              var new_container = $('<div class="overlay row" data-position="' + settings.position + '">' + data + '</div>').appendTo(plugin_elements.wrap);
              
              if (settings.position == 'right') {
                $('<div class="overlay-close bg-primary text-white"><i class="fas fa-times"></i></div>').insertBefore(new_container);
              }
              
            },
            complete: function() {
              
              var callback_data = '';
              
              if (plugin_settings.debug == true) {
                console.log($(ajax_html).find('#callback-data'));
              }
              
              if ($(ajax_html).find('#callback-data').length) {
                callback_data = JSON.parse($(ajax_html).find('#callback-data').html());
              }
              
              $('#supermenu').supermenu('disable');
              
              setTimeout(function() {
                $('body').addClass('overlay-open').removeClass('spinner-on');
                $('body').addClass('overlay-position-' + settings.position);
                $('body').attr('data-overlay-content', settings.content);
              }, 1);
              
              if (typeof(settings.callback) == 'function') {
                settings.callback(callback_data);
              }
              
            }
          });
  
        }
        
        plugin_settings.open = true;
        
        plugin_settings.current = {
          href: settings.href,
          content: settings.content
        };
        
      }, show_timeout);
  	  
    },
    
    _get_slide_index: function(link_href) {
      
      var plugin_instance = this;
      var plugin_item = this.item;
      var plugin_settings = plugin_instance.options;
      
      return plugin_item.find('[data-slug="' + link_href + '"]').index('.overlay-slide');
      
    },
    
    _set_position: function(new_position) {
      
      var plugin_instance = this;
      var plugin_item = this.item;
      var plugin_settings = plugin_instance.options;
      var plugin_elements = plugin_settings.elements;
      
      if (plugin_settings.debug == true) {
        console.log('set position to ' + new_position);
      }
      
      plugin_settings.position = new_position;
      //plugin_elements.position.attr('data-position', new_position);
      
    }
    
  }

  // jQuery plugin interface

  $.fn.overlay = function (opt) {
    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {

      var item = $(this);
      var instance = item.data('overlay');

      if (!instance) {

        // create plugin instance if not created
        item.data('overlay', new overlay(this, opt));

      } else {

        // otherwise check arguments for method call
        if (typeof opt === 'string') {
          instance[opt].apply(instance, args);
        }

      }
    });
  }

}(jQuery));