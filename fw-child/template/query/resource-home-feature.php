<?php
// Initialize current language.
$current_lang = 'en';

if ( isset( $item['lang'] ) && in_array( $item['lang'], array( 'en', 'fr' ), true ) ) {
	$current_lang = $item['lang'];
}

$excerpts = array(
	'en' => get_field( 'excerpt', $item['id'] ),
	'fr' => get_field( 'excerpt_fr', $item['id'] ),
);
?>

<div class="card mb-5 shadow scroll-card" data-post-id="<?php echo esc_attr( $item['id'] ); ?>">

	<a href="<?php echo esc_url( $item['permalink'] ); ?>">

		<div class="ratio ratio-3x2 bg-dark">

			<?php

			if ( has_post_thumbnail( $item['id'] ) ) {

				?>

			<div class="card-img item-thumb h-100 opacity-100" style="background-image: url(<?php echo esc_url( get_the_post_thumbnail_url( $item['id'], 'medium_large' ) ); ?>);"></div>

				<?php

			}

			?>

		</div>

		<div class="card-body text-light">

			<h5 class="card-title item-title text-light">

				<?php echo esc_html( $item['title'] ); ?>

			</h5>

			<div class="d-none d-lg-block">

				<?php echo wp_kses_post( $excerpts[ $item['lang'] ] ); ?>

			</div>

			<?php

			if ( get_field( 'asset_type', $item['id'] ) ) {

				$card_asset_type      = get_field( 'asset_type', $item['id'] );
				$card_asset_type_meta = cdc_get_asset_type_meta( $card_asset_type );

				?>

			<p class="post-type">

				<i class="me-1 <?php echo esc_attr( $card_asset_type_meta['icon'] ); ?>"></i>

				<?php echo esc_html( $card_asset_type_meta['label'] ); ?>

			</p>

				<?php

			}

			?>

		</div>

	</a>

</div>
