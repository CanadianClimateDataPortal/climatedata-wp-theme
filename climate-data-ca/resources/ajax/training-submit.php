<?php

$parse_uri = explode( 'assets', $_SERVER['SCRIPT_FILENAME'] );
require_once( $parse_uri[0] . 'wp-load.php' );
wp();

$to_2 = $GLOBALS['vars']['training_email'];

include_once ( locate_template ( 'resources/php/securimage/securimage.php' ) );

$securimage = new Securimage();

$response = array (
  'message' => null,
  'url' => null
);

if ($_GET['email']!='') {
  if ($securimage->check($_GET['terms-captcha_code']) == false) {

    $response['message'] = 'captcha failed';
    $response['message1'] = __('Non-valid entered characters. Please try again.','cdc');

  } else {

    $form_data = $_GET;

    //$to = get_option ( 'admin_email' );
    $to = 'support-backup+training@climatedata.ca';
    $subject = get_bloginfo ( 'title' ) . __(': Training download','cdc-feedback');

    $headers = array (
      'Content-Type: text/html; charset=UTF-8',
      "From: Climatedata Training Form <training@climatedata.ca>",
      "Reply-To: {$form_data['fullname']} <{$form_data['email']}>"
    );
    $body = '<p>The following invididual aggreed the terms of use and downloaded the training presentation</p>';
    $body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">Name</span><span style="display: inline-block; vertical-align: top;">' . $form_data['fullname'] . '</span></p>';

    $body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">Email</span><span style="display: inline-block; vertical-align: top;"><a href="mailto:' . $form_data['email'] . '">' . $form_data['email'] . '</a></span></p>';

    $body .= '<hr>';

    $body .= '<p style="font-size: 80%">This message was sent at ' . current_time ('H:i:s' ) . ' on ' . current_time ( 'F j, Y' ) . '</p>';

    wp_mail ( $to, $subject, $body, $headers );
    wp_mail ( $to_2, $subject, $body, $headers );

    $response['message'] = 'success';
  }
} else {
    $response['message'] = 'success';
}

if ($response['message'] == 'success') {
    $response['message1'] = __('Success!','cdc');
    $response['message2'] = __('Click here to download the presentation','cdc');
    $response['url'] = wp_get_attachment_url ( get_field ( 'training_presentation', $_GET['page_ID'] ) );
}

echo json_encode ( $response, JSON_PRETTY_PRINT );
