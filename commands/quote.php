<?php
$response = file_get_contents('https://talaikis.com/api/quotes/random/');
$response = json_decode($response);
echo $response->{'quote'} . "<br>";
echo "-" . $response->{'author'};
?>
