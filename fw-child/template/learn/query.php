<div id="learn-grid" class="col row bg-gray-200">
	<?php
	
		//
		// CONTROL BAR
		//
		
		include ( locate_template ( 'template/learn/control-bar.php' ) );
		
		//
		// QUERY
		//
		
		$item_options = array (
			'type' => 'items',
			'template' => 'learn-item.php',
			'id' => '',
			'class' => array ( 'row', 'row-cols-3' ),
			'item_class' => 'col'
		);
			
	?>
	
	<div class="col-13 offset-1">
		<div class="tab-drawer-bumper">
			<div class="pt-6">
				
				<ul id="sort-menu" class="fw-query-sort list-unstyled d-flex all-caps">
					<li class="selected me-4" data-sort="title_asc"><i class="fas fa-arrow-from-bottom me-2"></i> <?php _e ( 'Title (A–Z)', 'cdc' ); ?></li>
					<li class="me-4" data-sort="title_desc"><i class="fas fa-arrow-from-top me-2"></i> <?php _e ( 'Title (Z–A)', 'cdc' ); ?></li>
					<li class="me-4" data-sort="date_desc"><i class="fas fa-arrow-from-top me-2"></i> <?php _e ( 'Newest First', 'cdc' ); ?></li>
					<li class="" data-sort="date_asc"><i class="fas fa-arrow-from-bottom me-2"></i> <?php _e ( 'Oldest First', 'cdc' ); ?></li>
				</ul>
				
			</div>
			
			<?php
				
				$i = 1;
				
				foreach ( get_terms ( array (
					'taxonomy' => 'topic'
				) ) as $topic ) {
				
					$topic_args = array (
						'posts_per_page' => 12,
						'post_type' => 'resource',
						'orderby' => 'menu_order',
						'order' => 'asc',
						'post_parent' => 0,
						'post_status' => 'publish',
						'tax_query' => array (
							array (
								'taxonomy' => 'topic',
								'field' => 'slug',
								'terms' => array ( $topic->slug )
							)
						)
					);
				
			?>
			
			<div id="topic-<?php echo $i; ?>" class="learn-topic-grid py-7" data-args='<?php echo json_encode ( $topic_args ); ?>'>
				
				<h4 class="learn-topic-title mb-7 d-flex align-items-center font-weight-normal">
					<span class="circle-number"><?php echo $i; ?></span>
					<?php
					
						echo fw_get_field ( 'title', 'topic_' . $topic->term_id );
						
					?>
				</h4>
				
				<div id="" class="query-container ">
					<div class="fw-query-items row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3 g-lg-6" data-options='<?php echo json_encode ( $item_options ); ?>'>
						
						<div class="fw-query-item"></div>
					
					</div>
				</div>
			</div>
		
			<?php 
			
					$i++;
				}
		
			?>
			
		</div>
	</div>
	
</div>