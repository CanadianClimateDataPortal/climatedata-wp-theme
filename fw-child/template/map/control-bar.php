<div id="control-bar" class="col-2 col-sm-1 control-bar tab-drawer-tabs-container d-flex flex-column align-items-center">
	<div class="sidebar-header w-100">
		<?php
		include ( locate_template ( 'template/header-logo.php' ) );
		?>
		<a href="#menu" id="menu-trigger" data-bs-toggle="offcanvas" class="d-flex justify-content-center p-2"><i id="header-menu-icon" class="fas fa-align-left text-white"></i></a>
	</div>
	<div id="control-bar-tabs" class="tab-drawer-tabs w-100 pt-2">
		<a href="#data" class="control-bar-tab-link tab-drawer-trigger">
			<span class="cdc-icon"><?php

				echo file_get_contents ( locate_template ( 'resources/img/icon-data.svg' ) );

			?></span>
			<span><?php _e ( 'Data', 'cdc' ); ?></span>
		</a>

		<a href="#location" class="control-bar-tab-link tab-drawer-trigger">
			<span class="cdc-icon"><?php

				echo file_get_contents ( locate_template ( 'resources/img/icon-location.svg' ) );

			?></span>
			<span><?php _e ( 'Location', 'cdc' ); ?></span>
		</a>

		<a href="#display" class="control-bar-tab-link tab-drawer-trigger">
			<span class="cdc-icon"><?php

				echo file_get_contents ( locate_template ( 'resources/img/icon-display.svg' ) );

			?></span>
			<span><?php _e ( 'Display', 'cdc' ); ?></span>
		</a>

		<a href="#download" class="control-bar-tab-link tab-drawer-trigger">
			<span class="cdc-icon"><?php

				echo file_get_contents ( locate_template ( 'resources/img/icon-download.svg' ) );

			?></span>
			<span><?php _e ( 'Download', 'cdc' ); ?></span>
		</a>
	</div>

	<div id="control-bar-secondary" class="w-100 mt-auto text-center">

		<a href="#help" class="control-bar-tab-link m-2"  data-bs-toggle="offcanvas" data-bs-target="#help">
			<span class="cdc-icon"><?php

				echo file_get_contents ( locate_template ( 'resources/img/icon-help.svg' ) );

			?></span>

			<span><?php _e ( 'Help', 'cdc' ); ?></span>
		</a>

		<?php
		$feedback_slug = 'feedback';

		if ( $GLOBALS['fw']['current_lang_code'] == 'fr' )
			$feedback_slug = 'retroaction';
		?>

		<a href="<?php echo home_url ( $feedback_slug ); ?>" class="control-bar-text-link"><?php _e ( 'Feedback', 'cdc' ); ?></a>
	</div>

	<div id="tab-drawer-container" class="tab-drawer-container">
		<?php

			include ( locate_template ( 'template/map/controls/data.php' ) );

			include ( locate_template ( 'template/map/controls/location.php' ) );

			include ( locate_template ( 'template/map/controls/display.php' ) );

			include ( locate_template ( 'template/map/controls/download.php' ) );

		?>
	</div>
</div>
