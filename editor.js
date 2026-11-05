// editor.js — Éditeur de texte riche de JC Academy (basé sur Quill 2).
// Nécessite rich.js (chargé avant).
// Utilisation :
//   const ed = await JCEditor.create(document.getElementById('monEditeur'), {
//     placeholder: 'Écrivez ici...',
//     uploadImage: async (file) => 'https://.../image.jpg',   // facultatif
//     minHeight: 320
//   });
//   ed.setHTML(html); ed.getHTML(); ed.getText(); ed.isEmpty(); ed.focus();
(function () {
  const QUILL_VERSION = '2.0.3';
  const CDN = 'https://cdn.jsdelivr.net/npm/quill@' + QUILL_VERSION + '/dist/';
  let loading = null;

  function loadQuill() {
    if (window.Quill) return Promise.resolve(window.Quill);
    if (loading) return loading;
    loading = new Promise((resolve, reject) => {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = CDN + 'quill.snow.css';
      document.head.appendChild(css);
      const s = document.createElement('script');
      s.src = CDN + 'quill.js';
      s.onload = () => window.Quill ? resolve(window.Quill) : reject(new Error('Quill indisponible'));
      s.onerror = () => { loading = null; reject(new Error("Impossible de charger l'éditeur. Vérifiez votre connexion.")); };
      document.head.appendChild(s);
    });
    injectCss();
    return loading;
  }

  function injectCss() {
    if (document.getElementById('jc-editor-css')) return;
    const st = document.createElement('style');
    st.id = 'jc-editor-css';
    st.textContent = `
.jced{border:1.5px solid var(--border,#E4E9F2);border-radius:12px;background:#fff;position:relative;}
.jced:focus-within{border-color:var(--navy,#0C2C74);box-shadow:0 0 0 3px rgba(12,44,116,.08);}
.jced .ql-toolbar.ql-snow{border:none;border-bottom:1px solid var(--border,#E4E9F2);background:var(--surface,#F7F9FC);border-radius:12px 12px 0 0;padding:8px;position:sticky;top:0;z-index:5;display:flex;flex-wrap:wrap;gap:2px 4px;font-family:Inter,sans-serif;}
.jced .ql-toolbar.ql-snow .ql-formats{margin-right:6px;display:inline-flex;align-items:center;flex-wrap:wrap;}
.jced .ql-toolbar.ql-snow button{width:32px;height:32px;padding:6px;border-radius:7px;}
.jced .ql-toolbar.ql-snow button:hover,.jced .ql-toolbar.ql-snow button.ql-active{background:var(--navy-soft,#E7ECF7);}
.jced .ql-snow.ql-toolbar button:hover .ql-stroke,.jced .ql-snow.ql-toolbar button.ql-active .ql-stroke,.jced .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke,.jced .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke{stroke:var(--navy,#0C2C74);}
.jced .ql-snow.ql-toolbar button:hover .ql-fill,.jced .ql-snow.ql-toolbar button.ql-active .ql-fill,.jced .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-fill{fill:var(--navy,#0C2C74);}
.jced .ql-snow.ql-toolbar button:hover,.jced .ql-snow.ql-toolbar button.ql-active,.jced .ql-snow.ql-toolbar .ql-picker-label.ql-active,.jced .ql-snow.ql-toolbar .ql-picker-item.ql-selected{color:var(--navy,#0C2C74);}
.jced .ql-snow .ql-picker.ql-header{width:118px;}
.jced .ql-snow .ql-picker.ql-header .ql-picker-label::before,.jced .ql-snow .ql-picker.ql-header .ql-picker-item::before{content:'Paragraphe';}
.jced .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,.jced .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before{content:'Titre';}
.jced .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,.jced .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before{content:'Sous-titre';}
.jced .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,.jced .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="4"]::before{content:'Petit titre';}
.jced .ql-container.ql-snow{border:none;font-family:Inter,sans-serif;font-size:15.5px;}
.jced .ql-editor{line-height:1.75;color:var(--text,#14213D);padding:18px 20px;}
.jced .ql-editor.ql-blank::before{color:#9AA6BC;font-style:normal;left:20px;right:20px;}
.jced .ql-editor h2,.jced .ql-editor h3,.jced .ql-editor h4{font-family:Sora,sans-serif;color:var(--navy-dark,#071D52);margin:1em 0 .4em;}
.jced .ql-editor h2{font-size:1.45em;}.jced .ql-editor h3{font-size:1.2em;}.jced .ql-editor h4{font-size:1.05em;}
.jced .ql-editor p{margin:0 0 .6em;}
.jced .ql-editor blockquote{border-left:4px solid var(--gold,#F5A800);background:var(--surface,#F7F9FC);padding:10px 16px;margin:.8em 0;border-radius:0 10px 10px 0;color:var(--text-muted,#5B6B85);font-style:italic;}
.jced .ql-editor img{max-width:100%;border-radius:10px;margin:8px 0;}
.jced .ql-editor a{color:var(--navy,#0C2C74);}
.jced .ql-editor .ql-code-block-container{background:#0B1B3F;color:#E7ECF7;border-radius:10px;padding:12px 14px;}
.jced .ql-editor .ql-video{width:100%;aspect-ratio:16/9;height:auto;border-radius:12px;}
.jced-foot{font-family:Inter,sans-serif;display:flex;justify-content:space-between;align-items:center;gap:10px;padding:7px 14px;border-top:1px solid var(--border,#E4E9F2);font-size:12px;color:var(--text-muted,#5B6B85);background:var(--surface,#F7F9FC);border-radius:0 0 12px 12px;flex-wrap:wrap;}
.jced-status{color:var(--navy,#0C2C74);font-weight:600;}
.jced-status.err{color:#C0392B;}
.jced.jced-full{position:fixed;inset:0;z-index:9000;border-radius:0;display:flex;flex-direction:column;}
.jced.jced-full .ql-toolbar.ql-snow{border-radius:0;}
.jced.jced-full .ql-container{flex:1;overflow-y:auto;}
.jced.jced-full .ql-editor{max-width:820px;margin:0 auto;min-height:100%;}
.jced.jced-full .jced-foot{border-radius:0;}
body.jced-noscroll{overflow:hidden;}
.jced .ql-snow .ql-tooltip{border-radius:10px;box-shadow:0 10px 30px rgba(12,44,116,.18);border-color:var(--border,#E4E9F2);color:var(--text,#14213D);z-index:20;font-family:Inter,sans-serif;}
.jced .ql-snow .ql-tooltip::before{content:'Lien :';}
.jced .ql-snow .ql-tooltip a.ql-action::after{content:'Modifier';}
.jced .ql-snow .ql-tooltip a.ql-remove::before{content:'Retirer';}
.jced .ql-snow .ql-tooltip.ql-editing a.ql-action::after{content:'Enregistrer';}
.jced .ql-snow .ql-tooltip[data-mode=link]::before{content:'Adresse du lien :';}
.jced .ql-snow .ql-tooltip[data-mode=formula]::before{content:'Formule :';}
.jced .ql-snow .ql-tooltip[data-mode=video]::before{content:'Vidéo :';}
.jced .ql-snow .ql-tooltip a{color:var(--navy,#0C2C74);}
.jced .jced-btn svg{width:18px;height:18px;}
@media (max-width:600px){
  .jced .ql-toolbar.ql-snow button{width:30px;height:30px;padding:5px;}
  .jced .ql-snow .ql-picker.ql-header{width:104px;}
  .jced .ql-editor{padding:14px;}
}`;
    document.head.appendChild(st);
  }

  const TITLES = {
    'ql-bold': 'Gras', 'ql-italic': 'Italique', 'ql-underline': 'Souligné', 'ql-strike': 'Barré',
    'ql-blockquote': 'Citation', 'ql-code-block': 'Bloc de code', 'ql-link': 'Lien',
    'ql-image': 'Insérer une image', 'ql-video': 'Insérer une vidéo YouTube ou Vimeo',
    'ql-clean': 'Effacer la mise en forme', 'ql-header': 'Style du texte', 'ql-color': 'Couleur du texte',
    'ql-background': 'Surligner', 'ql-align': 'Alignement', 'jced-undo': 'Annuler', 'jced-redo': 'Rétablir',
    'jced-hr': 'Ligne de séparation', 'jced-full': 'Plein écran'
  };
  const LIST_TITLES = { ordered: 'Liste numérotée', bullet: 'Liste à puces' };
  const INDENT_TITLES = { '-1': 'Diminuer le retrait', '+1': 'Augmenter le retrait' };
  const SCRIPT_TITLES = { sub: 'Indice', super: 'Exposant' };

  const ICONS = {
    undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>',
    redo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/></svg>',
    hr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h18"/><path d="M8 6h8M8 18h8" opacity=".35"/></svg>',
    full: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3v5M21 8V3h-5M16 21h5v-5M3 16v5h5"/></svg>'
  };

  const PALETTE = ['#14213D', '#0C2C74', '#071D52', '#F5A800', '#B57200', '#1D9A6C', '#C0392B', '#5B6B85', '#FFFFFF',
    '#E7ECF7', '#FFF3D6', '#E4F7EE', '#FBEAEA'];

  // Quill 2 : les listes sont stockées en <ol><li data-list="bullet|ordered">.
  // On les remet en vraies <ul>/<ol> et on retire les éléments d'interface.
  function normalizeQuillHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('.ql-ui').forEach(n => n.remove());
    doc.querySelectorAll('ol').forEach(ol => {
      const items = [...ol.children];
      if (!items.some(li => li.hasAttribute('data-list'))) return;
      let current = null, currentType = null;
      const frag = doc.createDocumentFragment();
      items.forEach(li => {
        const t = li.getAttribute('data-list') === 'ordered' ? 'OL' : 'UL';
        if (t !== currentType) { current = doc.createElement(t); currentType = t; frag.appendChild(current); }
        li.removeAttribute('data-list');
        current.appendChild(li);
      });
      ol.replaceWith(frag);
    });
    doc.querySelectorAll('.ql-code-block-container').forEach(box => {
      const pre = doc.createElement('pre');
      pre.textContent = [...box.querySelectorAll('.ql-code-block')].map(l => l.textContent).join('\n');
      box.replaceWith(pre);
    });
    doc.querySelectorAll('p').forEach(p => {
      if (p.innerHTML === '<br>' && !p.nextElementSibling) p.remove();
    });
    return doc.body.innerHTML;
  }

  async function create(container, opts) {
    opts = opts || {};
    const Quill = await loadQuill();
    if (!Quill.__jcHr) {
      const BlockEmbed = Quill.import('blots/block/embed');
      class Divider extends BlockEmbed {}
      Divider.blotName = 'divider';
      Divider.tagName = 'HR';
      Quill.register(Divider);
      Quill.__jcHr = true;
    }

    container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'jced';
    const host = document.createElement('div');
    wrap.appendChild(host);
    const foot = document.createElement('div');
    foot.className = 'jced-foot';
    foot.innerHTML = '<span class="jced-count">0 mot</span><span class="jced-status"></span>';
    wrap.appendChild(foot);
    container.appendChild(wrap);

    const simple = opts.simple === true;
    const toolbar = simple ? [
      [{ header: [2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'link'],
      ['clean']
    ] : [
      ['jced-undo', 'jced-redo'],
      [{ header: [2, 3, 4, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: PALETTE }, { background: PALETTE }],
      [{ align: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ['blockquote', 'code-block', 'jced-hr'],
      [{ script: 'sub' }, { script: 'super' }],
      ['link'].concat(opts.uploadImage ? ['image'] : []).concat(['video']),
      ['clean', 'jced-full']
    ];

    const status = foot.querySelector('.jced-status');
    function setStatus(text, isErr) { status.textContent = text || ''; status.classList.toggle('err', !!isErr); }

    const quill = new Quill(host, {
      theme: 'snow',
      placeholder: opts.placeholder || 'Commencez à écrire...',
      modules: {
        history: { delay: 800, maxStack: 200, userOnly: true },
        clipboard: {},
        toolbar: {
          container: toolbar,
          handlers: {
            'jced-undo': () => quill.history.undo(),
            'jced-redo': () => quill.history.redo(),
            'jced-hr': () => {
              const r = quill.getSelection(true);
              quill.insertEmbed(r.index, 'divider', true, 'user');
              quill.setSelection(r.index + 1, 0, 'silent');
            },
            'jced-full': () => {
              const on = !wrap.classList.contains('jced-full');
              wrap.classList.toggle('jced-full', on);
              document.body.classList.toggle('jced-noscroll', on);
              quill.focus();
            },
            image: () => pickImage(),
            video: async () => {
              const range = quill.getSelection(true);
              const ask = typeof window.showPrompt === 'function' ? window.showPrompt : null;
              if (!ask) return;
              const url = await ask('Adresse de la vidéo YouTube ou Vimeo :');
              if (!url) return;
              const embed = window.JCRich.videoEmbedUrl(url);
              if (!embed) { setStatus('Adresse de vidéo non reconnue (YouTube ou Vimeo uniquement).', true); return; }
              quill.insertEmbed(range.index, 'video', embed, 'user');
              quill.setSelection(range.index + 1, 0, 'silent');
              setStatus('Vidéo insérée.');
            }
          }
        }
      }
    });

    // Boutons personnalisés : icônes + infobulles en français
    const tb = wrap.querySelector('.ql-toolbar');
    [['jced-undo', ICONS.undo], ['jced-redo', ICONS.redo], ['jced-hr', ICONS.hr], ['jced-full', ICONS.full]].forEach(([k, svg]) => {
      const b = tb.querySelector('.ql-' + k);
      if (b) { b.innerHTML = svg; b.classList.add('jced-btn'); }
    });
    tb.querySelectorAll('button, .ql-picker').forEach(el => {
      const k = [...el.classList].find(c => c.startsWith('ql-') && c !== 'ql-picker' && c !== 'ql-active');
      const name = k ? k.replace(/^ql-/, '') : '';
      let title = TITLES[k] || TITLES[name];
      if (name === 'list') title = LIST_TITLES[el.value];
      if (name === 'indent') title = INDENT_TITLES[el.value];
      if (name === 'script') title = SCRIPT_TITLES[el.value];
      if (title) { el.setAttribute('title', title); el.setAttribute('aria-label', title); }
    });

    // Images : envoi vers Supabase Storage (ou glisser / coller)
    async function uploadAndInsert(file) {
      if (!opts.uploadImage) return;
      if (!file || !file.type.startsWith('image/')) { setStatus("Ce fichier n'est pas une image.", true); return; }
      if (file.size > 5 * 1024 * 1024) { setStatus('Image trop lourde (5 Mo maximum).', true); return; }
      const range = quill.getSelection(true) || { index: quill.getLength() };
      setStatus("Envoi de l'image...");
      try {
        const url = await opts.uploadImage(file);
        if (!url) throw new Error('adresse manquante');
        quill.insertEmbed(range.index, 'image', url, 'user');
        quill.setSelection(range.index + 1, 0, 'silent');
        setStatus('Image insérée.');
      } catch (e) {
        setStatus("Erreur lors de l'envoi de l'image : " + (e && e.message ? e.message : e), true);
      }
    }
    function pickImage() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = () => { if (input.files[0]) uploadAndInsert(input.files[0]); };
      input.click();
    }
    // Images collées ou déposées : on les envoie au stockage au lieu de les garder en base64
    quill.root.addEventListener('paste', (e) => {
      const files = [...(e.clipboardData && e.clipboardData.files || [])].filter(f => f.type.startsWith('image/'));
      if (!files.length) return;
      e.preventDefault(); e.stopPropagation();
      if (opts.uploadImage) files.forEach(uploadAndInsert);
    }, true);
    quill.root.addEventListener('drop', (e) => {
      const files = [...(e.dataTransfer && e.dataTransfer.files || [])].filter(f => f.type.startsWith('image/'));
      if (!files.length) return;
      e.preventDefault(); e.stopPropagation();
      if (opts.uploadImage) files.forEach(uploadAndInsert);
    }, true);
    // Les images en base64 (copiées depuis Word, etc.) sont retirées
    quill.clipboard.addMatcher('IMG', (node, delta) => {
      const src = node.getAttribute('src') || '';
      return /^https?:\/\//i.test(src) ? delta : new (Quill.import('delta'))();
    });

    if (opts.minHeight) quill.root.style.minHeight = opts.minHeight + 'px';

    const countEl = foot.querySelector('.jced-count');
    function updateCount() {
      const words = (quill.getText().trim().match(/\S+/g) || []).length;
      countEl.textContent = words + (words > 1 ? ' mots' : ' mot');
    }
    quill.on('text-change', () => { updateCount(); if (typeof opts.onChange === 'function') opts.onChange(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && wrap.classList.contains('jced-full')) {
        wrap.classList.remove('jced-full'); document.body.classList.remove('jced-noscroll');
      }
    });

    const api = {
      quill,
      setHTML(html) {
        const clean = window.JCRich.toEditorHtml(html || '');
        quill.setContents([], 'silent');
        if (clean) quill.clipboard.dangerouslyPasteHTML(0, clean, 'silent');
        quill.history.clear();
        setStatus('');
        updateCount();
      },
      getHTML() {
        if (api.isEmpty()) return '';
        return window.JCRich.sanitize(normalizeQuillHtml(quill.root.innerHTML)).trim();
      },
      getText() { return quill.getText().trim(); },
      isEmpty() {
        if (quill.getText().trim().length) return false;
        return !quill.root.querySelector('img, iframe, hr');
      },
      focus() { quill.focus(); },
      setStatus
    };
    if (opts.html) api.setHTML(opts.html);
    updateCount();
    return api;
  }

  window.JCEditor = { create, load: loadQuill };
})();
