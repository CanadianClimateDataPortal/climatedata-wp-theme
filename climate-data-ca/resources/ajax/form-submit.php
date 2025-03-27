<?php

$parse_uri = explode( 'assets', $_SERVER['SCRIPT_FILENAME'] );
require_once( $parse_uri[0] . 'wp-load.php' );
wp();

$to_2 = $GLOBALS['vars']['feedback_email'];

include_once ( locate_template ( 'resources/php/securimage/securimage.php' ) );
include_once(locate_template('resources/php/mailchimp.php'));

$securimage = new Securimage();

switch ($_GET['feedback-type']) {
  case "general":
  case "bug":
  case "demo":
    $securimage->setNamespace('support');
    break;
  case "data":
    $securimage->setNamespace('data');
    break;

  default:
    die;
}


if ($securimage->check($_GET['captcha_code']) == false) {

  echo "captcha failed";

} else {

  $form_data = $_GET;

  //$to = get_option ( 'admin_email' );
  $to = "support-backup+{$form_data['feedback-type']}@climatedata.ca";
  $subject = get_bloginfo ( 'title' ) . __(': Feedback form submission','cdc-feedback');

  $headers = array ('Content-Type: text/html; charset=UTF-8',
      "From: Climatedata Feedback Form <feedback@climatedata.ca>",
      "Reply-To: {$form_data['fullname']} <{$form_data['email']}>");

  $body = '';//'<h2>You’ve received a new form submission.</h2>';

  $body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">' . __('Name','cdc-feedback') . '</span><span style="display: inline-block; vertical-align: top;">' . $form_data['fullname'] . '</span></p>';

  $body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">' . __('Email','cdc-feedback') . '</span><span style="display: inline-block; vertical-align: top;"><a href="mailto:' . $form_data['email'] . '">' . $form_data['email'] . '</a></span></p>';

  $body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">' . __('Telephone','cdc-feedback') . '</span><span style="display: inline-block; vertical-align: top;">' . $form_data['phone'] . '</span></p>';

  $body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">' . __('Organization','cdc-feedback') . '</span><span style="display: inline-block; vertical-align: top;">' . $form_data['organization'] . '</span></p>';

  $body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">Type</span><span style="display: inline-block; vertical-align: top;">' . $form_data['feedback-type'] . '</span></p>';

  $body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">Region</span><span style="display: inline-block; vertical-align: top;">' . $form_data['region'];

  if ( $form_data['region'] == 'Other' && $form_data['region-other'] != '' ) $body .= ': ' . $form_data['region-other'];

  $body .= '</span></p>';

  $body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">Role</span><span style="display: inline-block; vertical-align: top;">' . $form_data['role'];

	if ( $form_data['role'] == 'Other' && $form_data['role-other'] != '' ) $body .= ': ' . $form_data['role-other'];

	$body .= '</span></p>';

  $body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">Subject</span><span style="display: inline-block; vertical-align: top;">' . $form_data['subject'];

	if ( $form_data['subject'] == 'Other' && $form_data['subject-other'] != '' ) $body .= ': ' . $form_data['subject-other'];

	$body .= '</span></p>';

  $body .= '<p><span style="display: inline-block; width: 150px; font-weight: bold; vertical-align: top;">Referred from</span><span style="display: inline-block; vertical-align: top;">' . $form_data['referral'];

	if ( $form_data['referral'] == 'Other' && $form_data['referral-other'] != '' ) $body .= ': ' . $form_data['referral-other'];

	$body .= '</span></p>';

  $body .= '<p style="font-weight: bold;">Message</p><p><pre>' . $form_data['feedback'] . '</pre></p>';

//  $body .= '<hr>';

//  $body .= '<p style="font-size: 80%">This message was sent at ' . current_time ('H:i:s' ) . ' on ' . current_time ( 'F j, Y' ) . '</p>';

  $result = wp_mail ( $to, $subject, $body, $headers );
  $result = wp_mail ( $to_2, $subject, $body, $headers );

  if($result) {
    echo 'success';
  }
  else {
    echo 'failed';
  }

  if(isset( $form_data['signup']) && $form_data['signup'] == "true") {
      mailchimp_register($form_data['email']);
  }

}
