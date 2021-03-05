(function($) {

  $(function() {

		if ($('body').hasClass('post-php')) {

			var element_ids = []

			console.log(acf)

			//
			// FUNCTIONS
			//

			// get values

			// populate select

			function populate_id_selects() {

				$('body').find('.element-id-select input').autocomplete({
					source: element_ids
				})

			}

			//
			// ON LOAD
			//

			// find inputs with values for initial population

			acf.addAction('ready', function() {

				console.log('acf ready')

				$('body').find('.element-id-field').each(function() {

					if ($(this).find('input').val() != '') {
						element_ids.push($(this).find('input').val())
					}

				})

				console.log(element_ids)

				// initial select

				populate_id_selects()

				//

				$('body').on('input', '.element-id-field', function() {
					console.log('hey wha')
				})

			})

			//
			// ON NEW FIELD
			//

			var myCallback = function( field ){

	      populate_id_selects()

	      console.log('ya', field)

	    };

			acf.addAction('new_field/key=field_5fcf85c575146', myCallback);
			acf.addAction('new_field/key=field_5fd8cac2c61c7', myCallback);

			$(document).ready(function() {

				acf.doAction('ready')

			})

	}

	});
})(jQuery);
