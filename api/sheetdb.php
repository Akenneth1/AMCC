<?php
// Proxy SheetDB — la vraie URL reste côté serveur, jamais exposée au navigateur.
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

define('SHEETDB_URL', 'https://sheetdb.io/api/v1/yf325l4woltxi');

$method  = $_SERVER['REQUEST_METHOD'];
$path    = isset($_GET['path']) ? '/' . ltrim($_GET['path'], '/') : '';
$target  = SHEETDB_URL . $path;
$body    = file_get_contents('php://input');

$ch = curl_init($target);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST  => $method,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'Accept: application/json'],
]);
if (in_array($method, ['POST', 'PUT', 'PATCH']) && $body) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($httpCode);
echo $response;
