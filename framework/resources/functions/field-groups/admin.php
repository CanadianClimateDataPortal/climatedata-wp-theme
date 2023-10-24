<?php

//
// THEME SETUP
//

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

//
// LANGUAGES
//

$GLOBALS['fw_fields']['admin']['langs'] = array (
	'settings' => array (
		'title' => 'Languages'
	),
	'field_group' => array (
		'key' => 'admin_langs',
		'title' => 'Languages',
		'fields' => array(
			array(
				'key' => 'admin_langs_languages',
				'label' => 'Languages',
				'name' => 'fw_languages',
				'aria-label' => '',
				'type' => 'repeater',
				'instructions' => '',
				'required' => 0,
				'conditional_logic' => 0,
				'wrapper' => array(
					'width' => '',
					'class' => '',
					'id' => '',
				),
				'layout' => 'table',
				'pagination' => 0,
				'min' => 0,
				'max' => 0,
				'collapsed' => 'admin_langs_languages_name',
				'button_label' => 'Add Language',
				'rows_per_page' => 20,
				'sub_fields' => array(
					array(
						'key' => 'admin_langs_languages_name',
						'label' => 'Language Name',
						'name' => 'name',
						'aria-label' => '',
						'type' => 'text',
						'instructions' => '',
						'required' => 0,
						'conditional_logic' => 0,
						'wrapper' => array(
							'width' => '',
							'class' => '',
							'id' => '',
						),
						'default_value' => '',
						'maxlength' => '',
						'placeholder' => 'English',
						'prepend' => '',
						'append' => '',
						'parent_repeater' => 'admin_langs_languages',
					),
					array(
						'key' => 'admin_langs_languages_code',
						'label' => 'Code',
						'name' => 'code',
						'aria-label' => '',
						'type' => 'text',
						'instructions' => '',
						'required' => 0,
						'conditional_logic' => 0,
						'wrapper' => array(
							'width' => '',
							'class' => '',
							'id' => '',
						),
						'default_value' => '',
						'maxlength' => '',
						'placeholder' => 'en',
						'prepend' => '',
						'append' => '',
						'parent_repeater' => 'admin_langs_languages',
					),
					array(
						'key' => 'admin_langs_languages_locale',
						'label' => 'Locale',
						'name' => 'locale',
						'aria-label' => '',
						'type' => 'text',
						'instructions' => '',
						'required' => 0,
						'conditional_logic' => 0,
						'wrapper' => array(
							'width' => '',
							'class' => '',
							'id' => '',
						),
						'default_value' => '',
						'maxlength' => '',
						'placeholder' => 'en_US',
						'prepend' => '',
						'append' => '',
						'parent_repeater' => 'admin_langs_languages',
					),
					array(
						'key' => 'admin_langs_languages_domain',
						'label' => 'Domain',
						'name' => 'domain',
						'aria-label' => '',
						'type' => 'text',
						'instructions' => '',
						'required' => 0,
						'conditional_logic' => array(
							array(
								array(
									'field' => 'admin_langs_settings_method',
									'operator' => '==',
									'value' => 'domain',
								),
							),
						),
						'wrapper' => array(
							'width' => '',
							'class' => '',
							'id' => '',
						),
						'default_value' => '',
						'maxlength' => '',
						'placeholder' => '',
						'prepend' => '',
						'append' => '',
						'parent_repeater' => 'admin_langs_languages',
					),
				),
			),
			array(
				'key' => 'admin_langs_settings',
				'label' => 'Language Settings',
				'name' => 'fw_language_settings',
				'aria-label' => '',
				'type' => 'group',
				'instructions' => '',
				'required' => 0,
				'conditional_logic' => 0,
				'wrapper' => array(
					'width' => '',
					'class' => '',
					'id' => '',
				),
				'layout' => 'block',
				'sub_fields' => array(
					array(
						'key' => 'admin_langs_settings_method',
						'label' => 'Rewrite Method',
						'name' => 'rewrite',
						'aria-label' => '',
						'type' => 'select',
						'instructions' => '',
						'required' => 0,
						'conditional_logic' => 0,
						'wrapper' => array(
							'width' => '',
							'class' => '',
							'id' => '',
						),
						'choices' => array(
							'path' => 'Add language code to path',
							'domain' => 'Different domain for each language',
						),
						'default_value' => 'path',
						'return_format' => 'value',
						'multiple' => 0,
						'allow_null' => 0,
						'ui' => 0,
						'ajax' => 0,
						'placeholder' => '',
					),
				),
			),
		),
		'location' => array(
			array(
				array(
					'param' => 'options_page',
					'operator' => '==',
					'value' => 'acf-options-languages',
				),
			),
		),
		'menu_order' => 0,
		'position' => 'normal',
		'style' => 'seamless',
		'label_placement' => 'top',
		'instruction_placement' => 'label',
		'hide_on_screen' => '',
		'active' => true,
		'description' => '',
		'show_in_rest' => 0,
	) 
);