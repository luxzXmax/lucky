/* Pemutar Musik — pengganti mini game.
   - Lagu bawaan: melodi orisinal (sintesis WebAudio, bebas hak cipta)
   - Dashboard: tempel link YouTube / Spotify / SoundCloud / file audio (.mp3 dll) atau pilih file dari perangkat
   - Volume: slider elastis (versi JavaScript biasa dari gaya ElasticSlider React Bits) */
(function(){
  const isEn=(()=>{try{return localStorage.getItem('fx-lang')==='en'}catch(e){return false}})();
  document.addEventListener('DOMContentLoaded',init);

  /* Album bawaan (Spotify). moods = urutan emosi boneka saat album ini dipilih */
  const ALBUMS=[
    {title:'Hindia — Lagu Populer (Top Tracks)',url:'https://open.spotify.com/artist/51kyrUsAVqUBcoDEMFkX12',moods:['happy','curious','sad']},
    {title:'Radiohead — OK Computer',              url:'https://open.spotify.com/album/6dVIqQ8qmQ5GBnJ9shOYGE',moods:['curious','sad']},
    {title:'NIKI — Nicole',                        url:'https://open.spotify.com/album/5WR7ksPLp3kqFbDLTYpGfx',moods:['happy','curious','happy']},
    {title:'Oasis — (What\'s the Story) Morning Glory?',url:'https://open.spotify.com/album/6ZCVkLPG3UxYqQRWq6nS2Q',moods:['happy','happy','curious']}
  ];
  const SAD=/sad|sedih|cry|tears?|lonely|goodbye|rain|hujan|pergi|patah|luka|menangis|kehilangan|alone|miss|rindu|lara|hurt|broken|blue/i;
  const HAPPY=/happy|joy|dance|party|bahagia|senang|sunshine|summer|love|cinta|fun|sing|smile|wonderwall|champagne/i;
  function guessMoods(title){
    if(SAD.test(title))return['sad','sad','curious'];
    if(HAPPY.test(title))return['happy','happy','curious'];
    return['curious','happy','sad'];
  }

  const T=isEn?{
    title:'Music <span>Player</span>',sub:'Pick a song below, or paste a link to play it right here.',
    idle:'Nothing playing',dash:'Dashboard',
    ph:'Paste a YouTube / Spotify / SoundCloud / .mp3 link',go:'Play',file:'Choose audio file',
    hint:'Supported: YouTube, Spotify, SoundCloud, and direct audio links (.mp3, .wav, .ogg…).',
    list:'Playlist',del:'Remove',vol:'Volume',prev:'Previous',next:'Next',play:'Play / pause',
    bad:'That does not look like a valid link.',fail:'Could not play this link. Check it is public and a direct audio/YouTube/Spotify/SoundCloud link.',
    yterr:'YouTube cannot load here (blocked or video not embeddable).',embedNote:'Use the Spotify player above (full tracks if you are logged in to Spotify, otherwise 30-second previews).',mood:{sad:'feeling sad',happy:'feeling happy',curious:'feeling curious',idle:'relaxed'},
    added:'Added to playlist'
  }:{
    title:'Pemutar <span>Musik</span>',sub:'Pilih lagu di bawah, atau tempel link lagu agar langsung bisa didengarkan di sini.',
    idle:'Belum ada lagu',dash:'Dashboard',
    ph:'Tempel link YouTube / Spotify / SoundCloud / .mp3',go:'Putar',file:'Pilih file audio',
    hint:'Didukung: YouTube, Spotify, SoundCloud, dan link audio langsung (.mp3, .wav, .ogg…).',
    list:'Daftar lagu',del:'Hapus',vol:'Volume',prev:'Sebelumnya',next:'Berikutnya',play:'Putar / jeda',
    bad:'Itu bukan link yang valid.',fail:'Link tidak bisa diputar. Pastikan link publik dan berupa link audio langsung / YouTube / Spotify / SoundCloud.',
    yterr:'YouTube tidak bisa dimuat (diblokir atau video tidak bisa disematkan).',embedNote:'Putar lewat pemutar Spotify di atas (lagu penuh jika Anda login Spotify, kalau tidak hanya pratinjau 30 detik).',mood:{sad:'lagi sedih',happy:'lagi senang',curious:'lagi penasaran',idle:'santai'},
    added:'Ditambahkan ke daftar'
  };

  const ICON={
    play:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
    pause:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.2"/><rect x="14" y="5" width="4" height="14" rx="1.2"/></svg>',
    prev:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><rect x="5" y="5" width="2.4" height="14" rx="1"/><path d="M19 6v12a.8.8 0 0 1-1.25.66L9.4 12.66a.8.8 0 0 1 0-1.32l8.35-6A.8.8 0 0 1 19 6z"/></svg>',
    next:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><rect x="16.6" y="5" width="2.4" height="14" rx="1"/><path d="M5 6v12a.8.8 0 0 0 1.25.66l8.35-6a.8.8 0 0 0 0-1.32l-8.35-6A.8.8 0 0 0 5 6z"/></svg>',
    volLow:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5v5h3.5l4.5 3.5v-12L7.5 9.5H4z"/><path d="M15.5 9.5a3.5 3.5 0 0 1 0 5"/></svg>',
    volHigh:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5v5h3.5l4.5 3.5v-12L7.5 9.5H4z"/><path d="M15.5 9.5a3.5 3.5 0 0 1 0 5"/><path d="M18 7a7 7 0 0 1 0 10"/></svg>',
    trash:'<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg>'
  };

  /* ---------- Slider elastis (vanilla) ---------- */
  function elasticSlider(host,opt){
    host.classList.add('es');
    host.innerHTML='<span class="es-ic">'+opt.iconL+'</span>'+
      '<div class="es-hit" tabindex="0" role="slider" aria-label="'+opt.label+'" aria-valuemin="0" aria-valuemax="100"><div class="es-track"><div class="es-fill"></div></div></div>'+
      '<span class="es-ic">'+opt.iconR+'</span>';
    const icL=host.children[0],hit=host.children[1],icR=host.children[2],fill=hit.querySelector('.es-fill');
    let v=opt.value,drag=false,box=null,over=0;
    function paint(){
      fill.style.width=(v*100)+'%';
      hit.setAttribute('aria-valuenow',Math.round(v*100));
      icL.classList.toggle('on',v<=0.001||over<0);
      icR.classList.toggle('on',v>=0.999||over>0);
    }
    function at(e){
      const raw=(e.clientX-box.left)/box.width;
      v=Math.min(1,Math.max(0,raw));
      const o=raw<0?raw:raw>1?raw-1:0;
      over=Math.sign(o);
      if(o){
        const px=Math.min(70,70*Math.tanh(Math.abs(o)*box.width/170));   // peregangan melambat makin jauh ditarik
        hit.style.transformOrigin=o>0?'left center':'right center';
        hit.style.transform='scaleX('+(1+px/box.width)+') scaleY('+(1-Math.min(.35,px/box.width*.8))+')';
      }else hit.style.transform='';
      paint();opt.onChange(v);
    }
    function release(){
      drag=false;over=0;hit.classList.remove('drag');hit.style.transform='';paint();   // transisi CSS = memantul kembali
    }
    hit.addEventListener('pointerdown',e=>{
      box=hit.getBoundingClientRect();drag=true;hit.classList.add('drag');
      try{hit.setPointerCapture(e.pointerId)}catch(_){}
      at(e);e.preventDefault();
    });
    hit.addEventListener('pointermove',e=>{if(drag)at(e)});
    hit.addEventListener('pointerup',release);
    hit.addEventListener('pointercancel',release);
    hit.addEventListener('keydown',e=>{
      const k=e.key;let d=0;
      if(k==='ArrowRight'||k==='ArrowUp')d=.05;else if(k==='ArrowLeft'||k==='ArrowDown')d=-.05;
      else if(k==='Home'){v=0;d=0.0001}else if(k==='End'){v=1;d=-0.0001}else return;
      v=Math.min(1,Math.max(0,v+d));paint();opt.onChange(v);e.preventDefault();
    });
    paint();
    return {set(x){v=x;paint()}};
  }

  /* ---------- Parsing link ---------- */
  function parseLink(raw){
    let u;try{u=new URL(String(raw).trim())}catch(e){return null}
    if(u.protocol!=='https:'&&u.protocol!=='http:')return null;
    const h=u.hostname.toLowerCase().replace(/^(www|m|music)\./,'');
    const p=u.pathname;
    if(h==='youtu.be'||h==='youtube.com'||h==='youtube-nocookie.com'){
      let id=null,m;
      if(h==='youtu.be')id=p.slice(1).split('/')[0];
      else if(p==='/watch')id=u.searchParams.get('v');
      else if((m=p.match(/^\/(?:shorts|embed|live|v)\/([\w-]{11})/)))id=m[1];
      if(id&&/^[\w-]{11}$/.test(id))return {type:'youtube',ref:id,key:'yt:'+id,url:u.href,title:'YouTube'};
      const list=u.searchParams.get('list');
      if(list&&/^[\w-]+$/.test(list))return {type:'youtube',list:list,key:'ytl:'+list,url:u.href,title:'YouTube playlist'};
      return null;
    }
    if(h==='open.spotify.com'){
      const m=p.match(/\/(track|album|playlist|episode|show|artist)\/([A-Za-z0-9]+)/);
      if(!m)return null;
      return {type:'embed',vendor:'spotify',key:'sp:'+m[1]+m[2],url:u.href,title:'Spotify',
        src:'https://open.spotify.com/embed/'+m[1]+'/'+m[2],h:m[1]==='track'||m[1]==='episode'?152:352};
    }
    if(h==='soundcloud.com'||h==='on.soundcloud.com'){
      return {type:'embed',vendor:'soundcloud',key:'sc:'+u.origin+u.pathname,url:u.href,title:'SoundCloud',
        src:'https://w.soundcloud.com/player/?auto_play=true&visual=false&url='+encodeURIComponent(u.href),h:166};
    }
    let name=decodeURIComponent(p.split('/').filter(Boolean).pop()||u.hostname).replace(/\.[a-z0-9]{2,5}$/i,'');
    return {type:'audio',key:'au:'+u.href,url:u.href,src:u.href,title:name||u.hostname};
  }

  const fmt=s=>{if(!isFinite(s)||s<0)return '0:00';s=Math.floor(s);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};

  function init(){
    const host=document.getElementById('sosmed');
    if(!host)return;
    host.insertAdjacentHTML('afterend',`
    <section id="musik">
      <h2 class="title">${T.title}</h2>
      <p class="mp-sub">${T.sub}</p>
      <div class="mp-wrap" id="mpRoot">
        <div class="mp-now">
          <div class="mp-mascot" id="mpMascot" data-mood="idle">
            <svg viewBox="0 0 140 132" width="92" height="86" aria-hidden="true">
              <ellipse class="m-shadow" cx="70" cy="122" rx="34" ry="6"/>
              <g class="m-all">
                <g class="m-body">
                  <circle class="m-skin" cx="32" cy="46" r="8"/><circle class="m-skin" cx="108" cy="46" r="8"/>
                  <ellipse class="m-skin" cx="70" cy="72" rx="50" ry="46"/>
                </g>
                <g class="m-face">
                  <path class="m-brow bl" d="M44 50 L62 50"/><path class="m-brow br" d="M78 50 L96 50"/>
                  <g class="m-eyes">
                    <g><circle cx="54" cy="66" r="9" fill="#14213d"/><circle class="m-pupil" cx="57" cy="63" r="3" fill="#fff"/></g>
                    <g><circle cx="86" cy="66" r="9" fill="#14213d"/><circle class="m-pupil" cx="89" cy="63" r="3" fill="#fff"/></g>
                  </g>
                  <g class="m-hy"><path d="M45 68 Q54 55 63 68"/><path d="M77 68 Q86 55 95 68"/></g>
                  <ellipse class="m-cheek" cx="42" cy="82" rx="8" ry="4.5"/><ellipse class="m-cheek" cx="98" cy="82" rx="8" ry="4.5"/>
                  <path class="mo mo-idle" d="M60 88 Q70 93 80 88"/>
                  <path class="mo mo-sad" d="M58 94 Q70 82 82 94"/>
                  <path class="mo mo-happy" d="M54 80 Q70 104 86 80 Q70 86 54 80 Z"/>
                  <ellipse class="mo mo-cur" cx="74" cy="90" rx="5" ry="6.5"/>
                </g>
                <path class="m-tear" d="M46 76 q-6 10 0 14 q6 -4 0 -14z"/>
                <text class="m-q" x="104" y="26">?</text>
                <text class="m-sp s1" x="14" y="30">✦</text><text class="m-sp s2" x="116" y="18">✦</text>
              </g>
            </svg>
          </div>
          <div class="mp-meta">
            <div class="mp-title" id="mpTitle">${T.idle}</div>
            <div class="mp-type" id="mpType">&nbsp;</div>
          </div>
          <div class="mp-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        </div>

        <div class="mp-video" id="mpVideo" hidden>
          <div class="mp-yt" id="mpYtWrap" hidden><div id="mpYt"></div></div>
          <div class="mp-embed" id="mpEmbed" hidden></div>
        </div>

        <div class="mp-ctrl">
          <div class="mp-seekrow">
            <span id="mpCur">0:00</span>
            <input type="range" id="mpSeek" min="0" max="1000" value="0" aria-label="Seek">
            <span id="mpDur">0:00</span>
          </div>
          <div class="mp-btns">
            <button type="button" id="mpPrev" aria-label="${T.prev}" title="${T.prev}">${ICON.prev}</button>
            <button type="button" id="mpPlay" class="mp-main" aria-label="${T.play}" title="${T.play}">${ICON.play}</button>
            <button type="button" id="mpNext" aria-label="${T.next}" title="${T.next}">${ICON.next}</button>
          </div>
          <div id="mpVol"></div>
        </div>

        <div class="mp-dash">
          <div class="mp-dash-h">${T.dash}</div>
          <form id="mpForm" class="mp-form" autocomplete="off">
            <input id="mpUrl" type="url" inputmode="url" placeholder="${T.ph}" aria-label="${T.ph}">
            <button type="submit">${T.go}</button>
          </form>
          <div class="mp-row2">
            <label class="mp-file">${T.file}<input id="mpFile" type="file" accept="audio/*" multiple hidden></label>
            <span class="mp-hint">${T.hint}</span>
          </div>
          <div class="mp-msg" id="mpMsg" role="status"></div>
          <div class="mp-dash-h mp-list-h">${T.list}</div>
          <ul class="mp-list" id="mpList"></ul>
        </div>
      </div>
    </section>`);

    const $=id=>document.getElementById(id);
    const root=$('mpRoot'),titleEl=$('mpTitle'),typeEl=$('mpType'),video=$('mpVideo'),ytWrap=$('mpYtWrap'),embedWrap=$('mpEmbed'),
          curEl=$('mpCur'),durEl=$('mpDur'),seek=$('mpSeek'),playBtn=$('mpPlay'),listEl=$('mpList'),msgEl=$('mpMsg'),urlIn=$('mpUrl');

    /* --- Daftar lagu --- */
    const KEY='mp-playlist';
    const tracks=ALBUMS.map(x=>{const p=parseLink(x.url);p.title=x.title;p.moods=x.moods;p.fixedMood=true;return p});
    try{
      JSON.parse(localStorage.getItem(KEY)||'[]').forEach(x=>{
        const p=x&&parseLink(x.url);if(!p||tracks.some(t=>t.key===p.key))return;
        if(x.title&&typeof x.title==='string')p.title=x.title.slice(0,120);
        p.custom=true;p.moods=guessMoods(p.title);tracks.push(p);
      });
    }catch(e){}
    function save(){
      try{localStorage.setItem(KEY,JSON.stringify(tracks.filter(t=>t.custom&&!t.local).map(t=>({url:t.url,title:t.title}))))}catch(e){}
    }

    let cur=-1,playing=false,vol=.7,token=0,seeking=false;
    function say(m,err){msgEl.textContent=m||'';msgEl.classList.toggle('err',!!err)}

    /* --- Engine: audio --- */
    const audio=new Audio();audio.preload='none';
    audio.addEventListener('ended',()=>next());
    audio.addEventListener('error',()=>{if(audio.getAttribute('src')){setPlaying(false);say(T.fail,true)}});
    audio.addEventListener('play',()=>setPlaying(true));
    audio.addEventListener('pause',()=>{if(tracks[cur]&&tracks[cur].type==='audio')setPlaying(false)});

    /* --- Engine: YouTube --- */
    let yt=null,ytLoading=null;
    function ytAPI(){
      return new Promise((res,rej)=>{
        if(window.YT&&YT.Player)return res();
        const prev=window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady=()=>{if(prev)prev();res()};
        if(!document.getElementById('yt-api')){
          const s=document.createElement('script');s.id='yt-api';s.src='https://www.youtube.com/iframe_api';
          s.onerror=()=>rej(new Error('yt'));document.head.appendChild(s);
        }
      });
    }
    function ytPlayer(){
      if(yt)return Promise.resolve(yt);
      if(ytLoading)return ytLoading;
      ytLoading=ytAPI().then(()=>new Promise(res=>{
        const p=new YT.Player('mpYt',{width:'100%',height:'100%',playerVars:{playsinline:1,rel:0},
          events:{
            onReady:()=>{yt=p;try{p.setVolume(vol*100)}catch(e){}res(p)},
            onStateChange:ev=>{
              const t=tracks[cur];if(!t||t.type!=='youtube')return;
              if(ev.data===1){
                setPlaying(true);
                try{const n=p.getVideoData().title;if(n&&t.title!==n){t.title=n;if(!t.fixedMood)t.moods=guessMoods(n);titleEl.textContent=n;save();renderList()}}catch(e){}
              }else if(ev.data===2)setPlaying(false);
              else if(ev.data===0){setPlaying(false);if(!t.list)next()}
            },
            onError:()=>{setPlaying(false);say(T.yterr,true)}
          }});
      }));
      ytLoading.catch(()=>{ytLoading=null});
      return ytLoading;
    }
    function ytLoad(t,play,my){
      ytPlayer().then(p=>{
        if(my!==token)return;
        if(t.list)p[play?'loadPlaylist':'cuePlaylist']({list:t.list,listType:'playlist'});
        else p[play?'loadVideoById':'cueVideoById'](t.ref);
        try{p.setVolume(vol*100)}catch(e){}
      }).catch(()=>{if(my===token){setPlaying(false);say(T.yterr,true)}});
    }

    /* --- Kontrol umum --- */
    const mascot=$('mpMascot');let moodI=0,mood='idle';
    function alive(){const t=tracks[cur];return playing||(t&&t.type==='embed')}
    function showMood(m){
      mood=m;mascot.dataset.mood=m;
      const t=tracks[cur];typeEl.textContent=t?typeLabel(t)+' · '+T.mood[m]:'\u00a0';
    }
    function refreshMood(){
      root.classList.toggle('alive',!!alive());
      const t=tracks[cur];const list=(t&&t.moods)||['curious'];
      showMood(alive()?list[moodI%list.length]:'idle');
    }
    setInterval(()=>{if(alive()){const t=tracks[cur];moodI=(moodI+1)%((t.moods||['curious']).length);refreshMood()}},6500);
    function setPlaying(b){
      playing=b;root.classList.toggle('playing',b);
      playBtn.innerHTML=b?ICON.pause:ICON.play;refreshMood();
    }
    function stopAll(){
      token++;
      audio.pause();audio.removeAttribute('src');audio.load();
      if(yt){try{yt.stopVideo()}catch(e){}}
      ytWrap.hidden=true;embedWrap.replaceChildren();embedWrap.hidden=true;video.hidden=true;
      setPlaying(false);
    }
    function typeLabel(t){
      return t.type==='youtube'?'YouTube':t.type==='embed'?(t.vendor==='spotify'?'Spotify':'SoundCloud'):(t.local?'File':'Audio');
    }
    function select(i,play){
      if(i<0||i>=tracks.length)return;
      stopAll();say('');
      cur=i;const t=tracks[i],my=token;
      titleEl.textContent=t.title;moodI=0;
      const timed=t.type==='audio'||t.type==='youtube';
      seek.disabled=!timed;root.classList.toggle('no-play',t.type==='embed');
      playBtn.disabled=t.type==='embed';
      curEl.textContent='0:00';durEl.textContent=t.type==='embed'?'—':'0:00';seek.value=0;
      if(t.type==='audio'){
        audio.src=t.src;audio.volume=vol;
        if(play)audio.play().catch(()=>{setPlaying(false);say(T.fail,true)});
      }else if(t.type==='youtube'){
        video.hidden=false;ytWrap.hidden=false;ytLoad(t,play,my);
      }else if(t.type==='embed'){
        video.hidden=false;embedWrap.hidden=false;
        const f=document.createElement('iframe');
        f.src=t.src;f.height=t.h;f.width='100%';f.loading='lazy';f.title=t.title;
        f.allow='autoplay; encrypted-media; clipboard-write; fullscreen';f.setAttribute('frameborder','0');
        embedWrap.appendChild(f);setPlaying(false);say(T.embedNote);
      }
      refreshMood();renderList();
    }
    function next(){select((cur+1)%tracks.length,true)}
    function prev(){
      const t=tracks[cur];
      if(t&&t.type==='audio'&&audio.currentTime>3){audio.currentTime=0;return}
      if(t&&t.type==='youtube'&&yt&&yt.getCurrentTime&&yt.getCurrentTime()>3){yt.seekTo(0);return}
      select((cur-1+tracks.length)%tracks.length,true);
    }
    function toggle(){
      if(cur<0){select(0,true);return}
      const t=tracks[cur];
      if(t.type==='audio'){playing?audio.pause():audio.play().catch(()=>say(T.fail,true))}
      else if(t.type==='youtube'&&yt){playing?yt.pauseVideo():yt.playVideo()}
    }

    /* --- Daftar & dashboard --- */
    function renderList(){
      listEl.replaceChildren();
      tracks.forEach((t,i)=>{
        const li=document.createElement('li');if(i===cur)li.className='on';
        const b=document.createElement('button');b.type='button';b.className='mp-item';
        const n=document.createElement('span');n.className='mp-n';n.textContent=i===cur&&playing?'♪':String(i+1);
        const tt=document.createElement('span');tt.className='mp-t';tt.textContent=t.title;
        const k=document.createElement('span');k.className='mp-k';k.textContent=typeLabel(t);
        b.append(n,tt,k);b.addEventListener('click',()=>select(i,true));li.appendChild(b);
        if(t.custom){
          const d=document.createElement('button');d.type='button';d.className='mp-del';d.title=T.del;d.setAttribute('aria-label',T.del+': '+t.title);
          d.innerHTML=ICON.trash;d.addEventListener('click',()=>removeTrack(i));li.appendChild(d);
        }
        listEl.appendChild(li);
      });
    }
    function removeTrack(i){
      const t=tracks[i];if(t.local&&t.src)try{URL.revokeObjectURL(t.src)}catch(e){}
      const wasCur=i===cur;tracks.splice(i,1);save();
      if(wasCur){stopAll();cur=-1;titleEl.textContent=T.idle;typeEl.textContent=' ';select(Math.min(i,tracks.length-1),false)}
      else{if(i<cur)cur--;renderList()}
    }
    function enrich(t){
      const ep=t.vendor==='spotify'?'https://open.spotify.com/oembed?url=':t.vendor==='soundcloud'?'https://soundcloud.com/oembed?format=json&url=':null;
      if(!ep)return;
      fetch(ep+encodeURIComponent(t.url)).then(r=>r.ok?r.json():null).then(j=>{
        if(j&&j.title){t.title=String(j.title).slice(0,120);t.moods=guessMoods(t.title);if(tracks[cur]===t)titleEl.textContent=t.title;save();renderList()}
      }).catch(()=>{});
    }
    function addLink(raw){
      const p=parseLink(raw);
      if(!p){say(T.bad,true);return false}
      const ex=tracks.findIndex(t=>t.key===p.key);
      if(ex>=0){select(ex,true);return true}
      p.custom=true;p.moods=guessMoods(p.title);tracks.push(p);save();enrich(p);select(tracks.length-1,true);return true;
    }
    $('mpForm').addEventListener('submit',e=>{
      e.preventDefault();const v=urlIn.value.trim();if(!v)return;
      if(addLink(v))urlIn.value='';
    });
    $('mpFile').addEventListener('change',e=>{
      const fs=[...e.target.files].filter(f=>/^audio\//.test(f.type)||/\.(mp3|wav|ogg|m4a|aac|flac|opus|weba)$/i.test(f.name));
      if(!fs.length)return;
      let first=-1;
      fs.forEach(f=>{
        const key='file:'+f.name+f.size+f.lastModified;
        let i=tracks.findIndex(t=>t.key===key);
        if(i<0){tracks.push({type:'audio',key:key,local:true,custom:true,src:URL.createObjectURL(f),title:f.name.replace(/\.[^.]+$/,'')});i=tracks.length-1}
        if(first<0)first=i;
      });
      e.target.value='';select(first,true);
    });

    /* --- Transport --- */
    playBtn.addEventListener('click',toggle);
    $('mpNext').addEventListener('click',next);
    $('mpPrev').addEventListener('click',prev);
    seek.addEventListener('pointerdown',()=>{seeking=true});
    seek.addEventListener('pointerup',()=>{seeking=false});
    seek.addEventListener('input',()=>{
      const t=tracks[cur];if(!t)return;const f=seek.value/1000;
      if(t.type==='audio'&&isFinite(audio.duration))audio.currentTime=f*audio.duration;
      else if(t.type==='youtube'&&yt&&yt.getDuration)yt.seekTo(f*yt.getDuration(),true);
    });
    setInterval(()=>{
      const t=tracks[cur];if(!t)return;
      let c=0,d=0;
      if(t.type==='audio'){c=audio.currentTime;d=audio.duration}
      else if(t.type==='youtube'&&yt&&yt.getCurrentTime){try{c=yt.getCurrentTime();d=yt.getDuration()}catch(e){return}}
      else return;
      curEl.textContent=fmt(c);durEl.textContent=isFinite(d)&&d>0?fmt(d):'0:00';
      if(!seeking&&d>0&&isFinite(d))seek.value=Math.round(c/d*1000);
    },400);

    /* --- Volume (slider elastis) --- */
    function applyVol(){
      audio.volume=vol;
      if(yt){try{yt.setVolume(vol*100)}catch(e){}}
    }
    elasticSlider($('mpVol'),{value:vol,label:T.vol,iconL:ICON.volLow,iconR:ICON.volHigh,onChange:v=>{vol=v;applyVol()}});

    renderList();
    select(0,false);
  }
})();
