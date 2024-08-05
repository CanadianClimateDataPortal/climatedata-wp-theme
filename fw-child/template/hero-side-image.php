<?php

//
// A template to insert an image in a hero.
// The image is from the field "hero_side_image"
//

$image = get_field( 'hero_side_image' );

if ( $image ) {

?>

<div class="hero-side-image">
    <?php echo wp_get_attachment_image( $image, 'full' ); ?>
</div>

<?php

} elseif ( is_user_logged_in() ) {

?>

<div class="alert alert-warning fw-builder-alert">Custom field <code>hero_side_image</code> is empty. Click <span class="py-1 px-2 mx-1 text-bg-light"><i class="fas fa-pencil-alt me-2"></i>Edit in Wordpress</span> to add a value.</div>

<?php
}
