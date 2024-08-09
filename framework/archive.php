<?php

	// update_option ( 'fwtest', array() );
	
	get_header();
	
	if ( have_posts() ) {
		while ( have_posts() ) {
			the_post();
			
			the_title();
			
			echo '<hr>';
			
		}
	} else {
		
		echo '<p class="alert alert-warning">No posts found.</a>';
		
	}
	
	get_footer();
	