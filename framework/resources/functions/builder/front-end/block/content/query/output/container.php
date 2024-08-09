<?php

	if ( $container_open == true ) {
		
?>
</div>

<?php

	}
	
?>

<div id="<?php echo $options['id']; ?>" class="query-container <?php echo implode ( ' ', $options['class'] ); ?>">
	
<?php

	$container_open = true;
	
?>