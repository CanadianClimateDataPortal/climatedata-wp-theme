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
				sort: null
			},
			tax_query: null,
			meta_query: null,
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
				// console.log(item.find('.filter'))
				// console.log(options.elements.filters)
			}
			
			// sort container
			options.elements.sort = item.find('.fw-query-sort')
			
			// [fw] element key
			options.fw_key = item.closest('.fw-element').attr('data-key')
			
			// query args
			options.args = JSON.parse(item.attr('data-args'))
			// item.removeAttr('data-args')
			
			// any initial tax/meta query args
			// should be kept and merged with filter args
			
			if (options.args.tax_query) {
				options.tax_query = options.args.tax_query
			}
			
			if (options.args.meta_query) {
				options.meta_query = options.args.meta_query
			}
			
			options.item_options = JSON.parse(options.elements.item_container.attr('data-options'))
			
			// options.elements.item_container.removeAttr('data-options')
			
			// create a blank template from the options
			
			options.template = $('<div class="fw-query-item">')
			
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
			
			if (options.elements.sort != null) {
				options.elements.sort.on('click', 'li', function(e) {
					
					let sort = $(this).attr('data-sort').split('_')
					
					options.args.orderby = sort[0]
					options.args.order = sort[1]
					
					plugin.do_query()
					
				})
			}
			
			$(document).on('fw_populate_block', function(event, element) {
				// console.log('submit', event, element)
				// console.log('event here', event, element.data.key, options.fw_key)
				
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
			
			// console.log('options', options.item_options)
			
			$.ajax({
				url: ajax_data.url,
				type: 'GET',
				dataType: 'json',
				async: false,
				data: {
					action: 'fw_do_query',
					args: options.args,
					options: options.item_options,
					globals: options.globals
				},
				success: function(data) {
					
					options.elements.item_container.empty()
					
					console.log('success ' + item.attr('id'))
					console.log(data)
					
					if (data.items.length) {
						
						data.items.forEach(function(item, i) {
							
							let new_item = options.template.clone()
							
							new_item.html(item.output)
							
							new_item.appendTo(options.elements.item_container)
							
						})
						
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
