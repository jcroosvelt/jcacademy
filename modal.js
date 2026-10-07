// modal.js — Remplace la boîte de dialogue native prompt() du navigateur
// (moche, non personnalisable) par une fenêtre stylée cohérente avec le
// reste du site. Utilisation identique à prompt() mais avec "await" :
//   const titre = await showPrompt('Titre du nouveau module :');
// Renvoie null si l'utilisateur annule, sinon le texte saisi.

function showPrompt(message, defaultValue = ''){
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(12,44,116,.45);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;';

    const card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:16px;padding:26px;max-width:380px;width:100%;box-shadow:0 20px 50px rgba(0,0,0,.25);font-family:Inter,sans-serif;';

    const msg = document.createElement('p');
    msg.textContent = message;
    msg.style.cssText = 'margin:0 0 14px;font-size:15px;font-weight:600;color:#14213D;';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = defaultValue;
    input.style.cssText = 'width:100%;padding:11px 13px;border:1.5px solid #E4E9F2;border-radius:10px;font-size:14px;font-family:inherit;margin-bottom:18px;box-sizing:border-box;';

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;gap:10px;';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Annuler';
    cancelBtn.style.cssText = 'background:none;border:1.5px solid #E4E9F2;border-radius:10px;padding:9px 16px;font-weight:700;font-size:14px;cursor:pointer;color:#5B6B85;font-family:inherit;';

    const okBtn = document.createElement('button');
    okBtn.type = 'button';
    okBtn.textContent = 'OK';
    okBtn.style.cssText = 'background:#0C2C74;color:#fff;border:none;border-radius:10px;padding:9px 18px;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit;';

    function close(value){
      document.body.removeChild(overlay);
      resolve(value);
    }

    cancelBtn.addEventListener('click', () => close(null));
    okBtn.addEventListener('click', () => close(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter'){ e.preventDefault(); close(input.value); }
      if (e.key === 'Escape') close(null);
    });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(null); });

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(okBtn);
    card.appendChild(msg);
    card.appendChild(input);
    card.appendChild(btnRow);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    input.focus();
    input.select();
  });
}

// showConfirm('Supprimer ce cours ?') -> Promise<boolean>
// Remplace confirm() nativement. Le bouton de confirmation est en rouge
// pour les actions de suppression (detection simple sur le mot "supprimer").
function showConfirm(message){
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(12,44,116,.45);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;';

    const card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:16px;padding:26px;max-width:380px;width:100%;box-shadow:0 20px 50px rgba(0,0,0,.25);font-family:Inter,sans-serif;';

    const msg = document.createElement('p');
    msg.textContent = message;
    msg.style.cssText = 'margin:0 0 20px;font-size:15px;font-weight:600;color:#14213D;line-height:1.5;';

    const isDanger = /supprim/i.test(message);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;justify-content:flex-end;gap:10px;';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Annuler';
    cancelBtn.style.cssText = 'background:none;border:1.5px solid #E4E9F2;border-radius:10px;padding:9px 16px;font-weight:700;font-size:14px;cursor:pointer;color:#5B6B85;font-family:inherit;';

    const okBtn = document.createElement('button');
    okBtn.type = 'button';
    okBtn.textContent = isDanger ? 'Supprimer' : 'Confirmer';
    okBtn.style.cssText = `background:${isDanger ? '#C0392B' : '#0C2C74'};color:#fff;border:none;border-radius:10px;padding:9px 18px;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit;`;

    function close(value){
      document.body.removeChild(overlay);
      resolve(value);
    }

    cancelBtn.addEventListener('click', () => close(false));
    okBtn.addEventListener('click', () => close(true));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
    document.addEventListener('keydown', function onKey(e){
      if (e.key === 'Escape'){ document.removeEventListener('keydown', onKey); close(false); }
    });

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(okBtn);
    card.appendChild(msg);
    card.appendChild(btnRow);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    okBtn.focus();
  });
}

window.showPrompt = showPrompt;
window.showConfirm = showConfirm;
