<?php
/**
 * SETUP AMC — À exécuter UNE SEULE FOIS sur OVH
 * URL : https://www.artmodeetculture.com/setup.php
 * SUPPRIMER ce fichier après exécution.
 */

$dirs = [
    __DIR__ . '/data',
    __DIR__ . '/uploads',
    __DIR__ . '/uploads/artistes',
];

$results = [];

foreach ($dirs as $dir) {
    if (!is_dir($dir)) {
        if (mkdir($dir, 0755, true)) {
            $results[] = "✅ Créé : $dir";
        } else {
            $results[] = "❌ Échec création : $dir";
        }
    } else {
        chmod($dir, 0755);
        $results[] = "✅ Existe déjà : $dir";
    }
}

// Créer artistes.json vide si absent
$json = __DIR__ . '/data/artistes.json';
if (!file_exists($json)) {
    file_put_contents($json, '[]');
    $results[] = "✅ Créé : data/artistes.json";
} else {
    $results[] = "✅ Existe déjà : data/artistes.json";
}

// Vérifications d'écriture
$writeTests = [
    __DIR__ . '/data'             => is_writable(__DIR__ . '/data'),
    __DIR__ . '/uploads/artistes' => is_writable(__DIR__ . '/uploads/artistes'),
];

?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Setup AMC</title>
  <style>
    body { font-family: monospace; background:#111; color:#eee; padding:40px; }
    h1   { color:#c8a96b; }
    .ok  { color:#4caf50; }
    .err { color:#f44; }
    .warn{ color:#ff9800; }
    .box { background:#1a1a1a; border:1px solid #333; padding:20px; margin:20px 0; border-radius:4px; }
  </style>
</head>
<body>
  <h1>🔧 Setup AMC — Initialisation serveur</h1>

  <div class="box">
    <h3>Dossiers</h3>
    <?php foreach ($results as $r): ?>
      <p><?= $r ?></p>
    <?php endforeach; ?>
  </div>

  <div class="box">
    <h3>Droits d'écriture</h3>
    <?php foreach ($writeTests as $path => $writable): ?>
      <p class="<?= $writable ? 'ok' : 'err' ?>">
        <?= $writable ? '✅' : '❌' ?> <?= basename($path) ?> : <?= $writable ? 'écriture OK' : 'ERREUR — chmod 755 requis' ?>
      </p>
    <?php endforeach; ?>
  </div>

  <div class="box">
    <h3>PHP</h3>
    <p class="ok">✅ Version PHP : <?= PHP_VERSION ?></p>
    <p class="<?= function_exists('move_uploaded_file') ? 'ok' : 'err' ?>">
      <?= function_exists('move_uploaded_file') ? '✅' : '❌' ?> Upload de fichiers : <?= function_exists('move_uploaded_file') ? 'disponible' : 'indisponible' ?>
    </p>
    <p class="<?= ini_get('file_uploads') ? 'ok' : 'err' ?>">
      <?= ini_get('file_uploads') ? '✅' : '❌' ?> file_uploads : <?= ini_get('file_uploads') ? 'activé' : 'désactivé' ?>
    </p>
    <p class="ok">✅ upload_max_filesize : <?= ini_get('upload_max_filesize') ?></p>
  </div>

  <div class="box warn">
    <h3>⚠️ Important</h3>
    <p>Supprimez ce fichier <strong>setup.php</strong> dès que tout est vert.</p>
    <p>Commande FTP : <code>rm setup.php</code></p>
  </div>
</body>
</html>
