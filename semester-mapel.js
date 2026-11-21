// Halaman semester: tampilkan daftar mata pelajaran, lalu tugas per mata pelajaran
// Membutuhkan: supabase-config.js, mapel.js, gallery-loader.js sudah dimuat
// Membutuhkan: elemen <div id="postGrid"></div>
//
// Alamat: semesterN.html            -> daftar mata pelajaran
//         semesterN.html?mapel=slug -> tugas milik mata pelajaran itu

function escapeMapelHtml(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}

async function loadSemesterPage(category){
    const container = document.getElementById('postGrid');
    if(!container) return;

    const list = getMapelList(category) || [];
    const slug = new URLSearchParams(location.search).get('mapel');

    // ---------- TAMPILAN 2: tugas dalam satu mata pelajaran ----------
    if(slug){
        const mapel = slug === 'umum' ? MAPEL_UMUM : list.find(m => m.slug === slug);
        if(mapel){
            const pageUrl = location.pathname.split('/').pop() || '';
            container.innerHTML = `
                <a class="mapel-back" href="${escapeMapelHtml(pageUrl)}">← Semua mata pelajaran</a>
                <h2 class="mapel-title">${escapeMapelHtml(mapel.nama)}</h2>
                ${mapel.lengkap ? `<div class="mapel-full">${escapeMapelHtml(mapel.lengkap)}</div>` : ''}
                <div id="subjectPosts"><div class="empty-note">Memuat...</div></div>
            `;
            await loadCategoryPosts(category, slug, 'subjectPosts');
            return;
        }
        // slug tidak dikenal -> jatuh ke daftar mapel
    }

    // ---------- TAMPILAN 1: daftar mata pelajaran ----------
    // Kartu langsung tampil (tidak menunggu database); jumlah tugas menyusul setelahnya
    const cards = list.slice();
    cards.push(MAPEL_UMUM); // disembunyikan nanti kalau tidak ada postingannya

    container.classList.remove('post-grid');
    container.innerHTML = `<div class="mapel-grid">${cards.map(m => `
        <a class="mapel-card" data-slug="${escapeMapelHtml(m.slug)}"${m.slug === 'umum' ? ' hidden' : ''}
           href="?mapel=${encodeURIComponent(m.slug)}">
            <span class="mapel-bg" style="background-image:url('${escapeMapelHtml(getMapelFoto(m))}')"></span>
            <div class="mapel-card-top">
                <h3>${escapeMapelHtml(m.nama)}</h3>
                <span class="mapel-count zero" hidden></span>
            </div>
            ${m.lengkap ? `<p class="mapel-full">${escapeMapelHtml(m.lengkap)}</p>` : ''}
        </a>`).join('')}</div>`;

    try{
        const { data, error } = await supabaseClient
            .from('posts')
            .select('subject')
            .eq('category', category);
        if(error || !data) return;

        const counts = {};
        data.forEach(p => {
            const key = p.subject || 'umum';
            counts[key] = (counts[key] || 0) + 1;
        });

        container.querySelectorAll('.mapel-card').forEach(card => {
            const n = counts[card.dataset.slug] || 0;
            const badge = card.querySelector('.mapel-count');
            badge.textContent = n + ' tugas';
            badge.classList.toggle('zero', n === 0);
            badge.hidden = false;
            if(card.dataset.slug === 'umum') card.hidden = n === 0;
        });
    }catch(e){ /* tanpa angka pun kartu tetap tampil */ }
}
