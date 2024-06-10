<?php
// Initialize news post ID.
$news_post_id = $item['id'] ?? 0;

// Initialize taxonomies.
$tax_news_topic  = get_the_terms( $news_post_id, 'news-topic' );
$tax_news_author = get_the_terms( $news_post_id, 'news-author' );

// Initialize current language.
$current_lang = 'en';

if ( isset( $item['lang'] ) ) {
	$current_lang = 'fr';
}
?>

<div class="card">
	<?php
	
		if ( has_post_thumbnail ( $item['id'] ) ) {
			
	?>
	
	<div class="bg-dark">
		<div class="card-img item-thumb" style="background-image: url(<?php echo get_the_post_thumbnail_url( $item['id'], 'medium' ); ?>);"></div>
	</div>
	
	<?php
	
		}

	?>
	
	<div class="card-body">
		<h5 class="card-title item-title"><a href="<?php echo $item['permalink']; ?>" class="text-secondary stretched-link"><?php echo $item['title']; ?></a></h5>

		<div class="mb-3">
			<?php
			echo get_post_time( 'F j, Y', false, $item['id'] ); ?>
		</div>

		<div class="row row-cols-2 card-meta">
			<?php
			// News topics.
			if ( is_array( $tax_news_topic ) && ! empty( $tax_news_topic ) ) {
				?>
				<div class="col">
					<div class="card-meta-item">
						<span class="all-caps text-secondary"><?php _e( 'Topics', 'cdc' ); ?></span>

						<p class="text-gray-600">
							<?php
							echo implode( ', ', array_map( function ( $term ) use ( $current_lang ) {
								return ( 'en' === $current_lang ) ? $term->name : get_field( 'admin_term_title_fr', $term );
							}, $tax_news_topic ) ); ?>
						</p>
					</div>
				</div>
				<?php
			}
			?>
			
			<?php
			// News authors.
			if ( is_array( $tax_news_author ) && ! empty( $tax_news_author ) ) {
				?>
				<div class="col">
					<div class="card-meta-item">
						<span class="all-caps text-secondary"><?php _e( 'Author', 'cdc' ); ?></span>

						<p class="text-gray-600">
							<?php
							echo implode( ', ', array_map( function ( $term ) use ( $current_lang ) {
								return ( 'en' === $current_lang ) ? $term->name : get_field( 'admin_term_title_fr', $term );
							}, $tax_news_author ) ); ?>
						</p>
					</div>
				</div>
				<?php
			}
			?>
		</div>
	</div>
</div>
