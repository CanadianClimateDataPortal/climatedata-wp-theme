<?php

	switch ( get_field ( 'asset_type' ) ) {
	
		case 'video' :
			
			echo '<h4>video here</h4>';
			break;
			
		case 'audio' :
			
			echo '<h4>audio here</h4>';
			break;
			
		case 'interactive' :
			
			echo '<h4>timeline here</h4>';
			break;
			
		case 'article' :
			include ( locate_template ( 'template/old-loop/sections.php' ) );
			break;
		
		
	}
	
	// 
	// dumpit ( get_field ( 'sections' ) );
	// 
	// include ( locate_template ( 'template/old-loop/sections.php' ) );
