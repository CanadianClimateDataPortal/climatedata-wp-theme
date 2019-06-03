<?php

if ( isset ( $_GET['id'] ) && !empty ( $_GET['id'] ) ) {
  
  require_once "../app/db.php";
  global $con;
  
  $main_query = mysqli_query($con,"SELECT geo_name, province FROM populated_areas WHERE geo_id LIKE " . $_GET['id'] . " LIMIT 0,1")
    or die(mysqli_error($con));
  
  $row = mysqli_fetch_assoc($main_query);
  
  echo json_encode ( $row );

}