<div
	id="<?php echo $options['id']; ?>"
	class="fw-query-reset <?php echo implode ( ' ', $options['class'] ); ?>"
	style="display: none;"
>
	<?php
	
		if ( $options['icon'] != '' ) {
			echo $options['icon'];
		} else {
			_e ( 'Reset Filters', 'fw' );
		}
		
	?>
</div>