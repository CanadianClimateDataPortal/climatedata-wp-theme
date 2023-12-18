<?php

//
// MODAL CONTAINER
//

function insert_fw_modal_container() {

?>

<div class="modal fade fw-modal" id="fw-modal" data-bs-backdrop="static" tabindex="-1" aria-hidden="true">
	<div class="modal-dialog modal-lg">
		<div class="modal-content">
			<div class="spinner-border my-3 mx-auto"></div>
		</div>
	</div>
</div>

<?php
	
}

add_action ( 'fw_modals', 'insert_fw_modal_container' );

//
// SETTINGS MODALS
//

function fw_modal_settings() {
	
	$globals = $_GET['globals'];
	$element = $_GET['element'];

	switch ( $_GET['content'] ) {
		case 'save' :
		case 'page' :
		case 'delete' :
		// case 'new-post' :
		case 'do-layout' :
			
			include ( locate_template ( 'resources/functions/builder/modals/' . $_GET['content'] . '.php' ) );
			
			break;
			
		default :
			
			$modal_content = $_GET['content'];
			
			if ( str_contains ( $modal_content, '/' ) ) {
				$modal_content = explode ( '/', $modal_content );
				$modal_content = $modal_content[0];
			}
	
?>
	
<div class="modal-header">
	<h4 class="modal-title">
		<span class="modal-title-action"></span>
		<span class="modal-title-content"><?php echo $modal_content; ?></span>
	</h4>
	
	<div>
		<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
		
		<?php
		
			if ( $_GET['content'] != 'block' ) {
		
		?>
		
		<button type="button" class="btn btn-primary fw-settings-submit">Add</button>
		
		<?php
		
			}
		
		?>
		
	</div>
</div>

<div class="modal-body p-0">
	
	<form class="accordion accordion-flush" id="element-form">
		<?php
		
			include ( locate_template ( 'resources/functions/builder/field-groups/' . $_GET['content'] . '.php' ) );
			
			if ( substr ( $_GET['content'], 0, 4) !== 'post' ) {
				
		?>
		
		<div class="accordion-item">
			<h2 class="accordion-header" id="element-form-head-settings">
				<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#element-form-settings" aria-expanded="false" aria-controls="element-form-settings">
					Settings
				</button>
			</h2>
			
			<div id="element-form-settings" class="accordion-collapse collapse" aria-labelledby="element-form-head" data-bs-parent="#element-form">
				<div class="accordion-body container-fluid">
					<?php
					
						include ( locate_template ( 'resources/functions/builder/field-groups/settings.php' ) );
						
					?>
				</div>
			</div>
		</div>
		
		<?php
		
			}
			
			do_action ( 'fw_modal_accordion_items', $_GET['content'] );
			
		?>
		
	</form>
</div>

<?php

	}
	
	wp_die();
	
}

add_action ( 'wp_ajax_fw_modal_settings', 'fw_modal_settings' );

//
// INCLUDE FLEX FORM
//

function fw_modal_add_setting() {
	
	// dumpit ( $_GET['setting_data'] );
	
	if ( isset ( $_GET['path'] ) ) {
		
		$full_path = 'resources/functions/builder/field-groups/' . $_GET['path'] . '.php';
		
		// echo $full_path . '.php';
		
		if ( locate_template ( $full_path ) != '' ) {
			
			echo '<div class="fw-form-flex-row" data-item="' . $_GET['path'] . '" data-row-index="0">';
			
			include ( locate_template ( $full_path ) );
			
			echo '</div>';
			
		} else {
			
			// echo 'huh';
			
		}
		
	}
	
	// include ( locate_template ( 'resources/functions/builder/' . $_GET['setting'] . '.php' ) );
	
	wp_die();
	
}

add_action ( 'wp_ajax_fw_modal_add_setting', 'fw_modal_add_setting' );

/*

test feature:

//
// OUTPUT FIELDS
//

function fw_output_modal_fields() {
	
	foreach ( $modal_fields as $key => $field ) {
			
		if ( $field['type'] == 'hidden' ) {
				
?>

<input
	type="<?php echo $field['type']; ?>" 
	name="<?php echo $key; ?>" 
	id="<?php echo $key; ?>"
	<?php echo ( isset ( $field['value'] ) ) ? 'value="' . $field['value'] . '"' : ''; ?>
>

<?php

		} else {
			
?>

<div class="col <?php echo $field['column_class']; ?>">
	
	<label for="<?php echo $key; ?>" class="form-label"><?php echo $field['label']; ?></label>
	
	<?php
	
			switch ( $field['type'] ) {
					
				case 'text' :
				
	?>
	
	<input
		type="<?php echo $field['type']; ?>" 
		name="<?php echo $key; ?>" 
		id="<?php echo $key; ?>"
		class="form-control"
		<?php echo ( isset ( $field['value'] ) ) ? 'value="' . $field['value'] . '"' : ''; ?>
	>
	
	<?php

					break;
					
				case 'select' :
					
	?>
	
	<select name="<?php echo $key; ?>" id="<?php echo $key; ?>" class="form-select">
	
		<?php
					
					if ( $field['groups'] == false ) {
						
						foreach ( $field['options'] as $value => $label ) {
							
		?>
		
		<option value="<?php echo $value; ?>"><?php echo $label; ?></option>
			
		<?php
		
						}
						
					}
					
		?>
		
	</select>
	
	<?php
	
					break;
				
			} // switch
		
	?>
	
</div>

<?php

		} // not hidden
		
	} // each field

}

//

*/