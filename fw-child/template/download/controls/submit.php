<?php

	// CAPTCHA
	
	require_once locate_template ( 'resources/php/securimage/securimage.php' );

	$captcha_options = array (
		'code_length' => 4,
		'input_name' => 'captcha_code',
		'input_id' => 'submit-captcha',
		'image_id' => 'captcha_img',
		'icon_size' => 16,
		'input_text' => __ ( 'Enter the characters shown in the image:', 'cdc' ),
		'namespace' => 'analyze',
	);

?>

<div id="submit" class="tab-drawer">
	<div class="tab-drawer-content">
		<div class="tab-drawer-content-inner">
			<div class="control-tab-head d-flex justify-content-between">
				<div>
					<h2 class="font-family-serif text-secondary">4</h2>
					
					<div data-request="single,threshold,station">
						<h5><?php _e ( 'Submit and Download', 'cdc' ); ?></h5>
						<p class="mb-0"><?php _e ( 'Click the button below to prepare your download.', 'cdc' ); ?></p>
					</div>
					
					<div data-request="custom,ahccd">
						<h5><?php _e ( 'Process Analysis', 'cdc' ); ?></h5>
						<p class="mb-0"><?php _e ( 'Enter your email address to submit your request.', 'cdc' ); ?></p>
					</div>
				</div>
				<span class="tab-drawer-close btn-close"></span>
			</div>
			
			<div class="control-tab-body">
				<div class="invalid-alert m-3" style="display: none;">
					<div class="alert alert-danger bg-white d-flex">
						<div class="me-3"><span class="alert-icon"></span></div>
						<div><ul class="list-unstyled mb-0 text-body"></ul></div>
					</div>
				</div>
				
				<div id="map-control-email" class="map-control-item" data-request="custom,ahccd">
					<label for="submit-email" class="form-label h6 mb-3 all-caps text-secondary"><?php _e ( 'Email Address', 'cdc' ); ?></label>
					
					<input type="text" class="form-control" name="submit-email" id="submit-email" data-validate="<?php _e ( 'Please enter a valid email address', 'cdc' ); ?>">
					
					<div class="form-check form-switch mt-2">
						<input class="form-check-input" type="checkbox" role="switch" name="submit-subscribe" id="submit-subscribe"">
						<label class="form-check-label" for="submit-subscribe"><?php _e ( 'Subscribe to the ClimateData.ca newsletter', 'cdc' ); ?></label>
					</div>
				</div>
				
				<div id="map-control-captcha" class="map-control-item" data-request="custom,ahccd">
					<h6 class="all-caps text-secondary mb-3"><?php _e ( 'Human Verification', 'cdc' ); ?></h6>
					
					<div class="row row-cols-2 align-items-center">
						<div class="col pe-3">
							<div id="captcha-container" class="bg-gray-400 p-3">
								<?php
								
									// image
									echo Securimage::getCaptchaHtml ( $captcha_options, Securimage::HTML_IMG );
									
									// refresh
									echo Securimage::getCaptchaHtml ( $captcha_options, Securimage::HTML_ICON_REFRESH );
									
									// audio
									echo Securimage::getCaptchaHtml ( $captcha_options, Securimage::HTML_AUDIO );
									
								?>
							</div>
						</div>
						
						<div class="col">
							<?php
							
							/*
								// label
								echo Securimage::getCaptchaHtml ( $captcha_options, Securimage::HTML_INPUT_LABEL );
									
								// input
								echo Securimage::getCaptchaHtml ( $captcha_options, Securimage::HTML_INPUT );
							
							?>
							*/ ?>
							
							<label for="submit-captcha" class="form-label"><?php _e ( 'Enter the characters shown in the image:', 'cdc' ); ?></label>
							
							<input type="text" class="form-control" name="captcha_code" id="submit-captcha" size="6" maxlength="4" data-validate="<?php _e ( 'CAPTCHA verification is required.', 'cdc' ); ?>">
						</div>
					</div>
				</div>
				
				<div class="map-control-item border-0" data-request="custom,ahccd">
					<p class="mb-0">
						<strong><?php _e ( 'Note:', 'cdc' ); ?></strong>
						<?php _e ( 'Data processing starts when you click on ‘Send Request.’ It may take 30 to 90 minutes to complete, depending on available resources. You will be notified by email when your request has been processed and the data are available. Don’t forget to check your spam folder.', 'cdc' ); ?>
					</p>
				</div>
			</div>
			
			<div class="control-tab-footer">
				<div>
					<button id="submit-btn" class="btn btn-lg btn-primary w-100"><?php _e ( 'Send Request', 'cdc' ); ?></button>
				</div>
				
				<!-- <div data-flags="station:1" style="display: none;">
					<a id="station-submit-btn" href="" target="_blank" class="btn btn-lg btn-primary w-100 disabled"><?php _e ( 'Process and Download', 'cdc' ); ?></a>
				</div> -->
			</div>
			
		</div>
	</div>
	
	<div class="tab-drawer-container">
		<?php
		
			include ( locate_template ( 'template/download/controls/submit-result.php' ) );
			
		?>
	</div>
</div>