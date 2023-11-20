<div id="location" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex justify-content-between">
				<h5>Location</h5>
				<span class="tab-drawer-close">&times;</span>
			</div>
			
			<div class="control-tab-body">
				
				<div id="map-control-search" class="map-control-item">
					<label for="area-search" class="h6">Search</label>
					
					<input type="text" class="form-control" name="area-search" placeholder="City, landmark or postal code">
					<a href="#location-detail" class="tab-drawer-trigger">Detail</a>
				</div>
				
				<div id="map-control-recent" class="map-control-item">
					<div class="d-flex justify-content-between">
						<h6>Recent Locations</h6>
						<h6>Clear</h6>
					</div>
				</div>
					
				<div id="map-control-coords" class="map-control-item">
					<h6>Adjust Coordinates</h6>
					
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
	
	<div class="tab-drawer-container">
		<div id="location-detail" class="tab-drawer">
			<div class="tab-drawer-content">
				<div class="tab-drawer-content-inner">
					<div class="control-tab-head d-flex justify-content-between">
						<h5>Location Detail</h5>
						<span class="tab-drawer-close">&times;</span>
					</div>
					
					<div class="control-tab-body">
						<h4 class="variable-name p-3"><?php _e ( 'Hottest Day', 'cdc' ); ?></h4>
						
						<!-- summary -->
						<div id="location-summary" class="row p-3">
							<div class="col-2-of-7">
								<h6>2041 – 2070</h6>
								
								<div class="var-value-future">
									<span class="value">29.3</span>
									<span class="unit">ºC</span>
								</div>
							</div>
							
							<div class="col">
								<h6><?php _e ( 'Relative to Baseline', 'cdc' ); ?> (1971 – 2010)</h6>
								
								<div class="var-value-compare">
									<span class="icon"><i class="fas fa-caret-up text-primary"></i></span>
									
									<span class="value">2.3</span>
									<span class="unit">ºC</span>
									<span class="compare"><?php _e ( 'higher', 'cdc' ); ?></span>
								</div>
							</div>
						</div>
						
						<!-- tabs -->
						
						<div id="location-tabs-container">
							
							<ul id="location-tab-links" class="d-flex list-unstyled border-bottom ms-3 ps-3">
								<li class="p-2 border"><a href="#location-time-series"><?php _e ( 'Time Series', 'cdc' ); ?></a></li>
								<li class="p-2 border"><a href="#location-table-builder"><?php _e ( 'Table Builder', 'cdc' ); ?></a></li>
								<li class="p-2 border"><a href="#location-frequency-plot"><?php _e ( 'Frequency Plot', 'cdc' ); ?></a></li>
							</ul>
						
							<!-- tab 1: time series -->
							
							<div id="location-time-series" class="p-3">
									
								<!-- wrapper for chart -->
								<div class="location-chart-container mb-3">
									<!-- chart object -->
									<div id="location-chart" class="location-chart">chart object here</div>
								</div>
								
								<!-- chart options -->
								<div class="d-flex justify-content-between">
									<h5><?php _e ( 'Chart Options', 'cdc' ); ?></h5>
									
									<!-- export functions -->
									<div class="d-flex align-items-center">
										<h6 class="mb-0"><?php _e ( 'Export', 'cdc' ); ?></h6>
										
										<div class="bg-light p-1">
											<span>PDF</span>
											<span>PNG</span>
											<span>CSV</span>
										</div>
									</div>
								</div>
								
								<!-- accordions -->
								
								<div id="location-chart-accordions" class="accordion">
									
									<div class="accordion-item">
										
										<h2 class="accordion-header">
											<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#location-chart-values" aria-expanded="true" aria-controls="location-chart-values">
												<?php _e ( 'Values', 'cdc' ); ?>
											</button>
										</h2>
										
										<div id="location-chart-values" class="accordion-collapse collapse show" data-bs-parent="#location-chart-accordions">
											<div class="accordion-body p-3 bg-light">
												
												<?php _e ( 'Change how values are displayed when hovering over the plot area.', 'cdc' ); ?>
												
												<div id="location-chart-values-inputs" class="d-flex justify-content-between">
													<div id="annual" class="selected col border p-2">
														<p><strong><?php _e ( 'Annual Values', 'cdc' ); ?></strong></p>
														
														<p class="small"><?php _e ( 'Precise values per year', 'cdc' ); ?></p>
													</div>
													
													<div id="30-year-avg" class="col border p-2 mx-2">
														<p><strong><?php _e ( '30 year averages', 'cdc' ); ?></strong></p>
														
														<p class="small"><?php _e ( 'Average values over the previous 30-year period', 'cdc' ); ?></p>
													</div>
													
													<div id="30-year-change" class="col border p-2">
														<p><strong><?php _e ( '30 year changes', 'cdc' ); ?></strong></p>
														
														<p class="small"><?php _e ( 'Values that indicate the change from the 1971-2000 reference period', 'cdc' ); ?></p>
													</div>
												</div>
												
											</div>
										</div>
										
									</div>
									
									<div class="accordion-item">
										<h2 class="accordion-header">
											<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#location-chart-series" aria-expanded="false" aria-controls="location-chart-series">
												<?php _e ( 'Series', 'cdc' ); ?>
											</button>
										</h2>
										
										<div id="location-chart-series" class="accordion-collapse collapse" data-bs-parent="#location-chart-accordions">
											<div class="accordion-body p-3 bg-light">
												
												<!-- header -->
												<div class="row row-cols-3">
													<div class="col"><?php _e ( 'Series Name', 'cdc' ); ?></div>
													<div class="col"><?php _e ( 'Colours', 'cdc' ); ?></div>
													<div class="col"><?php _e ( 'Opacity', 'cdc' ); ?></div>
												</div>
												
												<!-- row -->
												<div id="chart-series-observations" class="row row-cols-3 py-2 border-bottom">
													
													<div id="chart-series-observations-display" class="col">
														<div class="form-check form-switch">
															<input class="form-check-input" type="checkbox" role="switch" id="chart-series-observations-display-toggle" checked>
															<label class="form-check-label" for="chart-series-observations-display-toggle"><?php _e ( 'Observations', 'cdc' ); ?></label>
														</div>
													</div>
													
													<div id="chart-series-observations-colours" class="col">
														<div class="color-picker d-flex align-items-center">
															<span class="rounded-circle p-2 me-2 bg-primary"></span>
															
															<span class="label"><?php _e ( 'Median', 'cdc' ); ?></span>
														</div>
													</div>
													
													<div id="chart-series-observations-opacity" class="col">
														
														<input type="range" class="form-range" min="1" max="100" value="100" id="chart-series-observations-opacity-range">
														
													</div>
													
												</div>
												
												<!-- row -->
												<div id="chart-series-historical" class="row row-cols-3 py-2 border-bottom">
													
													<div id="chart-series-historical-display" class="col">
														<div class="form-check form-switch">
															<input class="form-check-input" type="checkbox" role="switch" id="chart-series-historical-display-toggle" checked>
															<label class="form-check-label" for="chart-series-historical-display-toggle"><?php _e ( 'Modeled Historical', 'cdc' ); ?></label>
														</div>
													</div>
													
													<div id="chart-series-historical-colours" class="col d-flex">
														<div id="chart-series-historical-colours-median" class="color-picker d-flex align-items-center me-2">
															<span class="rounded-circle p-2 me-2 bg-primary"></span>
															
															<span class="label"><?php _e ( 'Median', 'cdc' ); ?></span>
														</div>
														
														<div id="chart-series-historical-colours-range" class="color-picker d-flex align-items-center me-2">
															<span class="rounded-circle p-2 me-2 bg-primary"></span>
															
															<span class="label"><?php _e ( 'Range', 'cdc' ); ?></span>
														</div>
													</div>
													
													<div id="chart-series-historical-opacity" class="col">
														
														<input type="range" class="form-range" min="1" max="100" value="100" id="chart-series-historical-opacity-range">
														
													</div>
													
												</div>
												
												<!-- row -->
												<div id="chart-series-ssp126" class="row row-cols-3 py-2 border-bottom">
													
													<div id="chart-series-ssp126-display" class="col">
														<div class="form-check form-switch">
															<input class="form-check-input" type="checkbox" role="switch" id="chart-series-ssp126-display-toggle" checked>
															<label class="form-check-label" for="chart-series-ssp126-display-toggle"><?php _e ( 'SSP 1–2.6', 'cdc' ); ?></label>
														</div>
													</div>
													
													<div id="chart-series-ssp126-colours" class="col d-flex">
														<div id="chart-series-ssp126-colours-median" class="color-picker d-flex align-items-center me-2">
															<span class="rounded-circle p-2 me-2 bg-primary"></span>
															
															<span class="label"><?php _e ( 'Median', 'cdc' ); ?></span>
														</div>
														
														<div id="chart-series-ssp126-colours-range" class="color-picker d-flex align-items-center me-2">
															<span class="rounded-circle p-2 me-2 bg-primary"></span>
															
															<span class="label"><?php _e ( 'Range', 'cdc' ); ?></span>
														</div>
													</div>
													
													<div id="chart-series-ssp126-opacity" class="col">
														
														<input type="range" class="form-range" min="1" max="100" value="100" id="chart-series-ssp126-opacity-range">
														
													</div>
													
												</div>
												
												<!-- row -->
												<div id="chart-series-ssp245" class="row row-cols-3 py-2 border-bottom">
													
													<div id="chart-series-ssp245-display" class="col">
														<div class="form-check form-switch">
															<input class="form-check-input" type="checkbox" role="switch" id="chart-series-ssp245-display-toggle" checked>
															<label class="form-check-label" for="chart-series-ssp245-display-toggle"><?php _e ( 'SSP 2–4.5', 'cdc' ); ?></label>
														</div>
													</div>
													
													<div id="chart-series-ssp245-colours" class="col d-flex">
														<div id="chart-series-ssp245-colours-median" class="color-picker d-flex align-items-center me-2">
															<span class="rounded-circle p-2 me-2 bg-primary"></span>
															
															<span class="label"><?php _e ( 'Median', 'cdc' ); ?></span>
														</div>
														
														<div id="chart-series-ssp245-colours-range" class="color-picker d-flex align-items-center me-2">
															<span class="rounded-circle p-2 me-2 bg-primary"></span>
															
															<span class="label"><?php _e ( 'Range', 'cdc' ); ?></span>
														</div>
													</div>
													
													<div id="chart-series-ssp245-opacity" class="col">
														
														<input type="range" class="form-range" min="1" max="100" value="100" id="chart-series-ssp245-opacity-range">
														
													</div>
													
												</div>
												
												<!-- row -->
												<div id="chart-series-ssp585" class="row row-cols-3 py-2 border-bottom">
													
													<div id="chart-series-ssp585-display" class="col">
														<div class="form-check form-switch">
															<input class="form-check-input" type="checkbox" role="switch" id="chart-series-ssp585-display-toggle" checked>
															<label class="form-check-label" for="chart-series-ssp585-display-toggle"><?php _e ( 'SSP 5–8.5', 'cdc' ); ?></label>
														</div>
													</div>
													
													<div id="chart-series-ssp585-colours" class="col d-flex">
														<div id="chart-series-ssp585-colours-median" class="color-picker d-flex align-items-center me-2">
															<span class="rounded-circle p-2 me-2 bg-primary"></span>
															
															<span class="label"><?php _e ( 'Median', 'cdc' ); ?></span>
														</div>
														
														<div id="chart-series-ssp585-colours-range" class="color-picker d-flex align-items-center me-2">
															<span class="rounded-circle p-2 me-2 bg-primary"></span>
															
															<span class="label"><?php _e ( 'Range', 'cdc' ); ?></span>
														</div>
													</div>
													
													<div id="chart-series-ssp585-opacity" class="col">
														
														<input type="range" class="form-range" min="1" max="100" value="100" id="chart-series-ssp585-opacity-range">
														
													</div>
													
												</div>
												
											</div>
										</div>
									</div>
									
									<div class="accordion-item">
										<h2 class="accordion-header">
											<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#location-chart-axes" aria-expanded="false" aria-controls="location-chart-axes">
												<?php _e ( 'Axes', 'cdc' ); ?>
											</button>
										</h2>
										
										<div id="location-chart-axes" class="accordion-collapse collapse" data-bs-parent="#location-chart-accordions">
											<div class="accordion-body p-3 bg-light">
												axes
											</div>
										</div>
									</div>
									
									<div class="accordion-item">
										<h2 class="accordion-header">
											<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#location-chart-labels" aria-expanded="false" aria-controls="location-chart-labels">
												<?php _e ( 'Labels', 'cdc' ); ?>
											</button>
										</h2>
										
										<div id="location-chart-labels" class="accordion-collapse collapse" data-bs-parent="#location-chart-accordions">
											<div class="accordion-body p-3 bg-light">
												labels
											</div>
										</div>
									</div>
									
								</div>
								
							</div>
							
							<!-- tab 2: table builder -->
							
							<div id="location-table-builder" class="p-3">
								
								<h5>Table Builder</h5>
								
							</div>
							
							<!-- tab 3: frequency plot -->
							
							<div id="location-frequency-plot" class="p-3">
								
								<h5>Frequency Plot</h5>
								
							</div>
							
						</div><!-- tabs-container -->
						
					</div>
				</div>
			</div>
		</div>
	</div>
</div>