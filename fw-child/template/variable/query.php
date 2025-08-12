<?php
// Initialize current language.
$current_lang = 'en';

if (
	isset( $GLOBALS['fw'] )
	&& isset( $GLOBALS['fw']['current_lang_code'] )
	&& in_array( $GLOBALS['fw']['current_lang_code'], array( 'en', 'fr' ), true )
) {
	$current_lang = $GLOBALS['fw']['current_lang_code'];
}

$is_fr = 'fr' === $current_lang;
?>

<div class="col row bg-gray-200 position-relative z-0">
	<?php

		//
		// CONTROL BAR
		//

		include ( locate_template ( 'template/variable/control-bar.php' ) );

		//
		// QUERY
		//

		$item_options = array (
			'type' => 'items',
			'template' => 'template/query/variable-item.php',
			'id' => '',
			'class' => array ( 'row', 'row-cols-3' ),
			'item_class' => 'col'
		);

	?>

	<div class="col-12 offset-1 col-sm-13">

		<?php
			$variables_args = array(
				'posts_per_page' => -1,
				'post_type'      => 'variable',
				'post_parent'    => 0,
				'post_status'    => 'publish',
				'meta_query'     => array(
					array(
						'key'   => 'show_in_listing',
						'value' => '1',
					),
				),
			);
		?>

		<div id="variable-grid" class="py-6" data-args='<?php echo json_encode ( $variables_args ); ?>'>

			<div class="query-container">
				<div class="fw-query-items row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3 g-lg-6" data-options='<?php echo json_encode ( $item_options ); ?>'>

					<div class="fw-query-item"></div>

				</div>
			</div>
		</div>
	</div>

</div>
