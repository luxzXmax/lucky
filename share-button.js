/* Tombol copy link / share ringan, bisa dipakai di halaman mana saja */
(function(){
  const lang=(document.documentElement.lang||'id').startsWith('en')?'en':'id';
  const T={id:{copied:'Link disalin!',title:'Bagikan halaman ini'},en:{copied:'Link copied!',title:'Share this page'}}[lang];
  const css=`#fxShare{position:fixed;right:18px;bottom:18px;z-index:60;width:48px;height:48px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:rgba(20,24,38,.85);color:#fff;font-size:19px;cursor:pointer;backdrop-filter:blur(10px);box-shadow:0 6px 20px rgba(0,0,0,.35)}
#fxShareMsg{position:fixed;left:50%;bottom:24px;transform:translate(-50%,20px);z-index:70;background:#f2c14e;color:#fff;padding:10px 20px;border-radius:30px;font:600 14px Arial,sans-serif;opacity:0;pointer-events:none;transition:.3s;white-space:nowrap}
#fxShareMsg.show{opacity:1;transform:translate(-50%,0)}`;
  const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
  document.body.insertAdjacentHTML('beforeend','<button id="fxShare" aria-label="Share">🔗</button><div id="fxShareMsg"></div>');
  function flash(){const m=document.getElementById('fxShareMsg');m.textContent=T.copied;m.classList.add('show');clearTimeout(flash._t);flash._t=setTimeout(()=>m.classList.remove('show'),1800)}
  document.getElementById('fxShare').onclick=async()=>{
    const url=location.href;
    if(navigator.share){try{await navigator.share({title:document.title,text:T.title,url});return}catch(e){if(e&&e.name==='AbortError')return}}
    try{await navigator.clipboard.writeText(url);flash()}
    catch(e){const ta=document.createElement('textarea');ta.value=url;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();flash()}
  };
})();
