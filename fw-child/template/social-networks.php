<?php

//
// Display social network links.
//

?>

<div class="social-networks">
    <ul>
        <?php

            // Associative array of social networks field name suffix and Font Awesome icon class
            $social_networks = [
                'linkedin' => 'fa-linkedin',
                'twitter' => 'fa-x-twitter',
                'facebook' => 'fa-facebook',
                'instagram' => 'fa-instagram',
                'soundcloud' => 'fa-soundcloud'
            ];

            foreach ( $social_networks as $network => $icon ) {
                $field_value = get_field( 'social_link_' . $network );

                if ( !empty( $field_value ) ) {

        ?>

                    <li><a href="<?php echo $field_value; ?>" target="_blank" rel="noopener"><i class="fa-brands <?php echo $icon; ?>"></i></a></li>

        <?php

                }
            }


            if ( is_user_logged_in() ) {

                foreach ( array_keys( $social_networks ) as $network ) {
                    $field_value = get_field( 'social_link_' . $network );

                    if ( empty( $field_value ) ) {

                        // show warning if logged in

        ?>

            <div class="alert alert-warning fw-builder-alert">Custom field <code>social_link_<?php echo $network; ?></code> is empty. Click <span class="py-1 px-2 mx-1 text-bg-light"><i class="fas fa-pencil-alt me-2"></i>Edit in Wordpress</span> to add a value.</div>

        <?php
                    }
                }
            }
        ?>
    </ul>
</div>
