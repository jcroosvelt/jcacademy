# JC Academy — fichier de reprise (Claude Code)

> Dernière mise à jour : 5 novembre 2026. Ce fichier sert aussi de `CLAUDE.md` à la racine du projet.

## 1. Le projet
- Plateforme de formation en ligne et en présentiel pour les jeunes haïtiens. Slogan : « JC Academy: Learn. Lead. Inspire. »
- Site en ligne : **https://jcacademy.online** (domaine Hostinger → projet Vercel `jc-academy.vercel.app`).
- Propriétaire : Joseph (J. Roosvelt Jean Charles). Il travaille surtout depuis un téléphone Android : réponses courtes, en français.

## 2. Stack
- **Front** : pages HTML statiques, une page = un fichier, CSS et JS inclus dans la page (`<script type="module">`). Pas de build, pas de framework.
- **Client Supabase** chargé depuis jsDelivr : `@supabase/supabase-js@2/+esm`.
- **Supabase** : projet **JC Academy**, id `tzgwhhxxozujxnjjpucg`, URL `https://tzgwhhxxozujxnjjpucg.supabase.co`, clé publique `sb_publishable_V8gqxhUp1sNsLP0eT7oGsg_gKfkam_E`.
  - ⚠️ Le même compte Supabase contient aussi le projet **JC Multimedia** (`tkwrklboqspkzxtlvnzh`) : **ne jamais y toucher**.
- **Vidéo** : Bunny Stream (fonctions `bunny-init-upload`, `bunny-get-playback`).
- **Paiement** : Kobara / MonCash (fonctions `create-kobara-payment`, `kobara-webhook`).
- **Emails** : Resend (fonctions `send-email`, `course-reminders`).
- **Anti-robot** : Cloudflare Turnstile, sitekey `0x4AAAAAAE6yRaiyGrQSxeNh`.
- **Déploiement** : Vercel, en déposant les fichiers à plat (pas de dossier parent dans le zip).

## 3. Fichiers clés
- `index.html`, `courses.html`, `course-detail.html`, `checkout.html`, `products.html`, `product-detail.html`
- `blog.html`, `article.html`, `actualites.html`, `actualite.html`
- `dashboard-admin.html`, `dashboard-formateur.html`, `dashboard-etudiant.html`
- `formulaire.html` : page publique des formulaires (servie aussi via `/form/:slug`, d'où le `<base href="/">`).
- `modal.js` : remplace `alert/confirm/prompt` par des fenêtres stylées (`showAlert`, `showConfirm`, `showPrompt`). Toujours utiliser celles-ci.
- `share.js`, `i18n.js`
- `vercel.json` : réécritures `/c/` (cours), `/p/` (produits), `/a/` (articles), `/n/` (actualités), `/f/` (formateurs) vers la fonction `share`, et `/form/:slug` vers `formulaire.html?f=:slug`.

## 4. Règles de travail (demandées par Joseph)
- Interface **en français**, **aucun emoji sur le site**.
- Pas de fenêtres natives (`alert`, `confirm`, `prompt`) : passer par `modal.js`.
- Échapper tout texte affiché (`escapeHtml`). Le HTML riche (corps d'articles) passe par `sanitizeRichHtml` (liste blanche de balises, URLs http(s) uniquement).
- Ne pas élargir le périmètre sans le dire. Signaler les problèmes trouvés en chemin plutôt que de les corriger en douce.
- **Vérifications après chaque modification d'une page** :
  - `node --check` sur chaque `<script type="module">` extrait ;
  - équilibre `<div>`/`</div>` et `<script>`/`</script>` ;
  - aucun `getElementById('x')` sans `id="x"` correspondant ;
  - aucun `\\'` en trop ;
  - aucune fenêtre native ajoutée.
- Côté Supabase : tester les règles RLS dans un bloc `DO $$ ... RAISE EXCEPTION 'RESULTAT_TEST: ...' $$`, qui annule tout. Ne laisser aucune donnée de test. Relancer l'audit de sécurité (advisors) après chaque migration.
- Zip de livraison : fichiers **à plat**.
- **Déploiement automatique (autorisé par Joseph le 5 novembre 2026)** : chaque modification validée est envoyée directement sur la branche `main` du dépôt GitHub `jcroosvelt/jcacademy`, sans demander de nouvelle confirmation.

## 5. Ce qui a été fait récemment (octobre-novembre 2026)

**Page article (`article.html`)**
- Couverture, chapeau (`excerpt`) mis en avant, auteur et date.
- Partage Facebook, WhatsApp, X et copie du lien vers `/a/slug`.
- Corps en HTML assaini. Les anciens textes bruts sont convertis en paragraphes.
- Commentaires : les 5 plus récents, réservés aux membres connectés, supprimables par l'auteur ou l'admin.
- `actualite.html` : seul le rendu du corps a été adapté (même assainissement).

**Admin : éditeur riche des articles et actualités**
- Gras, italique, souligné, intertitres, citation, listes, lien.
- Insertion d'images dans le bucket `articles`, sous `<id>/body/`.

**Admin : onglet « Statistiques & revenus »**
- Inscrits par cours, achats par produit, revenus par formateur.
- Commission JC Academy : **30 % sur les cours** (70 % au formateur) et **20 % sur les produits numériques** (80 % au vendeur `seller_id`). Ce qui est vendu par un compte admin revient à 100 % à JC Academy.
- Seules les commandes au statut `paye` sont comptées.
- Temps réel Supabase activé sur `enrollments`, `orders`, `product_orders`.

**Pré-inscription aux cours**
- Colonne `courses.start_date` (vide = disponible dès la publication).
- Cours gratuit : la pré-inscription est une inscription normale.
- Cours payant : réservation gratuite dans `course_reservations`, paiement avant le début. Après le début, achat direct uniquement.
- Leçons, questions de quiz et vidéo Bunny verrouillées avant la date (RLS + fonction `bunny-get-playback`).
- Affichage : badge « Bientôt » sur les cartes et compte à rebours sur la page du cours.

**Rappels automatiques par email**
- Fonction `course-reminders`, appelée chaque heure à xx h 05 par la tâche pg_cron `rappels-cours-horaire`.
- Elle est protégée par le secret de coffre-fort (vault) `course_reminders_secret`, vérifié par la fonction SQL `check_course_reminders_secret`.
- Rappels « J-3 », « veille » et « jour J ». Chaque envoi est journalisé dans `course_reminders_sent` pour ne jamais être répété.

**Sécurité de `send-email`**
- Cette fonction était un relais ouvert. Elle n'accepte plus que la clé service_role (webhook) ou un admin connecté.
- Le webhook Kobara et `dashboard-admin.html` envoient maintenant le bon en-tête `Authorization`.

**Commentaires d'articles (`article_comments`)**
- Déclencheur qui impose le nom du profil, limite le texte à 1-1000 caractères, n'accepte que les contenus publiés et fixe la date côté serveur.
- Aucune modification possible, seulement la suppression.
- Déclencheur `updated_at` automatique sur `site_content`.

**Formulaires type Google Forms (admin uniquement)**
- Tables `forms` et `form_responses`.
- Fonction `submit-form` : Turnstile, validation des champs, connexion facultative, une réponse par personne.
- Onglet admin « Formulaires » : création de questions (10 types), résumé des réponses, export CSV.

## 6. Supabase : repères
- **Rôles** : la fonction SQL `current_role()` renvoie `admin`, `formateur` ou `etudiant`. Elle est utilisée dans les règles RLS.
- **Statuts** :
  - cours : `brouillon`, `en_attente`, `publie`, `rejete` ;
  - commandes : `en_attente`, `paye`, `echoue`, `rembourse`.
- **Edge Functions** : 26 au total. Le code source n'existe que dans Supabase. Pour le récupérer en local :
  ```
  supabase login
  supabase link --project-ref tzgwhhxxozujxnjjpucg
  supabase functions download <slug>
  ```
  - Avec `verify_jwt = false` (normal, elles ont leur propre contrôle) : `kobara-webhook`, `send-email`, `share`, `sitemap`, `verify-turnstile`, `course-reminders`, `submit-form`, `og-logo`, `og-logo-proxy-placeholder`.
  - Probablement anciennes (à vérifier avant tout nettoyage, ne rien supprimer sans l'accord de Joseph) : `checkout`, `payment-webhook`, `submit-quiz`, `product-download`.
- **Secrets des Edge Functions** :
  - `TURNSTILE_SECRET_KEY`, les clés Bunny et Kobara : présents ;
  - **`RESEND_API_KEY` et `RESEND_FROM` : ABSENTS**, voir les tâches en attente.

## 7. Tâches en attente
1. **Emails (prioritaire)** : Joseph doit ajouter `RESEND_API_KEY` et `RESEND_FROM` dans les secrets des Edge Functions.
   - Resend est déjà configuré en SMTP pour les emails d'authentification (inscription, mot de passe). La clé API est la même que le mot de passe SMTP.
   - Ensuite, faire un test d'envoi réel. Tant que ces secrets manquent, **aucun email transactionnel ne part** (paiement, validation, certificats, rappels).
2. **Bunny** : Joseph doit recharger son compte (manque de crédit, cause de `bunny_create_failed`), puis tester l'envoi, l'encodage et la lecture d'une vidéo.
3. **Paiement Kobara/MonCash** : tester un vrai paiement de bout en bout.
4. **Formulaires** : tester un envoi réel depuis un téléphone. Le passage Turnstile n'a pas pu être testé sans navigateur.
5. **Sécurité (optionnel)** :
   - la vue `lessons_preview` est en security definer (signalée par l'audit), à corriger avec prudence ;
   - « Leaked password protection » est à activer dans Supabase Auth (réglage du tableau de bord).
6. **Idées évoquées, non faites** :
   - filtre par période dans les statistiques ;
   - suivi des versements aux formateurs ;
   - vue des revenus dans le dashboard formateur ;
   - nombre de places maximum pour les cours en pré-inscription ;
   - retour vers la page d'origine après connexion (`login.html` redirige toujours vers le dashboard) ;
   - refonte complète de `actualite.html` ;
   - retrait de l'emoji dans le message de bienvenue de `dashboard-etudiant.html`.
