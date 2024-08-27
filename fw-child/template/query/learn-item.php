<?php
// Initialize current language.
$current_lang = 'en';

if ( isset( $item['lang'] ) && in_array( $item['lang'], array( 'en', 'fr' ), true ) ) {
	$current_lang = $item['lang'];
}

$native_excerpt = custom_excerpt( 20, $item['id'] );

$excerpts = array (
	'en' => get_field( 'excerpt', $item['id'] ) ? get_field( 'excerpt', $item['id'] ) : $native_excerpt, // Overrides native excerpt with custom excerpt if present
	'fr' => get_field( 'excerpt_fr', $item['id'] ) ? get_field( 'excerpt_fr', $item['id'] ) : $native_excerpt, // Defaults back to native excerpt if no custom FR not present
);
?>

<div class="card card--learn">

	<div class="bg-gray-400">
		<div class="card-img item-thumb" <?php echo has_post_thumbnail( $item['id'] ) ? 'style="background-image: url(' . get_the_post_thumbnail_url( $item['id'], 'medium_large' ) . ');"' : '' ?>></div>
	</div>

	<div class="card-body d-flex flex-column">
		<h5 class="card-title item-title">
			<a href="<?php echo $item['permalink']; ?>" class="text-secondary stretched-link">
				<?php echo $item['title']; ?>
			</a>
		</h5>

		<div class="card-desc text-gray-600">
			<?php

				echo wp_kses_post( $excerpts[ $current_lang ] );

			?>
		</div>

		<?php
		// Initialize card format and time.
		$card_asset_type = get_field( 'asset_type', $item['id'] );
		$card_asset_time = get_field( 'asset_time', $item['id'] );
		?>

		<div class="row row-cols-2 pt-3 mt-auto">
			<div class="col">
				<h6 class="all-caps fw-bold"><?php _e( 'Format', 'cdc' ); ?></h6>

				<?php
				$format_icon = '';
				$format_name = '';

				switch ( $card_asset_type ) {
					case 'video':
						$format_icon = 'fas fa-video';
						$format_name = __( 'Video', 'cdc' );

						break;
					case 'audio':
						$format_icon = 'fas fa-microphone';
						$format_name = __( 'Audio', 'cdc' );

						break;
					case 'interactive':
						$format_icon = 'far fa-hand-pointer';
						$format_name = __( 'Interactive', 'cdc' );

						break;
					case 'app':
						$format_icon = 'far fa-window-maximize';
						$format_name = __( 'App', 'cdc' );

						break;
					default : // Article.
						$format_icon = 'far fa-newspaper';
						$format_name = __( 'Article', 'cdc' );

						break;
				}
				?>

				<p class="card-asset-type mb-0 text-gray-600 d-flex align-items-center">
					<i class="<?php echo $format_icon; ?> me-2"></i>
					<span><?php echo $format_name; ?></span>
				</p>
			</div>

			<?php
			if ( ! empty( $card_asset_time ) ) {
				?>
				<div class="col">
					<h6 class="all-caps fw-bold"><?php _e( 'Time', 'cdc' ); ?></h6>

					<p class="card-asset-time mb-0 text-gray-600 d-flex align-items-center">
						<?php
						echo sprintf( __( '%s minutes', 'cdc' ), $card_asset_time);
						?>
					</p>
				</div>
				<?php
			}
			?>
		</div>
	</div>
</div>
