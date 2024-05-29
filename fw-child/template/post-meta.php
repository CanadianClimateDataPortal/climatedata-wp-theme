<?php
// Initialize news post ID.
$news_post_id = get_the_ID();

// Initialize taxonomies.
$tax_news_topic  = get_the_terms( $news_post_id, 'news-topic' );
$tax_news_author = get_the_terms( $news_post_id, 'news-author' ); ?>

<div class="news-meta-block p-3 border border-gray-600">
	<div class="news-meta-item mb-3 mb-lg-4">
		<span class="mb-1 all-caps text-blue-100 d-block"><?php _e ( 'Date', 'cdc' ); ?></span>

		<?php

			the_time ( __( 'F j, Y', 'cdc' ) );

		?>
	</div>

	<?php
	// News authors.
	if ( is_array( $tax_news_author ) && ! empty( $tax_news_author ) ) {
		?>
		<div class="news-meta-item mb-3 mb-lg-4">
			<span class="mb-1 all-caps text-blue-100 d-block"><?php _e( 'Author', 'cdc' ); ?></span>

			<?php
			echo implode( ', ', array_map( function ( $term ) {
				return $term->name;
			}, $tax_news_author ) ); ?>
		</div>
		<?php
	}

	// News topics.
	if ( is_array( $tax_news_topic ) && ! empty( $tax_news_topic ) ) {
		?>
		<div class="news-meta-item mb-3 mb-lg-4">
			<span class="mb-1 all-caps text-blue-100 d-block"><?php _e( 'Topics', 'cdc' ); ?></span>

			<?php
			echo implode( ', ', array_map( function ( $term ) {
				return $term->name;
			}, $tax_news_topic ) ); ?>
		</div>
		<?php
	}
	?>

	<div class="news-meta-item">
		<span class="mb-1 all-caps text-blue-100 d-block"><?php _e ( 'Share this post', 'cdc' ); ?></span>

		<div id="post-share-wrap">
			<div id="share"></div>
		</div>
	</div>
</div>