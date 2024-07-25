<div id="control-bar-secondary" class="w-100 mt-auto text-center">
	
	<a href="#details" class="control-bar-tab-link m-2"  data-bs-toggle="modal">
		<span class="cdc-icon"><?php
			
			echo file_get_contents ( locate_template ( 'resources/img/icon-help.svg' ) );
			
		?></span>
		
		<span><?php _e ( 'Details', 'cdc' ); ?></span>
	</a>
	
	<a href="#feedback" data-bs-toggle="modal" class="control-bar-text-link"><?php _e ( 'Feedback', 'cdc' ); ?></a>
</div>