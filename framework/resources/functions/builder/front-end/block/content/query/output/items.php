<?php

	if (
		isset ( $options['template'] ) && 
		$options['template'] != '' &&
		locate_template ( 'template/query/' . $options['template'] ) != ''
	) {
		$options['template'] = 'template/query/' . $options['template'];
	} else {
		$options['template'] = 'template/query/item.php';
	}

?>

<div
	class="fw-query-items <?php echo implode ( ' ', $options['class'] ); ?>"
	data-options='<?php echo json_encode ( $options ); ?>'
>
	<?php
		/*
		// dumpit ( $element['query']->query );
		
		if ( $element['query']->have_posts() ) {
			
			while ( $element['query']->have_posts() ) {
				$element['query']->the_post();
				
				$item = get_the_ID();
			
	?>
	
	<div class="fw-query-item <?php echo $options['item_class']; ?>">
		<?php
		
			include ( locate_template ( $options['template'] ) );
			
		?>
	</div>
			
	<?php
		
			}
			
		} else {
			
	?>
	
	<div class="alert alert-warning"><?php _e ( 'No items found.', 'fw' ); ?></div>
	
	<?php
			
		}
	*/
	?>

</div>