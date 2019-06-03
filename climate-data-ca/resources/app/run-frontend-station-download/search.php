<?php
require_once "db.php";
global $con;

$q = isset($_GET['q']) ? $_GET['q'] : '';

$sql = "SELECT station_name,stn_id,lat,lon FROM stations WHERE station_name LIKE '".$q."%' or stn_id LIKE '%".$q."%' and has_normals = 'Y'";
$result = $con->query($sql);

$json = [];
while($row = $result->fetch_assoc()){
    $json[] = [
        'id'=>$row['stn_id'],
        'text'=>$row['station_name'],
        'lat'=>$row['lat'],
        'lon'=>$row['lon']
    ];
}

echo json_encode($json);