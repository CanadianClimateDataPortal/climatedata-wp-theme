<?php

	$item_template = 'template/query/item.php';
	
	if (
		isset ( $options['template'] ) && 
		$options['template'] != '' &&
		locate_template ( 'template/query/' . $options['template'] ) != ''
	) {
		
		$item_template = 'template/query/' . $options['template'];
		
	}
	
	// dumpit ( $element['query']->query );
	
	if ( $element['query']->have_posts() ) {
		
		while ( $element['query']->have_posts() ) {
			$element['query']->the_post();
			
			$item = get_the_ID();
			
			include ( locate_template ( $item_template ) );
			
		}
		
	} else {
		
?>

<div class="alert alert-warning">No items found.</div>

<?php
		
	}

?>