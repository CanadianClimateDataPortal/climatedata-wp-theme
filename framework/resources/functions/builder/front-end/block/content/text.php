<?php

$lang = 'en';

if ( isset ( $globals['current_lang_code'] ) ) {
	$lang = $globals['current_lang_code'];
}

if (
	isset ( $element['inputs']['text'][$lang] ) && 
	!empty ( $element['inputs']['text'][$lang] )
) {

	// text exists in this language

	// convert to rich text
	
	$element['text'] = htmlspecialchars_decode ( $element['inputs']['text'][$lang] );
	
} else {
	
	// text doesn't exist in this language
	
	if ( is_user_logged_in() ) {
		
		// show warning if logged in
		
		echo '<div class="alert alert-warning fw-builder-alert">';
		echo 'Text field <strong>' . $lang . '</strong> is empty';
		echo '</div>';
		
	}
	
	// show EN
	
	$element['text'] = htmlspecialchars_decode ( $element['inputs']['text']['en'] );
	
}

$element['text'] = do_shortcode ( $element['text'] );

echo $element['text'];