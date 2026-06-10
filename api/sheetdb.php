<?php
/**
 * Proxy SheetDB — masque la vraie URL SheetDB côté serveur.
 * Reçoit les requêtes du site et les transmet à SheetDB.
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$SHEETDB_BASE = 'https://sheetdb.io/api/v1/yf325l4woltxi';

$method = $_SERVER['REQUEST_METHOD'];

// Construction de l'URL SheetDB cible
$path = $_GET['path'] ?? '';  // ex: "email/user@test.com" pour DELETE
$url  = $SHEETDB_BASE . ($path ? '/' . ltrim($path, '/') : '');

if (!function_exists('curl_init')) {
    // Fallback sans cURL (file_get_contents)
    $opts = ['http' => ['method' => $method, 'header' => 'Content-Type: application/json']];
    if (in_array($method, ['POST', 'DELETE'])) {
        $opts['http']['content'] = file_get_contents('php://input');
    }
    $result = file_get_contents($url, false, stream_context_create($opts));
    echo $result ?: '[]';
    exit;
}

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST  => $method,
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'Accept: application/json'],
]);

if (in_array($method, ['POST', 'DELETE'])) {
    $body = file_get_contents('php://input');
    if ($body) curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error    = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(502);
    echo json_encode(['error' => 'Erreur proxy : ' . $error]);
    exit;
}

http_response_code($httpCode ?: 200);
echo $response ?: '[]';
