<?php
require_once "db.php";
global $con;

$get_sSearch = isset($_GET['q']) ? $_GET['q'] : '';
$get_lang = isset($_GET['lang']) ? $_GET['lang'] : 'en';
$post_draw = isset($_POST['draw']) ? $_POST['draw'] : '';


// This script is not integrated with Wordpress... hard to have a better way to know in which language we are
if (isset($_SERVER['HTTP_HOST'])
    && ($_SERVER['HTTP_HOST'] == "donneesclimatiques.ca"
        || $_SERVER['HTTP_HOST'] == "donneesclimatiques.crim.ca"
        || $_SERVER['HTTP_HOST'] == "dev-fr.climatedata.ca")
) {
    $get_lang = 'fr';
}


// the columns to be filtered, ordered and returned
// must be in the same order as displayed in the table
if ($get_lang == 'en'){
    $columns = array
    (
        "id_code",
        "geo_name",
        "gen_term",
        "location",
        "province",
        "lat",
        "lon"
    );
} else {
    $columns = array
    (
        "id_code",
        "geo_name",
        "gen_term_fr",
        "location",
        "province_fr",
        "lat",
        "lon"
    );
}


$search_columns = array
(
    "geo_name"
);

$table = "all_areas";

$joins = "";


$get_sSearch = str_replace('`','\'',$get_sSearch);
// filtering
$sql_where = "where gen_term not in ('Administrative Region', 'Province', 'Territory') and geo_name like '" . mysqli_real_escape_string($con,$get_sSearch ) . "%'" ;


// ordering
$sql_order = "order by scale desc";

$sql_limit="";
// paging if query string is shorter than 5
if (strlen($get_sSearch) < 5) {
    $sql_limit = "LIMIT 0,10";
}

// die("SELECT SQL_CALC_FOUND_ROWS " . implode(", ", $columns) . " FROM {$table} {$joins} {$sql_where} {$sql_order} {$sql_limit}");
$main_query = mysqli_query($con,"SELECT SQL_CALC_FOUND_ROWS " . implode(", ", $columns) . " FROM {$table} {$joins} {$sql_where} {$sql_order} {$sql_limit}")
or die(mysqli_error($con));

// send back the number requested
$response['draw'] = intval($post_draw);

// get the number of filtered rows
$filtered_rows_query = mysqli_query($con,"SELECT FOUND_ROWS()")
or die(mysqli_error($con));
$row = mysqli_fetch_array($filtered_rows_query);
$response['recordsFiltered'] = $row[0];

// get the number of rows in total
$total_query = mysqli_query($con,"SELECT COUNT(*) FROM {$table}")
or die(mysqli_error($con));
$row = mysqli_fetch_array($total_query);
$response['recordsTotal'] = $row[0];



$response['items'] = array();

// finish getting rows from the main query
while ($row = mysqli_fetch_row($main_query))
{
    $row = array("id"=>$row[0], "text"=>$row[1], "term"=>$row[2], "location"=>$row[3], "province"=>$row[4], "lat"=>$row[5], "lon"=>$row[6]);
    $response['items'][] = $row;
}
header('Cache-Control: no-cache');
header('Pragma: no-cache');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');
echo json_encode($response);
