<div class="col-1">
	<div id="control-bar" class="control-bar tab-drawer-tabs-container">
		
		<div id="control-bar-tabs" class="tab-drawer-tabs">
			<a href="#modules" class="tab-drawer-trigger">
				<span class="cdc-icon"></span>
				<span><?php _e ( 'Modules', 'cdc' ); ?></span>
			</a>
			
			<a href="#filters" class="tab-drawer-trigger">
				<span class="cdc-icon"></span>
				<span><?php _e ( 'Filters', 'cdc' ); ?></span>
			</a>
		</div>
		
		<div id="tab-drawer-container" class="tab-drawer-container">
			
			<div id="modules" class="tab-drawer">
				<div class="tab-drawer-content">
					<div class="tab-drawer-content-inner">
						<div class="control-tab-head d-flex justify-content-between">
							<h5>Modules</h5>
							<span class="tab-drawer-close">&times;</span>
						</div>
						
						<div class="control-tab-body">
							
							<div class="p-2">
								<a href="#module-1" class="h2">1</a>
							</div>
							
							<div class="p-2">
								<a href="#module-2" class="h2">2</a>
							</div>
							
							<div class="p-2">
								<a href="#module-3" class="h2">3</a>
							</div>
							
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
							
							<div class="filter " data-filter-type="meta" data-filter-multi="false">
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