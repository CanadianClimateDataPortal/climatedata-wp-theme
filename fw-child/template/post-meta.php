<h6><?php _e ( 'Date', 'cdc' ); ?></h6>

<?php 

	the_time ( 'F j, Y' );

?>

<h6><?php _e ( 'Author', 'cdc' ); ?></h6>

<?php

	the_field ( 'post_author' );
	
?>