// rich.js — Affichage sécurisé des textes riches (articles, actualités,
// présentation des cours, leçons).
//   JCRich.render(body)        -> HTML assaini prêt à afficher (les anciens
//                                 textes bruts deviennent des paragraphes)
//   JCRich.sanitize(html)      -> HTML assaini (liste blanche)
//   JCRich.toEditorHtml(body)  -> HTML à charger dans l'éditeur
// Le conteneur qui reçoit le HTML doit porter la classe "rich-content".
(function () {
  const ALLOWED = ['P','BR','B','I','U','S','STRIKE','STRONG','EM','SUB','SUP','SPAN','DIV',
    'H1','H2','H3','H4','BLOCKQUOTE','PRE','CODE','UL','OL','LI','A','IMG','FIGURE','FIGCAPTION','HR','IFRAME',
    'TABLE','THEAD','TBODY','TFOOT','TR','TD','TH'];
  const STYLE_TAGS = ['SPAN','STRONG','EM','U','S','SUB','SUP','P','H1','H2','H3','H4','LI','BLOCKQUOTE','TD','TH'];
  const DROP = ['SCRIPT','STYLE','OBJECT','EMBED','NOSCRIPT','TEMPLATE','SVG','MATH','FORM','INPUT',
    'BUTTON','TEXTAREA','SELECT','LINK','META','BASE','FRAME','FRAMESET','AUDIO','VIDEO','SOURCE'];
  const CLASS_OK = /^ql-(align-(center|right|justify)|indent-[1-8]|direction-rtl|video)$/;
  const COLOR_OK = /^(#[0-9a-f]{3,8}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+)\s*)?\)|[a-z]{3,20})$/i;

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function safeUrl(url, allowMailto) {
    const u = String(url || '').trim();
    if (/^https?:\/\//i.test(u)) return u;
    if (allowMailto && /^mailto:/i.test(u)) return u;
    return '';
  }
  // Vidéos intégrées : YouTube et Vimeo uniquement, en adresse https
  function safeVideoUrl(url) {
    const u = String(url || '').trim();
    let m = u.match(/^https:\/\/(?:www\.)?(?:youtube\.com|youtube-nocookie\.com)\/embed\/([A-Za-z0-9_-]{6,20})(?:[?#].*)?$/);
    if (m) return 'https://www.youtube-nocookie.com/embed/' + m[1];
    m = u.match(/^https:\/\/player\.vimeo\.com\/video\/(\d{3,15})(?:[?#].*)?$/);
    if (m) return 'https://player.vimeo.com/video/' + m[1];
    return '';
  }
  // Transforme une adresse YouTube/Vimeo "normale" en adresse d'intégration
  function videoEmbedUrl(url) {
    const u = String(url || '').trim();
    let m = u.match(/^https?:\/\/(?:www\.|m\.)?youtube\.com\/watch\?(?:.*&)?v=([A-Za-z0-9_-]{6,20})/)
      || u.match(/^https?:\/\/youtu\.be\/([A-Za-z0-9_-]{6,20})/)
      || u.match(/^https?:\/\/(?:www\.)?youtube\.com\/(?:shorts|embed|live)\/([A-Za-z0-9_-]{6,20})/);
    if (m) return 'https://www.youtube-nocookie.com/embed/' + m[1];
    m = u.match(/^https?:\/\/(?:www\.)?vimeo\.com\/(\d{3,15})/) || u.match(/^https?:\/\/player\.vimeo\.com\/video\/(\d{3,15})/);
    if (m) return 'https://player.vimeo.com/video/' + m[1];
    return '';
  }
  function safeStyle(style) {
    const out = [];
    String(style || '').split(';').forEach(decl => {
      const i = decl.indexOf(':');
      if (i < 0) return;
      const prop = decl.slice(0, i).trim().toLowerCase();
      const val = decl.slice(i + 1).trim();
      if ((prop === 'color' || prop === 'background-color') && COLOR_OK.test(val)) out.push(prop + ':' + val);
      else if (prop === 'font-family' && /^[A-Za-z0-9 ,'"-]{2,90}$/.test(val)) out.push(prop + ':' + val);
      else if (prop === 'font-size' && /^\d{1,2}(\.\d)?px$/.test(val) && parseFloat(val) >= 8 && parseFloat(val) <= 96) out.push(prop + ':' + val);
      else if (prop === 'line-height' && /^\d(\.\d{1,2})?$/.test(val) && parseFloat(val) >= 0.8 && parseFloat(val) <= 4) out.push(prop + ':' + val);
    });
    return out.join(';');
  }

  function sanitize(html) {
    const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
    (function clean(node) {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 8) { child.remove(); return; }
        if (child.nodeType !== 1) return;
        const tag = child.tagName;
        if (DROP.includes(tag)) { child.remove(); return; }
        if (!ALLOWED.includes(tag)) {
          clean(child);
          child.replaceWith(...child.childNodes);
          return;
        }
        const href = child.getAttribute('href');
        const src = child.getAttribute('src');
        const alt = child.getAttribute('alt');
        const dchecked = child.getAttribute('data-checked');
        const cls = (child.getAttribute('class') || '').split(/\s+/).filter(c => CLASS_OK.test(c));
        const style = safeStyle(child.getAttribute('style'));
        [...child.attributes].forEach(a => child.removeAttribute(a.name));
        if (tag === 'IFRAME') {
          const ok = safeVideoUrl(src);
          if (!ok) { child.remove(); return; }
          const wrap = doc.createElement('div');
          wrap.className = 'rich-video';
          const f = doc.createElement('iframe');
          f.setAttribute('src', ok);
          f.setAttribute('title', 'Vidéo');
          f.setAttribute('loading', 'lazy');
          f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
          f.setAttribute('allow', 'accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen');
          f.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation allow-popups');
          wrap.appendChild(f);
          child.replaceWith(wrap);
          return;
        }
        if (cls.length && tag !== 'A' && tag !== 'IMG') child.setAttribute('class', cls.filter(c => c !== 'ql-video').join(' '));
        if (!child.getAttribute('class')) child.removeAttribute('class');
        if (style && STYLE_TAGS.includes(tag)) child.setAttribute('style', style);
        if (tag === 'UL' && (dchecked === 'true' || dchecked === 'false')) child.setAttribute('data-checked', dchecked);
        if (tag === 'A') {
          const ok = safeUrl(href, true);
          if (ok) { child.setAttribute('href', ok); child.setAttribute('target', '_blank'); child.setAttribute('rel', 'noopener noreferrer'); }
        }
        if (tag === 'IMG') {
          const ok = safeUrl(src, false);
          if (!ok) { child.remove(); return; }
          child.setAttribute('src', ok);
          child.setAttribute('alt', alt || '');
          child.setAttribute('loading', 'lazy');
        }
        clean(child);
      });
    })(doc.body);
    return doc.body.innerHTML;
  }

  function looksLikeHtml(s) { return /<\/?[a-z][^>]*>/i.test(s || ''); }
  function plainToHtml(s) {
    return String(s || '').split(/\n{2,}/).map(p => p.trim()).filter(Boolean)
      .map(p => '<p>' + escapeHtml(p).replace(/\n/g, '<br>') + '</p>').join('');
  }
  function render(body) {
    const raw = body || '';
    return looksLikeHtml(raw) ? sanitize(raw) : plainToHtml(raw);
  }
  function toEditorHtml(body) { return render(body); }

  // Styles d'affichage communs (ajoutés une seule fois)
  function injectCss() {
    if (document.getElementById('jc-rich-css')) return;
    const st = document.createElement('style');
    st.id = 'jc-rich-css';
    st.textContent = [
      '.rich-content{font-size:15.5px;line-height:1.8;color:var(--text,#14213D);overflow-wrap:break-word;}',
      '.rich-content > :first-child{margin-top:0;}',
      '.rich-content p{margin:0 0 1em;}',
      '.rich-content h1,.rich-content h2,.rich-content h3,.rich-content h4{font-family:Sora,sans-serif;color:var(--navy-dark,#071D52);line-height:1.3;margin:1.5em 0 .6em;}',
      '.rich-content h1{font-size:1.75em;}.rich-content h2{font-size:1.45em;}.rich-content h3{font-size:1.2em;}.rich-content h4{font-size:1.05em;}',
      '.rich-content a{color:var(--navy,#0C2C74);text-decoration:underline;}',
      '.rich-content img{max-width:100%;height:auto;border-radius:10px;margin:14px 0;display:block;}',
      '.rich-content blockquote{margin:1.2em 0;padding:12px 18px;border-left:4px solid var(--gold,#F5A800);background:var(--surface,#F7F9FC);border-radius:0 10px 10px 0;color:var(--text-muted,#5B6B85);font-style:italic;}',
      '.rich-content pre{background:#0B1B3F;color:#E7ECF7;padding:14px 16px;border-radius:10px;overflow-x:auto;font-size:13.5px;line-height:1.55;white-space:pre-wrap;}',
      '.rich-content code{background:var(--navy-soft,#E7ECF7);padding:1px 6px;border-radius:5px;font-size:.92em;}',
      '.rich-content pre code{background:none;padding:0;}',
      '.rich-content ul,.rich-content ol{padding-left:1.5em;margin:0 0 1em;}',
      '.rich-content li{margin:.25em 0;}',
      '.rich-content hr{border:none;border-top:1px solid var(--border,#E4E9F2);margin:2em 0;}',
      '.rich-content .ql-align-center{text-align:center;}.rich-content .ql-align-right{text-align:right;}.rich-content .ql-align-justify{text-align:justify;}',
      '.rich-content .ql-align-center img{margin-left:auto;margin-right:auto;}.rich-content .ql-align-right img{margin-left:auto;}',
      '.rich-content .ql-indent-1{margin-left:2em;}.rich-content .ql-indent-2{margin-left:4em;}.rich-content .ql-indent-3{margin-left:6em;}.rich-content .ql-indent-4{margin-left:8em;}',
      '.rich-content .ql-indent-5{margin-left:10em;}.rich-content .ql-indent-6{margin-left:12em;}.rich-content .ql-indent-7{margin-left:14em;}.rich-content .ql-indent-8{margin-left:16em;}',
      '.rich-content table{border-collapse:collapse;width:100%;margin:1.2em 0;font-size:.95em;display:block;overflow-x:auto;}',
      '.rich-content td,.rich-content th{border:1px solid var(--border,#CBD5E8);padding:8px 12px;vertical-align:top;min-width:70px;}',
      '.rich-content th{background:var(--surface,#F7F9FC);font-weight:700;color:var(--navy-dark,#071D52);}',
      '.rich-content ul[data-checked]{list-style:none;padding-left:.2em;}',
      '.rich-content ul[data-checked] li{position:relative;padding-left:1.9em;}',
      '.rich-content ul[data-checked] li::before{content:"";position:absolute;left:0;top:.38em;width:1.05em;height:1.05em;border:2px solid var(--navy,#0C2C74);border-radius:4px;box-sizing:border-box;}',
      '.rich-content ul[data-checked="true"] li::before{background:var(--gold,#F5A800);border-color:var(--gold,#F5A800);}',
      '.rich-content ul[data-checked="true"] li::after{content:"";position:absolute;left:.36em;top:.5em;width:.3em;height:.55em;border:solid var(--navy-dark,#071D52);border-width:0 2px 2px 0;transform:rotate(45deg);}',
      '.rich-content .rich-video{position:relative;width:100%;aspect-ratio:16/9;margin:16px 0;border-radius:12px;overflow:hidden;background:#000;}',
      '.rich-content .rich-video iframe{position:absolute;inset:0;width:100%;height:100%;border:0;}'
    ].join('\n');
    document.head.appendChild(st);
  }
  if (document.head) injectCss(); else document.addEventListener('DOMContentLoaded', injectCss);

  window.JCRich = { sanitize, render, toEditorHtml, escapeHtml, safeUrl, videoEmbedUrl, looksLikeHtml };
})();
