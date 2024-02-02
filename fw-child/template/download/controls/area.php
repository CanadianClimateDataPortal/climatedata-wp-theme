<div id="area" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex justify-content-between">
				<h5><?php _e ( 'Area of Analysis', 'cdc' ); ?></h5>
				<span class="tab-drawer-close">&times;</span>
			</div>
			
			<div class="control-tab-body">
				
				<div id="map-control-aggregation" class="map-control-item conditional-trigger">
					<h6 class="all-caps text-secondary"><?php _e ( 'Change Aggregation', 'cdc' ); ?></h6>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="area-aggregation" id="area-aggregation-grid" checked>
						<label class="form-check-label" for="area-aggregation-grid"><?php _e ( 'Gridded Data', 'cdc' ); ?></label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="area-aggregation" id="area-aggregation-csd">
						<label class="form-check-label" for="area-aggregation-csd"><?php _e ( 'Census Subdivisions', 'cdc' ); ?></label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="area-aggregation" id="area-aggregation-health">
						<label class="form-check-label" for="area-aggregation-health"><?php _e ( 'Health Regions', 'cdc' ); ?></label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="area-aggregation" id="area-aggregation-watershed">
						<label class="form-check-label" for="area-aggregation-watershed"><?php _e ( 'Watersheds', 'cdc' ); ?></label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="area-aggregation" id="area-aggregation-custom" data-conditional="#area-aggregation-shapefile">
						<label class="form-check-label" for="area-aggregation-custom"><?php _e ( 'Custom shapefile', 'cdc' ); ?></label>
					</div>
					
					<div id="area-aggregation-shapefile" class="bg-gray-200 p-2">
						<label for="area-aggregation-shapefile-input" class="form-label"><?php _e ( 'Drop your GeoJSON file here to upload', 'cdc' ); ?></label>
						<input class="form-control form-control-sm" id="area-aggregation-shapefile-input" type="file">
					</div>
					
				</div>
				
				<div id="map-control-search" class="map-control-item">
					<label for="area-search" class="h6 all-caps text-secondary">Search &amp; Zoom</label>
					
					<input type="text" class="form-control" name="area-search" placeholder="City, landmark or postal code">
				</div>
				
				<div id="map-control-coords" class="map-control-item">
					<h6 class="all-caps text-secondary">Change Coordinates</h6>
					
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
</div>