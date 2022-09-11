//
// GLOBAL VARS
//

(function($) {

  $(function() {

    $('#training-filter').stick_in_parent({
      offset_top: $('#main-header').outerHeight() + sticky_offset
    }).addClass('sticky-rendered')

    function stick_filter() {

      if ($(window).width() > 992) {

        if ($('#training-filter').hasClass('sticky-rendered')) {

          $('#training-filter').trigger('sticky_kit:recalc')

        } else {

          setTimeout(function() {
            $('#training-filter').stick_in_parent({
              offset_top: $('#main-header').outerHeight() + sticky_offset
            }).addClass('sticky-rendered')

            console.log('re-rendered sticky filter with ' + ($('#main-header').outerHeight() + sticky_offset) + ' offset')
          }, 500)

        }

      } else {

        if ($('#training-filter').hasClass('sticky-rendered')) {
          $('#training-filter').trigger('sticky_kit:detach').removeClass('sticky-rendered')
        }

      }

    }

    stick_filter()

    $(window).resize(function() {
      stick_filter()
    })

    $('#training-filter .nav-link').click(function(e) {

      var this_type = $(this).attr('data-type')

      console.log($(this))

      if (!$(this).hasClass('ui-state-active')) {

        $('.training-asset').each(function() {

          if ($(this).attr('data-type') == this_type) {
            $(this).removeClass('disabled')
          } else {
            $(this).addClass('disabled')
          }

        })

        // enable assets of this type
//         $('.training-asset[data-type="' + $(this).attr('data-type') + '"]').removeClass('disabled')

        // disable assets NOT of this type
//         $('.training-asset:not[data-type="' + $(this).attr('data-type') + '"]').addClass('disabled')

        //$('.module-assets').isotope({ filter: '[data-type="' + $(this).attr('data-type') + '"]' })

        $('#training-filter .nav-link').removeClass('ui-state-active')
        $(this).addClass('ui-state-active')

      } else {

        //$('.module-assets').isotope({ filter: '*' })

        $('.training-asset').removeClass('disabled')

        $('#training-filter .nav-link').removeClass('ui-state-active')

      }

    })

		// accordion blocks

		if ($('.accordion-block').length) {

			$('.accordion-block').each(function() {

				var this_block = $(this),
						this_header = this_block.find(':header').first()

				this_header.addClass('accordion-block-header d-flex').prepend('<div class="accordion-block-icon"><i class="fas fa-caret-down"></i>')

				var this_body = $('<div class="accordion-block-body">').css('display', 'none')

				 this_header.nextAll().wrapAll(this_body)

			})

			$('body').on('click', '.accordion-block-header', function() {

				if ($(this).hasClass('open')) {
					$(this).removeClass('open')
					$(this).next().slideUp()
				} else {
					$(this).addClass('open')
					$(this).next().slideDown()
				}

			})

		}

  });
})(jQuery);
