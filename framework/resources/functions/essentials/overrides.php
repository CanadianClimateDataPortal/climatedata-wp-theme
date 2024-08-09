<?php

/*

  1. allow SVG files in media uploader
  2. disable wp-emoji

*/

//
// 1.
// ALLOW SVG IN MEDIA UPLOADER
//

function add_file_types_to_uploads($file_types){
  $new_filetypes = array();
  $new_filetypes['svg'] = 'image/svg+xml';
  $file_types = array_merge ( $file_types, $new_filetypes );

  return $file_types;
}

add_action ( 'upload_mimes', 'add_file_types_to_uploads' );

//
// 2.
// DISABLE WP EMOJI
//

function disable_wp_emojicons() {
  remove_action ( 'admin_print_styles', 'print_emoji_styles' );
  remove_action ( 'wp_head', 'print_emoji_detection_script', 7 );
  remove_action ( 'admin_print_scripts', 'print_emoji_detection_script' );
  remove_action ( 'wp_print_styles', 'print_emoji_styles' );
  remove_filter ( 'wp_mail', 'wp_staticize_emoji_for_email' );
  remove_filter ( 'the_content_feed', 'wp_staticize_emoji' );
  remove_filter ( 'comment_text_rss', 'wp_staticize_emoji' );

  add_filter ( 'tiny_mce_plugins', 'disable_emojicons_tinymce' );
}

add_action ( 'init', 'disable_wp_emojicons' );

function disable_emojicons_tinymce( $plugins ) {
  if ( is_array( $plugins ) ) {
    return array_diff( $plugins, array( 'wpemoji' ) );
  } else {
    return array();
  }
}

//
// 3.
// REMOVE 10px MARGIN ON WP-CAPTION
//

add_filter ( 'shortcode_atts_caption', 'fix_extra_caption_padding' );

function fix_extra_caption_padding ( $atts ) {
  if ( !empty ( $atts['width'] ) ) {
    $atts['width'] -= 10;
  }

  return $atts;
}
