<div class="col-1">
	<div id="control-bar" class="control-bar tab-drawer-tabs-container">
		
		<div id="control-bar-tabs" class="tab-drawer-tabs pt-2">
			<a href="#topics" class="tab-drawer-trigger">
				<span class="cdc-icon"><?php
				
					echo file_get_contents ( locate_template ( 'resources/img/icon-topic.svg' ) );
					
				?></span>
				<span><?php _e ( 'Topics', 'cdc' ); ?></span>
			</a>
			
			<a href="#filters" class="tab-drawer-trigger">
				<span class="cdc-icon"><?php
				
					echo file_get_contents ( locate_template ( 'resources/img/icon-display.svg' ) );
					
				?></span>
				<span><?php _e ( 'Filters', 'cdc' ); ?></span>
			</a>
		</div>
		
		<div id="tab-drawer-container" class="tab-drawer-container">
			
			<div id="topics" class="tab-drawer">
				<div class="tab-drawer-content">
					<div class="tab-drawer-content-inner">
						<div class="control-tab-head d-flex justify-content-between">
							<h5>Topics</h5>
							<span class="tab-drawer-close">&times;</span>
						</div>
						
						<div class="control-tab-body ps-2">
							<?php
							
								$i = 1;
								
								foreach ( get_terms ( array (
									'taxonomy' => 'topic'
								) ) as $topic ) {
							
							?>
							
							<div class="position-relative p-3 border-bottom">
								<a href="#<?php _e ( 'topic', 'cdc' ); ?>-<?php echo $i; ?>" class="stretched-link"></a>
								
								<h2 class="font-family-serif text-secondary"><?php echo $i; ?></h2>
								
								<h5><?php echo get_field ( 'title', 'topic_' . $topic->term_id ); ?></h5>
								
								<p><?php
								
									echo $topic->description;
								
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
				<div class="tab-drawer-content">
					<div class="tab-drawer-content-inner">
						<div class="control-tab-head d-flex justify-content-between">
							<h5>Filters</h5>
							<span class="tab-drawer-close">&times;</span>
						</div>
						
						<div class="control-tab-body query-container">
							
							<div class="fw-query-filter " data-filter-type="meta" data-filter-multi="false">
								<h6 class="text-primary">Content Type</h6>
								
								<ul class="list-unstyled">
									<li class="filter-item" data-key="asset_type" data-value="video">Video</li>
									<li class="filter-item" data-key="asset_type" data-value="audio">Audio</li>
									<li class="filter-item" data-key="asset_type" data-value="interactive">Interactive</li>
									<li class="filter-item" data-key="asset_type" data-value="article">Article</li>
								</ul>
							</div>
							
						</div>
					</div>
				</div>
			</div>
			
		</div>
	</div>
	
</div>