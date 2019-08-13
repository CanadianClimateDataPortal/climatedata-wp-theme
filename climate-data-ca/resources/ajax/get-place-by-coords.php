<?php
  
function distance($lat1, $lon1, $lat2, $lon2) {

  $theta = $lon1 - $lon2;
  $dist = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) +  cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
  $dist = acos($dist);
  $dist = rad2deg($dist);
  
  return $dist;
  
}

if ( ( isset ( $_GET['lat'] ) && !empty ( $_GET['lat'] ) ) && ( isset ( $_GET['lon'] ) && !empty ( $_GET['lon'] ) ) ) {
  
  if (isset($_SERVER['HTTP_HOST']) && $_SERVER['HTTP_HOST'] == "donneesclimatiques.ca" ) {
    $columns = array (
      "id_code",
      "geo_name",
      "gen_term_fr as gen_term",
      "location",
      "province_fr as province",
      "lat",
      "lon"
    );
  
  }
  else {
    $columns = array (
      "id_code",
      "geo_name",
      "gen_term",
      "location",
      "province",
      "lat",
      "lon"
    );
  }  
  require_once "../app/db.php";
  global $con;
  
  // range of coordinates to search between
  $range = 0.1;
  
  $main_query = mysqli_query ( $GLOBALS['vars']['con'], 
    "SELECT " . implode(",", $columns) . "
    FROM all_areas
    WHERE lat BETWEEN " . ( round ( $_GET['lat'], 2 ) - $range ) . " AND " . ( round ( $_GET['lat'], 2 ) + $range ) . "
    AND lon BETWEEN " . ( round ( $_GET['lon'], 2 ) - $range ) . " AND " . ( round ( $_GET['lon'], 2 ) + $range ) . "
    AND NOT (gen_term = 'Railway Point')
    AND NOT (gen_term = 'Railway Junction')
    AND NOT (gen_term = 'Urban Community')
    AND NOT (gen_term = 'Administrative Sector')
    LIMIT 0,50" )
    or die ( mysqli_error($GLOBALS['vars']['con'] ) );
  
  if ( $main_query->num_rows > 0 ) {
    
    $selected_place = array();
    
    $shortest_distance = 100;
  
    while ($row = mysqli_fetch_assoc ( $main_query ) ) {
      
      $distance = distance( $row['lat'], $row['lon'], $_GET['lat'], $_GET['lon'] );
      
      if ( distance( $row['lat'], $row['lon'], $_GET['lat'], $_GET['lon'] ) < $shortest_distance ) {
        $selected_place = $row;
        $selected_place['distance'] = $distance;
        $shortest_distance = $distance;
      }
      
    }
    
    echo json_encode ( $selected_place );
    
  }

}
