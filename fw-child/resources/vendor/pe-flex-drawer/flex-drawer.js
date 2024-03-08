// flex drawer plugin

if (typeof pushes_since_input == 'undefined') var pushes_since_input = 0

;(function ($) {
	function flex_drawer(item, options) {
		// options

		var defaults = {
			globals: ajax_data.globals,
			lang: 'en',
			item_selector: '.flex-drawer-item',
			trigger_selector: '.flex-drawer-trigger',
			content_selector: '.flex-drawer-content',
			selected: {
				item: null,
				id: null,
				order: null
			},
			debug: false,
		}
		
		this.options = $.extend(true, defaults, options)

		this.item = $(item)
		this.init()
	}

	flex_drawer.prototype = {
		// init

		init: function () {
			let plugin = this,
				item = plugin.item,
				options = plugin.options
			
			options.lang = options.globals.current_lang_code

			//
			// INITIALIZE
			//

			if (options.debug == true) {
				console.log('td', 'init')
			}
			
			plugin.init_items()
			
		},
		
		init_items: function() {
			let plugin = this,
					item = plugin.item,
					options = plugin.options
			
			item.find(options.item_selector).each(function (i) {
				$(this).css('order', (i + 1) * 10)
				$(this).attr('data-fd-item', Math.floor(Math.random() * (9999999 - 1000000) + 1000000))
			})
			
			item.off('click', options.trigger_selector)
			
			item.on('click', options.trigger_selector, function(e) {
				e.preventDefault()
				e.stopPropagation()
				
				plugin.open_drawer($(this).closest(options.item_selector).attr('data-fd-item'))
				
			})
		},
		
		open_drawer: function(item_id) {
			let plugin = this,
					item = plugin.item,
					options = plugin.options
			
			let drawer_order = null
			
			let this_item = item.find(options.item_selector + '[data-fd-item="' + item_id + '"]'),
					this_order = parseInt(this_item.css('order')),
					this_drawer
			
			if (this_item.hasClass('fd-open')) {
				
				if (plugin.debug == true) console.log(item_id + ' is open, close it now')
				
				// already open, so close it
				plugin.close_drawer(item_id)
					
			} else {
				
				// close all drawers
				
				plugin.close_all(function() {
				
					// find the next item that's in the 3rd column
				
					let item_order_div = this_order / 10
				
					// console.log('my order', item_order_div)
				
					if (item_order_div % 3 == 0) {
						
						drawer_order = this_order + 1
						
					} else {
						
						this_item.nextAll().each(function () {
							
							if (drawer_order == null) {
								// console.log(
								// 	'this order',
								// 	parseInt($(this).css('order')),
								// 	parseInt($(this).css('order')) / 10,
								// )
				
								if ((parseInt($(this).css('order')) / 10) % 3 == 0) {
									drawer_order = parseInt($(this).css('order')) + 1
								}
							}
						})
						
					}
					
					let item_content = this_item.find(options.content_selector).html()
					
					// activate links
					
					this_item.find(options.trigger_selector).addClass('fd-selected')
					
					// create the drawer element
					
					this_drawer = $(
						'<div class="fd-drawer" data-fd-item="' +
							item_id +
							'" style="display: none; order: ' +
							drawer_order +
							'">' +
							item_content +
							'</div>',
					)
						.insertAfter(this_item)
						.slideDown(250, function () {
							this_item.addClass('fd-open')
						})
					
				})
				
			}
			
		},
		
		close_drawer: function(item_id, callback = null) {
			let plugin = this,
					item = plugin.item,
					options = plugin.options
					
			let this_item = item.find(options.item_selector + '[data-fd-item="' + item_id + '"]'),
					this_drawer = item.find('.fd-drawer[data-fd-item="' + item_id + '"]')
			
			if (plugin.debug == true) console.log('close ' + item_id)
			
			this_drawer.slideUp(250, function () {
				$(this).remove()
				
				this_item.removeClass('fd-open')
				
				this_item.find(options.trigger_selector).removeClass('fd-selected')
					
				if (typeof callback == 'function') {
					callback()
				}
			})
			
		},
		
		close_all: function(callback = null) {
			let plugin = this,
					item = plugin.item,
					options = plugin.options
			
			if (plugin.debug == true) console.log('close all')
			
			item.find('.fd-drawer').each(function() {
				plugin.close_drawer($(this).attr('data-fd-item'))
			})
			
			if (typeof callback == 'function') {
				callback()
			}
			
		}
		
	}

	// jQuery plugin interface

	$.fn.flex_drawer = function (opt) {
		var args = Array.prototype.slice.call(arguments, 1),
			result = true

		this.each(function () {
			var item = $(this)
			var instance = item.data('flex_drawer')

			if (!instance) {
				// create plugin instance if not created
				item.data('flex_drawer', new flex_drawer(this, opt))
			} else {
				// otherwise check arguments for method call
				if (typeof opt === 'string') {
					result = instance[opt].apply(instance, args)
				}
			}
		})
		
		return result
	}
})(jQuery)
