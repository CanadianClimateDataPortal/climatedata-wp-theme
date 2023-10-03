<?php

	// update_option ( 'fwtest', array() );
	
	get_header();
	
	if ( have_posts() ) {
		while ( have_posts() ) {
			the_post();
			
			// front-end output
			
			fw_builder();
			
			/*if ( is_user_logged_in() && current_user_can ( 'administrator' ) ) {
			
	?>

<div id="fw-builder-post-actions">
	<div id="fw-page-settings" class="fw-btn fw-modal-trigger edit-element btn btn-outline-secondary" data-modal-content="page">Page Settings</div>
	<!-- <div id="fw-builder-toggle" class="fw-btn btn btn-outline-secondary">Builder <span class="badge text-bg-success">On</span></div> -->
	<!-- <div id="fw-save-post" class="fw-btn btn btn-primary">Save</div> -->
</div>

<?php

			}*/
			
			if ( current_user_can ( 'administrator' ) ) {
		
?>

<div id="output-btn" class="btn btn-danger">Show/Update Object</div>
<pre id="output" class="bg-light m-3 p-3" style="font-size: 0.625rem;"></pre>

<?php

			}

			
		}
	}
	
	get_footer();
	