<div class="fw-query-pagination <?php echo implode ( ' ', $options['class'] ); ?>">
	
		<?php
		
			if ( $options['buttons'] == 'true' ) {
				
		?>
		
		<div class="fw-query-pagination-btn previous <?php echo $options['btn_class']; ?>">Previous</div>
		
		<?php
				
			}
		
			if ( $options['number'] == 'true' ) {
				
		?>
		
		<div class="fw-query-pagination-numbers <?php echo $options['page_class']; ?>">
			<span class="number-label-page">Page</span>
			<span class="number-label-current">1</span>
			<span class="number-label-of">of</span>
			<span class="number-label-max">1</span>
		</div>
		
		<?php
				
			}
			
			if ( $options['buttons'] == 'true' ) {
					
		?>
		
		<div class="fw-query-pagination-btn next <?php echo $options['btn_class']; ?>">Next</div>
		
		
		<?php
				
			}
			
		?>
		
</div>