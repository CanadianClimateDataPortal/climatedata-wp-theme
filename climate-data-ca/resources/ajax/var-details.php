<?php
error_reporting(E_ALL);
ini_set('display_errors', 'On');
require('../../../../../wp-load.php');
$post = get_post('tx_max');
echo "loaded";
print_r($post);