<?php
$required_constants = [ 'DB_HOST', 'DB_USER', 'DB_PASSWORD' ];

foreach ( $required_constants as $constant ) {
	if ( ! defined( $constant ) ) {
		error_log( "Missing the required constant: '$constant'" );
		return;
	}
}

/** @noinspection PhpUndefinedConstantInspection */
$con = mysqli_connect( DB_HOST, DB_USER, DB_PASSWORD, "geocoder" );
mysqli_set_charset( $con, "utf8" );

global $vars;

$vars[ 'con' ] = $con;

if ( mysqli_connect_errno() ) {
	throw new Exception( mysqli_connect_error(), mysqli_connect_errno() );
}
