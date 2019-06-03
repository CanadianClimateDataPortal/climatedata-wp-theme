<?php


$get_rcp = isset($_GET['rcp']) ? $_GET['rcp'] : 'rcp45';
$get_var = isset($_GET['var']) ? $_GET['var'] : 'tx_max';
$get_year = isset($_GET['year']) ? $_GET['year'] : 1950;


$get_hru = isset($_GET['hru']) ? $_GET['hru'] : "1011";

$get_month = isset($_GET['month']) ? $_GET['month'] : '';


foreach (glob("/home/datahabitatseven/public_html/csvs/BCCAQv2/" . $get_var . "/rcp26/YS/*_AllYears_Ensemble_percentiles.csv") as $filename) {
    $Data = str_getcsv($filename, "\n"); //parse the rows
    $newcsv[] = array_map('str_getcsv', file($filename));
}


$chorodata = [];

foreach ($newcsv as $key => $value) {
    foreach ($value as $subkey => $subvalue) {

        if ($subvalue[4] == $get_hru) {

            if ($subvalue[0] == 1950) {
                $chorodata['rcp26'][1950][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp26'][1950][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp26'][1950][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 1960) {
                $chorodata['rcp26'][1960][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp26'][1960][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp26'][1960][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 1970) {
                $chorodata['rcp26'][1970][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp26'][1970][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp26'][1970][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 1980) {
                $chorodata['rcp26'][1980][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp26'][1980][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp26'][1980][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 1990) {
                $chorodata['rcp26'][1990][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp26'][1990][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp26'][1990][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2000) {
                $chorodata['rcp26'][2000][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp26'][2000][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp26'][2000][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2010) {
                $chorodata['rcp26'][2010][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp26'][2010][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp26'][2010][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2020) {
                $chorodata['rcp26'][2020][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp26'][2020][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp26'][2020][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2030) {
                $chorodata['rcp26'][2030][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp26'][2030][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp26'][2030][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2040) {
                $chorodata['rcp26'][2040][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp26'][2040][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp26'][2040][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2050) {
                $chorodata['rcp26'][2050][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp26'][2050][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp26'][2050][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2060) {
                $chorodata['rcp26'][2060][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp26'][2060][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp26'][2060][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2070) {
                $chorodata['rcp26'][2070][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp26'][2070][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp26'][2070][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2080) {
                $chorodata['rcp26'][2080][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp26'][2080][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp26'][2080][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2090) {
                $chorodata['rcp26'][2090][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp26'][2090][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp26'][2090][$subvalue[4]]['p90'] = $subvalue[3];
            }

        }
    }
}

foreach (glob("/home/datahabitatseven/public_html/csvs/BCCAQv2/" . $get_var . "/rcp45/YS/*_AllYears_Ensemble_percentiles.csv") as $filename) {
    $Data = str_getcsv($filename, "\n"); //parse the rows
    $newcsv[] = array_map('str_getcsv', file($filename));
}


foreach ($newcsv as $key => $value) {
    foreach ($value as $subkey => $subvalue) {


        if ($subvalue[4] == $get_hru) {

            if ($subvalue[0] == 1950) {
                $chorodata['rcp45'][1950][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp45'][1950][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp45'][1950][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 1960) {
                $chorodata['rcp45'][1960][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp45'][1960][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp45'][1960][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 1970) {
                $chorodata['rcp45'][1970][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp45'][1970][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp45'][1970][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 1980) {
                $chorodata['rcp45'][1980][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp45'][1980][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp45'][1980][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 1990) {
                $chorodata['rcp45'][1990][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp45'][1990][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp45'][1990][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2000) {
                $chorodata['rcp45'][2000][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp45'][2000][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp45'][2000][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2010) {
                $chorodata['rcp45'][2010][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp45'][2010][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp45'][2010][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2020) {
                $chorodata['rcp45'][2020][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp45'][2020][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp45'][2020][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2030) {
                $chorodata['rcp45'][2030][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp45'][2030][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp45'][2030][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2040) {
                $chorodata['rcp45'][2040][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp45'][2040][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp45'][2040][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2050) {
                $chorodata['rcp45'][2050][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp45'][2050][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp45'][2050][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2060) {
                $chorodata['rcp45'][2060][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp45'][2060][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp45'][2060][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2070) {
                $chorodata['rcp45'][2070][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp45'][2070][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp45'][2070][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2080) {
                $chorodata['rcp45'][2080][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp45'][2080][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp45'][2080][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2090) {
                $chorodata['rcp45'][2090][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp45'][2090][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp45'][2090][$subvalue[4]]['p90'] = $subvalue[3];

            }
        }
    }
}


foreach (glob("/home/datahabitatseven/public_html/csvs/BCCAQv2/" . $get_var . "/rcp85/YS/*_AllYears_Ensemble_percentiles.csv") as $filename) {
    $Data = str_getcsv($filename, "\n"); //parse the rows
    $newcsv[] = array_map('str_getcsv', file($filename));
}

foreach ($newcsv as $key => $value) {
    foreach ($value as $subkey => $subvalue) {

        if ($subvalue[4] == $get_hru) {
            if ($subvalue[0] == 1950) {
                $chorodata['rcp85'][1950][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp85'][1950][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp85'][1950][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 1960) {
                $chorodata['rcp85'][1960][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp85'][1960][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp85'][1960][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 1970) {
                $chorodata['rcp85'][1970][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp85'][1970][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp85'][1970][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 1980) {
                $chorodata['rcp85'][1980][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp85'][1980][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp85'][1980][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 1990) {
                $chorodata['rcp85'][1990][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp85'][1990][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp85'][1990][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2000) {
                $chorodata['rcp85'][2000][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp85'][2000][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp85'][2000][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2010) {
                $chorodata['rcp85'][2010][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp85'][2010][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp85'][2010][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2020) {
                $chorodata['rcp85'][2020][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp85'][2020][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp85'][2020][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2030) {
                $chorodata['rcp85'][2030][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp85'][2030][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp85'][2030][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2040) {
                $chorodata['rcp85'][2040][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp85'][2040][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp85'][2040][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2050) {
                $chorodata['rcp85'][2050][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp85'][2050][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp85'][2050][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2060) {
                $chorodata['rcp85'][2060][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp85'][2060][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp85'][2060][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2070) {
                $chorodata['rcp85'][2070][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp85'][2070][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp85'][2070][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2080) {
                $chorodata['rcp85'][2080][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp85'][2080][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp85'][2080][$subvalue[4]]['p90'] = $subvalue[3];
            }
            if ($subvalue[0] == 2090) {
                $chorodata['rcp85'][2090][$subvalue[4]]['p10'] = $subvalue[1];
                $chorodata['rcp85'][2090][$subvalue[4]]['p50'] = $subvalue[2];
                $chorodata['rcp85'][2090][$subvalue[4]]['p90'] = $subvalue[3];
            }
        }
    }
}

$json_string = json_encode($chorodata, JSON_PRETTY_PRINT);
echo $json_string;


