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
				
				<div id="map-control-thresholds" class="map-control-item">
					<h6>Thresholds</h6>
				</div>
				
				<div id="map-control-dataset" class="map-control-item">
					<h6>Dataset</h6>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="data-dataset" id="data-dataset-cmip6" checked>
						<label class="form-check-label" for="data-dataset-cmip6">CMIP6 (CanDCS-U6)</label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="data-dataset" id="data-dataset-cmip5">
						<label class="form-check-label" for="data-dataset-cmip5">CMIP5 (CanDCS-U5)</label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="data-dataset" id="data-dataset-ahccd">
						<label class="form-check-label" for="data-dataset-ahccd">AHCCD</label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="data-dataset" id="data-dataset-station">
						<label class="form-check-label" for="data-dataset-station">Regular Station Data</label>
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