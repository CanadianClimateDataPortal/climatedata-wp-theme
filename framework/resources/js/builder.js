// builder
// v2.0

;(function ($) {

	function builder(item, options) {

		// options

		var defaults = {
			globals: ajax_data.globals,
			lang: ajax_data.globals.current_lang_code,
			post_id: null,
			page: {},
			current_parent: $('.fw-main'),
			status: 'init',
			hierarchy: [ 'page', 'section', 'container', 'row', 'column', 'block' ],
			objects: {
				page: {
					classes: $('body').attr('class').split(' '),
					child: 'section',
				},
				template: {
					classes: ['fw-element', 'fw-template']
				},
				section: {
					classes: ['fw-element', 'fw-section'],
					child: 'container',
				},
				container: {
					classes: ['fw-element', 'fw-container', 'container-fluid'],
					child: 'row',
				},
				row: {
					classes: ['fw-element', 'fw-row', 'row'],
					child: 'column',
				},
				column: {
					classes: ['fw-element', 'fw-column', 'col'],
					child: 'block',
				},
				block: {
					classes: ['fw-element', 'fw-block'],
					parent: null
				}
			},
			modal: {
				content: null, // which modal to retrieve
			},
			element: {
				item: $('<div class="fw-element">'), // DOM element to be inserted into page
				data: {
					type: null, // e.g. section/container/row/column/block
					children: []
				}
			},
			parent: {
				item: null,
				data: {}
			},
			template_html: '',
			template_first: '',
			elements_to_move: [],
			status: 'init',
			dropdowns: {},
			moving_in_template: false,
			data: {
				key_to_add: '',
				add_next: false,
				array_indexes: {},
				array_key: null,
				removed_settings: []
			},
			uploader: {
				object: null,
				options: null,
				type: null,
				elements: {
					file_id: null,
					url: null,
					button: null,
					placeholder: null,
				},
				placeholder_src: null,
				img_url: {},
				attachment: null,
				selection: null
			},
			debug: true
		}

		this.options = $.extend(true, defaults, options)

		this.item = $(item)
		this.init()
	}

	builder.prototype = {

		// init

		init: function () {

			let plugin = this,
					options = plugin.options

			//
			// INITIALIZE
			//

			if (options.debug == true) {
				console.log('builder', 'init')
			}
			
			AOS.init({
				disable: true
			})
			
			console.log(ajax_data.globals)
			
			options.post_id = $('body').attr('data-key')
			
			// load this page's builder object
			
			console.log('fw', 'getting object')
			
			// get the page object
			
			$.ajax({
				url: ajax_data.url,
				type: 'GET',
				data: {
					action: 'fw_get_builder_object',
					globals: options.globals,
					post_id: options.post_id
				},
				dataType: 'json',
				success: function(data) {
					
					options.page = data
					
					console.log('done')
					
					console.log('fw', 'creating elements')
					
					// plugin.output_loop(options.page, 1)
					
					console.log('page', options.page)
					
					$('body').attr('data-key', options.page.key)
					
					// activate elements
					
					plugin.activate()
					
					// add the insert button at the very end
					
					$(plugin.do_insert_btn(options.page, true)).insertAfter('.fw-page')
					
				}
			})
			
			//
			// EVENTS
			//
			
			// CLICKS
			
			// modal
			
			$('.fw-actions-item a[href="#fw-modal"]').click(function(e) {
				e.preventDefault()
				
				options.modal.content = $(this).closest('li').attr('class').split('fw-modal-content-')[1].split(' ')[0]
				
				// console.log(options.modal.content)
				
				if (options.modal.content == 'save') {
					options.status = 'saving'
				}
				
				if (options.modal.content == 'page') {
					let this_element = $('.fw-page')
					options.status = 'editing'
					options.element.item = $('body')
					options.element.data = plugin.get_element_by_key(options.element.item.attr('data-key'))
					options.parent.item = this_element.parent()
					options.parent.data = plugin.get_element_by_key(options.parent.item.attr('data-key'))
				}
				
				$('#fw-modal').modal('show')
				
			})
			
			// builder toggle
			
			$('#wp-admin-bar-fw-actions-item-toggle').click(function() {
				
				if ($('body').hasClass('fw-builder')) {
					
					options.status = 'disabled'
					$('body').removeClass('fw-builder')
					$(this).find('.badge').text('Off').removeClass('text-bg-success').addClass('text-bg-warning')
					
				} else {
					
					$('body').addClass('fw-builder')
					$(this).find('.badge').text('On').removeClass('text-bg-warning').addClass('text-bg-success')
					options.status = 'ready'
					
				}
				
			})
			
			// save post
			
			// $('#wp-admin-bar-fw-actions-item-save').click(function() {
			// 	
			// 	options.status = 'saving'
			// 	
			// 	
			// 	
			// 	plugin.update_post()
			// 	
			// })
			
			// debug
			
			$('#output-btn').click(function() {
				$('#output').text(JSON.stringify(options.page, null, 2))
			})
			
			// click insert button
			
			$('body').on('click', '.fw-insert-btn', function() {
				
				let this_element = $(this).closest('.fw-element')
				
			})
			
			// modal ajax
			
			// click modal trigger
			
			$('body').on('click', '.fw-modal-trigger', function(e) {
				e.preventDefault()
				
				// which modal template to retrieve
				options.modal.content = $(this).attr('data-modal-content')
				
				options.modal.type = $(this).attr('data-type')
				
				// console.log('get modal', options.modal)
				
				// if inserting/editing a block,
				// also set category and content properties
				
				if (options.modal.content.includes('/')) {
					options.element.data.type = options.modal.content
				}
				
				if (options.modal.content == 'new') {
					
					
				}
				
				// show the modal
				if ($('#fw-modal').hasClass('show')) {
					plugin.modal_get_form()
				} else {
					$('#fw-modal').modal('show')
				}
				
			})
			
			$('#fw-modal').on('show.bs.modal', function() {
				plugin.modal_get_form()
			})
			
			$('#fw-modal').on('hide.bs.modal', function() {
			
				if (tinymce.activeEditor != null) {
					
					console.log('remove editor')
					
					tinymce.activeEditor.destroy()
					
				}
				
			})
			
			$('#fw-modal').on('hidden.bs.modal', function() {
				
				$(this).find('.modal-content').html('<div class="spinner-border my-3 mx-auto"></div>')
				
			})
			
			const fw_modal = new bootstrap.Modal('#fw-modal')
			
			// action button
			
			$('body').on('click', '.fw-new-choice', function(e) {
				
				// console.log(options.inserting)
				
				options.element.data.type = $(this).attr('data-modal-content')
				
			})
			
			$('body').on('click', '.fw-btn', function(e) {
				
				e.preventDefault()
				
				let this_element = $(this).closest('[data-key]'),
						this_key = this_element.attr('data-key')
						
				if (!this_element.length) {
					this_element = $('.fw-page')
				}
				
				// console.log('this element', this_element)
				
				if ($(this).hasClass('insert-element')) {
					
					//
					// INSERT
					//
					
					options.status = 'inserting'
					
					// merge objects[type] with element.data
					
					// console.log(options.modal.content)
					
					options.element.data = {
						...options.objects[options.modal.content]
					}
					
					options.element.data.type = options.modal.content
					
					console.log('new element', JSON.stringify(options.element.data))
					
					console.log(this_element)
					
					options.parent.item = this_element.parent()
					
					if (this_element.parent().hasClass('fw-template-label')) {
						options.parent.item = options.parent.item.parent()
					}
					
					if ($(this).hasClass('insert-into')) {
						
						// if inserting into an element
						// the button's container element is the parent
						options.parent.item = this_element
						
					}
					
					// console.log(options.parent)
					
					options.inserting = {
						where: 'append',
						index: null
					}
					
					options.parent.data = plugin.get_element_by_key(options.parent.item.attr('data-key'))
					
					// index
					
					if (!options.parent.data.children) {
						options.parent.data.children = []
					}
					
					console.log('parent children')
					console.log(JSON.stringify(options.parent.data.children, null, 2))
					
					options.inserting.index = options.parent.data.children.length
					
					if (
						$(this).hasClass('insert-before') ||
						$(this).hasClass('insert-after')
					) {
						
						console.log('this_key', this_key)
						
						options.inserting.index = options.parent.data.children.findIndex(item => item.key === this_key)
						
						if ($(this).hasClass('insert-before')) {
							
							options.inserting.where = 'before'
							
						} else if ($(this).hasClass('insert-after')) {
							
							options.inserting.where = 'after'
						
						}
						
					}
						
					console.log('insert', options.inserting)
					
					// console.log('parent', options.parent)
					
					// console.log('parent data', options.modal.parent.data())
					
				} else if ($(this).hasClass('edit-element')) {
					
					//
					// EDIT
					//
					
					options.status = 'editing'
					
					if ($(this).attr('data-modal-content') == 'page') {
						options.element.item = $('body')
					} else {
						options.element.item = this_element
					}
					
					options.element.data = plugin.get_element_by_key(options.element.item.attr('data-key'))
					
					options.parent.item = this_element.parent()
					options.parent.data = plugin.get_element_by_key(options.parent.item.attr('data-key'))
					
					// console.log(options.element)
					// console.log(options.parent)
					
				} else if ($(this).hasClass('duplicate-element')) {
					
					//
					// DUPLICATE
					//
					
					options.status = 'duplicating'
					
					this_element.removeClass('dropdown-open')
					
					// get the parent
					
					options.parent.item = this_element.parent()
					options.parent.data = plugin.get_element_by_key(options.parent.item.attr('data-key'))
					
					// duplicate the data by stringifying it
					// and replacing instances of the old key with a temporary
					// 'cloned' string
					
					let stringify_element = JSON.stringify(plugin.get_element_by_key(this_key)).replaceAll('"key":"' + this_key, '"key":"cloned')
					
					options.element.data = JSON.parse(stringify_element)
					
					// figure out the new key
					// by knocking off the last character,
					// converting it to an integer and adding 1
					
					let new_key = this_key.slice(0, -1) + (parseInt(this_key.slice(-1)) + 1)
					
					// duplicate the item
					// get the HTML and replace the old key with 'cloned'
					// same as above with the data
					
					let new_html = this_element.prop('outerHTML').replaceAll('data-key="' + this_key + '', 'data-key="cloned').replaceAll('id="element-' + this_key, 'id="element-cloned')
					
					// convert to a jquery object
					options.element.item = $(new_html)
					
					// remove all footers - they'll be reinserted properly
					// when activating
					
					options.element.item.find('.fw-element-footer').remove()
					
					// insert the new item
					
					options.element.item.insertAfter(this_element)
					
					// splice the new element data
					// into parent.children
					
					options.parent.data.children.forEach(function(child, i) {
						
						// find the key that matches
						// the original element
						
						if (child.key == this_key) {
							
							// insert after
							
							options.parent.data.children.splice(i + 1, 0, JSON.parse(stringify_element))
						
							return true
							
						}
						
					})
					
					// gather elements to move
					plugin.set_elements_to_move(options.parent.data)
					
					// set keys of moving elements
					if (options.elements_to_move != false) {
						plugin.set_element_keys()
					}
					
					// console.log('replacing keys')
					
					options.element.item.find('[data-key*="cloned"]').each(function() {
						$(this).attr('data-key', $(this).attr('data-key').replaceAll('cloned', new_key))
					})
					
					// console.log('replacing IDs')
					
					options.element.item.find('[id^="element-cloned"]').each(function() {
						$(this).attr('id', $(this).attr('id').replace('element-cloned', 'element-' + new_key))
					})
					
					// re-activate the parent data object
					
					plugin.activate(options.parent.data)
					
				} else if ($(this).hasClass('delete-element')) {
					
					//
					// DELETE
					//
					
					options.status = 'deleting'
					
					if ($(this).parents('.fw-template-label').length) {
						
						// deleting a template
						
						// find beginning label
						let this_begin = $(this).closest('.fw-template-label').prevAll('.fw-template-label.begin'),
								items_to_delete = [ this_begin ]
						
						// collect items to delete
						this_begin.nextAll().each(function() {
							items_to_delete.push($(this))
							
							if ($(this).hasClass('fw-template-label end')) {
								return false
							}
						})
						
						options.element.item = items_to_delete
						options.parent.item = this_begin.closest('.fw-element')
						
						options.parent.data = plugin.get_element_by_key(options.parent.item.attr('data-key'))
						
						// console.log('parent data', options.parent.data)
						
						if (this_begin.attr('data-template-type') == 'include') {
							
							options.deleting = options.parent.data.children.findIndex(item => item.inputs.path === this_begin.attr('data-template-key'))
							
						} else {
							
							console.log(this_begin, options.parent.data)
							
							options.deleting = options.parent.data.children.findIndex(item => item.inputs.post_id === this_begin.attr('data-template-key'))
							
						}
						
					} else {
						
						options.element.item = this_element
						options.parent.item = this_element.parent()
						
						options.parent.data = plugin.get_element_by_key(options.parent.item.attr('data-key'))
						
						options.deleting = options.parent.data.children.findIndex(item => item.key === this_key)
						
					}
					
					// console.log('element', options.element)
					// console.log('parent', options.parent)
					// console.log('deleting', options.deleting)
					
					console.log('delete index ' + options.deleting + ' from ', options.parent.data.children)
					
				} else if ($(this).hasClass('move-element')) {
					
					//
					// MOVE
					//
					
					options.status = 'moving'
					
					options.parent.item = this_element.parent()
					options.parent.data = plugin.get_element_by_key(options.parent.item.attr('data-key'))
					
					options.element.item = this_element
					options.element.data = plugin.get_element_by_key(options.element.item.attr('data-key'))
						
					let this_index = options.parent.data.children.findIndex(item => item.key === this_key),
							new_index,
							item_can_move = false
					
					// console.log('moving', this_index)
					
					if ($(this).hasClass('move-up')) {
						
						if (this_index != 0) {
							
							new_index = this_index - 1
							
							if (options.element.item.is('.fw-template-label')) {
								
								let items_to_move = [ options.element.item ]
								
								options.element.item.prevAll().each(function() {
									items_to_move.push($(this))
									
									if ($(this).hasClass('fw-template-label begin'))
										return false
									
								})
								
								console.log('move', items_to_move)
								
								items_to_move.reverse()
								
								items_to_move.forEach(function(item) {
									plugin.move_item_up(item)
								})
								
							} else {
							
								plugin.move_item_up(options.element.item)
								
							}
							
							item_can_move = true
							
						}
						
					} else if ($(this).hasClass('move-down')) {
						
						if (options.element.item.next().length) {
						
							new_index = this_index + 1
							
							if (options.element.item.is('.fw-template-label')) {
								
								let items_to_move = [ options.element.item ]
								
								options.element.item.prevAll().each(function() {
									items_to_move.push($(this))
									
									if ($(this).hasClass('fw-template-label begin'))
										return false
									
								})
								
								items_to_move.forEach(function(item) {
									plugin.move_item_down(item)
								})
								
							} else {
							
								plugin.move_item_down(options.element.item)
								
							}
							
							item_can_move = true
							
						}
						
					}
					
					if (item_can_move == true) {
							
						// splice array at this_index,
						// insert element at new_index
							
						options.parent.data.children.splice(new_index, 0, options.parent.data.children.splice(this_index, 1)[0])
						
						// gather elements to move
						plugin.set_elements_to_move(options.parent.data)
						
						// set keys of moving elements
						if (options.elements_to_move != false) {
							plugin.set_element_keys()
						}
						
					} else {
						
						console.log('can\'t move')
						
					}
					
				}
				
			})
			
			//
			// MODAL SUBMIT
			// e.g. insert, edit form
			//
			
			// APPLY LAYOUT
			
			$('body').on('click', '.fw-do-layout-submit', function() {
				
				let source_ID = $(this).closest('.modal').find('#inputs-post_id').val()
				
				if (source_ID != '') {
					
					// get the page object first
					
					$.ajax({
						url: ajax_data.url,
						type: 'GET',
						data: {
							action: 'fw_get_builder_object',
							post_id: source_ID
						},
						success: function(data) {
							
							options.page = JSON.parse(data.replaceAll(source_ID, options.globals.current_query.ID))
							
							console.log('new data', options.page)
							
							// get the output loop
							
							$.ajax({
								url: ajax_data.url,
								type: 'GET',
								data: {
									action: 'fw_output_loop_ajax',
									globals: options.globals,
									post_id: source_ID
								},
								success: function(data) {
									
									let new_html = $(data.replaceAll(source_ID, options.globals.current_query.ID))
									
									console.log('new html', new_html)
									// console.log('filter', new_html.innerHTML)
									
									$('.fw-page').replaceWith(new_html)
									
									plugin.activate()
									
									$('#fw-modal').modal('hide')
									
								}
							})
							
							
						}
					})
					
				}
				
			})
			
			// NEW POST
			
			$('body').on('click', '.fw-new-post-submit', function() {
				
				let form_data = {}
				
				$(this).closest('.modal').find('form').serializeArray().forEach(function(input) {
					
					form_data[input.name] = input.value
					
				})
				
				console.log('new post', form_data)
				
				$.ajax({
					url: ajax_data.url,
					type: 'GET',
					dataType: 'json',
					data: {
						action: 'fw_insert_post',
						inputs: form_data 
					},
					success: function(data) {
						
						console.log(data)
						
						$('#fw-modal .modal-body').html('<p>Created new ' + data.post_type + ' ‘' + data.post_title + '’ (<code>ID ' + data.post_id + '</code>)</p><p><a href="' + data.url + '" target="_blank">Edit <i class="fas fa-external-link ms-1"></i></a>')
						
						$('#fw-modal .fw-new-post-submit').remove()
						$('#fw-modal [data-bs-dismiss]').text('Close')
						
					}
				})
				
			})
			
			// PAGE SETTINGS
			
			$('body').on('click', '.fw-page-settings-submit', function() {
				
				let field_data = {
					title: $('.modal').find('[name="title"]').val(),
					slug: $('.modal').find('[name="slug"]').val()
				}
				
				// console.log(field_data)
				
				let form_data = {
					id: $('.modal').find('#settings-form-id').val(),
					class: $('.modal').find('#settings-form-classes').val()
				}
				
				// console.log(form_data)
				
				$.ajax({
					url: ajax_data.url,
					type: 'GET',
					dataType: 'json',
					data: {
						action: 'fw_update_page_settings',
						post_id: options.globals.current_query.ID,
						lang: options.lang,
						fields: field_data,
						inputs: form_data
					},
					success: function(data) {
						
						console.log(data)
						
						if (data.new_slug) {
							
							console.log(window.location.pathname + ' > ' + data.new_slug)
							
							let new_slug = window.location.href.replace(data.old_slug, data.new_slug)
							
							history.replaceState({}, '', new_slug)
							
						}
						
						if (data.new_title) {
							document.title = document.title.replace(data.old_title, data.new_title)
						}
						
						$('#fw-modal').modal('hide')
						
					}
				})
				
			})
			
			// INSERT/EDIT ELEMENT
			
			$('body').on('click', '.fw-settings-submit', function() {
				
				console.log('submit')
				console.log(JSON.stringify(options.element.data))
				
				let form = $(this).closest('.modal').find('form'),
						form_data = []//form.serializeArray()
				
				// each form input
				
				form.find(':input:not(button)').each(function() {
					
					if (typeof $(this).attr('name') !== 'undefined') {
						
						if ($(this).is('[type="checkbox"]')) {
							
							// checkboxes
							// on/off toggle or multi-select
							
							if ($(this).attr('name').slice(-2) == '[]') {
								
								// if the last 2 characters are []
								// then it's a multi-select checkbox group
								
								if ($(this).prop('checked') == true) {
								
									form_data.push({
										name: $(this).attr('name'),
										value: $(this).val()
									})
									
								}
								
							} else {
								
								// true/false
								
								form_data.push({
									name: $(this).attr('name'),
									value: $(this).prop('checked')
								})
								
							}
							
						} else {
							
							form_data.push({
								name: $(this).attr('name'),
								value: $(this).val()
							})
							
						}
						
					}
					
				})
				
				console.log(form_data)
				
				// console.log(options.status)
				
				// ACTION
				
				switch (options.status) {
					case 'inserting' :
						
						//
						// INSERT
						//
						
						// set up data object
						
						plugin.add_form_data_to_element(form_data)
						
						// generate a key for the new element
						
						if (!options.parent.data.children) {
							options.parent.data.children = []
						}
						
						// default key
						
						options.element.data.key = options.parent.data.key + '-1'
						
						if (options.parent.data.children.length > 0) {
							
							// if the parent already has some children
							// add a dummy key that will be changed later
							// when re-ordering stuff
							
							options.element.data.key = options.parent.data.key + '-inserting'
						}
						
						// auto insert elements between
						// parent and new element
						
						// options.parent.item.find('.fw-insert-into-empty:not(.persistent').remove()
						
						if (options.element.data.type == 'template') {
							
							// if (options.element.data.inputs.output == 'template') {
								// inserting a template
								
								console.log('get template and then create tree under ' + options.parent.data.type + ' ' + options.parent.data.key)
								
								plugin.get_template(
									options.parent, 
									options.element
								)
							// }
							
						} else {
							
							// inserting a new element
							
							console.log('create tree under ' + options.parent.data.type + ' ' + options.parent.data.key)
							
							plugin.create_tree(options.parent, options.element)
							plugin.insert_element()
							
						}
						
						break
						
					case 'editing' :
					
						//
						// EDITING
						//
						
						console.log('editing', options.element)
						
						// item is no longer auto-generated
						
						if (options.element.data.autogen) {
							delete options.element.data.autogen
						}
						
						// set up data object
						
						let result = plugin.add_form_data_to_element(form_data)
						
						// console.log(result)
						
						// update footer
						
						plugin.add_footer(options.element.data)
						
						// add block content
						
						if (options.element.data.type.includes('block')) {
							plugin.populate_block()
						}
						
						// update attributes
						
						plugin.set_element_atts(options.element)
						
						// update settings
						plugin.do_element_settings()
						
						break
						
					case 'deleting' :
				
						// remove the item(s)
						if (Array.isArray(options.element.item)) {
							
							options.element.item.forEach(function(item) {
								item.remove()
							})
							
						} else {
							
							options.element.item.remove()
							
						}
						
						// delete from the page object
						options.parent.data.children.splice(options.deleting, 1)
						
						// reorder siblings
						
						// gather elements to move
						plugin.set_elements_to_move(options.parent.data)
						
						// set keys of moving elements
						if (options.elements_to_move != false) {
							plugin.set_element_keys()
						}
						
						if (!options.parent.data.children.length) {
							options.parent.item.prepend(plugin.do_insert_btn(options.parent.data))
						}
						
						break
				}
				
				$('#fw-modal').modal('hide')
				
				$(document).trigger('fw_modal_submit', options.element)
				
				// reset options.element
				// doesn't work here because
				// the element gets reset before
				// certain ajax functions finish
				// replace with a reset_element method
				//
				// options.element = {
				// 	item: $('<div class="fw-element">'),
				// 	data: {
				// 		type: null,
				// 		children: []
				// 	}
				// }
				
			})
			
			//
			// SETTINGS
			//
			
			// add setting
			
			$('body').on('click', '.fw-form-flex-menu .dropdown-item', function() {
				
				let flex_container = $(this).closest('.fw-form-flex-container')
				
				let flex_path = flex_container.attr('data-path') + '/' + $(this).attr('data-flex-item')
				
				console.log(flex_container, flex_path)
				
				plugin.get_flex_form(flex_container, flex_path)
				
			})
			
			// delete setting
			
			$('body').on('click', '.fw-form-flex-item-remove', function() {
				
				let this_form = $(this).closest('.fw-form-flex-row'),
						this_container = $(this).closest('.fw-form-flex-container'),
						setting_key = this_form.attr('data-setting')
				
				this_form.fadeOut(125, function() {
					this_form.remove()
					plugin.reindex_flex(this_container)
				})
				
				// hide this setting from the dropdown
				
				$('#settings-form-add-items').find('[data-setting="' + setting_key + '"]').removeClass('disabled')
				
			})
			
			// repeater - add row
			
			$('body').on('click', '.fw-form-repeater-add-row', function(e) {
				
				plugin.add_repeater_row($(this).closest('.fw-form-repeater-container').find('.fw-form-repeater').first())
				
			})
			
			// repeater - delete row
			
			$('body').on('click', '.fw-form-repeater-delete-row', function(e) {
				
				let this_repeater = $(this).closest('.fw-form-repeater')
				
				$(this).closest('.fw-form-repeater-row').remove()
				
				let new_rows = this_repeater.find('.fw-form-repeater-row')
				
				// reorder all the rows
				
				console.log(this_repeater, new_rows)
				
				this_repeater.attr('data-rows', new_rows.length)
				
				$(new_rows).each(function(i) {
					$(this).attr('data-row-index', i)
				})
				
			})
			
			// flex - add row
			
			$('body').on('click', '.fw-form-flex-add-row', function(e) {
				
				plugin.add_flex_row($(this).closest('.fw-form-flex-container').find('.fw-form-flex').first(), 'resources/functions/builder/block/content/query/output/' + $(this).attr('data-item-content'))
				
				
			})
			
			// conditional form elements
			
			$('#fw-modal').on('change', '[data-form-condition]', function() {
				plugin.toggle_conditionals($(this))
			})
			
			$('#fw-modal').on('change', '.conditional-select', function() {
				
				// toggle for all options in the select
				$(this).find('option[data-form-condition]').each(function() {
					plugin.toggle_conditionals($(this))
				})
				
			})
			
		},
		
		toggle_conditionals: function(this_input) {
			
			// console.log('conditionals', this_input)
			
			let this_conditionals = this_input.attr('data-form-condition').split(','),
					conditionals_to_show = [],
					conditionals_to_hide = []
				
			if (this_input.is('option')) {
				
				if (this_input.prop('selected') == true) {
					
					conditionals_to_show = conditionals_to_show.concat(this_conditionals)
					
				} else {
					
					conditionals_to_hide = conditionals_to_hide.concat(this_conditionals)
					
				}
				
			} else if (this_input.is('[type="hidden"]')) {
				
				// console.log('hidden', this_input.val())
				
				if (this_input.val() != '') {
					
					conditionals_to_show = conditionals_to_show.concat(this_conditionals)
					
				} else {
					
					conditionals_to_hide = conditionals_to_hide.concat(this_conditionals)
					
				}
				
			} else if (this_input.is('[type="checkbox"]')) {
				
				if (this_input.prop('checked') == true) {
					
					conditionals_to_show = conditionals_to_show.concat(this_conditionals)
					
				} else {
					
					conditionals_to_hide = conditionals_to_hide.concat(this_conditionals)
					
				}
				
			}
			
			if (conditionals_to_show.length) {
				
				conditionals_to_show.forEach(function(conditional) {
					
					// console.log('show', conditional)
					
					$('#fw-modal').find(conditional).each(function() {
						
						if ($(this).is(':input')) {
							$(this).closest('.conditional-element-container').show()
						} else {
							$(this).show()
						}
						
					})
					
				})
				
			}
			
			if (conditionals_to_hide.length) {
				
				conditionals_to_hide.forEach(function(conditional) {
					
					// console.log('hide', conditional)
					
					conditional_el = $('#fw-modal').find(conditional)
					
					$('#fw-modal').find(conditional).each(function() {
						
						if ($(this).is(':input')) {
							
							if ($(this).is('[type="checkbox"]')) {
								$(this).prop('checked', false)
							} else {
								$(this).val('')
							}
							
							$(this).trigger('change')
							$(this).closest('.conditional-element-container').hide()
							
						} else {
							
							$(this).hide()
							
						}
							
					})
					
					
				})
				
			}
				
			
		},
		
		check_for_repeaters: function(flatten_data) {
			
			let plugin = this,
					options = plugin.options
			
			let modal_body = $('#fw-modal').find('.modal-body'),
					repeater_forms = {}
			
			flatten_data.forEach(function(input) {
				
				if (
					input.property.includes('[]-index') &&
					modal_body.find('[name="inputs-' + input.property + '"]').parents('.fw-form-repeater').length
				) {
					
					// console.log(input.property + ' is a repeater index')
					
					if (repeater_forms.hasOwnProperty(input.property)) {
						repeater_forms[input.property] += 1
					} else {
						repeater_forms[input.property] = 1
					}
					
					
				}
				
			})
			
			console.log('repeaters', repeater_forms)
			
			if (repeater_forms != {}) {
				
				for (let key in repeater_forms) {
					
					if (repeater_forms[key] > 1) {
						
						// console.log('add ' + repeater_forms[key] + ' rows for inputs-' + key)
						
						for (i = 0; i < repeater_forms[key] - 1; i += 1) {
							
							// console.log(modal_form.find('[name="inputs-' + key + '"]').closest('.fw-form-repeater'))
							
							plugin.add_repeater_row(modal_body.find('[name="inputs-' + key + '"]').closest('.fw-form-repeater'))
							
						}
						
					}
					
				}
				
			}
			
		},
		
		add_repeater_row: function(repeater) {
			
			// console.log(repeater)
			
			let this_row = repeater.find('.fw-form-repeater-row').first(),
					current_rows = parseInt(repeater.attr('data-rows')),
					new_rows = current_rows + 1,
					current_index = current_rows - 1,
					new_index = current_index + 1,
					new_row = this_row.clone()
			
			// console.log(this_row, new_row)
			
			// console.log('current rows', current_rows)
			// console.log('new rows', new_rows)
			// console.log('current index', current_index)
			// console.log('new index', new_index)
			
			repeater.attr('data-rows', new_rows)
			
			new_row.find('[name$="index"]').val(new_index)
			
			new_row.attr('data-row-index', new_index)
			
			new_row.find('.fw-form-repeater-delete-row').removeClass('disabled')
			
			new_row.appendTo(repeater)
			
		},
		
		add_flex_row: function(repeater, content) {
			
			console.log(content)
			
			$.ajax({
				url: ajax_data.url,
				type: 'GET',
				data: {
					action: 'fw_output_flex_row',
					path: content
				},
				success: function(data) {
					
					// console.log(data)
					
					let new_row = $(data)
					
					new_row.appendTo(repeater)
					
				}	
			})
			
		},
		
		get_template: function(parent, element) {
			
			let plugin = this,
					options = plugin.options
			
			console.log('getting template')
			
			console.log('parent data')
			console.log(JSON.stringify(parent.data, null, 2))
			
			// use the parent element's type
			// to figure out which element the template
			// output should start with
			
			let template_start = null
			
			options.hierarchy.forEach(function(level, i) {
				
				if (level == parent.data.type) {
					template_start = options.hierarchy[i + 1]
				}
				
			})
			
			if (element.data.inputs.output == 'copy') {
				
				// get the page object first
				
				$.ajax({
					url: ajax_data.url,
					type: 'GET',
					data: {
						action: 'fw_get_builder_object',
						post_id: element.data.inputs.post_id
					},
					success: function(obj_data) {
						
						obj_data = JSON.parse(obj_data)
						
						// options.page = JSON.parse(obj_data.replaceAll(element.obj_data.inputs.post_id, options.globals.current_query.ID))
						
						// find the first non-autogen child
						
						function find_real_child(obj) {
							if (obj.autogen == undefined || obj.autogen == 'false') {
								return obj
							} else {
								return find_real_child(obj.children[0])
							}
						}
						
						obj_data = find_real_child(obj_data.children[0])
						
						let insert_index = options.inserting.index
						
						if (options.inserting.where !== 'before') {
							insert_index += 1
						}
						
						if (
							options.parent.data.children.length == 0 || 
							options.parent.data.children == undefined
						) {
							
							options.parent.data.children = [ obj_data ]
							
						} else {
							
							// parent.data.children has values already
							// so we need to figure out where to
							// put the new stuff
							
							let deleted_array = options.parent.data.children.splice(insert_index, 0, obj_data)
							
						}
						
						// console.log('children now')
						// console.log(JSON.stringify(options.parent.data.children))
						
						// get the output loop
						
						$.ajax({
							url: ajax_data.url,
							type: 'GET',
							data: {
								action: 'fw_output_loop_ajax',
								globals: options.globals,
								post_id: element.data.inputs.post_id
							},
							success: function(loop_data) {
								
								// let new_html = $(loop_data.replaceAll(source_ID, options.globals.current_query.ID))
								
								// find first non-autogen element
								let new_html = $(loop_data).find('.fw-element:not(.fw-page):not(.fw-auto-generated').first()
								
								let keep_parent = parent
								
								// console.log('keep 1')
								// console.log(JSON.stringify(keep_parent, null, 2))
								
								options.template_html = new_html.prop('outerHTML')
								
								element.data = obj_data
								
								// console.log('new html', new_html.prop('outerHTML'))
								element.item = new_html.prop('outerHTML')
								
								// auto-generate any required parents
								plugin.create_tree(parent, element)
								
								// add the html to the tree
								console.log(options.inserting)
								
								// find the reference item for
								// the inserted element to go before/after
								
								let insert_eq
								
								if (options.inserting.index != null) {
									insert_eq = $('[data-key="' + keep_parent.data.key + '"]').find('> .fw-element').eq(options.inserting.index)
								}
								
								if (
									options.inserting.where != 'append' && 
									options.inserting.index != null
								) {
									
									// if not appending,
									// get the item that sits at insert_index
									
									// insert_eq = $('[data-key="' + keep_parent.data.children[insert_index].key + '"]')
									
								}
								
								// console.log('eq', insert_eq)
								
								switch (options.inserting.where) {
									case 'append' :
										new_html.appendTo(keep_parent.item)
										break
										
									case 'before' :
									
										// console.log('before', insert_eq)
										
										if (insert_eq.length > 0) {
											insert_eq = insert_eq[0]
										}
										
										new_html.insertBefore(insert_eq)
										
										break
										
									case 'after' :
									
										// inserting after
										
										// console.log('after', insert_eq)
										
										if (insert_eq.length > 0) {
											insert_eq = insert_eq[insert_eq.length - 1]
										}
										
										new_html.insertAfter(insert_eq)
										
										break
										
								}
								
								// reindex element keys
								plugin.set_elements_to_move(parent.data)
								plugin.set_element_keys()
								
								// activate new elements
								plugin.activate(keep_parent.data)
								
							}
						})
						
						
					}
				})
				
				
			} else {
					
				// console.log('parent')
				// console.log(JSON.stringify(parent.data, null, 2))
				// console.log('element')
				// console.log(JSON.stringify(element.data, null, 2))
				
				$.ajax({
					url: ajax_data.url,
					type: 'GET',
					data: {
						action: 'fw_output_element_ajax',
						globals: options.globals,
						element: element.data
					},
					success: function(data) {
						
						console.log(data)
						
						// if we're copying elements
						// we need to adjust the element data
						
						if (options.element.data.inputs.output == 'copy') {
							
							options.template_html = data
							
						} else {
						
							let template_key = element.data.inputs.post_id
							
							if (
								element.data.inputs.path != '' && 
								element.data.inputs.path != null
							) {
								template_key = element.data.inputs.path
							}
							
							if (
								element.data.inputs.source == 'post' && 
								element.data.inputs.output == 'template'
							) {
								
								// console.log('something here now')
								
								options.template_html = '<div class="fw-template-label begin" data-template-key="' + template_key + '"></div>' + data + '<div class="fw-template-label end" data-template-key="' + template_key + '"></div>'
								
							} else {
							
								options.template_html = data
								
							}
							
						}
						
						console.log($(data).first())
						
						options.template_first = $(data).first()
						
						// console.log(JSON.stringify(element.data, null, 2))
						// console.log(JSON.stringify(options.element.data, null, 2))
					
					},
					complete: function() {
						
						// the first element in the template
						// becomes the stopping point
						// for auto-generating in create_tree
						
						console.log('done getting template, create tree under ' + options.parent.data.type + ' ' + options.parent.data.key)
						
						console.log(JSON.stringify(element.data, null, 2))
						// console.log(JSON.stringify(options.element.data, null, 2))
						
						// if (element.data.inputs.source == 'post') {
							plugin.create_tree(options.parent, element)
							plugin.insert_element()
						// }
						
					}
				})
				
			}
			
		},
		
		create_tree: function(parent, element) {
			
			let plugin = this,
					options = plugin.options
			
			let start_generating = false,
					temp_parent = options.parent,
					temp_element = null,
					temp_key = options.parent.data.key
			
			console.log('create tree now')
			
			// console.log('start at parent')
			// console.log(JSON.stringify(parent.data, null, 2))
			// 
			// console.log('end before element')
			// console.log(JSON.stringify(element.data, null, 2))
			
			let insert_index = options.inserting.index + 1
			let insert_eq
			
			if (options.inserting.index != null) {
				
				insert_eq = $('[data-key="' + options.parent.data.key + '"]').find('> .fw-element').eq(options.inserting.index)
				
				console.log('eq 1', insert_eq)
			}
			
			let parent_has_changed = false
			
			// object type to compare with elements of options.objects
			
			let comparing_key = element.data.type
						
			if (comparing_key.includes('block/')) {
				comparing_key = 'block'
			} else if (comparing_key == 'new') {
				comparing_key == options.modal.type
			}
			
			if (options.template_first != '' ) {
				
				if (options.element.data.inputs.source == 'include') {
					
					// the first element in the template HTML
					// is not a .fw-element
					// so this is an include
					
					options.template_first = 'include'
					
				} else {
					
					options.template_first = options.template_first.attr('class')
					options.template_first = options.template_first.split('fw-element fw-')[1]
					options.template_first = options.template_first.split(' ')[0]
					
					console.log('template first', options.template_first)
					
				}
				
				comparing_key = options.template_first
				options.template_first = ''
			}
			
			// decide whether any elements need to be auto-generated
			
			if (
				comparing_key != 'include' && 
				options.objects[parent.data.type].child != comparing_key &&
				element.data.type != parent.data.type
			) {
				
				console.log(element.data.type + ' is not a direct child of ' + parent.data.type)
			
				// console.log('creating tree', parent)
				
				// each object type
				
				for (var object_type in options.objects) {
					
					// skip templates
					
					if (object_type == 'template') {
						
						// console.log('skip template')
						
					} else {
						
						if (object_type == options.parent.data.type) {
							
							// found the object type that matches
							// the parent that we're inserting into
							
							start_generating = true
							
						} else if (start_generating == true) {
							
							// the last iteration flagged to start
							// auto-generating
							
							// temp_element that was created last iteration
							// becomes the new temp_parent
							
							if (temp_element != null) {
								options.parent = temp_element
								parent_has_changed = true
							}
							
							// console.log('check ' + object_type)
							
							if (object_type != comparing_key) {
								
								// this type is still a parent
								// of the element that's being inserted
								
								// console.log('temp key', temp_key)
								
								temp_key += '-1'
								
								// console.log('auto-generating ' + object_type + ' in ' + options.parent.data.type)
								
								temp_element = {
									item: $('<div class="' + options.objects[object_type].classes.join(' ') + ' fw-auto-generated" data-key="' + temp_key + '"></div>'), // DOM element to be inserted into page
									data: {
										autogen: true,
										type: object_type,
										key: temp_key,
										inputs: {
											id: 'auto',
											settings: []
										},
										children: []
									}
								}
								
								// find the index of the item before the new item
								
								if (options.parent.data.children.length == 0) {
									
									// add the new item to its parent's children array
									options.parent.data.children = [ temp_element.data ]
									
									temp_parent.item.find('> .fw-insert-into-empty').remove()
									
								} else {
									
									// console.log('insert at index ' + insert_index)
									
									let deleted_array = options.parent.data.children.splice(insert_index, 0, temp_element.data)
									
									// reset keys in parent
									
									// gather elements to move
									plugin.set_elements_to_move(options.parent.data)
									
									// set keys of moving elements
									if (options.elements_to_move != false) {
										plugin.set_element_keys()
									}
									
									temp_key = temp_element.data.key
									
								}
								
								// console.log('adding auto element', temp_element.data.type, temp_element.data.key)
								
								// console.log('to parent', options.parent.data.key)
								
								temp_element.item.appendTo(options.parent.item)
								
								// console.log('new temp_key', temp_key, temp_element.data)
								
								plugin.setup_element(temp_element)
								
								// console.log('created', temp_element)
								// console.log('in', options.parent.data)
								
							} else {
								
								// console.log('end', object_type)
								
								// console.log('temp parent', temp_parent)
								
								start_generating = false
								
								// console.log('parent has changed', parent_has_changed)
								
								if (parent_has_changed == true) {
									
									// the last auto-generated element becomes the parent
									// for the element to be inserted
									
									options.parent = temp_element
									// console.log('parent post', JSON.stringify(options.parent.data))
								}
								
								options.element.data.key = temp_key + '-1'
								
								// options.parent = temp_element
								
								// console.log('done adding parents')
								
								// console.log('page', options.page)
								
								// rebuild the key structure
								// not needed here?
								plugin.set_element_keys()
								
							}
							
						} else {
							
							// console.log('do nothing')
							
						}
						
					}
					
					// console.log('temp parent at end of iteration', temp_parent.data.key)
				}
				
			}
			
			// insert the new element
			
			if (options.template_html != '') {
				
				// HTML retrieved from template
				options.element.item = options.template_html
				
				options.template_html = ''
				
				options.parent.item.addClass('has-template')
				
			} else {
				
				// temp element that we'll set up after
				options.element.item = $('<div>')
				
			}
			
			// console.log(options.element.data)
			// 
			// if (
			// 	options.element.data.type == 'template' &&
			// 	options.element.data.inputs.output == 'copy'
			// ) {
			// 	console.log('do nothing')
			// 	// nothing
			// } else {
			// 	plugin.insert_element()
			// }
			
		},
		
		insert_element: function() {
			
			let plugin = this,
					options = plugin.options
			
			console.log('putting ' + options.element.data.type + ' in ' + options.parent.data.type + ' ' + options.parent.data.key)
			
			console.log('inserting', options.inserting)
			
			// options.parent.item.append('here')
			
			// console.log('element', options.element)
			// console.log('parent', JSON.stringify(options.parent.data, null, 2))
			
			let insert_index = options.inserting.index + 1
			let insert_eq
			
			// if (options.element.data.type == 'template') {
			// 	options.inserting.where = 'append'
			// }
			
			if (!options.parent.data.children.length) {
				console.log('parent doesn\'t have children, append item')
				options.inserting.where = 'append'
			}
			
			if (
				options.inserting.where != 'append' && 
				options.inserting.index != null
			) {
				
				console.log('index', options.inserting.index)
				console.log('children', options.parent.data.children)
				console.log('this', options.parent.data.children[options.inserting.index])
				
				insert_eq = $('[data-key="' + options.parent.data.children[options.inserting.index].key + '"]')
				
				// console.log('eq 2', insert_eq)
				// insert_eq = $('[data-key="' + options.parent.data.key + '"]').find('> .fw-element').eq(options.inserting.index)
			}
			
			let inserted_el
			
			// console.log('item now', typeof options.element.item, options.element.item)
			
			if (typeof options.element.item == 'string') {
				
				console.log('insert string')
				
				// it's a template
				
				inserted_el = $(options.element.item)
				
				// console.log('inserted element', inserted_el)
				
			} else {
				
				console.log('insert obj')
				
				// console.log(options.element.item)
				// console.log(options.element.item.prop('outerHTML'))
				
				// object
				
				inserted_el = $(options.element.item.prop('outerHTML'))
				
				
			}
			
			options.element.item = inserted_el
			
			switch (options.inserting.where) {
				case 'append' :
					
					// console.log('data', JSON.stringify(options.parent.data))
					// console.log('parent item', options.parent.item.prop('outerHTML'))
					// console.log('new item', options.element.item)
					// console.log('new item', options.element.item.prop('outerHTML'))
					
					options.element.item.appendTo(options.parent.item)
					
					// options.parent.item.css('border', '1px solid #f00')
					
					break
					
				case 'before' :
				
					console.log('before', insert_eq)
					insert_index = options.inserting.index
					
					if (insert_eq.length > 0) {
						insert_eq = insert_eq[0]
					}
					
					options.element.item.insertBefore(insert_eq)
					
					break
					
				case 'after' :
				
					console.log('insert', options.element.item)
					console.log('after', insert_eq)
					
					if (insert_eq.length > 0) {
						insert_eq = insert_eq[insert_eq.length - 1]
					}
					
					options.element.item.insertAfter(insert_eq)
					
					break
					
			}
			
			// find the index of the item before the new item
			
			if (options.parent.data.children.length == 0) {
				
				// adding to an empty parent,
				// index doesn't matter
				
				// add the new item to its parent's children array
				options.parent.data.children = [ options.element.data ]
				
				options.parent.item.find('> .fw-insert-into-empty:not(.persistent)').remove()
				
			} else {
				
				// 
				console.log('insert at index ' + insert_index)
				
				let deleted_array = options.parent.data.children.splice(insert_index, 0, options.element.data)
				
				// reset keys in parent
				
				// gather elements to move
				
				plugin.set_elements_to_move(options.parent.data)
				
				// set keys of moving elements
				if (options.elements_to_move != false) {
					plugin.set_element_keys()
				}
				
			}
			
			// SETUP
			
			if (options.element.data.type == 'template') {
			
				// setup inserted element(s) as a template
				
				console.log('setup', options.parent, options.element)
				
				plugin.setup_template(options.parent.data.key, options.element.data)
				
			} else {
				
				// setup inserted element
				
				plugin.setup_element(options.element)
				
				if (!options.element.data.type.includes('block')) {
					
					// the new element is empty,
					// so add an insert button
					
					options.element.item.prepend(plugin.do_insert_btn(options.element.data))
					
				}
				
			}
			
		},
		
		setup_element: function(element) {
			
			let plugin = this,
					options = plugin.options
			
			// console.log('ajax', options.globals, element.data)
			
			$.ajax({
				url: ajax_data.url,
				type: 'GET',
				data: {
					action: 'fw_setup_element_ajax',
					globals: options.globals,
					element: element.data
				},
				dataType: 'json',
				success: function(data) {
					
					// console.log('setup element')
					// console.log('setup element', data)
					
					element.data = {
						...element.data,
						...data
					}
					
					console.log('merged element data', element.data)
					
					// set attributes
					plugin.set_element_atts(element)
			
					// populate block
					
					if (element.data.type.includes('block')) {
						
						element.item.append('<div class="fw-element-inner">')
						
						if (options.element.data.type.includes('block')) {
							plugin.populate_block()
						}
						
					}
					
					// add footer
					plugin.add_footer(element.data)
			
					// settings
					
					if (element.data.autogen !== true) {
						plugin.do_element_settings()
					}
					
					// do we need to insert more than 1 element
					
					if (element.data.children) {
						plugin.activate(element.data)
					}
					
					// reset modal data
					plugin.reset_modal()
					
				}
			})
			
		},
		
		setup_template: function(key, element) {
			
			let plugin = this,
					options = plugin.options
			
			let parent_item = $('body').find('[data-key="' + key + '"]')
			
			if (parent_item.length) {
					
				parent_item.addClass('has-template')
				
				console.log('setup ' + element.key, element.inputs.post_id)
				
				let template_key = element.inputs.post_id
				
				if (element.inputs.path != '' && element.inputs.path != null) {
					template_key = element.inputs.path
				}
				
				let start_label = $('body').find('.fw-template-label.begin[data-template-key="' + template_key + '"]'),
						end_label = $('body').find('.fw-template-label.end[data-template-key="' + template_key + '"]')
				
				// console.log(start_label, end_label)
				
				start_label.html('<span class="text">Begin Template (' + template_key + ')')
				
				// end_label.html('<span class="text"></span>')
				
				plugin.add_footer(element)
				
			}
			
		},
		
		populate_block: function() {
			
			let plugin = this,
					options = plugin.options
			
			let element = options.element,
					parent = options.parent
			
			// console.log('populate block', element.data)
			
			let block_type = element.data.type.split('/').pop()
			
			// console.log('block type', block_type)
			
			switch (block_type) {
				case 'text' :
				
					if (element.data.inputs.text) {
						element.item.find('.fw-element-inner').html(plugin.unescape(element.data.inputs.text[options.lang]))
					}
					
					break
			
				case 'image' :
				
					let img_urls = JSON.parse(element.data.inputs.file.url)
				
					element.item.find('.fw-element-inner').html('<img src="' + img_urls.full + '">')
					
					break
					
				default :
				
					console.log('output', element.data, options.globals)
			
					$.ajax({
						url: ajax_data.url,
						type: 'GET',
						data: {
							action: 'fw_output_element_ajax',
							element: element.data,
							globals: options.globals
						},
						success: function(data) {
							
							// console.log(data)
							
							let new_markup = $(plugin.unescape(data))
							
							element.item.find('.fw-element-inner').html(new_markup.find('.fw-element-inner').html())
							
							$(document).trigger('fw_populate_block', options.element)
							
						}
					})
					
			}
			
			
		},
		
		activate: function(parent) {
			
			let plugin = this,
					options = plugin.options
					
			if (!parent) {
				parent = options.page
			}
			
			console.log('activate', parent)
			
			if (
				parent.type == 'page' &&
				!parent.children
			) {
				
				// blank page
				
				$('.fw-element[data-key="' + parent.key + '"]').append(plugin.do_insert_btn(options.page))
				
			}
			
			// if (parent.type == 'template') {
			// 	plugin.add_footer()
			// }
			
			if (parent.children) {
				
				parent.children.forEach(function(child, i) {
					
					// console.log(child.key)
					
					// find the item
					
					let this_item = $('body').find('.fw-element[data-key="' + child.key + '"]')
					
					// console.log('activate', child)
					
					// if the element is empty,
					// add an insert button
					
					if (!this_item.children().length) {
						this_item.prepend(plugin.do_insert_btn(child))
					}
					
					// add footer
					
					plugin.add_footer(child)
					
					if (
						child.type == 'template' && 
						child.inputs.output == 'template'
					) {
						plugin.setup_template(child.key.slice(0, -2), child)
					}
					
					if (child.children) {
						
						// recursive
						plugin.activate(child)
						
					}
					
					// console.log(child.key, "✅")
					
				})
				
			}
			
			if (
				parent.children == undefined || 
				(
					parent.children != undefined &&
					!parent.children.length
				)
			) {
			
				// $('.fw-element[data-key="' + parent.key + '"]').append(plugin.do_insert_btn(options.page))
				
			}
			
		},
		
		do_element_settings: function() {
			
			let plugin = this,
					options = plugin.options
			
			console.log('do settings')
			
			// remove
			
			// console.log('removed settings', options.data.removed_settings)
			
			if (options.data.removed_settings.length) {
				
				options.data.removed_settings.forEach(function(key) {
				
					console.log('remove setting', key)
					
					switch (key) {
						
						case 'aos' :
						
							// options.element.item.removeAttr('data-aos')
							// 	.removeAttr('data-aos-easing')
							// 	.removeAttr('data-aos-offset')
							// 	.removeAttr('data-aos-duration')
							// 	.removeAttr('data-aos-delay')
							// 	.removeAttr('data-aos-anchor')
							// 	.removeAttr('data-aos-once')
							// 	
							// AOS.refresh()
							
							break
							
						case 'offcanvas' :
							
							console.log('remove offcanvas', options.element.item.attr('id'))
							
							$('body').find('[data-bs-target="#' + options.element.item.attr('id') + '"]').remove()
							
							$('#' + options.element.item.attr('id')).offcanvas('hide')
							
							break
							
					}
					
				})
				
				options.data.removed_settings = []
				
			}
			
			// add
			
			if (options.element.data.inputs.settings != undefined) {
				
				options.element.data.inputs.settings.forEach(function(setting) {
					
					for (var key in setting) {
						
						let this_setting = setting[key]
						
						console.log('add new setting', this_setting)
						
						// setting contains a repeater
						
						if (this_setting.rows != undefined) {
							
							let new_class = ''
							
							this_setting.rows.forEach(function(this_row) {
							
								// console.log(this_setting.type, this_row)
								
								switch (this_setting.type) {
									case 'spacing' :
									
										new_class += this_row.property + this_row.side
										
										new_class += (this_row.breakpoint != '') ? '-' + this_row.breakpoint : ''
											
										new_class += '-' + this_row.value.replace('-', 'n')
											+ ' '
										
										// console.log(new_class)
										
										break
										
									case 'attributes' :
									
										options.element.item.attr('data-' + this_row.name, this_row.value)
									
										break
										
								}
								
							})
							
							options.element.item.addClass(new_class)
							
						}
						
						switch (key) {
							
							case 'colors' :
								
								if (this_setting.bg != '') {
									options.element.item.addClass('bg-' + this_setting.bg)
								}
								
								if (this_setting.text != '') {
									options.element.item.addClass('text-' + this_setting.text)
								}
									
								break
						
							case 'background' :
								
								
								let bg_el,
										bg_urls = JSON.parse(this_setting.file.url)
								
								// element class
								
								options.element.item.addClass('has-bg')
								
								// set the image src
								
								if (options.element.item.find('> .fw-bg').length) {
									
									bg_el = options.element.item.find('> .fw-bg')
									bg_el.removeClass().addClass('fw-bg')
									
								} else {
									
									bg_el = $('<div class="fw-bg">').prependTo(options.element.item)
									
								}
								
								bg_el.attr('style', 'background-image: url(' + bg_urls.full + ')')
									.addClass('bg-position-' + this_setting.position.replace(' ', '-'))
									.addClass('bg-attachment-' + this_setting.attachment)
									.addClass('bg-size-' + this_setting.size)
									.addClass('bg-opacity-' + parseFloat(this_setting.opacity) * 100)
								
								break
								
							case 'aos' :
								
								for (var option in this_setting) {
									
									console.log(option, this_setting[option])
									
									let this_att = 'data-aos-' + option
									
									if (option == 'effect') {
										this_att = 'data-aos'
									}
									
									// if (option == 'once') {
									// 	console.log(option, this_setting[option])
									// }
									
									// console.log('add ' + option + ' to', options.element.item)
									
									if (this_setting[option] == '') {
										// options.element.item.removeAttr(this_att)
									} else {
										// options.element.item.attr(this_att, this_setting[option])
									}
									
									// AOS.refresh()
								
								}
								
								break
								
							case 'offcanvas' :
								
								
							
								break
								
						}
						
					} // each setting
					
				})
				
			} // if settings
			
		},
		
		set_element_atts: function(element) {
			
			let plugin = this,
					options = plugin.options

			let element_item = element.item,
					element_data = element.data
					
			// console.log('update atts', element)
			
			let element_type = element.data.type
			
			if (element_type.includes('/')) {
				element_type = element.data.type.split('/')[0]
			}
			
			let element_classes = [ ...options.objects[element_type].classes ]
			// let element_classes = [ ...element.attr('class').split(' ') ]
			
			switch ( element.data.type ) {
				case 'page' :
				
					console.log('page')
					if (element.data.inputs.title[options.lang] != '') {
						
						document.title = element.data.inputs.title[options.lang]
						
					}
					
					break
				
				case 'container' :
					break
					
				case 'row' :
					break
					
				case 'column' :
				
					element_classes = [
						...element_classes, 
						...plugin.generate_column_classes(element.data.inputs.breakpoints, 'array')
					]
					
					break
					
				case 'block' :
				
					// element.item.attr('data-block-cat', element.data.cat)
					break
					
			}
			
			// ID
			
			if (element.data.inputs.id == 'auto') {
				
				if (element.data.type != 'page') {
					element.item.attr('id', 'element-' + element.data.key)
				}
				
			} else {
				element.item.attr('id', element.data.inputs.id)
			}
			
			// key
			
			element.item.attr('data-key', element_data.key)
			
			// classes
			
			// console.log(element_data.inputs.class)
			
			if (element.data.inputs.class) {
				
				// only update the class if the input has changed
				
				element_classes = [ ...element_classes, ...element.data.inputs.class]
				element.item.attr('class', element_classes.join(' '))
				
			}
			
		},
		
		add_footer: function(element) {
			
			let plugin = this,
					options = plugin.options
			
			// console.log('footer', element)
			
			let element_type = element.type
			
			if (element_type.includes('/')) {
				element_type = element.type.split('/')[0]
			}
			
			// let element = options.element
					
			// let element_data = item.data()
			
			let this_item = $('body').find('[data-key="' + element.key + '"]'),
					this_item_ID = this_item.attr('id')
			
			if (element.type == 'template') {
				
				let this_template_key = (element.inputs.source == 'post') ? element.inputs.post_id : element.inputs.path
				
				this_item = $('body').find('.fw-template-label.end[data-template-key="' + this_template_key + '"]')
				
				this_item_ID = 'template-' + this_template_key
				
			}
			
			if (this_item.find('> .fw-element-footer').length) {
				this_item.find('> .fw-element-footer').remove()
			}
					
			// console.log('footer', element, this_item)
			
			let footer = $('<div class="fw-element-footer">'),
					footer_inner = $('<div class="fw-element-footer-inner">').appendTo(footer),
					dropdown = $('<div id="dropdown-' + this_item_ID + '" class="dropdown fw-element-footer-section">').appendTo(footer_inner)
					
			// dropdown button
			
			let dropdown_btn = '<div class="dropdown-toggle d-flex align-items-center" type="button" data-bs-toggle="dropdown" aria-expanded="false">'
			
				dropdown_btn += '<ul class="element-footer-keys list-group list-group-horizontal me-2">'
					// dropdown_btn += '<li class="list-group-item element-key">' + element.key + '</li>'
					
					// if (element.inputs.id != 'auto') {
					// 	dropdown_btn += '<li class="list-group-item text-bg-secondary">#' + element.inputs.id + '</li>'
					// }
					
				dropdown_btn += '</ul>'
				
				dropdown_btn += element_type
			
			dropdown_btn += '</div>'
			
			$(dropdown_btn).appendTo(dropdown)
			
			// menu
			
			let dropdown_menu = $('<ul class="dropdown-menu">').appendTo(dropdown)
			
			// action icons
			
			let actions_container = $('<div class="fw-footer-edit-btns row px-2">').appendTo(dropdown_menu)
			
			// edit
			
			$('<li class="col fw-footer-edit-link edit"><a href="#fw-modal" class="fw-modal-trigger fw-btn edit-element d-flex flex-column align-items-center justify-content-between" data-modal-content="' + element.type + '"><div><i class="far fa-pencil-alt"></i></div><span>Edit</span></a></li>').appendTo(actions_container)
			
			// duplicate
			
			$('<li class="col fw-footer-edit-link duplicate"><a href="#" class="fw-btn duplicate-element d-flex flex-column align-items-center justify-content-between" data-modal-content="duplicate" data-type="' + element.type + '"><div><i class="far fa-copy"></i></div><span>Duplicate</span></a></li>').appendTo(actions_container)
			
			// delete
			
			$('<li class="col fw-footer-edit-link delete"><a href="#fw-modal" class="fw-modal-trigger fw-btn delete-element d-flex flex-column align-items-center justify-content-between" data-modal-content="delete" data-type="' + element.type + '"><div><i class="far fa-trash-alt"></i></div><span>Delete</span></a></li>').appendTo(actions_container)
			
			// move
			
			$('<li class="col fw-footer-edit-link move"><div class="d-flex flex-column align-items-center justify-content-between"><div class="d-flex align-items-center"><i class="far fa-arrow-up fw-btn move-element move-up"></i><i class="far fa-arrow-down fw-btn move-element move-down"></i></div><span>Move</span></li>').appendTo(actions_container)
			
			dropdown_menu.append('<li><hr class="dropdown-divider"></li>')
			
			// new element above/below
			
			let new_btns = ''
			
			// add insert link if possible
			
			if (options.objects[element_type].child) {
				
				new_btns += '<a href="#fw-modal" class="btn btn-outline-secondary fw-modal-trigger fw-btn insert-element insert-into" data-modal-content="new" data-type="' + element_type + '">Insert</a>'
				
			}
			
			new_btns += '<a href="#fw-modal" class="btn btn-outline-secondary fw-modal-trigger fw-btn insert-element insert-before" data-modal-content="new" data-type="' + element_type + '">Before</a>'
			
			new_btns += '<a href="#fw-modal" class="btn btn-outline-secondary fw-modal-trigger fw-btn insert-element insert-after" data-modal-content="new" data-type="' + element_type + '">After</a>'
			
			dropdown_menu.append('<h6 class="dropdown-header text-body">New Element</h6>')
			dropdown_menu.append('<li class="dropdown-item"><div class="btn-group btn-group-sm" role="group">' + new_btns + '</div></li>')
			
			// add buttons for different types
			
			switch (element.type) {
				case 'template' :
					
					if (element.inputs.source == 'post') {
						footer_inner.append('<a href="/?p=' + element.inputs.post_id + '" class="p-1" target="_blank">Edit template <i class="fas fa-external-link ms-1"></i></a>')
					}
					
					break
					
				case 'column' :
				
					let breakpoint_btn = '<div class="footer-breakpoint fw-element-footer-section text-truncate">' + plugin.generate_column_classes(element.inputs.breakpoints) + '</div>'
					
					footer_inner.append(breakpoint_btn)
					
					break
					
			}
			
			dropdown_menu.append('<li><hr class="dropdown-divider"></li>')
			
			let dropdown_meta = $('<div class="fw-footer-meta px-3">').appendTo(dropdown_menu)
			
			let meta_items = '<span class="element-type">' + element_type.charAt(0).toUpperCase() + element_type.slice(1) + '</span><span class="badge element-key text-bg-light border ms-2">' + element.key + '</span>'
			
			if (element.inputs.id != 'auto') {
				
				meta_items += '<span class="badge element-id bg-secondary ms-2">#' + element.inputs.id + '</li>'
				
			}
			
			meta_items += '</ul>'
			
			dropdown_meta.html(meta_items)
			
			this_item.append(footer)
			
			plugin.add_listeners(this_item)
			
			// return footer
			
		},
		
		do_insert_btn: function(element, keep = false) {
			
			let plugin = this,
					options = plugin.options
					
			// console.log('insert dropdown', element.type)
			
			let insert_dropdown = $('<div class="dropdown fw-insert-into-empty"><button class="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown"><span class="plus">+</span>Insert</button>')
			
			if (keep == true) {
				
				insert_dropdown.addClass('persistent')
				
			}
			
			let insert_menu = $('<ul class="dropdown-menu">').appendTo(insert_dropdown)
			
			let insert_btns = ''
			
			let start_adding = false
			
			Object.keys(options.objects).forEach(function(key) {
				
				if (key == element.type) {
					start_adding = true
				}
				
				if (key == 'template') {
					
					insert_btns += '<li><a href="#fw-modal" class="fw-modal-trigger dropdown-item fw-btn insert-element insert-into" data-modal-content="template" data-type="template">template</a></li>'
					
				} else if (options.objects[key].child && start_adding == true) {
					
					insert_btns += '<li><a href="#fw-modal" class="fw-modal-trigger dropdown-item fw-btn insert-element insert-into" data-modal-content="' + options.objects[key].child + '" data-type="' + options.objects[key].child + '">' + options.objects[key].child + '</a></li>'
					
				}
				
			})
			
			insert_menu.append(insert_btns)
			
			return insert_dropdown
			
		},
		
		modal_get_form: function() {
			
			let plugin = this,
					options = plugin.options
			
			// console.log('populate modal', options.modal, options.element)
			
			if (options.modal.content == null) {
				
				return false
				
			} else {
				
				$.ajax({
					url: ajax_data.url,
					type: 'GET',
					data: {
						action: 'fw_modal_settings',
						globals: options.globals,
						content: options.modal.content,
					},
					success: function(data) {
						
						// console.log(data)
						
						let modal_content = $('#fw-modal .modal-content')
						
						modal_content.html(data)
						
						let modal_body = $('#fw-modal').find('.modal-body')
						
						// setup repeaters
						
						modal_body.find('.fw-form-repeater-delete-row').first().addClass('disabled')
						
						// adjust settings dropdown options
						
						if (modal_body.find('.dropdown-toggle').length) {
							
							modal_body.find('.dropdown-toggle').each(function() {
								
								let modal_dropdown = new bootstrap.Dropdown(document.querySelector('#' + $(this).attr('id')), {
									popperConfig: function (defaultBsPopperConfig) {
										return { strategy: 'fixed' }
									}
								})
								
							})
							
						}
						
						//
						// MODAL CONTENT:
						//
						
						if (options.modal.content == 'new') {
							
							console.log('new')
							
							// NEW
							
							// if this is the new element list
							// remove elements that come before this type
							// i.e. if adding a column, remove row, container & section
							
							if (options.modal.type != 'template') {
								this_list_item = modal_body.find('.list-group-item[data-modal-content="' + options.modal.type + '"]')
								
								// remove elements before
								this_list_item.prevAll().remove()
								
								// if inserting, remove this too
								if (
									options.status == 'inserting' && 
									options.inserting.where == 'append'
								) {
									this_list_item.remove()
								}
							}
							
						} else if (options.modal.content == 'block') {
							
							
							
						} else {
						
							// FIELD GROUP
							
							plugin.modal_init_form()
						
						}
						
						//
						// STATUS:
						//
						
						if (options.status == 'saving') {
							
							plugin.update_post()
							
						} else if (options.status == 'inserting') {
							
							// INSERTING
							
							$('#fw-modal .modal-title-action').text('New')
							
						} else if (options.status == 'editing') {
							
							// EDITING
							
							// options.editing.form = $('#fw-modal').find('form')
							$('#fw-modal').find('.fw-settings-submit').text('Update')
							
							if (options.element.data.inputs.id != 'auto') {
								$('#fw-modal .modal-title-content').html('<span class="badge text-bg-light me-2">#' + options.element.data.inputs.id + '</span>')
							} else {
								$('#fw-modal .modal-title-action').text('Edit')
							}
							
							// populate fields
							
							// plugin.edit_form_build()
							
						}
						
						modal_body.find('[data-form-condition]').each(function() {
							plugin.toggle_conditionals($(this))
						})
						
						
						
					},
					error: function() {
						
						$('#fw-modal .modal-content').html(''
							+ '<div class="modal-header">'
								+ '<h5 class="modal-title">Something went wrong</h5>'
								+ '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>'
							+ '</div>'
							+ '<div class="modal-body">'
								+ '<p>You may not be logged in anymore. If you have unsaved changes, <a href="/admin/" target="_blank">login in a new tab</a> and try again.</p>'
							+ '</div>'
						)
						
					}
				})
				
			}
			
		},
		
		do_uploader: function(container) {
			
			let plugin = this,
					options = plugin.options
			
			console.log('uploader', container)
			
			let uploader = options.uploader
			
			uploader.options = JSON.parse(container.attr('data-uploader-options'))
			uploader.type = container.attr('data-uploader-type')
			uploader.elements.file_id = container.find('.uploader-file-id')
			uploader.elements.url = container.find('.uploader-file-url')
			uploader.elements.button = container.find('.element-form-upload-btn')
			uploader.elements.placeholder = container.find('.image-placeholder')
			uploader.img_url = {}
			
			console.log('options', uploader)
			
			// console.log('type', uploader_type)
			// console.log('inputs', upload_id_input, upload_url_input)
			// console.log('placeholder', img_placeholder)
			
			
			uploader.object = wp.media(uploader.options).on('select', function() {
				
				uploader.attachment = uploader.object.state().get('selection').first().toJSON()
				
				// set hidden image ID input
				uploader.elements.file_id.val(uploader.attachment.id).trigger('change')
				
				// console.log(attachment)
				
				// set URL and placeholder
				
				if (uploader.elements.placeholder.length) {
						
					uploader.img_url.full = uploader.attachment.url
					
					uploader.placeholder_src = uploader.img_url.full
					
					if (uploader.attachment.sizes.thumbnail) {
						uploader.img_url.thumbnail = uploader.attachment.sizes.thumbnail.url
					}
					
					if (uploader.attachment.sizes.medium) {
						uploader.img_url.medium = uploader.attachment.sizes.medium.url
						
						uploader.placeholder_src = uploader.img_url.medium
					}
					
					if (uploader.attachment.sizes.large) {
						uploader.img_url.thumbnail = uploader.attachment.sizes.large.url
					}
					
					uploader.elements.placeholder.html('<img src="' + uploader.placeholder_src + '">')
					
					uploader.elements.url.val(JSON.stringify(uploader.img_url))
					
					// change button text
					uploader.elements.button.text('Replace Image')
					
				} else {
					
					uploader.elements.url.val(JSON.stringify({ full: uploader.attachment.url }))
					
				}
				
				// uploader.elements.button.addClass('disabled')
				// remove_btn.removeClass('d-none')
				
			}).on('open', function() {
			
				if (uploader.elements.file_id.val()) {
					
					selection = uploader.object.state().get('selection')
					uploader.attachment = wp.media.attachment(uploader.elements.file_id.val())
					uploader.attachment.fetch()
					selection.add( uploader.attachment ? [uploader.attachment] : [] )
					
				}
				
			})
			
			if (uploader.elements.file_id.val() != '') {
				
				console.log(uploader.elements.file_id.val())
				
				// element has an ID set
				
				if (uploader.elements.placeholder.length) {
					
					// there's also an image placeholder
				
					// grab the best image size and set the placeholder
					
					let img_urls = JSON.parse(uploader.elements.url.val())
					
					uploader.placeholder_src = img_urls.full
					
					if (img_urls.medium) {
						uploader.placeholder_src = img_urls.medium
					}
					
					uploader.elements.placeholder.html('<img src="' + uploader.placeholder_src + '">')
					
					// change button text
					uploader.elements.button.text('Replace image')
					
				} else {
					
					// change button text
					uploader.elements.button.text('Replace file')
					
				}
				
			}
			
			uploader.object.open()
			
		},
		
		modal_init_form: function() {
			
			let plugin = this,
					options = plugin.options
			
			let modal_body = $('#fw-modal').find('.modal-body'),
					modal_form = $('#fw-modal').find('form')
					
			console.log('---')
			console.log('init form')
			
			//
			// ADD UX FEATURES
			//
			
			// CONTENT TYPES:
					
			// block/content/text
			
			if (modal_body.find('.editor').length) {
				
				quicktags({ id: 'inputs-text-' + options.lang })
				
				tinymce.execCommand('mceAddEditor', false, 'inputs-text-' + options.lang)
				
				// console.log('destroy editor')
				
				// console.log(tinymce)
				
				// destroy the tinymce editor
				// tinymce.execCommand('mceRemoveEditor', false, 'inputs-text-' + options.lang)
				
				// setTimeout(function() {
					
					// re-init
					// not happy about the timeout
					
					console.log('init mce', 'inputs-text-' + options.lang)
					
					// console.log(options.element.data.inputs)
					// console.log(options.element.data.inputs['text-' + options.lang])
					// 
					// if (typeof options.element.data.inputs['text-' + options.lang] != 'undefined') {
					// 	
					// 	console.log('yaahhh', tinymce.get('inputs-text-' + options.lang))
					// 	
					// 	tinymce.get('inputs-text-' + options.lang).setContent(plugin.unescape(options.element.data.inputs['text-' + options.lang]))
					// 	
					// }
					
				// }, 150)
				
			}
			
			// uploader
			
			modal_body.on('click', '.element-form-upload-btn', function(e) {
				e.preventDefault()
				
				console.log('upload')
				
				plugin.do_uploader($(this).closest('.uploader-container'))
				
			})
			
			if (modal_body.find('.element-form-upload-btn').length) {
				
				// let upload_btn = modal_body.find('.element-form-upload-btn'),
				// 		uploader.options = {
				// 			title: 'Insert image',
				// 			library: {
				// 				type: 'image'
				// 			},
				// 			button: {
				// 				text: 'Use this image'
				// 			},
				// 			multiple: false
				// 		},
				// 		upload_id_input = modal_body.find('[name="inputs-file-id"]'),
				// 		upload_url_input = modal_body.find('[name="inputs-file-url"]'),
				// 		img_placeholder = modal_body.find('.image-placeholder'),
				// 		placeholder_src,
				// 		img_url = {},
				// 		attachment,
				// 		selection
			
					// 
					// // uploader
					// 
					// if (modal_body.find('.element-form-upload-btn').length) {
					// 	
					// 	let upload_btn = modal_body.find('.element-form-upload-btn'),
					// 			uploader_options = {
					// 				title: 'Insert image',
					// 				library: {
					// 					type: 'image'
					// 				},
					// 				button: {
					// 					text: 'Use this image'
					// 				},
					// 				multiple: false
					// 			},
					// 			upload_id_input = modal_body.find('[name="inputs-file-id"]'),
					// 			upload_url_input = modal_body.find('[name="inputs-file-url"]'),
					// 			img_placeholder = modal_body.find('.image-placeholder'),
					// 			placeholder_src,
					// 			img_url = {},
					// 			attachment,
					// 			selection
					// 	
					// 	switch (options.modal.content) {
					// 		case 'block/content/image' :
					// 			
					// 			break
					// 			
					// 		case 'block/content/animation' :
					// 		
					// 			uploader_options = {
					// 				title: 'Upload Lottie Animation',
					// 				library: {
					// 					type: 'application/json'
					// 				},
					// 				button: {
					// 					text: 'Select'
					// 				},
					// 				multiple: false
					// 			}
					// 		
					// 			break
					// 		
					// 		
					// 		
					// 	}
					// 	
					// 	plugin.uploader = wp.media(uploader_options).on('select', function() {
					// 		
					// 		attachment = plugin.uploader.state().get('selection').first().toJSON()
					// 		
					// 		// set hidden image ID input
					// 		upload_id_input.val(attachment.id)
					// 		
					// 		console.log(attachment)
					// 		
					// 		// set URL and placeholder
					// 		
					// 		if (img_placeholder.length) {
					// 				
					// 			img_url.full = attachment.url
					// 			
					// 			placeholder_src = img_url.full
					// 			
					// 			if (attachment.sizes.thumbnail) {
					// 				img_url.thumbnail = attachment.sizes.thumbnail.url
					// 			}
					// 			
					// 			if (attachment.sizes.medium) {
					// 				img_url.medium = attachment.sizes.medium.url
					// 				
					// 				placeholder_src = img_url.medium
					// 			}
					// 			
					// 			if (attachment.sizes.large) {
					// 				img_url.thumbnail = attachment.sizes.large.url
					// 			}
					// 			
					// 			img_placeholder.html('<img src="' + placeholder_src + '">')
					// 			
					// 			upload_url_input.val(JSON.stringify(img_url))
					// 			
					// 			// change button text
					// 			upload_btn.text('Replace Image')
					// 			
					// 		} else {
					// 			
					// 			upload_url_input.val(JSON.stringify({ full: attachment.url }))
					// 			
					// 		}
					// 		
					// 		// upload_btn.addClass('disabled')
					// 		// remove_btn.removeClass('d-none')
					// 		
					// 	}).on('open', function() {
					// 	
					// 		if (upload_id_input.val()) {
					// 			
					// 			selection = plugin.uploader.state().get('selection')
					// 			attachment = wp.media.attachment(upload_id_input.val())
					// 			attachment.fetch()
					// 			selection.add( attachment ? [attachment] : [] )
					// 			
					// 		}
					// 		
					// 	})
					// 	
						// if (upload_id_input.val() != '') {
						// 	
						// 	// element has an ID set
						// 	
						// 	if (img_placeholder.length) {
						// 		
						// 		// there's also an image placeholder
						// 	
						// 		// grab the best image size and set the placeholder
						// 		
						// 		let img_urls = JSON.parse(upload_url_input.val())
						// 		
						// 		placeholder_src = img_urls.full
						// 		
						// 		if (img_urls.medium) {
						// 			placeholder_src = img_urls.medium
						// 		}
						// 		
						// 		img_placeholder.html('<img src="' + placeholder_src + '">')
						// 		
						// 		// change button text
						// 		upload_btn.text('Replace image')
						// 		
						// 	} else {
						// 		
						// 		// change button text
						// 		upload_btn.text('Replace file')
						// 		
						// 	}
						// 	
						// }
					// 	
					// 	upload_btn.click(function(e) {
					// 		e.preventDefault()
					// 		
					// 		plugin.uploader.open()
					// 	
					// 	})
					// 	
					// 	
					}
					
					// /image
					
			// 		if (options.modal.content == 'block/content/image') {
			// 			
			// 			let upload_btn = modal_body.find('.element-form-upload-btn'),
			// 					remove_btn = modal_body.find('.image-remove'),
			// 					img_placeholder = modal_body.find('.image-placeholder'),
			// 					image_id_val = modal_body.find('[name="inputs-file-id"]'),
			// 					image_url_val = modal_body.find('[name="inputs-file-url"]'),
			// 					img_url = {},
			// 					placeholder_src,
			// 					attachment,
			// 					selection
			// 					
			// 			plugin.uploader = wp.media({
			// 				title: 'Insert image',
			// 				library: {
			// 					type: 'image'
			// 				},
			// 				button: {
			// 					text: 'Use this image'
			// 				},
			// 				multiple: false
			// 			}).on( 'select', function() {
			// 				
			// 				attachment = plugin.uploader.state().get('selection').first().toJSON()
			// 				
			// 				img_url.full = attachment.url
			// 				
			// 				placeholder_src = img_url.full
			// 				
			// 				console.log(attachment)
			// 				
			// 				if (attachment.sizes.thumbnail) {
			// 					img_url.thumbnail = attachment.sizes.thumbnail.url
			// 				}
			// 				
			// 				if (attachment.sizes.medium) {
			// 					img_url.medium = attachment.sizes.medium.url
			// 					
			// 					placeholder_src = img_url.medium
			// 				}
			// 				
			// 				if (attachment.sizes.large) {
			// 					img_url.thumbnail = attachment.sizes.large.url
			// 				}
			// 				
			// 				img_placeholder.html('<img src="' + placeholder_src + '">')
			// 				
			// 				// upload_btn.addClass('disabled')
			// 				// remove_btn.removeClass('d-none')
			// 				
			// 				// set hidden image input
			// 				image_id_val.val(attachment.id)
			// 				image_url_val.val(JSON.stringify(img_url))
			// 				
			// 			}).on('open', function() {
			// 			
			// 				if (image_id_val.val()) {
			// 					
			// 					selection = plugin.uploader.state().get('selection')
			// 					attachment = wp.media.attachment(image_id_val.val())
			// 					attachment.fetch()
			// 					selection.add( attachment ? [attachment] : [] )
			// 					
			// 				}
			// 				
			// 			})
			// 
			// 			if (image_url_val.val() != '') {
			// 				console.log(image_url_val.val())
			// 				
			// 				let img_urls = JSON.parse(image_url_val.val())
			// 				
			// 				placeholder_src = img_urls.full
			// 				
			// 				if (attachment.sizes.medium) {
			// 					placeholder_src = attachment.sizes.medium.url
			// 				}
			// 				
			// 				img_placeholder.html('<img src="' + placeholder_src + '">')
			// 				
			// 			}
			// 		
			// 			upload_btn.click(function(e) {
			// 				e.preventDefault()
			// 				
			// 				plugin.uploader.open()
			// 			
			// 			})
			// 			
			// 			// remove
			// 			
			// 			remove_btn.click(function(e) {
			// 				
			// 				e.preventDefault()
			// 				
			// 				// upload_btn.removeClass('disabled')
			// 				// remove_btn.addClass('d-none')
			// 				
			// 				img_placeholder.empty()
			// 				image_id_val.val('')
			// 				image_url_val.val('')
			// 				
			// 			})
			// 			
			// 		}
					
					// /animation
					
					// if (options.modal.content == 'block/content/animation') {
					// 	
					// 	let upload_id_input = modal_body.find('[name="inputs-animation-id"]'),
					// 			upload_url_input = modal_body.find('[name="inputs-animation-url"]'),
					// 			attachment,
					// 			selection
					// 			
					// 	plugin.uploader = wp.media({
					// 		title: 'Upload Animation',
					// 		library: {
					// 			type: 'application/json'
					// 		},
					// 		button: {
					// 			text: 'Select'
					// 		},
					// 		multiple: false
					// 	}).on('select', function() {
					// 		
					// 		attachment = plugin.uploader.state().get('selection').first().toJSON()
					// 		
					// 		console.log('select', attachment)
					// 		
					// 		// set hidden image input
					// 		upload_id_input.val(attachment.id)
					// 		upload_url_input.val(attachment.url)
					// 		
					// 	}).on('open', function() {
					// 	
					// 		if (upload_id_input.val()) {
					// 			
					// 			selection = plugin.uploader.state().get('selection')
					// 			attachment = wp.media.attachment(upload_id_input.val())
					// 			attachment.fetch()
					// 			selection.add( attachment ? [attachment] : [] )
					// 			
					// 		}
					// 		
					// 	})
					// 	
					// 	
					// 	modal_body.find('.element-form-upload-btn').click(function(e) {
					// 		e.preventDefault()
					// 		
					// 		plugin.uploader.open()
					// 	
					// 	})
					// 	
					// }
					
					// /navigation
					
					// /menu
					
					// DISPLAY MENU
					// set the modal's data-display attribute
					// to show/hide relevant field sets with CSS
					
					if ($('#fw-modal').find('.fw-display-select').length) {
						
						let first_display_option = $('#fw-modal').find('.fw-display-select').first().val()
						
						$('#fw-modal').attr('data-display', first_display_option)
						
					}
					
			
			
			//
			// ADD EXISTING DATA
			//
			
			if (typeof options.element.data.inputs != 'undefined') {
			
				let flatten_data = plugin.flatten(options.element.data.inputs)
				
				// console.log('form data', JSON.stringify(element_data))
				
				// console.log('inputs', options.element.data.inputs)
				console.log('flat', flatten_data)
				
				let flex_forms = [],
						repeater_forms = {}
				
				// check for flex forms to complete the modal body
				
				flatten_data.forEach(function(input) {
				
					// check the property name
					
					if (
						input.property.includes('[]') && 
						input.property.includes('type')
					) {
						
						// it's a flex
						
						let flex_container = modal_form.find('.fw-form-flex-container[data-input="' + input.property.split('[]')[0] + '"]')
						
						let flex_path = flex_container.attr('data-path') + '/' + input.value
						
						// console.log('path', flex_path)
						
						flex_forms.push({
							path: flex_path,
							container: flex_container
						})
						
					}
				
				})
				
				
				// unique
				
				flex_forms = [ ...new Set(flex_forms) ]
				
				// if flex forms exist,
				// pull their templates before
				// populating the fields
				
				console.log('flex forms', flex_forms)
				
				if (flex_forms.length > 0) {
					
					let allAJAX = flex_forms.map(flex_form => {
						
						// console.log('getting ' + flex_form.path)
						
						return plugin.get_flex_form(flex_form.container, flex_form.path)
						
					})
					
					Promise.all(allAJAX).then(function() {
						
						console.log('done getting flex forms')
						
						// now check for repeaters
						plugin.check_for_repeaters(flatten_data)
						
						console.log('populate now')
						plugin.modal_populate_fields(flatten_data)
						
					})
					
				} else {
					
					// no flex fields to get
					
					// check for repeaters
					plugin.check_for_repeaters(flatten_data)
					
					// populate fields
					plugin.modal_populate_fields(flatten_data)
					
				}
				
				modal_body.find('.fw-sortable').each(function() {
					
					$(this).sortable({
						placeholder: "ui-state-highlight",
						handle: '.card-header',
						forcePlaceholderSize: true,
						stop: function(e, ui) {
							
							plugin.reindex_flex($(this).closest('.fw-form-flex-container'))
							
						}
					})
					
					$(this).disableSelection()
					
				})
				
			}
			
			console.log('init form', 'done')
			
		},
		
		modal_populate_fields: function(flatten_data) {
			
			console.log('---')
			console.log('populate fields')
			console.log('flattened data', flatten_data)
			
			let plugin = this,
					options = plugin.options
			
			let modal_body = $('#fw-modal').find('.modal-body'),
					modal_form = $('#fw-modal').find('form')
			
			// individual inputs
			
			let repeater_index = -1,
					flex_index = -1,
					flex_type = null
			
			flatten_data.forEach(function(input) {
				
				let this_input = modal_form.find('[name="inputs-' + input.property + '"]'),
						this_val = input.value
						
				if (
					input.property.includes('rows[]') &&
					repeater_index == -1
				) {
					repeater_index = 0
				}
				
				if (this_input.parents('.fw-form-repeater').length) {
					
					// console.log(input.property + ' is in a repeater row')
					
					if (
						input.property.includes('[]') &&
						input.property.includes('index')
					) {
						
						repeater_index += 1
						
						// console.log('new index', repeater_index)
						
					}
					
				} else if (this_input.parents('.fw-form-flex-row').length) {
						
					repeater_index = -1
					// console.log(input.property + ' is in a flex row')
					
					if (
						input.property.includes('[]') &&
						input.property.includes('type')
					) {
						
						flex_type = input.value
						flex_index += 1
						
						// console.log('new type', flex_type)
						
					}
					
				} else {
					
					repeater_index = -1
					flex_type = null
					flex_index = -1
					
				}
			
				// console.log('type', flex_type)
				// console.log('flex index', flex_index)
				// console.log('repeater index', flex_index)
			
				if (repeater_index != -1) {
					
					// i'm in a repeater
					
					if (flex_type != null) {
						
						// repeater in a flex
						
						this_input = modal_form.find('.fw-form-flex-row[data-item="' + flex_type + '"][data-row-index="' + flex_index + '"]').find('.fw-form-repeater-row[data-row-index="' + repeater_index + '"] [name="inputs-' + input.property + '"]')
						
					} else {
						
						// repeater only
						
						this_input = this_input.closest('.fw-form-repeater-row[data-row-index="' + repeater_index + '"]').find('[name="inputs-' + input.property + '"]')
						
					}
					
					// console.log('set', this_input, this_val)
					
				} else if (flex_type != null) {
					
					// flex only
					
					// console.log('flex type ' + flex_type + ' row ' + flex_index + ' ' + input.property)
					
					this_input = modal_form.find('.fw-form-flex-row[data-item="' + flex_type + '"][data-row-index="' + flex_index + '"]').find('[name="inputs-' + input.property + '"]')
					
				}
					
				// console.log('input')
				// console.log(this_input, this_val)
				
				// INDIVIDUAL INPUT FIELDS
				
				if (input.property == 'id') {
					
					// ID
					// 
					
					if (this_val == 'auto') {
						
						this_val = ''
						
						if (options.element.data.type == 'page') {
							this_input.attr('placeholder', $('body').attr('id'))
						}
						
					}
					
				} else if (
					input.property == 'class' ||
					input.property.includes('-class')
				) {
					
					this_val = this_val.join(' ')
					
				} else if (input.property.includes('text')) {
					
					// this_val = plugin.unescape(this_val)
					
				}
				
				if (Array.isArray(this_val)) {
					// not sure why i did this
					this_input = modal_form.find('[name="inputs-' + input.property + '[]"]')
					
				}
					
				if (this_input.length) {
					
					if (input.property.includes('-d')) {
						
						// console.log('breakpoints')
						
						if (this_input.attr('type') == 'hidden') {
							
							// console.log('hidden', this_input, 'value', this_val)
							
							if (this_val == 'none') {
								this_input.next().addClass('active')
								this_input.parent().nextAll().hide()
							} else {
								this_input.next().removeClass('active')
								this_input.parent().nextAll().show()
							}
							
						}
						
					}
					
					// update by input type
					
					if (
						this_input.is('[type="checkbox"]') && 
						(this_val == 'true' || this_val == true)
					) {
						
						// checkbox
						
						this_input.prop('checked', true).trigger('change')
						
					} else if (this_input.hasClass('wp-editor-area')) {
						
						let input_name = 'inputs-' + input.property,
								unescaped_val = plugin.unescape(this_val)
						
						quicktags({ id: input_name })
						
						tinymce.execCommand('mceAddEditor', false, input_name)
						
						if (unescaped_val != '') {
							setTimeout(function() {
								// tinyMCE
								
								// console.log('set content')
								// console.log(input_name, tinymce.get(input_name))
								
								tinymce.get(input_name).setContent(unescaped_val)
								
							}, 500)
						}
						
					} else {
					
						// console.log('this_input length', this_input.length)
						// text
						
						// console.log(this_input, this_val)
						this_input.val(this_val)
						
					}
					
				}
				
				// image placeholder
				
				if (this_input.hasClass('uploader-file-url')) {
					
					let img_urls = JSON.parse(this_val)
					
					console.log(img_urls)
					
					this_input.closest('.uploader-container').find('.image-placeholder').html('<img src="' + img_urls.full + '">')
					
				}
				
				// range slider
				
				if (this_input.hasClass('form-range')) {
			
					this_input.prev().find('span').text(parseFloat(this_input.val()) * 100)
					
					this_input.on('input', function() {
						
						this_input.prev().find('span').text(parseFloat(this_input.val()) * 100)
						
					})
					
				}
				
				// toggle conditionals
				
				if (typeof this_input.attr('data-form-condition') != 'undefined') {
					plugin.toggle_conditionals(this_input)
				}
				
				if (this_input.hasClass('conditional-select')) {
					this_input.find('[data-form-condition').each(function() {
						plugin.toggle_conditionals($(this))
					})
				}
			
			})
			
			// image placeholders
			
			
			
			
			// 
			// // fill values
			// 
			// for (var input_name in this_setting) {
			// 	
			// 	let this_input = new_form.find('[name="inputs-settings-' + key + '-' + input_name + '"]')
			// 	
			// 	if (this_input.is('[type="checkbox"]')) {
			// 		
			// 		if (this_setting[input_name] == 'true') {
			// 			this_input.prop('checked', true).trigger('change')
			// 		}
			// 		
			// 	} else {
			// 		
			// 		this_input.val(this_setting[input_name]).trigger('change')
			// 		
			// 	}
			// 	
			// }
			// 
			// 
			// // image
			// 
			// if (key == 'background') {
			// 	
			// 	let opacity_range = new_form.find('.form-range')
			// 	
			// 	opacity_range.prev().find('span').text(parseFloat(opacity_range.val()) * 100)
			// 	
			// 	opacity_range.on('input', function() {
			// 		
			// 		opacity_range.prev().find('span').text(parseFloat(opacity_range.val()) * 100)
			// 		
			// 	})
			// 	
			// 	// console.log('background', new_form, this_setting)
			// 	
			// 	let upload_btn = new_form.find('.element-form-upload-btn'),
			// 			remove_btn = new_form.find('.image-remove'),
			// 			img_placeholder = new_form.find('.image-placeholder'),
			// 			image_id_val = new_form.find('[name="inputs-settings-background-file-id"]'),
			// 			image_url_val = new_form.find('[name="inputs-settings-background-file-url"]'),
			// 			img_url = {},
			// 			parse_URLs
			// 	
			// 	if (this_setting.file) {
			// 		
			// 		console.log('this ya', this_setting.file)
			// 		
			// 		img_url = JSON.parse(this_setting.file.url)
			// 		
			// 		// upload_btn.addClass('disabled')
			// 		// remove_btn.removeClass('d-none')
			// 		
			// 		img_placeholder.html('<img src="' + img_url.full + '">')
			// 		
			// 		new_form.find('.background-options').removeClass('d-none')
			// 		
			// 	}
			// 	
			// 	plugin.uploader = wp.media({
			// 		title: 'Insert image',
			// 		library: {
			// 			// uploadedTo : options.post_id,
			// 			type: 'image'
			// 		},
			// 		button: {
			// 			text: 'Use this image'
			// 		},
			// 		multiple: false
			// 	}).on('select', function() {
			// 		
			// 		const attachment = plugin.uploader.state().get('selection').first().toJSON()
			// 		
			// 		img_url = {
			// 			full: attachment.url
			// 		}
			// 		
			// 		placeholder_src = img_url.full
			// 		
			// 		if (attachment.sizes.thumbnail) {
			// 			img_url.thumbnail = attachment.sizes.thumbnail.url
			// 		}
			// 		
			// 		if (attachment.sizes.medium) {
			// 			img_url.medium = attachment.sizes.medium.url
			// 			
			// 			placeholder_src = img_url.medium
			// 		}
			// 		
			// 		if (attachment.sizes.large) {
			// 			img_url.thumbnail = attachment.sizes.large.url
			// 		}
			// 		
			// 		img_placeholder.html('<img src="' + placeholder_src + '">')
			// 		
			// 		// upload_btn.addClass('disabled')
			// 		// remove_btn.removeClass('d-none')
			// 		
			// 		// set hidden image input
			// 		image_id_val.val(attachment.id)
			// 		image_url_val.val(JSON.stringify({ full: attachment.url }))
			// 		
			// 		new_form.find('.background-options').removeClass('d-none')
			// 		
			// 	}).on('open', function() {
			// 	
			// 		if (image_id_val.val()) {
			// 			
			// 			const selection = plugin.uploader.state().get('selection')
			// 			attachment = wp.media.attachment(image_id_val.val())
			// 			attachment.fetch()
			// 			selection.add( attachment ? [attachment] : [] )
			// 			
			// 		}
			// 		
			// 	})
			// 	
			// 	upload_btn.click(function(e) {
			// 		e.preventDefault()
			// 		
			// 		plugin.uploader.open()
			// 	
			// 	})
			// 	
			// }
			
			modal_body.find('.fw-form-flex-container').each(function() {
				if ($(this).find('.fw-form-flex-item').length) {
					plugin.reindex_flex($(this))
				}
			})
			
			let is_hidden = false
			
			console.log('populate fields', 'done')
			
		},
		
		get_flex_form: function(container, path) {
			
			let plugin = this,
					options = plugin.options
			
			let key = path.split('/')
			
			key = key[key.length - 1]
			
			// console.log('get flex', path)
			
			return $.ajax({
				url: ajax_data.url,
				type: 'GET',
				async: false,
				data: {
					action: 'fw_modal_add_setting',
					path: path
				},
				success: function(data) {
					
					let new_form = $(data)
					
					// console.log(new_form.html())
					
					// hide this setting from the dropdown
					
					container.find('[data-setting="' + key + '"]').addClass('disabled')
					
					// add the form
					
					container.find('.fw-form-flex-rows').append(new_form)
					
					new_form.attr('data-item', key)
					
					// reindex flex rows
					plugin.reindex_flex(container)
					
					// console.log('added', key)
					
					//
					
					if (key == 'background') {
						
						// opacity range slider
						
						let opacity_range = new_form.find('.form-range')
						
						opacity_range.prev().find('span').text(parseFloat(opacity_range.val()) * 100)
						
						opacity_range.on('input', function() {
							
							opacity_range.prev().find('span').text(parseFloat(opacity_range.val()) * 100)
							
						})
						
						// 
						// 
						// // console.log('background', new_form, this_setting)
						// 
						// let upload_btn = new_form.find('.element-form-upload-btn'),
						// 		remove_btn = new_form.find('.image-remove'),
						// 		img_placeholder = new_form.find('.image-placeholder'),
						// 		image_id_val = new_form.find('[name="inputs-settings-background-file-id"]'),
						// 		image_url_val = new_form.find('[name="inputs-settings-background-file-url"]'),
						// 		img_url = {},
						// 		parse_URLs
						// 
						// if (this_setting.file) {
						// 	
						// 	console.log('this ya', this_setting.file)
						// 	
						// 	img_url = JSON.parse(this_setting.file.url)
						// 	
						// 	// upload_btn.addClass('disabled')
						// 	// remove_btn.removeClass('d-none')
						// 	
						// 	img_placeholder.html('<img src="' + img_url.full + '">')
						// 	
						// 	new_form.find('.background-options').removeClass('d-none')
						// 	
						// }
						
						// uploader_options = {
						// 	title: 'Insert image',
						// 	library: {
						// 		// uploadedTo : options.post_id,
						// 		type: 'image'
						// 	},
						// 	button: {
						// 		text: 'Use this image'
						// 	},
						// 	multiple: false
						// }
						
						// plugin.uploader = wp.media(uploader_options).on('select', function() {
						// 	
						// 	const attachment = plugin.uploader.state().get('selection').first().toJSON()
						// 	
						// 	img_url = {
						// 		full: attachment.url
						// 	}
						// 	
						// 	placeholder_src = img_url.full
						// 	
						// 	if (attachment.sizes.thumbnail) {
						// 		img_url.thumbnail = attachment.sizes.thumbnail.url
						// 	}
						// 	
						// 	if (attachment.sizes.medium) {
						// 		img_url.medium = attachment.sizes.medium.url
						// 		
						// 		placeholder_src = img_url.medium
						// 	}
						// 	
						// 	if (attachment.sizes.large) {
						// 		img_url.thumbnail = attachment.sizes.large.url
						// 	}
						// 	
						// 	img_placeholder.html('<img src="' + placeholder_src + '">')
						// 	
						// 	// upload_btn.addClass('disabled')
						// 	// remove_btn.removeClass('d-none')
						// 	
						// 	// set hidden image input
						// 	image_id_val.val(attachment.id)
						// 	image_url_val.val(JSON.stringify({ full: attachment.url }))
						// 	
						// 	new_form.find('.background-options').removeClass('d-none')
						// 	
						// }).on('open', function() {
						// 
						// 	if (image_id_val.val()) {
						// 		
						// 		const selection = plugin.uploader.state().get('selection')
						// 		attachment = wp.media.attachment(image_id_val.val())
						// 		attachment.fetch()
						// 		selection.add( attachment ? [attachment] : [] )
						// 		
						// 	}
						// 	
						// })
						
						
					
						
					}
					
					// toggle conditionals
					// in newly added form
					
					new_form.find('[data-form-condition]').each(function() {
						plugin.toggle_conditionals($(this))
					})
					
					// console.log('added ' + path)
					
				}
				
			})
			
		},
		
		reindex_flex: function(container) {
			
			console.log('reindex', container)
			
			container.find('.fw-form-flex-row').each(function(i, item) {
				
				// console.log($(this).attr('data-item'))
				$(item).attr('data-row-index', i)
				// console.log($(item).find('[name$="' + $(this).attr('data-item') + '-index"]'))
				$(item).find('.card-body > [name$="index"]').val(i)
			})
			
		},
		
		uploader_init: function(uploader_options) {
			
			let plugin = this,
					options = plugin.options
					
			// set up options
			
			
			
			plugin.uploader = wp.media(uploader_options).on('select', function() {
				
				attachment = plugin.uploader.state().get('selection').first().toJSON()
				
				// set hidden image ID input
				upload_id_input.val(attachment.id)
				
				console.log(attachment)
				
				// set URL and placeholder
				
				if (img_placeholder.length) {
						
					img_url.full = attachment.url
					
					placeholder_src = img_url.full
					
					if (attachment.sizes.thumbnail) {
						img_url.thumbnail = attachment.sizes.thumbnail.url
					}
					
					if (attachment.sizes.medium) {
						img_url.medium = attachment.sizes.medium.url
						
						placeholder_src = img_url.medium
					}
					
					if (attachment.sizes.large) {
						img_url.thumbnail = attachment.sizes.large.url
					}
					
					img_placeholder.html('<img src="' + placeholder_src + '">')
					
					upload_url_input.val(JSON.stringify(img_url))
					
					// change button text
					upload_btn.text('Replace Image')
					
				} else {
					
					upload_url_input.val(JSON.stringify({ full: attachment.url }))
					
				}
				
				// upload_btn.addClass('disabled')
				// remove_btn.removeClass('d-none')
				
			}).on('open', function() {
			
				if (upload_id_input.val()) {
					
					selection = plugin.uploader.state().get('selection')
					attachment = wp.media.attachment(upload_id_input.val())
					attachment.fetch()
					selection.add( attachment ? [attachment] : [] )
					
				}
				
			})
			
			if (upload_id_input.val() != '') {
				
				// element has an ID set
				
				if (img_placeholder.length) {
					
					// there's also an image placeholder
				
					// grab the best image size and set the placeholder
					
					let img_urls = JSON.parse(upload_url_input.val())
					
					placeholder_src = img_urls.full
					
					if (img_urls.medium) {
						placeholder_src = img_urls.medium
					}
					
					img_placeholder.html('<img src="' + placeholder_src + '">')
					
					// change button text
					upload_btn.text('Replace image')
					
				} else {
					
					// change button text
					upload_btn.text('Replace file')
					
				}
				
			}
			
			// upload_btn.click(function(e) {
			// 	e.preventDefault()
			// 	
			// 	plugin.uploader.open()
			// 
			// })
		
			
		},
		
		//
		// DATA MANIPULATION
		//
		
		get_element_by_key: function(key, parent) {
				
			// key: the element's data-key attribute
			// parent: where to look
			
			let plugin = this,
					options = plugin.options
				
			let i,
					result
			
			if (!parent) parent = options.page
			
			if (key == parent.key) {
				
				return parent
				
			} else {
			
				if (!parent.children) {
					
					console.warn('fw', parent.key + ' has no children')
					
					return false
					
				} else { 
				
					let array_to_search = parent.children
					
					for (i = 0; i < array_to_search.length; i += 1) {
						
						// console.log(i, parent[i].key)
						
						// console.log(key + ' = ' + array_to_search[i].key + '?')
						
						// each element in the object
						
						if (key == array_to_search[i].key) {
							
							// the element's key is the one we're looking for
							
							// test = array_to_search
							
							if (options.status == 'deleting') {
								// options.parent.data = array_to_search
							}
							
							return array_to_search[i]
							
						} else {
							
							if (array_to_search[i].children) {
								
								// maybe it's in the element's children
								
								// console.log(i, 'search in ' + parent[i].key, parent[i].children)
								result = plugin.get_element_by_key(key, array_to_search[i])
								
								if (result !== false) {
									
									// console.log('element', key)
									// console.log(JSON.stringify(result))
									
									return result
								}
								
							}
							
						}
						
					}
					
					// console.warn('fw', 'can\'t find element ' + key)
					
					// no dice
					return false
					
				}
				
			}
			
		},
		
		reset_arrays: function(data) {
			
			for (let key in data) {
				
				console.log(key, data[key])
				
				if (Array.isArray(data[key])) {
					console.log(key, typeof data)
					data[key] = []
				} else if (
					typeof data[key] == 'object' &&
					Object.keys(data[key]).length !== 0
				) {
					data[key] = this.reset_arrays(data[key])
				}
			}
			
			return data
			
		},
		
		add_form_data_to_element: function(form_data) {
			
			let plugin = this,
					options = plugin.options
			
			console.log('add form data', form_data)
			
			// grab the element that we're working with
			let element_item = options.element.item,
					element_data = options.element.data,
					element_has_settings = false
					
			// console.log(element_item, element_data)
					
			// assume all settings will be removed
			
			if (
				element_data.hasOwnProperty('inputs') &&
				element_data.inputs.hasOwnProperty('settings')
			) {
				
				// add setting keys to removed_settings
				element_data.inputs.settings.forEach(function(setting) {
					for (let key in setting) {
						options.data.removed_settings.push(key)
					}
				})
				
				// console.log('removed', options.data.removed_settings)
				
				// clear existing settings object
				element_data.inputs.settings = [] //{}
				
			}
			
			// destroy the existing inputs object
			// not sure if this is a good idea
			// update: it was a bad idea - removes text from other langs
			// options.element.data.inputs = {}
			
			// instead go through the inputs object
			// and reset any array it finds
			
			if (element_data.hasOwnProperty('inputs')) {
			
				element_data.inputs = plugin.reset_arrays(element_data.inputs)
				
			} else {
			}
			
			form_data.forEach(function(input) {
				
				// console.log('--- NEW INPUT ---')
				// console.log('data', input)
				
				if (input.name.includes('inputs-settings')) {
					element_has_settings = true
				}
				
				// format value
				
				if (input.name.includes('inputs-title')) {
					input.value = plugin.escape(input.value)
				}
				
				if (input.name == 'inputs-id' && input.value == '') {
					input.value = 'auto'
				}
				
				// split the input name into an array
				
				let key = input.name.split('-')
				
				if (key.length == 1) {
					
					// if the key array only has one value,
					// that's the name of the element property
					// to update
					
					element_data[key] = input.value
					
				} else {
					
					// console.log('pre', JSON.stringify(element_data))
					
					element_data = plugin.find_child_element(element_data, key, input.value)
					
				}
				
			})
			
			// console.log('element now')
			// console.log(JSON.stringify(element_data, null, 2))
			
			// reset array flag
			
			options.data.array_key = null
			options.data.array_indexes = {}
			
			if (element_has_settings == true) {
				// console.log('has settings', JSON.stringify(element_data.inputs.settings))
				
				element_data.inputs.settings.forEach(function(setting) {
					
					for (var key in setting) {
						
						// filter settings from the submitted form
						// from the removed_settings array
						// i.e. keep stuff that was NOT removed
						
						options.data.removed_settings = options.data.removed_settings.filter(e => e !== key)
						
					}
					
				})
				
				console.log('settings removed', options.data.removed_settings)
				
			}
			
			return element_data
			
		},
		
		set_elements_to_move: function(parent) {
			
			let plugin = this,
					options = plugin.options
			
			if (parent.children) {
				
				parent.children.forEach(function(child, i) {
					
					let old_key = child.key
					
					child.key = parent.key + '-' + (i + 1)
					
					options.elements_to_move.push({
						item: $('[data-key="' + old_key + '"]').first(),
						id: child.inputs.id,
						old: old_key,
						new: child.key
					})
					
					// recursive
					
					if (child.children) {
						plugin.set_elements_to_move(child)
					}
					
				})
				
			}
			
		},
		
		set_element_keys: function() {
			
			let plugin = this,
					options = plugin.options
			
			// console.log('to move')
			// console.log(options.elements_to_move)
			
			options.elements_to_move.forEach(function(element) {
				
				// console.log('update', element.item)
				
				// key
				element.item.attr('data-key', element.new)
				
				// footer key text
				element.item.find('> .fw-element-footer .element-key').text(element.new)
				
				// id
				if (element.id == 'auto') {
					element.item.attr('id', 'element-' + element.new)
				}
				
				// console.log('after', old_el.attr('data-key'))
				
			})
			
			options.elements_to_move = []
			
		},
		
		update_post: function() {
			
			let plugin = this,
					options = plugin.options
			
			console.log(options.page)
			
			$('#fw-modal .modal-body code').text(options.post_id)
			
			$.ajax({
				url: ajax_data.url,
				type: 'POST',
				data: {
					action: 'fw_update_post',
					globals: options.globals,
					post_id: options.post_id,
					builder: options.page,
					builder_string: JSON.stringify(options.page)
				},
				success: function(data) {
					console.log(data)
					
					if (data == 'success') {
						
						$('#fw-modal .modal-body p').text('Success')
						
					}
					
					options.status = 'ready'
					
				},
				error: function() {
					
					$('#fw-modal .modal-body p').text('Something went wrong.')
					
				},
				complete: function() {
					
					$('#fw-modal .btn').removeClass('disabled')
						
				}
			})
			
		},
		
		//
		// UTILITIES
		//
		
		reset_modal: function() {
			
			this.options.modal = {
				content: null,
				item: null,
				parent: null,
				data: {
					type: null,
					cat: null,
					content: null
				}
			}
			
		},
		
		find_child_element: function(current_parent, key, value, lang_prop = null) {
			
			let plugin = this,
					options = plugin.options
					
			let property = key[0]
			
			// console.log('---')
			// console.log('property', property)
			// console.log('value', value)
			// console.log('parent')
			// console.log(JSON.stringify(current_parent))
			
			if (options.data.add_next == true) {
				options.data.key_to_add = property
				options.data.add_next = false
			}
			
			if (key.length == 1) {
				
				// only 1 key left so it's time to
				// set the value
				
				if (property == 'class') {
					value = value.split(' ')
				}
				
				if (lang_prop != null) {
					
					value = plugin.escape(tinymce.get('inputs-' + lang_prop + '-' + options.lang).getContent())
					
				}
				
				// console.log('setting ' + property + '\'s value now')
				
				// console.log('pre', JSON.stringify(current_parent))
				
				if (Array.isArray(current_parent)) {
					
					// console.log('parent is array')
					// 
					// console.log('current key', options.data.array_key)
					// console.log('current index', options.data.array_indexes[options.data.array_key])
					
					if (
						current_parent[options.data.array_indexes[options.data.array_key]] &&
						current_parent[options.data.array_indexes[options.data.array_key]][property]
					) {
						
						// console.log('indexes[' + options.data.array_key + '][' + options.data.array_indexes[options.data.array_key] + '] already has ' + property)
						
						options.data.array_indexes[options.data.array_key] += 1
						
					}
					
					if (!current_parent[options.data.array_indexes[options.data.array_key]]) {
						
						current_parent[options.data.array_indexes[options.data.array_key]] = {}
						
					}
					
					current_parent[options.data.array_indexes[options.data.array_key]][property] = value
					
				} else {
					
					if (current_parent == undefined) {
						current_parent = []
					}
					
					// console.log(current_parent)
					
					current_parent[property] = value
					
					// console.log('set', property, value)
					// console.log(JSON.stringify(current_parent))
						
				}
				
				if (
					property == 'index' &&
					options.data.array_indexes !== undefined &&
					options.data.array_indexes[options.data.array_key] != undefined
				) {
					options.data.array_indexes[options.data.array_key] += 1
				}
				
				// console.log('post')
				// console.log(JSON.stringify(current_parent, null, 2))
				
			} else {
				
				// multiple keys left
				
				let keep_prop = null
				
				if (key[0] == 'text') {
					keep_prop = key[0]
				}
				
				// drop the first element
				
				let first = key.shift()
				let parent_to_send = null
				
				if (property.includes('[]')) {
					
					options.data.add_next = true
					
					// i'm an array
					
					property = property.replace('[]', '')
					
					if (Array.isArray(current_parent)) {
						
						// my parent is an array
						// find out if it's empty
						
						// console.log('parent is array')
						
						// console.log(current_parent[options.data.array_indexes[options.data.array_key]])
						
						if (!current_parent[options.data.array_indexes[options.data.array_key]]) {
							
							// object that sits at the right index of the parent
							
							current_parent[options.data.array_indexes[options.data.array_key]] = {}
							
						}
						
						if (!current_parent[options.data.array_indexes[options.data.array_key]][property]) {
							
							// array that will be the new parent
							
							current_parent[options.data.array_indexes[options.data.array_key]][property] = []
							
						}
						
						parent_to_send = current_parent[options.data.array_indexes[options.data.array_key]][property]
						
					} else {
						
						// parent is not an array
						
						if (!current_parent[property]) {
							
							current_parent[property] = []
							
						}
						
					}
					
					// always
					// set array_key to the property that
					// the new array is being created for
					
					if (property == 'rows') {
						options.data.array_key = options.data.key_to_add + '-' + property
					} else {
						options.data.array_key = property
					}
					
					// console.log('new key', options.data.array_key)
					
					// set the index for this property to 0
					
					if (!options.data.array_indexes[options.data.array_key]) {
						
						options.data.array_indexes[options.data.array_key] = 0
						
					}
					
					// console.log('indexes now', options.data.array_indexes)
					
				} else {
					
					// i'm not an array
					
					if (Array.isArray(current_parent)) {
						
						// my parent is an array
						
						if (!current_parent[options.data.array_indexes[options.data.array_key]]) {
							
							// nothing exists at this index yet
							
							current_parent[options.data.array_indexes[options.data.array_key]] = {}
							
						} else {
							
							// current parent[indexes[key]] has something in it
							
							let current_array_val = current_parent[options.data.array_indexes[options.data.array_key]]
							
							// if property doesn't exist in the current index,
							// increment the index by 1
							
							if (
								!Object.keys(current_array_val).includes(property)
							) {
								
								// the input property doesn't exist at this index
								// of the parent array
								
								options.data.array_indexes[options.data.array_key] += 1
								
							}
							
							// check for undefined again
							
							if (!current_array_val) {
								current_parent[options.data.array_indexes[options.data.array_key]] = {}
							}
							
						}
						
						// add my object at the right index
						
						// indexes[key]
						if (!options.data.array_indexes.hasOwnProperty(options.data.array_key)) {
							options.data.array_indexes[options.data.array_key] = 0
						}
						
						// parent[indexes[key]]
						if (!current_parent.hasOwnProperty(options.data.array_indexes[options.data.array_key])) {
							current_parent[options.data.array_indexes[options.data.array_key]] = {}
						}
						
						// parent[indexes[key]][property]
						if (!current_parent[options.data.array_indexes[options.data.array_key]].hasOwnProperty(property)) {
							current_parent[options.data.array_indexes[options.data.array_key]][property] = {}
						}
						
						// set this property as the new current_parent 
						// for the recursive function
						
						parent_to_send = current_parent[options.data.array_indexes[options.data.array_key]][property]
						
					} else if (!current_parent.hasOwnProperty(property)) {
						
						// parent is an object that doesn't contain
						// this key
						
						current_parent[property] = {}
						
					}
					
				}
				
				if (parent_to_send == null) {
					
					parent_to_send = current_parent[property]
					
				}
				
				plugin.find_child_element(parent_to_send, key, value, keep_prop)
				
			}
			
			return current_parent
			
		},
		
		generate_column_classes: function(breakpoints, output = 'string') {
			
			let classes = [],
					is_hidden = false
					
			// console.log(breakpoints)
			
			for (var breakpoint in breakpoints) {
				for (var setting in breakpoints[breakpoint]) {
					
					let new_class = setting
					
					if ( breakpoint != 'xs' ) new_class += '-' + breakpoint
					
					new_class += '-'
					
					if (breakpoints[breakpoint][setting] != '') {
						
						if (setting == 'd') {
							
							// hide/show setting
							
							if (breakpoints[breakpoint][setting] == 'none') {
								
								// hiding at this breakpoint
								
								if (is_hidden == false) {
									
									// not already hidden
									
									new_class += 'none'
									is_hidden = true
									
									classes.push(new_class)
									
								}
								
							} else {
								
								// showing at this breakpoint
								
								if (is_hidden == true) {
									
									// is already hidden
									
									new_class += 'block'
									is_hidden = false
									
									classes.push(new_class)
									
								}
								
								
							}
							
						} else {
							
							// other column setting
							
							new_class += breakpoints[breakpoint][setting]
							
							classes.push(new_class)
							
						}
						
					}
					
				}
			}
			
			if (output == 'string') {
				classes = classes.join(' ')
			}
			
			return classes
			
		},
		
		escape: function(htmlStr = '') {
			return htmlStr.replace(/&/g, "&amp;")
				.replace(/\n/g, "")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;")
				.replace(/'/g, "&#39;")
		},
		
		unescape: function(htmlStr = '') {
			
			// console.log('unescape', htmlStr)
			
			htmlStr = htmlStr.replace(/&lt;/g , "<")
			htmlStr = htmlStr.replace(/&gt;/g , ">")
			htmlStr = htmlStr.replace(/&quot;/g , "\"")
			htmlStr = htmlStr.replace(/&#39;/g , "\'")
			htmlStr = htmlStr.replace(/&amp;/g , "&")
			
			return htmlStr
		},
		
		move_item_up: function(item) {
			
			let plugin = this,
					options = plugin.options,
					go_again = false
			
			// console.log('moving up', item)
			
			$.each(item, function() {
				
				let prev_is_label = false
				
				if (item.prev().is('.fw-template-label') == true) {
					prev_is_label = true
				}
				
				item.after(item.prev())
				
				if (options.moving_in_template == true) {
					
					if (prev_is_label == false) {
						go_again = true
					} else {
						options.moving_in_template = false	
					}
					
				} else {
					
					if (prev_is_label == true) {
						options.moving_in_template = true
						go_again = true
					}
					
				}
				
				if (go_again == true) {
					plugin.move_item_up(item)
				}
				
			})
			
		},
		
		move_item_down: function(item) {
			
			let plugin = this,
					options = plugin.options,
					go_again = false
					
			// console.log('down', options.moving_in_template)
			
			// console.log('moving', item)
			
			$.each(item, function() {
				
				let next_is_label = false
				
				if (item.next().is('.fw-template-label') == true) {
					// console.log('next is label')
					next_is_label = true
				}
				
				item.before(item.next())
				
				if (options.moving_in_template == true) {
					
					if (next_is_label == false) {
						go_again = true
					} else {
						options.moving_in_template = false	
					}
					
				} else {
					
					if (next_is_label == true) {
						
						options.moving_in_template = true
						go_again = true
						
					}
					
				}
				
				if (go_again == true) {
					plugin.move_item_down(item)
				}
				
				
			})
			
		},
		
		flatten: function(obj, parent, adding_to_array = false, res = []) {
			
			let plugin = this
			
			for (let key in obj) {
				
				// console.log('---')
				// console.log(parent, key, obj[key])
				
				let propName
				
				if (parent) {
					
					// console.log(key, typeof key)
					
					if (adding_to_array == true) {
						propName = parent + '[]'
					} else {
						propName = parent + '-' + key
					}
					
				} else {
					propName = key
				}
				
				if (Array.isArray(obj[key])) {
					
					// console.log(key + ' is array')
					
					if (obj[key].length > 0 && typeof obj[key][0] == 'object') {
						// console.log('ya')
						plugin.flatten(obj[key], propName, true, res)
					} else {
						// res[propName] = obj[key]
						res.push({
							property: propName,
							value: obj[key]
						})
					}
					
				} else if (typeof obj[key] == 'object') {
					
					// console.log(key + ' is object')
					
					plugin.flatten(obj[key], propName, false, res)
					
				} else {
					
					// console.log(key + ' else')
					
					// res[propName] = obj[key]
					
					res.push({
						property: propName,
						value: obj[key]
					})
					
				}
			}
			
			// console.log(res)
			return res
			
		},
		
		is_number: function (str) {
			if (typeof str != "string") return false
			
			return !isNaN(str) && 
						 !isNaN(parseFloat(str))
						 
		},
		
		add_listeners: function(this_item) {
			
			let plugin = this,
					options = plugin.options
			
			if (this_item.length) {
				
				this_item.on('shown.bs.dropdown', function(e) {
					
					this_item.addClass('dropdown-open')
					
					e.stopPropagation()
					// 	e.preventDefault()
					
				}).on('hide.bs.dropdown', function(e) {
					
					// console.log('hide', this_item)
					this_item.removeClass('dropdown-open')
					
				})
				
			}
			
		}


	}

	// jQuery plugin interface

	$.fn.builder = function (opt) {
		var args = Array.prototype.slice.call(arguments, 1)

		return this.each(function () {

			var item = $(this)
			var instance = item.data('builder')

			if (!instance) {

				// create plugin instance if not created
				item.data('builder', new builder(this, opt))

			} else {

				// otherwise check arguments for method call
				if (typeof opt === 'string') {
					instance[opt].apply(instance, args)
				}

			}
		})
	}
	
	$(document).builder()

}(jQuery));
