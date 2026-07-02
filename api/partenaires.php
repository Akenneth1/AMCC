<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$DATA_FILE  = __DIR__ . '/../data/partenaires.json';
$UPLOAD_DIR = __DIR__ . '/../uploads/partenaires/';
$UPLOAD_URL = '/uploads/partenaires/';
$ADMIN_HASH = getenv('ADMIN_HASH') ?: '6e2ae6d2dd300f8b08027a1ef2bfdfe324286ce12380abf13db7a183746d4d2d';

function checkAuth() {
    global $ADMIN_HASH;
    $token = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    if ($token !== $ADMIN_HASH) {
        http_response_code(403);
        echo json_encode(['error' => 'Non autorisé']);
        exit;
    }
}

function loadData() {
    global $DATA_FILE;
    if (!file_exists($DATA_FILE)) return [];
    $data = json_decode(file_get_contents($DATA_FILE), true);
    return is_array($data) ? $data : [];
}

function saveData($data) {
    global $DATA_FILE;
    $dir = dirname($DATA_FILE);
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    file_put_contents($DATA_FILE, json_encode(array_values($data), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    echo json_encode(loadData());
    exit;
}

if ($method === 'POST') {
    checkAuth();

    $nom = strip_tags(trim($_POST['nom'] ?? ''));
    $url = trim($_POST['url'] ?? '');

    if ($nom === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Nom de l\'entreprise requis']);
        exit;
    }

    if ($url !== '') {
        $validUrl = filter_var($url, FILTER_VALIDATE_URL);
        $scheme = strtolower(parse_url($url, PHP_URL_SCHEME) ?: '');
        if (!$validUrl || !in_array($scheme, ['http', 'https'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Lien partenaire invalide']);
            exit;
        }
    }

    if (empty($_FILES['logo']['tmp_name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Aucun logo fourni']);
        exit;
    }

    if (!is_dir($UPLOAD_DIR)) mkdir($UPLOAD_DIR, 0755, true);

    $ext = strtolower(pathinfo($_FILES['logo']['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Format logo non supporté (jpg, png, webp)']);
        exit;
    }

    if ($_FILES['logo']['size'] > 3 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(['error' => 'Logo trop lourd (max 3 Mo)']);
        exit;
    }

    $filename = uniqid('partner_') . '.' . $ext;
    if (!move_uploaded_file($_FILES['logo']['tmp_name'], $UPLOAD_DIR . $filename)) {
        http_response_code(500);
        echo json_encode(['error' => 'Impossible de sauvegarder le logo']);
        exit;
    }

    $item = [
        'id'        => uniqid('partner_'),
        'nom'       => $nom,
        'url'       => strip_tags($url),
        'logo'      => $UPLOAD_URL . $filename,
        'createdAt' => date('c')
    ];

    $list = loadData();
    array_unshift($list, $item);
    saveData($list);
    echo json_encode($item);
    exit;
}

if ($method === 'DELETE') {
    checkAuth();
    $id = $_GET['id'] ?? '';
    $items = loadData();
    $removed = [];
    $remaining = [];

    foreach ($items as $item) {
        if (($item['id'] ?? '') === $id) {
            $removed = $item;
        } else {
            $remaining[] = $item;
        }
    }

    if ($removed && !empty($removed['logo']) && strpos($removed['logo'], $UPLOAD_URL) === 0) {
        $path = $UPLOAD_DIR . basename($removed['logo']);
        if (file_exists($path)) {
            @unlink($path);
        }
    }

    saveData($remaining);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Méthode non supportée']);

