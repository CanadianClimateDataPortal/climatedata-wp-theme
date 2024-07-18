<?php
// Initialize current language.
$current_lang = 'en';

if ( isset( $item['lang'] ) && in_array( $item['lang'], array( 'en', 'fr' ), true ) ) {
	$current_lang = $item['lang'];
}

$excerpts = array (
    'en' => get_field( 'excerpt', $item['id'] ),
    'fr' => get_field( 'excerpt_fr', $item['id'] ),
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

                    $card_asset_type = get_field( 'asset_type', $item['id'] );
                    $format_icon = '';
                    $format_name = '';
    
                    switch ( $card_asset_type ) {
                        case 'video' :
                            $format_icon = 'fas fa-video';
                            $format_name = __( 'Video', 'cdc' );
    
                            break;
                        case 'audio' :
                            $format_icon = 'fas fa-microphone';
                            $format_name = __( 'Audio', 'cdc' );
    
                            break;
                        case 'interactive' :
                            $format_icon = 'far fa-hand-pointer';
                            $format_name = __( 'Interactive', 'cdc' );
    
                            break;
                        case 'app' :
                            $format_icon = 'far fa-window-maximize';
                            $format_name = __( 'Application', 'cdc' );
    
                            break;
                        default : // Article.
                            $format_icon = 'far fa-newspaper';
                            $format_name = __( 'Article', 'cdc' );
    
                            break;
                    }

            ?>

            <p class="post-type">

                <i class="me-1 <?php echo $format_icon; ?>"></i>

                <?php

                    echo $format_name;

                ?>

            </p>

            <?php

                }

            ?>

        </div>

    </a>

</div>
