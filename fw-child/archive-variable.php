<?php

	// update_option ( 'fwtest', array() );
	
	get_header();
	
	//
	// HERO
	//
	
	$hero_template = json_decode ( get_post_meta ( 11818, 'builder', true ), true );
	
	fw_output_loop ( $hero_template, 1, true );
	
	//
	// QUERY
	//
	
?>

<div id="var-archive-1" class="fw-element fw-section query-page variable-grid" data-key="">
	<div id="var-archive-1-1" class="fw-element fw-container container-fluid " data-key="var-archive-1-1">
		
	<?php
	
		include ( locate_template ( 'template/header-fixed.php' ) );
		include ( locate_template ( 'template/variable/query.php' ) );
	
	?>
	
	</div>
</div>

<?php

	//
	// FOOTER
	//
	
	$footer_template = json_decode ( get_post_meta ( 11315, 'builder', true ), true );
	
	fw_output_loop ( $hero_template, 1, true );

	get_footer();
	