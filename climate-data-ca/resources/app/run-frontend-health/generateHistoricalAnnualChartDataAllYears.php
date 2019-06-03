<?php
$get_var = isset($_GET['var']) ? $_GET['var'] : 'tx_max';
$get_hruid = isset($_GET['hruid']) ? $_GET['hruid'] : '';


foreach (glob("/home/cccapi/public_html/csvs/ANUSPLIN/".$get_var."/YS/*AllYears_ANUSPLIN.csv") as $filename) {
    $Data = str_getcsv($filename, "\n"); //parse the rows
    $newcsv[] = array_map('str_getcsv', file($filename));
}

$chorodata = [];

foreach ($newcsv as $key => $value) {
    foreach ($value as $subkey => $subvalue) {
//                echo "<pre>";
//                print_r($subvalue);
//                echo "</pre>";
        if ($subvalue[2] == $get_hruid){
            $chorodata[$subvalue[0]] = $subvalue[1];
        }
    }

}
$json_string = json_encode($chorodata, JSON_PRETTY_PRINT);
echo $json_string;


