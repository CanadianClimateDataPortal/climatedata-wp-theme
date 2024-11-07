<ul class="<?php echo $element['inputs']['classes']['menu']; ?>">
	<?php

		if ( is_404() ) {
			// If we are currently displaying the 404 page, we want the language buttons to link to the home page.
			$page_id = get_option( 'page_on_front' );
		} else {
			$page_id = $GLOBALS['fw']['current_query']['ID'];
		}
	
		$this_path = str_replace ( home_url() . '/', '', get_permalink ( $page_id ) );
		
		if ( $GLOBALS['fw']['current_lang_code'] != 'en' ) {
			$this_path = substr ( $this_path, 3 );
		}
		
		// echo 'current: ' . $this_path;
		
		// each available language
	
		foreach ( get_option ( 'fw_langs' ) as $code => $label ) {
			
			$lang_URL = home_url() . '/';
			
			if ( $code != 'en' ) {
				
				$lang_URL .= $code . '/';
				
			}
			
			$lang_URL .= $this_path;
			
	?>
	
	<li class="<?php echo $element['inputs']['classes']['item']; ?>">
		<a href="<?php echo $lang_URL; ?>" class="<?php echo $element['inputs']['classes']['link']; ?>"><?php echo $label; ?></a>
	</li>
	
	<?php
			
		}
		
	?>
</ul>
