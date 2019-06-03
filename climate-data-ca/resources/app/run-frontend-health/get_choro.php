<?php


$get_rcp = isset($_GET['rcp']) ? $_GET['rcp'] : 'rcp45';
$get_var = isset($_GET['var']) ? $_GET['var'] : 'tx_max';
$get_year = isset($_GET['year']) ? $_GET['year'] : 1950;

$get_month = isset($_GET['month']) ? $_GET['month'] : '';

foreach (glob("/home/datahabitatseven/public_html/csvs/BCCAQv2/".$get_var."/".$get_rcp."/YS/*10y_Means_p50.csv") as $filename) {
    $Data = str_getcsv($filename, "\n"); //parse the rows
    $newcsv[] = array_map('str_getcsv', file($filename));
}

$chorodata = [];

foreach ($newcsv as $key => $value) {
    foreach ($value as $subkey => $subvalue) {
        if ($subvalue[0] == $get_year){
            $chorodata[$subvalue[2]] = $subvalue[1];
        }
    }

}
$json_string = json_encode($chorodata, JSON_PRETTY_PRINT);
echo $json_string;


