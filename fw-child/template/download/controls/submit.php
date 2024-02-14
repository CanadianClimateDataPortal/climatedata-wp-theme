<div id="submit" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex justify-content-between">
				<div>
					<h2 class="font-family-serif text-secondary">4</h2>
					<h5><?php _e ( 'Process Analysis', 'cdc' ); ?></h5>
					<p><?php _e ( 'Enter your email address to submit your request.', 'cdc' ); ?></p>
					
					<p class="mb-0">
						<strong><?php _e ( 'Note:', 'cdc' ); ?></strong>
						<?php _e ( 'Note: Data processing starts when you click on ‘Send Request.’ It may take 30 to 90 minutes to complete, depending on available resources. You will be notified by email when your request has been processed and the data are available. Don’t forget to check your spam folder.', 'cdc' ); ?>
					</p>
				</div>
				<span class="tab-drawer-close">&times;</span>
			</div>
			
			<div class="control-tab-body">
				<div class="invalid-alert m-3" style="display: none;">
					<div class="alert alert-danger bg-white d-flex">
						<div class="me-3"><span class="alert-icon"></span></div>
						<div><ul class="list-unstyled mb-0 text-body"></ul></div>
					</div>
				</div>
				
				<div id="map-control-email" class="map-control-item">
					<label for="submit-email" id="submit-email" class="form-label h6 all-caps text-secondary" data-validate="<?php _e ( 'Please enter a valid email address', 'cdc' ); ?>"><?php _e ( 'Email Address', 'cdc' ); ?></label>
					
					<input type="text" class="form-control" name="submit-email" id="submit-email">
					
					<div class="form-check form-switch mt-2">
						<input class="form-check-input" type="checkbox" role="switch" name="submit-subscribe" id="submit-subscribe"">
						<label class="form-check-label" for="submit-subscribe"><?php _e ( 'Subscribe to the ClimateData.ca newsletter', 'cdc' ); ?></label>
					</div>
				</div>
				
				<div id="map-control-captcha" class="map-control-item">
					<h6 class="all-caps text-secondary"><?php _e ( 'Human Verification', 'cdc' ); ?></h6>
					
					<div class="row row-cols-2 align-items-center">
						<div class="col pe-3">
							<div class="bg-gray-400 p-3">
								captcha
							</div>
						</div>
						
						<div class="col">
							<label for="submit-captcha" id="submit-captcha" class="form-label"><?php _e ( 'Enter the characters shown in the image:', 'cdc' ); ?></label>
							
							<input type="text" class="form-control" name="submit-captcha" id="submit-captcha" size="6" maxlength="4">
						</div>
					</div>
				</div>
				
			</div>
			
			<div class="control-tab-footer">
				<button id="submit" class="btn btn-lg btn-primary w-100"><?php _e ( 'Send Request', 'cdc' ); ?></button>
			</div>
			
		</div>
	</div>
	
</div>