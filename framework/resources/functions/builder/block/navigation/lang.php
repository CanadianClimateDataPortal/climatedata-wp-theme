<ul class="<?php echo $element['inputs']['classes']['menu']; ?>">
	<?php
	
		$this_path = str_replace ( home_url() . '/', '', get_permalink ( $globals['current_query']['ID'] ) );
		
		if ( $globals['lang'] != 'en' ) {
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