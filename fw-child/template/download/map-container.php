<div class="map-container min-height-100">
	<div id="map-breadcrumb">
		<ol class="breadcrumb">
			<li class="breadcrumb-item"><?php _e ( 'Climate Data Canada', 'cdc' ); ?></li>
			<li class="breadcrumb-item"><?php _e ( 'Download', 'cdc' ); ?></li>
			<li id="breadcrumb-variable" class="breadcrumb-item" style="display: none;"></li>
			<!-- <li id="breadcrumb-overlay-trigger" class="" data-bs-toggle="offcanvas" data-bs-target="#info"></li> -->
		</ol>
	</div>
	
	<div id="help" class="map-page-overlay offcanvas offcanvas-top" tabindex="-1">
		<div class="offcanvas-body p-4 pe-6">
			<p class=""><?php _e ( 'This section allows you to select areas of the map, set your own thresholds for a variety of climate indices, and make choices about the number of climate models, emissions pathways and percentiles you would like to use for your analysis.', 'cdc' ); ?></p>
			<p class="mb-4"><?php _e ( 'Use the tabs to build and customize your request. Once you’ve made your selections, the data will be processed and you will be notified by email when it is available.', 'cdc' ); ?></p>
			
			<div class="map-overlay-btns d-flex">
				<button type="button" class="btn btn-sm bg-opacity-20 text-light rounded-pill me-3" data-bs-dismiss="offcanvas" aria-label="Close"><?php _e ( 'Dismiss', 'cdc' ); ?></button>
				
				<div class="form-check form-switch">
					<input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">
					<label class="form-check-label" for="flexSwitchCheckDefault"><?php _e ( 'Don’t show again', 'cdc' ); ?></label>
				</div>
			</div>
		</div>
	</div>
	
	<div id="map-objects" class="d-flex">
		<div id="map-low" data-map-key="low" class="map-panel hidden">
			<div id="map-object-low" class="leaflet-object"></div>
			<div class="map-label rounded-pill bg-light bg-opacity-90 px-3 py-1">
				<span class="scenario-name" data-dataset="cmip6" data-name="ssp585">SSP 5–8.5</span><
			</div>
		</div>
		
		<div id="map-medium" data-map-key="medium" class="map-panel hidden">
			<div id="map-object-medium" class="leaflet-object"></div>
			<div class="map-label rounded-pill bg-light bg-opacity-90 px-3 py-1">
				<span class="scenario-name" data-dataset="cmip6" data-name="ssp245">SSP 2–4.5</span>
			</div>
		</div>
		
		<div id="map-high" data-map-key="high" class="map-panel">
			<div id="map-object-high" class="leaflet-object"></div>
			<div class="map-label rounded-pill bg-light bg-opacity-90 px-3 py-1">
				<span class="scenario-name" data-dataset="cmip6" data-name="ssp585">SSP 5–8.5</span>
			</div>
		</div>
	</div>
	
	<div id="map-control-footer">
		
		<div id="map-control-zoom">
			<div id="map-zoom-in" class="map-zoom-btn zoom-in">+</div>
			<div id="map-zoom-out" class="map-zoom-btn zoom-out">-</div>
		</div>
		
	</div>
</div>

<div id="status"></div>