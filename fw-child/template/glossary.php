<?php
// Initialize current language.
$current_lang = 'en';

if ( isset( $GLOBALS['fw'] ) && isset( $GLOBALS['fw']['current_lang_code'] ) && in_array( $GLOBALS['fw']['current_lang_code'], array(
		'en',
		'fr'
	), true ) ) {
	$current_lang = $GLOBALS['fw']['current_lang_code'];
}

$is_fr = 'fr' === $current_lang;

$glossary_query_args = array(
	'post_type'      => 'definition',
	'posts_per_page' => -1,
	'order'          => 'asc'
);

if ( $is_fr ) {
	$glossary_query_args['meta_key'] = 'glossary_term_fr';
} else {
	$glossary_query_args['orderby'] = 'title';
}

$glossary_query = new WP_Query( $glossary_query_args );


if ( $glossary_query->have_posts() ) {

	$glossary = array();

	while ( $glossary_query->have_posts() ) {
		$glossary_query->the_post();

		$term = array(
			'id'         => get_the_ID(),
			'term'       => $is_fr ? get_field( 'glossary_term_fr' ) : get_the_title(),
			'definition' => $is_fr ? get_field( 'glossary_definition_fr' ) : get_field( 'glossary_definition' )
		);

		$first_letter = mb_substr( $term['term'], 0, 1 );

		if ( ! isset( $glossary[ $first_letter ] ) ) {
			$glossary[ $first_letter ] = array();
		}

		$glossary[ $first_letter ][] = $term;
	}

}

wp_reset_postdata();

if ( is_array( $glossary ) && ! empty( $glossary ) ) { ?>

	<div class="container-fluid">

		<nav id="glossary-list-nav" class="row bg-light sticky-top border border-top-0 overflow-hidden">
			<div class="col-2 col-sm-1 bg-gray-400"></div>
			<ul class="nav col-14 col-sm-15 col-xl-14 justify-content-md-between">
	
				<?php foreach ( range( 'A', 'Z' ) as $letter ) { ?>
	
					<li class="nav-item">
						<?php if ( array_key_exists( $letter, $glossary ) ) { ?>
							<a class="smooth-scroll" href="#<?php echo $letter ?>"><?php echo $letter ?></a>
						<?php } else { ?>
							<span class="text-gray-500"><?php echo $letter ?></span>
						<?php } ?>
					</li>
	
				<?php } ?>
	
			</ul>
		</nav>
	
		<?php foreach ( $glossary as $letter => $terms ) { ?>
	
			<div id="<?php echo $letter; ?>" class="row">
	
				<div class="col-2 col-sm-1 letter border-bottom border-gray-400">
					<h2 class="font-family-serif text-secondary"><?php echo $letter; ?></h2>
				</div>
	
				<dl class="col term-list mb-0 border-bottom">
	
					<?php foreach ( $terms as $term ) { ?>
	
						<div id="def-<?php echo $term['id']; ?>" class="row py-4 align-items-start">
	
							<dt class="col-14 offset-1 col-md-4">
								<?php echo $term['term']; ?>
							</dt>
	
							<dd class="col-14 offset-1 col-md-9 col-xxl-8">
								<?php echo $term['definition']; ?>
							</dd>
	
						</div>
	
					<?php } ?>
	
				</dl>
	
			</div>

		<?php } ?>

	</div> <!-- end .container-fluid ?>

<?php
}