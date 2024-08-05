<?php

//
// Display social network links.
//
$current_lang = 'en';

if (
    isset ( $GLOBALS['fw']['current_lang_code'] ) &&
    $GLOBALS['fw']['current_lang_code'] != 'en'
) {
    $current_lang = $GLOBALS['fw']['current_lang_code'];
}

?>

<div class="social-networks">
    <ul>
        <?php

            // Associative array of social networks field name suffix and Font Awesome icon class
            $social_networks = [
                'linkedin' => 'fa-linkedin',
                'x-twitter' => 'fa-x-twitter',
                'facebook' => 'fa-facebook',
                'instagram' => 'fa-instagram',
                'soundcloud' => 'fa-soundcloud'
            ];

            // Get the social links slug field
            $social_links_slug = get_field('social_links_slug');

            if ( !empty( $social_links_slug ) ) {

                // Get the social networks repeater field from the options page
                $groups = get_field('social_network_groups', 'option');

                if ( $groups ) {

                    // Loop through groups
                    foreach ( $groups as $group ) {

                        // Find the matching group
                        if ( $group['slug'] === $social_links_slug ) {

                            // Loop through the Social networks icons
                            foreach ( $social_networks as $network => $icon ) {

                                // Check if a URL exist for each social network and echo the icon and link
                                if ( isset( $group[$network] ) && !empty( $group[$network] ) ) {

                                    $network_url = $group[$network];

                                    // If language is not english, look for an existing language custom field
                                    if ( $current_lang != 'en' && array_key_exists( $network . '_' . $current_lang, $group ) ) {

                                        $network_url = $group[$network . '_' . $current_lang];

                                    }

        ?>

                                    <li><a href="<?php echo $network_url; ?>" target="_blank" rel="noopener"><i class="fa-brands <?php echo $icon; ?>"></i></a></li>

        <?php
                                }

                            }

                            break; // Exit the loop once the matching slug is found and processed

                        }

                    }

                }
            } elseif ( is_user_logged_in() ) {
                // Show warning if social_links_slug is empty and user is logged in
        ?>
                <div class="alert alert-warning fw-builder-alert">
                    Custom field <code>social_links_slug</code> is empty.
                    Click <span class="py-1 px-2 mx-1 text-bg-light"><i class="fas fa-pencil-alt me-2"></i>Edit in Wordpress</span> to add a value.
                    The value should correspond to a slug of a Social network group from the Social Networks tab of the Themes Settings.
                </div>
        <?php

            }

        ?>
    </ul>
</div>
