<?php

	if (
		isset ( $options['template'] ) && 
		$options['template'] != '' &&
		locate_template ( 'template/query/' . $options['template'] ) != ''
	) {
		$options['template'] = 'template/query/' . $options['template'];
	} else {
		$options['template'] = 'template/query/item.php';
	}

?>

<div
	class="fw-query-items <?php echo implode ( ' ', $options['class'] ); ?>"
	data-options='<?php echo json_encode ( $options ); ?>'
>

</div>