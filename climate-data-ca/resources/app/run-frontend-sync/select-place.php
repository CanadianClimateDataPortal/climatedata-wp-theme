<?php
require_once "db.php";
global $con;
// the columns to be filtered, ordered and returned
// must be in the same order as displayed in the table
$columns = array
(
    "geo_id",
    "geo_name",
    "generic_term",
    "location",
    "province",
    "lat",
    "lon"
);

$search_columns = array
(
    "geo_name"
);

$table = "populated_areas";

if (isset($_SERVER['HTTP_HOST']) && $_SERVER['HTTP_HOST'] == "donneesclimatiques.ca" ) {
    $table = "populated_areas_fr";
}

$joins = "";

$get_sSearch = isset($_GET['q']) ? $_GET['q'] : '';
$post_draw = isset($_POST['draw']) ? $_POST['draw'] : '';

$get_sSearch = str_replace('`','\'',$get_sSearch);
// filtering
$sql_where = "WHERE geo_id > 0";
if ($get_sSearch != "")
{
    $sql_where = "WHERE geo_id > 0 AND ";
    foreach ($search_columns as $column)
    {
        $sql_where .= $column . " LIKE '" . mysqli_real_escape_string($con,$get_sSearch ) . "%' OR ";
    }
    $sql_where = substr($sql_where, 0, -3);
}

// ordering
$sql_order = "";
if ( isset( $_GET['iSortCol_0'] ) )
{
    $sql_order = "ORDER BY  ";
    for ( $i = 0; $i < mysqli_real_escape_string($con,$_GET['iSortingCols'] ); $i++ )
    {
        $sql_order .= $columns[$_GET['iSortCol_' . $i]] . " " . mysqli_real_escape_string($con,$_GET['sSortDir_' . $i] ) . ", ";
    }
    $sql_order = substr_replace( $sql_order, "", -2 );
}

// paging
$sql_limit = 1000;
if (isset($sql_limit))
{
    $sql_limit = "LIMIT 0,".$sql_limit;
}
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
$total_query = mysqli_query($con,"SELECT COUNT(geo_id) FROM {$table}")
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
