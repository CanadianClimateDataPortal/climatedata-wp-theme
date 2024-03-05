// tab drawer plugin

if (typeof pushes_since_input == 'undefined') var pushes_since_input = 0

;(function ($) {
	function tab_drawer(item, options) {
		// options

		var defaults = {
			globals: ajax_data.globals,
			lang: 'en',
			history: {
				enabled: true,
				prev_path: null
			},
			path: [],
			current_id: null,
			elements: {
				tabs: null,
				container: null,
			},
			map: {
				object: null,
			},
			debug: false,
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
			
			options.lang = options.globals.current_lang_code

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
			
			item.on('click', '.tab-drawer-trigger', function(e) {
				e.preventDefault()
				
				pushes_since_input = 0
				plugin.update_path($(this).attr('href'))
				
			})
			
			// close content

			$('body').on('click', '.tab-drawer-close', function () {
				
				let this_content = $(this).closest('.tab-drawer'),
						target_content = this_content.parents('.tab-drawer').first(),
						target_ID = null
						
				if (
					target_content.length &&
					!target_content.hasClass('tab-drawer-tabs-container')
				) {
					target_ID = '#' + target_content.attr('id')
				}
				
				if (options.debug == true) {
					console.log('closing ' + this_content.attr('id') + ', new active is ' + target_ID)
				}
				
				plugin.update_path(target_ID)
				
			})
			
			// HISTORY
			
			if (options.history.enabled == true) {
				
				// initial check for hash
				plugin.handle_pop()
				
				window.addEventListener('popstate', function(e) {
					if (options.debug == true) {
						console.log('td', 'pop')
					}
					
					plugin.handle_pop(e)
				})
				
			}
			
		},
		
		update_path: function(target_ID, do_history = true) {
			let plugin = this,
				item = plugin.item,
				options = plugin.options
			
			let content_to_close = []
			
			if (options.history.enabled == false) {
				do_history = false
			}
			
			// reset current_id
			options.prev_id = options.current_id
			options.current_id = null
			
			// reinit options.path with the target content first
			options.path = []
			
			if (target_ID != null) {
				
				options.path.push(target_ID)
			
				// grab all the parents and add each one to the path
				$(target_ID).parents('.tab-drawer').map(function() {
					options.path.push('#' + $(this).attr('id'))
				})
				
			}
			
			// reverse the path so it starts at the topmost parent
			options.path.reverse()
			
			item.find('.tab-drawer.td-selected').each(function() {
				
				// each currently selected tab
				
				let this_ID = $(this).attr('id')
				
				if (!options.path.includes(this_ID)) {
					// tab shouldn't be open anymore
					content_to_close.push('#' + this_ID)
				}
				
			})
			
			// reverse content_to_close
			// so it starts at the last open tab
			content_to_close.reverse()
			
			// console.log('to close', content_to_close)
			// console.log('to open', options.path)
			
			// close and then open
			
			plugin.close_content(
				content_to_close, 
				function() {
					plugin.select_content(do_history)
				}
			)
			
		},
		
		select_content: function(do_history = true) {
			
			let plugin = this,
				item = plugin.item,
				options = plugin.options
			
			// deactivate all links
			
			item.find('.tab-drawer-trigger').removeClass('active')
				
			options.path.forEach(function(tab_ID, i) {
				
				if (tab_ID.charAt(0) != '#') tab_ID = '#' + tab_ID
				
				// let tab_id = '#' + tab.attr('id')
				
				// console.log('select', i, tab_id)
				
				$('body').addClass('tab-drawer-open')
				
				// set any links to this content to active
				
				item.find('.tab-drawer-trigger[href="' + tab_ID + '"]').addClass('active')
				
				if (!$(tab_ID).hasClass('tab-drawer-tabs-container')) {
					
					$(tab_ID).siblings('.td-selected').removeClass('td-selected')
					
					// open tab content
					
					$(tab_ID).addClass('td-selected')
					
				}
				
				options.current_id = tab_ID
				
			})
			
			// history
			
			if (
				options.history.enabled == true &&
				do_history == true
			) {
				
				// console.log('push')
				
				let new_path = window.location.origin + window.location.pathname + window.location.search
				
				if (options.current_id != null) {
					new_path += options.current_id
				}
				
				if (new_path != options.history.prev_path) {
					
					// console.log('new path', new_path)
					// console.log('td', 'push')
					
					if (pushes_since_input < 1) {
						pushes_since_input += 1
						history.pushState({}, '', new_path)
					} else {
						history.replaceState({}, '', new_path)
					}
					
					options.history.prev_path = new_path
					
				}
				
			}
			
			$(document).trigger('td_update_path', [options.prev_id, options.current_id])
			
		},
		
		close_content: function(content_to_close, fn_callback) {
			
			let plugin = this,
				item = plugin.item,
				options = plugin.options
			
			const close_and_shift = async () => {
				
				if (content_to_close.length == 0) {
					return true
				}
					
				// console.log('close', content_to_close[0])
				
				$(content_to_close[0]).removeClass('td-selected')
				
			
				options.elements.tabs
					.find('a[href="#' + $(content_to_close[0]).attr('id') + '"]')
					.removeClass('active')
			
				// remove first element from content_to_close
				content_to_close.shift()
			
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
			
			const process_close_queue = async() => {
				try {
					await process_interval(close_and_shift, 200)
				} catch (e) {
					if (options.debug == true) {
						console.log('error')
					}
				}
			
				if (typeof fn_callback == 'function') {
					fn_callback()
				}
			
				// if no content is selected,
				// set status to 'closed'
				
				if (item.find('.td-selected').length) {
					
					// options.current_id = '#' + item.find('.td-selected').last().attr('id')
					
				} else {
					
					options.status = 'closed'
					$('body').removeClass('tab-drawer-open')
					
				}
				
				// console.log('done')
			}
			
			process_close_queue()
			
		},
		
		handle_pop: function(e) {
			
			let plugin = this,
				item = plugin.item,
				options = plugin.options
			
			// console.log('pop', e)
					
			let new_hash = null
			
			if (
				window.location.hash != '' &&
				$('body').find(window.location.hash).length && 
				$('body').find(window.location.hash).hasClass('tab-drawer')
			) {
				
				new_hash = window.location.hash
				
			}
				
			plugin.update_path(new_hash, false)
			
		},
		
		get_tabs: function() {
			
			let plugin = this,
				item = plugin.item,
				options = plugin.options
				
			return options.elements.tabs
			
		}
		
	}

	// jQuery plugin interface

	$.fn.tab_drawer = function (opt) {
		var args = Array.prototype.slice.call(arguments, 1),
			result = true

		this.each(function () {
			var item = $(this)
			var instance = item.data('tab_drawer')

			if (!instance) {
				// create plugin instance if not created
				item.data('tab_drawer', new tab_drawer(this, opt))
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
