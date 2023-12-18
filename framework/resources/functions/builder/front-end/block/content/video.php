<?php

	$message = '';
	
	switch ( $element['inputs']['source'] ) {
		
		case 'code' :
		
			if ( $element['inputs']['code'] != '' ) {
				echo html_entity_decode ( $element['inputs']['code'][$globals['current_lang_code']] );
			} else {
				$message = 'Edit this block to add a video embed code.';
			}
			
			break;
			
		case 'url' :
			
			if ( $element['inputs']['url'] != '' ) {
				echo apply_filters ( 'the_content', $element['inputs']['url'][$globals['current_lang_code']] );
			} else {
				$message = 'Edit this block to add a video URL.';
			}
			
			break;
			
		case 'upload' :
			
			if ( $element['inputs']['upload']['rows'][0]['file']['id'] != '' ) {
					
				$video_atts = array();
				
				foreach ( $element['inputs']['upload']['atts'] as $attribute => $val ) {
					
					if ( $val == 'true' ) {
						$video_atts[] = $attribute;
					
						if ( $attribute == 'autoplay' ) {
							$video_atts[] = 'muted';
						}
					}
				
				}
			
?>

<video <?php echo implode ( ' ', $video_atts ); ?>>
	<?php
	
		foreach ( $element['inputs']['upload']['rows'] as $file ) {
			
	?>
	
	<source src="<?php echo wp_get_attachment_url ( $file['file']['id'] ); ?>" type="video/<?php echo $file['encoding']; ?>">
	
	<?php
			
		}
		
	?>
</video>

<?php

			} else {
				
				$message = 'Edit this block to upload at least one video source.';
				
			}
			
			break;
			
	}
	
	if (
		$message != '' &&
		is_user_logged_in()
	) {
		
?>

<div class="alert alert-warning"><?php echo $message; ?></div>
	
<?php
	
	}