<?php

$parse_uri = explode( 'assets', $_SERVER['SCRIPT_FILENAME'] );
require_once( $parse_uri[0] . 'wp-load.php' );

include_once ( locate_template ( 'resources/php/securimage/securimage.php' ) );

$securimage = new Securimage();

$response = array (
  'message' => null,
  'url' => null
);

if ($securimage->check($_GET['terms-captcha_code']) == false) {
  
  $response['message'] = 'captcha failed';
  
} else {

  $form_data = $_GET;
  
  //$to = get_option ( 'admin_email' );
  $to = 'phil@makeitoperativ.com';
  $subject = get_bloginfo ( 'title' ) . ': Feedback form submission';
  
  $headers = array ( 
    'Content-Type: text/html; charset=UTF-8'
  );
  
  $body = '<h2>You’ve received a new form submission.</h2>';
  
  $body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">Name</span><span style="display: inline-block; vertical-align: top;">' . $form_data['fullname'] . '</span></p>';
  
  $body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">Email</span><span style="display: inline-block; vertical-align: top;"><a href="mailto:' . $form_data['email'] . '">' . $form_data['email'] . '</a></span></p>';
  
  $body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">Organization</span><span style="display: inline-block; vertical-align: top;">' . $form_data['organization'] . '</span></p>';
  
  $body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">Type</span><span style="display: inline-block; vertical-align: top;">' . $form_data['feedback-type'] . '</span></p>';
  
  $body .= '<p style="font-weight: bold;">Message</p><p><pre>' . $form_data['feedback'] . '</pre></p>';
  
  $body .= '<hr>';
  
  $body .= '<p style="font-size: 80%">This message was sent at ' . current_time ('H:i:s' ) . ' on ' . current_time ( 'F j, Y' ) . '</p>';
  
//   wp_mail ( $to, $subject, $body, $headers );
  
  $response['message'] = 'success';
  
  // find the attached PPT
  
  $post_attachments = get_attached_media ( '', $_GET['page_ID'] );
  
  $response['url'] = wp_get_attachment_url ( get_field ( 'training_presentation', $_GET['page_ID'] ) );
  
}

echo json_encode ( $response, JSON_PRETTY_PRINT );