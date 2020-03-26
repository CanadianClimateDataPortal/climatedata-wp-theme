<?php

require_once "config.php";
global $csvpath;

$get_rcp = isset($_GET['rcp']) ? $_GET['rcp'] : 'rcp45';
$get_var = isset($_GET['var']) ? $_GET['var'] : 'tx_max';

foreach (glob($csvpath . "/BCCAQv2/".$get_var."/".$get_rcp."/YS/*30y_Means_p50.csv") as $filename) {
    $newcsv[] = array_map('str_getcsv', file($filename));
}

$chorodata = [];

foreach ($newcsv as $key => $value) {
    foreach ($value as $subkey => $subvalue) {
	if($subvalue[0] > 0) {
		$chorodata[$subvalue[0]][$subvalue[3]] = $subvalue[1];
	}
    }

}
$json_string = json_encode($chorodata, JSON_PRETTY_PRINT);
echo $json_string;


