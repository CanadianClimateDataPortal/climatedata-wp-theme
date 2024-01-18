<div class="mb-2">
	<h6 class="all-caps text-gray-300"><?php _e ( 'Date', 'cdc' ); ?></h6>
	
	<?php 
	
		the_time ( 'F j, Y' );
	
	?>
</div>

<div class="mb-2">	
	<h6 class="all-caps text-gray-300"><?php _e ( 'Author', 'cdc' ); ?></h6>
	
	<?php
	
		the_field ( 'post_author' );
		
	?>
</div>