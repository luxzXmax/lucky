(function(){
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const store={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
const root=document.documentElement;
let lang=store.get('fx-lang')||'id', theme=store.get('fx-theme')||'dark', clockOn=store.get('fx-clock')==='1';

/* ---- Teks UI ---- */
const T={
 id:{menu:'Menu',theme:'Mode',dark:'Gelap',light:'Terang',lang:'Bahasa',anim:'Animasi scroll',full:'Fullscreen',dash:'Dashboard statistik',clock:'Jam digital',cal:'Kalender',video:'Background video',on:'ON',off:'OFF',
  visits:'Total kunjungan',time:'Waktu di halaman',scroll:'Posisi scroll',sec:'Bagian aktif',secs:'Jumlah bagian',screen:'Ukuran layar',vTitle:'Background Video',vFile:'Pilih file video dari perangkat',vUrl:'Atau tempel link video (.mp4 / .webm)',vApply:'Pasang',vReset:'Reset default',vHide:'Matikan video',vShow:'Nyalakan video',
  mo:['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],dy:['Min','Sen','Sel','Rab','Kam','Jum','Sab'],today:'Hari ini'},
 en:{menu:'Menu',theme:'Mode',dark:'Dark',light:'Light',lang:'Language',anim:'Scroll animation',full:'Fullscreen',dash:'Statistics dashboard',clock:'Digital clock',cal:'Calendar',video:'Video background',on:'ON',off:'OFF',
  visits:'Total visits',time:'Time on page',scroll:'Scroll position',sec:'Active section',secs:'Total sections',screen:'Screen size',vTitle:'Video Background',vFile:'Choose a video file from your device',vUrl:'Or paste a video link (.mp4 / .webm)',vApply:'Apply',vReset:'Reset default',vHide:'Turn video off',vShow:'Turn video on',
  mo:['January','February','March','April','May','June','July','August','September','October','November','December'],dy:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],today:'Today'}
};
T.id.vSaved='Tersimpan! Semua pengunjung akan melihat background ini.';T.en.vSaved='Saved! All visitors will now see this background.';
T.id.vFail='Gagal menyimpan. Pastikan sudah login di admin dan tabel site_settings sudah dibuat.';T.en.vFail='Failed to save. Make sure you are logged in at admin and the site_settings table exists.';
T.id.vBusy='Mengunggah...';T.en.vBusy='Uploading...';
T.id.copied='Link disalin!';T.en.copied='Link copied!';
T.id.shareTitle='Bagikan halaman ini';T.en.shareTitle='Share this page';
const t=k=>T[lang][k];

/* ---- Terjemahan konten (Indonesia -> English) ---- */
const EN={
'TUGAS & PRAKTIK':'TASKS & PRACTICE','KARYA TULISAN':'WRITINGS','PRESTASI':'ACHIEVEMENTS','SERTIFIKAT':'CERTIFICATES','PENGALAMAN':'EXPERIENCE','SOSMED':'SOCIALS',
'Halo, Saya':"Hi, I'm",'Web portfolio':'Web portfolio',
'Saya adalah murid dari SMK 5 Sukoharjo. Hobi saya adalah badminton dan bermain game. Harapan saya setelah lulus ingin menjadi orang sukses, dan dapat membanggakan orang tua saya.':'I am a student at SMK 5 Sukoharjo. My hobbies are badminton and playing games. After graduating, I hope to become successful and make my parents proud.',
'Cek menu navigasi di atas ya!':'Check the navigation menu above!','Scroll Down':'Scroll Down',
'Nama:':'Name:','Tanggal Lahir:':'Date of Birth:','Alamat:':'Address:','Hobi:':'Hobbies:','Moto:':'Motto:','Asal Sekolah:':'School:',
'Bermain game, badminton, dan mendengarkan musik':'Playing games, badminton, and listening to music','Jika orang lain bisa maka saya juga harus bisa':'If others can do it, so must I',
'Soft Skill Saya':'My Soft Skills','Hard Skill Saya':'My Hard Skills',
'Cepat belajar dan suka mencoba hal baru':'Fast learner who loves trying new things','Mau menerima kritik dan belajar dari kesalahan':'Open to criticism and learns from mistakes',
'Menggunakan AI untuk membantu mencari ide dan menyelesaikan tugas':'Using AI to help find ideas and complete tasks','Dasar HTML, CSS, dan JavaScript':'Basic HTML, CSS, and JavaScript','Membuat dan mengedit website sederhana':'Building and editing simple websites',
'Saya orangnya suka mencoba hal-hal baru dan mencari pengalaman yang berbeda.':'I like trying new things and looking for different experiences.',
'Kelas X':'Grade X','Kelas XI':'Grade XI','Kelas XII':'Grade XII','Tugas Sekolah Kelas X':'School Assignments Grade X','Tugas Sekolah Kelas XI':'School Assignments Grade XI','Tugas Sekolah Kelas XII':'School Assignments Grade XII',
'Makalah, artikel, essay, dan laporan saya.':'My papers, articles, essays, and reports.','Project dan Karya':'Projects & Works','Kumpulan project dan karya saya.':'A collection of my projects and works.',
'Prestasi':'Achievements','Kumpulan prestasi dan pencapaian saya.':'A collection of my achievements.','Sertifikat':'Certificates','Sertifikat resmi dan pelatihan yang saya ikuti.':'Official certificates and trainings I attended.',
'Pengalaman':'Experience','PKL/Magang, organisasi, dan kegiatan IT saya.':'My internship, organizations, and IT activities.',
'Kamu bisa menghubungi saya melalui:':'You can reach me through:'};
const TITLES={about:'About <span>Me</span>',school:'School <span>Projects</span>','karya-tulisan':'Writ<span>ings</span>',projects:'My <span>Projects</span>',prestasi:'My <span>Achievements</span>',sertifikat:'Certifi<span>cates</span>',pengalaman:'Experi<span>ence</span>',sosmed:'Social <span>Media</span>',contact:'Contact <span>Me</span>'};
const N=s=>s.replace(/\s+/g,' ').trim();
const nodes=[],titles=[];
const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
let n;while(n=walker.nextNode()){if(n.parentNode.closest('script,style,#fxPanel,.fx-modal,#fxClock,.fx-fab'))continue;const k=N(n.nodeValue);if(EN[k])nodes.push([n,n.nodeValue,k]);}
$$('section h2.title').forEach(h=>{const id=h.closest('section').id;if(TITLES[id])titles.push([h,h.innerHTML,id]);});
const nav=$$('nav a');
function applyContent(){
  nodes.forEach(([node,orig,k])=>{node.nodeValue=lang==='en'?orig.replace(N(orig),EN[k]):orig;});
  titles.forEach(([h,orig,id])=>{h.innerHTML=lang==='en'?TITLES[id]:orig;});
  root.lang=lang;
}

/* ---- Bangun UI ---- */
document.body.insertAdjacentHTML('beforeend',`
<button class="fx-fab" id="fxMenuBtn">☰ <span data-t="menu"></span></button>
<button class="fx-fab" id="fxTop" aria-label="Back to top">↑</button>
<button class="fx-fab" id="fxShare" aria-label="Share">🔗</button>
<div id="fxShareMsg"></div>
<div id="fxClock"><b></b><small></small></div>
<div id="fxPanel">
 <button class="fx-item" data-a="theme"><span class="fx-ic">🌙</span><span data-t="theme"></span><b></b></button>
 <button class="fx-item" data-a="lang"><span class="fx-ic">🌐</span><span data-t="lang"></span><b></b></button>
 <button class="fx-item" data-a="dash"><span class="fx-ic">📊</span><span data-t="dash"></span></button>
 <button class="fx-item" data-a="clock"><span class="fx-ic">🕐</span><span data-t="clock"></span><b></b></button>
 <button class="fx-item fx-admin" data-a="cal"><span class="fx-ic">📅</span><span data-t="cal"></span></button>
 <button class="fx-item fx-admin" data-a="video"><span class="fx-ic">🎬</span><span data-t="video"></span></button>
</div>
<div class="fx-modal" id="mDash"><div class="fx-box"><h3><span data-t="dash"></span><button class="fx-x">×</button></h3><div class="fx-stats" id="stats"></div></div></div>
<div class="fx-modal" id="mCal"><div class="fx-box"><h3><span data-t="cal"></span><button class="fx-x">×</button></h3><div class="fx-cal-h"><button id="cPrev">‹</button><strong id="cTitle"></strong><button id="cNext">›</button></div><div class="fx-cal" id="cGrid"></div></div></div>
<div class="fx-modal" id="mVid"><div class="fx-box"><h3><span data-t="vTitle"></span><button class="fx-x">×</button></h3><div class="fx-vid">
 <label data-t="vFile"></label><input type="file" id="vFile" accept="video/*">
 <label data-t="vUrl"></label><input type="text" id="vUrl" placeholder="https://.../video.mp4">
 <button id="vApply" data-t="vApply"></button><button id="vReset" data-t="vReset"></button><small id="vMsg"></small></div></div></div>`);
const panel=$('#fxPanel'),clock=$('#fxClock'),video=$('.bg-video');
const defVideo=video&&$('source',video)?$('source',video).getAttribute('src'):'';
let calDate=new Date();

function refresh(){
  $$('[data-t]').forEach(e=>e.textContent=t(e.dataset.t));
  const sw=on=>on?t('on'):t('off');
  $('[data-a=theme] b').textContent=theme==='dark'?t('dark'):t('light');
  $('[data-a=theme] .fx-ic').textContent=theme==='dark'?'🌙':'☀️';
  $('[data-a=lang] b').textContent=lang==='id'?'Indonesia':'English';
  $('[data-a=clock] b').textContent=sw(clockOn);
  root.dataset.theme=theme;
  clock.classList.toggle('show',clockOn);
  applyContent();tick();renderCal();renderStats();
}

/* ---- Aksi ---- */
const A={
 theme(){theme=theme==='dark'?'light':'dark';store.set('fx-theme',theme);refresh()},
 lang(){lang=lang==='id'?'en':'id';store.set('fx-lang',lang);refresh()},
 dash(){open('#mDash')},
 clock(){clockOn=!clockOn;store.set('fx-clock',clockOn?'1':'0');refresh()},
 cal(){if(!isAdmin)return;calDate=new Date();renderCal();open('#mCal')},
 video(){if(!isAdmin)return;open('#mVid')}
};
function open(s){$(s).classList.add('open');panel.classList.remove('open');renderStats()}
panel.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b)A[b.dataset.a]()});
$('#fxMenuBtn').onclick=()=>panel.classList.toggle('open');
$$('.fx-modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m||e.target.closest('.fx-x'))m.classList.remove('open')}));
document.addEventListener('click',e=>{if(!e.target.closest('#fxPanel,#fxMenuBtn'))panel.classList.remove('open')});
$('#fxTop').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});

/* ---- Copy link / share ---- */
function flashShareMsg(){const m=$('#fxShareMsg');m.textContent=t('copied');m.classList.add('show');clearTimeout(flashShareMsg._t);flashShareMsg._t=setTimeout(()=>m.classList.remove('show'),1800)}
$('#fxShare').onclick=async()=>{
  const url=location.href;
  if(navigator.share){try{await navigator.share({title:document.title,text:t('shareTitle'),url});return}catch(e){if(e&&e.name==='AbortError')return}}
  try{await navigator.clipboard.writeText(url);flashShareMsg()}
  catch(e){const ta=document.createElement('textarea');ta.value=url;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();flashShareMsg()}
};

/* ---- Jam ---- */
function tick(){const d=new Date(),loc=lang==='id'?'id-ID':'en-US';
  $('b',clock).textContent=d.toLocaleTimeString(loc,{hour12:false});
  $('small',clock).textContent=d.toLocaleDateString(loc,{weekday:'long',day:'numeric',month:'long',year:'numeric'});}
setInterval(tick,1000);

/* ---- Kalender ---- */
function renderCal(){
  const y=calDate.getFullYear(),m=calDate.getMonth(),now=new Date();
  $('#cTitle').textContent=t('mo')[m]+' '+y;
  let h=t('dy').map(d=>`<span class="d">${d}</span>`).join('');
  const first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();
  for(let i=0;i<first;i++)h+='<span></span>';
  for(let d=1;d<=days;d++){const td=d===now.getDate()&&m===now.getMonth()&&y===now.getFullYear();h+=`<span class="${td?'today':''}">${d}</span>`}
  $('#cGrid').innerHTML=h;
}
$('#cPrev').onclick=()=>{calDate.setMonth(calDate.getMonth()-1);renderCal()};
$('#cNext').onclick=()=>{calDate.setMonth(calDate.getMonth()+1);renderCal()};

/* ---- Dashboard ---- */
const visits=(+store.get('fx-visits')||0)+1;store.set('fx-visits',visits);
const start=Date.now();
function pct(){const h=root.scrollHeight-innerHeight;return h>0?Math.round(scrollY/h*100):0}
function renderStats(){
  if(!$('#mDash').classList.contains('open'))return;
  const s=Math.floor((Date.now()-start)/1000),act=$('nav a.active');
  const rows=[[t('visits'),visits],[t('time'),Math.floor(s/60)+'m '+s%60+'s'],[t('sec'),act?act.textContent.trim():'-'],[t('secs'),nav.length],[t('screen'),innerWidth+'×'+innerHeight],[t('scroll'),pct()+'%']];
  $('#stats').innerHTML=rows.map(r=>`<div class="fx-stat"><small>${r[0]}</small><strong>${r[1]}</strong></div>`).join('')+`<div class="fx-prog"><i style="width:${pct()}%"></i></div>`;
}
setInterval(renderStats,1000);

/* ---- Akses admin: hanya yang sudah login Supabase ---- */
let isAdmin=false;
function setAdmin(v){isAdmin=v;root.classList.toggle('is-admin',v);if(!v)['#mCal','#mVid'].forEach(x=>$(x).classList.remove('open'))}
const hasDB=typeof supabaseClient!=='undefined';
if(hasDB){supabaseClient.auth.getSession().then(({data})=>setAdmin(!!data.session)).catch(()=>{});supabaseClient.auth.onAuthStateChange((_e,ses)=>setAdmin(!!ses))}

/* ---- Background video: disimpan di database, dilihat semua pengunjung ---- */
const vMsg=m=>{$('#vMsg').textContent=m};
const conn=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
const slowNet=!!(conn&&(conn.saveData||/2g/.test(conn.effectiveType||'')));
function setVideo(src){
  if(!video)return;
  if(slowNet){video.removeAttribute('src');video.load();return} // hemat data: cukup pakai poster
  video.src=src;video.preload='auto';video.load();video.play().catch(()=>{});
}
async function saveVideo(url){
  try{
    const r=url?await supabaseClient.from('site_settings').upsert({key:'bg_video_url',value:url,updated_at:new Date().toISOString()}):await supabaseClient.from('site_settings').delete().eq('key','bg_video_url');
    if(r.error)throw r.error;setVideo(url||defVideo);vMsg(t('vSaved'));
  }catch(e){vMsg(t('vFail'))}
}
$('#vFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;vMsg(t('vBusy'));
  try{const name='bg/'+Date.now()+'-'+f.name.replace(/[^\w.-]/g,'_');
    const u=await supabaseClient.storage.from('media').upload(name,f);if(u.error)throw u.error;
    await saveVideo(supabaseClient.storage.from('media').getPublicUrl(name).data.publicUrl);
  }catch(err){vMsg(t('vFail'))}};
$('#vApply').onclick=()=>{const u=$('#vUrl').value.trim();if(u)saveVideo(u)};
$('#vReset').onclick=()=>saveVideo('');
if(hasDB)supabaseClient.from('site_settings').select('value').eq('key','bg_video_url').maybeSingle().then(({data})=>{if(data&&data.value)setVideo(data.value)}).catch(()=>{});

/* ---- Scroll: back to top + animasi muncul ---- */
addEventListener('scroll',()=>$('#fxTop').classList.toggle('show',scrollY>400),{passive:true});
const rv=$$('.title,.about-wrap,.projects,.sosmed-grid,.contact p,.contact .buttons');
rv.forEach(e=>e.classList.add('reveal'));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
rv.forEach(e=>io.observe(e));

/* ---- Animasi tap ---- */
addEventListener('pointerdown',e=>{const r=document.createElement('span');r.className='fx-ripple';r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';document.body.appendChild(r);setTimeout(()=>r.remove(),650)});

refresh();
})();
