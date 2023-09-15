<?php

	if ( current_user_can ( 'administrator' ) ) {
		echo '<!--';
		echo "\n\n";
		echo 'vars';
		echo "\n\n";
		print_r ( $GLOBALS['vars'] );
		echo "\n\n";
		echo 'fw';
		echo "\n\n";
		print_r ( $GLOBALS['fw'] );
		echo "\n";
		echo '-->';
	}
	
?>
<!doctype html>
<html lang="<?php echo $GLOBALS['fw']['lang']; ?>" class="no-js">
	<head>
		<meta charset="<?php bloginfo ( 'charset' ); ?>">
		<meta name="viewport" content="width=device-width, initial-scale=1"> 
		
		<?php
		
			wp_head();
			
		?>
	</head>
	
	<body id="<?php echo $GLOBALS['ids']['body']; ?>" <?php body_class(); ?> data-key="<?php echo get_the_ID(); ?>">
		
		<?php
		
			wp_body_open();
			
		?>