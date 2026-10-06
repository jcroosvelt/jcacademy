// i18n.js — Système de traduction de JC Academy (FR par défaut, EN, ES)
//
// Comment ça marche : chaque élément à traduire porte un attribut
// data-i18n="cle" dans le HTML. Ce script lit la langue choisie (mémorisée
// dans le navigateur), puis remplace le texte de chaque élément par sa
// traduction. Rien ne change pour un visiteur qui ne touche jamais au
// sélecteur de langue — tout reste en français par défaut.
//
// IMPORTANT — limite à connaître : Google, WhatsApp et Facebook ne lisent
// jamais le résultat de ce script (ils ne lisent que le HTML brut, en
// français). Ce système change ce que voit un visiteur dans son navigateur,
// pas ce que les moteurs de recherche indexent. Pour un vrai référencement
// multilingue, il faudrait des pages séparées par langue — un chantier plus
// lourd, à part.
//
// Pour ajouter une traduction sur un nouvel élément :
//   <h2 data-i18n="mon_titre">Mon titre en français</h2>
// puis ajouter "mon_titre" dans les 3 dictionnaires ci-dessous.
// Pour un placeholder de champ : data-i18n-placeholder="ma_cle".

const TRANSLATIONS = {
  fr: {
    nav_accueil: "Accueil", nav_cours: "Cours", nav_produits: "Produits",
    nav_blog: "Blog", nav_actualites: "Actualités", nav_formateurs: "Nos formateurs",
    nav_devenir_formateur: "Devenir formateur", nav_contact: "Contact",
    nav_connexion: "Se connecter", nav_inscription: "S'inscrire", nav_deconnexion: "Déconnexion",

    hero_eyebrow: "Plateforme de formation certifiante",
    hero_titre_1: "Apprenez de nouvelles compétences,",
    hero_titre_2: "obtenez une certification reconnue.",
    hero_texte: "JC Academy vous accompagne du premier module jusqu'à votre certificat, avec des formateurs experts, des projets concrets et un parcours pensé pour votre réussite.",
    hero_cta_cours: "Découvrir les cours",
    hero_cta_gratuit: "Apprenez gratuitement",
    hero_badge_certificat: "Certificat délivré",
    hero_badge_diplome: "Programme diplôme",

    programmes_eyebrow: "Nos programmes",
    carte_certificat_titre: "Programme Certificat",
    carte_certificat_texte: "Des formations courtes et ciblées pour acquérir une compétence précise et obtenir un certificat reconnu en quelques semaines.",
    carte_diplome_titre: "Programme Diplôme",
    carte_diplome_texte: "Des cursus complets et approfondis, encadrés par des experts, menant à un diplôme valorisant votre parcours professionnel.",
    voir_programmes: "Voir tous les programmes",
    explorer: "Explorer →",

    formateurs_eyebrow: "Nos formateurs",
    actualites_eyebrow: "Actualités",
    galerie_eyebrow: "Galerie",
    blog_eyebrow: "Blog",
    produits_eyebrow: "Produits numériques",
    voir_produits: "Voir tous les produits",
    cta_inscription: "S'inscrire maintenant",
    cta_voir_cours: "Voir les cours",

    footer_tagline: "JC Academy est une plateforme de formation en ligne certifiante qui vous aide à apprendre de nouvelles compétences, obtenir des certifications reconnues et faire progresser votre carrière.",
    footer_apropos_titre: "À propos de nous",
    footer_mission: "Notre mission", footer_carrieres: "Carrières", footer_partenaires: "Partenaires",
    footer_plateforme_titre: "Plateforme",
    footer_nos_cours: "Nos cours", footer_cours_gratuits: "Cours gratuits", footer_certificats: "Certificats",
    footer_contact_titre: "Contact", footer_centre_aide: "Centre d'aide",
    footer_copyright: "© 2026 JC Academy. Tous droits réservés.",
    footer_apropos_link: "À propos", footer_contact_link: "Contact",
    footer_cgu: "CGU", footer_confidentialite: "Confidentialité", footer_remboursement: "Remboursement",
  },
  en: {
    nav_accueil: "Home", nav_cours: "Courses", nav_produits: "Products",
    nav_blog: "Blog", nav_actualites: "News", nav_formateurs: "Our Instructors",
    nav_devenir_formateur: "Become an Instructor", nav_contact: "Contact",
    nav_connexion: "Log in", nav_inscription: "Sign up", nav_deconnexion: "Log out",

    hero_eyebrow: "Certifying training platform",
    hero_titre_1: "Learn new skills,",
    hero_titre_2: "earn a recognized certification.",
    hero_texte: "JC Academy guides you from your very first module to your certificate, with expert instructors, hands-on projects, and a path built for your success.",
    hero_cta_cours: "Discover courses",
    hero_cta_gratuit: "Learn for free",
    hero_badge_certificat: "Certificate awarded",
    hero_badge_diplome: "Diploma program",

    programmes_eyebrow: "Our programs",
    carte_certificat_titre: "Certificate Program",
    carte_certificat_texte: "Short, focused training to gain a specific skill and earn a recognized certificate in a few weeks.",
    carte_diplome_titre: "Diploma Program",
    carte_diplome_texte: "Comprehensive, in-depth courses led by experts, leading to a diploma that enhances your professional profile.",
    voir_programmes: "View all programs",
    explorer: "Explore →",

    formateurs_eyebrow: "Our instructors",
    actualites_eyebrow: "News",
    galerie_eyebrow: "Gallery",
    blog_eyebrow: "Blog",
    produits_eyebrow: "Digital products",
    voir_produits: "View all products",
    cta_inscription: "Sign up now",
    cta_voir_cours: "View courses",

    footer_tagline: "JC Academy is an online certifying training platform that helps you learn new skills, earn recognized certifications, and grow your career.",
    footer_apropos_titre: "About us",
    footer_mission: "Our mission", footer_carrieres: "Careers", footer_partenaires: "Partners",
    footer_plateforme_titre: "Platform",
    footer_nos_cours: "Our courses", footer_cours_gratuits: "Free courses", footer_certificats: "Certificates",
    footer_contact_titre: "Contact", footer_centre_aide: "Help center",
    footer_copyright: "© 2026 JC Academy. All rights reserved.",
    footer_apropos_link: "About", footer_contact_link: "Contact",
    footer_cgu: "Terms", footer_confidentialite: "Privacy", footer_remboursement: "Refunds",
  },
  es: {
    nav_accueil: "Inicio", nav_cours: "Cursos", nav_produits: "Productos",
    nav_blog: "Blog", nav_actualites: "Noticias", nav_formateurs: "Nuestros formadores",
    nav_devenir_formateur: "Conviértete en formador", nav_contact: "Contacto",
    nav_connexion: "Iniciar sesión", nav_inscription: "Registrarse", nav_deconnexion: "Cerrar sesión",

    hero_eyebrow: "Plataforma de formación certificante",
    hero_titre_1: "Aprende nuevas habilidades,",
    hero_titre_2: "obtén una certificación reconocida.",
    hero_texte: "JC Academy te acompaña desde el primer módulo hasta tu certificado, con formadores expertos, proyectos prácticos y un camino pensado para tu éxito.",
    hero_cta_cours: "Descubrir cursos",
    hero_cta_gratuit: "Aprende gratis",
    hero_badge_certificat: "Certificado otorgado",
    hero_badge_diplome: "Programa de diplomado",

    programmes_eyebrow: "Nuestros programas",
    carte_certificat_titre: "Programa Certificado",
    carte_certificat_texte: "Formaciones cortas y específicas para adquirir una habilidad precisa y obtener un certificado reconocido en pocas semanas.",
    carte_diplome_titre: "Programa Diplomado",
    carte_diplome_texte: "Cursos completos y profundos, guiados por expertos, que conducen a un diplomado que valora tu trayectoria profesional.",
    voir_programmes: "Ver todos los programas",
    explorer: "Explorar →",

    formateurs_eyebrow: "Nuestros formadores",
    actualites_eyebrow: "Noticias",
    galerie_eyebrow: "Galería",
    blog_eyebrow: "Blog",
    produits_eyebrow: "Productos digitales",
    voir_produits: "Ver todos los productos",
    cta_inscription: "Regístrate ahora",
    cta_voir_cours: "Ver cursos",

    footer_tagline: "JC Academy es una plataforma de formación en línea certificante que te ayuda a aprender nuevas habilidades, obtener certificaciones reconocidas y avanzar en tu carrera.",
    footer_apropos_titre: "Sobre nosotros",
    footer_mission: "Nuestra misión", footer_carrieres: "Carreras", footer_partenaires: "Socios",
    footer_plateforme_titre: "Plataforma",
    footer_nos_cours: "Nuestros cursos", footer_cours_gratuits: "Cursos gratuitos", footer_certificats: "Certificados",
    footer_contact_titre: "Contacto", footer_centre_aide: "Centro de ayuda",
    footer_copyright: "© 2026 JC Academy. Todos los derechos reservados.",
    footer_apropos_link: "Sobre nosotros", footer_contact_link: "Contacto",
    footer_cgu: "Términos", footer_confidentialite: "Privacidad", footer_remboursement: "Reembolsos",
  },
};

function getLang(){
  return localStorage.getItem('jc_lang') || 'fr';
}

function applyTranslations(lang){
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.fr;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (dict[key]) el.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    if (dict[key]) el.setAttribute('placeholder', dict[key]);
  });
  document.documentElement.setAttribute('lang', lang);
  document.querySelectorAll('.lang-switch [data-lang]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

function setLang(lang){
  if (!TRANSLATIONS[lang]) return;
  localStorage.setItem('jc_lang', lang);
  applyTranslations(lang);
}

document.addEventListener('DOMContentLoaded', () => {
  applyTranslations(getLang());
  document.querySelectorAll('.lang-switch [data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
});

window.setLang = setLang;
