<?php
/**
 * Mailchimp subscribe form block.
 */

$button_class = 'btn-gray-400';

if ( isset( $element[ 'inputs' ][ 'submit_color' ] ) ) {
	if ( 'secondary' === $element[ 'inputs' ][ 'submit_color' ] ) {
		$button_class = 'btn-secondary';
	}
}

?>

<!-- Begin Mailchimp Signup Form -->
<div id="mc_embed_signup" class="">

	<form
		action="https://climatedata.us1.list-manage.com/subscribe/post?u=c52e1be341cba7905716a66b4&amp;id=727cebaf22"
		method="post"
		id="mc-embedded-subscribe-form"
		name="mc-embedded-subscribe-form"
		class="validate"
		target="_blank"
		novalidate
	>
		<div id="mc_embed_signup_scroll">

			<label for="mce-EMAIL" class="sr-only">Email Address</label>

			<div class="input-group mc-field-group">
				<input
					type="email"
					value=""
					name="EMAIL"
					class="required email form-control border-0"
					id="mce-EMAIL"
					placeholder="<?php _e ( 'Your email address', 'cdc' ); ?>"
				>

				<button
					type="submit"
					name="subscribe"
					id="mc-embedded-subscribe"
					class="btn <?php echo esc_attr( $button_class ) ?>"
				>
					<i class="fas fa-caret-right"></i>
				</button>
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
