<?php

/*
  
  1. get current page URL
  2. get filename of current template
  3. output obfuscated email address

*/

//
// 1.
// GET CURRENT PAGE URL
//

function current_URL() {
	$pageURL = 'http';
	$pageURL .= "://";
	if ($_SERVER["SERVER_PORT"] != "80") {
		$pageURL .= $_SERVER["SERVER_NAME"].":".$_SERVER["SERVER_PORT"].$_SERVER["REQUEST_URI"];
	} else {
		$pageURL .= $_SERVER["SERVER_NAME"].$_SERVER["REQUEST_URI"];
	}
	return $pageURL;
}

//
// 2.
// GET CURRENT FILENAME
//

function get_current_filename() {
  
  global $template;
  
  $filename = explode ( '/', $template );
  $filename = $filename[count($filename) - 1];
  $filename = explode ( '.php', $filename );
  
  return $filename[0];
  
}

// 
// 3.
// OUTPUT OBFUSCATED EMAIL ADDRESS
//

function obfuscate($email) {
  for ($i = 0; $i < strlen($email); $i++) {
    $email_obfuscated .= "&#" . ord($email[$i]) . ";";
  }
  
  return $email_obfuscated;
}