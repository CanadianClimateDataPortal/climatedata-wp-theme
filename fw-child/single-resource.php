<?php
	
	if (
		!is_user_logged_in() &&
		get_field ( 'asset_type' ) == 'interactive' &&
		get_field ( 'asset_post_' . $GLOBALS['fw']['current_lang_code'] ) != ''
	) {
		
		// hijack post setup if this is an interactive
		// get the object of the asset_post_XX field instead
		
		$post = get_post ( get_field ( 'asset_post_' . $GLOBALS['fw']['current_lang_code'] ) );
		
		// this will make the motion.page scripts load
		setup_postdata ( $post );
		
	}
	
	get_header();
	
	if ( have_posts() ) {
		while ( have_posts() ) {
			the_post();
			
			// front-end output
			
			fw_builder();
			
			if ( current_user_can ( 'administrator' ) ) {
		
?>

<div id="output-btn" class="btn btn-danger">Show/Update Object</div>
<pre id="output" class="bg-light m-3 p-3" style="font-size: 0.625rem;"></pre>

<?php

			}

			
		}
	}
	
	get_footer();
	
