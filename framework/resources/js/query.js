// query

;(function ($) {

	function fw_query(item, options) {

		// options

		var defaults = {
			globals: ajax_data.globals,
			lang: ajax_data.globals.current_lang_code,
			fw_key: null,
			default_args: null,
			args: null,
			item_options: null,
			template: null,
			elements: {
				item_container: null,
				filters: null,
				sort: null,
				pagination: null,
				reset: null
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
			
			// filter reset
			if (options.elements.reset == null) {
				options.elements.reset = item.find('.fw-query-reset')
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
			// console.log(item)
			// console.log(item.attr('data-args'))
			
			options.args = JSON.parse(item.attr('data-args'))
			// item.removeAttr('data-args')
			
			// clone for defaults
			options.default_args = { ...options.args }
			
			// force page number
			if (!options.args.hasOwnProperty('paged')) {
				options.args.paged = 1
			}
			
			// any initial tax/meta query args
			// should be kept and merged with filter args
			
			// if (options.args.hasOwnProperty('tax_query')) {
			// 	options.tax_query = options.args.tax_query
			// }
			// 
			// if (options.args.hasOwnProperty('meta_query')) {
			// 	options.meta_query = options.args.meta_query
			// }
			
			options.item_options = JSON.parse(options.elements.item_container.attr('data-options'))
			
			// options.elements.item_container.removeAttr('data-options')
			
			// create a blank template from the options
			
			options.template = $('<div class="fw-query-item">')
			
			// options.template = item.find('.fw-query-item').first().clone()
			// item.find('.fw-query-item').remove()
			
			options.template.addClass(options.item_options.item_class)
			
			// console.log(options.template)
			
			// check for query string
			
			if (window.location.search) {
				
				let init_filters = []
				
				if (window.location.search.includes('q=')) {
					init_filters = window.location.search.split('q=')[1]
					
					if (init_filters.includes('&')) {
						init_filters = init_filters.split('&')[0]
					}
					
					if (init_filters.includes('|')) {
						init_filters = init_filters.split('|')
					} else {
						init_filters = [ init_filters ]
					}
					
					init_filters.forEach(function(filter) {
						let this_filter = filter.split(':')
						options.elements.filters.find('.filter-item[data-key="' + this_filter[0] + '"][data-value="' + this_filter[1] + '"]').addClass('selected')
					})
				}
				
			}
			
			//
			// EVENTS
			//
			
			// click a filter
			
			if (options.elements.filters != null) {
				options.elements.filters.on('click', '.filter-item', function(e) {
					
					if (e.isPropagationStopped() == false) {
						
						// console.log($(this).attr('data-key'), $(this).attr('data-value'))
						
						if ($(this).hasClass('selected')) {
							
							$(this).removeClass('selected')
							
						} else {
							
							if ($(this).closest('.fw-query-filter').attr('data-filter-multi') == 'false') {
								$(this).siblings().removeClass('selected')
							}
							
							$(this).addClass('selected')
							
						}
						
						// don't propagate click to other plugins using the same filter items
						// bug - bootstrap dropdown won't close
						e.stopPropagation()
					
					}
					
					plugin.update_filters()
					
				})
			}
			
			// reset filters
			
			if (options.elements.reset != null) {
				options.elements.reset.on('click', function(e) {
					
					options.elements.filters.each(function() {
						$(this).find('.selected').removeClass('selected')
					})
					
					plugin.update_filters(function() {
						$(document).trigger('fw_query_reset')
					})
					
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
				
				options.elements.pagination.on( 'click', '.fw-query-pagination-btn', function ( e ) {
					let new_page;
					
					// Scroll to top of query container.
					$( this ).closest( '.fw-container' )[0].scrollIntoView( {behavior: 'smooth'} );
						
					// Specified page number.
					if ($( this ).hasClass( 'page-number' ) && $( this ).data( 'queryPage' )) {
						new_page = parseInt( $( this ).data( 'queryPage' ) );
					} else {
						// Use prev/next buttons.
						new_page = options.args.paged;
						
						if ($( this ).hasClass( 'next' )) {
							if (options.max_pages > options.args.paged) {
								new_page += 1;
							}
						}
						
						if ($( this ).hasClass( 'previous' )) {
							if (options.args.paged > 1) {
								new_page -= 1;
							}
						}
					}
					
					if (new_page != options.args.paged) {
						// console.log('go to page ' + options.args.paged)
						options.args.paged = new_page
						plugin.do_query()
					}
					
				} )
				
			}
			
			$(document).on('fw_populate_block', function(event, element) {
				// console.log('submit', event, element)
				// console.log('event here', event, element.data.key, options.fw_key)
				
				if (element.data.key == options.fw_key) {
					
					plugin.item = element.item.find('.query-object')
					
					plugin.init()
					
				}
				
			})
			
			// initial query
			plugin.update_filters()
			
		},
		
		update_filters: function(callback = null) {
			
			let plugin = this,
					options = plugin.options,
					item = plugin.item
			
			// reset default tax/meta query
			// console.log(JSON.stringify(options.args, null, 4))
			
			if (options.args.tax_query) {
				if (options.default_args.tax_query) {
					options.args.tax_query = [ ...options.default_args.tax_query ]
				} else {
					delete options.args.tax_query
				}
			}
			
			if (options.args.meta_query) {
				if (options.default_args.meta_query) {
					options.args.meta_query = { ...options.default_args.meta_query }
				} else {
					delete options.args.meta_query
				}
			}
			
			let new_q = '',
					has_filters = false
			
			options.elements.filters.each(function() {
				
				let this_filter = $(this),
						this_type = this_filter.attr('data-filter-type'),
						this_key = this_filter.attr('data-filter-key'),
						this_multi = (this_filter.attr('data-filter-multi') == 'true') ? true : false
				
				this_filter.find('.filter-item.selected').each(function() {
					
					has_filters = true
								
					let this_key = $(this).attr('data-key')
							this_val = $(this).attr('data-value')
					
					switch (this_type) {
						case 'post_type' :
						
							this_key = 'post_type'
							options.args.post_type = this_val
						
							break
						
						case 'taxonomy' :
						
							if (options.args.tax_query == undefined) {
								options.args.tax_query = []
							}
							
							let add_to_arg = false
							
							options.args.tax_query.forEach(function(arg) {
								if (add_to_arg == false) {
									if (arg.taxonomy == this_key) {
										
										if (this_multi == true) {
											arg.terms.push(this_val)
										} else {
											arg.terms = [ this_val ]
										}
										
										add_to_arg = true
									}
								}
							})
							
							if (add_to_arg == false) {
								options.args.tax_query.push({
									taxonomy: this_key,
									field: 'slug',
									terms: [ this_val ]
								})
							}
							
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
				
					if (new_q != '') new_q += '|' 
					new_q += this_key + ':' + this_val
						
				})
				
			})
			
			// always set the page back to 1
			options.args.paged = 1
			
			// console.log('new args', options.args)
			
			if (options.elements.reset != null) { 
				if (has_filters == true) {
					options.elements.reset.show()
				} else {
					options.elements.reset.hide()
				}
			}
			
			plugin.update_query_string(new_q)
			
			plugin.do_query(callback)
			
		},
		
		update_query_string: function(q) {
			
			let plugin = this,
					options = plugin.options,
					item = plugin.item
			
			let current_string,
					new_q = 'q=' + q
			
			if (window.location.search) {
				current_string = window.location.search.substring(1).split('&')
				
				let q_index = null
				
				current_string.forEach(function(param, i) {
					if (param.substring(0, 2) == 'q=') {
						q_index = i
					}
				})
				
				if (q_index != null) {
					current_string[q_index] = new_q
				} else {
					current_string.push(new_q)
				}
			} else {
				current_string = [new_q]
			}
			
			current_string = '?' + current_string.join('&')
			
			if (current_string == '?q=') {
				current_string = '?'
			}
			
			history.replaceState({}, document.title, current_string)
			
		},
		
		generate_pagination_links: function ( pagination_data ) {
			const pagination_container = $( '.fw-query-pagination-pages' );
			
			if (!pagination_container) {
				return;
			}
			
			// Initialize.
			const total_pages = parseInt( pagination_data.total );
			const current_page = parseInt( pagination_data.current );
			
			if (isNaN( total_pages ) || isNaN( current_page ) || total_pages <= 0 ) {
				pagination_container.remove();
				
				return;
			}
			
			// Clean pagination container HTML.
			pagination_container.html( '' );
			
			/**
			 * Pagination algorithm.
			 * 
			 * See more: https://www.zacfukuda.com/blog/pagination-algorithm
			 */
			const pagination_map = (function ( {current, max} ) {
				if (!current || !max) return null;
				
				let prev = current === 1 ? null : current - 1,
					next = current === max ? null : current + 1,
					items = [ 1 ];
				
				if (current === 1 && max === 1) return {current, prev, next, items};
				if (current > 4) items.push( 'ELLIPSIS' );
				
				let page_display_radius = 2,
					left_range_start = current - page_display_radius,
					right_range_end = current + page_display_radius;
				
				for (let i = left_range_start > 2 ? left_range_start : 2; i <= Math.min( max, right_range_end ); i++) {
					items.push( i );
				}
				
				if (right_range_end + 1 < max) {
					items.push( 'ELLIPSIS' );
				}
				
				if (right_range_end < max) {
					items.push( max );
				}
				
				return {current, prev, next, items};
			})( {current: current_page, max: total_pages} );
			
			pagination_map.items.forEach( page_index => {
				const div_element = document.createElement( 'div' );
				
				div_element.classList.add( 'fw-query-pagination-btn', 'page-number', 'btn', 'btn-light' );
				
				if (page_index === 'ELLIPSIS') {
					div_element.textContent = '…';
					div_element.classList.add( 'pe-none' );
					div_element.classList.remove( 'btn-light' );
				} else {
					div_element.dataset.queryPage = page_index;
					div_element.textContent = page_index;
					
					if (page_index === current_page) {
						div_element.classList.add( 'btn-dark', 'pe-none' );
					}
				}
				
				pagination_container.append( div_element );
			} );
		},
		
		do_query: function(callback = null) {
			
			let plugin = this,
					options = plugin.options,
					item = plugin.item
			
			if (options.debug == true) console.log('do query')
			
			// console.log('options', options.item_options)
			
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
					
					// console.log(data)
					
					if (data.success == true) {
						
						options.elements.item_container.empty()
						
						if (options.debug == true) console.log('returned ' + data.items.length + ' items')
						
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
							
							// Generate pagination links.
							const pagination_data = {
								total: options.max_pages,
								current: options.args.paged
							};
							
							plugin.generate_pagination_links( pagination_data );

							data.items.forEach(function(item, i) {
								
								// console.log(item)
								
								let new_item = options.template.clone()
								
								new_item.html(item.output).appendTo(options.elements.item_container)
								
							})
							
						}
						
					} else {
						
						options.elements.item_container.html('<p class="alert alert-warning">' + data.message + '</a>')
						
					}
					
					if (plugin.debug == true) {
						console.log('trigger fw_query_success')
					}
					
					if (typeof callback == 'function') {
						callback()
					}
					
					$(document).trigger('fw_query_success', [item])
					
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
