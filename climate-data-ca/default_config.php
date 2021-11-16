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
    $vars['feedback_email'] = "louis-david.perron@crim.ca";
    $vars['training_email'] = "louis-david.perron@crim.ca";

}


add_action('wp', 'custom_global_vars');