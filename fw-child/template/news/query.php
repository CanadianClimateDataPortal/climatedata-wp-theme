<div id="learn-grid" class="col row">
	<?php
	
		//
		// CONTROL BAR
		//
		
		include ( locate_template ( 'template/news/control-bar.php' ) );
		
		//
		// QUERY
		//
		
		$item_options = array (
			'type' => 'items',
			'template' => 'news-item.php',
			'id' => '',
			'class' => array ( 'row', 'row-cols-3' ),
			'item_class' => 'col'
		);
		
	?>
	
	<div class="col-13 offset-1">
		<div class="tab-drawer-bumper">
			<div>
				sort
			</div>
			
			<?php
				
				$module_args = array (
					'posts_per_page' => 12,
					'post_type' => 'post',
					'post_parent' => 0,
					'post_status' => 'publish'
				);
				
			?>
			
			<div id="news-grid" class="py-6" data-args='<?php echo json_encode ( $module_args ); ?>'>
				
				<div id="" class="query-container ">
					<div class="fw-query-items row row-cols-3" data-options='<?php echo json_encode ( $item_options ); ?>'>
						
						<div class="fw-query-item"></div>
					
					</div>
				</div>
			</div>
		
		</div>
	</div>
	
</div>