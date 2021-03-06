<?php

$parse_uri = explode('assets', $_SERVER['SCRIPT_FILENAME']);
require_once($parse_uri[0] . 'wp-load.php');
wp();

include_once(locate_template('resources/php/securimage/securimage.php'));
include_once(locate_template('resources/php/mailchimp.php'));

$securimage = new Securimage();

$submit_url = $GLOBALS['vars']['pavics_url'] . $_POST['submit_url'];

if (isset ($_POST['captcha_code'])) {

    if ($securimage->check($_POST['captcha_code']) == false) {

        echo "{\"status\": \"captcha failed\"}";

    } else {

        $request = curl_init($submit_url);

        curl_setopt($request, CURLOPT_CUSTOMREQUEST, 'POST');
        curl_setopt($request, CURLOPT_POSTFIELDS, json_encode($_POST['request_data']));
        curl_setopt($request, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
        curl_setopt($request, CURLOPT_RETURNTRANSFER, true);

        $result = curl_exec($request);

        curl_close($request);
        print_r($result);

        if ($_POST['signup'] == "true") {
            mailchimp_register($_POST['request_data']['notification_email']);
        }
    }

}
