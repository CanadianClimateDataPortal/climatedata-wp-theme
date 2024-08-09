<div id="station-detail" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex align-items-center justify-content-between">
				<h5 class="mb-0"><?php _e ( 'Station', 'cdc' ); ?></h5>
				<span class="tab-drawer-close btn-close"></span>
			</div>
			
			<div class="control-tab-body">
				<h4 class="variable-name p-3"></h4>
				
				<!-- tabs -->
				
				<div id="station-tabs-container" class="ms-3 pb-3">
					
					<div class="tab-content" id="station-panes">
						<!-- tab 1: time series -->
							
						<div class="tab-pane fade show active" id="station-time-series-pane" role="tabpanel" aria-labelledby="station-time-series-tab" tabindex="0">
							
							<!-- wrapper for chart -->
							<div id="station-chart-container" class="mb-3 me-3">
								<!-- chart object -->
								<div id="station-chart" class="chart-object station-chart"></div>
							</div>
							
							<div>
								<p><?php 
								
									$cccs_link = 'https://climate-change.canada.ca/climate-data/#/climate-normals';
									
									$gc_link = 'https://climate.weather.gc.ca/climate_normals/index_e.html';
									
									if ( $GLOBALS['fw']['current_lang_code'] == 'fr' ) {
										$cccs_link = 'https://changements-climatiques.canada.ca/donnees-climatiques#/normales-climatiques';
										$gc_link = 'https://climat.meteo.gc.ca/climate_normals/index_f.html';
									}
								
									echo sprintf ( __ ( 'Additional Climate Normals variables are available from the <a href="%s" target="blank">Canadian Centre for Climate Services</a> and the <a href="%s" target="_blank">Government of Canada Historical Climate Data</a> websites.', 'cdc' ), $cccs_link, $gc_link );
									
								?></p>
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
										<span class="export-btn py-1 px-2" data-export-type="print"><?php _e ( 'Print', 'cdc' ); ?></span>
									</div>
								</div>
							</div>
							
							<!-- accordions -->
							
							<div id="station-chart-accordions" class="accordion">
								
								<div class="accordion-item">
									<h2 class="accordion-header">
										<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#station-chart-series" aria-expanded="false" aria-controls="station-chart-series">
											<?php _e ( 'Series', 'cdc' ); ?>
										</button>
									</h2>
									
									<div id="station-chart-series" class="accordion-collapse collapse" data-bs-parent="#station-chart-accordions">
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
											
											<div id="station-series-items" class="chart-series-items">
											
												<!-- row -->
												<div id="station-legend-row-X" class="row row-cols-2 py-2 border-bottom align-items-center" style="display: none;">
													
													<div class="col">
														<div class="form-check form-switch mb-0">
															<input class="form-check-input" type="checkbox" role="switch" id="station-legend-row-X-display-toggle" checked>
															<label class="form-check-label" for="station-legend-row-X-display-toggle"></label>
														</div>
													</div>
													
													<div id="station-legend-row-X-opacity" class="col d-flex align-items-center">
														
														<input type="range" class="form-range" min="1" max="100" value="100" id="station-legend-row-X-opacity-range">
														
													</div>
													
												</div>
												<!-- /row -->
													
											</div>
											
										</div>
									</div>
								</div>
								
							</div>
							
							
						</div>
						
					</div>
					
				</div><!-- tabs-container -->
				
			</div>
		</div>
	</div>
</div>