<?php
/**
 * Envoi d'email de notification à l'association AMC.
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$MAIL_TO = 'contact@artmodeetculture.com';
$body = file_get_contents('php://input');
$data = json_decode($body, true);

if (!is_array($data) || !isset($data['data']) || !is_array($data['data'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Payload invalide']);
    exit;
}

$payload = $data['data'];
$type = $payload['type'] ?? (isset($payload['profil']) ? 'adhesion' : 'contact');
$subject = 'Nouvelle soumission AMC';
$messageLines = [];

if ($type === 'contact') {
    $subject = 'Nouveau message de contact AMC';
    $messageLines[] = 'Type : Contact';
    $messageLines[] = 'Nom : ' . ($payload['nom'] ?? '—');
    $messageLines[] = 'Email : ' . ($payload['email'] ?? '—');
    $messageLines[] = 'Message :';
    $messageLines[] = $payload['message'] ?? '—';
} else {
    $subject = 'Nouvelle demande d\'adhésion AMC';
    $messageLines[] = 'Type : Adhésion / Rejoindre AMC';
    $messageLines[] = 'Nom : ' . ($payload['nom'] ?? '—');
    $messageLines[] = 'Email : ' . ($payload['email'] ?? '—');
    $messageLines[] = 'Téléphone : ' . ($payload['tel'] ?? '—');
    $messageLines[] = 'Ville : ' . ($payload['ville'] ?? '—');
    $messageLines[] = 'Date de naissance : ' . ($payload['dateNaissance'] ?? '—');
    $messageLines[] = 'Profil : ' . ($payload['profil'] ?? '—');
    $messageLines[] = 'Mode de paiement : ' . ($payload['paiement'] ?? '—');
    $messageLines[] = 'Statut : ' . ($payload['statut'] ?? '—');
    $messageLines[] = 'Message / Motivations :';
    $messageLines[] = $payload['message'] ?? '—';
}

$messageLines[] = '';
$messageLines[] = 'Date de soumission : ' . date('d/m/Y H:i:s');

$fromDomain = $_SERVER['SERVER_NAME'] ?: 'localhost';
$fromEmail = 'no-reply@' . preg_replace('/[^a-z0-9.\-]/i', '', $fromDomain);
$senderEmail = filter_var($payload['email'] ?? '', FILTER_VALIDATE_EMAIL);

$headers = "From: Art Mode & Culture <{$fromEmail}>\r\n";
if ($senderEmail) {
    $headers .= "Reply-To: {$senderEmail}\r\n";
}
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = false;
if (function_exists('mail')) {
    $sent = @mail($MAIL_TO, $subject, implode("\r\n", $messageLines), $headers);
}

if ($sent) {
    echo json_encode(['success' => true, 'message' => 'Email envoyé.']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Impossible d\'envoyer l\'email.']);
}
