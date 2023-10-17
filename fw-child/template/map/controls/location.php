<div id="location" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex justify-content-between">
				<h5>Location</h5>
				<span class="tab-drawer-close">&times;</span>
			</div>
			
			<div class="control-tab-body">
				
				<div id="map-control-search" class="map-control-item">
					<label for="area-search" class="h6">Search</label>
					
					<input type="text" class="form-control" name="area-search" placeholder="City, landmark or postal code">
					<a href="#location-detail" class="tab-drawer-trigger">Detail</a>
				</div>
				
				<div id="map-control-recent" class="map-control-item">
					<div class="d-flex justify-content-between">
						<h6>Recent Locations</h6>
						<h6>Clear</h6>
					</div>
				</div>
					
				<div id="map-control-coords" class="map-control-item">
					<h6>Adjust Coordinates</h6>
					
					<label for="area-coords-lat">Latitude</label>
					<input type="text" class="form-control" name="area-coords-lat">
					
					<label for="area-coords-lng">Longitude</label>
					<input type="text" class="form-control" name="area-coords-lng">
					
					<label for="area-coords-zoom">Zoom</label>
					<input type="text" class="form-control" name="area-coords-zoom">
				</div>
			</div>
		</div>
	</div>
	
	<div class="tab-drawer-container">
		<div id="location-detail" class="tab-drawer">
			<div class="tab-drawer-content">
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
	</div>
</div>