<div id="data-variable" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex justify-content-between">
				<h5><?php _e ( 'Select a new variable', 'cdc' ); ?></h5>
				<span class="tab-drawer-close">&times;</span>
			</div>
			
			<div class="control-tab-body">
				<div id="var-select-filters" class="d-flex border-bottom">
					<div class="p-2 border-right">
						Variable type:
					</div>
					
					<div class="p-2 border-right">
						Data type:
					</div>
					
					<div class="p-2 border-right">
						Sector:
					</div>
					
					<div class="ms-auto p-2">
						Clear
					</div>
				</div>
				
				<div class="row row-cols-3">
					<?php
					
						$all_vars = get_posts ( array (
							'post_type' => 'variable',
							'posts_per_page' => -1,
						) );
						
						if ( !empty ( $all_vars ) ) {
							
							foreach ( $all_vars as $var_post ) {
								
								$this_ID = $var_post->ID;
								
					?>
					
					<div class="var-query-item col p-2">
						
						<div class="var-item-img bg-gray-200">
							<div class="bg" style="background-image: url(<?php echo get_the_post_thumbnail_url ( $this_ID, 'medium' ); ?>);"></div>
						</div>
						
						<div class="var-item-text p-3">
							<h5><?php echo get_the_title ( $this_ID ); ?></h5>
							<a href="#data" class="tab-drawer-trigger var-select" data-query-key="var" data-query-val="<?php echo get_post_meta ( $this_ID, 'var_name', true ); ?>"><?php _e ( 'View on map', 'cdc' ); ?></a>
							<a href="<?php echo home_url ( 'download' ); ?>" class=""><?php _e ( 'Download', 'cdc' ); ?></a>
						</div>
						
					</div>
					
					<?php
								
							}
						}
						
					?>
				</div>
			</div>
		</div>
	</div>
</div>