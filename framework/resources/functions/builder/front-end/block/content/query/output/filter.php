<?php

	$filter_items = array();
	
	$filter_atts = array(
		'type' => $options['by'],
		'multi' => $options['multi']
	);
	
	switch ( $options['by'] ) {
		
		case 'post_type' :
			
			if ( $args['post_type'] != 'any' ) {
				
				foreach ( $args['post_type'] as $post_type ) {
					
					$post_type_obj = get_post_type_object ( $post_type );
					
					$filter_items[] = array (
						'key' => null,
						'value' => $post_type,
						'label' => $post_type_obj->labels->singular_name
					);
					
				}
				
			} else {
				
				echo 'all';
				
			}
			
			break;
		
		case 'taxonomy' :
			
			$tax_obj = get_taxonomy ( $options['taxonomy'] );
			
			foreach ( get_terms ( array (
				'taxonomy' => $options['taxonomy'],
				'hide_empty' => true
			) ) as $term ) {
				
				$filter_items[] = array (
					'key' => $options['taxonomy'],
					'value' => $term->slug,
					'label' => $term->name
				);
				
			}
			
			break;
			
		case 'meta' :
			
			// only works if it's an ACF field
			// $meta_obj = acf_get_field ( $options['meta'] );
			// dumpit ( $meta_obj );
			
			// get all posts and collect their meta values
			
			$meta_val_args = $args;
			$meta_val_args['posts_per_page'] = -1;
			
			if ( !isset ( $meta_val_args['meta_query'] ) ) {
				$meta_val_args['meta_query'] = array();
			}
			
			array_push ( $meta_val_args['meta_query'], array (
				'key' => $options['meta'],
				'value' => '',
				'compare' => '!='
			) );
			
			$meta_val_query = get_posts ( $meta_val_args );
			
			if ( !empty ( $meta_val_query ) ) {
				foreach ( $meta_val_query as $post_with_meta ) {
					
					$filter_items[] = array (
						'key' => $options['meta'],
						'value' => get_post_meta ( $post_with_meta->ID, $options['meta'], true ),
						'label' => get_post_meta ( $post_with_meta->ID, $options['meta'], true )
					);
					
				}
			}
			
			break;
	}
	
?>

<div
	class="filter <?php echo implode ( ' ' , $options['class'] ); ?>"
	<?php
	
		foreach ( $filter_atts as $att => $val ) {
			echo ' data-filter-' . $att . '="' . $val . '"';
		}
		
	?>>
	
	<h6 class="<?php echo $options['heading_class']; ?>"><?php 
	
		switch ( $options['by'] ) {
			case 'post_type' :
				_e ( 'Post Type', 'fw' );
				break;
			
			case 'taxonomy' :
				echo $tax_obj->label;
				break;
				
			case 'meta' :
				echo $options['label'];
				break;
			
		}
		
	?></h6>
	
	<ul class="<?php echo $options['list_class']; ?>">
		<?php
		
			foreach ( $filter_items as $item ) {
			
		?>
		
		<li class="filter-item" data-key="<?php echo $item['key']; ?>" data-value="<?php echo $item['value']; ?>"><?php echo $item['label']; ?></li>
		
		<?php
		
			}
	
		?>
	</ul>
	
</div>