// Daftar mata pelajaran per semester (dipakai halaman semester & admin)
// Sumber: jadwal pelajaran X TJKT 3 (aSc Timetables).
//
// CARA MENGUBAH:
// - Tambah/hapus mapel: edit daftar di bawah (slug = huruf kecil tanpa spasi, jangan diubah
//   setelah ada postingan, karena slug dipakai sebagai penanda di database).
// - Kelas XI & XII (semester 3-6) sementara memakai daftar yang sama dengan kelas X.
//   Kalau mapelnya berbeda, ganti daftar MAPEL_XI / MAPEL_XII di bawah.

const MAPEL_X = [
    { slug: 'informatika',  nama: 'Informatika' },
    { slug: 'pjok',         nama: 'PJOK',             lengkap: 'Pendidikan Jasmani, Olahraga & Kesehatan' },
    { slug: 'dpk-tjkt',     nama: 'DPK TJKT',         lengkap: 'Dasar Program Keahlian TJKT' },
    { slug: 'pipas',        nama: 'PIPAS' },
    { slug: 'sejarah',      nama: 'Sejarah' },
    { slug: 'pabp',         nama: 'PABP',             lengkap: 'Pendidikan Agama & Budi Pekerti' },
    { slug: 'b-indonesia',  nama: 'Bahasa Indonesia' },
    { slug: 'bk',           nama: 'BK',               lengkap: 'Bimbingan Konseling' },
    { slug: 'senbud',       nama: 'Senbud',           lengkap: 'Seni Budaya' },
    { slug: 'kka',          nama: 'KKA',              lengkap: 'Koding & Kecerdasan Artifisial' },
    { slug: 'pp',           nama: 'PP',               lengkap: 'Pendidikan Pancasila' },
    { slug: 'b-jawa',       nama: 'Bahasa Jawa' },
    { slug: 'b-inggris',    nama: 'Bahasa Inggris' },
    { slug: 'matematika',   nama: 'Matematika' }
];

// Sementara sama dengan kelas X — ganti kalau mapel kelas XI / XII berbeda
const MAPEL_XI  = MAPEL_X;
const MAPEL_XII = MAPEL_X;

const MAPEL_PER_SEMESTER = {
    semester1: MAPEL_X,
    semester2: MAPEL_X,
    semester3: MAPEL_XI,
    semester4: MAPEL_XI,
    semester5: MAPEL_XII,
    semester6: MAPEL_XII
};

// Untuk postingan yang tidak punya mapel (termasuk postingan lama sebelum fitur ini ada)
const MAPEL_UMUM = { slug: 'umum', nama: 'Umum / Lainnya', lengkap: 'Tugas di luar mata pelajaran' };

function getMapelList(category){
    return MAPEL_PER_SEMESTER[category] || null;
}

function getMapelNama(category, slug){
    if(!slug || slug === 'umum') return MAPEL_UMUM.nama;
    const list = getMapelList(category) || [];
    const m = list.find(x => x.slug === slug);
    return m ? m.nama : slug;
}

// Gambar yang muncul saat kartu mapel disentuh/di-hover.
// Bawaan: mapel-<slug>.svg. Mau pakai foto sendiri? Taruh file di folder utama
// lalu tambahkan  foto: 'nama-file.jpg'  pada mapel yang bersangkutan.
function getMapelFoto(m){
    return m.foto || ('mapel-' + m.slug + '.svg');
}
