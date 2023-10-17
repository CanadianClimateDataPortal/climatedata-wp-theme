<?php

$lang = 'en';

if ( isset ( $globals['current_lang_code'] ) ) {
	$lang = $globals['current_lang_code'];
}

if (
	isset ( $element['inputs']['text'][$lang] ) && 
	!empty ( $element['inputs']['text'][$lang] )
) {

	// echo htmlspecialchars_decode ( $element['inputs']['text'][$lang] );

	$element['text'] = htmlspecialchars_decode ( $element['inputs']['text'][$lang] );
	
	echo $element['text'];
	
} else {
	
	if ( is_user_logged_in() ) {
		
		echo '<div class="alert alert-warning fw-builder-alert">';
		echo 'Text field <strong>' . $lang . '</strong> is empty';
		echo '</div>';
		
	}
	
	echo htmlspecialchars_decode ( $element['inputs']['text']['en'] );
	
}