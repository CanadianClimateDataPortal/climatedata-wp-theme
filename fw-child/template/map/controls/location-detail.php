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
				
				<div id="location-tabs-container" class="ms-3 pb-3">
					
					<ul class="nav nav-tabs ps-3" id="location-tabs" role="tablist">
						<li class="nav-item" role="presentation">
							<button class="nav-link active" id="location-time-series-tab" data-bs-toggle="tab" data-bs-target="#location-time-series-pane" type="button" role="tab" aria-controls="location-time-series-pane" aria-selected="true"><?php _e ( 'Time Series', 'cdc' ); ?></button>
						</li>
						<li class="nav-item" role="presentation">
							<button class="nav-link" id="location-table-builder-tab" data-bs-toggle="tab" data-bs-target="#location-table-builder-pane" type="button" role="tab" aria-controls="location-table-builder-pane" aria-selected="false"><?php _e ( 'Table Builder', 'cdc' ); ?></button>
						</li>
						<li class="nav-item" role="presentation">
							<button class="nav-link" id="location-frequency-plot-tab" data-bs-toggle="tab" data-bs-target="#location-frequency-plot-pane" type="button" role="tab" aria-controls="location-frequency-plot-pane" aria-selected="false"><?php _e ( 'Frequency Plot', 'cdc' ); ?></button>
						</li>
					</ul>
					
					<div class="tab-content" id="location-panes">
						<!-- tab 1: time series -->
							
						<div class="tab-pane fade show active" id="location-time-series-pane" role="tabpanel" aria-labelledby="location-time-series-tab" tabindex="0">
							
							<!-- wrapper for chart -->
							<div id="location-chart-container" class="mb-3">
								<!-- chart object -->
								<div id="location-chart" class="chart-object location-chart"></div>
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
											
											<p><?php _e ( 'Change how values are displayed when hovering over the plot area.', 'cdc' ); ?></p>
											
											<div class="btn-group" role="group" aria-label="Chart values">
												
												<input type="radio" class="btn-check" name="chart-values" id="chart-value-annual" data-chart-key="values" value="annual" autocomplete="off" checked>
												<label class="bg-gray-300 me-2 p-2" for="chart-value-annual">
													<strong class="d-block mb-2"><?php _e ( 'Annual Values', 'cdc' ); ?></strong>
													<span class="d-block small"><?php _e ( 'Precise values per year', 'cdc' ); ?></span>
												</label>
											
												<input type="radio" class="btn-check" name="chart-values" id="chart-value-30y" data-chart-key="values" value="30y" autocomplete="off">
												<label class="bg-gray-300 me-2 p-2" for="chart-value-30y">
													<strong class="d-block mb-2"><?php _e ( '30 year averages', 'cdc' ); ?></strong>
													<span class="d-block small"><?php _e ( 'Average values over the previous 30-year period', 'cdc' ); ?></span>
												</label>
											
												<input type="radio" class="btn-check" name="chart-values" id="chart-value-delta" data-chart-key="values" value="delta" autocomplete="off">
												<label class="bg-gray-300 p-2" for="chart-value-delta">
													<strong class="d-block mb-2"><?php _e ( '30 year changes', 'cdc' ); ?></strong>
													<span class="d-block d-block small"><?php _e ( 'Average values over the previous 30-year period', 'cdc' ); ?></span>
												</label>
												
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
							
						<div class="tab-pane fade" id="location-table-builder-pane" role="tabpanel" aria-labelledby="location-table-builder-tab" tabindex="0">
							
							<h5>Table Builder</h5>
							
						</div>
						
						<!-- tab 3: frequency plot -->
							
						<div class="tab-pane fade" id="location-frequency-plot-pane" role="tabpanel" aria-labelledby="location-frequency-plot-tab" tabindex="0">
							
							<h5>Frequency Plot</h5>
							
						</div>
						
					</div>
					
				</div><!-- tabs-container -->
				
			</div>
		</div>
	</div>
</div>