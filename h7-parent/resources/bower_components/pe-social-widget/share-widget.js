// share widget
// v1.1.2

(function ($) {

  // custom select class

  function share_widget(item, options) {

    // options

    var defaults = {
      site_url: '//' + window.location.hostname,
      theme_dir: null,
      share_url: window.location.href,
      title: document.title,

      elements: {
        facebook: {
          display: false,
          label: 'Facebook',
          icon: 'icon-facebook'
        },
        twitter: {
          display: false,
          label: 'Twitter',
          icon: 'icon-twitter',
          text: null,
          via: null
        },
        pinterest: {
          display: false,
          label: 'Pinterest',
          icon: 'icon-pinterest'
        },
				linkedin: {
					display: false,
					label: 'LinkedIn',
					icon: 'icon-linkedin'
				},
        permalink: {
          display: false,
          label: 'Copy Permalink',
          icon: 'icon-permalink'
        }
      },
      callback: null
    };

    this.options = $.extend(true, defaults, options);

    this.item = $(item);
    this.init();
  }

  share_widget.prototype = {

    // init

    init: function () {

      var plugin_settings = this.options;
      var plugin_item = this.item;

      //console.log('share');

      // URL hash

      var share_url = plugin_settings.share_url;

      if (share_url.indexOf("#") > -1) {
        var path = share_url.split("#")[0];
        var hash = share_url.split("#")[1];

        path = path.replace(plugin_settings.site_url, '');

        //share_url = site_url + '/share/?path=' + window.location.pathname + '&hash=' + hash;
      }

      // tweet text

      if (plugin_settings.elements.twitter.text == null) {
        var window_title = document.title;

        if (window_title.indexOf(" — ") > -1) {
          window_title = window_title.split(' — ')[0] + ' via ' + plugin_settings.elements.twitter.via;
        }

        plugin_settings.elements.twitter.text =  window_title + ': ' + encodeURIComponent(share_url);
      } else {
        plugin_settings.elements.twitter.text = encodeURIComponent(plugin_settings.elements.twitter.text) + encodeURIComponent(share_url) + ' ';
      }

      // build buttons

      plugin_item.addClass('social-trigger share-trigger').wrap('<div class="social-widget-wrap share-widget-wrap"/>');

      var button_list = '<ul class="social-widget share-widget">';

      if (plugin_settings.elements.twitter.display == true) {
        button_list += '<li><a href="https://twitter.com/intent/tweet?text=' + plugin_settings.elements.twitter.text + '" class="share-link share-twitter"><i class="icon ' + plugin_settings.elements.twitter.icon + '"></i><span class="label">' + plugin_settings.elements.twitter.label + '</span></a></li>';
      }

      if (plugin_settings.elements.facebook.display == true) {
        button_list += '<li><a href="#" class="share-link share-facebook" data-href="' + share_url + '"><i class="icon ' + plugin_settings.elements.facebook.icon + '"></i><span class="label">' + plugin_settings.elements.facebook.label +'</span></a></li>';
      }

      if (plugin_settings.elements.pinterest.display == true) {
        button_list += '<li><a href="http://pinterest.com/pin/create/button/?url=' + share_url + '&description=' + plugin_settings.title + '" class="share-link share-pinterest"><i class="icon ' + plugin_settings.elements.pinterest.icon + '"></i><span class="label">' + plugin_settings.elements.pinterest.label + '</span></a></li>';
      }

      if (plugin_settings.elements.permalink.display == true) {
        button_list += '<li class="share-permalink-wrap"><a href="#" class="share-link share-permalink"><i class="icon ' + plugin_settings.elements.permalink.icon + '"></i><span class="label">' + plugin_settings.elements.permalink.label + '</span></a><div class="share-permalink-input"><input type="text" value="' + share_url +'"></div></li>';
      }

			if (plugin_settings.elements.linkedin.display == true) {

				button_list += '<li><a href="http://www.linkedin.com/shareArticle?mini=true&url=' + encodeURIComponent(plugin_settings.share_url) + '" class="share-link share-linkedin"><i class="icon ' + plugin_settings.elements.linkedin.icon + '"></i><span class="label">' + plugin_settings.elements.linkedin.label + '</span></a></li>';

			}

      $(button_list).insertAfter(plugin_item);

      // CLICK EVENTS

      // trigger

      plugin_item.click(function(e) {
        e.preventDefault();
    	  e.stopImmediatePropagation();

        if ($(this).hasClass('open')) {
          $(this).removeClass('open');//.siblings('ul').slideUp(125);
          $(this).parents('.share-widget-wrap').removeClass('open');

          $('.share-permalink-wrap').removeClass('open');
          $('.share-permalink-input').slideUp(125);
        } else {

          // close all other widgets
          $('.social-widget-wrap').removeClass('open');//.siblings('ul').slideUp(125);
          $('.social-trigger').removeClass('open');
          $('.share-permalink-wrap').removeClass('open');
          $('.share-permalink-input').slideUp(125);

          // open this one
          $(this).addClass('open');//.siblings('ul').slideDown(250);
          $(this).parents('.share-widget-wrap').addClass('open');
        }
      });

      // share link

      $('.share-link').click(function(e) {
    	  e.preventDefault();
    	  e.stopImmediatePropagation();

        // facebook

    	  if ($(this).hasClass('share-facebook')) {

      	  var share_URL = $(this).attr('data-href');

          FB.ui({
            method: 'share',
            href: plugin_settings.share_url
          }, function(response) {
            // nothing
          });

    	  } else if ($(this).hasClass('share-permalink')) {

      	  var permalink_wrap = $(this).parents('.share-permalink-wrap');
      	  var permalink_input = plugin_item.siblings('ul').find('.share-permalink-input');

      	  if (permalink_wrap.hasClass('open')) {
        	  permalink_wrap.removeClass('open');
        	  permalink_input.slideUp(250);
      	  } else {
        	  permalink_wrap.addClass('open');
        	  permalink_input.slideDown().find('input').focus().select();
      	  }

        } else {

      	  var width  = 575,
              height = 320,
              left   = ($(window).width()  - width)  / 2,
              top    = ($(window).height() - height) / 2,
              url    = this.href,
              opts   = 'status=0' +
                       ',width='  + width  +
                       ',height=' + height +
                       ',top='    + top    +
                       ',left='   + left;

          window.open(url, 'sharepopup', opts);

    	  }
  	  });

    }

  }

  // jQuery plugin interface

  $.fn.share_widget = function (opt) {
    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {

      var item = $(this);
      var instance = item.data('share_widget');

      if (!instance) {

        // create plugin instance if not created
        item.data('share_widget', new share_widget(this, opt));

      } else {

        // otherwise check arguments for method call
        if (typeof opt === 'string') {
          instance[opt].apply(instance, args);
        }

      }
    });
  }

}(jQuery));
