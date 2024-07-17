<?php
	
	// CAPTCHA
	
	require_once locate_template ( 'resources/php/securimage/securimage.php' );
	
?>

<div id="feedback-accordion" class="accordion accordion-flush"> 
	<div class="accordion-item">
		<div id="accordion-head-online" class="accordion-header">
			<div class="accordion-button collapsed row py-4 ps-0" 
				data-bs-toggle="collapse"
				data-bs-target="#online-support" 
				aria-expanded="false" 
				aria-controls="online-support"
			>
				<h3 class="col offset-2 mb-0">
					<?php _e ( 'Online Support', 'cdc' ); ?>
				</h3>
			</div>
		</div>
		
		<div id="online-support" class="accordion-collapse collapse" 
			aria-labelledby="accordion-head-online"
			data-bs-parent="#feedback-accordion"
		>
			<div class="accordion-body py-6">
				
				<form id="feedback-online-form" class="feedback-form needs-validation" novalidate>
					
					<div class="row">
					
						<div class="col-10 offset-2">
							<div class="row row-cols-1 row-cols-lg-2 g-4 pb-6 mb-6 border-bottom">
								
								<div class="col">
									
									<label for="fullname" class="form-label"><?php _e ( 'Full Name', 'cdc' ); ?></label>
									
									<input type="text" name="fullname" class="form-control">
									
								</div>
								
								<div class="col">
									
									<div class="mb-1">
										<label for="email" class="form-label"><?php _e ( 'Email Address', 'cdc' ); ?></label>
										
										<input type="email" name="email" class="form-control">
									</div>
									
									<div class="form-text form-check form-check-inline feedback-subscribe">
										<input class="form-check-input" type="checkbox" value="true" name="signup" id="signup">
										<label class="form-check-label" for="signup"><?php _e ( 'Subscribe to the ClimateData.ca newsletter', 'cdc' ); ?></label>
									</div>
									
								</div>
								
								<div class="col">
									
									<label for="phone" class="form-label"><?php _e ( 'Telephone', 'cdc' ); ?></label>
									
									<input type="text" name="phone" class="form-control">
									
								</div>
								
								<div class="col">
									
									<label for="region" class="form-label"><?php _e ( 'Where are you contacting us from?', 'cdc' ); ?></label>
									
									<div class="d-flex">
										<select name="region" class="form-select has-other">
											<option disabled selected><?php _e ( 'Select your region', 'cdc' ); ?></option>
											<option><?php _e ( 'Alberta', 'cdc' ); ?></option>
											<option><?php _e ( 'British Columbia', 'cdc' ); ?></option>
											<option><?php _e ( 'Manitoba', 'cdc' ); ?></option>
											<option><?php _e ( 'New Brunswick', 'cdc' ); ?></option>
											<option><?php _e ( 'Newfoundland and Labrador', 'cdc' ); ?></option>
											<option><?php _e ( 'Northwest Territories', 'cdc' ); ?></option>
											<option><?php _e ( 'Nova Scotia', 'cdc' ); ?></option>
											<option><?php _e ( 'Nunavut', 'cdc' ); ?></option>
											<option><?php _e ( 'Ontario', 'cdc' ); ?></option>
											<option><?php _e ( 'Prince Edward Island', 'cdc' ); ?></option>
											<option><?php _e ( 'Québec', 'cdc' ); ?></option>
											<option><?php _e ( 'Saskwatchewan', 'cdc' ); ?></option>
											<option><?php _e ( 'Yukon', 'cdc' ); ?></option>
											<option><?php _e ( 'USA', 'cdc' ); ?></option>
											<option value="Other"><?php _e ( 'Other', 'cdc' ); ?></option>
										</select>
								
										<input type="text" name="region-other" class="form-control other ms-3" placeholder="<?php _e ( 'Please specify', 'cdc' ); ?>">
									
									</div>
									
								</div>
								
							</div>
						
							<div class="row row-cols-1 row-cols-lg-2 g-4 pb-6 mb-6 border-bottom">
								
								<div class="col">
									
									<label for="organization" class="form-label"><?php _e ( 'Organization', 'cdc' ); ?></label>
									
									<input type="text" name="organization" class="form-control">
									
								</div>
								
								<div class="col">
									
									<label for="role" class="form-label"><?php _e ( 'Which role best describes you?', 'cdc' ); ?></label>
									
									<div class="d-flex">
										<select name="role" class="form-select has-other">
											<option disabled selected><?php _e ( 'Select an option', 'cdc' ); ?></option>
											<option><?php _e ( 'General public', 'cdc' ); ?></option>
											<option><?php _e ( 'Academic / Research', 'cdc' ); ?></option>
											<option><?php _e ( 'Business / Industry', 'cdc' ); ?></option>
											<option><?php _e ( 'Government – federal', 'cdc' ); ?></option>
											<option><?php _e ( 'Government – Indigenous', 'cdc' ); ?></option>
											<option><?php _e ( 'Government – municipal', 'cdc' ); ?></option>
											<option><?php _e ( 'Government – provincial / territorial', 'cdc' ); ?></option>
											<option><?php _e ( 'Media', 'cdc' ); ?></option>
											<option><?php _e ( 'Not-for-profit organization', 'cdc' ); ?></option>
											<option value="Other"><?php _e ( 'Other', 'cdc' ); ?></option>
										</select>
									
										<input type="text" name="role-other" class="form-control other ms-3" placeholder="<?php _e ( 'Please specify', 'cdc' ); ?>">
									</div>
									
								</div>
								
							</div>
							
							
							<div class="row row-cols-1 row-cols-lg-2 g-4 pb-6 mb-6 border-bottom">
								
								<div class="col">
									<label for="subject" class="form-label"><?php _e ( 'What is your inquiry related to?', 'cdc' ); ?></label>
									
									<div class="d-flex">
										<select name="subject" class="form-select has-other">
											<option disabled selected><?php _e ( 'Select an option', 'cdc' ); ?></option>
											<option><?php _e ( 'Agriculture / Food / Fishing', 'cdc' ); ?></option>
											<option><?php _e ( 'Conservation / Environment', 'cdc' ); ?></option>
											<option><?php _e ( 'Construction / Buildings', 'cdc' ); ?></option>
											<option><?php _e ( 'Education / Training', 'cdc' ); ?></option>
											<option><?php _e ( 'Energy', 'cdc' ); ?></option>
											<option><?php _e ( 'Finance / Insurance', 'cdc' ); ?></option>
											<option><?php _e ( 'Forestry', 'cdc' ); ?></option>
											<option><?php _e ( 'Health', 'cdc' ); ?></option>
											<option><?php _e ( 'Information Technology', 'cdc' ); ?></option>
											<option><?php _e ( 'Mining', 'cdc' ); ?></option>
											<option><?php _e ( 'Municipal Services / Planning', 'cdc' ); ?></option>
											<option><?php _e ( 'Public Safety', 'cdc' ); ?></option>
											<option><?php _e ( 'Tourism / Recreation', 'cdc' ); ?></option>
											<option><?php _e ( 'Transportation', 'cdc' ); ?></option>
											<option value="Other"><?php _e ( 'Other', 'cdc' ); ?></option>
										</select>
									
										<input type="text" name="subject-other" class="form-control other ms-3" placeholder="<?php _e ( 'Please specify', 'cdc' ); ?>">
									</div>
								</div>
								
								<div class="col">
									
									<p class="form-label"><?php _e ( 'Describe your inquiry', 'cdc' ); ?></p>
									
									<div class="my-2">
										<div class="form-check form-check-inline">
											<input class="form-check-input" type="radio" name="feedback-type" id="feedback-type-general" value="general" checked>
											<label class="form-check-label" for="feedback-type-general"><?php _e ( 'General', 'cdc' ); ?></label>
										</div>
										
										<div class="form-check form-check-inline">
											<input class="form-check-input" type="radio" name="feedback-type" id="feedback-type-bug" value="bug">
											<label class="form-check-label" for="feedback-type-bug"><?php _e ( 'Report a bug', 'cdc' ); ?></label>
										</div>
										
										<div class="form-check form-check-inline me-0">
											<input class="form-check-input" type="radio" name="feedback-type" id="feedback-type-demo" value="demo">
											<label class="form-check-label" for="feedback-type-demo"><?php _e ( 'Request a demo', 'cdc' ); ?></label>
										</div>
									</div>
									
								</div>
						
							</div><!--row-->
						
							<div class="row row-cols-1 row-cols-lg-2 g-4">
								<div class="col d-flex flex-column">
									
									<label for="feedback" class="form-label"><?php _e ( 'Comments', 'cdc' ); ?></label>
									
									<textarea name="feedback" rows="12" class="form-control flex-grow-1"></textarea>
									
								</div>
								
								<div class="col d-flex flex-column justify-content-between">
									
									<div>
										<label for="referral" class="form-label"><?php _e ( 'How did you hear about ClimateData.ca?', 'cdc' ); ?></label>
										
										<div class="d-flex mb-4">
											<select name="referral" class="form-select has-other">
												<option disabled selected><?php _e ( 'Select an option', 'cdc' ); ?></option>
												<option><?php _e('Word of mouth', 'cdc' ); ?></option>
												<option><?php _e('Services offered by the Canadian Centre for Climate Services (e.g. webinar, workshop or Support Desk)', 'cdc' ); ?></option>
												<option><?php _e('Professional association', 'cdc' ); ?></option>
												<option><?php _e('Organization focused on climate/adaptation', 'cdc' ); ?></option>
												<option><?php _e('Conference', 'cdc' ); ?></option>
												<option><?php _e('Media (e.g. social media, online, TV, print, radio)', 'cdc' ); ?></option>
												<option><?php _e('Internet search', 'cdc' ); ?></option>
												<option value="Other"><?php _e('Other', 'cdc' ); ?></option>
											</select>
											
											<input type="text" name="referral-other" class="form-control other ms-3" placeholder="<?php _e ( 'Please specify', 'cdc' ); ?>">
										</div>	
									</div>
									
									<div class="bg-light p-4">
										
										<div class="alert-container" style="display: none;">
											<h5 class="alert-header"></h5>
											<ul class="alert-messages"></ul>
										</div>
										
										<div class="d-flex align-items-center mb-4">
											<div class="captcha-img">
												<?php
												
													$captcha_options = array (
														'code_length' => 4,
														'input_name' => 'feedback_captcha_code',
														'input_id' => 'feedback_captcha',
														'image_id' => 'feedback_captcha_img',
														'icon_size' => 16,
														'input_text' => __ ( 'Enter the characters shown in the image:', 'cdc' ),
														'namespace' => 'feedback',
													);
												
													// image
													echo Securimage::getCaptchaHtml ( $captcha_options, Securimage::HTML_IMG );
													
													// refresh
													echo Securimage::getCaptchaHtml ( $captcha_options, Securimage::HTML_ICON_REFRESH );
													
													// audio
													echo Securimage::getCaptchaHtml ( $captcha_options, Securimage::HTML_AUDIO );
													
												?>
											</div>
											
											<div class="">
												<input type="hidden" name="namespace" value="<?php echo $captcha_options['namespace']; ?>">
												
												<label for="captcha_code" class="form-label small"><?php _e ( 'Enter the characters shown in the image', 'cdc' ); ?>:</label>
												
												<input type="text" name="captcha_code" id="captcha_code" class="form-control" placeholder="XXXX" size="4" maxlength="4" data-placement="bottom" title="<?php _e ( 'Non-valid entered characters. Please try again.', 'cdc' ); ?>">
											</div>
										</div>
									
										<button class="submit-btn btn btn-lg btn-primary rounded-pill d-block mx-auto" type="submit" id="feedback-online-submit"><?php _e ( 'Submit Feedback', 'cdc' ); ?> <i class="far fa-arrow-alt-circle-right ms-3"></i></button>	
										
									</div>
									
								</div>
							</div>
					
						
						</div>
					</div>
					
				</form>
				
			</div>
		</div>
	</div>
	
	<div class="accordion-item"> 
		<div id="accordion-head-dataset" class="accordion-header">
			<div class="accordion-button collapsed row py-4 ps-0" 
				data-bs-toggle="collapse"
				data-bs-target="#dataset-support" 
				aria-expanded="false" 
				aria-controls="dataset-support"
			>
				<h3 class="col offset-2 mb-0">
					<?php _e ( 'Dataset Support', 'cdc' ); ?>
				</h3>
			</div> 
		</div>
		
		<div
			id="dataset-support"
			class="accordion-collapse collapse" 
			aria-labelledby="accordion-head-dataset"
			data-bs-parent="#feedback-accordion"
		> 
			<div class="accordion-body py-6"> 
				
				<form id="feedback-data-form" class="feedback-form needs-validation" novalidate>
					
					<input type="hidden" name="feedback-type" value="data">
					
					<div class="row">
					
						<div class="col-10 offset-2">
							<div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 pb-6 mb-6 border-bottom">
								
								<div class="col">
									<label for="fullname" class="form-label"><?php _e ( 'Full Name', 'cdc' ); ?></label>
								
									<input type="text" name="fullname" class="form-control">
								</div>
								
								<div class="col">
									<label for="email" class="form-label"><?php _e ( 'Email Address', 'cdc' ); ?></label>
								
									<input type="email" name="email" class="form-control">
								</div>
								
								<div class="col">
									<label for="organization" class="form-label"><?php _e ( 'Organization', 'cdc' ); ?></label>
								
									<input type="text" name="organization" class="form-control">
								</div>
								
							</div>
						
							<div class="row row-cols-1 row-cols-lg-2 g-4">
						
								<div class="col d-flex flex-column">
								
									<label for="feedback" class="form-label"><?php _e ( 'Feedback', 'cdc' ); ?></label>
									
									<textarea name="feedback" rows="12" class="form-control flex-grow-1"></textarea>
									
								</div>
								
								<div class="col bg-light p-4 align-self-end">
									
									<div class="alert-container" style="display: none;">
										<h5 class="alert-header"></h5>
										<ul class="alert-messages"></ul>
									</div>
									
									<div class="d-flex align-items-center mb-4">
										<div class="captcha-img">
											<?php
											
												$captcha_options = array (
													'code_length' => 4,
													'input_name' => 'support_captcha_code',
													'input_id' => 'support_captcha',
													'image_id' => 'support_captcha_img',
													'icon_size' => 16,
													'input_text' => __ ( 'Enter the characters shown in the image:', 'cdc' ),
													'namespace' => 'support',
												);
												
												// image
												echo Securimage::getCaptchaHtml ( $captcha_options, Securimage::HTML_IMG );
												
												// refresh
												echo Securimage::getCaptchaHtml ( $captcha_options, Securimage::HTML_ICON_REFRESH );
												
												// audio
												echo Securimage::getCaptchaHtml ( $captcha_options, Securimage::HTML_AUDIO );
													
											?>
										</div>
										
										<div class="">
											<input type="hidden" name="namespace" value="<?php echo $captcha_options['namespace']; ?>">
											
											<label for="captcha_code" class="form-label small"><?php _e ( 'Enter the characters shown in the image', 'cdc' ); ?>:</label>
											
											<input type="text" name="captcha_code" id="captcha_code" class="form-control" placeholder="XXXX" size="4" maxlength="4" data-placement="bottom" title="<?php _e ( 'Non-valid entered characters. Please try again.', 'cdc' ); ?>">
										</div>
									</div>
								
									<button class="submit-btn btn btn-lg btn-primary rounded-pill d-block mx-auto" type="submit" id="feedback-data-submit"><?php _e ( 'Submit Feedback', 'cdc' ); ?> <i class="far fa-arrow-alt-circle-right ms-3"></i></button>	
									
								</div>
								
							</div>
						</div>
						
					</div>
					
				</form>
				
			</div> 
		</div> 
	</div>

	<div class="accordion-item"> 
		<div id="accordion-head-betaapps" class="accordion-header">
			<div class="accordion-button collapsed row py-4 ps-0" 
				data-bs-toggle="collapse"
				data-bs-target="#betaapps-support" 
				aria-expanded="false" 
				aria-controls="betaapps-support"
			>
				<h3 class="col offset-2 mb-0">
					<?php _e ( 'Beta Apps Support', 'cdc' ); ?>
				</h3>
			</div> 
		</div>
		
		<div
			id="betaapps-support"
			class="accordion-collapse collapse" 
			aria-labelledby="accordion-head-betaapps"
			data-bs-parent="#feedback-accordion"
		> 
			<div class="accordion-body py-6"> 
				
				<form id="feedback-betaapps-form" class="feedback-form needs-validation" novalidate>
					
					<input type="hidden" name="feedback-type" value="betaapps">
					
					<div class="row">
					
						<div class="col-10 offset-2">
							<div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 pb-4">
								
								<div class="col">

									<label for="fullname" class="form-label"><?php _e ( 'Full Name', 'cdc' ); ?></label>
								
									<input type="text" name="fullname" class="form-control">

								</div>
								
								<div class="col">

									<label for="email" class="form-label"><?php _e ( 'Email Address', 'cdc' ); ?></label>
								
									<input type="email" name="email" class="form-control">

								</div>
								
								<div class="col">

									<label for="organization" class="form-label"><?php _e ( 'Organization', 'cdc' ); ?></label>
								
									<input type="text" name="organization" class="form-control">

								</div>

							</div>

							<div class="row pb-6 mb-6 border-bottom">

								<div class="col">
									
									<p class="form-label"><?php _e ( 'Which apps do you need support for?', 'cdc' ); ?></p>
									
									<div class="my-2 error-input-parent">

										<?php

											// Query posts from the custom post type 'beta-app'
											$args = array(
												'post_type' => 'beta-app',
												'posts_per_page' => -1,
											);

											$query = new WP_Query( $args );

											if ( $query->have_posts() ) {

												while ( $query->have_posts() ) {

													$query->the_post();
													$post_id = get_the_ID();
													$post_title = get_the_title();
													$post_slug = sanitize_title_with_dashes( $post_title );

										?>
													
										<div class="form-check form-check-inline">

											<input class="form-check-input" type="checkbox" name="betaapps-posts[]" id="betaapp-type-<?php echo $post_slug ?>" value="<?php echo $post_slug ?>">

											<label class="form-check-label" for="betaapp-type-<?php echo $post_slug ?>"><?php echo $post_title ?></label>

										</div>

										<?php

												}
												
											}

											wp_reset_postdata();

										?>

									</div>
									
								</div>
								
							</div>
						
							<div class="row row-cols-1 row-cols-lg-2 g-4">
						
								<div class="col d-flex flex-column">
								
									<label for="feedback" class="form-label"><?php _e ( 'Feedback', 'cdc' ); ?></label>
									
									<textarea name="feedback" rows="12" class="form-control flex-grow-1"></textarea>
									
								</div>
								
								<div class="col bg-light p-4 align-self-end">
									
									<div class="alert-container" style="display: none;">
										<h5 class="alert-header"></h5>
										<ul class="alert-messages"></ul>
									</div>
									
									<div class="d-flex align-items-center mb-4">
										<div class="captcha-img">
											<?php
											
												$captcha_options = array (
													'code_length' => 4,
													'input_name' => 'betaapps_captcha_code',
													'input_id' => 'betaapps_captcha',
													'image_id' => 'betaapps_captcha_img',
													'icon_size' => 16,
													'input_text' => __ ( 'Enter the characters shown in the image:', 'cdc' ),
													'namespace' => 'betaapps',
												);
												
												// image
												echo Securimage::getCaptchaHtml ( $captcha_options, Securimage::HTML_IMG );
												
												// refresh
												echo Securimage::getCaptchaHtml ( $captcha_options, Securimage::HTML_ICON_REFRESH );
												
												// audio
												echo Securimage::getCaptchaHtml ( $captcha_options, Securimage::HTML_AUDIO );
													
											?>
										</div>
										
										<div class="">
											<input type="hidden" name="namespace" value="<?php echo $captcha_options['namespace']; ?>">
											
											<label for="captcha_code" class="form-label small"><?php _e ( 'Enter the characters shown in the image', 'cdc' ); ?>:</label>
											
											<input type="text" name="captcha_code" id="captcha_code" class="form-control" placeholder="XXXX" size="4" maxlength="4" data-placement="bottom" title="<?php _e ( 'Non-valid entered characters. Please try again.', 'cdc' ); ?>">
										</div>
									</div>
								
									<button class="submit-btn btn btn-lg btn-primary rounded-pill d-block mx-auto" type="submit" id="feedback-data-submit"><?php _e ( 'Submit Feedback', 'cdc' ); ?> <i class="far fa-arrow-alt-circle-right ms-3"></i></button>	
									
								</div>
								
							</div>
						</div>
						
					</div>
					
				</form>
				
			</div> 
		</div> 
	</div> 
</div> 
