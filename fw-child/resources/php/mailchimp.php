<?php

function mailchimp_register($email)
{

    $lang = $GLOBALS['fw']['current_lang_code'];

    if ($GLOBALS['vars']['mailchimp_api_key'] == '' ||
        $GLOBALS['vars']['mailchimp_url'] == '' ||
        $GLOBALS['vars']['mailchimp_list_id'] == ''
    ) {
        return false;
    } else {

        try {
            $payload = [
                "email_address" => $email,
                "status" => "pending",
                "language" => $lang
            ];

            $request = curl_init($GLOBALS['vars']['mailchimp_url'] . "/lists/{$GLOBALS['vars']['mailchimp_list_id']}/members");
            curl_setopt($request, CURLOPT_USERPWD, "user:{$GLOBALS['vars']['mailchimp_api_key']}");
            curl_setopt($request, CURLOPT_CUSTOMREQUEST, 'POST');
            curl_setopt($request, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($request, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
            curl_setopt($request, CURLOPT_RETURNTRANSFER, true);

            $result = json_decode(curl_exec ( $request ), false);
            $response_code  = curl_getinfo($request, CURLINFO_RESPONSE_CODE);
            curl_close($request);

            if ($response_code != 200) {
                error_log("Mailchimp error: " . var_export($result, true));
            } elseif (WP_DEBUG) {
                error_log("Mailchimp success: " . var_export($result, true));
                
                return true;
            }

        } catch (Exception $e) {
            error_log($e);
        }
    }
}

