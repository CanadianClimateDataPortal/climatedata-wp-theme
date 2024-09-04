<div class="col-1">
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

							<button class="fw-query-reset btn btn-sm btn-gray-400 p-1 me-2" style="display: none;"><?php _e ( 'Clear', 'cdc' ); ?></button>

							<span class="tab-drawer-close btn-close"></span>
						</div>
						
						<div class="control-tab-body query-container">
							
							<div class="fw-query-filter ms-3 py-4" data-filter-type="taxonomy" data-filter-key="post_tag" data-filter-multi="false">
								<h5 class="fw-bold"><?php _e ( 'Tag', 'cdc' ); ?></h5>
								
								<?php
								
									$all_tags = get_terms ( array ( 
										'taxonomy' => 'post_tag',
										'hide_empty' => true
									) );
								
									if ( !empty ( $all_tags ) ) {
									
								?>
								
								<ul class="list-unstyled m-0 pe-2">
									<?php
									
									foreach ( $all_tags as $tag ) {

										if ( $GLOBALS['fw']['current_lang_code'] != 'en' ) {
											$tag_name = get_field( 'admin_term_title_' . $GLOBALS['fw']['current_lang_code'], $tag );
										} else {
											$tag_name = $tag->name;
										}
										
									?>
								
									<li class="filter-item" data-key="post_tag" data-value="<?php echo $tag->slug; ?>"><?php echo $tag_name; ?></li>
									
									<?php
									
										}
								
									?>
								</ul>
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
	
</div>