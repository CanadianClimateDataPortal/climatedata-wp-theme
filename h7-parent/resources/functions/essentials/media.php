<?php
  
/*
  
  1. get file info by attachment ID e.g. filename, extension, size etc.

*/

//
// 1.
// GET FILE INFO BY ATTACHMENT ID
//

function file_info($file_ID) {
  
  $file['id'] = $file_ID;
  $file['url'] = wp_get_attachment_url($file['id']);
  
  $file['filename'] = explode('/', $file['url']);
  $file['filename'] = $file['filename'][count($file['filename']) - 1];
  
  $file_info = wp_check_filetype_and_ext($file['url'], $file['filename']);
  $file['extension'] = $file_info['ext'];
  $file['mime'] = $file_info['type'];
  
  $file['size'] = size_format(filesize(get_attached_file($file['id'])));
  
  return $file;
  
}