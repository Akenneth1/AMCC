# Documentation et Informations du Site — Art Mode et Culture (AMCC)

Ce document contient toutes les informations essentielles pour administrer, gérer et comprendre le fonctionnement de votre site web **artmodeetculture.com**.

---

## 1. Accès à l'espace d'administration

L'espace d'administration vous permet de gérer les membres (adhérents), les artistes, la galerie d'art et les partenaires du site.

*   **Lien d'accès :** Rendez-vous sur le site (https://www.artmodeetculture.com), descendez tout en bas de la page, et cliquez sur le petit lien discret **"· Admin"** dans le pied de page (footer). Vous pouvez aussi utiliser le raccourci clavier `Ctrl + Alt + A` sur n'importe quelle page.
*   **Email administrateur :** `contact@artmodeetculture.com`
*   **Mot de passe :** `Admin.AMC2026?`

*(Note : Si vous souhaitez modifier ce mot de passe à l'avenir, il faudra générer le nouveau hash SHA-256 du mot de passe et le mettre à jour dans le code source ainsi que dans le fichier `.env`).*

---

## 2. Gestion du contenu (CMS)

Une fois connecté à l'espace d'administration, vous aurez accès à plusieurs onglets :

### 👤 Membres (Adhérents)
*   **Affichage :** Liste tous les membres inscrits via le formulaire du site.
*   **Fonctionnement :** Les membres s'inscrivent sur le site, et les données sont enregistrées (via Firebase ou SheetDB selon votre configuration).
*   **Actions :** Vous pouvez visualiser leurs informations (Nom, Email, Téléphone, Statut de paiement, etc.).

### 🎨 Artistes
*   **Ajouter un artiste :**
    1. Allez dans l'onglet "Artistes".
    2. Remplissez le formulaire (Nom, Spécialité, Description, Réseaux sociaux...).
    3. **Image :** Vous pouvez sélectionner une photo de profil pour l'artiste. Elle sera uploadée sur le serveur.
    4. Cliquez sur "Ajouter".
*   **Modifier / Supprimer :** Vous pouvez à tout moment éditer la fiche d'un artiste ou la supprimer grâce aux boutons situés à côté de chaque artiste dans la liste.

### 🖼️ Galerie
*   **Ajouter une œuvre :**
    1. Allez dans l'onglet "Galerie".
    2. Remplissez le titre de l'œuvre, sa catégorie (ex: Peinture, Sculpture), la description, et liez-la éventuellement à un artiste existant.
    3. **Image :** Uploadez la photo de l'œuvre.
    4. Cliquez sur "Ajouter l'œuvre".
*   **Gestion :** Comme pour les artistes, vous pouvez modifier ou supprimer les œuvres affichées dans la galerie publique.

### 🤝 Partenaires
*   **Ajouter un partenaire :**
    1. Allez dans l'onglet "Partenaires".
    2. Saisissez le nom du partenaire, son site web (lien) et une description.
    3. **Logo :** Uploadez le logo du partenaire.
    4. Cliquez sur "Ajouter le partenaire".

---

## 3. Comment fonctionnent les données (Technique)

Le site utilise un système hybride pour être rapide et facile à héberger sur OVH :

*   **Fichiers de données (JSON) :** Toutes les informations que vous ajoutez (Artistes, Galerie, Partenaires) sont sauvegardées dans des fichiers textes sécurisés situés dans le dossier `data/` de votre hébergement (`artistes.json`, `galerie.json`, `partenaires.json`).
*   **Images et Médias :** Lorsque vous uploadez une image, elle est sauvegardée dans le dossier `uploads/` de votre serveur (sous-dossiers `artistes/`, `galerie/`, `partenaires/`).
*   **Sauvegarde :** Si vous souhaitez sauvegarder les données de votre site, il vous suffit de télécharger les dossiers `data/` et `uploads/` depuis votre serveur FTP OVH.

---

## 4. Maintenance et Déploiement

Si de grandes modifications sont apportées au code source (design, nouvelles fonctionnalités), le site doit être "reconstruit" (build) puis envoyé sur OVH. 
Toute la procédure détaillée étape par étape est disponible dans le fichier **`DEPLOIEMENT_OVH.md`** présent à la racine du projet. 

**En résumé, pour le développeur :**
1. Exécuter `npm run build` en local.
2. Envoyer le contenu du dossier `dist/` sur le FTP (dossier `www`).
3. S'assurer que les dossiers `api/`, `data/` et `uploads/` sont présents sur le FTP avec les bonnes permissions (chmod 755).

---

## 5. Support / En cas de problème

*   **Identifiants incorrects :** Assurez-vous de respecter les majuscules et caractères spéciaux du mot de passe (`Admin.AMC2026?`).
*   **Les ajouts (artistes/galerie) ne s'affichent pas :** Cela provient généralement d'un problème de permissions sur le serveur OVH. Les dossiers `data/` et `uploads/` doivent avoir les permissions `755` pour que le site puisse y écrire les nouvelles informations (voir étape 4 du guide de déploiement).
*   **Formulaire de contact / Adhésion :** Les emails envoyés depuis le site utilisent la configuration définie dans les variables d'environnement (Firebase ou autre service tiers configuré).
