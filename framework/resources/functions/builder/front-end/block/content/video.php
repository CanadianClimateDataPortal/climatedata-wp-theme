<?php

	switch ( $element['inputs']['source'] ) {
		
		case 'code' :
		
			echo html_entity_decode ( $element['inputs']['code'] );
			break;
			
		case 'url' :
			
			echo apply_filters ( 'the_content', $element['inputs']['url'] );
			break;
			
		case 'upload' :
			
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
	
	<source src="<?php echo wp_get_attachment_url ( $file['file']['id'] ); ?>" type="video/<?php echo $file['type']; ?>">
	
	<?php
			
		}
		
	?>
</video>

<?php

			break;
			
	}