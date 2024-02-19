<div id="download" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex align-items-center justify-content-between">
			<h5 class="mb-0">Download</h5>
				<span class="tab-drawer-close">&times;</span>
			</div>
			
			<div class="control-tab-body">
				
				<h6 class="all-caps text-secondary mx-4 my-3"><?php _e ( 'Export Image', 'cdc' ); ?></h6>
				
				<div id="map-control-img" class="map-control-item bg-white me-2">
					<p><?php _e ( 'Position the map as needed and export as a PNG image', 'cdc' ); ?></p>
					
					<a href="#" class="btn btn-secondary d-block" id="download-map-image">
						<span class="btn-icon"><i class="far fa-image"></i></span>
						<span class="btn-text"><?php _e ( 'Save map as image', 'cdc' ); ?></span>
					</a>
					
				</div>
				
				<h6 class="all-caps text-secondary mx-4 my-3"><?php _e ( 'Share URL', 'cdc' ); ?></h6>
				
				<div id="map-control-share" class="map-control-item bg-white me-2">
					<p><?php _e ( 'Copy a shareable URL containing the current map view and parameters', 'cdc' ); ?></p>
					
					<a href="#" class="btn btn-secondary d-block" id="copy-permalink">
						<span class="btn-icon"><i class="far fa-copy"></i></span>
						<span class="btn-text"><?php _e ( 'Copy link to this map', 'cdc' ); ?></span>
					</a>
					
				</div>
				
				<h6 class="all-caps text-secondary mx-4 my-3"><?php _e ( 'Export Data', 'cdc' ); ?></h6>
				
				<div id="map-control-export" class="map-control-item conditional-trigger bg-white me-2">
					<div class="mb-3">
					
						<label for="download-area" class="form-label d-block h6 all-caps text-gray-600"><?php _e ( 'Data Area', 'cdc' ); ?></label>
						
						<div class="form-check">
							<input class="form-check-input" type="radio" name="download-area" id="download-area-select" checked>
							<label class="form-check-label" for="download-area-select"><?php _e ( 'Select regions', 'cdc' ); ?></label>
						</div>
						
						<div class="form-check">
							<input class="form-check-input" type="radio" name="download-area" id="download-area-draw">
							<label class="form-check-label" for="download-area-draw"><?php _e ( 'Draw custom region', 'cdc' ); ?></label>
						</div>
						
						<div class="form-check">
							<input class="form-check-input" type="radio" name="download-area" id="download-area-custom" value="custom" data-conditional="#download-area-shapefile">
							<label class="form-check-label" for="download-area-custom"><?php _e ( 'Custom shapefile', 'cdc' ); ?></label>
                            <a tabindex="0" role="button" id="download-area-custom-tooltip" class="text-secondary">ⓘ</a>
						</div>
						
						<div id="download-area-shapefile" class="bg-gray-200 p-2">
							<label for="download-area-shapefile-input" class="form-label"><?php _e ( 'Drop your GeoJSON file here to upload', 'cdc' ); ?></label>
							<input class="form-control form-control-sm" id="download-area-shapefile-input" type="file">
                            <div id="download-area-shapefile-message" class="mt-2"></div>
						</div>
					</div>
					
					<div class="mb-3">
						<label for="download-format" class="form-label d-block h6 all-caps text-gray-600"><?php _e ( 'Export Format', 'cdc' ); ?></label>
						
						<div class="btn-group w-100">
							<input type="radio" class="btn-check" name="download-format" id="download-format-csv" value="csv" autocomplete="off" checked>
							<label class="btn btn-outline-gray-400" for="download-format-csv"><?php _e ( 'CSV', 'cdc' ); ?></label>
							
							<input type="radio" class="btn-check" name="download-format" id="download-format-json" value="json" autocomplete="off">
							<label class="btn btn-outline-gray-400" for="download-format-json"><?php _e ( 'JSON', 'cdc' ); ?></label>
							
							<input type="radio" class="btn-check" name="download-format" id="download-format-netcdf" value="netcdf" autocomplete="off">
							<label class="btn btn-outline-gray-400" for="download-format-netcdf"><?php _e ( 'NetCDF', 'cdc' ); ?></label>
						</div>
					</div>
					
					<a href="#" class="btn btn-secondary d-block" id="process-download"><?php _e ( 'Process & Download', 'cdc' ); ?></a>
					
				</div>
				
			</div>
		</div>
	</div>
</div>