<div id="location" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex align-items-center justify-content-between">
				<h5 class="mb-0">Location</h5>
				<span class="tab-drawer-close btn-close"></span>
			</div>
			
			<div class="control-tab-body">
				
				<div id="map-control-search" class="map-control-item">
					<label for="area-search"  class="h6 all-caps text-secondary">Search</label>
					
					<input type="hidden" name="area-location" id="area-location" data-query-key="location">
					
					<input type="text" class="form-control" name="area-search" id="area-search" placeholder="City, landmark or postal code">
					
				</div>
				
				<div id="map-control-recent" class="map-control-item">
					<div class="d-flex justify-content-between mb-3">
						<h6 class="all-caps text-secondary mb-0">Recent Locations</h6>
						<h6 class="all-caps text-gray-600 mb-0">Clear</h6>
					</div>
					
					<div id="recent-locations" class="list-group list-group-flush">
					</div>
				</div>
					
				<div id="map-control-coords" class="map-control-item">
					<h6 class="all-caps text-secondary">Adjust Coordinates</h6>
					
					<input type="hidden" name="coords" id="coords" data-query-key="coords">
					
					<label for="coords-lat">Latitude</label>
					<input type="text" class="form-control coord-field" name="coords-lat" id="coords-lat">
					
					<label for="coords-lng">Longitude</label>
					<input type="text" class="form-control coord-field" name="coords-lng" id="coords-lng">
					
					<label for="coords-zoom">Zoom</label>
					<input type="text" class="form-control coord-field" name="coords-zoom" id="coords-zoom">
				</div>
			</div>
		</div>
	</div>
	
	<div class="tab-drawer-container">
		<?php
		
			include ( locate_template ( 'template/map/controls/location-detail.php' ) );
			
		?>
	</div>
</div>