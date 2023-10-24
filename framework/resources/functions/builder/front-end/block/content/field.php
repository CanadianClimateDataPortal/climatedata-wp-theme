<?php

	$field_ID = $globals['current_query']['ID'];
	
	if ( $element['inputs']['post_id'] != '' ) {
		$field_ID = $element['inputs']['post_id'];
	} 

	$key = $element['inputs']['key'];
	
	if (
		$element['inputs']['translate'] == true &&
		$globals['current_lang_code'] != 'en'
	) {
		$key .= '_' . $globals['current_lang_code'];
	}
	
	$field_output = get_post_meta ( $field_ID, $key, true );
	
	if ( $element['inputs']['content'] == true ) {
		$field_output = wptexturize ( $field_output );
	}

?>

<<?php echo $element['inputs']['display']; ?>><?php
	
	echo $field_output;
	
?></<?php echo $element['inputs']['display']; ?>>