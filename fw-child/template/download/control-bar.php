<div id="control-bar" class="control-bar tab-drawer-tabs-container d-flex flex-column align-items-center">
	<?php 
	
		// LOGO
		
		include ( locate_template ( 'template/header-logo.php' ) );
		
	?>
	
	<a href="#menu" id="menu-trigger" class="d-block p-2"><i class="fas fa-align-left text-white"></i></a>
	
	<div id="control-bar-tabs" class="tab-drawer-tabs w-100">
		<a href="#data" class="tab-drawer-trigger">
			<span class="cdc-icon">
				<?php
				
					echo file_get_contents ( locate_template ( 'resources/img/icon-data.svg' ) );
					
				?>
				<span class="alert-icon"></span>
			</span>
			
			<span>
				<span class="badge rounded-pill me-1">1</span>
				<?php _e ( 'Data', 'cdc' ); ?>
			</span>
		</a>
		
		<a href="#area" class="tab-drawer-trigger">
			<span class="cdc-icon">
				<?php
				
					echo file_get_contents ( locate_template ( 'resources/img/icon-location.svg' ) );
					
				?>
				<span class="alert-icon"></span>
			</span>
				
			<span>
				<span class="badge rounded-pill me-1">2</span>
				<?php _e ( 'Area', 'cdc' ); ?>
			</span>
		</a>
		
		<a href="#details" class="tab-drawer-trigger">
			<span class="cdc-icon">
				<?php
				
					echo file_get_contents ( locate_template ( 'resources/img/icon-display.svg' ) );
					
				?>
				<span class="alert-icon"></span>
			</span>
			
			<span>
				<span class="badge rounded-pill me-1">3</span>
				<?php _e ( 'Details', 'cdc' ); ?>
			</span>
		</a>
		
		<a href="#submit" class="tab-drawer-trigger">
			<span class="cdc-icon">
				<?php
				
					echo file_get_contents ( locate_template ( 'resources/img/icon-download.svg' ) );
					
				?>
				<span class="alert-icon"></span>
			</span>
			
			<span>
				<span class="badge rounded-pill me-1">4</span>
				<?php _e ( 'Submit', 'cdc' ); ?>
			</span>
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