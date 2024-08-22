<?php

$related_content = get_field( 'related_content', $item['id'] );

?>

<div class="card no-resize has-links">
	
	<div class="bg-gray-400 border-bottom border-gray-400">
		<a class="hover-toggle" href="<?php echo $item['permalink']; ?>">
			<div class="card-img item-thumb" <?php echo has_post_thumbnail( $item['id'] ) ? 'style="background-image: url(' . get_the_post_thumbnail_url( $item['id'], 'medium_large' ) . ');"' : '' ?>></div>
		</a>
	</div>
	
	<div class="card-body d-flex flex-column">
		<h5 class="card-title item-title">
			<a href="<?php echo $item['permalink']; ?>" class="text-secondary"><?php echo $item['title']; ?></a>
		</h5>
		
		<div>
			<?php echo apply_filters ( 'the_content', fw_get_field ( 'app_brief', $item['id'] ) ); ?>
		</div>

		<p class="text-end pt-3 mt-auto mb-1">
			<a class="text-primary fw-bold" href="<?php echo $item['permalink']; ?>" class="text-secondary"><?php _e( 'Launch App', 'cdc' ) ?></a><a class="text-primary fw-bold text-decoration-none" href="<?php echo $item['permalink']; ?>" class="text-secondary"> &rarr;</a>
		</p>

		<?php

		if ( ! empty( $related_content ) ) {

		?>

		<div class="related-content pt-3">
			<h6 class="all-caps fw-bold"><?php _e( 'Related Content', 'cdc' ); ?></h6>

			<ul class="mb-1">
				<?php

				foreach ( $related_content as $related_item ) {

					if ( isset( $GLOBALS['fw']['current_lang_code'] ) && $GLOBALS['fw']['current_lang_code'] !== 'en' ) {

						$item_title = get_field( 'title_' . $GLOBALS['fw']['current_lang_code'], $related_item );

					} else {

						$item_title = get_the_title( $related_item );

					}

				?>

					<li>
						<a class="text-secondary" href="<?php echo esc_url( get_the_permalink( $related_item ) ); ?>"><?php echo esc_html( $item_title ); ?></a>
					</li>

				<?php

				}

				?>
			</ul>
		</div>

		<?php

		}

		?>

	</div>
</div>
