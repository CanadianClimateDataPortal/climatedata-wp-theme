<div id="download" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex align-items-center justify-content-between">
			<h5 class="mb-0">Download</h5>
				<span class="tab-drawer-close btn-close"></span>
			</div>
			
			<div class="control-tab-body">
				
				<h6 class="all-caps text-secondary mx-4 my-3"><?php _e ( 'Export Image', 'cdc' ); ?></h6>
				
				<div id="map-control-img" class="map-control-item bg-white me-2">
					<p><?php _e ( 'Position the map as needed and export as a PNG image', 'cdc' ); ?></p>
					
					<a href="#" class="btn btn-secondary d-block" id="download-map-image">
						<span class="btn-icon"><i class="far fa-image"></i></span>
						<span class="btn-text"><?php _e ( 'Save map as image', 'cdc' ); ?></span>
					</a>
					
				</div>
				
				<h6 class="all-caps text-secondary mx-4 my-3"><?php _e ( 'Share URL', 'cdc' ); ?></h6>
				
				<div id="map-control-share" class="map-control-item bg-white me-2">
					<p><?php _e ( 'Copy a shareable URL containing the current map view and parameters', 'cdc' ); ?></p>
					
					<a href="#" class="btn btn-secondary d-block" id="copy-permalink">
						<span class="btn-icon"><i class="far fa-copy"></i></span>
						<span class="btn-text"><?php _e ( 'Copy link to this map', 'cdc' ); ?></span>
					</a>
					
				</div>
				
				<h6 class="all-caps text-secondary mx-4 my-3"><?php _e ( 'Download Data', 'cdc' ); ?></h6>
				
				<div id="map-control-download" class="map-control-item conditional-trigger bg-white me-2">
					<p><?php _e ( 'You can customize and download the data displayed on this map.', 'cdc' ); ?></p>
					<?php
					$dl_slug = $GLOBALS['fw']['current_lang_code'] == 'fr' ? 'telechargement' : 'download';
					?>
					<a href="<?php echo home_url ( $dl_slug ); ?>" class="btn btn-secondary d-block" id="download-btn">
						<span class="btn-icon"><i class="far fa-download"></i></span>
						<span class="btn-text"><?php _e ( 'Download', 'cdc' ); ?></span>
					</a>
				</div>
				
			</div>
		</div>
	</div>
</div>