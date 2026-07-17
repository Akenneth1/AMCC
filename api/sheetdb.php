<?php
/**
 * Proxy SheetDB — masque la vraie URL SheetDB côté serveur.
 * Reçoit les requêtes du site et les transmet à SheetDB.
 * Envoie également un email de notification à l'association.
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$SHEETDB_BASE = 'https://sheetdb.io/api/v1/vz9tjb2ka6fnu';
$MAIL_TO      = 'contact@artmodeetculture.com';

$method = $_SERVER['REQUEST_METHOD'];

// Construction de l'URL SheetDB cible
$path = $_GET['path'] ?? '';  // ex: "email/user@test.com" pour DELETE
$url  = $SHEETDB_BASE . ($path ? '/' . ltrim($path, '/') : '');

$body = file_get_contents('php://input');

if ($method === 'POST' && $body) {
    $payload = json_decode($body, true);
    if (is_array($payload) && isset($payload['data']) && is_array($payload['data'])) {
        $data = $payload['data'];
        
        if (isset($data[0]) && is_array($data[0])) {
            $item = $data[0];
            $type = isset($item['Type']) ? strtolower($item['Type']) : (isset($item['Profil']) ? 'adhesion' : 'message');
            $nom = $item['Nom'] ?? '—';
            $email = $item['Email'] ?? '—';
            $message = $item['Message'] ?? '—';
            $tel = $item['Téléphone'] ?? '—';
            $ville = $item['Ville'] ?? '—';
            $dateNaissance = $item['Date de naissance'] ?? '—';
            $profil = $item['Profil'] ?? '—';
            $paiement = $item['Paiement'] ?? '—';
            $statut = $item['Statut'] ?? '—';
        } else {
            $item = $data;
            $type = isset($item['type']) ? strtolower($item['type']) : (isset($item['profil']) ? 'adhesion' : 'message');
            $nom = $item['nom'] ?? '—';
            $email = $item['email'] ?? '—';
            $message = $item['message'] ?? '—';
            $tel = $item['tel'] ?? '—';
            $ville = $item['ville'] ?? '—';
            $dateNaissance = $item['dateNaissance'] ?? '—';
            $profil = $item['profil'] ?? '—';
            $paiement = $item['paiement'] ?? '—';
            $statut = $item['statut'] ?? '—';
        }

        $subject = 'Nouvelle soumission AMC';
        $messageLines = [];

        if ($type === 'contact') {
            $subject = 'Nouveau message de contact AMC';
            $messageLines[] = 'Type : Contact';
            $messageLines[] = 'Nom : ' . $nom;
            $messageLines[] = 'Email : ' . $email;
            $messageLines[] = 'Message :';
            $messageLines[] = $message;
        } else {
            $subject = 'Nouvelle demande d\'adhésion AMC';
            $messageLines[] = 'Type : Adhésion / Rejoindre AMC';
            $messageLines[] = 'Nom : ' . $nom;
            $messageLines[] = 'Email : ' . $email;
            $messageLines[] = 'Téléphone : ' . $tel;
            $messageLines[] = 'Ville : ' . $ville;
            $messageLines[] = 'Date de naissance : ' . $dateNaissance;
            $messageLines[] = 'Profil : ' . $profil;
            $messageLines[] = 'Mode de paiement : ' . $paiement;
            $messageLines[] = 'Statut : ' . $statut;
            $messageLines[] = 'Message / Motivations :';
            $messageLines[] = $message;
        }

        $messageLines[] = '';
        $messageLines[] = 'Date de soumission : ' . date('d/m/Y H:i:s');

        $fromDomain = $_SERVER['SERVER_NAME'] ?: 'localhost';
        $fromEmail = 'no-reply@' . preg_replace('/[^a-z0-9.\-]/i', '', $fromDomain);
        $senderEmail = filter_var($email, FILTER_VALIDATE_EMAIL);

        $headers  = "From: Art Mode & Culture <{$fromEmail}>\r\n";
        if ($senderEmail) {
            $headers .= "Reply-To: {$senderEmail}\r\n";
        }
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

        if (function_exists('mail')) {
            @mail($MAIL_TO, $subject, implode("\r\n", $messageLines), $headers);
        }

        if ($type === 'contact') {
            http_response_code(200);
            echo json_encode(['success' => true]);
            exit;
        }
    }
}

if (!function_exists('curl_init')) {
    // Fallback sans cURL (file_get_contents)
    $opts = ['http' => ['method' => $method, 'header' => 'Content-Type: application/json']];
    if (in_array($method, ['POST', 'DELETE', 'PATCH', 'PUT'])) {
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

if (in_array($method, ['POST', 'DELETE', 'PATCH', 'PUT'])) {
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
