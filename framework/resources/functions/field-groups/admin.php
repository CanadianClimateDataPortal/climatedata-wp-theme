<?php

$GLOBALS['fw_fields']['admin']['status'] = array (
	'settings' => array (
		'title' => 'Theme Setup'
	),
	'field_group' => array (
		'key' => 'admin_setup',
		'title' => 'Theme Setup',
		'fields' => array(
			array(
				'key' => 'admin_setup_status',
				'label' => 'Theme Status',
				'name' => '',
				'type' => 'message',
				'instructions' => '',
				'required' => 0,
				'conditional_logic' => 0,
				'wrapper' => array(
					'width' => '',
					'class' => '',
					'id' => '',
				),
				'message' => '',
				'new_lines' => 'wpautop',
				'esc_html' => 0,
			),
		),
		'location' => array(
			array(
				array(
					'param' => 'options_page',
					'operator' => '==',
					'value' => 'acf-options-setup',
				),
			),
		),
		'menu_order' => 0,
		'position' => 'normal',
		'style' => 'default',
		'label_placement' => 'top',
		'instruction_placement' => 'label',
		'hide_on_screen' => '',
		'active' => true,
		'description' => '',
		'show_in_rest' => 0,
	)
);
