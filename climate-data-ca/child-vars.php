<?php

//include ( WP_CONTENT_DIR . '/themes/h7-parent/vars.php' );

//
// QUERY STRING VARS
//

$current_data = array();

if ( isset ( $_GET['var'] ) ) {
  
  $current_data = array (
    'type' => 'variable',
    'id' => $_GET['var']
  );
  
} elseif ( isset ( $_GET['loc'] )) {
  
  $current_data = array (
    'type' => 'location',
    'id' => $_GET['loc']
  );
  
} elseif ( isset ( $_GET['sec'] ) ) {
  
  $current_data = array (
    'type' => 'sector',
    'id' => $_GET['sec']
  );
  
}

echo 'vars<br>';