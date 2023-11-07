<div id="control-bar" class="control-bar tab-drawer-tabs-container">
	<?php 
	
		// LOGO
		
		include ( locate_template ( 'template/header-logo.php' ) );
		
	?>
	
	<a href="#menu" id="menu-trigger" class="d-block p-1"><i class="fas fa-align-left text-white"></i></a>
	
	<div id="control-bar-tabs" class="tab-drawer-tabs">
		<a href="#data" class="tab-drawer-trigger">
			<span class="cdc-icon"></span>
			<span><?php _e ( 'Data', 'cdc' ); ?></span>
		</a>
		
		<a href="#location" class="tab-drawer-trigger">
			<span class="cdc-icon"></span>
			<span><?php _e ( 'Location', 'cdc' ); ?></span>
		</a>
		
		<a href="#display" class="tab-drawer-trigger">
			<span class="cdc-icon"></span>
			<span><?php _e ( 'Display', 'cdc' ); ?></span>
		</a>
		
		<a href="#download" class="tab-drawer-trigger">
			<span class="cdc-icon"></span>
			<span><?php _e ( 'Download', 'cdc' ); ?></span>
		</a>
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