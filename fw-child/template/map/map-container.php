<div class="map-container min-height-100">
	<div id="map-breadcrumb">
		<ol class="breadcrumb">
			<li class="breadcrumb-item"><a href="<?php echo home_url(); ?>"><?php _e ( 'Climate Data Canada', 'cdc' ); ?></a></li>
			<li class="breadcrumb-item"><?php _e ( 'Map', 'cdc' ); ?></li>
			<li id="breadcrumb-variable" class="breadcrumb-item"></li>
			<li id="breadcrumb-overlay-trigger" class="" data-bs-toggle="offcanvas" data-bs-target="#info"></li>
		</ol>
	</div>
	
	<div id="help" class="map-page-overlay offcanvas offcanvas-top" tabindex="-1">
		<div class="offcanvas-body p-4 pe-6">
			<p class="mb-4"><?php _e ( 'Explore maps and charts of climate data. Click on the Data tab on the left to access different variables. Do a location search or zoom in to visualize time series charts.', 'cdc' ); ?></p>
			
			<div class="map-overlay-btns d-flex">
				<button id="page-tour-start" class="btn btn-sm bg-opacity-20 text-light rounded-pill me-3"><?php _e ( 'How to use this page', 'cdc' ); ?></button>
				
				<button type="button" class="btn btn-sm bg-opacity-20 text-light rounded-pill me-3" data-bs-dismiss="offcanvas" aria-label="Close"><?php _e ( 'Dismiss', 'cdc' ); ?></button>
				
				<div class="form-check form-switch">
					<input class="form-check-input" type="checkbox" role="switch" id="map-overlay-dontshow">
					<label class="form-check-label" for="map-overlay-dontshow"><?php _e ( 'Don’t show again', 'cdc' ); ?></label>
				</div>
			</div>
		</div>
	</div>
	
	<div id="info" class="map-page-overlay offcanvas offcanvas-top" tabindex="-1">
		<div class="offcanvas-body row">
			<div id="info-text" class="col-5-of-11 p-4 pe-5">
				<div id="info-description" class="mb-4"></div>
				
				<h6 class="all-caps mb-3 text-blue-100"><?php _e ( 'Technical Description', 'cdc' ); ?></h6>
				
				<div id="info-tech-description" class="mb-4"></div>
				
				<div class="map-overlay-btns d-flex">
					<button class="btn btn-sm bg-opacity-20 text-light rounded-pill me-3"><?php _e ( 'How to use this page', 'cdc' ); ?></button>
					
					<button type="button" class="btn btn-sm bg-opacity-20 text-light rounded-pill me-3" data-bs-dismiss="offcanvas" aria-label="Close"><?php _e ( 'Dismiss', 'cdc' ); ?></button>
				</div>
			</div>
			
			<div class="col-6-of-11 bg-dark bg-opacity-10 py-4">
				<div class="col-4-of-6 offset-1-of-6">
					<div id="info-relevant-tabs" class="d-flex align-items-center mb-4" role="tablist">
						<h6 class="col-1-of-4 all-caps mb-0"><?php _e ( 'Relevant', 'cdc' ); ?></h6>
						
						<div class="col">
							<button 
								id="info-relevant-sectors-btn" 
								class="btn btn-sm text-light rounded-pill me-2 active" 
								type="button" 
								role="tab" 
								data-bs-toggle="tab" 
								data-bs-target="#info-relevant-sectors" 
								aria-controls="info-relevant-sectors" 
								aria-selected="true"
							><?php _e ( 'Sectors', 'cdc' ); ?></button>
							
							<button 
								id="info-relevant-training-btn" 
								class="btn btn-sm text-light rounded-pill"  
								type="button" 
								role="tab" 
								data-bs-toggle="tab" 
								data-bs-target="#info-relevant-training" 
								aria-controls="info-relevant-training" 
								aria-selected="false"
							><?php _e ( 'Training', 'cdc' ); ?></button>
						</div>
					</div>
				
					<div class="tab-content" id="info-relevant-content">
						<div class="tab-pane fade show active" id="info-relevant-sectors" role="tabpanel" aria-labelledby="info-relevant-sectors-btn" tabindex="0">1...</div>
						
						<div class="tab-pane fade" id="info-relevant-training" role="tabpanel" aria-labelledby="info-relevant-training-btn" tabindex="0">2...</div>
					</div>
				
				</div>
			</div>
		</div>
	</div>
	
	<div id="map-objects" class="d-flex">
		<div id="map-low" data-map-key="low" class="map-panel hidden">
			<div id="map-object-low" class="leaflet-object"></div>
			<div class="map-label rounded-pill bg-light bg-opacity-90 px-3 py-1"><span class="scenario-name" data-dataset="cmip6" data-name="ssp126">SSP 1–2.6</span></div>
		</div>
		
		<div id="map-medium" data-map-key="medium" class="map-panel hidden">
			<div id="map-object-medium" class="leaflet-object"></div>
			<div class="map-label rounded-pill bg-light bg-opacity-90 px-3 py-1"><span class="scenario-name" data-dataset="cmip6" data-name="ssp245">SSP 2–4.5</span></div>
		</div>
		
		<div id="map-high" data-map-key="high" class="map-panel">
			<div id="map-object-high" class="leaflet-object"></div>
			<div class="map-label rounded-pill bg-light bg-opacity-90 px-3 py-1"><span class="scenario-name" data-dataset="cmip6" data-name="ssp585">SSP 5–8.5</span></div>
		</div>
	</div>
	
	<div id="map-control-footer">
		<div class="d-flex">
			
			<div id="map-control-zoom" class="d-flex border-end">
				<div id="map-zoom-in" class="map-zoom-btn zoom-in border-end">+</div>
				<div id="map-zoom-out" class="map-zoom-btn zoom-out">-</div>
			</div>
			
			<div id="map-control-time" class="flex-grow-1 d-flex align-items-center px-3">
				<div id="decade-slider-min">1970</div>
				
				<div class="flex-grow-1 d-flex">
					<label for="decade" class="form-label sr-only"><?php _e ( 'Decade', 'cdc' ); ?></label>
					<input type="hidden" name="decade" id="decade" data-query-key="decade">
					<div id="decade-slider">
						<div id="decade-slider-handle" class="ui-slider-handle" data-bs-toggle="tooltip" data-bs-title="<?php _e ( 'Move slider to adjust time period', 'cdc' ); ?>" data-bs-offset="0,20" data-bs-custom-class="white-tip">
							<span></span>
						</div>
					</div>
				</div>
				
				<div id="decade-slider-max">2100</div>
			</div>
			
		</div>
	</div>
</div>

<div id="zoom-alert" style="display: none;"><?php _e ( 'Zoom in to interact with the grid layer', 'cdc' ); ?></div>

<?php

	// PAGE TOUR

	if ( have_rows ( 'tour' ) ) {
		
?>

<div class="page-tour" id="page-tour" data-steps='<?php echo json_encode ( get_field ( 'tour' ) ); ?>'></div>

<?php

	} 

?>

<div id="status"></div>