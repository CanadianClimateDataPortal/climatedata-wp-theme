(function ($) {
	$(function () {
		
		//
		// VARS
		//
		
		var init = true,
			news_data = {
				post_container: $('#news-posts'),
				current_page: 1,
				max_pages: 1,
				query: ''
			}
		
		//
		// EVENTS
		//
		
		// expand/collapse tags
		
		$('#all-tags').on('show.bs.collapse', function() {
			
			$('#all-tags-btn').addClass('text-secondary')
			$('#all-tags-btn i').addClass('fa-rotate-180')
			
		})
		
		$('#all-tags').on('hide.bs.collapse', function() {
			
			$('#all-tags-btn').removeClass('text-secondary')
			$('#all-tags-btn i').removeClass('fa-rotate-180')
			
		})
		
		// click a filter
		
		$('body').on('click', '.tag-filter-item', function(e) {
			
			e.preventDefault()
			e.stopPropagation()
			
			let this_tag = $(this).attr('data-tag')
			
			news_data.current_page = 1
			
			// select/deselect
			
			if ($(this).hasClass('selected')) {
				$('body').find('[data-tag="' + this_tag + '"]').removeClass('selected')
			} else {
				$('body').find('[data-tag="' + this_tag + '"]').addClass('selected')
			}
			
			news_filter()
			
		})
		
		// pagination
		
		$('.pagination-btn').click(function() {
			
			if (!$(this).hasClass('disabled')) {
				
				if ($(this).hasClass('previous')) {
					
					news_data.current_page -= 1
					
				} else {
					
					news_data.current_page += 1
					
				}
				
				news_filter()
				
			}
			
		})
		
		// clear filters
		
		$('#news-clear').click(function() {
			
			if (!$(this).hasClass('disabled')) {
				
				$('body').find('.tag-filter-item.selected').removeClass('selected')
				
				news_filter()
				
			}
			
		})
		
		//
		// SETUP
		//
		
		sticky_offset += $('#main-header-nav').outerHeight()
		
		if ($('body').hasClass('admin-bar')) {
		  
		  if ($(window).width() > 782) {
			scroll_offset += 32
		  } else {
			scroll_offset += 46
		  }
		}
		
		$('#news-header').stick_in_parent({
		  parent: 'main',
		  offset_top: sticky_offset
		})
		
		// page load
		
		news_filter()
		
		//
		// FUNCTIONS
		//
		
		// AJAX
		
		function news_filter() {
			
			$('body').addClass('spinner-on')
			
			let this_ID = $(this).attr('data-tag'),
				selected_tags = []
				
			// find selected tags
			
			$('body').find('.tag-filter-item.selected').each(function() {
				selected_tags.push($(this).attr('data-tag'))
			})
			
			// unique tags only
			
			selected_tags = selected_tags.filter((item, index) => selected_tags.indexOf(item) === index)
			
			if (selected_tags.length > 0) {
				$('#news-clear').removeClass('disabled')
				
				// update URL
				
				history.replaceState(null, document.title, window.location.pathname + '?t=' + selected_tags.join(','))
				
			} else {
				$('#news-clear').addClass('disabled')
				
				history.replaceState(null, '', window.location.pathname)
			}
			// close filter menu
			
			$('#all-tags').collapse('hide')
			
			console.log('get', selected_tags, news_data.current_page)
			
			$.ajax({
				url: ajax_data.url,
				type: 'GET',
				data: {
					action: 'get_news_posts',
					tags: selected_tags.join(','),
					page_num: news_data.current_page
				},
				success: function(data) {
					
					let result = JSON.parse(data)
					
					// output
					
					news_data.post_container.html(result.output)
					
					// page numbers
					
					news_data.current_page = parseInt(result.current_page)
					news_data.max_pages = parseInt(result.max_pages)
					
					$('#page-num-current').text(news_data.current_page)
					$('#page-num-total').text(news_data.max_pages)
					
					if (news_data.current_page == 1) {
						$('.pagination-btn.previous').addClass('disabled')
					} else {
						$('.pagination-btn.previous').removeClass('disabled')
					}
					
					if (news_data.current_page >= news_data.max_pages) {
						$('.pagination-btn.next').addClass('disabled')
					} else {
						$('.pagination-btn.next').removeClass('disabled')
					}
					
					if (init == false) {
						
						$(document).smooth_scroll({
							id: '#news-main',
							speed: 500,
							ease: 'swing',
							offset: scroll_offset
						})
						
					} else {
						
						init = false
						
					}
					
					// select
					
					selected_tags.forEach(function(tag) {
						
						news_data.post_container.find('[data-tag="' + tag + '"]').addClass('selected')
						
					})
					
					$('body').removeClass('spinner-on')
				},
				error: function(error) {
					// console.log(error)
				}
			})
			
		}
	
	});
})(jQuery);
