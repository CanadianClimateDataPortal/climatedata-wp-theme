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
			
			if ( taxonomy_exists ( $options['taxonomy'] ) ) {
				
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
				
			} elseif ( current_user_can ( 'administrator' ) ) {
				
				echo '<p class="alert alert-warning">Taxonomy <code>' . $options['taxonomy'] . '</code> doesn’t exist.</p>';
				
			}
			
			break;
			
		case 'meta' :
			
			$is_acf_field = false;
			
			$meta_obj = acf_get_field ( $options['meta'] );
			
			if ( $meta_obj != '' ) {
				$is_acf_field = true;
			}
			
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
			
			if ( $is_acf_field == true && isset ( $meta_obj['choices'] ) ) {
				
				foreach ( $meta_obj['choices'] as $val => $label ) {
					
					$filter_items[$val] = array (
						'key' => $options['meta'],
						'value' => $val,
						'label' => $label
					);
					
				}
				
			} else {
			
				$meta_val_query = get_posts ( $meta_val_args );
				
				if ( !empty ( $meta_val_query ) ) {
					foreach ( $meta_val_query as $post_with_meta ) {
						
						$filter_items[get_post_meta ( $post_with_meta->ID, $options['meta'], true )] = array (
							'key' => $options['meta'],
							'value' => get_post_meta ( $post_with_meta->ID, $options['meta'], true ),
							'label' => get_post_meta ( $post_with_meta->ID, $options['meta'], true )
						);
						
					}
				}
				
			}
					
			
			break;
	}
	
?>

<div
	class="fw-query-filter <?php echo implode ( ' ' , $options['class'] ); ?>"
	<?php
	
		foreach ( $filter_atts as $att => $val ) {
			echo ' data-filter-' . $att . '="' . $val . '"';
		}
		
	?>>
	
	<h6
		class="<?php echo $options['heading_class']; ?>"
		<?php if ( str_contains ( $options['heading_class'], 'dropdown' ) ) echo 'data-bs-toggle="dropdown"'; ?>
	><?php 
	
		switch ( $options['by'] ) {
			case 'post_type' :
				_e ( 'Post Type', 'fw' );
				break;
			
			case 'taxonomy' :
				if ( taxonomy_exists ( $options['taxonomy'] ) ) {
					echo $tax_obj->label;
				}
				break;
				
			case 'meta' :
				echo $options['label'];
				break;
			
		}
		
	?></h6>
	
	<ul class="<?php echo $options['list_class']; ?>">
		<?php
		
			if ( !isset ( $options['item_class'] ) ) {
				$options['item_class'] = '';
			}
			
			if ( str_contains ( $options['heading_class'], 'dropdown' ) ) {
				$options['item_class'] .= ' dropdown-item';
			}
		
			foreach ( $filter_items as $item ) {
			
		?>
		
		<li class="filter-item <?php echo $options['item_class']; ?>" data-key="<?php echo $item['key']; ?>" data-value="<?php echo $item['value']; ?>"><?php echo $item['label']; ?></li>
		
		<?php
		
			}
	
		?>
	</ul>
	
</div>