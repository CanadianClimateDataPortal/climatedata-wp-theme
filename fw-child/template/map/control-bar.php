<div id="control-bar" class="control-bar tab-drawer-tabs-container d-flex flex-column align-items-center">
	<?php 
	
		// LOGO
		
		include ( locate_template ( 'template/header-logo.php' ) );
		
	?>
	
	<a href="#menu" id="menu-trigger" class="d-block p-2"><i class="fas fa-align-left text-white"></i></a>
	
	<div id="control-bar-tabs" class="tab-drawer-tabs w-100">
		<a href="#data" class="tab-drawer-trigger">
			<span class="cdc-icon"><?php
				
					echo file_get_contents ( locate_template ( 'resources/img/icon-data.svg' ) );
					
				?></span>
			<span><?php _e ( 'Data', 'cdc' ); ?></span>
		</a>
		
		<a href="#location" class="tab-drawer-trigger">
			<span class="cdc-icon"><?php
				
					echo file_get_contents ( locate_template ( 'resources/img/icon-location.svg' ) );
					
				?></span>
			<span><?php _e ( 'Location', 'cdc' ); ?></span>
		</a>
		
		<a href="#display" class="tab-drawer-trigger">
			<span class="cdc-icon"><?php
				
					echo file_get_contents ( locate_template ( 'resources/img/icon-display.svg' ) );
					
				?></span>
			<span><?php _e ( 'Display', 'cdc' ); ?></span>
		</a>
		
		<a href="#download" class="tab-drawer-trigger">
			<span class="cdc-icon"><?php
				
					echo file_get_contents ( locate_template ( 'resources/img/icon-download.svg' ) );
					
				?></span>
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