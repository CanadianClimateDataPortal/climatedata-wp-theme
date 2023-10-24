<div id="area" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex justify-content-between">
				<h5>Area of Analysis</h5>
				<span class="tab-drawer-close">&times;</span>
			</div>
			
			<div class="control-tab-body">
				
				<div id="map-control-aggregation" class="map-control-item conditional-trigger">
					<h6>Change Aggregation</h6>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="area-aggregation" id="area-aggregation-grid" checked>
						<label class="form-check-label" for="area-aggregation-grid">Gridded Data</label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="area-aggregation" id="area-aggregation-csd">
						<label class="form-check-label" for="area-aggregation-csd">Census Subdivisions</label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="area-aggregation" id="area-aggregation-health">
						<label class="form-check-label" for="area-aggregation-health">Health Regions</label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="area-aggregation" id="area-aggregation-watershed">
						<label class="form-check-label" for="area-aggregation-watershed">Watersheds</label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="area-aggregation" id="area-aggregation-custom" data-conditional="#area-aggregation-shapefile">
						<label class="form-check-label" for="area-aggregation-custom">Custom shapefile</label>
					</div>
					
					<div id="area-aggregation-shapefile" class="bg-gray-200 p-2">
						<label for="area-aggregation-shapefile-input" class="form-label"><?php _e ( 'Drop your GeoJSON file here to upload', 'cdc' ); ?></label>
						<input class="form-control form-control-sm" id="area-aggregation-shapefile-input" type="file">
					</div>
					
				</div>
				
				<div id="map-control-search" class="map-control-item">
					<label for="area-search" class="h6">Search &amp; Zoom</label>
					
					<input type="text" class="form-control" name="area-search" placeholder="City, landmark or postal code">
				</div>
				
				<div id="map-control-coords" class="map-control-item">
					<h6>Change Coordinates</h6>
					
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
</div>