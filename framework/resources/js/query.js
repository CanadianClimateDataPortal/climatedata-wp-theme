// query

;(function ($) {

	function fw_query(item, options) {

		// options

		var defaults = {
			globals: ajax_data.globals,
			lang: ajax_data.globals.current_lang_code,
			fw_key: null,
			args: null,
			item_options: null,
			template: null,
			elements: {
				item_container: null,
				filters: null,
				sort: null,
				pagination: null
			},
			tax_query: null,
			meta_query: null,
			max_pages: 0,
			debug: true
		}

		this.options = $.extend(true, defaults, options)

		this.item = $(item)
		this.init()
	}

	fw_query.prototype = {

		// init

		init: function () {

			let plugin = this,
					options = plugin.options,
					item = plugin.item

			//
			// INITIALIZE
			//

			if (options.debug == true) {
				console.log('fw_query', 'init')
			}
			
			//
			// ELEMENTS
			//
			
			// item container
			options.elements.item_container = item.find('.fw-query-items').first()
			
			// filter container
			if (options.elements.filters == null) {
				options.elements.filters = item.find('.fw-query-filter')
			}
			
			// sort container
			if (options.elements.sort == null) {
				options.elements.sort = item.find('.fw-query-sort')
			}
			
			// pagination
			if (options.elements.pagination == null) {
				options.elements.pagination = item.find('.fw-query-pagination')
			}
			
			// [fw] element key
			options.fw_key = item.closest('.fw-element').attr('data-key')
			
			// query args
			console.log(item)
			console.log(item.attr('data-args'))
			
			options.args = JSON.parse(item.attr('data-args'))
			// item.removeAttr('data-args')
			
			// force page number
			if (!options.args.hasOwnProperty('paged')) {
				options.args.paged = 1
			}
			
			// any initial tax/meta query args
			// should be kept and merged with filter args
			
			console.log(options.args)
			if (options.args.hasOwnProperty('tax_query')) {
				options.tax_query = options.args.tax_query
			}
			
			if (options.args.hasOwnProperty('meta_query')) {
				options.meta_query = options.args.meta_query
			}
			
			options.item_options = JSON.parse(options.elements.item_container.attr('data-options'))
			
			// options.elements.item_container.removeAttr('data-options')
			
			// create a blank template from the options
			
			options.template = $('<div class="fw-query-item">')
			
			// options.template = item.find('.fw-query-item').first().clone()
			// item.find('.fw-query-item').remove()
			
			options.template.addClass(options.item_options.item_class)
			
			// console.log(options.template)
			
			//
			// EVENTS
			//
			
			// click a filter
			
			if (options.elements.filters != null) {
				options.elements.filters.on('click', '.filter-item', function(e) {
					
					if (e.isPropagationStopped() == false) {
						
						if ($(this).hasClass('selected')) {
							
							$(this).removeClass('selected')
							
						} else {
							
							if ($(this).closest('.fw-query-filter').attr('data-filter-multi') == 'false') {
								$(this).siblings().removeClass('selected')
							}
							
							$(this).addClass('selected')
							
						}
						
						// don't propagate click to other plugins using the same filter items
						e.stopPropagation()
					
					}
					
					plugin.update_filters()
					
				})
			}
			
			// sort item
			
			if (options.elements.sort != null) {
				options.elements.sort.on('click', 'li', function(e) {
					
					let sort = $(this).attr('data-sort').split('_')
					
					options.args.orderby = sort[0]
					options.args.order = sort[1]
					
					options.elements.sort.find('li').removeClass('selected')
					$(this).addClass('selected')
					
					plugin.do_query()
					
				})
			}
			
			// pagination
			
			if (options.elements.pagination != null) {
				
				options.elements.pagination.on('click', '.fw-query-pagination-btn', function(e) {
					
					let new_page = options.args.paged
					
					if ($(this).hasClass('next')) {
						if (options.max_pages > options.args.paged) {
							// page number can still go higher
							new_page += 1
						}
					}
					
					if ($(this).hasClass('previous')) {
						if (options.args.paged > 1) {
							new_page -= 1
						}
					}
					
					if (new_page != options.args.paged) {
						console.log('go to page ' + options.args.paged)
						options.args.paged = new_page
						plugin.do_query()
					}
					
				})
				
			}
			
			$(document).on('fw_populate_block', function(event, element) {
				console.log('submit', event, element)
				console.log('event here', event, element.data.key, options.fw_key)
				
				if (element.data.key == options.fw_key) {
					
					plugin.item = element.item.find('.query-object')
					
					plugin.init()
					
				}
				
			})
			
			plugin.do_query()
			
		},
		
		update_filters: function() {
			
			let plugin = this,
					options = plugin.options,
					item = plugin.item
			
			// reset default tax/meta query
			if (options.args.tax_query) options.args.tax_query = options.tax_query
			if (options.args.meta_query) options.args.meta_query = options.meta_query
			
			options.elements.filters.each(function() {
				
				let this_filter = $(this),
						this_type = this_filter.attr('data-filter-type'),
						this_multi = (this_filter.attr('data-filter-multi') == 'true') ? true : false
				
				this_filter.find('.filter-item.selected').each(function() {
							
					let this_key = $(this).attr('data-key')
							this_val = $(this).attr('data-value')
					
					switch (this_type) {
						case 'post_type' :
						
							options.args.post_type = this_val
						
							break
						
						case 'taxonomy' :
						
							if (options.args.tax_query == undefined) {
								options.args.tax_query = []
							}
							
							options.args.tax_query.push({
								taxonomy: this_key,
								field: 'slug',
								terms: [ this_val ]
							})
							
							break
							
						case 'meta' :
							
							if (options.args.meta_query == undefined) {
								options.args.meta_query = []
							}
							
							options.args.meta_query.push({
								key: this_key,
								value: this_val,
								compare: '='
							})
							
							break
					}
					
				})
				
			})
			
			console.log('new args', options.args)
			
			plugin.do_query()
			
		},
		
		do_query: function() {
			
			let plugin = this,
					options = plugin.options,
					item = plugin.item
			
			console.log('args', options.args)
			console.log('options', options.item_options)
			
			let rest_url = ajax_data.rest_url + 'framework/v2/query'
			
			$.ajax({
				url: rest_url,
				type: 'GET',
				dataType: 'json',
				beforeSend: function(xhr) {
					xhr.setRequestHeader('X-WP-Nonce', ajax_data.rest_nonce)
				},
				async: false,
				data: {
					args: options.args,
					options: options.item_options,
					lang: options.lang
				},
				success: function(data) {
					
					console.log(data)
					
					if (data.success == true) {
						
						options.elements.item_container.empty()
						
						if (data.items.length > 0) {
							
							// set page number and max pages
							
							options.max_pages = data.max_pages
							
							options.elements.pagination.find('.number-label-current').text(options.args.paged)
							
							options.elements.pagination.find('.number-label-max').text(options.max_pages)
							
							if (options.args.paged == 1) {
								item.find('.fw-query-pagination-btn.previous').addClass('disabled')
							} else {
								item.find('.fw-query-pagination-btn.previous').removeClass('disabled')
							}
							
							if (options.args.paged == options.max_pages) {
								item.find('.fw-query-pagination-btn.next').addClass('disabled')
							} else {
								item.find('.fw-query-pagination-btn.next').removeClass('disabled')
							}
							
							data.items.forEach(function(item, i) {
								
								// console.log(item)
								
								let new_item = options.template.clone()
								
								new_item.html(item.output).appendTo(options.elements.item_container)
								
							})
							
						}
						
					} else {
						
						options.elements.item_container.html('<p class="alert alert-warning">' + data.message + '</a>')
						
					}
					
				}
			})
			
		}

	}

	// jQuery plugin interface

	$.fn.fw_query = function (opt) {
		var args = Array.prototype.slice.call(arguments, 1)

		return this.each(function () {

			var item = $(this)
			var instance = item.data('fw_query')

			if (!instance) {

				// create plugin instance if not created
				item.data('fw_query', new fw_query(this, opt))

			} else {

				// otherwise check arguments for method call
				if (typeof opt === 'string') {
					instance[opt].apply(instance, args)
				}

			}
		})
	}

}(jQuery));
