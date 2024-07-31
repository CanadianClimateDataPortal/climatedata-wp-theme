<div id="app-frame">

	<div id='iframe-error' class="initially-hidden bg-danger section-content p-4 text-center"></div>
	
	<div id='iframe-spinner' class="m-5 text-center"><i class='fa fa-spinner fa-spin fa-3x fa-fw'></i></div>
	
	
		<iframe
			data-src="<?php echo get_field ( 'app_url' ); ?>"
			id="i_frame"
			title="iframe"
			allow="fullscreen"
			data-timeout="<?php echo get_field ( 'timeout_timer' ); ?>"
			data-timeout-message="<?php echo htmlspecialchars ( get_field ( 'timeout_message' ) ); ?>"
		></iframe>
	

</div>