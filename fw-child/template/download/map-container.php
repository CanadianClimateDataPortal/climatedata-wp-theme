<div class="map-container min-height-100">
	<div id="map-breadcrumb">
		<ol class="breadcrumb">
			<li class="breadcrumb-item"><?php _e ( 'Climate Data Canada', 'cdc' ); ?></li>
			<li class="breadcrumb-item"><?php _e ( 'Map', 'cdc' ); ?></li>
		</ol>
	</div>
	
	<div id="map-objects" class="d-flex">
		<div id="map-low" class="map-panel hidden">
			<div id="map-object-low" class="leaflet-object"></div>
			<div class="map-label rounded-pill bg-light bg-opacity-90 px-3 py-1">SSP 1–2.6</div>
		</div>
		
		<div id="map-medium" class="map-panel hidden">
			<div id="map-object-medium" class="leaflet-object"></div>
			<div class="map-label rounded-pill bg-light bg-opacity-90 px-3 py-1">SSP 2–4.5</div>
		</div>
		
		<div id="map-high" class="map-panel">
			<div id="map-object-high" class="leaflet-object"></div>
			<div class="map-label rounded-pill bg-light bg-opacity-90 px-3 py-1">SSP 5–8.5</div>
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