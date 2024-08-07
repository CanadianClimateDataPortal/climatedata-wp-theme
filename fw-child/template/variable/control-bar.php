<div class="col-2 col-sm-1">
	<div id="control-bar" class="control-bar tab-drawer-tabs-container">
		
		<div id="control-bar-tabs" class="tab-drawer-tabs pt-2">
			<a href="#filters" class="control-bar-tab-link tab-drawer-trigger">
				<span class="cdc-icon"><?php
				
					echo file_get_contents ( locate_template ( 'resources/img/icon-display.svg' ) );
					
				?></span>
				<span><?php _e ( 'Filters', 'cdc' ); ?></span>
			</a>
		</div>
		
		<div id="tab-drawer-container" class="tab-drawer-container">
			
			<div id="filters" class="tab-drawer">
				<div class="tab-drawer-content stick">
					<div class="tab-drawer-content-inner">
						<div class="control-tab-head d-flex justify-content-between align-items-center">
							<h5 class="me-auto mb-0 text-secondary"><?php _e ( 'Filters', 'cdc' ); ?></h5>

							<button class="fw-query-reset btn btn-sm btn-gray-400 me-2" style="display: none;"><?php _e ( 'Clear', 'cdc' ); ?></button>

							<span class="tab-drawer-close btn-close"></span>
						</div>
						
						<div class="control-tab-body query-container">
							
							<?php
							
								foreach ( array ( 'sector', 'var-type' ) as $filter_tax ) {
									
									$tax_obj = get_taxonomy ( $filter_tax );
									
									$this_heading = $tax_obj->labels->singular_name;
									
									if ( get_field ( 'tax_' . $filter_tax . '_title_single_' . $GLOBALS['fw']['current_lang_code'], 'option' ) != '' ) {
										$this_heading = get_field ( 'tax_' . $filter_tax . '_title_single_' . $GLOBALS['fw']['current_lang_code'], 'option' );
									}
									
							?>
							
							<div class="fw-query-filter ms-3 py-4 border-bottom" data-filter-type="taxonomy" data-filter-key="<?php echo $filter_tax; ?>" data-filter-multi="false">
								<h5 class="fw-bold"><?php echo $this_heading; ?></h5>
								
								<?php
								
									$all_tags = get_terms ( array (
										'taxonomy' => $filter_tax,
										'hide_empty' => false
									) );
								
									if ( !empty ( $all_tags ) ) {
									
								?>
								
								<ul class="list-unstyled m-0 pe-2">
									<?php
										foreach ( $all_tags as $tag ) {
											$tag_term_name = $tag->name;

											if ( 'fr' === $current_lang ) {
												$tag_term_name_fr = get_field( 'admin_term_title_fr', $tag );
												$tag_term_name    = ( empty( $tag_term_name_fr ) ) ? $tag_term_name : $tag_term_name_fr;
											}
									?>
									
									<li class="filter-item" data-key="<?php echo $filter_tax; ?>" data-value="<?php echo $tag->slug; ?>"><?php echo $tag_term_name; ?></li>
									
									<?php
									
										}
								
									?>
								</ul>
								<?php
								
									}
							
								?>
							</div>
							
							<?php
							
								}
							
							?>
							
						</div>
					</div>
				</div>
			</div>
			
		</div>
	</div>
	
</div>
