<div id="data-variable" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex align-items-center justify-content-between">
				<h5 class="mb-0"><?php _e ( 'Select a new variable', 'cdc' ); ?></h5>
				<span class="tab-drawer-close btn-close"></span>
			</div>
			
			<div class="control-tab-body">
				
				<div id="var-select-query" class="fw-query-object"
					data-args='{
						"posts_per_page": 15,
						"post_type": [ "variable" ],
						"orderby": "RAND(<?php echo mt_rand ( 100000, 999999 ); ?>)",
						"order": "asc",
						"post_status": "publish"
					}'
				>
					
					<div id="" class="query-container row row-cols-3 align-items-center border-bottom px-1">
						<?php 
						
							foreach ( array ( 'var-type', 'sector' ) as $tax ) {
								
								if ( taxonomy_exists ( $tax ) ) {
									
									$tax_obj = get_taxonomy ( $tax );
								
						?>
						
						<div
							class="fw-query-filter col dropdown"
							data-filter-type="taxonomy" data-filter-multi="false"
						>
						
							<div class="dropdown-toggle btn btn-sm btn-light mb-0 all-caps d-block text-start" data-bs-toggle="dropdown" aria-expanded="false"><?php
									
									if ( $GLOBALS['fw']['current_lang_code'] != 'en' ) {
										
										echo get_option ( 'options_tax_var-type_slug_' . $GLOBALS['fw']['current_lang_code'] );
										
									} else {
										
										echo $tax_obj->label;
										
									}
								
							?></div>
							
							<ul class="dropdown-menu">
								<?php
							
									foreach ( get_terms ( array (
										'taxonomy' => $tax,
										'hide_empty' => true
									) ) as $term ) {
										
										$item = array (
											'key' => $tax,
											'value' => $term->slug,
											'label' => $term->name
										);
										
										if ( $GLOBALS['fw']['current_lang_code'] != 'en' ) {
											
											$item['value'] = get_field ( 'slug_' . $GLOBALS['fw']['current_lang_code'], 'var-type_' . $term->term_id );
											$item['label'] = get_field ( 'title_' . $GLOBALS['fw']['current_lang_code'], 'var-type_' . $term->term_id );
										
									}
							
								?>
							
								<li class="filter-item" data-key="<?php echo $item['key']; ?>" data-value="<?php echo $item['value']; ?>">
									<button class="dropdown-item"><?php echo $item['label']; ?></button>
								</li>
								
								<?php
								
									}
									
								?>
								
							</ul>
						
						</div>
					
						<?php
							
								} elseif ( current_user_can ( 'administrator' ) ) {
									
									echo '<p class="alert alert-warning">Taxonomy <code>' . $tax . '</code> doesn’t exist.</p>';
									
								}
							}
						
						?>
						
						<div class="d-flex justify-content-end">
							<h6 class="mb-0 all-caps"><?php _e ( 'Clear', 'fw' ); ?></h6>
						</div>
					</div>
					
					<div id="" class="query-container ">
						<div class="fw-query-items row row-cols-3"
							data-options='{
								"type":"items",
								"template":"template/query/download-var-item.php",
								"id":"",
								"class":["row","row-cols-3"],
								"item_class":"col",
								"index":"4"
							}'
						>
						</div>
					</div>
					
					<div id="" class="query-container p-2">
						<div class="fw-query-pagination d-flex justify-content-between align-items-center">
							<div class="fw-query-pagination-btn previous btn btn-secondary btn-sm"><?php _e ( 'Previous', 'fw' ); ?></div>
						
							<div class="fw-query-pagination-btn next btn btn-secondary btn-sm"><?php _e ( 'Next', 'fw' ); ?></div>
						</div>
					</div>
				</div>
				
			</div>
		</div>
	</div>
</div>