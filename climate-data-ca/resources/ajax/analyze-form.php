<?php

$parse_uri = explode( 'assets', $_SERVER['SCRIPT_FILENAME'] );
require_once( $parse_uri[0] . 'wp-load.php' );

include_once ( locate_template ( 'resources/php/securimage/securimage.php' ) );

$securimage = new Securimage();

$submit_url_pre = 'https://pavics.climatedata.ca/providers/finch/processes/ensemble_grid_point_';

if ( isset ( $_POST['analyze-captcha_code'] ) ) {

  if ($securimage->check($_POST['analyze-captcha_code']) == false) {
    
    echo "{\"status\": \"captcha failed\"}";
    
  } else {
    
//     echo 'success';
    
    $request = curl_init ( $submit_url_pre . $_POST['submit_url'] );
    
    curl_setopt ( $request, CURLOPT_CUSTOMREQUEST, 'POST' );
    curl_setopt ( $request, CURLOPT_POSTFIELDS, json_encode ( $_POST['request_data'] ) );
    curl_setopt ( $request, CURLOPT_HTTPHEADER, array ( 'Content-Type:application/json' ) );
    curl_setopt ( $request, CURLOPT_RETURNTRANSFER, true );
    
    $result = curl_exec ( $request );
    
    curl_close ( $request );
    
    print_r ( $result );
  
  }

}
