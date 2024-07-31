<?php

//
// Display image on the side of the regional partners hero.
//

$image = get_field( 'region_map' );
$size = 'full';

if ( $image ) {
    echo '<div class="hero-region-map">';
    echo wp_get_attachment_image( $image, $size );
    echo '</div>';
}
