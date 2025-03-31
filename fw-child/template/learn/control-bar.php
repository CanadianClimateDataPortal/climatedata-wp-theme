<div class="col-2 col-sm-1 position-relative z-3">
	<div id="control-bar" class="control-bar tab-drawer-tabs-container">
		
		<div id="control-bar-tabs" class="tab-drawer-tabs">
			<a href="#modules" class="control-bar-tab-link tab-drawer-trigger">
				<span class="cdc-icon"><?php
				
					echo file_get_contents ( locate_template ( 'resources/img/icon-module.svg' ) );
					
				?></span>
				<span><?php _e ( 'Modules', 'cdc' ); ?></span>
			</a>
			
			<a href="#filters" class="control-bar-tab-link tab-drawer-trigger">
				<span class="cdc-icon"><?php
				
					echo file_get_contents ( locate_template ( 'resources/img/icon-display.svg' ) );
					
				?></span>
				<span><?php _e ( 'Filters', 'cdc' ); ?></span>
			</a>
		</div>
		
		<div id="tab-drawer-container" class="tab-drawer-container">
			
			<div id="modules" class="tab-drawer">
				<div class="tab-drawer-content stick">
					<div class="tab-drawer-content-inner">
						<div class="control-tab-head d-flex justify-content-between align-items-center">
							<h5 class="me-auto mb-0 text-secondary"><?php _e ( 'Modules', 'cdc' ); ?></h5>
							<span class="tab-drawer-close btn-close"></span>
						</div>
						
						<div class="control-tab-body">
							<?php
							$tax_module_terms = get_terms(
								array(
									'taxonomy'   => 'module',
									'hide_empty' => true,
								)
							);

							foreach ( $tax_module_terms as $module_term ) {
								?>
								<div class="learn-zone-module-filter position-relative px-3 py-4 border-bottom"
									 data-module-id="module-<?php echo esc_attr( $module_term->term_id ); ?>">
									<a href="#module-<?php echo esc_attr( $module_term->term_id ); ?>"
									   class="stretched-link"></a>

									<h5><?php echo fw_get_field( 'title', 'module_' . $module_term->term_id ); ?></h5>

									<p class="mb-0">
										<?php
										if ( $GLOBALS['fw']['current_lang_code'] != 'en' ) {
											echo get_field( 'description_fr', 'module_' . $module_term->term_id );
										} else {
											echo $module_term->description;
										}
										?>
									</p>

								</div>
								<?php
							}
							?>
						</div>
					</div>
				</div>
			</div>
			
			<div id="filters" class="tab-drawer">
				<div class="tab-drawer-content stick">
					<div class="tab-drawer-content-inner">
						<div class="control-tab-head d-flex justify-content-between align-items-center">
							<h5 class="me-auto mb-0 text-secondary lh-base"><?php _e ( 'Filters', 'cdc' ); ?></h5>

							<button class="fw-query-reset btn btn-sm btn-gray-400 p-1 me-2 tab-drawer-close" style="display: none;"><?php _e ( 'Clear', 'cdc' ); ?></button>

							<span class="tab-drawer-close btn-close"></span>
						</div>
						
						<div class="control-tab-body query-container">
								
							<div class="fw-query-filter ms-3 py-4 border-bottom" data-filter-type="meta" data-filter-key="asset_type" data-filter-multi="false">
								<h5 class="fw-bold"><?php _e( 'Content Type', 'cdc' ); ?></h5>
								
								<ul class="list-unstyled m-0 pe-2">
								<?php
								// Get the asset type field object.
								$asset_type_object = acf_get_field( 'asset_type' );

								if ( $asset_type_object && isset( $asset_type_object['choices'] ) ) {
									// Array of asset types to check, dynamically retrieved from ACF.
									$asset_types = array_keys( $asset_type_object['choices'] );

									foreach ( $asset_types as $asset_type ) {
										// Query to check if there are posts for the current asset type and if 'display_in_learning_zone' is true.
										$query = new WP_Query(
											array(
												'post_type'      => array( 'page', 'resource', 'app' ),
												'posts_per_page' => 1,
												'meta_query'     => array(
													'relation' => 'AND',
													array(
														'key'   => 'asset_type',
														'value' => $asset_type,
													),
													array(
														'key'   => 'display_in_learning_zone',
														'value' => '1',
													),
												),
											)
										);
										
										// If the query has results, display the filter item.
										if ( $query->have_posts() ) {
											?>
											<li class="filter-item" data-key="asset_type" data-value="<?php echo esc_attr( $asset_type ); ?>">
												<?php echo esc_html( cdc_get_asset_type_meta( $asset_type )['label'] ); ?>
											</li>
											<?php
										}

										wp_reset_postdata();
									}
								}
								?>
								</ul>
							</div>
							
							<?php
							
							foreach ( array( 'topic', 'sector', 'region', 'tech_level' ) as $filter_tax ) {
								
								$tax_obj = get_taxonomy ( $filter_tax );
								
								$this_heading = $tax_obj->labels->singular_name;
								
								if ( get_field ( 'tax_' . $filter_tax . '_title_single_' . $GLOBALS['fw']['current_lang_code'], 'option' ) != '' ) {
									$this_heading = get_field ( 'tax_' . $filter_tax . '_title_single_' . $GLOBALS['fw']['current_lang_code'], 'option' );
								}

								$filter_multi = "false";

								if ( in_array( $filter_tax, array( 'sector', 'region') ) ) {
									$filter_multi = "true";
								}
								?>
							
							<div class="fw-query-filter ms-3 py-4 border-bottom" data-filter-type="taxonomy" data-filter-key="<?php echo $filter_tax; ?>" data-filter-multi="<?php echo $filter_multi; ?>">
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
									foreach ( $all_tags as $the_tag ) {

										if ( 'en' !== $GLOBALS['fw']['current_lang_code'] ) {
											$tag_name = get_field( 'admin_term_title_' . $GLOBALS['fw']['current_lang_code'], $the_tag );
										} else {
											$tag_name = $the_tag->name;
										}
										
										?>
									
									<li class="filter-item" data-key="<?php echo $filter_tax; ?>" data-value="<?php echo $the_tag->slug; ?>"><?php echo $tag_name; ?></li>
									
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
