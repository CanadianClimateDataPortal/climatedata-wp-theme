<div id="control-bar" class="control-bar tab-drawer">
	<?php 
	
		// LOGO
		
		include ( locate_template ( 'template/header-logo.php' ) );
		
		// MENU
		
		include ( locate_template ( 'template/header-menu.php' ) );
		
	?>
	
	<div id="control-bar-tabs" class="tab-drawer-tabs">
		<a href="#data">
			<span class="cdc-icon"></span>
			<span>Data</span>
		</a>
		
		<a href="#location">
			<span class="cdc-icon"></span>
			<span>Location</span>
		</a>
		
		<a href="#display">
			<span class="cdc-icon"></span>
			<span>Display</span>
		</a>
		
		<a href="#download">
			<span class="cdc-icon"></span>
			<span>Download</span>
		</a>
	</div>
	
	<div id="tab-drawer-container" class="tab-drawer-container">
		<?php
		
			include ( locate_template ( 'template/map/controls/data.php' ) );
		
			include ( locate_template ( 'template/map/controls/location.php' ) );
			
		?>
		
		<div id="display" class="tab-drawer">
			<div class="tab-drawer-content">
				<div class="tab-drawer-content-inner">
					<div class="control-tab-head d-flex justify-content-between">
						<h5>Display</h5>
						<span class="tab-drawer-close">&times;</span>
					</div>
					
					<div class="control-tab-body">
						
						<div id="map-control-panels" class="map-control-item">
							
							<div class="mb-2">
								<div class="form-check form-switch">
									<input class="form-check-input" type="checkbox" role="switch" id="display-panels-ssp5" value="ssp5" checked>
									<label class="form-check-label" for="display-panels-ssp5">High emissions (SSP 5–8.5)</label>
								</div>
							</div>
							
							<div class="mb-2">
								<div class="form-check form-switch">
									<input class="form-check-input" type="checkbox" role="switch" id="display-panels-ssp2" value="ssp2" checked>
									<label class="form-check-label" for="display-panels-ssp2">Medium emissions (SSP 2–4.5)</label>
								</div>
							</div>
							
							<div class="mb-2">
								<div class="form-check form-switch">
									<input class="form-check-input" type="checkbox" role="switch" id="display-panels-ssp1" value="ssp1" checked>
									<label class="form-check-label" for="display-panels-ssp1">Low emissions (SSP 1–2.6)</label>
								</div>
							</div>
							
						</div>
						
					</div>
				</div>
			</div>
		</div>
		
		<div id="download" class="tab-drawer">
			<div class="tab-drawer-content">
				<div class="tab-drawer-content-inner">
					<div class="control-tab-head d-flex justify-content-between">
						<h5>Download</h5>
						<span class="tab-drawer-close">&times;</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>