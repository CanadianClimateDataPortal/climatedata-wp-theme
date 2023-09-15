<?php

$types = array (
	'section', 'container', 'column', 'block'
);

function fw_builder() {
	
	// this page's builder object
	
	// if ( metadata_exists ( 'post', get_the_ID(), 'builder' ) ) {
	// 	
	// 	$builder = get_post_meta ( get_the_ID(), 'builder', true );
	// 	
	// } else {
		
		// create default structure
		
		$this_ID = get_the_ID();
		
		$builder = array (
			array ( 
				'type' => 'section',
				'key' => $GLOBALS['counters']['section'],
				'id' => 'section-id',
				'children' => array (
					array (
						'type' => 'container',
						'key' => $GLOBALS['counters']['container'],
						'id' => 'container-id',
						'children' => array (
							array (
								'type' => 'column',
								'key' => $GLOBALS['counters']['column'],
								'id' => 'column-id',
								'children' => array ( 
									// array (
									// 	'type' => 'block',
									// 	'key' => $GLOBALS['counters']['block'],
									// 	'id' => 'block-id'
									// )
								)
							)
						)
					)
				)
			)
		);
		
		update_post_meta ( get_the_ID(), 'builder', $builder );

	// }
	
	// dumpit ( $builder );
	echo '<br><BR><BR>';
	//
	// OUTPUT
	//
	
	foreach ( $builder as $element ) {
		
		fw_output_loop ( $element, 1 );
		
	}
	
}

function fw_output_loop ( $element, $level ) {
	
	echo "\n\n";
	echo str_repeat ( "\t", $level );
	
	fw_output_element ( 'open', $element['type'], $element );
	
	if ( !empty ( $element['children'] ) ) {
		
		$level++;
	
		foreach ( $element['children'] as $child ) {
		
			fw_output_loop ( $child, $level );
			
		}
		
		$level--;
		
	}
	
	echo "\n\n";
	echo str_repeat ( "\t", $level );
	
	fw_output_element ( 'close', $element['type'], $element );
	
	$GLOBALS['counters'][$element['type']]++;
	
	echo "\n\n";
	
}

//
// OUTPUT ELEMENTS
//

function fw_output_element ( $action, $type, $element ) {
	
	if ( !isset ( $action ) ) $action == 'open';

	$classes = array();
			
	switch ( $type ) {
		
		case 'section' :
			
			$this_key = $GLOBALS['counters']['section'];
			
			$child_label = 'container';
	
			break;
			
		case 'container' : 
			
			$this_key = $GLOBALS['counters']['section'] . '-' . 
				$GLOBALS['counters']['container'];
			
			$child_label = 'column';
			
			break;
				
		case 'column' : 
			
			$this_key = $GLOBALS['counters']['section'] . '-' . 
				$GLOBALS['counters']['container'] . '-' . 
				$GLOBALS['counters']['column'];
			
			$child_label = 'block';
			
			break;
			
		case 'block' : 
			
			$this_key = $GLOBALS['counters']['section'] . '-' . 
				$GLOBALS['counters']['container'] . '-' . 
				$GLOBALS['counters']['column'] . '-' . 
				$GLOBALS['counters']['block'];
			
			break;
			
	}
		
	if ( $action == 'open' ) {
		
		echo '<div id="' . $element['id'] . '" class="fw-element fw-' . $type . '" data-key="' . $this_key . '">' . "\n\n";
		
		
		
		if ( $type == 'container' ) {
			echo "\n\t\t\t" . '<div class="fw-element-inner row">' . "\n";
		} else {
			echo "\n\t\t\t" . '<div class="fw-element-inner">' . "\n";
		}
		
	} else {
		
		echo '</div><!-- .fw-element-inner -->' . "\n\t";

		echo '<div class="fw-element-footer d-flex text-uppercase">';
		
			echo '<span class="me-2">' . $type . '</span>';
			
			if ( $type != 'block') {
			
				echo '<a href="#fw-block-type-select" data-bs-toggle="modal" class="fw-btn-insert-element me-2" data-key="' . $this_key . '">Insert ' . $child_label . '</a>' . "\n";
				
			}
			
			echo '<a href="#fw-block-type-select" data-bs-toggle="modal" class="fw-btn-add-element me-2" data-key="' . $this_key . '">Add ' . $type . '</a>' . "\n";
		
		echo '</div>';
		
		echo '</div><!-- .fw-' . $type . ' -->';
		
	}
	
}

//
// MAKE ELEMENTS
//

function fw_make_section() {
	
	$section = array (
		'type' => 'section',
		'id' => 'section-id',
	);
	
	return $section;
	
}

function fw_make_container() {
	
	$container = array (
		'type' => 'container',
		'id' => 'container-id',
	);
	
	return $container;
	
}

function fw_make_column() {
	
	$column = array (
		'type' => 'column',
		'id' => 'column-id',
	);
	
	return $column;
	
}

function fw_make_block() {
	
	$block = array (
		'type' => 'block',
		'id' => 'block-id',
	);
	
	return $block;
	
}

//
// UX
//

function block_type_modal() {
	
?>

<div class="modal fade" id="fw-block-type-select" tabindex="-1" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered">
		<div class="modal-content">
			<div class="modal-header">
				<h1 class="modal-title fs-5">Add Block</h1>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			<div class="modal-body">
				<div class="list-group">
					<button type="button" class="list-group-item list-group-item-action" aria-current="true" data-bs-toggle="modal"  data-bs-target="#fw-block-input" data-block-type="text">Text</button>
					<button type="button" class="list-group-item list-group-item-action" aria-current="true" data-bs-toggle="modal"  data-bs-target="#fw-block-input" data-block-type="image">Image</button>
				</div>
			</div>
		</div>
	</div>
</div>

<div class="modal fade" id="fw-block-input" data-bs-backdrop="static" tabindex="-1" aria-hidden="true">
	<div class="modal-dialog modal-dialog-centered">
		<div class="modal-content">
			<div class="modal-header">
				<h1 class="modal-title fs-5">New Block</h1>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
			</div>
			
			<div class="modal-body">
				<div class="spinner-border"></div>
			</div>
			
			<div class="modal-footer">
				<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
				<button type="button" class="btn btn-primary fw-save-block">Save</button>
			</div>
		</div>
	</div>
</div>

<?php
	
}

add_action ( 'fw_modals', 'block_type_modal' );