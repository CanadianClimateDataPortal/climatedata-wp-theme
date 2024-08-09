 // share widget
// v1.1.2

(function ($) {

  // custom select class

  function follow_widget(item, options) {
    
    // options
  
    var defaults = {
      site_url: '//' + window.location.hostname,
      theme_dir: null,
      share_url: window.location.href,
      title: document.title,
      
      elements: {
        facebook: {
          url: null,
          label: 'Facebook',
          icon: 'icon-facebook'
        },
        twitter: {
          url: null,
          label: 'Twitter',
          icon: 'icon-twitter',
          text: null
        },
        instagram: {
          url: null,
          label: 'Instagram',
          icon: 'icon-instagram',
          text: null
        },
        linkedin: {
          url: null,
          label: 'LinkedIn',
          icon: 'icon-linkedin',
          text: null
        },
        youtube: {
          url: null,
          label: 'YouTube',
          icon: 'icon-youtube',
          text: null
        },
        pinterest: {
          url: null,
          label: 'Pinterest',
          icon: 'icon-pinterest'
        }
      },
      callback: null
    };
    
    this.options = $.extend(true, defaults, options);

    this.item = $(item);
    this.init();
  }

  follow_widget.prototype = {

    // init

    init: function () {
      
      var plugin_settings = this.options;
      var plugin_item = this.item;
      
      //console.log('share');
      
      // build buttons
      
      plugin_item.addClass('social-trigger follow-trigger').wrap('<div class="social-widget-wrap follow-widget-wrap"/>');
      
      var button_list = '<ul class="social-widget follow-widget">';
      
      if (plugin_settings.elements.twitter.url !== null) {
        button_list += '<li><a href="' + plugin_settings.elements.twitter.url + '" class="follow-link follow-twitter"><i class="icon ' + plugin_settings.elements.twitter.icon + '"></i><span class="label">' + plugin_settings.elements.twitter.label + '</span></a></li>';
      }
      
      if (plugin_settings.elements.facebook.url !== null) {
        button_list += '<li><a href="' + plugin_settings.elements.facebook.url + '" class="follow-link follow-twitter"><i class="icon ' + plugin_settings.elements.facebook.icon + '"></i><span class="label">' + plugin_settings.elements.facebook.label + '</span></a></li>';
      }
      
      $(button_list).insertAfter(plugin_item);
      
      // CLICK EVENTS
      
      // trigger

      plugin_item.click(function(e) {
        e.preventDefault();
    	  e.stopImmediatePropagation();

        if ($(this).hasClass('open')) {
          $(this).removeClass('open');//.siblings('ul').slideUp(125);
          $(this).parents('.follow-widget-wrap').removeClass('open');
        } else {
          
          // close all other widgets
          $('.social-widget-wrap').removeClass('open');//.siblings('ul').slideUp(125);
          $('.social-trigger').removeClass('open');
          
          // open this one
          $(this).addClass('open');//.siblings('ul').slideDown(250);
          $(this).parents('.follow-widget-wrap').addClass('open');
        }
      });
      
    }
    
  }

  // jQuery plugin interface

  $.fn.follow_widget = function (opt) {
    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {

      var item = $(this);
      var instance = item.data('follow_widget');

      if (!instance) {

        // create plugin instance if not created
        item.data('follow_widget', new follow_widget(this, opt));

      } else {

        // otherwise check arguments for method call
        if (typeof opt === 'string') {
          instance[opt].apply(instance, args);
        }

      }
    });
  }

}(jQuery));
