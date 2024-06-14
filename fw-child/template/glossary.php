<?php

$glossary = array();

$glossary_query = new WP_Query ( array (
	'post_type' => 'definition',
	'posts_per_page' => -1,
	'orderby' => 'title',
	'order' => 'asc'
) );

if ( $glossary_query->have_posts() ) {
	
	$current_letter = '';
	
	while ( $glossary_query->have_posts() ) {
		$glossary_query->the_post();
		
		$first_letter = substr ( get_the_title(), 0, 1 );
		
		if ( !isset ( $glossary[$first_letter] ) ) {
			$glossary[$first_letter] = array();
		}
		
		$term = array (
			'id' => get_the_ID(),
			'term' => get_the_title(),
			'definition' => get_field ( 'glossary_definition' )
		);
		
		if ( $GLOBALS['fw']['current_lang_code'] != 'en' ) {
			
			$term = array (
				'id' => get_the_ID(),
				'term' => get_field ( 'glossary_term_fr'),
				'definition' => get_field ( 'glossary_definition_fr' )
			);
			
		}
		
		$glossary[$first_letter][] = $term;
		
	}
}

// dumpit ( $glossary );

if ( !empty ( $glossary ) ) :?>

<nav id="glossary-list-nav" class="d-none d-md-flex bg-light sticky-top border overflow-hidden">
	<ul class="nav offset-1 flex-nowrap">

		<?php foreach ( range('A', 'Z') as $letter ) :?>

			<li class="nav-item">
				<?php if (array_key_exists($letter, $glossary)): ?>
					<a class="smooth-scroll" href="#<?php echo $letter ?>"><?php echo $letter ?></a>
				<?php else : ?>
					<span class="text-gray-500"><?php echo $letter ?></span>
				<?php endif; ?>
			</li>

		<?php endforeach; ?>

	</ul>
</nav>

<?php foreach ( $glossary as $letter => $terms ) :?>

	<div id="<?php echo $letter; ?>" class="row">

		<div class="col-1 letter border-bottom border-gray-400">
			<h2 class="font-family-serif text-secondary"><?php echo $letter; ?></h2>
		</div>
		
		<dl class="col term-list mb-0 border-bottom">
			
			<?php foreach ( $terms as $term ) : ?>
			
			<div id="def-<?php echo $term['id']; ?>" class="row py-4 align-items-start">
			
				<dt class="col-4-of-15 offset-1-of-15 pe-3">
					<?php echo $term['term']; ?>
				</dt>
				
				<dd class="col-6-of-15">
					<?php echo $term['definition']; ?>
				</dd>
				
			</div>
			
			<?php endforeach; ?>

		</dl>

	</div>

<?php endforeach; ?>

<?php endif; ?>
