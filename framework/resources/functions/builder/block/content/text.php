<?php

$lang = 'en';

if ( isset ( $globals['lang'] ) ) {
	$lang = $globals['lang'];
}

if (
	isset ( $element['inputs']['text'][$lang] ) && 
	!empty ( $element['inputs']['text'][$lang] )
) {

	// echo htmlspecialchars_decode ( $element['inputs']['text'][$lang] );

	$element['text'] = htmlspecialchars_decode ( $element['inputs']['text'][$lang] );
	
	echo $element['text'];
	
} else {
	
	echo '<div class="alert alert-warning fw-builder-alert">';
	
	echo 'Text field <strong>' . $lang . '</strong> is empty';
	
	echo '</div>';
	
}