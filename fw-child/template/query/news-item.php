<?php
// Initialize news post ID.
$news_post_id = $item['id'] ?? 0;

// Initialize taxonomies.
$tax_news_topic  = get_the_terms( $news_post_id, 'news-topic' );
$tax_news_author = get_the_terms( $news_post_id, 'news-author' );

// Initialize current language.
$current_lang = 'en';

if ( isset( $item['lang'] ) && in_array( $item['lang'], array( 'en', 'fr' ), true ) ) {
	$current_lang = $item['lang'];
}
?>

<div class="card card--news">
	<?php
	
		if ( has_post_thumbnail ( $item['id'] ) ) {
			
	?>
	
	<div class="bg-dark">
		<div class="card-img item-thumb" style="background-image: url(<?php echo get_the_post_thumbnail_url( $item['id'], 'medium_large' ); ?>);"></div>
	</div>
	
	<?php
	
		}

	?>
	
	<div class="card-body">
		<h5 class="card-title item-title mb-1"><a href="<?php echo $item['permalink']; ?>" class="text-secondary stretched-link"><?php echo $item['title']; ?></a></h5>

		<div class="card-date mb-1">
			<?php
			echo get_post_time( 'F j, Y', false, $item['id'] ); ?>
		</div>

		<?php
		// News authors.
		if ( is_array( $tax_news_author ) && ! empty( $tax_news_author ) ) {
			?>
			<div class="card-authors">
				<p class="text-gray-600">
					<?php
					echo implode( ', ', array_map( function ( $term ) use ( $current_lang ) {
						$term_name_fr = get_field( 'admin_term_title_fr', $term );
						$term_name_fr = ( empty( $term_name_fr ) ) ? $term->name : $term_name_fr;

						return ( 'en' === $current_lang ) ? $term->name : $term_name_fr;
					}, $tax_news_author ) ); ?>
				</p>
			</div>
			<?php
		}

		// News topics.
		if ( is_array( $tax_news_topic ) && ! empty( $tax_news_topic ) ) {
			?>
			<div class="card-topics mt-2">
				<span class="all-caps fw-bold"><?php _e( 'Topics', 'cdc' ); ?></span>

				<p class="text-gray-600">
					<?php
					echo implode( ', ', array_map( function ( $term ) use ( $current_lang ) {
						$term_name_fr = get_field( 'admin_term_title_fr', $term );
						$term_name_fr = ( empty( $term_name_fr ) ) ? $term->name : $term_name_fr;

						return ( 'en' === $current_lang ) ? $term->name : $term_name_fr;
					}, $tax_news_topic ) ); ?>
				</p>
			</div>
			<?php
		}
		?>
	</div>
</div>
