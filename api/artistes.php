<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$DATA_FILE  = __DIR__ . '/../data/artistes.json';
$UPLOAD_DIR = __DIR__ . '/../uploads/artistes/';
$UPLOAD_URL = '/uploads/artistes/';
$ADMIN_HASH = getenv('ADMIN_HASH') ?: '43151764bcdfc907da60f13d47fc166768829be22a13bacbc51c46256f61a78b';

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

// GET — liste des artistes
if ($method === 'GET') {
    echo json_encode(loadData());
    exit;
}

// POST — ajouter un artiste
if ($method === 'POST') {
    checkAuth();

    $imgUrl = '/logo.png';

    if (!empty($_FILES['image']['tmp_name'])) {
        if (!is_dir($UPLOAD_DIR)) mkdir($UPLOAD_DIR, 0755, true);
        $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Format image non supporté (jpg, png, webp)']);
            exit;
        }
        $size = $_FILES['image']['size'];
        if ($size > 5 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(['error' => 'Image trop lourde (max 5 Mo)']);
            exit;
        }
        $filename = uniqid('artiste_') . '.' . $ext;
        if (move_uploaded_file($_FILES['image']['tmp_name'], $UPLOAD_DIR . $filename)) {
            $imgUrl = $UPLOAD_URL . $filename;
        }
    }

    $artiste = [
        'id'         => uniqid('art_'),
        'nom'        => strip_tags(trim($_POST['nom']        ?? '')),
        'discipline' => strip_tags(trim($_POST['discipline'] ?? '')),
        'bio'        => strip_tags(trim($_POST['bio']        ?? '')),
        'img'        => $imgUrl,
        'createdAt'  => date('c')
    ];

    if (empty($artiste['nom']) || empty($artiste['discipline'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Nom et discipline requis']);
        exit;
    }

    $list = loadData();
    array_unshift($list, $artiste);
    saveData($list);
    echo json_encode($artiste);
    exit;
}

// DELETE — supprimer un artiste
if ($method === 'DELETE') {
    checkAuth();
    $id   = $_GET['id'] ?? '';
    $list = array_filter(loadData(), fn($a) => ($a['id'] ?? '') !== $id);
    saveData($list);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Méthode non supportée']);
