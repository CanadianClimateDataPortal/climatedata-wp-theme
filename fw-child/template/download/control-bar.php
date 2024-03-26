<div id="control-bar" class="control-bar tab-drawer-tabs-container d-flex flex-column align-items-center">
	<?php 
	
		// LOGO
		
		include ( locate_template ( 'template/header-logo.php' ) );
		
	?>
	
	<a href="#menu" id="menu-trigger" data-bs-toggle="offcanvas" class="d-flex justify-content-center p-2"><i id="header-menu-icon" class="fas fa-align-left text-white"></i></a>
	
	<div id="control-bar-tabs" class="tab-drawer-tabs w-100">
		<a href="#data" class="control-bar-tab-link tab-drawer-trigger">
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
		
		<a href="#area" class="control-bar-tab-link tab-drawer-trigger">
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
		
		<a href="#details" class="control-bar-tab-link tab-drawer-trigger">
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
		
		<a href="#submit" class="control-bar-tab-link tab-drawer-trigger">
			<span class="cdc-icon">
				<?php
				
					echo file_get_contents ( locate_template ( 'resources/img/icon-download.svg' ) );
					
				?>
				<span class="alert-icon"></span>
			</span>
			
			<span>
				<span class="badge rounded-pill me-1">4</span>
				<?php _e ( 'Download', 'cdc' ); ?>
			</span>
		</a>
	</div>
	
	<div id="control-bar-secondary" class="w-100 mt-auto text-center">
		
		<a href="#help" class="control-bar-tab-link m-2"  data-bs-toggle="offcanvas" data-bs-target="#help">
			<span class="cdc-icon"><?php
				
				echo file_get_contents ( locate_template ( 'resources/img/icon-help.svg' ) );
				
			?></span>
			
			<span><?php _e ( 'Help', 'cdc' ); ?></span>
		</a>
		
		<a href="#about" class="control-bar-text-link">About</a>
		
		<a href="<?php echo home_url ( 'feedback' ); ?>" class="control-bar-text-link">Feedback</a>
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