<?php
// Initialize news post ID.
$news_post_id = get_the_ID();

// Initialize taxonomies.
$tax_news_topic  = get_the_terms( $news_post_id, 'news-topic' );
$tax_news_author = get_the_terms( $news_post_id, 'news-author' ); 

// Initialize current language.
$current_lang = 'en';

if ( isset( $GLOBALS['fw'] ) && isset( $GLOBALS['fw']['current_lang_code'] ) && in_array( $GLOBALS['fw']['current_lang_code'], array(
		'en',
		'fr'
	), true ) ) {
	$current_lang = $GLOBALS['fw']['current_lang_code'];
}
?>

<div class="news-meta-block p-3 border border-gray-600 row">
	<div class="news-meta-item mb-3 mb-lg-4 col-md-8 col-xl-16 pe-md-3 pe-xl-0">
		<span class="mb-1 all-caps text-blue-100 d-block"><?php _e ( 'Date', 'cdc' ); ?></span>

		<?php

			the_time ( __( 'F j, Y', 'cdc' ) );

		?>
	</div>

	<?php
	// News authors.
	if ( is_array( $tax_news_author ) && ! empty( $tax_news_author ) ) {
		?>
		<div class="news-meta-item mb-3 mb-lg-4 col-md-8 col-xl-16">
			<span class="mb-1 all-caps text-blue-100 d-block"><?php _e( 'Author', 'cdc' ); ?></span>

			<?php
			echo implode( ', ', array_map( function ( $term ) {
				return ( 'en' === $current_lang ) ? $term->name : get_field( 'admin_term_title_fr', $term );
			}, $tax_news_author ) ); ?>
		</div>
		<?php
	}

	// News topics.
	if ( is_array( $tax_news_topic ) && ! empty( $tax_news_topic ) ) {
		?>
		<div class="news-meta-item mb-3 mb-lg-4 col-md-8 col-xl-16 pe-md-3 pe-xl-0">
			<span class="mb-1 all-caps text-blue-100 d-block"><?php _e( 'Topics', 'cdc' ); ?></span>

			<?php
			echo implode( ', ', array_map( function ( $term ) {
				return ( 'en' === $current_lang ) ? $term->name : get_field( 'admin_term_title_fr', $term );
			}, $tax_news_topic ) ); ?>
		</div>
		<?php
	}
	?>

	<div class="news-meta-item col-md-8 col-xl-16">
		<span class="mb-1 all-caps text-blue-100 d-block"><?php _e ( 'Share this post', 'cdc' ); ?></span>

		<div id="post-share-wrap">
			<div id="share"></div>
		</div>
	</div>
</div>