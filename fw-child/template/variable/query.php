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

<div id="" class="col row bg-gray-200">
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
	
	<div class="col-13 offset-1">
		<div class="tab-drawer-bumper">

			<?php
				$sort_asc = 'title_asc';
				$sort_desc = 'title_desc';

				$variables_args = array(
					'posts_per_page' => -1,
					'post_type'      => 'variable',
					'post_parent'    => 0,
					'post_status'    => 'publish',
					'orderby'        => 'title',
					'order'          => 'asc'
				);

				if ( $is_fr ) {
					$sort_asc = 'meta_value_asc';
					$sort_desc = 'meta_value_desc';

					$variables_args['meta_key'] = 'title_fr';
					$variables_args['orderby']  = 'meta_value';
				}
			?>

			<div class="pt-6">
				
				<ul id="sort-menu" class="fw-query-sort list-unstyled d-flex all-caps">
					<li class="selected me-4" data-sort="<?php echo $sort_asc; ?>"><i class="fas fa-arrow-up me-2"></i> <?php _e ( 'Name (A–Z)', 'cdc' ); ?></li>
					<li data-sort="<?php echo $sort_desc; ?>"><i class="fas fa-arrow-down me-2"></i> <?php _e ( 'Name (Z–A)', 'cdc' ); ?></li>
				</ul>
				
			</div>

			<div id="variable-grid" class="py-6" data-args='<?php echo json_encode ( $variables_args ); ?>'>
				
				<div id="" class="query-container ">
					<div class="fw-query-items row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3 g-lg-6" data-options='<?php echo json_encode ( $item_options ); ?>'>
						
						<div class="fw-query-item"></div>
					
					</div>
				</div>
			</div>
		</div>
	</div>
	
</div>
