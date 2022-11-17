<?php

// This script searches for IDF files matching the idf GET parameter and returns a JSON for the Frontend

// we load Wordpress to get access to WPML
$parse_uri = explode('assets', $_SERVER['SCRIPT_FILENAME']);
require_once($parse_uri[0] . 'wp-load.php');
wp();

$get_idf = isset($_GET['idf']) ? $_GET['idf'] : '';

// ensure input is alphanumeric
if (!preg_match('/^[a-zA-Z0-9]+$/', $get_idf)) {
    echo "nope";
    exit();
}

$list = [];
$dir = dirname(__FILE__); // Just to get the path to current dir

$filetypes = [
    ['dirname' => 'historical', 'label' => __('Historical Data (ZIP)')],
    ['dirname' => 'cmip5', 'label' => __('CMIP5 (ZIP)')],
    ['dirname' => 'cmip6', 'label' => __('CMIP6 (ZIP)')],
    ['dirname' => 'cmip6-quickstart', 'label' => __('CMIP6 Quick Start (ZIP)')],
];


// glob returns an array with the files it found matching the search pattern (* = wildcard)
foreach ( $filetypes as $filetype) {

    // since file naming is not stable, a glob search with the station ID works
    $files = glob("../idf/{$filetype['dirname']}/*".$get_idf."*");

    if (count($files) == 1) {
        $list[] = ['filename' => '/site/assets/themes/climate-data-ca/resources/app/' . str_replace ( '../', '', $files[0] ),
            'label' => $filetype['label']];
    }
}


echo json_encode($list, JSON_PRETTY_PRINT);
