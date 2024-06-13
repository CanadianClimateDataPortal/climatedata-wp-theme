<?php

/**
 * Block for the image field.
 *
 * The block is multilingual, supporting a different image and link for each language.
 *
 * Previous versions of this block weren't multilingual (having the same image and link for all languages). The code
 * is backward compatible: it will correctly show the image and the link if the block's content was created before the
 * newer multilingual version.
 */

/**
 * @var $element array
 */

$lang = 'en';

if ( isset ( $globals['current_lang_code'] ) ) {
	$lang = $globals['current_lang_code'];
}

// Field used to test if the block's content was created with the older (single-) or the newer (multilingual) code
$backward_test_field = $element['inputs']['file']['id'];
$backward_compatible_mode = is_string($backward_test_field);
// Test if content was created for the current language
$has_current_lang = !$backward_compatible_mode && array_key_exists($lang, $backward_test_field);
$actual_lang = ($backward_compatible_mode || $has_current_lang) ? $lang : array_keys($backward_test_field)[0];

$element_keys = [
	'inputs-file-url',
	'inputs-link-type',
	'inputs-link-post',
	'inputs-link-url',
	'inputs-link-target',
];

$element_values = [];

foreach ($element_keys as $element_key) {
	$localized_element_key = "$element_key-$actual_lang";
	$value = $element;

	foreach (explode('-', $localized_element_key) as $level_key) {
		if ( is_array($value) &&  array_key_exists($level_key, $value) ) {
			$value = $value[$level_key];
		} else {
			break;
		}
	}
	
	$element_values[$element_key] = $value;
}

if (is_user_logged_in()) {
	if ($backward_compatible_mode) {
		echo '<div class="alert alert-warning fw-builder-alert">';
		echo 'Using old format<br>(do <strong>NOT</strong> edit: delete and recreate)';
		echo '</div>';
	} else if (!$has_current_lang) {
		echo '<div class="alert alert-warning fw-builder-alert">';
		echo 'Missing image <strong>' . $lang . '</strong>';
		echo '</div>';
	}
}

$img_urls = json_decode ( $element_values['inputs-file-url'], true );

$link_url = '';

switch ( $element_values['inputs-link-type'] ) {
	case 'post' :
		$link_url = get_permalink ( $element_values['inputs-link-post'] );
		break;
	case 'url' :
		$link_url = $element_values['inputs-link-url'];
		break;
}

if ( $link_url != '' ) {

	echo '<a href="' . $link_url . '"';

	if ( $element_values['inputs-link-target'] == 'blank' ) {
		echo ' target="_blank"';
	}

	echo '>';

}

$img_url = $img_urls['full'];

?>
<img src="<?php echo $img_url ?>">
<?php

if ( $link_url != '' ) {
	echo '</a>';
}
