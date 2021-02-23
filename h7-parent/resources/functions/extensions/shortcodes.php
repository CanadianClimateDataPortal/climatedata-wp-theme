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
