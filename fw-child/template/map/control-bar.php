<div id="control-bar" class="control-bar tab-drawer">
	<?php 
	
		include ( locate_template ( 'template/header-logo.php' ) );
		
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
		<div id="data" class="tab-drawer-content">
			<div class="tab-drawer-content-inner">
				<div class="control-tab-head d-flex justify-content-between">
					<h5>Data Options</h5>
					<span class="tab-drawer-close">&times;</span>
				</div>
				
				<div class="control-tab-body">
					<a href="#data-variable" class="tab-drawer-trigger">Variable</a>
				</div>
			</div>
			
			<div id="data-variable" class="tab-drawer-content">
				<div class="tab-drawer-content-inner">
					<div class="control-tab-head d-flex justify-content-between">
						<h5>Select a new variable</h5>
						<span class="tab-drawer-close">&times;</span>
					</div>
					
					<div class="control-tab-body">
						<ul>
							<li><span class="tab-drawer-close">Hottest Day</span></li>
						</ul>
					</div>
				</div>
			</div>
		</div>
		
		<div id="location" class="tab-drawer-content">
			<div class="tab-drawer-content-inner">
				<div class="control-tab-head d-flex justify-content-between">
					<h5>Location</h5>
					<span class="tab-drawer-close">&times;</span>
				</div>
				
				<div class="control-tab-body">
					<a href="#location-detail" class="tab-drawer-trigger">Detail</a>
				</div>
			</div>
			
			<div id="location-detail" class="tab-drawer-content">
				<div class="tab-drawer-content-inner">
					<div class="control-tab-head d-flex justify-content-between">
						<h5>Location Detail</h5>
						<span class="tab-drawer-close">&times;</span>
					</div>
				</div>
				
				<div class="control-tab-body">
					charts
				</div>
			</div>
		</div>
		
		<div id="display" class="tab-drawer-content">
			<div class="tab-drawer-content-inner">
				<div class="tab-drawer-content-inner">
					<div class="control-tab-head d-flex justify-content-between">
						<h5>Display</h5>
						<span class="tab-drawer-close">&times;</span>
					</div>
				</div>
			</div>
		</div>
		
		<div id="download" class="tab-drawer-content">
			<div class="tab-drawer-content-inner">
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