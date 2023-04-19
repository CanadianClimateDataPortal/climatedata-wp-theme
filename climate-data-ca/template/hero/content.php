<?php
	
?>

<div class="col-10 offset-1 col-sm-8 offset-sm-2 col-lg-6 offset-lg-1">
	<h1><?php
		
		if ( $hero_fields['title'] != '' ) {
			echo $hero_fields['title'];
		} else {
			the_title();
		}
		
	?></h1>
	
	<?php echo apply_filters ( 'the_content', $hero_fields['text'] ); ?>
	
	<?php
	
		if ( is_front_page() ) {
			
	?>
	
	<!-- Begin Mailchimp Signup Form -->
	<div id="mc_embed_signup" class="mt-5 p-4 hero-menu">
		<h6><?php _e ( 'Subscribe to Climate Data’s Newsletter', 'cdc' ); ?></h6>
	
		<form action="https://climatedata.us1.list-manage.com/subscribe/post?u=c52e1be341cba7905716a66b4&amp;id=727cebaf22" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
			<div id="mc_embed_signup_scroll">

				<label for="mce-EMAIL" class="sr-only"><?php _e('Email Address', 'cdc'); ?></label>

				<div class="input-group mc-field-group">
					<input type="email" value="" name="EMAIL" class="required email form-control form-control-lg" id="mce-EMAIL" placeholder="<?php _e('Enter your email address', 'cdc'); ?>">

					<div class="input-group-append">
						<input type="submit" value="<?php _e('Subscribe', 'cdc'); ?>" name="subscribe" id="mc-embedded-subscribe" class="btn btn-secondary">
					</div>
				</div>

				<div id="mce-responses" class="clear">
					<div class="response" id="mce-error-response" style="display:none"></div>
					<div class="response" id="mce-success-response" style="display:none"></div>
				</div>
				<!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->

				<div style="position: absolute; left: -5000px;" aria-hidden="true">
					<input type="text" name="b_c52e1be341cba7905716a66b4_727cebaf22" tabindex="-1" value="">
				</div>
			</div>
		</form>
	</div>
	<!--End mc_embed_signup-->
	
	<?php
	
		}
		
	?>
</div>