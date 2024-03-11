<?php
	
	$terms = get_the_terms ( $globals['current_query']['ID'], $element['inputs']['taxonomy'] );
	
	if ( !empty ( $terms ) ) {
	
		if ( $element['inputs']['display'] == 'list' ) {
			
?>

<ul class="<?php echo $element['inputs']['list_class']; ?>">
	<?php
	
		foreach ( $terms as $term ) {
			
	?>
	
	<li>
		
		<?php
			
			if ( $element['inputs']['link'] == 'true' ) {
				
				echo '<a href="' . get_term_link ( $term->term_id, $element['inputs']['taxonomy'] ) . '">';
				
			}
			
			echo $term->name;
			
			if ( $element['inputs']['link'] == 'true' ) {
				echo '</a>';
			}
			
		?>
	
	</li>
	
	<?php
	
		}
		
	?>
</ul>

<?php

	} elseif ( $element['inputs']['display'] == 'comma' ) {
		
		$i = 0;
		
		foreach ( $terms as $term ) {
			
			if ( $i != 0 ) echo ', ';
			
			if ( $element['inputs']['link'] == 'true' ) {
				
				echo '<a href="' . get_term_link ( $term->term_id, $element['inputs']['taxonomy'] ) . '">';
				
			}
			
			echo $term->name;
			
			if ( $element['inputs']['link'] == 'true' ) {
				echo '</a>';
			}
			
			$i++;
			
		}
		
	}
	
}
