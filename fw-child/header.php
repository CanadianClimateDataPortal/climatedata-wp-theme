<!doctype html>
<html lang="<?php echo $GLOBALS['fw']['current_lang_code']; ?>" class="no-js">
	<head>
		<meta charset="<?php bloginfo ( 'charset' ); ?>">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<?php include ( locate_template ( 'template/google-tags-head.php' ) ); ?>
		
		<?php
		
			wp_head();
			
		?>
	</head>
	
	<body id="<?php echo $GLOBALS['ids']['body']; ?>" <?php body_class(); ?> data-key="<?php echo get_the_ID(); ?>">
		<?php
			include ( locate_template ( 'template/google-tags-body.php' ) );
			wp_body_open();
			include ( locate_template ( 'template/site-banner.php' ) );
		?>
