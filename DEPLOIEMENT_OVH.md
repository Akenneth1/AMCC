# Guide de déploiement — artmodeetculture.com (OVH)

## Avant de commencer

Tu as besoin de :
- Tes identifiants FTP OVH (fournis dans l'email de création d'hébergement)
- Le logiciel **FileZilla** installé sur ton Mac (gratuit : filezilla-project.org)
- Le projet buildé (étape 1 ci-dessous)

---

## ÉTAPE 1 — Préparer les fichiers sur ton Mac

### 1.1 Ouvrir le Terminal

1. Appuie sur **⌘ + Espace** pour ouvrir Spotlight
2. Tape `Terminal` puis appuie sur **Entrée**

### 1.2 Aller dans le dossier du projet

Dans le Terminal, tape exactement :
```
cd /Users/macbook/AMCC
```
Puis appuie sur **Entrée**.

### 1.3 Builder le site

Tape :
```
npm run build
```
Puis appuie sur **Entrée**.

Attends que tu voies `✓ built in ...ms` — c'est bon.

> Cela crée/met à jour le dossier `dist/` avec le site prêt à déployer.

---

## ÉTAPE 2 — Se connecter au serveur OVH avec FileZilla

### 2.1 Ouvrir FileZilla

1. Ouvre **FileZilla** (dans ton dossier Applications)

### 2.2 Se connecter au serveur

1. En haut à gauche, clique sur **Fichier** → **Gestionnaire de Sites**
2. Clique sur **Nouveau Site** (en bas à gauche)
3. Nomme-le `AMC OVH`
4. Dans le panneau de droite, remplis :
   - **Protocole** : `FTP - Protocole de Transfert de Fichiers`
   - **Hôte** : ton hôte FTP (ex: `ftp.artmodeetculture.com` — visible dans ton espace OVH)
   - **Port** : `21`
   - **Mode de connexion** : `Demander le mot de passe`
   - **Identifiant** : ton identifiant FTP OVH
5. Clique sur **Connexion**
6. Une boîte s'ouvre → entre ton **mot de passe FTP** → clique **OK**
7. Une alerte "Certificat inconnu" peut apparaître → clique **OK** pour accepter

> Tu es maintenant connecté. La partie gauche = ton Mac. La partie droite = le serveur OVH.

### 2.3 Naviguer vers le bon dossier sur OVH

Dans la partie **droite** (serveur OVH) :
1. Double-clique sur `www` (ou `public_html` selon ta config OVH)
   > C'est le dossier racine de ton site web

---

## ÉTAPE 3 — Uploader les fichiers

### 3.1 Naviguer vers les fichiers sur ton Mac (partie gauche)

Dans la partie **gauche** (ton Mac) :
1. Clique sur le champ **Site local** en haut
2. Tape `/Users/macbook/AMCC` et appuie sur **Entrée**
3. Tu vois maintenant tous les fichiers de ton projet

### 3.2 Uploader le contenu du dossier `dist/`

1. Double-clique sur le dossier **`dist`** (partie gauche)
2. Appuie sur **⌘ + A** pour sélectionner TOUS les fichiers dans `dist/`
3. Clique-droit sur la sélection → **Envoyer vers le serveur**
4. Attends que tous les fichiers soient uploadés (la barre en bas avance)

> ⚠️ Attends bien la fin avant de passer à l'étape suivante

### 3.3 Uploader le dossier `api/`

1. Dans la partie gauche, reviens au dossier principal AMCC (clique sur `..` en haut)
2. Clique-droit sur le dossier **`api`** → **Envoyer vers le serveur**
3. Attends la fin du transfert

### 3.4 Uploader le dossier `data/`

1. Clique-droit sur le dossier **`data`** → **Envoyer vers le serveur**
2. Attends la fin du transfert

### 3.5 Uploader le dossier `uploads/`

1. Clique-droit sur le dossier **`uploads`** → **Envoyer vers le serveur**
2. Attends la fin du transfert

### 3.6 Uploader le fichier `setup.php`

1. Clique-droit sur le fichier **`setup.php`** → **Envoyer vers le serveur**
2. Attends la fin du transfert

---

## ÉTAPE 4 — Donner les droits aux dossiers sur OVH

### 4.1 Chmod du dossier `data/`

Dans FileZilla, partie **droite** (serveur OVH) :
1. Clique-droit sur le dossier **`data`**
2. Clique sur **Attributs du fichier...**
3. Dans la case **Valeur numérique**, efface ce qu'il y a et tape `755`
4. Coche **Récurser dans les sous-répertoires**
5. Sélectionne **Appliquer aux répertoires seulement**
6. Clique **OK**

### 4.2 Chmod du dossier `uploads/`

1. Clique-droit sur le dossier **`uploads`**
2. Clique sur **Attributs du fichier...**
3. Dans la case **Valeur numérique**, tape `755`
4. Coche **Récurser dans les sous-répertoires**
5. Sélectionne **Appliquer à tous**
6. Clique **OK**

---

## ÉTAPE 5 — Lancer le script de setup

1. Ouvre ton navigateur (Chrome, Safari...)
2. Va à l'adresse :
   ```
   https://www.artmodeetculture.com/setup.php
   ```
3. Tu dois voir une page avec des cases **vertes** ✅ pour chaque élément
4. Si tu vois des cases **rouges** ❌ → reviens à l'étape 4 et vérifie les permissions

---

## ÉTAPE 6 — Supprimer setup.php (OBLIGATOIRE)

> ⚠️ Ce fichier donne accès à des infos sensibles. Le laisser en ligne est un risque de sécurité.

Dans FileZilla, partie **droite** (serveur OVH) :
1. Clique-droit sur le fichier **`setup.php`**
2. Clique sur **Supprimer**
3. Confirme en cliquant **Oui**

---

## ÉTAPE 7 — Vérification finale

1. Va sur **https://www.artmodeetculture.com**
2. Vérifie que le site s'affiche correctement
3. Va sur **https://www.artmodeetculture.com** → clique sur le lien **Admin** (tout en bas de page, discret)
4. Connecte-toi avec tes identifiants admin
5. Dans l'onglet **Artistes** → essaie d'ajouter un artiste test
6. Si l'artiste apparaît → tout fonctionne ✅

---

## En cas de problème

| Problème | Solution |
|----------|----------|
| Le site ne s'affiche pas | Vérifie que `index.html` est bien dans `www/` (pas dans un sous-dossier) |
| Erreur 403 sur setup.php | Les fichiers sont dans le mauvais dossier |
| Cases rouges dans setup.php | Refaire l'étape 4 (chmod) |
| Erreur à l'ajout d'artiste | Vérifier que `data/` et `uploads/artistes/` ont les droits 755 |
| Images artistes qui ne s'affichent pas | Vérifier que `uploads/artistes/` existe sur le serveur |
