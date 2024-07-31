<div id="control-bar" class="control-bar tab-drawer-tabs-container">

	<div id="control-bar-tabs-footer" class="col-2 col-sm-1 text-center">
	
		<?php
		$feedback_slug = 'feedback';

		if ( $GLOBALS['fw']['current_lang_code'] == 'fr' )
			$feedback_slug = 'retroaction';
		?>

		<a href="<?php echo home_url ( $feedback_slug ); ?>#apps-support" class="control-bar-text-link"><?php _e ( 'Feedback', 'cdc' ); ?></a>

	</div>

</div>
