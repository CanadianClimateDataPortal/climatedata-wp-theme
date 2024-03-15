<?php

	$img_urls = json_decode ( $element['inputs']['file']['url'], true );
	
	$link_url = '';
	
	switch ( $element['inputs']['link']['type'] ) {
		case 'post' :
			$link_url = get_permalink ( $element['inputs']['link']['post'] );
			break;
		case 'url' :
			$link_url = $element['inputs']['link']['url'];
			break;
	}
	
	if ( $link_url != '' ) {
		
		echo '<a href="' . $link_url . '"';
		
		if ( $element['inputs']['link']['target'] == 'blank' ) {
			echo ' target="_blank"';
		}
		
		echo '>';
		
	}

?>

<img src="<?php echo $img_urls['full']; ?>">

<?php

	if ( $link_url != '' ) {
		echo '</a>';
	}