<?php

$is_fr = $GLOBALS['fw']['current_lang_code'] != 'en';
$order_by_field = $is_fr ? 'glossary_term_fr' : 'title';

$glossary_query_args = array(
    'post_type' => 'definition',
    'posts_per_page' => -1,
    'orderby' => $order_by_field,
    'order' => 'asc'
);

if ( $is_fr ) {
	$glossary_query_args['meta_key'] = $order_by_field;
}

$glossary_query = new WP_Query($glossary_query_args);


if ( $glossary_query->have_posts() ) {

	$glossary = array();

    while ( $glossary_query->have_posts() ) {
        $glossary_query->the_post();
        
		$term = array(
            'id' => get_the_ID(),
            'term' => $is_fr ? get_field('glossary_term_fr') : get_the_title(),
            'definition' => $is_fr ? get_field('glossary_definition_fr') : get_field('glossary_definition')
        );
        
        $first_letter = mb_substr($term['term'], 0, 1);
        
        if ( !isset($glossary[$first_letter]) ) {
            $glossary[$first_letter] = array();
        }
        
        $glossary[$first_letter][] = $term;
    }

}

wp_reset_postdata();


// dumpit ( $glossary );

if ( $glossary ) :?>

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
