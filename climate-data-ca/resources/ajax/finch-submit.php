<?php

$parse_uri = explode('assets', $_SERVER['SCRIPT_FILENAME']);
require_once($parse_uri[0] . 'wp-load.php');
wp();

include_once(locate_template('resources/php/securimage/securimage.php'));
include_once(locate_template('resources/php/mailchimp.php'));

$securimage = new Securimage();

if (isset ($_POST['namespace'])) {
    $securimage->setNamespace(sanitize_title_with_dashes($_POST['namespace']));
}

$submit_url = $GLOBALS['vars']['pavics_url'] . $_POST['submit_url'];
$data_url = "https:". $GLOBALS['vars']['data_url'];

if (isset ($_POST['captcha_code'])) {

    if ($securimage->check($_POST['captcha_code']) == false) {

        echo "{\"status\": \"captcha failed\"}";

    } else {
        if (isset($_POST['required_variables']) && isset($_POST['stations'])) {
            $inputs=[];
            foreach ($_POST['required_variables'] as $variable) {
                $type = strpos($variable, "tas") ? 'T':'P';
                $inputs[] = ['id' => $variable, 'href' => $data_url . "/download-ahccd?format=netcdf&variable_type_filter=$type&stations={$_POST['stations']}"];
            }
            $_POST['request_data']['inputs'] = array_merge($_POST['request_data']['inputs'], $inputs);
        }

        $request = curl_init($submit_url);

        curl_setopt($request, CURLOPT_CUSTOMREQUEST, 'POST');
        curl_setopt($request, CURLOPT_POSTFIELDS,  str_replace("\\\\\\", "\\", json_encode($_POST['request_data'])));
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
