<?php

$get_idf = isset($_GET['idf']) ? $_GET['idf'] : '';
if ($get_idf < 0 || !$get_idf) {
    echo "nope";
    exit();
}

$list = []; // Since 5.4.x you can use shorthand syntax to init an array
$dir = dirname(__FILE__); // Just to get the path to current dir

// glob returns an array with the files it found matching the search pattern (* = wildcard)
$files = glob("../idf/*".$get_idf."*");

// Looping through all the files found in ./.pic
foreach ($files as $file) {
    // Removing the full path and appending the file to the $list array.
    // Now it will look like ".pic/filename.ext"
    //$list[] = str_replace($dir."/", "", $file);
    $list[] = '/site/assets/themes/climate-data-ca/resources/app/' . str_replace ( '../', '', $file );
}

if (!function_exists('str_ends_with')) {
    function str_ends_with($str, $end) {
        return (@substr_compare($str, $end, -strlen($end))==0);
    }
}

if (str_ends_with($list[0],".zip")) {
    $file = array_shift($list);
    array_push($list, $file);
}

echo json_encode($list, JSON_PRETTY_PRINT); // JSON_PRETTY_PRINT for beautifying the output
?>