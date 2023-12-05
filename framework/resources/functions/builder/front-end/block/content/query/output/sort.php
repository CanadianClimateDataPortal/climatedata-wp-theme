<div class="fw-query-sort-menu <?php echo implode ( ' ', $options['class'] ); ?>">
	<div class="sort-head <?php echo $options['heading_class']; ?>"><?php _e ( 'Sort', 'fw' ); ?></div>
	
	<ul class="fw-query-sort <?php echo $options['list_class']; ?>">
		<?php
		
			if ( $options['title_asc'] == true ) {
				
		?>
		
		<li data-sort="title_asc"><?php _e ( 'Title (Ascending)', 'fw' ); ?></li>
		
		<?php
				
			}
		
			if ( $options['title_desc'] == true ) {
				
		?>
		
		<li data-sort="title_desc"><?php _e ( 'Title (Descending)', 'fw' ); ?></li>
		
		<?php
				
			}
			
			if ( $options['date_desc'] == true ) {
				
		?>
		
		<li data-sort="date_desc"><?php _e ( 'Date (Newest First)', 'fw' ); ?></li>
		
		<?php
					
			}
		
			if ( $options['date_asc'] == true ) {
				
		?>
		
		<li data-sort="date_asc"><?php _e ( 'Date (Oldest First)', 'fw' ); ?></li>
		
		<?php
				
			}
			
		?>
		
	</ul>
	
	<?php 
	
		dumpit ( $options );
	
	?>
</div>