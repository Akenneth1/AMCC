<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$DATA_FILE  = __DIR__ . '/../data/galerie.json';
$UPLOAD_DIR = __DIR__ . '/../uploads/galerie/';
$UPLOAD_URL = '/uploads/galerie/';
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

    if (empty($_FILES['media']['tmp_name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Aucun fichier média fourni']);
        exit;
    }

    if (!is_dir($UPLOAD_DIR)) mkdir($UPLOAD_DIR, 0755, true);
    $mediaExt = strtolower(pathinfo($_FILES['media']['name'], PATHINFO_EXTENSION));
    $videoExts = ['mp4', 'webm', 'ogg'];
    $imageExts = ['jpg', 'jpeg', 'png', 'webp'];
    $allowedExts = array_merge($imageExts, $videoExts);

    if (!in_array($mediaExt, $allowedExts)) {
        http_response_code(400);
        echo json_encode(['error' => 'Format média non supporté']);
        exit;
    }

    $mediaType = in_array($mediaExt, $videoExts) ? 'video' : 'image';
    $mediaSize = $_FILES['media']['size'];
    $maxSize   = $mediaType === 'video' ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if ($mediaSize > $maxSize) {
        http_response_code(400);
        echo json_encode(['error' => $mediaType === 'video' ? 'Vidéo trop lourde (max 50 Mo)' : 'Image trop lourde (max 5 Mo)']);
        exit;
    }

    $filename = uniqid('gal_') . '.' . $mediaExt;
    if (!move_uploaded_file($_FILES['media']['tmp_name'], $UPLOAD_DIR . $filename)) {
        http_response_code(500);
        echo json_encode(['error' => 'Impossible de sauvegarder le fichier média']);
        exit;
    }

    $posterUrl = '';
    if (!empty($_FILES['poster']['tmp_name'])) {
        $posterExt = strtolower(pathinfo($_FILES['poster']['name'], PATHINFO_EXTENSION));
        if (!in_array($posterExt, $imageExts)) {
            http_response_code(400);
            echo json_encode(['error' => 'Format de vignette non supporté']);
            exit;
        }
        $posterName = uniqid('gal_poster_') . '.' . $posterExt;
        if (move_uploaded_file($_FILES['poster']['tmp_name'], $UPLOAD_DIR . $posterName)) {
            $posterUrl = $UPLOAD_URL . $posterName;
        }
    }

    $item = [
        'id'        => uniqid('gal_'),
        'src'       => $UPLOAD_URL . $filename,
        'type'      => $mediaType,
        'poster'    => $posterUrl,
        'categorie' => strip_tags(trim($_POST['categorie'] ?? 'public')),
        'alt'       => strip_tags(trim($_POST['alt'] ?? '')),
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
    $id   = $_GET['id'] ?? '';
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
    if ($removed) {
        $cleanPath = function($url) use ($UPLOAD_DIR, $UPLOAD_URL) {
            if (strpos($url, $UPLOAD_URL) === 0) {
                $path = $UPLOAD_DIR . basename($url);
                return $path;
            }
            return '';
        };
        $files = [];
        if (!empty($removed['src'])) $files[] = $cleanPath($removed['src']);
        if (!empty($removed['poster'])) $files[] = $cleanPath($removed['poster']);
        foreach ($files as $file) {
            if ($file && file_exists($file)) {
                @unlink($file);
            }
        }
    }
    saveData($remaining);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Méthode non supportée']);
