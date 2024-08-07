<?php

/**
 * Shortcode function that builds and returns HTML to display social links.
 *
 * The returned HTML is a div with class `social-networks` containing an
 * unordered list (ul) of links.
 *
 * @param string[] $attributes Associative array where the key the social
 *   network id, and the value is the URL. Valid social network ids are:
 *   linkedin, x-twitter, facebook, instagram, soundcloud.
 * @return string HTML code displaying social links as list elements.
 */
function cdc_shortcode_social_links( $attributes ) {
	$network_icons = [
		'linkedin' => 'fa-linkedin',
		'x-twitter' => 'fa-x-twitter',
		'facebook' => 'fa-facebook',
		'instagram' => 'fa-instagram',
		'soundcloud' => 'fa-soundcloud',
	];

	$html = '<div class="social-networks"><ul>';

	foreach ( $attributes as $network => $url ) {
		if ( array_key_exists( $network, $network_icons ) ) {
			$url = esc_attr( $url );
			$icon = $network_icons[ $network ];
			$html .= "<li><a href='$url' target='_blank' rel='noopener'>";
			$html .= "<i class='fa-brands $icon'></i>";
			$html .= "</a></li>";
		}
	}

	$html .= '</ul></div>';

	return $html;
}

add_shortcode( 'cdc_social_links', 'cdc_shortcode_social_links' );
