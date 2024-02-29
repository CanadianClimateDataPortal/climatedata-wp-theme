<div id="display" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex align-items-center justify-content-between">
				<h5 class="mb-0">Display</h5>
				<span class="tab-drawer-close btn-close"></span>
			</div>
			
			<div class="control-tab-body">
				
				<div id="map-control-values" class="map-control-item">
					<h6 class="all-caps text-secondary">Data Values</h6>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="display-values" id="display-values-absolute" value="" checked data-query-key="delta">
						<label class="form-check-label" for="display-values-absolute">Absolute</label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="display-values" id="display-values-delta" value="true" data-query-key="delta">
						<label class="form-check-label" for="display-values-delta">Delta vs. Baseline</label>
					</div>
				</div>
				
				<div id="map-control-aggregation" class="map-control-item">
					<h6 class="all-caps text-secondary">Map Aggregation</h6>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="display-aggregation" id="display-aggregation-grid" value="canadagrid" checked data-query-key="sector">
						<label class="form-check-label" for="display-aggregation-grid">Gridded Data</label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="display-aggregation" id="display-aggregation-csd" value="census" data-query-key="sector">
						<label class="form-check-label" for="display-aggregation-csd">Census Subdivisions</label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="display-aggregation" id="display-aggregation-health" value="health" data-query-key="sector">
						<label class="form-check-label" for="display-aggregation-health">Health Regions</label>
					</div>
					
					<div class="form-check">
						<input class="form-check-input" type="radio" name="display-aggregation" id="display-aggregation-watershed" value="watershed" data-query-key="sector">
						<label class="form-check-label" for="display-aggregation-watershed">Watersheds</label>
					</div>
					
				</div>
				
				<div id="map-control-colours" class="map-control-item">
					<h6 class="all-caps text-secondary">Colours</h6>
					
					<input type="hidden" name="display-scheme" id="display-scheme" value="kejDjr" data-query-key="scheme">
					
					<div id="display-scheme-select" class="dropdown mb-3">
						<div class="dropdown-toggle scheme-dropdown" data-bs-toggle="dropdown" aria-expanded="false">
							<span class="gradient"><svg width="100%" height="100%"></svg></span>
							<span class="sr-only">Selected Scheme Name</span>
						</div>
						
						<ul class="dropdown-menu w-100 p-0">
							<li><button class="dropdown-item scheme-dropdown active default" data-scheme-id="default" data-scheme-colours='[]'>
								<span class="gradient"><svg width="100%" height="100%"></svg></span>
								<span class="small all-caps"><?php _e ( 'Default', 'cdc' ); ?></span>
							</button></li>

                            <!-- generated automatically (various-script/geoserver/Sandbox.ipynb) -->

                            <li>
                                <button class="dropdown-item scheme-dropdown" data-scheme-id="temp_seq"
                                        data-scheme-colours='["#FEFECB", "#FDF6B5", "#FBED9E", "#F9E286", "#F5D470", "#F1C35F", "#EEB257", "#EAA253", "#E79352", "#E38450", "#DE744F", "#D3644D", "#C25449", "#AC4944", "#95413D", "#7E3B34", "#68342A", "#522D1F", "#3E2616", "#2B200D", "#191900"]'
                                        data-scheme-type="sequential" data-scheme-quantities="" data-scheme-labels="">
                                    <span class="gradient"">
                                    <svg width="100%" height="100%"></svg>
                                    </span>
                                    <span class="sr-only">temp_seq</span>
                                </button>
                            </li>

                            <li>
                                <button class="dropdown-item scheme-dropdown" data-scheme-id="prec_seq"
                                        data-scheme-colours='["#FFFFE5", "#EEF6DD", "#DDEDD6", "#CCE4CF", "#BBDCC8", "#AAD3C1", "#9ACBBA", "#89C2B2", "#78B9AB", "#67B1A4", "#56A89D", "#459F96", "#34968E", "#2E8B83", "#278077", "#21746B", "#1A695F", "#135E53", "#0D5247", "#06473B", "#003C30"]'
                                        data-scheme-type="sequential" data-scheme-quantities="" data-scheme-labels="">
                                    <span class="gradient"">
                                    <svg width="100%" height="100%"></svg>
                                    </span>
                                    <span class="sr-only">prec_seq</span>
                                </button>
                            </li>

                            <li>
                                <button class="dropdown-item scheme-dropdown" data-scheme-id="misc_seq_3"
                                        data-scheme-colours='["#001959", "#07265B", "#0D335D", "#11415F", "#184E61", "#225B5F", "#32665A", "#446F51", "#577547", "#6A7B3C", "#7F8133", "#97872D", "#B28D32", "#CC9241", "#E39757", "#F39E71", "#FBA68D", "#FDAFA7", "#FDB8C2", "#FCC2DD", "#FACCFA"]'
                                        data-scheme-type="sequential" data-scheme-quantities="" data-scheme-labels="">
                                    <span class="gradient"">
                                    <svg width="100%" height="100%"></svg>
                                    </span>
                                    <span class="sr-only">misc_seq_3</span>
                                </button>
                            </li>

                            <li>
                                <button class="dropdown-item scheme-dropdown" data-scheme-id="temp_div"
                                        data-scheme-colours='["#053061", "#144879", "#246192", "#337AAA", "#4393C3", "#61A3CB", "#7FB5D4", "#9EC6DE", "#BCD6E6", "#DAE8F0", "#F8F8F8", "#F3DFDC", "#EDC5BF", "#E7ACA3", "#E19286", "#DB7969", "#D6604C", "#BA4841", "#9E3036", "#82182A", "#67001F"]'
                                        data-scheme-type="divergent" data-scheme-quantities="" data-scheme-labels="">
                                    <span class="gradient"">
                                    <svg width="100%" height="100%"></svg>
                                    </span>
                                    <span class="sr-only">temp_div</span>
                                </button>
                            </li>

                            <li>
                                <button class="dropdown-item scheme-dropdown" data-scheme-id="prec_div"
                                        data-scheme-colours='["#543005", "#6E440F", "#895819", "#A46C23", "#BF812C", "#C8944F", "#D2A971", "#DCBD93", "#E5D1B4", "#EFE4D7", "#F8F8F7", "#D8E8E7", "#B7D8D5", "#97C8C3", "#76B7B2", "#55A7A0", "#35978F", "#278077", "#1A695F", "#0D5247", "#003C30"]'
                                        data-scheme-type="divergent" data-scheme-quantities="" data-scheme-labels="">
                                    <span class="gradient"">
                                    <svg width="100%" height="100%"></svg>
                                    </span>
                                    <span class="sr-only">prec_div</span>
                                </button>
                            </li>

                            <li>
                                <button class="dropdown-item scheme-dropdown" data-scheme-id="misc_div"
                                        data-scheme-colours='["#081D58", "#1F2F88", "#234DA0", "#1F72B1", "#2498C0", "#41B6C3", "#73C8BC", "#AADEB6", "#D6EFB2", "#F0F9B9", "#FEFED1", "#FFF0A9", "#FEE187", "#FEC965", "#FDAA48", "#FD8D3C", "#FC5A2D", "#ED2F21", "#D30F1F", "#B00026", "#800026"]'
                                        data-scheme-type="divergent" data-scheme-quantities="" data-scheme-labels="">
                                    <span class="gradient"">
                                    <svg width="100%" height="100%"></svg>
                                    </span>
                                    <span class="sr-only">misc_div</span>
                                </button>
                            </li>

                            <!-- end of generated automatically -->
						</ul>
						
					</div>
					
					<div id="display-colours-toggle" class="btn-group w-100">
						
						<input type="radio" class="btn-check" name="display-colours-type" id="display-colours-discrete" autocomplete="off" data-query-key="scheme_type" value="discrete" checked>
						<label class="btn disabled btn-outline-gray-400" for="display-colours-discrete"><?php _e ( 'Discrete', 'cdc' ); ?></label>
						
						<input type="radio" class="btn-check" name="display-colours-type" id="display-colours-continuous" autocomplete="off" data-query-key="scheme_type" value="continuous">
						<label class="btn disabled btn-outline-gray-400" for="display-colours-continuous"><?php _e ( 'Continuous', 'cdc' ); ?></label>
						
					</div>
				</div>
				
				<div id="map-control-opacity" class="map-control-item all-caps">
					<h6 class="text-secondary mb-3">Layer Opacity</h6>
					
					<h6 class="text-gray-600">Data</h6>
					
					<div class="map-control-slider-well mb-4">
						<div id="display-data-slider" class="map-control-slider opacity-slider" data-pane="raster">
							<div id="data-opacity-handle" class="ui-slider-handle">100</div>
						</div>
					</div>
					
					<h6 class="text-gray-600">Labels</h6>
					
					<div class="map-control-slider-well mb-4">
						<div id="display-labels-slider" class="map-control-slider opacity-slider" data-pane="labels">
							<div id="labels-opacity-handle" class="ui-slider-handle">100</div>
						</div>
					</div>
					
					<h6 class="text-gray-600">Pins</h6>
					
					<div class="map-control-slider-well">
						<div id="display-pins-slider" class="map-control-slider opacity-slider" data-pane="marker">
							<div id="pins-opacity-handle" class="ui-slider-handle">100</div>
						</div>
					</div>
					
				</div>					
				
			</div>
		</div>
	</div>
</div>