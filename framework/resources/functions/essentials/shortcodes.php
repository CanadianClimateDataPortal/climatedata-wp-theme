<?php

//
// TIMESTAMP
//

function shortcode_timestamp ( $atts ) {

	$atts = shortcode_atts (
		array(
			'format' => 'Y-m-d',
		),
		$atts,
		'timestamp'
	);

  return current_time ( $atts['format'] );

}

add_shortcode ( 'timestamp', 'shortcode_timestamp' );

//
// FONTAWESOME ICON
//

function shortcode_icon ( $atts ) {

	$atts = shortcode_atts (
		array(
			'class' => '',
		),
		$atts,
		'i'
	);

  return '<i class="' . $atts['class'] . '"></i>';

}

add_shortcode ( 'i', 'shortcode_icon' );

//
// OBFUSCATE
//

function shortcode_obfuscate ( $atts , $content = null ) {
	return obfuscate ( $content );
}

add_shortcode ( 'obfuscate', 'shortcode_obfuscate' );
