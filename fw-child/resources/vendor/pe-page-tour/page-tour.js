// page tour
// v1.1

(function ($) {
  
  // custom select class

  function page_tour(item, options) {

    this.item = $(item);
    
    // options
  
    var defaults = {
      default_open: true,
      open: false,
      current: 1,
      tour_id: null,
      labels: {
        start_over: 'Start Over',
        next: 'Next',
    	  close: 'Close',
    	  dont_show: 'Don’t show again'
      },
      elements: {
        bubble: $('.page-tour-bubble')
      },
      debug: false
    };
    
    this.options = $.extend(true, defaults, options);
    this.init();
  }

  page_tour.prototype = {

    // init

    init: function () {

      var plugin_instance = this;
      var plugin_item = plugin_instance.item;
      var plugin_settings = plugin_instance.options;
      var plugin_elements = plugin_settings.elements;
      
      if (plugin_settings.debug == true) {
        console.log('page tour init', plugin_item);
      }
      
      //
      // DEFAULT
      //
      
      if (plugin_settings.debug == true) {
        console.log('tour cookie: ' + Cookies.get('cdc-tour'));
      }
      
      if (Cookies.get('cdc-tour') == 'no') {
        
        // cookie is set to 'no'
        
        plugin_settings.default_open = false;
        
      } else {
        
        // set to 'yes' or not set at all
        
        // set it to 'yes'
        
        
      }
      
      plugin_settings.tour_id = plugin_item.attr('id')
      
      //
      // ELEMENTS
      //
      
      $('body').addClass('page-tour-initialized');
      
      // content
      
      plugin_elements.content = $('<div class="page-tour-content">').appendTo(plugin_item);
      
      // footer
      
      plugin_elements.footer = $('<footer class="page-tour-footer">').appendTo(plugin_item);
      
      // close
      
      plugin_elements.close_wrap = $('<div class="page-tour-close-wrap">').appendTo(plugin_elements.footer);
      plugin_elements.close_btn = $('<span class="page-tour-close btn btn-sm btn-outline-secondary rounded-pill mr-3">' + plugin_settings.labels.close + '</span>').appendTo(plugin_elements.close_wrap);
      plugin_elements.dont_show = $('<label class="page-tour-dontshow" for="page-tour-dontshow"><input type="checkbox" id="page-tour-dontshow" name="page-tour-dontshow"> ' + plugin_settings.labels.dont_show + '</label>').appendTo(plugin_elements.close_wrap);
      
      // dots
      
      plugin_elements.dots = $('<div class="page-tour-dots">').appendTo(plugin_elements.footer);
      
      //
      // TOUR STEPS
      //
      
      plugin_settings.steps = JSON.parse(plugin_item.attr('data-steps'));
      
      for (i = 0; i < plugin_settings.steps.length; i += 1) {
        
        $('<span class="page-tour-dot" data-step="' + (i + 1) + '">').appendTo(plugin_elements.dots);
        
      }
      
      plugin_elements.dots.find('.page-tour-dot').first().addClass('current-step');
      
      plugin_elements.next = $('<span class="page-tour-next btn btn-sm btn-outline-primary rounded-pill">' + plugin_settings.labels.next + ' <i class="fas fa-caret-right"></i></span>').appendTo(plugin_elements.footer);
      
      //
      
      if (plugin_settings.default_open == true) {
        plugin_instance.show_tour();
      } else {
        plugin_instance.hide_tour();
      }
      
      //
      // BEHAVIOURS
      //
      
      plugin_elements.next.click(function(e) {
        
        if (plugin_settings.debug == true) {
          console.log('next btn clicked');
        }
        
        var new_step_num = plugin_settings.current + 1;
        
        if (plugin_settings.current == plugin_settings.steps.length) {
          
          if (plugin_settings.debug == true) {
            console.log('on last step');
          }
          
          new_step_num = 1;
        }
        
        plugin_instance.step({ step: new_step_num });
      });
      
      plugin_elements.close_btn.click(function(e) {
        plugin_instance.hide_tour();
      });
      
      // TRIGGER
      
      $('body').on('click', '.page-tour-trigger', function(e) {
        e.preventDefault();
        
        if (plugin_settings.debug == true) {
          console.log('show tour btn clicked');
          console.log($(this).attr('data-tour'), plugin_item.attr('id'))
        }
        
        
        if (
          typeof $(this).attr('data-tour') != 'undefined' && 
          $(this).attr('data-tour') == plugin_item.attr('id')
        ) {
          
          console.log('tour', plugin_item.attr('id'))
          plugin_instance.show_tour()
          
        }
        
      });
      
      // ESC TO CLOSE
      
      $('body').on('keypress', function(e) {
        
        if (e.which == 27 && $('body').hasClass('page-tour-open')) {
          $('body').find('.page-tour-close').trigger('click')
        }
        
      })
        
    },
    
    show_tour: function(fn_options) {
      
      var plugin_instance = this;
      var plugin_item = this.item;
      var plugin_settings = plugin_instance.options;
      var plugin_elements = plugin_settings.elements;
      
      // options

      var defaults = {
      };
      
      var settings = $.extend(true, defaults, fn_options);
      
      if (plugin_settings.debug == true) {
        console.log('show tour');
      }
      
      // add body class
      
      $('body').addClass('page-tour-open');
      
      // set content
      
      //plugin_elements.content.html(plugin_settings.steps[0]['text']);
      
      // set position
      
      plugin_item.show().css('opacity', 0).position({
        my: plugin_settings.steps[0]['position']['my'],
        at: plugin_settings.steps[0]['position']['at'],
        of: plugin_settings.steps[0]['position']['of']
      }).animate({ opacity: 1 }, 250);
      
      // reset to step 1
      
      plugin_instance.step({ step: 1 });
      
      // set bubble
      
      plugin_item.attr('data-bubble', plugin_settings.steps[0]['position']['bubble']);
      
      // set cookie
      
      Cookies.set('cdc-tour', 'yes', { expires: 30 });
      
      if (plugin_settings.debug == true) {
        console.log('just set the cookie to yes');
      }
        	  
    },
    
    hide_tour: function(fn_options) {
      
      var plugin_instance = this;
      var plugin_item = this.item;
      var plugin_settings = plugin_instance.options;
      var plugin_elements = plugin_settings.elements;
      
      // options

      var defaults = {
      };
      
      var settings = $.extend(true, defaults, fn_options);
      
      // reset current step
      
      plugin_settings.current = 1;
      
      // remove class
      
      $('body').removeClass('page-tour-open');
      
      // hide popup
      
      plugin_item.animate({
        opacity: 0
      }, {
        duration: 250,
        complete: function() {
          plugin_item.css('top', '-9999px').css('left', '-9999px');
        }
      }).hide();
      
      // if 'don't show again' is checked
      
      if (plugin_elements.dont_show.find('input').prop('checked') == true) {
        
        // set cookie
        Cookies.set('cdc-tour', 'no', { expires: 30 });
        
        if (plugin_settings.debug == true) {
          console.log('just set the cookie to no');
        }
        
        // uncheck in case the tour gets opened again
        plugin_elements.dont_show.find('input').prop('checked', false);
        
      }
      
    },
    
    step: function(fn_options) {
      
      var plugin_instance = this;
      var plugin_item = this.item;
      var plugin_settings = plugin_instance.options;
      var plugin_elements = plugin_settings.elements;
      
      // options

      var defaults = {
        step: 1
      };
      
      var settings = $.extend(true, defaults, fn_options);
      
      // update current step
      
      plugin_settings.current = settings.step;
      
      // UPDATE DOTS
      
      plugin_elements.dots.find('.page-tour-dot').removeClass('current-step');
      plugin_elements.dots.find('.page-tour-dot[data-step="' + settings.step + '"]').addClass('current-step');
          
      var new_step_data = plugin_settings.steps[settings.step - 1]; // -1 for array index
      
      // UPDATE CONTENT & POSITION
      
      plugin_elements.content.animate({
        opacity: 0.1
      }, {
        duration: 100,
        complete: function() {
          
          plugin_item.attr('data-bubble', new_step_data.position.bubble);
          
          $(this).html(new_step_data.text).animate({
            opacity: 1
          }, 250);
          
          plugin_item.position({
            my: new_step_data.position.my,
            at: new_step_data.position.at,
            of: new_step_data.position.of,
            using: function(css, calc) {
              $(this).animate(css, 500, 'swing');
            }
          });
          
        }
      });
      
      if (plugin_settings.debug == true) {
        if (plugin_settings.debug == true) {
          console.log('new step: ' + plugin_settings.current);
        }
      }
      
      // if it's now on the last step
      
      if (plugin_settings.current == plugin_settings.steps.length) {
        
        if (plugin_settings.debug == true) {
          console.log('now on the last step');
        }
        
        plugin_elements.next.html(plugin_settings.labels.start_over + ' <i class="fas fa-undo"></i>');
        
      } else {
        
        plugin_elements.next.html(plugin_settings.labels.next + ' <i class="fas fa-caret-right"></i>');
        
      }
      
    },
    
    destroy: function() {
      this.item.removeData()
      this.item.empty()
    }
    
  }

  // jQuery plugin interface

  $.fn.page_tour = function (opt) {
    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {

      var item = $(this);
      var instance = item.data('page_tour');

      if (!instance) {

        // create plugin instance if not created
        item.data('page_tour', new page_tour(this, opt));

      } else {

        // otherwise check arguments for method call
        if (typeof opt === 'string') {
          instance[opt].apply(instance, args);
        }

      }
    });
  }

}(jQuery));