<?php

	// update_option ( 'fwtest', array() );
	
	get_header();
	
	if ( have_posts() ) {
		while ( have_posts() ) {
			the_post();
			
			// front-end output
			
			fw_builder();
			
			if ( current_user_can ( 'administrator' ) ) {
		
?>

<div style="display: none;">
	<?php wp_editor('', 'inputs-test-tinymce'); ?>
</div>
<div id="output-btn" class="btn btn-danger">Show/Update Object</div>
<pre id="output" class="bg-light m-3 p-3" style="font-size: 0.625rem;"></pre>

<?php

			}

			
		}
	}
	
	get_footer();
