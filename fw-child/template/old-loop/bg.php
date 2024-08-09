<?php
	
	if ( !isset ( $bg_class ) ) {
		$bg_class = array();
	}
	
	if ( get_sub_field ( 'image' ) != '' ) {
		
		// image
		
		$bg_URL = wp_get_attachment_image_url ( get_sub_field ( 'image' ), 'hero' );
		
		// opacity
		
		$bg_class[] = 'opacity-' . get_sub_field ( 'opacity' );
		
		// position
		
		$bg_class[] = 'bg-position-' . str_replace( ' ', '-', get_sub_field ( 'position' ) );
		
		// attachment
		
		$bg_class[] = 'bg-attachment-' . get_sub_field ( 'attachment' );
	
	}
	
	if ( $bg_URL != '' ) {
	
?>

<div class="bg <?php echo implode ( ' ', $bg_class ); ?>" style="background-image: url(<?php echo $bg_URL; ?>);"></div>

<?php
	
	}
	
	$bg_URL = '';
	$bg_class = array();
	
?>