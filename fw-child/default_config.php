<?php

// to override this configuration, copy this file to local_config.php and update its settings

function custom_global_vars()
{
    global $vars;

    $vars['data_url'] = "https://dataclimatedata.crim.ca";
    $vars['pavics_url'] = "https://finch.crim.ca";
    $vars['analytics_ua_en'] = "";
    $vars['analytics_ua_fr'] = "";
    $vars['googletag_id'] = "";
    $vars['ga_cross_domain'] = "";

    // CookieYes site ID (as found in the required script tag URL: https://cdn-cookieyes.com/client_data/<ID>/script.js)
    // If empty, no CookieYes script will be included.
    $vars['cookieyes_id_fr'] = ""; // ID for French site
    $vars['cookieyes_id_en'] = ""; // ID for English site

    $vars['feedback_email'] = "nullbox@climatedata.ca";
    $vars['training_email'] = "nullbox@climatedata.ca";
    $vars['support_email'] = "nullbox@climatedata.ca";
    $vars['apps_email'] = "nullbox@climatedata.ca";
    $vars['mailchimp_api_key'] = "";
    $vars['mailchimp_url'] = "";
    $vars['mailchimp_list_id'] = "";
    $vars['url_encoder_salt'] = "override-me";
}


add_action('init', 'custom_global_vars');
