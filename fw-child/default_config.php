<?php

// to override this configuration, copy this file to local_config.php and update its settings

function custom_global_vars()
{
    global $vars;

    $vars['data_url'] = "//dataclimatedata.crim.ca";
    $vars['pavics_url'] = "https://finch.crim.ca";
    $vars['analytics_ua_en'] = "G-CPGH39EQSH"; // GA4 account valid for dev-(en|fr).climatedata.ca
    $vars['analytics_ua_fr'] = "G-CPGH39EQSH";
    $vars['googletag_id'] = "GTM-NJ7L4NR";
    $vars['ga_cross_domain'] = "";

    // CookieYes site ID (as found in the required script tag URL: https://cdn-cookieyes.com/client_data/<ID>/script.js)
    // If empty, no CookieYes script will be included.
    $vars['cookieyes_id_fr'] = ""; // ID for French site
    $vars['cookieyes_id_en'] = ""; // ID for English site

    $vars['feedback_email'] = "nullbox@climatedata.ca";
    $vars['training_email'] = "nullbox@climatedata.ca";
    $vars['support_email'] = "nullbox@climatedata.ca";
    $vars['apps_email'] = "ccsc-cccs@ec.gc.ca";
    $vars['mailchimp_api_key'] = "";
    $vars['mailchimp_url'] = "";
    $vars['mailchimp_list_id'] = "";
    $vars['url_encoder_salt'] = "override-me";
}


add_action('init', 'custom_global_vars');
