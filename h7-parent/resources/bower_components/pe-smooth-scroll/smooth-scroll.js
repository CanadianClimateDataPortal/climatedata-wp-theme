// smooth scroll
// v1.1

(function ($) {
    
  $.fn.smooth_scroll = function(options) {
  
    // options
  
    var defaults = {
      viewport: $('html, body'),
      id: this.attr('href'),
      ease: 'swing',
      offset: 0,
      speed: 500,
      cancel: true,
      callback: null,
      logging: false
    };
    
    var settings = $.extend(true, defaults, options);
      
    if ($(settings.id).length) {
    
      // viewport's position in the window
      var viewport_position = settings.viewport.offset().top;
      
      // viewport's scroll position
      var viewport_scrolltop = settings.viewport.scrollTop();
      
      if (typeof settings.viewport == 'object') {
        var viewport_object = settings.viewport[settings.viewport.length - 1];
        viewport_scrolltop = $(viewport_object).scrollTop();
      }
      
      // element's position in the window
      var element_position = $(settings.id).offset().top;
      
      // current scroll position PLUS the element's position (offset by the viewport's position)
      //var destination = (viewport_scrolltop + (element_position - viewport_position)) - settings.offset;
      var destination = element_position - settings.offset;

      if (settings.logging == true) {
        console.log('id', settings.id);
        console.log('viewport’s position in the window', viewport_position);
        console.log('viewport’s current scroll position', viewport_scrolltop);
        console.log('target element’s position', element_position);
        console.log('final scroll position', destination);
        
        console.log('scroll ' + settings.viewport.attr('id') + ' to ' + destination + ' so that ' + settings.id + ' is in view');
      }
      
      if (settings.cancel === true) {
        settings.viewport.on("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove", function(){
          settings.viewport.stop();
        });
      }
    
      settings.viewport.animate({
        scrollTop: destination
      }, {
        duration: settings.speed, 
        easing: settings.ease,
        complete: function() {
          settings.viewport.off("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove");
        }
      }).promise().then(function() {
        
        if (typeof(settings.callback) == 'function') {
          settings.callback.call(this)
        }
        
      });
      
      
      
    } else {
      
      if (settings.logging == true) {
        console.log(settings.id + ' does not exist');
      }
      
    }
    
  }
  
}(jQuery));