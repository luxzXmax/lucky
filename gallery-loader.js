function escGalleryHtml(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
// Ambil ID video dari link YouTube (null kalau bukan link YouTube)
function getYoutubeIdFromUrl(url){
    const m = String(url || '').match(/^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/)([\w-]{11})(?:[?&#]|$)/);
    return m ? m[1] : null;
}

// Merapikan keterangan: tiap baris tampil terpisah, "Label: isi" -> label ditebalkan,
// link http(s) otomatis bisa diklik, baris kosong jadi jarak antar paragraf.
function formatDescription(text){
    const lines = String(text == null ? '' : text).replace(/\r/g, '').trim().split('\n');
    return lines.map(raw => {
        const line = raw.trim();
        if(!line) return '<div class="desc-gap"></div>';
        let html = escGalleryHtml(line);
        // tautan otomatis
        html = html.replace(/https?:\/\/[^\s<]+/g, u => {
            const clean = u.replace(/(&quot;|&#39;|[.,;!?)])+$/, '');
            const tail = u.slice(clean.length);
            return `<a href="${clean}" target="_blank" rel="noopener noreferrer">${clean}</a>${tail}`;
        });
        // "Label: isi" -> label tebal (bukan untuk URL "https://")
        const m = html.match(/^([^:\/<>]{2,40}?)\s*:(?!\/\/)\s*(.*)$/);
        if(m){
            return `<div class="desc-line"><b>${m[1]}</b>${m[2] ? ': ' + m[2] : ''}</div>`;
        }
        return `<div class="desc-line">${html}</div>`;
    }).join('');
}

// Menampilkan postingan (foto/video/teks + keterangan) sesuai kategori halaman
// Mendukung SATU atau BANYAK file per postingan (tabel post_media)
// Dipakai di halaman semester, karya-tulisan, pengalaman, sertifikat, dll
// Membutuhkan: supabase-config.js sudah dimuat sebelumnya
// Membutuhkan: ada elemen <div id="postGrid"></div> di halaman

// Parameter opsional:
//   subject     -> hanya tampilkan postingan milik mata pelajaran ini (halaman semester)
//   containerId -> id elemen tujuan (default 'postGrid')
async function loadCategoryPosts(category, subject, containerId){
    const container = document.getElementById(containerId || 'postGrid');
    if(!container) return;

    // Ambil post beserta semua file medianya (join ke tabel post_media)
    let query = supabaseClient
        .from('posts')
        .select('*, post_media(media_url, media_type, sort_order)')
        .eq('category', category);

    if(subject === 'umum'){
        // "Umum" = tanpa mapel (termasuk postingan lama sebelum ada fitur mapel)
        query = query.or('subject.is.null,subject.eq.umum');
    } else if(subject){
        query = query.eq('subject', subject);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if(error || !data || data.length === 0){
        container.innerHTML = '<div class="empty-note">Belum ada yang ditambahkan.</div>';
        return;
    }

    container.innerHTML = '';
    container.classList.add('post-grid');

    data.forEach(post => {
        const card = document.createElement('div');
        card.className = 'post-card';

        // Urutkan file sesuai sort_order
        let mediaList = (post.post_media || []).slice().sort((a, b) => a.sort_order - b.sort_order);

        // Fallback untuk postingan LAMA (dibuat sebelum fitur multi-file, media_url ada di tabel posts)
        if(mediaList.length === 0 && post.media_url && (post.media_type === 'image' || post.media_type === 'video')){
            mediaList = [{ media_url: post.media_url, media_type: post.media_type }];
        }

        let mediaHtml = '';

        if(mediaList.length > 0){
            const hasYoutube = mediaList.some(m => getYoutubeIdFromUrl(m.media_url));
            if(hasYoutube) card.classList.add('has-youtube');

            const slides = mediaList.map(m => {
                const ytId = getYoutubeIdFromUrl(m.media_url);
                if(ytId){
                    return `<div class="post-slide"><iframe src="https://www.youtube.com/embed/${ytId}" title="${escGalleryHtml(post.title)}" loading="lazy" allowfullscreen allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe></div>`;
                }
                return m.media_type === 'video'
                    ? `<div class="post-slide"><video src="${escGalleryHtml(m.media_url)}" controls></video></div>`
                    : `<div class="post-slide"><img src="${escGalleryHtml(m.media_url)}" alt="${escGalleryHtml(post.title)}" class="zoomable-img"></div>`;
            }).join('');

            const badge = mediaList.length > 1 ? `<div class="media-count-badge">${hasYoutube ? '▶' : '📷'} ${mediaList.length}</div>` : '';

            mediaHtml = `
                <div class="post-media">
                    ${badge}
                    <div class="post-media-slider">${slides}</div>
                </div>
            `;
        }
        // Kalau mediaList kosong -> postingan teks saja, tidak ada .post-media sama sekali

        card.innerHTML = `
            ${mediaHtml}
            <div class="post-info">
                <h3>${escGalleryHtml(post.title)}</h3>
                <div class="post-desc">${formatDescription(post.description)}</div>
            </div>
        `;

        container.appendChild(card);
    });

    initLightbox(container);
}

// LIGHTBOX: klik foto untuk melihat versi besar, dengan tombol navigasi
// kalau postingannya punya lebih dari satu foto
function initLightbox(container){
    let overlay = document.getElementById('imgLightbox');
    if(!overlay){
        overlay = document.createElement('div');
        overlay.id = 'imgLightbox';
        overlay.className = 'lightbox-overlay';
        overlay.innerHTML = `
            <span class="lightbox-close">&times;</span>
            <span class="lightbox-nav lightbox-prev">&#10094;</span>
            <img class="lightbox-img" src="" alt="">
            <span class="lightbox-nav lightbox-next">&#10095;</span>
            <div class="lightbox-counter"></div>
        `;
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if(e.target === overlay) overlay.classList.remove('open');
        });
        overlay.querySelector('.lightbox-close').addEventListener('click', () => {
            overlay.classList.remove('open');
        });
    }

    const lightboxImg = overlay.querySelector('.lightbox-img');
    const counterEl = overlay.querySelector('.lightbox-counter');
    const prevBtn = overlay.querySelector('.lightbox-prev');
    const nextBtn = overlay.querySelector('.lightbox-next');

    let currentGroup = [];
    let currentIndex = 0;

    function showIndex(i){
        currentIndex = (i + currentGroup.length) % currentGroup.length;
        lightboxImg.src = currentGroup[currentIndex].src;
        lightboxImg.alt = currentGroup[currentIndex].alt;
        const showNav = currentGroup.length > 1;
        prevBtn.style.display = showNav ? 'flex' : 'none';
        nextBtn.style.display = showNav ? 'flex' : 'none';
        counterEl.style.display = showNav ? 'block' : 'none';
        counterEl.textContent = `${currentIndex + 1} / ${currentGroup.length}`;
    }

    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showIndex(currentIndex - 1); });
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showIndex(currentIndex + 1); });

    // Setiap kartu punya "grup" foto sendiri (untuk navigasi prev/next per postingan)
    container.querySelectorAll('.post-card').forEach(card => {
        const imgsInCard = Array.from(card.querySelectorAll('.zoomable-img'));
        if(imgsInCard.length === 0) return;

        imgsInCard.forEach((img, idx) => {
            img.addEventListener('click', () => {
                currentGroup = imgsInCard;
                showIndex(idx);
                overlay.classList.add('open');
            });
        });
    });
}
