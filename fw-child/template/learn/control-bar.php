<div class="col-1">
	<div id="control-bar" class="control-bar tab-drawer-tabs-container">
		
		<div id="control-bar-tabs" class="tab-drawer-tabs pt-2">
			<a href="#topics" class="control-bar-tab-link tab-drawer-trigger">
				<span class="cdc-icon"><?php
				
					echo file_get_contents ( locate_template ( 'resources/img/icon-topic.svg' ) );
					
				?></span>
				<span><?php _e ( 'Topics', 'cdc' ); ?></span>
			</a>
			
			<a href="#filters" class="control-bar-tab-link tab-drawer-trigger">
				<span class="cdc-icon"><?php
				
					echo file_get_contents ( locate_template ( 'resources/img/icon-display.svg' ) );
					
				?></span>
				<span><?php _e ( 'Filters', 'cdc' ); ?></span>
			</a>
		</div>
		
		<div id="tab-drawer-container" class="tab-drawer-container">
			
			<div id="topics" class="tab-drawer">
				<div class="tab-drawer-content stick">
					<div class="tab-drawer-content-inner">
						<div class="control-tab-head d-flex justify-content-between align-items-center">
							<h5 class="me-auto mb-0 text-secondary"><?php _e ( 'Topics', 'cdc' ); ?></h5>
							<span class="tab-drawer-close btn-close"></span>
						</div>
						
						<div class="control-tab-body ms-3">
							<?php
							
								$i = 1;
								
								foreach ( get_terms ( array (
									'taxonomy' => 'topic'
								) ) as $topic ) {
							
							?>
							
							<div class="learn-zone-topic-filter position-relative pe-3 py-4 border-bottom" 
								 data-topic-id="topic-<?php echo esc_attr( $topic->term_id ); ?>">
								<a href="#topic-<?php echo esc_attr( $topic->term_id ); ?>" class="stretched-link"></a>
								
								<h2 class="font-family-serif text-secondary"><?php echo $i; ?></h2>
								
								<h5><?php echo fw_get_field ( 'title', 'topic_' . $topic->term_id ); ?></h5>
								
								<p class="mb-0"><?php
								
									if ( $GLOBALS['fw']['current_lang_code'] != 'en' ) {
										echo get_field ( 'description_fr', 'topic_' . $topic->term_id );
									} else {
										echo $topic->description;
									}
								
								?></p>
								
							</div>
							
							<?php
							
									$i++;
									
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
							<h5 class="me-auto mb-0 text-secondary"><?php _e ( 'Filters', 'cdc' ); ?></h5>

							<button class="fw-query-reset btn btn-sm btn-gray-400 p-1 me-2" style="display: none;">Clear</button>

							<span class="tab-drawer-close btn-close"></span>
						</div>
						
						<div class="control-tab-body query-container">
								
							<div class="fw-query-filter ms-3 py-4 border-bottom" data-filter-type="meta" data-filter-key="asset_type" data-filter-multi="false">
								<h5 class="fw-bold"><?php _e ( 'Content Type', 'cdc' ); ?></h5>
								
								<ul class="list-unstyled m-0 pe-2">
									<li class="filter-item" data-key="asset_type" data-value="video"><?php _e ( 'Video', 'cdc' ); ?></li>
									<li class="filter-item" data-key="asset_type" data-value="audio"><?php _e ( 'Audio', 'cdc' ); ?></li>
									<li class="filter-item" data-key="asset_type" data-value="interactive"><?php _e ( 'Interactive', 'cdc' ); ?></li>
									<li class="filter-item" data-key="asset_type" data-value="article"><?php _e ( 'Article', 'cdc' ); ?></li>
								</ul>
							</div>
							
							<?php
							
								foreach ( array ( 'sector', 'region', 'tech_level' ) as $filter_tax ) {
									
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
											
									?>
									
									<li class="filter-item" data-key="<?php echo $filter_tax; ?>" data-value="<?php echo $tag->slug; ?>"><?php echo $tag->name; ?></li>
									
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