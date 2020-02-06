<?php
require_once "config.php";
global $csvpath;


$get_rcp = isset($_GET['rcp']) ? $_GET['rcp'] : 'rcp45';
$get_var = isset($_GET['var']) ? $_GET['var'] : 'tx_max';
$get_year = isset($_GET['year']) ? $_GET['year'] : 1950;
$get_hruid = isset($_GET['hruid']) ? $_GET['hruid'] : '';

$get_month = isset($_GET['month']) ? $_GET['month'] : '';

if ($get_month == 'jan') { $qmonth = "01January"; }
if ($get_month == 'feb') { $qmonth = "02February"; }
if ($get_month == 'mar') { $qmonth = "03March"; }
if ($get_month == 'apr') { $qmonth = "04April"; }
if ($get_month == 'may') { $qmonth = "05May"; }
if ($get_month == 'jun') { $qmonth = "06June"; }
if ($get_month == 'jul') { $qmonth = "07July"; }
if ($get_month == 'aug') { $qmonth = "08August"; }
if ($get_month == 'sep') { $qmonth = "09September"; }
if ($get_month == 'oct') { $qmonth = "10October"; }
if ($get_month == 'nov') { $qmonth = "11November"; }
if ($get_month == 'dec') { $qmonth = "12December"; }

foreach (glob($csvpath . "/BCCAQv2/".$get_var."/".$get_rcp."/MS/*AllYears_Ensemble_percentiles_".$qmonth.".csv") as $filename) {
    $Data = str_getcsv($filename, "\n"); //parse the rows
    $newcsv[] = array_map('str_getcsv', file($filename));
}

//echo "<pre>";
//print_r($newcsv);
//echo "</pre>";

$chorodata = [];

foreach ($newcsv as $key => $value) {
    foreach ($value as $subkey => $subvalue) {
//        echo "<pre>";
//        print_r($subvalue);
//        echo "</pre>";
        if ($subvalue[5] == $get_hruid){
            $chorodata[$subvalue[0]][$subvalue[5]]['p10'] = $subvalue[1];
            $chorodata[$subvalue[0]][$subvalue[5]]['p50'] = $subvalue[2];
            $chorodata[$subvalue[0]][$subvalue[5]]['p90'] = $subvalue[3];
        }
    }

}
$json_string = json_encode($chorodata, JSON_PRETTY_PRINT);
echo $json_string;


