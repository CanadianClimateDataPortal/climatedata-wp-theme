<div id="area" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex justify-content-between">
				<h5>Area of Analysis</h5>
				<span class="tab-drawer-close">&times;</span>
			</div>
			
			<div class="control-tab-body">
				
				<div id="map-control-aggregation" class="map-control-item">
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
						<input class="form-check-input" type="radio" name="area-aggregation" id="area-aggregation-custom">
						<label class="form-check-label" for="area-aggregation-custom">Custom shapefile</label>
					</div>
					
				</div>
				
				<div id="map-control-search" class="map-control-item">
					<label for="area-search" class="h6">Search &amp; Zoom</label>
					
					<input type="text" class="form-control" name="area-search" placeholder="City, landmark or postal code">
				</div>
				
				<div id="map-control-coords" class="map-control-item">
					<h6>Change Coordinates</h6>
					
					<label for="coords-lat">Latitude</label>
					<input type="text" class="form-control" name="coords-lat" id="coords-lat">
					
					<label for="coords-lng">Longitude</label>
					<input type="text" class="form-control" name="coords-lng" id="coords-lng">
					
					<label for="coords-zoom">Zoom</label>
					<input type="text" class="form-control" name="coords-zoom" id="coords-zoom">
				</div>
				
			</div>
		</div>
	</div>
</div>