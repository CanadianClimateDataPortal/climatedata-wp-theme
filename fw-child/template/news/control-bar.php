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
				<div class="tab-drawer-content">
					<div class="tab-drawer-content-inner">
						<div class="control-tab-head d-flex justify-content-between">
							<h5><?php _e ( 'Filters', 'cdc' ); ?></h5>
							<span class="tab-drawer-close btn-close"></span>
						</div>
						
						<div class="control-tab-body query-container">
							
							<div class="fw-query-filter p-3" data-filter-type="taxonomy" data-filter-multi="false">
								<h6 class="text-primary"><?php _e ( 'Tag', 'fw' ); ?></h6>
								
								<?php
								
									$all_tags = get_terms ( array ( 
										'taxonomy' => 'post_tag',
										'hide_empty' => true
									) );
								
									if ( !empty ( $all_tags ) ) {
									
								?>
								
								<ul class="list-unstyled">
									<?php
									
										foreach ( $all_tags as $tag ) {
											
									?>
									
									<li class="filter-item" data-key="post_tag" data-value="<?php echo $tag->slug; ?>"><?php echo $tag->name; ?></li>
									
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