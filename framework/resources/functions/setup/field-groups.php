<?php

function fw_acf_fields_init() {
	
	if ( function_exists ( 'acf_add_local_field_group' ) ) {
	
		$GLOBALS['fw_fields'] = array (
			'defaults' => array(),					// default values i.e. colour choices
			// 'common' => array(),						// common field groups i.e. settings, functions, elements
			'admin' => array()							// backend & admin utilities
		);
		
	}
	
	//
	// DEFAULTS
	//
	
	include ( locate_template ( 'resources/functions/field-groups/defaults.php' ) );
	
	$GLOBALS['defaults']['theme_colours'] = array (
		'primary' => 'Primary',
		'secondary' => 'Secondary',
		'light' => 'Light',
		'dark' => 'Dark',
		'white' => 'White',
		'black' => 'Black',
		'body' => 'Body Colour',
		'transparent' => 'Transparent'
	);
	
	if ( get_field ( 'theme_colours', 'option' ) != '' ) {
	
		$GLOBALS['defaults']['theme_colours'] = array();
	
		$colours = explode ( "\n", get_field ( 'theme_colours', 'option' ) );
	
		foreach ( $colours as $choice ) {
			$GLOBALS['defaults']['theme_colours'][explode ( ' : ', $choice )[0]] = explode ( ' : ', $choice )[1];
		}
	
	}
	
	//
	// ADMIN
	//
	
	// MISC
	
	include ( locate_template ( 'resources/functions/field-groups/admin.php' ) );
	
	// TAXONOMY
	
	include ( locate_template ( 'resources/functions/field-groups/taxonomy.php' ) );
	
	// REGISTER
	
	foreach ( $GLOBALS['fw_fields']['admin'] as $key => $type ) {
	
		//echo $key . '<br>';
	
		foreach ( $type as $name => $field_group ) {
	
			//echo $name . '<br>';
	
			acf_add_local_field_group ( $field_group );
	
		}
	}
	
}

add_action ( 'acf/init', 'fw_acf_fields_init' );

//
// ACTIONS
//

