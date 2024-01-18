<?php

	if ( have_rows ( 'sections' ) ) {
		include ( locate_template ( 'template/old-loop/sections.php' ) );
	} else {
		
		if ( current_user_can ( 'administrator' ) ) {
		
			echo '<p class="alert alert-warning">No <code>sections</code> fields found. Delete this block and use the builder to add content.</p>';
			
		}
		
	}

	//echo get_field ( 'old_output_' . $GLOBALS['fw']['current_lang_code'] );
