<div id="location-detail" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex align-items-center justify-content-between">
				<h5 class="mb-0">Location Detail</h5>
				<span class="tab-drawer-close btn-close"></span>
			</div>
			
			<div class="control-tab-body">
				<h4 class="variable-name p-3"></h4>
				
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
					
					<?php /*
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
					*/ ?>
					
					<div class="tab-content" id="location-panes">
						<!-- tab 1: time series -->
							
						<div class="tab-pane fade show active" id="location-time-series-pane" role="tabpanel" aria-labelledby="location-time-series-tab" tabindex="0">
							
							<!-- wrapper for chart -->
							<div id="location-chart-container" class="mb-3 me-3">
								<!-- chart object -->
								<div id="location-chart" class="chart-object location-chart"></div>
							</div>
							
							<!-- chart options -->
							<div class="d-flex align-items-center justify-content-between mb-3 pe-3">
								<h5 class="mb-0"><?php _e ( 'Chart Options', 'cdc' ); ?></h5>
								
								<!-- export functions -->
								<div id="chart-export-btns" class="d-flex align-items-center">
									<h6 class="mb-0 me-3 all-caps text-gray-600"><?php _e ( 'Export', 'cdc' ); ?></h6>
									
									<div class="d-flex">
										<span class="export-btn py-1 px-2" data-export-type="application/pdf">PDF</span>
										<span class="export-btn py-1 px-2" data-export-type="image/png">PNG</span>
										<span class="export-btn py-1 px-2" data-export-type="csv">CSV</span>
										<span class="export-btn py-1 px-2" data-export-type="print">Print</span>
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
											
											<div id="chart-values-btns" class="btn-group" role="group" aria-label="Chart values">
												
												<input type="radio" class="btn-check" name="chart-values" id="chart-value-annual" data-chart-key="values" value="annual" autocomplete="off" checked>
												<label class="p-2" for="chart-value-annual">
													<strong class="d-block mb-2"><?php _e ( 'Annual Values', 'cdc' ); ?></strong>
													<span class="d-block small"><?php _e ( 'Precise values per year', 'cdc' ); ?></span>
												</label>
											
												<input type="radio" class="btn-check" name="chart-values" id="chart-value-30y" data-chart-key="values" value="30y" autocomplete="off">
												<label class="mx-2 p-2" for="chart-value-30y">
													<strong class="d-block mb-2"><?php _e ( '30 year averages', 'cdc' ); ?></strong>
													<span class="d-block small"><?php _e ( 'Average values over the previous 30-year period', 'cdc' ); ?></span>
												</label>
											
												<input type="radio" class="btn-check" name="chart-values" id="chart-value-delta" data-chart-key="values" value="delta" autocomplete="off">
												<label class="p-2" for="chart-value-delta">
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
											<div class="row row-cols-2">
												<div class="col">
													<h6 class="all-caps text-gray-600"><?php _e ( 'Series Name', 'cdc' ); ?></h6>
												</div>
												
												<?php /*<div class="col"><?php _e ( 'Colours', 'cdc' ); ?></div>*/ ?>
												
												<div class="col">
													<h6 class="all-caps text-gray-600"><?php _e ( 'Opacity', 'cdc' ); ?></h6>
												</div>
											</div>
											
											<div id="chart-series-items">
											
												<!-- row -->
												<div id="legend-row-X" class="row row-cols-2 py-2 border-bottom align-items-center" style="display: none;">
													
													<div class="col">
														<div class="form-check form-switch mb-0">
															<input class="form-check-input" type="checkbox" role="switch" id="legend-row-X-display-toggle" checked>
															<label class="form-check-label" for="legend-row-X-display-toggle"></label>
														</div>
													</div>
													
													<?php /*<div id="chart-series-observations-colours" class="col">
														<div class="color-picker d-flex align-items-center">
															<span class="rounded-circle p-2 me-2 bg-primary"></span>
															
															<span class="label"><?php _e ( 'Median', 'cdc' ); ?></span>
														</div>
													</div>*/ ?>
													
													<div id="legend-row-X-opacity" class="col d-flex align-items-center">
														
														<input type="range" class="form-range" min="1" max="100" value="100" id="legend-row-X-opacity-range">
														
													</div>
													
												</div>
												<!-- /row -->
													
											</div>
											
										</div>
									</div>
								</div>
								
								<?php /*
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
								*/ ?>
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