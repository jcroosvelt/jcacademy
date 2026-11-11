# JC Academy : état d'avancement

Fichier de suivi, mis à jour après chaque modification (consigne de Joseph).
Il n'est pas publié sur le site (dossier `docs/` exclu du déploiement Vercel).

Dernière mise à jour : 11 novembre 2026, après l'ajout du type de parcours Badge.

## Fait et en ligne

### Site et espaces
- **Éditeur de texte complet** (articles, blog, actualités, présentation des cours, leçons) : onglets Accueil / Insertion / Mise en page / Révision / Affichage, polices, tailles, couleurs, tableaux, listes à cocher, recherche et remplacement, zoom, compteur de mots et de pages, aperçu tel que publié.
- **Dashboard administrateur** refait, filtre par période dans les statistiques, versements aux formateurs, réglage du prix de candidature formateur.
- **Photos de profil** affichées dans les trois espaces (admin, formateur, étudiant).
- **Application installable** (PWA).
- **Retour à la page d'origine** après connexion.
- **Aucune limite de places** sur les cours (inscriptions illimitées).

### Cours
- **L'admin crée des cours comme un formateur** (bouton « Créer un cours », publication directe).
- **Aperçu avant validation** : page `apercu-cours.html` (modules, leçons, vidéos, quiz) ouverte depuis « Cours à valider ».
- **Validation obligatoire** : un formateur ne peut plus publier un cours lui-même (règle en base de données).
- **Type de parcours : Badge, Certificat, Diplôme** (formulaire, catalogue avec filtre, accueil, page du cours, espace étudiant).
- **Vidéos de leçon** par lien YouTube ou Vimeo (alternative gratuite à Bunny).
- **Modifier et réordonner les leçons**.

### Produits et boutiques
- **Validation des produits par l'admin** : aperçu (description, fichiers), approbation ou rejet avec motif. Modifier un produit publié le renvoie en validation.
- **Boutiques des formateurs** : création dans « Ma boutique », page publique `boutique.html` (bannière, logo, statistiques, catégories, tri, cartes produit). L'admin peut suspendre une boutique.
- **Annuaire des boutiques** (`boutique.html` sans paramètre) et lien depuis les produits.

### Paiements et revenus
- **Revenus formateur** et suivi des versements.
- **Frais de candidature formateur** payables par MonCash (réglage admin, 0 pour l'instant).

## Base de données (projet Supabase de JC Academy)
- Tables ajoutées : `shops`, `teacher_payouts`, `application_payments`.
- Colonnes ajoutées : `digital_products.shop_id`, `digital_products.rejection_reason`, `teacher_applications.fee_required`.
- Valeurs ajoutées : statuts de produit `en_attente` / `rejete`, parcours `badge`.
- Règles de sécurité : un non-admin ne peut pas publier un cours ou un produit ; seul l'admin change le statut d'une boutique.

## Vidéos (livrées, hors dépôt)
- « Les fondamentaux de l'informatique » : YouTube 16:9 et Reels 9:16 (phrases de consigne retirées de la voix).
- Leçon 1.1 « Qu'est-ce que l'informatique ? » : 16:9 et TikTok 9:16, 3 min 02.

## En cours / à faire
- **Boutique « façon Charriow »** : le site de référence est inaccessible depuis l'environnement de travail. En attente de captures d'écran d'une boutique Charriow (vitrine et fiche produit) pour copier le style exact.
- **Badge** : pas encore de visuel de badge ni d'attribution automatique à la fin du cours (aujourd'hui, demande puis livraison comme un certificat).
- **Vérifier en conditions réelles** : circuit complet formateur (boutique, produit, validation admin) avec de vrais comptes.
- **Recharger Bunny** puis tester l'envoi de vidéos.
- **Test d'un paiement MonCash réel** (frais de candidature, achats).

## Problèmes connus
- Le lien « Voir le CV » d'une candidature formateur ne s'ouvre pas (fichier dans un espace privé).
- Les frais de candidature ne sont pas comptés dans les revenus de l'admin.
- Pas de bouton « marquer comme payé » pour un versement.
- La page d'accueil : le titre « Trois parcours » peut être remplacé par le texte édité dans l'admin.

## Journal des modifications
| Date | Modification |
|---|---|
| 11 nov. 2026 | Type de parcours Badge / Certificat / Diplôme |
| 11 nov. 2026 | Vitrine de boutique, validation des produits, aperçu des cours, boutiques des formateurs |
| 11 nov. 2026 | Éditeur de texte complet ; l'admin crée des cours |
| nov. 2026 | Frais de candidature formateur par MonCash ; modifier une leçon ; vidéos YouTube/Vimeo ; PWA |
| nov. 2026 | Refonte du dashboard admin, revenus formateur, versements, photos de profil, éditeur de texte riche |
