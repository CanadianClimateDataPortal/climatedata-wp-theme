<?php

	if ( locate_template ( 'template/' . $element['inputs']['path'] ) != '' ) {
		
		include ( locate_template ( 'template/' . $element['inputs']['path'] ) );
		
	} else {
		
		echo '<div class="alert alert-warning fw-builder-alert">';
		
		echo 'Template ' . $element['inputs']['path'] . ' not found.';
		
		echo '</div>';
		
	}