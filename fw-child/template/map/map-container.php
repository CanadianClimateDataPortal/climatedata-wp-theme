<div class="map-container min-height-100">
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
		<div class="d-flex">
			
			<div id="map-control-zoom" class="d-flex">
				<div id="map-zoom-in" class="map-zoom-btn zoom-in">+</div>
				<div id="map-zoom-out" class="map-zoom-btn zoom-out">-</div>
			</div>
			
			<div id="map-control-time" class="flex-grow-1 d-flex align-items-center px-3">
				<div class="">1970</div>
				
				<div class="flex-grow-1 d-flex">
					<label for="decade" class="form-label sr-only">Decade</label>
					<input type="hidden" name="decade" id="decade" data-query-key="decade">
					<div id="decade-slider">
						<div id="decade-slider-handle" class="ui-slider-handle">
							<span></span>
						</div>
					</div>
				</div>
				
				<div class="">2100</div>
			</div>
			
		</div>
	</div>
</div>