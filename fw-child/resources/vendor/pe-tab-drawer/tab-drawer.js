// tab drawer plugin

(function ($) {
  function tab_drawer(item, options) {
    // options

    var defaults = {
      globals: ajax_data.globals,
      lang: ajax_data.globals.lang,
      elements: {
        tabs: null,
        container: null,
      },
      map: {
        object: null,
      },
      status: 'init',
      drawer_state: 'closed',
      debug: true,
    };

    this.options = $.extend(true, defaults, options);

    this.item = $(item);
    this.init();
  }

  tab_drawer.prototype = {
    // init

    init: function () {
      let plugin = this,
        item = plugin.item,
        options = plugin.options;

      //
      // INITIALIZE
      //

      if (options.debug == true) {
        console.log('td', 'init');
      }

      // ELEMENTS

      options.elements.tabs = item.find('> .tab-drawer-tabs');
      options.elements.container = item.find('> .tab-drawer-container');

      item.addClass('tab-drawer');

      options.status = 'ready';

      //
      // EVENTS
      //

      // select a tab

      options.elements.tabs.on('click', 'a', function () {
        options.status = 'selecting';

        if (options.drawer_state == 'closed') {
          console.log('td', 'open and select');

          // open the drawer
          plugin.open_drawer();

          // select the tab
          plugin.select_content($(this).attr('href'));

          // set the link to active
          $(this).addClass('active');
        } else {
          // the drawer is already open

          if ($(this).hasClass('active')) {
            // the clicked tab is active
            console.log('td', 'close drawer');
            plugin.close_drawer();
          } else {
            // the tab is not active
            console.log('td', 'select tab');
            plugin.select_content($(this).attr('href'));

            if ($(this).closest('.tab-drawer-tabs').length) {
              // this link is a tab
              $(this).siblings().removeClass('active');
              $(this).addClass('active');
            }
          }
        }

        options.status = 'ready';
      });

      // open a layered drawer

      options.elements.container.on(
        'click',
        '.tab-drawer-trigger',
        function (e) {
          e.preventDefault();

          options.status = 'selecting';

          let this_drawer = $(this).closest('.tab-drawer-content'),
            target_id = $(this).attr('#'),
            target_content = this_drawer.find(target_id);

          plugin.select_content($(this).attr('href'));

          options.status = 'ready';
        },
      );

      // close content

      $('body').on('click', '.tab-drawer-close', function () {
        options.status = 'closing';
        plugin.close_content($(this).closest('.tab-drawer-content'));
        options.status = 'ready';
      });
    },

    open_drawer: function (fn_options) {
      let plugin = this,
        item = plugin.item,
        options = plugin.options;

      let fn_settings = $.extend(true, {}, fn_options);

      options.elements.container.addClass('open');
      options.drawer_state = 'open';
    },

    close_drawer: function (fn_options) {
      let plugin = this,
        item = plugin.item,
        options = plugin.options;

      let fn_settings = $.extend(true, {}, fn_options);

      options.elements.container.removeClass('open');

      options.elements.tabs.find('a').removeClass('active');

      options.drawer_state = 'closed';
    },

    select_content: function (tab_id) {
      let plugin = this,
        item = plugin.item,
        options = plugin.options;

      console.log('td', 'select ', tab_id);

      if (tab_id.charAt(0) != '#') {
        tab_id = '#' + tab_id;
      }

      // find the content

      let this_content = item.find(tab_id);

      if (this_content.length) {
        // is any other content open
        // at the same level as this one

        let open_content = this_content.parent().find('> .selected');

        if (open_content.length) {
          plugin.close_content(open_content);
        }

        // open this one
        this_content.addClass('selected');
      }
    },

    close_content: function (selected_content) {
      let plugin = this,
        item = plugin.item,
        options = plugin.options;

      console.log('td', 'close content', selected_content);

      // remove selected class
      selected_content.removeClass('selected');

      // children too
      selected_content
        .find('.tab-drawer-content.selected')
        .removeClass('selected');

      if (
        options.status == 'closing' &&
        selected_content.parent().hasClass('tab-drawer-container')
      ) {
        plugin.close_drawer();
      }
    },
  };

  // jQuery plugin interface

  $.fn.tab_drawer = function (opt) {
    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {
      var item = $(this);
      var instance = item.data('tab_drawer');

      if (!instance) {
        // create plugin instance if not created
        item.data('tab_drawer', new tab_drawer(this, opt));
      } else {
        // otherwise check arguments for method call
        if (typeof opt === 'string') {
          instance[opt].apply(instance, args);
        }
      }
    });
  };
})(jQuery);
