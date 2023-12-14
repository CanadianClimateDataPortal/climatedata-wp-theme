<?php

	$field_ID = $globals['current_query']['ID'];
	
	if ( $element['inputs']['post_id'] != '' ) {
		$field_ID = $element['inputs']['post_id'];
	} 

	$key = $element['inputs']['key'];
	
	if (
		$element['inputs']['translate'] == 'true' &&
		$globals['current_lang_code'] != 'en'
	) {
		$key .= '_' . $globals['current_lang_code'];
	}
	
	$field_output = get_post_meta ( $field_ID, $key, true );
	
	if ( $element['inputs']['content'] == true ) {
		$field_output = wptexturize ( $field_output );
	}

	if ( $field_output != '' ) {

?>

<<?php echo $element['inputs']['display']; ?>><?php

	echo $element['inputs']['prepend'];
	echo $field_output;
	echo $element['inputs']['append'];
	
?></<?php echo $element['inputs']['display']; ?>>

<?php

	} elseif ( is_user_logged_in() ) {
		
		// show warning if logged in
		
?>

<div class="alert alert-warning fw-builder-alert">Custom field <code><?php echo  $key; ?></code> is empty. Click <span class="py-1 px-2 mx-1 text-bg-light"><i class="fas fa-pencil-alt me-2"></i>Edit in Wordpress</span> to add a value.</div>

<?php

	}
	
?>