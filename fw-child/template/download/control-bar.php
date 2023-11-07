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
		
		<a href="#area" class="tab-drawer-trigger">
			<span class="cdc-icon"></span>
			<span><?php _e ( 'Area', 'cdc' ); ?></span>
		</a>
		
		<a href="#details" class="tab-drawer-trigger">
			<span class="cdc-icon"></span>
			<span><?php _e ( 'Details', 'cdc' ); ?></span>
		</a>
		
		<a href="#submit" class="tab-drawer-trigger">
			<span class="cdc-icon"></span>
			<span><?php _e ( 'Submit', 'cdc' ); ?></span>
		</a>
	</div>
	
	<div id="tab-drawer-container" class="tab-drawer-container">
		<?php
		
			include ( locate_template ( 'template/download/controls/data.php' ) );
		
			include ( locate_template ( 'template/download/controls/area.php' ) );
			
			include ( locate_template ( 'template/download/controls/details.php' ) );
			
			include ( locate_template ( 'template/download/controls/submit.php' ) );
			
		?>
	</div>
</div>