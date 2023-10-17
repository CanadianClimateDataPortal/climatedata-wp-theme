// tab drawer plugin

;(function ($) {
  function tab_drawer(item, options) {
    // options

    var defaults = {
      globals: ajax_data.globals,
      lang: ajax_data.globals.lang,
      history: true,
      elements: {
        tabs: null,
        container: null,
      },
      map: {
        object: null,
      },
      debug: true,
    }

    this.options = $.extend(true, defaults, options)

    this.item = $(item)
    this.init()
  }

  tab_drawer.prototype = {
    // init

    init: function () {
      let plugin = this,
        item = plugin.item,
        options = plugin.options

      //
      // INITIALIZE
      //

      if (options.debug == true) {
        console.log('td', 'init')
      }

      // ELEMENTS

      options.elements.tabs = item.find('> .tab-drawer-tabs')
      options.elements.container = item.find('> .tab-drawer-container')

      item.addClass('tab-drawer')

      //
      // EVENTS
      //

      // select a tab

      options.elements.tabs.on('click', 'a', function (e) {
        e.preventDefault()
        
        plugin.select_content($(this).attr('href'), true)
      })

      // open a layered drawer

      options.elements.container.on( 'click', '.tab-drawer-trigger', function (e) {
        e.preventDefault()

        let this_drawer = $(this).closest('.tab-drawer'),
          target_id = $(this).attr('#'),
          target_content = this_drawer.find(target_id)

        plugin.select_content($(this).attr('href'), false)
      })

      // close content

      $('body').on('click', '.tab-drawer-close', function () {
        plugin.close_content($(this).closest('.tab-drawer'), true)
      })
      
      // HISTORY
      
      if (options.history == true) {
        
        window.addEventListener('popstate', (e) => {
          plugin.handle_pop(e)
        })
        
      }
      
    },

    select_content: function (tab_id, do_history) {
      let plugin = this,
        item = plugin.item,
        options = plugin.options

      console.log('td', 'select ', tab_id)

      if (tab_id.charAt(0) != '#') {
        tab_id = '#' + tab_id
      }

      // find the content

      let this_content = item.find(tab_id)

      if (this_content.length) {
        let this_container = this_content.closest('.tab-drawer-container')

        // console.log('container', this_container)

        if (this_content.hasClass('selected')) {
          
          // close this content

          plugin.close_content(this_content, true)
          
        } else {
          
          // find other content at this level
          // that is open
          // but shouldn't be

          plugin.close_content(this_content.siblings('.selected'), false, function () {
            // select this content

            this_content.addClass('selected')

            // if a tab exists linking to this content
            // set it to active

            options.elements.tabs
              .find('a[href="' + tab_id + '"]')
              .addClass('active')

            $('body').addClass('tab-drawer-open')
            options.status = 'open'
            
            if (do_history == true && options.history == true) {
              history.pushState({}, '', window.location.origin + window.location.pathname + tab_id)
            }
            
          })
          
        }
      }
    },

    close_content: function (selected_content, do_history, fn_callback) {
      
      let plugin = this,
        item = plugin.item,
        options = plugin.options

      console.log('td', 'close content', selected_content)

      // find all child content

      let content_to_close = []

      selected_content.find('.tab-drawer.selected').each(function () {
        content_to_close.push($(this))
      })

      if (content_to_close.length > 1) {
        // reverse the order of the elements
        content_to_close.reverse()
      }

      // add the given content to the end of the array
      content_to_close.push(selected_content)

      // set interval to close each drawer

      const close_and_shift = async () => {
        content_to_close[0].removeClass('selected')

        options.elements.tabs
          .find('a[href="#' + content_to_close[0].attr('id') + '"]')
          .removeClass('active')

        let first = content_to_close.shift()

        return content_to_close.length == 0
      }

      const process_interval = async (callback, ms, tries_until_error = 10) => {
        return new Promise((resolve, reject) => {
          const interval = setInterval(async () => {
            if (await callback()) {
              resolve()
              clearInterval(interval)
            } else if (tries_until_error <= 1) {
              reject()
              clearInterval(interval)
            }

            tries_until_error--
          }, ms)
        })
      }

      const process_close_queue = async () => {
        try {
          await process_interval(close_and_shift, 200)
        } catch (e) {
          console.log('error')
        }

        if (typeof fn_callback == 'function') {
          console.log('callback')
          fn_callback()
        }

        // if no content is selected,
        // set status to 'closed'

        if (!item.find('.selected').length) {
          options.status = 'closed'
          $('body').removeClass('tab-drawer-open')
        }

        if (do_history == true && options.history == true) {
          history.pushState({}, '', window.location.origin + window.location.pathname)
        }

        console.log('done')
      }

      process_close_queue()
      
    },
    
    handle_pop: function(e) {
      
      let plugin = this,
        item = plugin.item,
        options = plugin.options
      
      console.log('pop', e)
    
      if (
        window.location.hash != '' &&
        $('body').find(window.location.hash).length && 
        $('body').find(window.location.hash).hasClass('tab-drawer')
      ) {
        plugin.select_content(window.location.hash, false)
      } else if (item.find('.selected').length) {
        plugin.close_content(item.find('.selected'), false)
      }
      
    },
    
  }

  // jQuery plugin interface

  $.fn.tab_drawer = function (opt) {
    var args = Array.prototype.slice.call(arguments, 1)

    return this.each(function () {
      var item = $(this)
      var instance = item.data('tab_drawer')

      if (!instance) {
        // create plugin instance if not created
        item.data('tab_drawer', new tab_drawer(this, opt))
      } else {
        // otherwise check arguments for method call
        if (typeof opt === 'string') {
          instance[opt].apply(instance, args)
        }
      }
    })
  }
})(jQuery)
