<div class="p-3">
	<!-- <h6 class="mb-3">Content</h6> -->
		
	<div class="fw-block-type-list list-group mb-3">
		
		<?php
		
			foreach ( get_post_types ( array ( 'public' => true ) ) as $post_type ) {
				
				if ( locate_template ( 'resources/functions/builder/field-groups/post/' . $post_type . '.php' ) ) {
						
					$post_type_obj = get_post_type_object ( $post_type );
					
					// dumpit ( $post_type_obj );
				
		?>
		
		<a href="#fw-modal" class="fw-modal-trigger list-group-item list-group-item-action" aria-current="true" data-modal-content="post/<?php echo $post_type; ?>" data-block-cat="post" data-block-content="<?php echo $post_type; ?>"><?php echo $post_type_obj->labels->singular_name; ?></a>
		
		<?php
		
				}
			}
	
		?>
	</div>
</div>