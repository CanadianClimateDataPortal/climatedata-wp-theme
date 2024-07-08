<?php
// Initialize current language.
$current_lang = 'en';

if ( isset( $item['lang'] ) && in_array( $item['lang'], array( 'en', 'fr' ), true ) ) {
	$current_lang = $item['lang'];
}

$native_excerpt = apply_filters ( 'the_content', custom_excerpt ( 20, $item['id'] ) );

$excerpts = array (
    'en' => $native_excerpt ? $native_excerpt : get_field( 'excerpt', $item['id'] ), // Overrides native excerpt with custom excerpt if present
    'fr' => get_field( 'excerpt_fr', $item['id'] ) ? get_field( 'excerpt_fr', $item['id'] ) : $native_excerpt, // Defaults back to native excerpt if no custom FR not present
);
?>

<div class="card mb-5 mb-lg-0 shadow scroll-card" data-post-id="<?php echo $item['id'] ?>">

    <a href="<?php echo $item['permalink']; ?>">

        <div class="ratio ratio-3x2 bg-dark">

            <?php

                if ( has_post_thumbnail ( $item['id'] ) ) {

            ?>

                <div class="card-img item-thumb h-100 opacity-100" style="background-image: url(<?php echo get_the_post_thumbnail_url( $item['id'], 'medium_large' ); ?>);"></div>

            <?php

                }

            ?>

        </div>

        <div class="card-body text-light">

            <h5 class="card-title item-title text-light">

                <?php

                    echo $item['title'];

                ?>

            </h5>

            <div class="d-none d-lg-block">

                <?php

                    echo wp_kses_post( $excerpts[ $item['lang'] ] );

                ?>

            </div>

            <?php

                if ( get_field ( 'asset_type', $item['id'] ) ) {

            ?>

            <p class="post-type">

                <i class="me-1 fa-solid icon-<?php the_field ( 'asset_type', $item['id'] ) ; ?>"></i>

                <?php

                    the_field ( 'asset_type', $item['id'] );

                ?>

            </p>

            <?php

                }

            ?>

        </div>

    </a>

</div>
