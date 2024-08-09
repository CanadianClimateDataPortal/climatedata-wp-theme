<?php

/*

  1. get current page URL
  2. get filename of current template
  3. output obfuscated email address
	4. get directory contents

*/

//
// 1.
// GET CURRENT PAGE URL
//

function current_URL() {

	$pageURL = 'http';

	if (
		( !empty ($_SERVER['HTTPS'] ) && $_SERVER['HTTPS'] !== 'off' ) ||
		$_SERVER['SERVER_PORT'] == 443
	) {
		$pageURL .= 's';
	}

	$pageURL .= '://' . $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI'];

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

function obfuscate ( $email ) {
	$email_obfuscated = '';

  for ( $i = 0; $i < strlen ( $email ); $i++) {
    $email_obfuscated .= "&#" . ord ( $email[$i] ) . ";";
  }

  return $email_obfuscated;
}

//
// 4.
// GET DIR CONTENTS
//

function get_dir_contents ( $dir, &$results = array() ) {

	$files = scandir ( $dir );

	foreach ($files as $key => $value) {

		$path = realpath ( $dir . DIRECTORY_SEPARATOR . $value );

		if ( ! is_dir ( $path ) ) {

			$results[] = $path;

		} else if ( substr ( $value, 0, 1) != '.' && $value != '.' && $value != '..' ) {

			get_dir_contents ( $path, $results );
			// $results[] = $path;

		}

	}

	return $results;
}

//
// 5.
// DUMPIT
//

function dumpit ( $var ) {

	echo '<pre style="font-size: 9px;">';
	print_r ( $var );
	// var_dump ( $var );
	echo '</pre>';
}
