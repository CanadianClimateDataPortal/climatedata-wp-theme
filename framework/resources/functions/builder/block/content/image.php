<?php

	$img_urls = json_decode ( $element['inputs']['file']['url'], true );

?>

<img src="<?php echo $img_urls['full']; ?>">