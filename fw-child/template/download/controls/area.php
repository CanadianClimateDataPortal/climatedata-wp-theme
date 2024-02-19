<div id="area" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex justify-content-between">
				<div>
					<h2 class="font-family-serif text-secondary">2</h2>
					<h5><?php _e ( 'Area of Analysis', 'cdc' ); ?></h5>
					<p class="mb-0"><?php _e ( 'Use the map to select regions to add to your request.', 'cdc' ); ?></p>
				</div>
				<span class="tab-drawer-close">&times;</span>
			</div>
			
			<div class="control-tab-body">
				<div class="invalid-alert m-3" style="display: none;">
					<div class="alert alert-danger bg-white d-flex">
						<div class="me-3"><span class="alert-icon"></span></div>
						<div><ul class="list-unstyled mb-0 text-body"></ul></div>
					</div>
				</div>
				
				<div id="map-control-aggregation" class="map-control-item conditional-trigger">
					<h6 class="all-caps text-secondary"><?php _e ( 'Change Aggregation', 'cdc' ); ?></h6>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="area-aggregation" id="area-aggregation-grid" value="canadagrid" data-query-key="sector" checked>
						<label class="form-check-label" for="area-aggregation-grid"><?php _e ( 'Gridded Data', 'cdc' ); ?></label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="area-aggregation" id="area-aggregation-csd" value="" data-query-key="sector">
						<label class="form-check-label" for="area-aggregation-csd"><?php _e ( 'Census Subdivisions', 'cdc' ); ?></label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="area-aggregation" id="area-aggregation-health" value="health" data-query-key="sector">
						<label class="form-check-label" for="area-aggregation-health"><?php _e ( 'Health Regions', 'cdc' ); ?></label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="area-aggregation" id="area-aggregation-watershed" value="watershed" data-query-key="sector">
						<label class="form-check-label" for="area-aggregation-watershed"><?php _e ( 'Watersheds', 'cdc' ); ?></label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="area-aggregation" id="area-aggregation-custom" value="custom" data-query-key="sector" data-conditional="#area-aggregation-shapefile">
						<label class="form-check-label" for="area-aggregation-custom"><?php _e ( 'Custom shapefile', 'cdc' ); ?></label>
                        <a tabindex="0" role="button" id="area-aggregation-custom-tooltip" class="text-secondary">ⓘ</a>
					</div>
					
					<div id="area-aggregation-shapefile" class="bg-gray-200 p-3">
						<label for="area-aggregation-shapefile-input" class="form-label"><?php _e ( 'Drop your GeoJSON file here to upload', 'cdc' ); ?></label>
						<input class="form-control form-control-sm" id="area-aggregation-shapefile-input" type="file">
                        <div id="area-aggregation-shapefile-message" class="mt-2"></div>
					</div>
					
				</div>
				
				<div id="map-control-search" class="map-control-item">
					<label for="area-search" class="h6 all-caps text-secondary"><?php _e ( 'Search &amp; Zoom', 'cdc' ); ?></label>
					
					<input type="text" class="form-control" name="area-search" placeholder="<?php _e ( 'City, landmark or postal code', 'cdc' ); ?>">
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
			
			<div class="control-tab-footer">
				<a href="#details" class="btn btn-lg btn-secondary d-block tab-drawer-trigger"><?php _e ( 'Next', 'cdc' ); ?>: <?php _e ( 'Details', 'cdc' ); ?></a>
			</div>
		</div>
	</div>
</div>