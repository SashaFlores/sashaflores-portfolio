// Minimal copy handler for buttons with [data-copy-target]
(() => {
  const ICON_DEFAULT = 'copy-outline';
  const ICON_SUCCESS = 'checkmark-circle-outline';

  function getText(el){ return (el.innerText || el.textContent || '').trim(); }

  async function copy(text){
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
    // Fallback
    return new Promise((res, rej) => {
      try{
        const ta = document.createElement('textarea');
        ta.value = text; ta.readOnly = true;
        ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); ta.remove(); res();
      }catch(e){ rej(e); }
    });
  }

  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.copy-btn[data-copy-target]');
    if (!btn) return;

    const target = document.querySelector(btn.getAttribute('data-copy-target'));
    if (!target) return;

    const text = getText(target);
    if (!text) return;

    const icon = btn.querySelector('ion-icon');
    const prevName = icon?.getAttribute('name') || ICON_DEFAULT;

    try{
      await copy(text);
      btn.classList.add('copied');
      if (icon) icon.setAttribute('name', ICON_SUCCESS);
      setTimeout(() => {
        btn.classList.remove('copied');
        if (icon) icon.setAttribute('name', prevName);
      }, 1200);
    }catch(e){
      console.error('Copy failed:', e);
    }
  });
})();
