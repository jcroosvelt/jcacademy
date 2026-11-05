// pwa.js — Application installable (PWA) de JC Academy.
// 1) Enregistre le service worker (sw.js).
// 2) Propose « Installer l'application » :
//    - Android / Chrome / Edge : bandeau avec bouton Installer (fenêtre native du navigateur) ;
//    - iPhone / iPad (Safari) : explication « Partager puis Sur l'écran d'accueil ».
//    Le bandeau ne revient pas pendant 14 jours si on le ferme, et jamais une
//    fois l'application installée.
(function () {
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function () { /* sans gravité */ });
    });
  }

  var KEY = 'jc_install_dismissed_at';
  var WAIT_DAYS = 14;
  var deferredPrompt = null;

  function isStandalone() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  }
  function recentlyDismissed() {
    try {
      var t = Number(localStorage.getItem(KEY) || 0);
      return t && (Date.now() - t) < WAIT_DAYS * 86400000;
    } catch (_e) { return false; }
  }
  function remember() { try { localStorage.setItem(KEY, String(Date.now())); } catch (_e) {} }
  function isIos() {
    var ua = navigator.userAgent || '';
    return /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }
  function isIosSafari() { return isIos() && !/crios|fxios|edgios/i.test(navigator.userAgent || ''); }
  // Pas de bandeau sur les pages de connexion / paiement
  function quietPage() {
    return /\/(checkout|login|register|auth-callback|reinitialiser-mot-de-passe|mot-de-passe-oublie|confirmer-inscription|verifiez-votre-email|completer-profil|offline)\.html$/.test(location.pathname);
  }

  function injectCss() {
    if (document.getElementById('jc-install-css')) return;
    var st = document.createElement('style');
    st.id = 'jc-install-css';
    st.textContent =
      '.jc-install{position:fixed;left:16px;right:16px;bottom:16px;z-index:450;max-width:440px;margin:0 auto;background:#fff;border:1px solid #E4E9F2;border-radius:18px;box-shadow:0 18px 40px rgba(12,44,116,.22);padding:14px 14px 14px 16px;display:flex;align-items:center;gap:12px;font-family:Inter,system-ui,sans-serif;color:#14213D;transform:translateY(140%);transition:transform .35s ease;}' +
      '.jc-install.show{transform:none;}' +
      '.jc-install img{width:46px;height:46px;border-radius:12px;flex:0 0 auto;background:#fff;border:1px solid #E4E9F2;}' +
      '.jc-install .txt{flex:1;min-width:0;}' +
      '.jc-install b{display:block;font-size:14.5px;color:#071D52;}' +
      '.jc-install span{display:block;font-size:12.5px;color:#5B6B85;line-height:1.4;margin-top:2px;}' +
      '.jc-install .go{background:#0C2C74;color:#fff;border:none;border-radius:10px;padding:10px 14px;font-weight:700;font-size:13.5px;cursor:pointer;flex:0 0 auto;font-family:inherit;}' +
      '.jc-install .go:hover{background:#071D52;}' +
      '.jc-install .x{background:none;border:none;color:#5B6B85;font-size:22px;line-height:1;cursor:pointer;padding:4px 6px;flex:0 0 auto;}';
    document.head.appendChild(st);
  }

  function cookieBannerVisible() {
    var c = document.querySelector('.cookie-banner');
    return !!(c && c.offsetParent !== null && getComputedStyle(c).display !== 'none');
  }

  function showBanner(mode) {
    if (isStandalone() || recentlyDismissed() || quietPage() || document.getElementById('jcInstall')) return;
    if (cookieBannerVisible()) { setTimeout(function () { showBanner(mode); }, 4000); return; }
    injectCss();
    var el = document.createElement('div');
    el.className = 'jc-install';
    el.id = 'jcInstall';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', "Installer l'application JC Academy");
    var sub = mode === 'ios'
      ? 'Touchez Partager, puis « Sur l’écran d’accueil ».'
      : 'Accès rapide depuis votre écran d’accueil.';
    el.innerHTML = '<img src="/icon-192.png" alt="">' +
      '<div class="txt"><b>Installer l’app JC Academy</b><span>' + sub + '</span></div>' +
      (mode === 'ios' ? '' : '<button type="button" class="go">Installer</button>') +
      '<button type="button" class="x" aria-label="Fermer">&times;</button>';
    document.body.appendChild(el);
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('show'); }); });
    el.querySelector('.x').addEventListener('click', function () { remember(); hide(el); });
    var go = el.querySelector('.go');
    if (go) go.addEventListener('click', function () {
      if (!deferredPrompt) { hide(el); return; }
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (choice) {
        if (choice && choice.outcome !== 'accepted') remember();
        deferredPrompt = null;
        hide(el);
      });
    });
  }
  function hide(el) {
    el.classList.remove('show');
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 400);
  }

  // Android / Chrome / Edge : le navigateur signale que l'installation est possible
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    setTimeout(function () { showBanner('native'); }, 3000);
  });
  window.addEventListener('appinstalled', function () {
    deferredPrompt = null;
    remember();
    var el = document.getElementById('jcInstall');
    if (el) hide(el);
  });
  // iPhone / iPad : pas d'installation automatique, on explique la marche à suivre
  if (isIosSafari() && !isStandalone()) {
    window.addEventListener('load', function () { setTimeout(function () { showBanner('ios'); }, 4000); });
  }

  // Pour un futur bouton « Installer l'application » dans une page : JCInstall.prompt()
  window.JCInstall = {
    available: function () { return !!deferredPrompt; },
    prompt: function () {
      if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt.userChoice.then(function () { deferredPrompt = null; }); return true; }
      if (isIos()) { try { localStorage.removeItem(KEY); } catch (_e) {} showBanner('ios'); return true; }
      return false;
    }
  };
})();
