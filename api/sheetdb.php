<?php
/**
 * Proxy SheetDB — masque la vraie URL SheetDB côté serveur.
 * Reçoit les requêtes du site et les transmet à SheetDB.
 * Envoie également un email de notification à l'association.
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$SHEETDB_BASE = 'https://sheetdb.io/api/v1/vz9tjb2ka6fnu';
$MAIL_TO      = 'contact@artmodeetculture.com';

$method = $_SERVER['REQUEST_METHOD'];

// Construction de l'URL SheetDB cible
$path = $_GET['path'] ?? '';  // ex: "email/user@test.com" pour DELETE
$url  = $SHEETDB_BASE . ($path ? '/' . ltrim($path, '/') : '');

$body = file_get_contents('php://input');

if ($body) {
    $payload = json_decode($body, true);
    if (is_array($payload) && isset($payload['data']) && is_array($payload['data'])) {
        $data = $payload['data'];
        $type = $data['type'] ?? (isset($data['profil']) ? 'adhesion' : 'message');
        $subject = 'Nouvelle soumission AMC';
        $messageLines = [];

        if ($type === 'contact') {
            $subject = 'Nouveau message de contact AMC';
            $messageLines[] = 'Type : Contact';
            $messageLines[] = 'Nom : ' . ($data['nom'] ?? '—');
            $messageLines[] = 'Email : ' . ($data['email'] ?? '—');
            $messageLines[] = 'Message :';
            $messageLines[] = $data['message'] ?? '—';
        } else {
            $subject = 'Nouvelle demande d\'adhésion AMC';
            $messageLines[] = 'Type : Adhésion / Rejoindre AMC';
            $messageLines[] = 'Nom : ' . ($data['nom'] ?? '—');
            $messageLines[] = 'Email : ' . ($data['email'] ?? '—');
            $messageLines[] = 'Téléphone : ' . ($data['tel'] ?? '—');
            $messageLines[] = 'Ville : ' . ($data['ville'] ?? '—');
            $messageLines[] = 'Date de naissance : ' . ($data['dateNaissance'] ?? '—');
            $messageLines[] = 'Profil : ' . ($data['profil'] ?? '—');
            $messageLines[] = 'Mode de paiement : ' . ($data['paiement'] ?? '—');
            $messageLines[] = 'Statut : ' . ($data['statut'] ?? '—');
            $messageLines[] = 'Message / Motivations :';
            $messageLines[] = $data['message'] ?? '—';
        }

        $messageLines[] = '';
        $messageLines[] = 'Date de soumission : ' . date('d/m/Y H:i:s');

        $fromDomain = $_SERVER['SERVER_NAME'] ?: 'localhost';
        $fromEmail = 'no-reply@' . preg_replace('/[^a-z0-9.\-]/i', '', $fromDomain);
        $senderEmail = filter_var($data['email'] ?? '', FILTER_VALIDATE_EMAIL);

        $headers  = "From: Art Mode & Culture <{$fromEmail}>\r\n";
        if ($senderEmail) {
            $headers .= "Reply-To: {$senderEmail}\r\n";
        }
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

        if (function_exists('mail')) {
            @mail($MAIL_TO, $subject, implode("\r\n", $messageLines), $headers);
        }
    }
}

if (!function_exists('curl_init')) {
    // Fallback sans cURL (file_get_contents)
    $opts = ['http' => ['method' => $method, 'header' => 'Content-Type: application/json']];
    if (in_array($method, ['POST', 'DELETE'])) {
        $opts['http']['content'] = $body;
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
