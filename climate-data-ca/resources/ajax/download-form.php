<?php

$parse_uri = explode( 'assets', $_SERVER['SCRIPT_FILENAME'] );
require_once( $parse_uri[0] . 'wp-load.php' );

include_once ( locate_template ( 'resources/php/securimage/securimage.php' ) );

$securimage = new Securimage();

if ( isset ( $_GET['daily-captcha_code'] ) ) {

  if ($securimage->check($_GET['daily-captcha_code']) == false) {
    
    echo "captcha failed";
    
  } else {
    
    echo 'success';
  
  }

} elseif ( isset ( $_GET['heatwave-captcha_code'] ) ) {

  if ($securimage->check($_GET['heatwave-captcha_code']) == false) {
    
    echo "captcha failed";
    
  } else {
    
    echo 'success';
  
  }

}