<div id="submit-result" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner border-start">
			
			<div class="control-tab-body p-3 d-flex flex-column align-items-center justify-content-center">
				<span class="tab-drawer-close btn-close"></span>
			
				<h3 id="result-head" class="mb-4"></h3>
				
				<div id="result-message" class="mb-4"></div>
				
				<div id="result-btn">
					<a class="btn btn-lg btn-primary rounded-pill" style="display: none;"><?php _e ( 'Download', 'cdc' ); ?></a>
				</div>
				
				<div id="result-status" class="w-100 border-top" style="display: none;">
					<div class="p-3 d-flex justify-content-between align-items-center">
						<div id="result-status-text"><?php _e ( 'Status', 'cdc' ); ?>: <span></span></div>
						
						<div id="result-status-refresh" class="text-primary" role="button">
							<i class="fas fa-sync-alt"></i>
							<?php _e ( 'Refresh', 'cdc' ); ?>
						</div>
					</div>
				</div>
			</div>
			
		</div>
	</div>
</div>
