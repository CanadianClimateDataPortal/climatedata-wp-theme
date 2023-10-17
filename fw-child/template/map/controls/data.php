<div id="data" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex justify-content-between">
				<h5>Data Options</h5>
				<span class="tab-drawer-close">&times;</span>
			</div>
			
			<div class="control-tab-body">
				
				<div id="map-control-variable" class="map-control-item">
					<a href="#data-variable" class="tab-drawer-trigger">Variable</a>
				</div>
				
				<div id="map-control-dataset" class="map-control-item">
					<label for="" class="form-label h6">Dataset</label>
					
					<div class="btn-group">
						<span class="btn btn-primary" aria-current="page">CMIP6</span>
						<span class="btn btn-outline-primary">CMIP5</span>
					</div>
				</div>
				
				<div id="map-control-frequency" class="map-control-item">
					<label for="data-frequency" class="form-label">Frequency</label>
					
					<select class="form-select" name="data-frequency">
						<option>Annual</option>
					</select>
				</div>
				
				<div id="map-control-panels" class="map-control-item">
					
					<div class="mb-2">
						<div class="form-check form-switch">
							<input class="form-check-input" type="checkbox" role="switch" id="data-panels-ssp5" value="ssp5" checked>
							<label class="form-check-label" for="data-panels-ssp5">High emissions (SSP 5–8.5)</label>
						</div>
					</div>
					
					<div class="mb-2">
						<div class="form-check form-switch">
							<input class="form-check-input" type="checkbox" role="switch" id="data-panels-ssp2" value="ssp2" checked>
							<label class="form-check-label" for="data-panels-ssp2">Medium emissions (SSP 2–4.5)</label>
						</div>
					</div>
					
					<div class="mb-2">
						<div class="form-check form-switch">
							<input class="form-check-input" type="checkbox" role="switch" id="data-panels-ssp1" value="ssp1" checked>
							<label class="form-check-label" for="data-panels-ssp1">Low emissions (SSP 1–2.6)</label>
						</div>
					</div>
					
				</div>
				
			</div>
		</div>
	</div>
	
	<div class="tab-drawer-container">
		<div id="data-variable" class="tab-drawer">
			<div class="tab-drawer-content">
				<div class="tab-drawer-content-inner">
					<div class="control-tab-head d-flex justify-content-between">
						<h5>Select a new variable</h5>
						<span class="tab-drawer-close">&times;</span>
					</div>
					
					<div class="control-tab-body">
						<ul>
							<?php
							
								$all_vars = get_posts ( array (
									'post_type' => 'variable',
									'posts_per_page' => -1,
									
								) );
								
								if ( !empty ( $all_vars ) ) {
									
									foreach ( $all_vars as $var_post ) {
										
										$this_ID = $var_post->ID;
										
							?>
							
							<li><span class="tab-drawer-close"><?php echo get_the_title ( $this_ID ); ?></span></li>
							
							<?php
										
									}
								}
								
							?>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>