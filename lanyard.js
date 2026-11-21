// Lanyard — versi vanilla JS (tanpa React) untuk portofolio HTML statis.
// Terinspirasi dari komponen React Bits <Lanyard /> (https://reactbits.dev/components/lanyard).
// Kartu badge 3D menggantung di tali: bisa diseret, dilempar, atau diklik untuk dibalik.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const DEFAULTS = {
  frontImage: '',          // foto untuk sisi depan kartu (opsional, boleh kosong)
  backImage: '',           // gambar sisi belakang (opsional; kalau kosong digambar otomatis)
  strapImage: '',          // gambar tali (opsional; kalau kosong digambar otomatis)
  tag: '@lucky',           // teks tag di kartu
  name: 'Faruq Lucky Ardhatha',
  subtitle: 'SMK Negeri 5 Sukoharjo',
  accent: '#f2c14e',
  focusY: 0.5,             // titik fokus vertikal foto (0 = atas, 1 = bawah)
  gravity: 30,
  damping: 0.965,          // makin kecil = makin cepat diam
  breeze: 0,               // angin acak (0 = diam total saat tidak disentuh)
};

const CARD_W = 1.6;
const CARD_H = 2.5;
const RING_D = CARD_H / 2 + 0.12;   // jarak cincin ke pusat kartu
const VIEW_H = 5.0;                  // tinggi area pandang (unit dunia)
const ANCHOR_Y = VIEW_H / 2 + 0.25;  // titik gantung, sedikit di atas canvas
const SEGMENTS = 9;
const STRAP_LEN = 2.2;
const STRAP_W = 0.16;
const STEP = 1 / 60;

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function isTainted(canvas) {
  try { canvas.getContext('2d').getImageData(0, 0, 1, 1); return false; } catch (e) { return true; }
}

const FONT = '"Segoe UI", Roboto, Helvetica, Arial, sans-serif';

function drawFront(o, photo) {
  const c = document.createElement('canvas');
  c.width = 640; c.height = 1000;
  const g = c.getContext('2d');

  const bg = g.createLinearGradient(0, 0, 640, 1000);
  bg.addColorStop(0, '#0d1428');
  bg.addColorStop(1, '#1b2a52');
  g.fillStyle = bg;
  g.fillRect(0, 0, 640, 1000);

  // aksen cahaya
  const glow = g.createRadialGradient(540, 120, 10, 540, 120, 380);
  glow.addColorStop(0, 'rgba(242,193,78,.35)');
  glow.addColorStop(1, 'rgba(242,193,78,0)');
  g.fillStyle = glow;
  g.fillRect(0, 0, 640, 1000);

  // lubang tali
  g.fillStyle = '#05070f';
  roundRect(g, 260, 52, 120, 26, 13); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2; g.stroke();

  // foto
  const px = 40, py = 116, pw = 560, ph = 600;
  g.save();
  roundRect(g, px, py, pw, ph, 28); g.clip();
  g.fillStyle = '#0a0f1e';
  g.fillRect(px, py, pw, ph);
  if (photo) {
    const scale = Math.max(pw / photo.width, ph / photo.height);
    const dw = photo.width * scale, dh = photo.height * scale;
    const dx = px + (pw - dw) / 2;
    let dy = py + ph / 2 - o.focusY * dh;           // pusatkan titik fokus
    dy = Math.min(py, Math.max(py + ph - dh, dy));  // jangan keluar bingkai
    g.drawImage(photo, dx, dy, dw, dh);
  } else {
    g.fillStyle = o.accent;
    g.font = `700 220px ${FONT}`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText((o.name[0] || 'L').toUpperCase(), px + pw / 2, py + ph / 2);
  }
  g.restore();
  g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 3;
  roundRect(g, px, py, pw, ph, 28); g.stroke();

  // nama
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.fillStyle = '#f4f7ff';
  let size = 44;
  g.font = `700 ${size}px ${FONT}`;
  while (g.measureText(o.name).width > 540 && size > 24) { size -= 2; g.font = `700 ${size}px ${FONT}`; }
  g.fillText(o.name, 320, 786);
  g.fillStyle = 'rgba(220,230,255,.65)';
  g.font = `400 28px ${FONT}`;
  g.fillText(o.subtitle, 320, 830);

  // tag
  g.font = `800 52px ${FONT}`;
  const tw = g.measureText(o.tag).width + 70;
  g.fillStyle = o.accent;
  roundRect(g, 320 - tw / 2, 862, tw, 82, 41); g.fill();
  g.fillStyle = '#fff';
  g.textBaseline = 'middle';
  g.fillText(o.tag, 320, 904);
  return c;
}

function drawBack(o, img) {
  const c = document.createElement('canvas');
  c.width = 640; c.height = 1000;
  const g = c.getContext('2d');
  if (img) {
    g.drawImage(img, 0, 0, 640, 1000);
    return c;
  }
  const bg = g.createLinearGradient(640, 0, 0, 1000);
  bg.addColorStop(0, '#16224a');
  bg.addColorStop(1, '#080c1a');
  g.fillStyle = bg;
  g.fillRect(0, 0, 640, 1000);

  g.fillStyle = '#05070f';
  roundRect(g, 260, 52, 120, 26, 13); g.fill();

  g.strokeStyle = 'rgba(242,193,78,.25)'; g.lineWidth = 2;
  for (let r = 120; r <= 480; r += 60) {
    g.beginPath(); g.arc(320, 500, r, 0, Math.PI * 2); g.stroke();
  }
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#f4f7ff';
  g.font = `800 96px ${FONT}`;
  g.fillText(o.tag, 320, 470);
  g.fillStyle = 'rgba(220,230,255,.7)';
  g.font = `400 34px ${FONT}`;
  g.fillText('Portfolio', 320, 548);
  g.fillText(o.subtitle, 320, 600);

  // pola "barcode" dekoratif
  g.fillStyle = 'rgba(255,255,255,.75)';
  let x = 120;
  const seed = [3, 1, 2, 5, 1, 3, 2, 1, 4, 2, 1, 3, 5, 2, 1, 2, 3, 1, 4, 1, 2, 3, 1, 5, 2, 1, 3];
  for (let i = 0; i < seed.length && x < 520; i++) {
    g.fillRect(x, 840, seed[i] * 3, 70);
    x += seed[i] * 3 + 6;
  }
  return c;
}

function drawStrap(o, img) {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 512;
  const g = c.getContext('2d');
  if (img) {
    g.drawImage(img, 0, 0, 128, 512);
    return c;
  }
  g.fillStyle = '#1d4fd8';
  g.fillRect(0, 0, 128, 512);
  // anyaman
  for (let y = 0; y < 512; y += 6) {
    g.fillStyle = (y / 6) % 2 ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.14)';
    g.fillRect(0, y, 128, 3);
  }
  g.fillStyle = 'rgba(255,255,255,.9)';
  g.fillRect(8, 0, 4, 512);
  g.fillRect(116, 0, 4, 512);
  // teks vertikal
  g.save();
  g.translate(64, 256);
  g.rotate(-Math.PI / 2);
  g.fillStyle = '#fff';
  g.font = `800 54px ${FONT}`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(o.tag.toUpperCase(), 0, 0);
  g.restore();
  return c;
}

function roundedShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

function faceGeometry(shape) {
  const geo = new THREE.ShapeGeometry(shape, 12);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, pos.getX(i) / CARD_W + 0.5, pos.getY(i) / CARD_H + 0.5);
  }
  uv.needsUpdate = true;
  return geo;
}

// lingkungan kecil untuk pantulan logam/clearcoat (tanpa file HDR eksternal)
function buildEnvironment(renderer) {
  const env = new THREE.Scene();
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(20, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0x1a2236, side: THREE.BackSide })
  );
  env.add(room);
  const panel = (w, h, x, y, z, intensity) => {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1).multiplyScalar(intensity), side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    mesh.position.set(x, y, z);
    mesh.lookAt(0, 0, 0);
    env.add(mesh);
  };
  panel(8, 5, 0, 8, 4, 6);
  panel(4, 8, -9, 1, 3, 3);
  panel(4, 8, 9, 0, 5, 3);
  panel(10, 2, 0, -8, 5, 1.5);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.04).texture;
  pmrem.dispose();
  room.geometry.dispose();
  return tex;
}

export async function mountLanyard(host, userOptions = {}) {
  const o = { ...DEFAULTS, ...userOptions };
  if (!host) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch (err) {
    console.warn('[Lanyard] WebGL tidak tersedia, memakai tampilan cadangan.', err);
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.className = 'lanyard-canvas';
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(25, 1, 0.1, 100);
  const camDist = VIEW_H / 2 / Math.tan(THREE.MathUtils.degToRad(25 / 2));
  camera.position.set(0, 0, camDist);

  scene.environment = buildEnvironment(renderer);
  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 5, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x7aa8ff, 1.0);
  rim.position.set(-4, -2, 4);
  scene.add(rim);

  // ---------- tekstur ----------
  const [photo, backImg, strapImg] = await Promise.all([
    loadImage(o.frontImage), loadImage(o.backImage), loadImage(o.strapImage),
  ]);
  if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) { /* abaikan */ } }

  let frontCanvas = drawFront(o, photo);
  if (photo && isTainted(frontCanvas)) frontCanvas = drawFront(o, null); // mis. dibuka via file://
  let backCanvas = drawBack(o, backImg);
  if (backImg && isTainted(backCanvas)) backCanvas = drawBack(o, null);
  let strapCanvas = drawStrap(o, strapImg);
  if (strapImg && isTainted(strapCanvas)) strapCanvas = drawStrap(o, null);

  const aniso = renderer.capabilities.getMaxAnisotropy();
  const makeTex = (canvas, repeat) => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = aniso;
    if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
    return t;
  };
  const frontTex = makeTex(frontCanvas);
  const backTex = makeTex(backCanvas);
  const strapTex = makeTex(strapCanvas, true);

  // ---------- kartu ----------
  const card = new THREE.Group();
  card.rotation.order = 'ZYX';
  const shape = roundedShape(CARD_W, CARD_H, 0.14);
  const faceMat = (map) => new THREE.MeshPhysicalMaterial({
    map, roughness: 0.38, metalness: 0.05, clearcoat: 0.7, clearcoatRoughness: 0.25,
  });
  const front = new THREE.Mesh(faceGeometry(shape), faceMat(frontTex));
  front.position.z = 0.0105;
  const back = new THREE.Mesh(faceGeometry(shape), faceMat(backTex));
  back.position.z = -0.0105;
  back.rotation.y = Math.PI;
  const edge = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: false, curveSegments: 12 }),
    new THREE.MeshStandardMaterial({ color: 0x0a0f1e, roughness: 0.5, metalness: 0.3 })
  );
  edge.position.z = -0.01;
  const metal = new THREE.MeshStandardMaterial({ color: 0xd5dbe6, metalness: 1, roughness: 0.28 });
  const clip = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.07), metal);
  clip.position.set(0, CARD_H / 2 - 0.02, 0);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.022, 14, 36), metal);
  ring.position.set(0, RING_D, 0);
  card.add(edge, front, back, clip, ring);
  scene.add(card);

  // ---------- tali (pita) ----------
  const strapSamples = 48;
  const strapPos = new Float32Array((strapSamples + 1) * 2 * 3);
  const strapUv = new Float32Array((strapSamples + 1) * 2 * 2);
  const strapIdx = [];
  for (let i = 0; i <= strapSamples; i++) {
    const v = (i / strapSamples) * 3.2;
    strapUv.set([0, v, 1, v], i * 4);
    if (i < strapSamples) {
      const a = i * 2;
      strapIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const strapGeo = new THREE.BufferGeometry();
  strapGeo.setAttribute('position', new THREE.BufferAttribute(strapPos, 3));
  strapGeo.setAttribute('uv', new THREE.BufferAttribute(strapUv, 2));
  strapGeo.setIndex(strapIdx);
  const strap = new THREE.Mesh(strapGeo, new THREE.MeshStandardMaterial({
    map: strapTex, roughness: 0.75, metalness: 0, side: THREE.DoubleSide,
  }));
  strap.frustumCulled = false;
  scene.add(strap);

  // ---------- fisika (verlet) ----------
  const seg = STRAP_LEN / SEGMENTS;
  const pts = [];
  for (let i = 0; i <= SEGMENTS; i++) {
    const p = new THREE.Vector2(0, ANCHOR_Y - seg * i);
    pts.push({ p, prev: p.clone(), inv: i === 0 ? 0 : 1 });
  }
  const ringP = pts[SEGMENTS];
  const centerPos = new THREE.Vector2(0, ringP.p.y - RING_D);
  const cardP = { p: centerPos, prev: centerPos.clone(), inv: 0.4 };
  // dorongan awal supaya kartu berayun sebentar saat muncul
  cardP.prev.x -= 0.03;
  const all = [...pts, cardP];
  const links = [];
  for (let i = 0; i < SEGMENTS; i++) links.push({ a: all[i], b: all[i + 1], rest: seg, k: 0.88 });
  links.push({ a: ringP, b: cardP, rest: RING_D, k: 1 });

  let yaw = 0, yawW = 0, flipTarget = 0;
  let asleep = false, calm = 0; // berhenti menghitung fisika saat sudah diam
  let halfW = 2;
  const grab = { active: false, target: new THREE.Vector2(), offset: new THREE.Vector2(), moved: 0, t: 0, sx: 0, sy: 0, id: null };

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hitPoint = new THREE.Vector3();

  function pointerToWorld(ev) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    return raycaster.ray.intersectPlane(plane, hitPoint) ? hitPoint : null;
  }
  function overCard() {
    return raycaster.intersectObject(card, true).length > 0;
  }

  const el = renderer.domElement;
  el.addEventListener('pointerdown', (ev) => {
    if (ev.button !== undefined && ev.button > 0) return;
    const w = pointerToWorld(ev);
    if (!w || !overCard()) return;
    grab.active = true;
    asleep = false; calm = 0;
    grab.id = ev.pointerId;
    grab.offset.set(w.x - cardP.p.x, w.y - cardP.p.y);
    grab.target.set(cardP.p.x, cardP.p.y);
    grab.moved = 0; grab.t = performance.now(); grab.sx = ev.clientX; grab.sy = ev.clientY;
    try { el.setPointerCapture(ev.pointerId); } catch (e) { /* abaikan */ }
    el.style.cursor = 'grabbing';
  });
  el.addEventListener('pointermove', (ev) => {
    const w = pointerToWorld(ev);
    if (!grab.active) {
      el.style.cursor = w && overCard() ? 'grab' : '';
      return;
    }
    if (w) {
      grab.target.set(w.x - grab.offset.x, w.y - grab.offset.y);
      grab.moved = Math.max(grab.moved, Math.hypot(ev.clientX - grab.sx, ev.clientY - grab.sy));
    }
  });
  const release = (ev, cancelled) => {
    if (!grab.active) return;
    grab.active = false;
    try { el.releasePointerCapture(grab.id); } catch (e) { /* abaikan */ }
    el.style.cursor = '';
    const quick = performance.now() - grab.t < 350;
    asleep = false; calm = 0;
    if (!cancelled && grab.moved < 6 && quick) flipTarget += Math.PI; // klik = balik kartu
  };
  el.addEventListener('pointerup', (ev) => release(ev, false));
  el.addEventListener('pointercancel', (ev) => release(ev, true));
  el.addEventListener('pointerleave', () => { if (!grab.active) el.style.cursor = ''; });

  function step() {
    const g = o.gravity;
    const bx = (Math.random() - 0.5) * o.breeze;
    for (const q of all) {
      if (q.inv === 0) continue;
      let vx = (q.p.x - q.prev.x) * o.damping;
      let vy = (q.p.y - q.prev.y) * o.damping;
      const sp = Math.hypot(vx, vy);
      if (sp > 0.3) { vx *= 0.3 / sp; vy *= 0.3 / sp; }
      q.prev.copy(q.p);
      q.p.x += vx + bx * STEP * STEP * 60;
      q.p.y += vy - g * STEP * STEP;
    }
    for (let it = 0; it < 14; it++) {
      if (grab.active) {
        const tx = THREE.MathUtils.clamp(grab.target.x, -halfW + 0.5, halfW - 0.5);
        const ty = THREE.MathUtils.clamp(grab.target.y, -VIEW_H / 2 + 0.4, VIEW_H / 2 - 0.6);
        cardP.p.x += (tx - cardP.p.x) * 0.25;
        cardP.p.y += (ty - cardP.p.y) * 0.25;
      }
      for (const l of links) {
        const dx = l.b.p.x - l.a.p.x, dy = l.b.p.y - l.a.p.y;
        const d = Math.hypot(dx, dy) || 1e-6;
        const corr = ((d - l.rest) / d) * l.k;
        const w = l.a.inv + l.b.inv;
        if (w === 0) continue;
        l.a.p.x += dx * corr * (l.a.inv / w);
        l.a.p.y += dy * corr * (l.a.inv / w);
        l.b.p.x -= dx * corr * (l.b.inv / w);
        l.b.p.y -= dy * corr * (l.b.inv / w);
      }
    }
    // putaran (flip / goyang) kartu pada sumbu vertikalnya
    const vxCard = cardP.p.x - cardP.prev.x;
    yawW += (flipTarget - yaw) * 0.03 + vxCard * 1.2;
    yawW *= 0.88;
    yaw += yawW;

    // deteksi sudah diam -> tidur (tidak bergerak terus-menerus)
    let maxV = 0;
    for (const q of all) maxV = Math.max(maxV, Math.hypot(q.p.x - q.prev.x, q.p.y - q.prev.y));
    const still = maxV < 0.0008 && Math.abs(yawW) < 0.001 && Math.abs(flipTarget - yaw) < 0.01;
    calm = still && !grab.active ? calm + 1 : 0;
    if (calm > 30) {
      for (const q of all) q.prev.copy(q.p);
      yaw = flipTarget; yawW = 0;
      asleep = true;
    }
  }

  const catmull = new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(q.p.x, q.p.y, 0)), false, 'catmullrom', 0.5);
  const tmp = new THREE.Vector3();
  const tan = new THREE.Vector3();

  function updateMeshes() {
    // kartu
    const ux = ringP.p.x - cardP.p.x, uy = ringP.p.y - cardP.p.y;
    const len = Math.hypot(ux, uy) || 1;
    card.position.set(cardP.p.x, cardP.p.y, 0);
    card.rotation.z = Math.atan2(-ux / len, uy / len);
    card.rotation.y = yaw;
    // tali
    for (let i = 0; i < pts.length; i++) catmull.points[i].set(pts[i].p.x, pts[i].p.y, 0);
    for (let i = 0; i <= strapSamples; i++) {
      const t = i / strapSamples;
      catmull.getPoint(t, tmp);
      catmull.getTangent(t, tan);
      const nx = -tan.y, ny = tan.x;
      const hw = STRAP_W / 2;
      strapPos.set([tmp.x - nx * hw, tmp.y - ny * hw, 0, tmp.x + nx * hw, tmp.y + ny * hw, 0], i * 6);
    }
    strapGeo.attributes.position.needsUpdate = true;
  }

  // ---------- ukuran & loop ----------
  function resize() {
    const w = Math.max(host.clientWidth, 1), h = Math.max(host.clientHeight, 1);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    halfW = (VIEW_H / 2) * camera.aspect;
    if (typeof updateMeshes === 'function') { updateMeshes(); renderer.render(scene, camera); }
  }
  host.appendChild(renderer.domElement);
  host.classList.add('lanyard-ready');
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  let visible = true, raf = 0, last = performance.now(), acc = 0, destroyed = false;
  const io = new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; }, { threshold: 0 });
  io.observe(host);

  function frame(now) {
    if (destroyed) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (!visible || document.hidden) return;
    if (asleep) { last = now; return; }
    acc += dt;
    let n = 0;
    while (acc >= STEP && n < 3) { step(); acc -= STEP; n++; }
    if (n === 3) acc = 0;
    updateMeshes();
    renderer.render(scene, camera);
  }
  updateMeshes();
  raf = requestAnimationFrame(frame);

  return {
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      [frontTex, backTex, strapTex].forEach((t) => t.dispose());
      [front, back, edge, clip, ring, strap].forEach((m) => { m.geometry.dispose(); m.material.dispose(); });
      scene.environment && scene.environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      host.classList.remove('lanyard-ready');
    },
  };
}

// Auto-mount: <div class="lanyard" data-lanyard data-front="foto.jpg" data-tag="@lucky">
document.querySelectorAll('[data-lanyard]').forEach((host) => {
  const d = host.dataset;
  mountLanyard(host, {
    frontImage: d.front || '',
    backImage: d.back || '',
    strapImage: d.strap || '',
    ...(d.tag ? { tag: d.tag } : {}),
    ...(d.name ? { name: d.name } : {}),
    ...(d.subtitle ? { subtitle: d.subtitle } : {}),
    ...(d.focusY ? { focusY: parseFloat(d.focusY) } : {}),
  }).catch((err) => console.warn('[Lanyard] gagal dimuat:', err));
});
