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

function shortcode_obfuscate ( $atts, $content = null ) {
	return obfuscate ( $content );
}

add_shortcode ( 'obfuscate', 'shortcode_obfuscate' );

//
// BOOTSTRAP BUTTON
//

function shortcode_btn ( $atts, $content ) {
	
	$atts = shortcode_atts (
		array(
			'href' => '#',
			'target' => '',
			'id' => '',
			'class' => '',
		),
		$atts,
		'btn'
	);
	
	return '<a href="' . $atts['href'] . '" id="' . $atts['id'] . '" class="btn ' . $atts['class'] . '">' . $content . '</a>';
	
}

add_shortcode ( 'btn', 'shortcode_btn' );
