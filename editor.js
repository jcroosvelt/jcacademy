// editor.js — Éditeur de texte complet de JC Academy (basé sur Quill 2), présenté comme un traitement de texte :
// onglets Accueil / Insertion / Mise en page / Révision / Affichage, page blanche, zoom, compteur, recherche.
// Nécessite rich.js (chargé avant). Fonctionne pour les articles, le blog, la présentation des cours et les leçons.
// Utilisation :
//   const ed = await JCEditor.create(document.getElementById('monEditeur'), {
//     placeholder: 'Écrivez ici...',
//     uploadImage: async (file) => 'https://.../image.jpg',   // facultatif : active le bouton Image
//     minHeight: 320, onChange: () => {}, onSave: () => {}     // onSave facultatif : affiche « Enregistrer »
//   });
//   ed.setHTML(html); ed.getHTML(); ed.getText(); ed.isEmpty(); ed.focus(); ed.markSaved();
(function () {
  const QUILL_VERSION = '2.0.3';
  const CDN = 'https://cdn.jsdelivr.net/npm/quill@' + QUILL_VERSION + '/dist/';
  let loading = null;

  function loadQuill() {
    if (window.Quill) return Promise.resolve(window.Quill);
    if (loading) return loading;
    const base = window.JC_QUILL_BASE || CDN;
    loading = new Promise((resolve, reject) => {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = base + 'quill.snow.css';
      document.head.appendChild(css);
      const s = document.createElement('script');
      s.src = base + 'quill.js';
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
.jced{--jced-pad:64px;--jced-w:816px;border:1.5px solid var(--border,#E4E9F2);border-radius:12px;background:#fff;position:relative;font-family:Inter,sans-serif;color:var(--text,#14213D);}
.jced *{box-sizing:border-box;}
.jced:focus-within{border-color:var(--navy,#0C2C74);}
.jced-tabs{display:flex;align-items:center;gap:2px;padding:0 8px;background:#fff;border-bottom:1px solid var(--border,#E4E9F2);overflow-x:auto;border-radius:12px 12px 0 0;scrollbar-width:none;}
.jced-tabs::-webkit-scrollbar,.jced-ribbon::-webkit-scrollbar{display:none;}
.jced-tab{padding:11px 14px;font:600 13px Inter,sans-serif;color:var(--text-muted,#5B6B85);border:none;background:none;border-bottom:3px solid transparent;cursor:pointer;white-space:nowrap;flex:0 0 auto;}
.jced-tab:hover{color:var(--navy,#0C2C74);}
.jced-tab.on{color:var(--navy,#0C2C74);border-bottom-color:var(--navy,#0C2C74);}
.jced-grow{flex:1;min-width:8px;}
.jced-status{font-size:12px;color:var(--text-muted,#5B6B85);white-space:nowrap;padding:0 8px;flex:0 0 auto;}
.jced-status.err{color:#C0392B;font-weight:600;}
.jced-save{flex:0 0 auto;border:none;background:var(--gold,#F5A800);color:#071D52;font:700 13px Inter,sans-serif;padding:8px 14px;border-radius:9px;cursor:pointer;margin:4px 4px 4px 0;}
.jced-ribbon{background:var(--surface,#F7F9FC);border-bottom:1px solid var(--border,#E4E9F2);overflow-x:auto;scrollbar-width:none;position:relative;}
.jced-panel{display:none;align-items:center;flex-wrap:wrap;row-gap:6px;padding:8px 6px;min-width:0;}
.jced-panel.on{display:flex;}
.jced-g{display:flex;align-items:center;gap:2px;padding:0 8px;border-right:1px solid var(--border,#E4E9F2);}
.jced-g:last-child{border-right:none;}
.jced-b{width:34px;height:34px;border-radius:8px;border:none;background:none;color:#33425E;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex:0 0 auto;padding:0;position:relative;font:700 13px Inter,sans-serif;}
.jced-b:hover{background:var(--navy-soft,#E7ECF7);}
.jced-b.on{background:var(--navy-soft,#E7ECF7);color:var(--navy,#0C2C74);}
.jced-b:disabled{opacity:.35;cursor:default;background:none;}
.jced-b svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;pointer-events:none;}
.jced-b .jced-bar{position:absolute;left:8px;right:8px;bottom:4px;height:3px;border-radius:2px;background:#14213D;}
.jced-bl{flex-direction:column;height:58px;width:auto;min-width:66px;padding:5px 8px;gap:4px;font:600 11px Inter,sans-serif;line-height:1.15;text-align:center;}
.jced-bl svg{width:21px;height:21px;}
.jced-chip{height:32px;padding:0 11px;border:1px solid var(--border,#E4E9F2);border-radius:8px;background:#fff;color:#33425E;font:600 12px Inter,sans-serif;cursor:pointer;white-space:nowrap;flex:0 0 auto;}
.jced-chip:hover:not(:disabled){background:var(--navy-soft,#E7ECF7);}
.jced-chip:disabled{opacity:.4;cursor:default;}
.jced-sel{height:34px;border:1px solid var(--border,#E4E9F2);border-radius:8px;background:#fff;font:500 13px Inter,sans-serif;padding:0 6px;color:var(--text,#14213D);max-width:150px;cursor:pointer;flex:0 0 auto;}
.jced select.jced-sel{width:auto;min-width:0;height:34px;padding:0 24px 0 8px;margin:0;border:1px solid var(--border,#E4E9F2);border-radius:8px;background-color:#fff;color:var(--text,#14213D);font:500 13px Inter,sans-serif;max-width:175px;line-height:normal;box-shadow:none;}
.jced select.jced-sel:focus{outline:none;border-color:var(--navy,#0C2C74);box-shadow:none;}
.jced .jced-find label{display:flex;margin:0;font-weight:500;font-size:12px;color:var(--text-muted,#5B6B85);}
.jced .jced-find input[type=text]{width:100%;height:34px;padding:0 10px;margin:0;box-shadow:none;}
.jced input[type=color]{width:34px;height:30px;padding:0;border:none;background:none;box-shadow:none;}
.jced-lbl{font:600 11px Inter,sans-serif;color:var(--text-muted,#5B6B85);margin-right:4px;white-space:nowrap;}
.jced-pop{position:absolute;z-index:40;background:#fff;border:1px solid var(--border,#E4E9F2);border-radius:12px;box-shadow:0 14px 40px rgba(12,44,116,.22);padding:12px;font-family:Inter,sans-serif;}
.jced-sw{display:grid;grid-template-columns:repeat(8,26px);gap:6px;}
.jced-sw button{width:26px;height:26px;border-radius:6px;border:1px solid rgba(0,0,0,.14);cursor:pointer;padding:0;}
.jced-sw button:hover{transform:scale(1.12);}
.jced-pop .jced-row{display:flex;gap:8px;align-items:center;margin-top:10px;font-size:12.5px;}
.jced-pop .jced-row button{border:1px solid var(--border,#E4E9F2);background:#fff;border-radius:8px;padding:6px 10px;font:600 12px Inter,sans-serif;cursor:pointer;color:var(--navy,#0C2C74);}
.jced-pop input[type=color]{width:34px;height:30px;border:none;padding:0;background:none;cursor:pointer;}
.jced-grid{display:grid;grid-template-columns:repeat(8,22px);gap:3px;}
.jced-grid span{width:22px;height:22px;border:1px solid #C3D1EC;border-radius:3px;background:#fff;cursor:pointer;}
.jced-grid span.hl{background:#C9D8F5;border-color:var(--navy,#0C2C74);}
.jced-glabel{margin-top:8px;font-size:12.5px;font-weight:600;color:var(--navy,#0C2C74);text-align:center;}
.jced-chars{display:grid;grid-template-columns:repeat(10,32px);gap:3px;max-height:230px;overflow-y:auto;}
.jced-chars button{width:32px;height:32px;border:1px solid transparent;background:#F7F9FC;border-radius:6px;cursor:pointer;font:500 16px Inter,sans-serif;color:#14213D;}
.jced-chars button:hover{background:var(--navy-soft,#E7ECF7);border-color:var(--navy,#0C2C74);}
.jced-menu button{display:block;width:100%;text-align:left;border:none;background:none;padding:8px 12px;font:500 13px Inter,sans-serif;cursor:pointer;border-radius:7px;color:var(--text,#14213D);white-space:nowrap;}
.jced-menu button:hover,.jced-menu button.on{background:var(--navy-soft,#E7ECF7);color:var(--navy,#0C2C74);}
.jced-find{display:flex;flex-direction:column;gap:8px;min-width:280px;}
.jced-find input[type=text]{height:34px;border:1.5px solid var(--border,#E4E9F2);border-radius:8px;padding:0 10px;font:500 13px Inter,sans-serif;width:100%;}
.jced-find input[type=text]:focus{outline:none;border-color:var(--navy,#0C2C74);}
.jced-find .jced-row{margin-top:0;flex-wrap:wrap;}
.jced-find label{font-size:12px;color:var(--text-muted,#5B6B85);display:flex;gap:6px;align-items:center;}
.jced-count-t{display:grid;grid-template-columns:auto auto;gap:6px 22px;font-size:13px;min-width:230px;}
.jced-count-t b{text-align:right;color:var(--navy,#0C2C74);}
.jced-canvas{background:#D9E2F2;padding:18px 12px;overflow:auto;max-height:var(--jced-h,72vh);min-height:260px;position:relative;}
.jced-page{background:#fff;margin:0 auto;width:min(100%,var(--jced-w));box-shadow:0 2px 14px rgba(12,44,116,.18);border-radius:2px;position:relative;}
.jced-read{padding:var(--jced-pad);}
.jced .ql-container.ql-snow{border:none;font-family:Inter,sans-serif;font-size:15.5px;}
.jced .ql-editor{line-height:1.75;color:var(--text,#14213D);padding:var(--jced-pad);overflow:visible;}
.jced.jced-guides .ql-editor{background-image:repeating-linear-gradient(to bottom,transparent 0,transparent 1121px,#CBD6EB 1121px,#CBD6EB 1123px);}
.jced .ql-editor.ql-blank::before{color:#9AA6BC;font-style:normal;left:var(--jced-pad);right:var(--jced-pad);}
.jced .ql-editor h1,.jced .ql-editor h2,.jced .ql-editor h3,.jced .ql-editor h4{font-family:Sora,sans-serif;color:var(--navy-dark,#071D52);margin:1em 0 .4em;line-height:1.3;}
.jced .ql-editor h2{font-size:1.45em;}.jced .ql-editor h3{font-size:1.2em;}.jced .ql-editor h4{font-size:1.05em;}
.jced .ql-editor p{margin:0 0 .6em;}
.jced .ql-editor blockquote{border-left:4px solid var(--gold,#F5A800);background:var(--surface,#F7F9FC);padding:10px 16px;margin:.8em 0;border-radius:0 10px 10px 0;color:var(--text-muted,#5B6B85);font-style:italic;}
.jced .ql-editor img{max-width:100%;border-radius:10px;margin:8px 0;}
.jced .ql-editor a{color:var(--navy,#0C2C74);}
.jced .ql-editor .ql-code-block-container{background:#0B1B3F;color:#E7ECF7;border-radius:10px;padding:12px 14px;}
.jced .ql-editor .ql-video{width:100%;aspect-ratio:16/9;height:auto;border-radius:12px;}
.jced .ql-editor hr{border:none;border-top:1px solid var(--border,#CBD5E8);margin:1.6em 0;}
.jced .ql-editor table{border-collapse:collapse;width:100%;margin:1em 0;table-layout:fixed;}
.jced .ql-editor td,.jced .ql-editor th{border:1px solid #B7C4DE;padding:7px 10px;vertical-align:top;min-width:50px;}
.jced .ql-editor td p{margin:0;}
.jced .ql-editor li[data-list=checked]>.ql-ui::before,.jced .ql-editor li[data-list=unchecked]>.ql-ui::before{cursor:pointer;}
.jced .jced-hl{background:#FFE08A;}
.jced-foot{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:6px 14px;border-top:1px solid var(--border,#E4E9F2);font-size:12px;color:var(--text-muted,#5B6B85);background:var(--surface,#F7F9FC);border-radius:0 0 12px 12px;flex-wrap:wrap;}
.jced-foot .jced-fl{display:flex;gap:16px;flex-wrap:wrap;}
.jced-foot .jced-fr{display:flex;align-items:center;gap:6px;}
.jced-foot button{border:none;background:none;cursor:pointer;color:#33425E;width:24px;height:24px;border-radius:6px;font:700 15px Inter,sans-serif;line-height:1;padding:0;}
.jced-foot button:hover{background:var(--navy-soft,#E7ECF7);}
.jced.jced-full{position:fixed;inset:0;z-index:9000;border-radius:0;display:flex;flex-direction:column;border:none;}
.jced.jced-full .jced-tabs,.jced.jced-full .jced-foot{border-radius:0;}
.jced.jced-full .jced-canvas{flex:1;max-height:none;}
.jced.jced-full .ql-editor{min-height:1123px;}
body.jced-noscroll{overflow:hidden;}
.jced-linkpop{display:flex;gap:6px;align-items:center;font-size:12.5px;padding:8px 10px;}
.jced-linkpop a{color:var(--navy,#0C2C74);max-width:210px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.jced-linkpop button{border:1px solid var(--border,#E4E9F2);background:#fff;border-radius:7px;padding:4px 9px;font:600 12px Inter,sans-serif;cursor:pointer;color:var(--navy,#0C2C74);}
@media (max-width:720px){
  .jced{--jced-pad:16px;}
  .jced-canvas{padding:10px 6px;}
  .jced .ql-editor{padding:16px !important;}
  .jced.jced-guides .ql-editor{background-image:none;}
}`;
    document.head.appendChild(st);
  }

  // ------------------------------------------------------------------ icônes
  const I = (d) => '<svg viewBox="0 0 24 24">' + d + '</svg>';
  const ICON = {
    undo: I('<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>'),
    redo: I('<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>'),
    bold: I('<path d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z"/>'),
    italic: I('<path d="M19 4h-9M14 20H5M15 4 9 20"/>'),
    underline: I('<path d="M6 4v6a6 6 0 0 0 12 0V4M4 20h16"/>'),
    strike: I('<path d="M16 4H9a3 3 0 0 0-2.83 4M14 12a4 4 0 0 1 0 8H6M4 12h16"/>'),
    sub: I('<path d="m4 5 8 8M12 5l-8 8"/><path d="M20 19h-4c0-1.5.44-2 1.5-2.5S20 15.33 20 14c0-.47-.17-.93-.48-1.29a2.11 2.11 0 0 0-2.62-.44c-.42.24-.74.62-.9 1.07"/>'),
    sup: I('<path d="m4 19 8-8M12 19 4 11"/><path d="M20 12h-4c0-1.5.44-2 1.5-2.5S20 8.33 20 7c0-.47-.17-.93-.48-1.29a2.1 2.1 0 0 0-2.62-.44c-.42.24-.74.62-.9 1.07"/>'),
    sizeUp: I('<path d="m3 17 4-10 4 10M4.5 13h5"/><path d="M17 8v6M14 11h6"/>'),
    sizeDown: I('<path d="m3 17 4-10 4 10M4.5 13h5"/><path d="M14 11h6"/>'),
    color: I('<path d="m6 16 6-12 6 12M8 12h8"/>'),
    mark: I('<path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>'),
    eraser: I('<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>'),
    left: I('<path d="M21 6H3M15 12H3M17 18H3"/>'),
    center: I('<path d="M21 6H3M17 12H7M19 18H5"/>'),
    right: I('<path d="M21 6H3M21 12H9M21 18H7"/>'),
    justify: I('<path d="M3 6h18M3 12h18M3 18h18"/>'),
    ul: I('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'),
    ol: I('<path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>'),
    check: I('<path d="m3 17 2 2 4-4M3 7l2 2 4-4M13 6h8M13 12h8M13 18h8"/>'),
    outdent: I('<path d="M21 6H11M21 12H11M21 18H11M7 8l-4 4 4 4"/>'),
    indent: I('<path d="M21 6H11M21 12H11M21 18H11M3 8l4 4-4 4"/>'),
    spacing: I('<path d="M21 6H11M21 12H11M21 18H11M6 4v16M3 7l3-3 3 3M3 17l3 3 3-3"/>'),
    link: I('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'),
    image: I('<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>'),
    video: I('<path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2"/>'),
    table: I('<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>'),
    hr: I('<path d="M3 12h18"/><path d="M8 6h8M8 18h8" opacity=".4"/>'),
    quote: I('<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.76-2-2-2H4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h4M15 21c3 0 7-1 7-8V5c0-1.25-.76-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h4"/>'),
    code: I('<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>'),
    omega: I('<path d="M5 20h4v-2.5A8 8 0 1 1 15 17.5V20h4"/>'),
    date: I('<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
    search: I('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
    count: I('<path d="M4 7h16M4 12h16M4 17h9"/>'),
    spell: I('<path d="m6 16 6-12 6 12M8 12h8"/><path d="m16 20 2 2 4-4"/>'),
    zoomIn: I('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/>'),
    zoomOut: I('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3M8 11h6"/>'),
    full: I('<path d="M8 3H3v5M21 8V3h-5M16 21h5v-5M3 16v5h5"/>'),
    eye: I('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'),
    margins: I('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 3v18M16 3v18"/>'),
    width: I('<path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"/>'),
    pages: I('<path d="M5 3h14v18H5z"/><path d="M5 12h14" stroke-dasharray="3 3"/>')
  };

  const PALETTE = ['#14213D', '#5B6B85', '#8A94A8', '#C3CBD9', '#FFFFFF', '#0C2C74', '#071D52', '#2E5BC4',
    '#C0392B', '#E67E22', '#F5A800', '#FFD866', '#1D9A6C', '#2ECC71', '#8E44AD', '#E84393',
    '#FBEAEA', '#FFF3D6', '#E4F7EE', '#E7ECF7', '#FFE08A', '#CDEBFF', '#EBD9FF', '#FFD6E8'];
  const FONTS = [['Police par défaut', ''], ['Inter', 'Inter, sans-serif'], ['Sora', 'Sora, sans-serif'], ['Arial', 'Arial, Helvetica, sans-serif'],
    ['Georgia', 'Georgia, serif'], ['Times New Roman', 'Times New Roman, serif'], ['Verdana', 'Verdana, sans-serif'],
    ['Trebuchet MS', 'Trebuchet MS, sans-serif'], ['Courier New', 'Courier New, monospace']];
  const SIZES = [10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 28, 32, 36, 42, 48, 60, 72];
  const SPACINGS = [['Simple', 1], ['1,15', 1.15], ['1,5', 1.5], ['Double', 2], ['2,5', 2.5], ['Triple', 3]];
  const STYLES = [['p', 'Paragraphe'], ['h2', 'Titre 1'], ['h3', 'Titre 2'], ['h4', 'Titre 3'], ['quote', 'Citation'], ['code', 'Bloc de code']];
  const CHARS = '© ® ™ € £ $ ¥ ¢ § ¶ † ‡ • · … – — « » “ ” ‘ ’ ‹ › ° ± × ÷ ≠ ≈ ≤ ≥ ∞ √ ∑ π Ω µ ² ³ ¼ ½ ¾ ‰ ← → ↑ ↓ ↔ ⇒ ✓ ✗ ★ ☆ ♥ ♪ à â ä ç é è ê ë î ï ô ö ù û ü ÿ œ æ À Â Ç É È Ê Î Ô Ù Û Œ Æ ñ ß'.split(' ');

  // Quill 2 : les listes sont stockées en <ol><li data-list="...">. On les remet en vraies <ul>/<ol> (listes à cocher : <ul data-checked>).
  function normalizeQuillHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('.ql-ui').forEach(n => n.remove());
    doc.querySelectorAll('ol').forEach(ol => {
      const items = [...ol.children];
      if (!items.some(li => li.hasAttribute('data-list'))) return;
      let current = null, currentKey = null;
      const frag = doc.createDocumentFragment();
      items.forEach(li => {
        const kind = li.getAttribute('data-list');
        const key = kind === 'ordered' ? 'OL' : kind === 'checked' ? 'UL:true' : kind === 'unchecked' ? 'UL:false' : 'UL';
        if (key !== currentKey) {
          current = doc.createElement(key.slice(0, 2));
          if (key.indexOf(':') > 0) current.setAttribute('data-checked', key.split(':')[1]);
          currentKey = key; frag.appendChild(current);
        }
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

  const norm = (s) => String(s || '').replace(/["']/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

  async function create(container, opts) {
    opts = opts || {};
    const Quill = await loadQuill();
    if (!Quill.__jcExt) {
      const BlockEmbed = Quill.import('blots/block/embed');
      class Divider extends BlockEmbed {}
      Divider.blotName = 'divider';
      Divider.tagName = 'HR';
      Quill.register(Divider);
      const P = Quill.import('parchment');
      Quill.register(new P.StyleAttributor('jcfont', 'font-family', { scope: P.Scope.INLINE }), true);
      Quill.register(new P.StyleAttributor('jcsize', 'font-size', { scope: P.Scope.INLINE }), true);
      Quill.register(new P.StyleAttributor('lineheight', 'line-height', { scope: P.Scope.BLOCK }), true);
      Quill.__jcExt = true;
    }

    container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'jced jced-guides';
    const hasSave = typeof opts.onSave === 'function';
    wrap.innerHTML = `
<div class="jced-tabs" role="tablist">
  <button type="button" class="jced-tab on" data-tab="home">Accueil</button>
  <button type="button" class="jced-tab" data-tab="insert">Insertion</button>
  <button type="button" class="jced-tab" data-tab="layout">Mise en page</button>
  <button type="button" class="jced-tab" data-tab="review">Révision</button>
  <button type="button" class="jced-tab" data-tab="view">Affichage</button>
  <span class="jced-grow"></span><span class="jced-status" aria-live="polite"></span>
  ${hasSave ? '<button type="button" class="jced-save">Enregistrer</button>' : ''}
</div>
<div class="jced-ribbon">
  <div class="jced-panel on" data-panel="home"></div>
  <div class="jced-panel" data-panel="insert"></div>
  <div class="jced-panel" data-panel="layout"></div>
  <div class="jced-panel" data-panel="review"></div>
  <div class="jced-panel" data-panel="view"></div>
</div>
<div class="jced-canvas"><div class="jced-page"><div class="jced-host"></div><div class="jced-read" hidden></div></div></div>
<div class="jced-foot"><div class="jced-fl"><span class="jced-words">0 mot</span><span class="jced-chars-n">0 caractère</span><span class="jced-pages">1 page</span></div>
<div class="jced-fr"><button type="button" data-zoom="-" title="Zoom arrière">−</button><span class="jced-zoomv">100 %</span><button type="button" data-zoom="+" title="Zoom avant">+</button></div></div>`;
    container.appendChild(wrap);

    const host = wrap.querySelector('.jced-host'), page = wrap.querySelector('.jced-page'), canvas = wrap.querySelector('.jced-canvas');
    const readBox = wrap.querySelector('.jced-read'), status = wrap.querySelector('.jced-status');
    function setStatus(text, isErr) { status.textContent = text || ''; status.classList.toggle('err', !!isErr); }

    const quill = new Quill(host, {
      theme: 'snow',
      placeholder: opts.placeholder || 'Commencez à écrire...',
      modules: { toolbar: false, history: { delay: 800, maxStack: 300, userOnly: true }, clipboard: {}, table: true }
    });
    quill.root.setAttribute('lang', 'fr');
    quill.root.setAttribute('spellcheck', 'true');
    if (opts.minHeight) quill.root.style.minHeight = opts.minHeight + 'px';
    const tableMod = quill.getModule('table');

    // ---------------------------------------------------------------- fabrique de boutons
    const btns = {};
    function mkBtn(key, icon, title, onClick, o) {
      o = o || {};
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'jced-b' + (o.large ? ' jced-bl' : '');
      b.title = title; b.setAttribute('aria-label', title);
      b.innerHTML = icon + (o.large ? '<span>' + (o.label || title) + '</span>' : '') + (o.bar ? '<i class="jced-bar"></i>' : '');
      b.addEventListener('mousedown', (e) => e.preventDefault());
      b.addEventListener('click', (e) => { e.stopPropagation(); onClick(b, e); });
      btns[key] = b; return b;
    }
    function mkChip(label, onClick, key) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'jced-chip'; b.textContent = label;
      b.addEventListener('mousedown', (e) => e.preventDefault());
      b.addEventListener('click', (e) => { e.stopPropagation(); onClick(b); });
      if (key) btns[key] = b; return b;
    }
    function mkSel(options, onChange, title) {
      const s = document.createElement('select'); s.className = 'jced-sel'; s.title = title; s.setAttribute('aria-label', title);
      options.forEach(([v, l]) => { const o = document.createElement('option'); o.value = v; o.textContent = l; s.appendChild(o); });
      s.addEventListener('change', () => { onChange(s.value); });
      return s;
    }
    function group(panel, items, label) {
      const g = document.createElement('div'); g.className = 'jced-g';
      if (label) { const l = document.createElement('span'); l.className = 'jced-lbl'; l.textContent = label; g.appendChild(l); }
      items.forEach(i => g.appendChild(i));
      wrap.querySelector('[data-panel="' + panel + '"]').appendChild(g); return g;
    }

    // ---------------------------------------------------------------- fenêtres flottantes (une seule à la fois)
    let pop = null, popCleanup = null;
    function closePop() { if (pop) { pop.remove(); pop = null; } if (popCleanup) { popCleanup(); popCleanup = null; } }
    function openPop(anchor, content, cls) {
      closePop();
      pop = document.createElement('div'); pop.className = 'jced-pop ' + (cls || '');
      if (typeof content === 'function') content(pop); else pop.appendChild(content);
      wrap.appendChild(pop);
      const a = anchor.getBoundingClientRect(), w = wrap.getBoundingClientRect();
      let left = a.left - w.left, top = a.bottom - w.top + 6;
      pop.style.left = '0px'; pop.style.top = top + 'px';
      const pw = pop.offsetWidth; left = Math.max(6, Math.min(left, w.width - pw - 6)); pop.style.left = left + 'px';
      const off = (e) => { if (pop && !pop.contains(e.target)) closePop(); };
      setTimeout(() => document.addEventListener('pointerdown', off), 0);
      popCleanup = () => document.removeEventListener('pointerdown', off);
      return pop;
    }
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (pop) { closePop(); return; }
      if (wrap.classList.contains('jced-full')) toggleFull(false);
    });

    // ---------------------------------------------------------------- actions
    const fmt = () => quill.getFormat();
    function toggleInline(name) { quill.focus(); quill.format(name, !fmt()[name], 'user'); refresh(); }
    function setHeader(v) {
      quill.focus(); const f = fmt();
      if (v === 'quote') { quill.format('header', false, 'user'); quill.format('code-block', false, 'user'); quill.format('blockquote', !f.blockquote, 'user'); }
      else if (v === 'code') { quill.format('header', false, 'user'); quill.format('blockquote', false, 'user'); quill.format('code-block', !f['code-block'], 'user'); }
      else { quill.format('code-block', false, 'user'); quill.format('blockquote', false, 'user'); quill.format('header', v === 'p' ? false : Number(v.slice(1)), 'user'); }
      refresh();
    }
    function setList(kind) {
      quill.focus(); const cur = fmt().list;
      const same = kind === 'check' ? (cur === 'checked' || cur === 'unchecked') : cur === kind;
      quill.format('list', same ? false : (kind === 'check' ? 'unchecked' : kind), 'user'); refresh();
    }
    function setAlign(v) { quill.focus(); quill.format('align', v || false, 'user'); refresh(); }
    function setIndent(d) { quill.focus(); quill.format('indent', d > 0 ? '+1' : '-1', 'user'); refresh(); }
    function curSizePx() {
      const f = fmt().jcsize; if (f) return parseFloat(f);
      const r = quill.getSelection(); if (!r) return 15.5;
      const [leaf] = quill.getLeaf(r.index); const el = leaf && leaf.domNode ? (leaf.domNode.nodeType === 3 ? leaf.domNode.parentElement : leaf.domNode) : quill.root;
      return parseFloat(getComputedStyle(el).fontSize) || 15.5;
    }
    function stepSize(dir) {
      const c = curSizePx(); let n;
      if (dir > 0) n = SIZES.find(s => s > c + 0.4) || SIZES[SIZES.length - 1]; else { n = [...SIZES].reverse().find(s => s < c - 0.4) || SIZES[0]; }
      quill.focus(); quill.format('jcsize', n + 'px', 'user'); refresh();
    }
    function clearFormat() {
      quill.focus(); const r = quill.getSelection(true); if (!r) return;
      if (r.length) { quill.removeFormat(r.index, r.length, 'user'); }
      else { const [line, off] = quill.getLine(r.index); if (line) quill.removeFormat(r.index - off, line.length(), 'user'); }
      refresh();
    }
    function colorPicker(kind, anchor) {
      const attr = kind === 'color' ? 'color' : 'background';
      openPop(anchor, (p) => {
        const sw = document.createElement('div'); sw.className = 'jced-sw';
        PALETTE.forEach(c => { const b = document.createElement('button'); b.type = 'button'; b.style.background = c; b.title = c; b.addEventListener('click', () => apply(c)); sw.appendChild(b); });
        p.appendChild(sw);
        const row = document.createElement('div'); row.className = 'jced-row';
        const none = document.createElement('button'); none.type = 'button'; none.textContent = kind === 'color' ? 'Couleur automatique' : 'Aucune couleur'; none.addEventListener('click', () => apply(false));
        const inp = document.createElement('input'); inp.type = 'color'; inp.title = 'Couleur personnalisée'; inp.value = '#0c2c74';
        inp.addEventListener('change', () => apply(inp.value));
        const lab = document.createElement('span'); lab.textContent = 'Autre :';
        row.append(none, lab, inp); p.appendChild(row);
      });
      function apply(c) {
        closePop(); quill.focus(); quill.format(attr, c || false, 'user');
        const bar = btns[kind].querySelector('.jced-bar'); if (bar) bar.style.background = c || (kind === 'color' ? '#14213D' : '#FFE08A'); refresh();
      }
    }
    async function askLink() {
      const f = fmt(); quill.focus(); const r = quill.getSelection(true); if (!r) return;
      const ask = window.showPrompt; if (typeof ask !== 'function') return;
      let url = await ask("Adresse du lien (https://...) :", f.link || 'https://');
      if (url === null || url === undefined) return;
      url = String(url).trim();
      if (!url || url === 'https://') { if (f.link) quill.formatText(r.index, Math.max(r.length, 1), 'link', false, 'user'); return; }
      if (!/^(https?:\/\/|mailto:)/i.test(url)) url = /^[\w.-]+@[\w.-]+\.\w+$/.test(url) ? 'mailto:' + url : 'https://' + url;
      if (!window.JCRich.safeUrl(url, true)) { setStatus('Adresse non valide.', true); return; }
      quill.focus();
      if (r.length) quill.formatText(r.index, r.length, 'link', url, 'user');
      else { quill.insertText(r.index, url.replace(/^mailto:/i, ''), { link: url }, 'user'); quill.setSelection(r.index + url.length, 0, 'silent'); }
    }
    async function askVideo() {
      quill.focus(); const range = quill.getSelection(true);
      const ask = window.showPrompt; if (typeof ask !== 'function') return;
      const url = await ask('Adresse de la vidéo YouTube ou Vimeo :');
      if (!url) return;
      const embed = window.JCRich.videoEmbedUrl(url);
      if (!embed) { setStatus('Adresse de vidéo non reconnue (YouTube ou Vimeo uniquement).', true); return; }
      quill.insertEmbed(range.index, 'video', embed, 'user');
      quill.setSelection(range.index + 1, 0, 'silent'); setStatus('Vidéo insérée.');
    }
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
        quill.setSelection(range.index + 1, 0, 'silent'); setStatus('Image insérée.');
      } catch (e) { setStatus("Erreur lors de l'envoi de l'image : " + (e && e.message ? e.message : e), true); }
    }
    function pickImage() {
      const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*';
      input.onchange = () => { if (input.files[0]) uploadAndInsert(input.files[0]); };
      input.click();
    }
    function insertHr() { quill.focus(); const r = quill.getSelection(true); quill.insertEmbed(r.index, 'divider', true, 'user'); quill.setSelection(r.index + 1, 0, 'silent'); }
    function tablePicker(anchor) {
      openPop(anchor, (p) => {
        const grid = document.createElement('div'); grid.className = 'jced-grid';
        const label = document.createElement('div'); label.className = 'jced-glabel'; label.textContent = 'Insérer un tableau';
        const cells = [];
        for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++) { const s = document.createElement('span'); s.dataset.r = r + 1; s.dataset.c = c + 1; grid.appendChild(s); cells.push(s); }
        const hl = (r, c) => { cells.forEach(s => s.classList.toggle('hl', +s.dataset.r <= r && +s.dataset.c <= c)); label.textContent = r + ' ligne' + (r > 1 ? 's' : '') + ' × ' + c + ' colonne' + (c > 1 ? 's' : ''); };
        cells.forEach(s => {
          s.addEventListener('mouseenter', () => hl(+s.dataset.r, +s.dataset.c));
          s.addEventListener('click', () => { const r = +s.dataset.r, c = +s.dataset.c; closePop(); quill.focus(); tableMod.insertTable(r, c); setStatus('Tableau inséré.'); refresh(); });
        });
        p.append(grid, label);
      });
    }
    function charPicker(anchor) {
      openPop(anchor, (p) => {
        const g = document.createElement('div'); g.className = 'jced-chars';
        CHARS.forEach(ch => { const b = document.createElement('button'); b.type = 'button'; b.textContent = ch; b.addEventListener('click', () => { quill.focus(); const r = quill.getSelection(true); quill.insertText(r.index, ch, 'user'); quill.setSelection(r.index + ch.length, 0, 'silent'); }); g.appendChild(b); });
        p.appendChild(g);
      });
    }
    function insertDate() {
      quill.focus(); const r = quill.getSelection(true); const t = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      quill.insertText(r.index, t, 'user'); quill.setSelection(r.index + t.length, 0, 'silent');
    }
    function inTable() { try { const t = tableMod.getTable(); return !!(t && t[0]); } catch (e) { return false; } }
    function tableOp(name) { quill.focus(); if (!inTable()) { setStatus('Placez le curseur dans une cellule du tableau.', true); return; } tableMod[name](); refresh(); }
    function spacingMenu(anchor) {
      openPop(anchor, (p) => {
        p.classList.add('jced-menu');
        const cur = fmt().lineheight;
        SPACINGS.forEach(([l, v]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = 'Interligne ' + l; if (cur && parseFloat(cur) === v) b.classList.add('on'); b.addEventListener('click', () => { closePop(); quill.focus(); quill.format('lineheight', v === 1.75 ? false : String(v), 'user'); refresh(); }); p.appendChild(b); });
        const d = document.createElement('button'); d.type = 'button'; d.textContent = 'Interligne par défaut'; d.addEventListener('click', () => { closePop(); quill.focus(); quill.format('lineheight', false, 'user'); refresh(); }); p.appendChild(d);
      });
    }

    // ---------------------------------------------------------------- recherche et remplacement
    const HL = (window.CSS && CSS.highlights && window.Highlight) ? new Highlight() : null;
    if (HL) CSS.highlights.set('jced-find', HL);
    if (HL && !document.getElementById('jced-hl-css')) { const s = document.createElement('style'); s.id = 'jced-hl-css'; s.textContent = '::highlight(jced-find){background:#FFE08A;color:#14213D;}'; document.head.appendChild(s); }
    let matches = [], mi = -1, findInput, replInput, caseBox, countLab;
    function computeMatches() {
      matches = []; const q = findInput.value; if (!q) { paintMatches(); return; }
      const text = quill.getText(), hay = caseBox.checked ? text : text.toLowerCase(), n = caseBox.checked ? q : q.toLowerCase();
      let i = 0; while ((i = hay.indexOf(n, i)) !== -1) { matches.push(i); i += Math.max(1, n.length); }
      if (mi >= matches.length) mi = matches.length - 1; if (mi < 0 && matches.length) mi = 0;
      paintMatches();
    }
    function rangeFor(idx, len) {
      try { const [a, ao] = quill.getLeaf(idx), [b, bo] = quill.getLeaf(idx + len); if (!a || !b || a.domNode.nodeType !== 3 || b.domNode.nodeType !== 3) return null;
        const r = document.createRange(); r.setStart(a.domNode, ao); r.setEnd(b.domNode, bo); return r; } catch (e) { return null; }
    }
    function paintMatches() {
      if (HL) { HL.clear(); matches.forEach(i => { const r = rangeFor(i, findInput.value.length); if (r) HL.add(r); }); }
      countLab.textContent = findInput.value ? (matches.length ? (mi + 1) + ' sur ' + matches.length : 'Aucun résultat') : '';
    }
    function gotoMatch(d) {
      computeMatches(); if (!matches.length) return;
      mi = (mi + d + matches.length) % matches.length; paintMatches();
      const r = rangeFor(matches[mi], findInput.value.length);
      if (r) { const rect = r.getBoundingClientRect(), c = canvas.getBoundingClientRect(); if (rect.top < c.top + 30 || rect.bottom > c.bottom - 30) canvas.scrollTop += rect.top - c.top - c.height / 3; }
      else { quill.setSelection(matches[mi], findInput.value.length, 'silent'); }
    }
    function replaceOne() {
      computeMatches(); if (!matches.length) return;
      const i = matches[Math.max(mi, 0)]; quill.deleteText(i, findInput.value.length, 'user'); quill.insertText(i, replInput.value, 'user');
      computeMatches(); setStatus('Remplacé.');
    }
    function replaceAll() {
      computeMatches(); const n = matches.length; if (!n) return;
      [...matches].reverse().forEach(i => { quill.deleteText(i, findInput.value.length, 'user'); quill.insertText(i, replInput.value, 'user'); });
      computeMatches(); setStatus(n + ' remplacement' + (n > 1 ? 's' : '') + '.');
    }
    function openFind(anchor) {
      const sel = quill.getSelection(); const pre = sel && sel.length && sel.length < 60 ? quill.getText(sel.index, sel.length) : '';
      openPop(anchor || wrap.querySelector('.jced-tabs'), (p) => {
        p.classList.add('jced-find');
        findInput = document.createElement('input'); findInput.type = 'text'; findInput.placeholder = 'Rechercher'; findInput.value = pre;
        replInput = document.createElement('input'); replInput.type = 'text'; replInput.placeholder = 'Remplacer par';
        const lab = document.createElement('label'); caseBox = document.createElement('input'); caseBox.type = 'checkbox'; lab.append(caseBox, document.createTextNode('Respecter la casse'));
        countLab = document.createElement('span'); countLab.style.cssText = 'font-size:12px;font-weight:600;color:#0C2C74;';
        const row1 = document.createElement('div'); row1.className = 'jced-row';
        const mk = (t, fn) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.addEventListener('click', fn); return b; };
        row1.append(mk('Précédent', () => gotoMatch(-1)), mk('Suivant', () => gotoMatch(1)), countLab);
        const row2 = document.createElement('div'); row2.className = 'jced-row'; row2.append(mk('Remplacer', replaceOne), mk('Tout remplacer', replaceAll));
        p.append(findInput, replInput, lab, row1, row2);
        findInput.addEventListener('input', () => { mi = 0; computeMatches(); if (matches.length) gotoMatch(0); });
        caseBox.addEventListener('change', () => { mi = 0; computeMatches(); });
        findInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); gotoMatch(e.shiftKey ? -1 : 1); } });
        setTimeout(() => { findInput.focus(); if (pre) { mi = 0; computeMatches(); } }, 0);
      });
      const prevCleanup = popCleanup; popCleanup = () => { if (prevCleanup) prevCleanup(); if (HL) HL.clear(); matches = []; };
    }
    function countPop(anchor) {
      openPop(anchor, (p) => {
        const t = quill.getText(), words = (t.trim().match(/\S+/g) || []).length, chars = t.replace(/\n$/, '').length, noSp = t.replace(/\s/g, '').length;
        const paras = t.split('\n').filter(x => x.trim()).length, sent = (t.match(/[.!?…]+(\s|$)/g) || []).length;
        const mins = Math.max(words ? 1 : 0, Math.round(words / 200));
        const g = document.createElement('div'); g.className = 'jced-count-t';
        [['Mots', words], ['Caractères (espaces compris)', chars], ['Caractères (sans espaces)', noSp], ['Paragraphes', paras], ['Phrases', sent], ['Temps de lecture', mins + ' min']].forEach(([l, v]) => { const a = document.createElement('span'); a.textContent = l; const b = document.createElement('b'); b.textContent = v; g.append(a, b); });
        p.appendChild(g);
      });
    }

    // ---------------------------------------------------------------- vue : zoom, plein écran, lecture, page
    let zoom = 1, reading = false;
    const zoomV = wrap.querySelector('.jced-zoomv');
    function setZoom(z) { zoom = Math.max(0.5, Math.min(2, Math.round(z * 100) / 100)); page.style.zoom = zoom; zoomV.textContent = Math.round(zoom * 100) + ' %'; }
    wrap.querySelectorAll('[data-zoom]').forEach(b => b.addEventListener('click', () => setZoom(zoom + (b.dataset.zoom === '+' ? 0.1 : -0.1))));
    function toggleFull(force) {
      const on = typeof force === 'boolean' ? force : !wrap.classList.contains('jced-full');
      wrap.classList.toggle('jced-full', on); document.body.classList.toggle('jced-noscroll', on);
      if (btns.full) btns.full.classList.toggle('on', on); quill.focus();
    }
    function toggleRead() {
      reading = !reading; btns.read.classList.toggle('on', reading);
      host.hidden = reading; readBox.hidden = !reading;
      if (reading) { readBox.className = 'jced-read rich-content'; readBox.innerHTML = window.JCRich.render(api.getHTML()); }
      wrap.querySelectorAll('.jced-panel.on .jced-b, .jced-panel.on .jced-chip, .jced-panel.on .jced-sel').forEach(el => { if (el !== btns.read && el !== btns.full) el.disabled = reading; });
      if (reading) wrap.querySelectorAll('[data-tab]').forEach(t => { if (t.dataset.tab !== 'view') t.disabled = true; }); else wrap.querySelectorAll('[data-tab]').forEach(t => { t.disabled = false; });
      if (!reading) { quill.focus(); }
    }

    // ---------------------------------------------------------------- construction des onglets
    const selStyle = mkSel(STYLES, (v) => { setHeader(v); }, 'Style du texte');
    const selFont = mkSel(FONTS.map(([l, v]) => [v, l]), (v) => { quill.focus(); quill.format('jcfont', v || false, 'user'); refresh(); }, 'Police');
    selFont.style.maxWidth = '140px';
    const selSize = mkSel(SIZES.map(s => [String(s), String(s)]), (v) => { quill.focus(); quill.format('jcsize', v + 'px', 'user'); refresh(); }, 'Taille du texte');
    selSize.style.width = '62px';
    group('home', [mkBtn('undo', ICON.undo, 'Annuler (Ctrl+Z)', () => { quill.history.undo(); refresh(); }), mkBtn('redo', ICON.redo, 'Rétablir (Ctrl+Y)', () => { quill.history.redo(); refresh(); })]);
    group('home', [selStyle, selFont, selSize, mkBtn('sizeUp', ICON.sizeUp, 'Agrandir la police', () => stepSize(1)), mkBtn('sizeDown', ICON.sizeDown, 'Réduire la police', () => stepSize(-1))]);
    group('home', [mkBtn('bold', ICON.bold, 'Gras (Ctrl+B)', () => toggleInline('bold')), mkBtn('italic', ICON.italic, 'Italique (Ctrl+I)', () => toggleInline('italic')), mkBtn('underline', ICON.underline, 'Souligné (Ctrl+U)', () => toggleInline('underline')), mkBtn('strike', ICON.strike, 'Barré', () => toggleInline('strike')),
      mkBtn('subb', ICON.sub, 'Indice', () => { quill.focus(); quill.format('script', fmt().script === 'sub' ? false : 'sub', 'user'); refresh(); }), mkBtn('supp', ICON.sup, 'Exposant', () => { quill.focus(); quill.format('script', fmt().script === 'super' ? false : 'super', 'user'); refresh(); })]);
    group('home', [mkBtn('color', ICON.color, 'Couleur du texte', (b) => colorPicker('color', b), { bar: true }), mkBtn('background', ICON.mark, 'Surligner', (b) => colorPicker('background', b), { bar: true }), mkBtn('clean', ICON.eraser, 'Effacer la mise en forme', clearFormat)]);
    btns.background.querySelector('.jced-bar').style.background = '#FFE08A';
    group('home', [mkBtn('al', ICON.left, 'Aligner à gauche', () => setAlign(false)), mkBtn('ac', ICON.center, 'Centrer', () => setAlign('center')), mkBtn('ar', ICON.right, 'Aligner à droite', () => setAlign('right')), mkBtn('aj', ICON.justify, 'Justifier', () => setAlign('justify'))]);
    group('home', [mkBtn('ul', ICON.ul, 'Liste à puces', () => setList('bullet')), mkBtn('ol', ICON.ol, 'Liste numérotée', () => setList('ordered')), mkBtn('chk', ICON.check, 'Liste de tâches à cocher', () => setList('check')),
      mkBtn('outd', ICON.outdent, 'Diminuer le retrait', () => setIndent(-1)), mkBtn('ind', ICON.indent, 'Augmenter le retrait', () => setIndent(1)), mkBtn('lsp', ICON.spacing, 'Interligne', (b) => spacingMenu(b))]);

    group('insert', [mkBtn('tbl', ICON.table, 'Tableau', (b) => tablePicker(b), { large: true, label: 'Tableau' })]);
    group('insert', [].concat(opts.uploadImage ? [mkBtn('img', ICON.image, 'Image', pickImage, { large: true, label: 'Image' })] : [], [mkBtn('lnk', ICON.link, 'Lien (Ctrl+K)', askLink, { large: true, label: 'Lien' }), mkBtn('vid', ICON.video, 'Vidéo YouTube ou Vimeo', askVideo, { large: true, label: 'Vidéo' })]));
    group('insert', [mkBtn('hrb', ICON.hr, 'Ligne de séparation', insertHr, { large: true, label: 'Séparateur' }), mkBtn('qt', ICON.quote, 'Citation', () => setHeader('quote'), { large: true, label: 'Citation' }), mkBtn('cd', ICON.code, 'Bloc de code', () => setHeader('code'), { large: true, label: 'Code' })]);
    group('insert', [mkBtn('chr', ICON.omega, 'Caractères spéciaux', (b) => charPicker(b), { large: true, label: 'Symboles' }), mkBtn('dt', ICON.date, 'Date du jour', insertDate, { large: true, label: 'Date' })]);
    group('insert', [mkChip('+ Ligne au-dessus', () => tableOp('insertRowAbove'), 't1'), mkChip('+ Ligne en dessous', () => tableOp('insertRowBelow'), 't2'), mkChip('+ Colonne à gauche', () => tableOp('insertColumnLeft'), 't3'), mkChip('+ Colonne à droite', () => tableOp('insertColumnRight'), 't4'),
      mkChip('Supprimer la ligne', () => tableOp('deleteRow'), 't5'), mkChip('Supprimer la colonne', () => tableOp('deleteColumn'), 't6'), mkChip('Supprimer le tableau', () => tableOp('deleteTable'), 't7')]);

    const selMargin = mkSel([['32px', 'Étroites'], ['64px', 'Normales'], ['96px', 'Larges']], (v) => { wrap.style.setProperty('--jced-pad', v); }, 'Marges de la page'); selMargin.value = '64px';
    const selWidth = mkSel([['680px', 'Étroite'], ['816px', 'Standard'], ['1000px', 'Large'], ['100%', 'Pleine largeur']], (v) => { wrap.style.setProperty('--jced-w', v); }, 'Largeur de la page'); selWidth.value = '816px';
    group('layout', [selMargin], 'Marges');
    group('layout', [selWidth], 'Largeur');
    group('layout', [mkBtn('lsp2', ICON.spacing, 'Interligne', (b) => spacingMenu(b), { large: true, label: 'Interligne' }), mkBtn('pg', ICON.pages, 'Afficher les sauts de page', (b) => { const on = wrap.classList.toggle('jced-guides'); b.classList.toggle('on', on); }, { large: true, label: 'Sauts de page' })]);
    btns.pg.classList.add('on');

    group('review', [mkBtn('find', ICON.search, 'Rechercher et remplacer (Ctrl+F)', (b) => openFind(b), { large: true, label: 'Rechercher' }), mkBtn('cnt', ICON.count, 'Compter les mots', (b) => countPop(b), { large: true, label: 'Compter' }),
      mkBtn('spell', ICON.spell, 'Correcteur orthographique du navigateur', (b) => { const on = quill.root.getAttribute('spellcheck') !== 'true'; quill.root.setAttribute('spellcheck', on ? 'true' : 'false'); b.classList.toggle('on', on); setStatus(on ? 'Correcteur activé.' : 'Correcteur désactivé.'); }, { large: true, label: 'Orthographe' })]);
    btns.spell.classList.add('on');

    group('view', [mkBtn('zo', ICON.zoomOut, 'Zoom arrière', () => setZoom(zoom - 0.1), { large: true, label: 'Zoom −' }), mkBtn('zi', ICON.zoomIn, 'Zoom avant', () => setZoom(zoom + 0.1), { large: true, label: 'Zoom +' }), mkBtn('z100', ICON.search, 'Zoom 100 %', () => setZoom(1), { large: true, label: '100 %' })]);
    group('view', [mkBtn('full', ICON.full, 'Plein écran (Échap pour quitter)', () => toggleFull(), { large: true, label: 'Plein écran' }), mkBtn('read', ICON.eye, 'Aperçu tel que publié', () => toggleRead(), { large: true, label: 'Lecture' })]);

    wrap.querySelectorAll('.jced-tab').forEach(t => t.addEventListener('click', () => {
      if (t.disabled) return; closePop();
      wrap.querySelectorAll('.jced-tab').forEach(x => x.classList.toggle('on', x === t));
      wrap.querySelectorAll('.jced-panel').forEach(p => p.classList.toggle('on', p.dataset.panel === t.dataset.tab));
    }));
    if (hasSave) wrap.querySelector('.jced-save').addEventListener('click', () => opts.onSave());

    // ---------------------------------------------------------------- état des boutons
    function refresh() {
      const f = fmt();
      ['bold', 'italic', 'underline', 'strike'].forEach(k => btns[k].classList.toggle('on', !!f[k]));
      btns.subb.classList.toggle('on', f.script === 'sub'); btns.supp.classList.toggle('on', f.script === 'super');
      btns.al.classList.toggle('on', !f.align); btns.ac.classList.toggle('on', f.align === 'center'); btns.ar.classList.toggle('on', f.align === 'right'); btns.aj.classList.toggle('on', f.align === 'justify');
      btns.ul.classList.toggle('on', f.list === 'bullet'); btns.ol.classList.toggle('on', f.list === 'ordered'); btns.chk.classList.toggle('on', f.list === 'checked' || f.list === 'unchecked');
      btns.lnk.classList.toggle('on', !!f.link);
      const st = f.blockquote ? 'quote' : f['code-block'] ? 'code' : f.header ? 'h' + f.header : 'p';
      selStyle.value = [...selStyle.options].some(o => o.value === st) ? st : 'p';
      const ff = norm(f.jcfont); const fo = FONTS.find(([, v]) => norm(v) === ff); selFont.value = fo ? fo[1] : '';
      const sz = String(Math.round(curSizePx())); if (![...selSize.options].some(o => o.value === sz)) { const o = document.createElement('option'); o.value = sz; o.textContent = sz; selSize.appendChild(o); } selSize.value = sz;
      const t = inTable(); ['t1', 't2', 't3', 't4', 't5', 't6', 't7'].forEach(k => { btns[k].disabled = !t; });
      try { btns.undo.disabled = quill.history.stack.undo.length === 0; btns.redo.disabled = quill.history.stack.redo.length === 0; } catch (e) { /* ignore */ }
    }
    quill.on('editor-change', () => { if (!reading) refresh(); });

    // ---------------------------------------------------------------- fenêtre « lien » quand le curseur est dans un lien
    let linkTimer = null;
    quill.on('selection-change', (range) => {
      clearTimeout(linkTimer);
      if (!range || range.length || reading) return;
      linkTimer = setTimeout(() => {
        const f = fmt(); if (!f.link || pop) return;
        const b = quill.getBounds(range.index), hb = host.getBoundingClientRect(), wr = wrap.getBoundingClientRect();
        const el = document.createElement('div'); el.className = 'jced-pop jced-linkpop';
        const a = document.createElement('a'); a.href = f.link; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = f.link;
        const ed = document.createElement('button'); ed.type = 'button'; ed.textContent = 'Modifier';
        const rm = document.createElement('button'); rm.type = 'button'; rm.textContent = 'Retirer';
        el.append(a, ed, rm); wrap.appendChild(el); pop = el;
        el.style.top = (hb.top - wr.top + b.top + b.height + 8) + 'px'; el.style.left = Math.max(6, Math.min(hb.left - wr.left + b.left, wr.width - 330)) + 'px';
        const off = (e) => { if (pop && !pop.contains(e.target)) closePop(); }; setTimeout(() => document.addEventListener('pointerdown', off), 0); popCleanup = () => document.removeEventListener('pointerdown', off);
        ed.addEventListener('click', () => { closePop(); const [lk, off2] = quill.getLeaf(range.index); const idx = range.index - off2; quill.setSelection(idx, lk.length(), 'silent'); askLink(); });
        rm.addEventListener('click', () => { closePop(); const [lk, off2] = quill.getLeaf(range.index); quill.formatText(range.index - off2, lk.length(), 'link', false, 'user'); });
      }, 250);
    });

    // ---------------------------------------------------------------- images collées / déposées, raccourcis
    quill.root.addEventListener('paste', (e) => {
      const files = [...(e.clipboardData && e.clipboardData.files || [])].filter(f => f.type.startsWith('image/'));
      if (!files.length) return; e.preventDefault(); e.stopPropagation();
      if (opts.uploadImage) files.forEach(uploadAndInsert);
    }, true);
    quill.root.addEventListener('drop', (e) => {
      const files = [...(e.dataTransfer && e.dataTransfer.files || [])].filter(f => f.type.startsWith('image/'));
      if (!files.length) return; e.preventDefault(); e.stopPropagation();
      if (opts.uploadImage) files.forEach(uploadAndInsert);
    }, true);
    quill.clipboard.addMatcher('IMG', (node, delta) => {
      const src = node.getAttribute('src') || '';
      return /^https?:\/\//i.test(src) ? delta : new (Quill.import('delta'))();
    });
    wrap.addEventListener('keydown', (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === 'f') { e.preventDefault(); openFind(btns.find); }
      else if (k === 'k' && quill.hasFocus()) { e.preventDefault(); askLink(); }
      else if (k === 's' && hasSave) { e.preventDefault(); opts.onSave(); }
      else if (k === 'y') { e.preventDefault(); quill.history.redo(); }
    });

    // ---------------------------------------------------------------- compteurs
    const wEl = wrap.querySelector('.jced-words'), cEl = wrap.querySelector('.jced-chars-n'), pEl = wrap.querySelector('.jced-pages');
    function updateCount() {
      const t = quill.getText(), words = (t.trim().match(/\S+/g) || []).length, chars = t.replace(/\n$/, '').length;
      const pages = Math.max(1, Math.ceil(quill.root.scrollHeight / 1123));
      wEl.textContent = words + (words > 1 ? ' mots' : ' mot'); cEl.textContent = chars + (chars > 1 ? ' caractères' : ' caractère'); pEl.textContent = pages + (pages > 1 ? ' pages' : ' page');
    }
    let dirty = false;
    quill.on('text-change', (d, o, source) => {
      updateCount();
      if (source === 'user') { if (hasSave && !dirty) { dirty = true; setStatus('Modifications non enregistrées'); } if (typeof opts.onChange === 'function') opts.onChange(); }
    });

    const api = {
      quill,
      setHTML(html) {
        const clean = window.JCRich.toEditorHtml(html || '');
        quill.setContents([], 'silent');
        if (clean) quill.clipboard.dangerouslyPasteHTML(0, clean, 'silent');
        quill.history.clear(); dirty = false; setStatus(''); updateCount(); refresh();
      },
      getHTML() {
        if (api.isEmpty()) return '';
        return window.JCRich.sanitize(normalizeQuillHtml(quill.root.innerHTML)).trim();
      },
      getText() { return quill.getText().trim(); },
      isEmpty() {
        if (quill.getText().trim().length) return false;
        return !quill.root.querySelector('img, iframe, hr, table');
      },
      focus() { quill.focus(); },
      markSaved() { dirty = false; setStatus('Enregistré'); },
      setStatus
    };
    if (opts.html) api.setHTML(opts.html);
    updateCount(); refresh();
    return api;
  }

  window.JCEditor = { create, load: loadQuill };
})();
