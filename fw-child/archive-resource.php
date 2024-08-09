<?php

	// redirect to learning zone
	
	$redirect_slug = 'learn';
		
	if ( $GLOBALS['fw']['current_lang_code'] == 'fr' ) 
		$redirect_slug = 'apprendre';
	
	header ( 'Location: ' . home_url ( $redirect_slug ) );