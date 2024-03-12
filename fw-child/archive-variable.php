<?php

	// update_option ( 'fwtest', array() );
	
	get_header();
	
?>

<div id="var-archive-1" class="fw-element fw-section query-page" data-key="">
	<div id="var-archive-1-1" class="fw-element fw-container container-fluid " data-key="409-4-1">
		
	<?php
	
		include ( locate_template ( 'template/header-fixed.php' ) );
		include ( locate_template ( 'template/variable/query.php' ) );
	
	?>
	
	</div>
</div>

<?php

	get_footer();
	