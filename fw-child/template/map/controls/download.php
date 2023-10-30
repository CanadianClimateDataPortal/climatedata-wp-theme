<div id="download" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex justify-content-between">
				<h5>Download</h5>
				<span class="tab-drawer-close">&times;</span>
			</div>
			
			<div class="control-tab-body">
				
				<h6><?php _e ( 'Share URL', 'cdc' ); ?></h6>
				
				<div id="map-control-share" class="map-control-item bg-white me-2">
					<p><?php _e ( 'Copy a shareable URL containing the current map view and parameters', 'cdc' ); ?></p>
					
					<a href="#" class="btn btn-secondary" id="copy-permalink">
						<span class="btn-icon"><i class="far fa-copy"></i></span>
						<span class="btn-text"><?php _e ( 'Copy link to this map', 'cdc' ); ?></span>
					</a>
					
				</div>
				
				<h6><?php _e ( 'Export Data', 'cdc' ); ?></h6>
				
				<div id="map-control-aggregation" class="map-control-item conditional-trigger bg-white me-2">
					<h6><?php _e ( 'Data Area', 'cdc' ); ?></h6>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="download-area" id="download-area-select" checked>
						<label class="form-check-label" for="download-area-select"><?php _e ( 'Select regions', 'cdc' ); ?></label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="download-area" id="download-area-draw">
						<label class="form-check-label" for="download-area-draw"><?php _e ( 'Draw custom region', 'cdc' ); ?></label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="download-area" id="download-area-custom" data-conditional="#download-area-shapefile">
						<label class="form-check-label" for="download-area-custom"><?php _e ( 'Custom shapefile', 'cdc' ); ?></label>
					</div>
					
					<div id="download-area-shapefile" class="bg-gray-200 p-2">
						<label for="download-area-shapefile-input" class="form-label"><?php _e ( 'Drop your GeoJSON file here to upload', 'cdc' ); ?></label>
						<input class="form-control form-control-sm" id="download-area-shapefile-input" type="file">
					</div>
					
				</div>
				
			</div>
		</div>
	</div>
</div>