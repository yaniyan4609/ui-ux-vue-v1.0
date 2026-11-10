// Data Direktori Karyawan Lengkap untuk HRIS Digaji.id
// Mencakup Data Pribadi, Presensi, Payroll, BPJS, Dokumen, dan Galeri

export const hrisEmployeeList = [
  {
    id: 1,
    nip: 'EMP-2024-001',
    nama: 'Rizky Pratama, S.Kom',
    panggilan: 'Rizky',
    avatar: 'RP',
    jabatan: 'Lead Frontend Engineer',
    divisi: 'Teknologi & IT',
    departemen: 'Software Engineering',
    cabang: 'Kantor Pusat Jakarta',
    status: 'Tetap',
    statusBadge: 'success',
    level: 'L3 - Senior Staff',
    tanggalMasuk: '10 Jan 2021',
    masaKerja: '3 Tahun 10 Bulan',

    // Data Pribadi
    pribadi: {
      nik: '3171021405940003',
      npwp: '81.234.567.8-012.000',
      tempatLahir: 'Jakarta',
      tanggalLahir: '14 Mei 1994 (30 Tahun)',
      jenisKelamin: 'Laki-Laki',
      agama: 'Islam',
      statusPernikahan: 'Kawin (K/1)',
      ptkp: 'K/1 (Penghasilan Tidak Kena Pajak)',
      emailKantor: 'rizky.pratama@digaji.id',
      emailPribadi: 'rizky.pratama94@gmail.com',
      telepon: '0812-3456-7890',
      alamatKtp: 'Jl. Tebet Timur Dalam VII No. 14, Tebet, Jakarta Selatan 12820',
      alamatDomisili: 'Jl. Tebet Timur Dalam VII No. 14, Tebet, Jakarta Selatan 12820 (Sesuai KTP)',
      kontakDaruratNama: 'Nurul Hidayah',
      kontakDaruratHubungan: 'Istri',
      kontakDaruratTelp: '0813-8899-7711',
      pendidikanTerakhir: 'S1 Teknik Informatika - Institut Teknologi Bandung (ITB)',
    },

    // Data Presensi & Disiplin
    presensi: {
      kehadiranBulanIni: '96.2%',
      tepatWaktu: 21,
      terlambat: 1,
      cuti: 1,
      sakit: 0,
      alpha: 0,
      totalJamKerja: '172 Jam',
      jadwalShift: 'Reguler Pagi (08:00 - 17:00 WIB)',
      toleransiTelat: '15 Menit',
      riwayatTerbaru: [
        { tgl: '10 Nov 2026', masuk: '07:54 WIB', pulang: '17:05 WIB', status: 'Tepat Waktu', lokasi: 'Pusat Jakarta (Radius 12m)' },
        { tgl: '09 Nov 2026', masuk: '08:02 WIB', pulang: '17:15 WIB', status: 'Tepat Waktu', lokasi: 'Pusat Jakarta (Radius 15m)' },
        { tgl: '08 Nov 2026', masuk: '08:18 WIB', pulang: '17:30 WIB', status: 'Terlambat 18m', lokasi: 'Pusat Jakarta (Radius 28m)' },
        { tgl: '07 Nov 2026', masuk: '07:50 WIB', pulang: '17:00 WIB', status: 'Tepat Waktu', lokasi: 'Pusat Jakarta (Radius 10m)' },
        { tgl: '06 Nov 2026', masuk: '-', pulang: '-', status: 'Cuti Tahunan (Disetujui)', lokasi: 'Cuti Resmi' },
      ],
    },

    // Data Payroll & Kompensasi
    payroll: {
      gajiPokok: 18500000,
      tunjanganJabatan: 3500000,
      tunjanganMakanTransport: 1500000,
      upahLemburEstimasi: 750000,
      potonganBpjs: 645000,
      potonganPph21: 1120000,
      netSalaryEstimasi: 22485000,
      bank: 'BCA (Bank Central Asia)',
      rekeningNomor: '8820194812',
      rekeningNama: 'Rizky Pratama',
      metodePajak: 'TER Kategori A (Gross-Up Perusahaan)',
    },

    // Data BPJS
    bpjs: {
      bpjsTkNomor: '01928374651',
      bpjsTkStatus: 'Aktif (Perusahaan)',
      bpjsTkProgram: 'JKK, JKM, JHT, JP',
      bpjsKesNomor: '0001928374651',
      bpjsKesStatus: 'Aktif (Kelas 1)',
      faskes1: 'Puskesmas Kecamatan Tebet (0123P001)',
      tanggunganKeluarga: '2 Jiwa (Istri & 1 Anak)',
    },

    // Dokumen Digital
    dokumen: [
      { id: 'doc-1', title: 'Kartu Tanda Penduduk (KTP)', category: 'Identitas', fileNumber: '3171021405940003', fileName: 'ktp_rizky_pratama.pdf', fileSize: '1.2 MB', updatedAt: '10 Jan 2021', status: 'verified' },
      { id: 'doc-2', title: 'Nomor Pokok Wajib Pajak (NPWP)', category: 'Pajak', fileNumber: '81.234.567.8-012.000', fileName: 'npwp_rizky.pdf', fileSize: '850 KB', updatedAt: '10 Jan 2021', status: 'verified' },
      { id: 'doc-3', title: 'Kartu Keluarga (KK)', category: 'Identitas', fileNumber: '3171029901190002', fileName: 'kk_keluarga_rizky.pdf', fileSize: '1.8 MB', updatedAt: '15 Mar 2022', status: 'verified' },
      { id: 'doc-4', title: 'Ijazah S1 Teknik Informatika', category: 'Pendidikan', fileNumber: 'ITB-TI-2016-892', fileName: 'ijazah_s1_itb.pdf', fileSize: '3.4 MB', updatedAt: '10 Jan 2021', status: 'verified' },
      { id: 'doc-5', title: 'Surat Perjanjian Kerja Tetap (PKWTT)', category: 'Legalitas', fileNumber: 'SK-PKWTT/2021/01/014', fileName: 'sk_pkwtt_rizky_pratama.pdf', fileSize: '2.1 MB', updatedAt: '10 Jan 2022', status: 'verified' },
      { id: 'doc-6', title: 'Buku Tabungan Payroll BCA', category: 'Keuangan', fileNumber: 'Rek: 8820194812', fileName: 'buku_tabungan_bca.pdf', fileSize: '980 KB', updatedAt: '10 Jan 2021', status: 'verified' },
    ],

    // Galeri Foto Presensi & Surat
    galeri: [
      { id: 'gal-1', title: 'Presensi Masuk (Selfie Liveness)', category: 'absen', categoryLabel: 'Foto Presensi', timestamp: '10 Nov 2026, 07:54 WIB', location: 'Kantor Pusat Jakarta (Radius 12m)', imageUrl: '' },
      { id: 'gal-2', title: 'Presensi Masuk (Selfie Liveness)', category: 'absen', categoryLabel: 'Foto Presensi', timestamp: '09 Nov 2026, 08:02 WIB', location: 'Kantor Pusat Jakarta (Radius 15m)', imageUrl: '' },
      { id: 'gal-3', title: 'Surat Permohonan Cuti Tahunan', category: 'surat', categoryLabel: 'Surat Izin / Cuti', timestamp: '05 Nov 2026', location: 'Disetujui HRD', imageUrl: '' },
      { id: 'gal-4', title: 'Dokumentasi Sprint Review Q4', category: 'kerja', categoryLabel: 'Dokumentasi Kerja', timestamp: '01 Nov 2026', location: 'Ruang Meeting Lt 3', imageUrl: '' },
    ],
  },
  {
    id: 2,
    nip: 'EMP-2024-002',
    nama: 'Anindya Putri, S.Ds',
    panggilan: 'Anin',
    avatar: 'AP',
    jabatan: 'Senior UI/UX Designer',
    divisi: 'Teknologi & IT',
    departemen: 'Product & Design',
    cabang: 'Kantor Pusat Jakarta',
    status: 'Tetap',
    statusBadge: 'success',
    level: 'L3 - Senior Staff',
    tanggalMasuk: '15 Mar 2021',
    masaKerja: '3 Tahun 8 Bulan',
    pribadi: {
      nik: '3273014508960004',
      npwp: '72.345.678.9-421.000',
      tempatLahir: 'Bandung',
      tanggalLahir: '25 Agustus 1996 (28 Tahun)',
      jenisKelamin: 'Perempuan',
      agama: 'Islam',
      statusPernikahan: 'Belum Kawin (TK/0)',
      ptkp: 'TK/0',
      emailKantor: 'anindya.putri@digaji.id',
      emailPribadi: 'anindyaputri.design@gmail.com',
      telepon: '0813-8821-4455',
      alamatKtp: 'Jl. Dago Asri No. 18, Coblong, Bandung 40135',
      alamatDomisili: 'Apartemen Kalibata City Tower Kemuning, Jakarta Selatan',
      kontakDaruratNama: 'Hendra Gunawan',
      kontakDaruratHubungan: 'Ayah Kandung',
      kontakDaruratTelp: '0812-9988-2233',
      pendidikanTerakhir: 'S1 Desain Komunikasi Visual - Institut Teknologi Bandung (ITB)',
    },
    presensi: {
      kehadiranBulanIni: '95.0%',
      tepatWaktu: 20,
      terlambat: 2,
      cuti: 0,
      sakit: 1,
      alpha: 0,
      totalJamKerja: '168 Jam',
      jadwalShift: 'Reguler Pagi (08:00 - 17:00 WIB)',
      toleransiTelat: '15 Menit',
      riwayatTerbaru: [
        { tgl: '10 Nov 2026', masuk: '08:05 WIB', pulang: '17:10 WIB', status: 'Tepat Waktu', lokasi: 'Pusat Jakarta (Radius 14m)' },
        { tgl: '09 Nov 2026', masuk: '08:22 WIB', pulang: '17:35 WIB', status: 'Terlambat 22m', lokasi: 'Pusat Jakarta (Radius 20m)' },
        { tgl: '08 Nov 2026', masuk: '07:58 WIB', pulang: '17:02 WIB', status: 'Tepat Waktu', lokasi: 'Pusat Jakarta (Radius 8m)' },
      ],
    },
    payroll: {
      gajiPokok: 15500000,
      tunjanganJabatan: 2500000,
      tunjanganMakanTransport: 1500000,
      upahLemburEstimasi: 450000,
      potonganBpjs: 540000,
      potonganPph21: 890000,
      netSalaryEstimasi: 18520000,
      bank: 'Bank Mandiri',
      rekeningNomor: '137001928374',
      rekeningNama: 'Anindya Putri',
      metodePajak: 'TER Kategori A (Gross-Up)',
    },
    bpjs: {
      bpjsTkNomor: '02819384752',
      bpjsTkStatus: 'Aktif (Perusahaan)',
      bpjsTkProgram: 'JKK, JKM, JHT, JP',
      bpjsKesNomor: '0002819384752',
      bpjsKesStatus: 'Aktif (Kelas 1)',
      faskes1: 'Klinik Kalibata Medika (0182B002)',
      tanggunganKeluarga: '0 Jiwa (Lajang)',
    },
    dokumen: [
      { id: 'doc-201', title: 'Kartu Tanda Penduduk (KTP)', category: 'Identitas', fileNumber: '3273014508960004', fileName: 'ktp_anindya.pdf', fileSize: '1.1 MB', updatedAt: '15 Mar 2021', status: 'verified' },
      { id: 'doc-202', title: 'Nomor Pokok Wajib Pajak (NPWP)', category: 'Pajak', fileNumber: '72.345.678.9-421.000', fileName: 'npwp_anindya.pdf', fileSize: '780 KB', updatedAt: '15 Mar 2021', status: 'verified' },
      { id: 'doc-203', title: 'Surat Keterangan Dokter (SKD) Sakit', category: 'Medis', fileNumber: 'RS-KBT/2026/11/04', fileName: 'skd_sakit_anindya.pdf', fileSize: '1.4 MB', updatedAt: '04 Nov 2026', status: 'verified' },
    ],
    galeri: [
      { id: 'gal-201', title: 'Presensi Masuk (Selfie Liveness)', category: 'absen', categoryLabel: 'Foto Presensi', timestamp: '10 Nov 2026, 08:05 WIB', location: 'Pusat Jakarta', imageUrl: '' },
      { id: 'gal-202', title: 'Surat Sakit Dokter Klinik Kalibata', category: 'surat', categoryLabel: 'Surat Izin / Dokter', timestamp: '04 Nov 2026', location: 'Unggah Mobile App', imageUrl: '' },
      { id: 'gal-203', title: 'Workshop Design System Digaji 2.0', category: 'kerja', categoryLabel: 'Dokumentasi Kerja', timestamp: '24 Okt 2026', location: 'Auditorium Jakarta', imageUrl: '' },
    ],
  },
  {
    id: 3,
    nip: 'EMP-2024-003',
    nama: 'Budi Santoso',
    panggilan: 'Budi',
    avatar: 'BS',
    jabatan: 'Koordinator Gudang & Logistik',
    divisi: 'Operasional & Rantai Pasok',
    departemen: 'Logistik & Warehouse',
    cabang: 'Hub Logistik Medan',
    status: 'Tetap',
    statusBadge: 'success',
    level: 'L2 - Specialist',
    tanggalMasuk: '01 Jun 2022',
    masaKerja: '2 Tahun 5 Bulan',
    pribadi: {
      nik: '1271032104900002',
      npwp: '63.456.789.0-121.000',
      tempatLahir: 'Medan',
      tanggalLahir: '21 April 1990 (34 Tahun)',
      jenisKelamin: 'Laki-Laki',
      agama: 'Islam',
      statusPernikahan: 'Kawin (K/2)',
      ptkp: 'K/2',
      emailKantor: 'budi.santoso@digaji.id',
      emailPribadi: 'budi.santoso.medan@gmail.com',
      telepon: '0812-7766-5544',
      alamatKtp: 'Jl. Brigjend Katamso No. 45, Medan Maimun 20158',
      alamatDomisili: 'Jl. Brigjend Katamso No. 45, Medan',
      kontakDaruratNama: 'Sri Wahyuni',
      kontakDaruratHubungan: 'Istri',
      kontakDaruratTelp: '0813-7711-2299',
      pendidikanTerakhir: 'D3 Manajemen Logistik - Politeknik Negeri Medan',
    },
    presensi: {
      kehadiranBulanIni: '98.5%',
      tepatWaktu: 23,
      terlambat: 0,
      cuti: 0,
      sakit: 0,
      alpha: 0,
      totalJamKerja: '184 Jam',
      jadwalShift: 'Shift Pagi (07:00 - 15:00 WIB)',
      toleransiTelat: '15 Menit',
      riwayatTerbaru: [
        { tgl: '10 Nov 2026', masuk: '06:52 WIB', pulang: '15:10 WIB', status: 'Tepat Waktu', lokasi: 'Hub Medan (Radius 18m)' },
        { tgl: '09 Nov 2026', masuk: '06:48 WIB', pulang: '15:15 WIB', status: 'Tepat Waktu', lokasi: 'Hub Medan (Radius 22m)' },
        { tgl: '08 Nov 2026', masuk: '06:55 WIB', pulang: '15:05 WIB', status: 'Tepat Waktu', lokasi: 'Hub Medan (Radius 15m)' },
      ],
    },
    payroll: {
      gajiPokok: 8500000,
      tunjanganJabatan: 1500000,
      tunjanganMakanTransport: 1200000,
      upahLemburEstimasi: 1450000,
      potonganBpjs: 320000,
      potonganPph21: 280000,
      netSalaryEstimasi: 12050000,
      bank: 'Bank BRI',
      rekeningNomor: '012901002938501',
      rekeningNama: 'Budi Santoso',
      metodePajak: 'TER Kategori B',
    },
    bpjs: {
      bpjsTkNomor: '03918274619',
      bpjsTkStatus: 'Aktif (Perusahaan)',
      bpjsTkProgram: 'JKK, JKM, JHT, JP',
      bpjsKesNomor: '0003918274619',
      bpjsKesStatus: 'Aktif (Kelas 2)',
      faskes1: 'Puskesmas Medan Maimun',
      tanggunganKeluarga: '3 Jiwa (Istri & 2 Anak)',
    },
    dokumen: [
      { id: 'doc-301', title: 'Kartu Tanda Penduduk (KTP)', category: 'Identitas', fileNumber: '1271032104900002', fileName: 'ktp_budi_santoso.pdf', fileSize: '1.3 MB', updatedAt: '01 Jun 2022', status: 'verified' },
      { id: 'doc-302', title: 'Nomor Pokok Wajib Pajak (NPWP)', category: 'Pajak', fileNumber: '63.456.789.0-121.000', fileName: 'npwp_budi.pdf', fileSize: '820 KB', updatedAt: '01 Jun 2022', status: 'verified' },
      { id: 'doc-303', title: 'Sertifikat Forklift & K3 Pergudangan', category: 'Kualifikasi', fileNumber: 'K3-LOG-2023-0182', fileName: 'sertifikat_k3_pergudangan.pdf', fileSize: '2.5 MB', updatedAt: '14 Feb 2023', status: 'verified' },
    ],
    galeri: [
      { id: 'gal-301', title: 'Presensi Shift Pagi Hub Medan', category: 'absen', categoryLabel: 'Foto Presensi', timestamp: '10 Nov 2026, 06:52 WIB', location: 'Hub Logistik Medan (Valid)', imageUrl: '' },
      { id: 'gal-302', title: 'Inspeksi Bongkar Muat Kontainer 4', category: 'kerja', categoryLabel: 'Dokumentasi Kerja', timestamp: '08 Nov 2026', location: 'Loading Dock Hub Medan', imageUrl: '' },
    ],
  },
  {
    id: 4,
    nip: 'EMP-2024-004',
    nama: 'Wahyu Nugroho',
    panggilan: 'Wahyu',
    avatar: 'WN',
    jabatan: 'Staff Pergudangan & Packing',
    divisi: 'Operasional & Rantai Pasok',
    departemen: 'Logistik & Warehouse',
    cabang: 'Cabang Surabaya (Rungkut)',
    status: 'Kontrak (PKWT)',
    statusBadge: 'warning',
    level: 'L1 - Staff Pelaksana',
    tanggalMasuk: '15 Jan 2024',
    masaKerja: '10 Bulan (Habis 14 Jan 2025)',
    pribadi: {
      nik: '3578021908980001',
      npwp: '91.827.364.5-601.000',
      tempatLahir: 'Surabaya',
      tanggalLahir: '19 Agustus 1998 (26 Tahun)',
      jenisKelamin: 'Laki-Laki',
      agama: 'Islam',
      statusPernikahan: 'Belum Kawin (TK/0)',
      ptkp: 'TK/0',
      emailKantor: 'wahyu.nugroho@digaji.id',
      emailPribadi: 'wahyu.nugroho98@gmail.com',
      telepon: '0857-1122-3344',
      alamatKtp: 'Jl. Rungkut Menanggal Harapan Blok G-12, Surabaya',
      alamatDomisili: 'Jl. Rungkut Menanggal Harapan Blok G-12, Surabaya',
      kontakDaruratNama: 'Siti Aminah',
      kontakDaruratHubungan: 'Ibu Kandung',
      kontakDaruratTelp: '0856-4433-2211',
      pendidikanTerakhir: 'SMK Negeri 1 Surabaya (Teknik Mesin)',
    },
    presensi: {
      kehadiranBulanIni: '94.0%',
      tepatWaktu: 20,
      terlambat: 2,
      cuti: 0,
      sakit: 0,
      alpha: 0,
      totalJamKerja: '178 Jam (Termasuk Lembur)',
      jadwalShift: 'Shift Siang (15:00 - 23:00 WIB)',
      toleransiTelat: '15 Menit',
      riwayatTerbaru: [
        { tgl: '09 Nov 2026', masuk: '14:52 WIB', pulang: '23:10 WIB', status: 'Tepat Waktu', lokasi: 'Cabang Surabaya (Radius 16m)' },
        { tgl: '08 Nov 2026', masuk: '14:55 WIB', pulang: '23:05 WIB', status: 'Tepat Waktu', lokasi: 'Cabang Surabaya (Radius 12m)' },
      ],
    },
    payroll: {
      gajiPokok: 5200000,
      tunjanganJabatan: 0,
      tunjanganMakanTransport: 900000,
      upahLemburEstimasi: 950000,
      potonganBpjs: 210000,
      potonganPph21: 120000,
      netSalaryEstimasi: 6720000,
      bank: 'Bank BCA',
      rekeningNomor: '5420918273',
      rekeningNama: 'Wahyu Nugroho',
      metodePajak: 'TER Kategori A',
    },
    bpjs: {
      bpjsTkNomor: '04829103847',
      bpjsTkStatus: 'Aktif (Perusahaan)',
      bpjsTkProgram: 'JKK, JKM, JHT',
      bpjsKesNomor: '0004829103847',
      bpjsKesStatus: 'Aktif (Kelas 2)',
      faskes1: 'Klinik Pratama Rungkut Sehat',
      tanggunganKeluarga: '0 Jiwa (Lajang)',
    },
    dokumen: [
      { id: 'doc-401', title: 'Kartu Tanda Penduduk (KTP)', category: 'Identitas', fileNumber: '3578021908980001', fileName: 'ktp_wahyu.pdf', fileSize: '1.0 MB', updatedAt: '15 Jan 2024', status: 'verified' },
      { id: 'doc-402', title: 'Kontrak Kerja Waktu Tertentu (PKWT 1)', category: 'Legalitas', fileNumber: 'PKWT-SBY/2024/01/008', fileName: 'perjanjian_pkwt_wahyu.pdf', fileSize: '1.9 MB', updatedAt: '15 Jan 2024', status: 'pending' },
    ],
    galeri: [
      { id: 'gal-401', title: 'Presensi Shift Siang Rungkut', category: 'absen', categoryLabel: 'Foto Presensi', timestamp: '09 Nov 2026, 14:52 WIB', location: 'Cabang Surabaya (Valid)', imageUrl: '' },
    ],
  },
  {
    id: 5,
    nip: 'EMP-2024-005',
    nama: 'Clarissa Natalia, S.E',
    panggilan: 'Clarissa',
    avatar: 'CN',
    jabatan: 'Tax & Payroll Specialist',
    divisi: 'Keuangan & HRIS',
    departemen: 'Finance & Pajak',
    cabang: 'Kantor Pusat Jakarta',
    status: 'Tetap',
    statusBadge: 'success',
    level: 'L2 - Specialist',
    tanggalMasuk: '01 Nov 2022',
    masaKerja: '4 Tahun',
    pribadi: {
      nik: '3174095209930005',
      npwp: '75.890.123.4-015.000',
      tempatLahir: 'Jakarta',
      tanggalLahir: '12 September 1993 (31 Tahun)',
      jenisKelamin: 'Perempuan',
      agama: 'Kristen',
      statusPernikahan: 'Kawin (K/0)',
      ptkp: 'K/0',
      emailKantor: 'clarissa.natalia@digaji.id',
      emailPribadi: 'clarissa.natalia.acc@gmail.com',
      telepon: '0811-9988-7766',
      alamatKtp: 'Jl. Boulevard Kelapa Gading Blok LA-4 No. 12, Jakarta Utara',
      alamatDomisili: 'Jl. Boulevard Kelapa Gading Blok LA-4 No. 12, Jakarta Utara',
      kontakDaruratNama: 'Daniel Wijaya',
      kontakDaruratHubungan: 'Suami',
      kontakDaruratTelp: '0812-3344-5566',
      pendidikanTerakhir: 'S1 Akuntansi & Perpajakan - Universitas Trisakti',
    },
    presensi: {
      kehadiranBulanIni: '97.5%',
      tepatWaktu: 22,
      terlambat: 1,
      cuti: 0,
      sakit: 0,
      alpha: 0,
      totalJamKerja: '174 Jam',
      jadwalShift: 'Reguler Pagi (08:00 - 17:00 WIB)',
      toleransiTelat: '15 Menit',
      riwayatTerbaru: [
        { tgl: '10 Nov 2026', masuk: '07:50 WIB', pulang: '17:05 WIB', status: 'Tepat Waktu', lokasi: 'Pusat Jakarta (Radius 10m)' },
        { tgl: '09 Nov 2026', masuk: '08:00 WIB', pulang: '17:15 WIB', status: 'Tepat Waktu', lokasi: 'Pusat Jakarta (Radius 12m)' },
      ],
    },
    payroll: {
      gajiPokok: 14000000,
      tunjanganJabatan: 2000000,
      tunjanganMakanTransport: 1500000,
      upahLemburEstimasi: 350000,
      potonganBpjs: 490000,
      potonganPph21: 720000,
      netSalaryEstimasi: 16640000,
      bank: 'Bank BCA',
      rekeningNomor: '6820192837',
      rekeningNama: 'Clarissa Natalia',
      metodePajak: 'TER Kategori A (Gross-Up)',
    },
    bpjs: {
      bpjsTkNomor: '05928193820',
      bpjsTkStatus: 'Aktif (Perusahaan)',
      bpjsTkProgram: 'JKK, JKM, JHT, JP',
      bpjsKesNomor: '0005928193820',
      bpjsKesStatus: 'Aktif (Kelas 1)',
      faskes1: 'Puskesmas Kelapa Gading Timur',
      tanggunganKeluarga: '1 Jiwa (Suami Tanggungan Sendiri)',
    },
    dokumen: [
      { id: 'doc-501', title: 'Kartu Tanda Penduduk (KTP)', category: 'Identitas', fileNumber: '3174095209930005', fileName: 'ktp_clarissa.pdf', fileSize: '1.2 MB', updatedAt: '01 Nov 2022', status: 'verified' },
      { id: 'doc-502', title: 'Sertifikat Brevet Pajak A & B', category: 'Kualifikasi', fileNumber: 'IKPI-BVT-2021-049', fileName: 'sertifikat_brevet_pajak.pdf', fileSize: '2.8 MB', updatedAt: '01 Nov 2022', status: 'verified' },
      { id: 'doc-503', title: 'Klaim Medis Rawat Jalan (Kacamata)', category: 'Klaim', fileNumber: 'CLM-2026/11/021', fileName: 'kuitansi_optik_seis.pdf', fileSize: '1.5 MB', updatedAt: '07 Nov 2026', status: 'pending' },
    ],
    galeri: [
      { id: 'gal-501', title: 'Presensi Biometrik Pagi', category: 'absen', categoryLabel: 'Foto Presensi', timestamp: '10 Nov 2026, 07:50 WIB', location: 'Pusat Jakarta', imageUrl: '' },
      { id: 'gal-502', title: 'Foto Kwitansi Optik Kacamata', category: 'surat', categoryLabel: 'Surat Izin / Klaim', timestamp: '07 Nov 2026', location: 'Pengajuan Reimburse', imageUrl: '' },
    ],
  },
]

// ========================================================
// HELPER: RESOLVE EMPLOYEE FULL PROFILE UNTUK DETAIL PAGE
// ========================================================
import { karyawanList } from './karyawanData.js'

export const resolveEmployeeFullProfile = (empOrId) => {
  const id = typeof empOrId === 'object' && empOrId !== null ? empOrId.id : Number(empOrId)
  
  // 1. Cek di hrisEmployeeList terlebih dahulu
  const matchedHris = hrisEmployeeList.find((e) => e.id === id)
  const matchedBasic = karyawanList.find((e) => e.id === id) || (typeof empOrId === 'object' ? empOrId : null)

  const emp = matchedHris || matchedBasic || karyawanList[0]

  const cleanName = emp.nama ? emp.nama.replace(/,.*$/, '') : 'Pegawai'
  const names = cleanName.split(' ')
  const initials = emp.avatar || names.map((n) => n[0]).slice(0, 2).join('').toUpperCase()
  const gajiPokok = emp.gaji || emp.payroll?.gajiPokok || 16000000
  const tunjangan = emp.tunjangan || emp.payroll?.tunjanganJabatan || 2500000
  const bankName = emp.rekening ? emp.rekening.split(' - ')[0] : 'BCA'
  const rekNo = emp.rekening ? emp.rekening.split(' - ')[1] : `88201948${String(emp.id).padStart(2, '0')}`
  const lokasi = emp.lokasi || emp.cabang || 'Kantor Pusat Jakarta'
  const divisi = emp.divisi || 'Teknologi & IT'
  const jabatan = emp.jabatan || 'Spesialis Operasional'
  const status = emp.status || 'Tetap'
  const bpjsAktif = emp.bpjsAktif ?? true
  const tanggalMasuk = emp.tanggalMasuk || '10 Jan 2021'

  // Sub-kelompok Data Pribadi terperinci sesuai spesifikasi pengguna
  const pribadiPekerjaan = {
    kantor: lokasi,
    jabatan: jabatan,
    divisi: divisi,
    departemen: emp.departemen || divisi,
    level: emp.level || (status === 'Tetap' ? 'L3 - Senior Staff' : 'L2 - Junior Staff'),
    status: status,
    tanggalMasuk: tanggalMasuk,
    masaKerja: emp.masaKerja || '3 Tahun 10 Bulan',
  }

  const pribadiBiodata = {
    namaLengkap: emp.nama,
    namaPanggilan: emp.panggilan || names[0],
    kredensialLogin: emp.email || `${cleanName.toLowerCase().replace(/\s+/g, '.')}@digaji.id`,
    akunId: `USR-${String(emp.id).padStart(4, '0')}`,
    tempatTanggalLahir: emp.pribadi?.tanggalLahir
      ? `${emp.pribadi.tempatLahir || lokasi}, ${emp.pribadi.tanggalLahir}`
      : `${lokasi}, 14 Mei 1994 (30 Tahun)`,
    jenisKelamin: emp.pribadi?.jenisKelamin || (['AP', 'RK', 'JT', 'SR', 'DK', 'NP', 'CN'].includes(initials) ? 'Perempuan' : 'Laki-Laki'),
    agama: emp.pribadi?.agama || 'Islam',
    statusPernikahan: emp.pribadi?.statusPernikahan || 'Kawin (K/1)',
    ptkp: emp.pribadi?.ptkp || 'K/1 (Penghasilan Tidak Kena Pajak)',
  }

  const pribadiIdentitas = {
    nik: emp.pribadi?.nik || `31710214059400${String(emp.id).padStart(2, '0')}`,
    npwp: emp.pribadi?.npwp || `81.234.567.8-${String(emp.id).padStart(3, '0')}.000`,
    telepon: emp.telepon || emp.pribadi?.telepon || '0812-3456-7890',
    emailPribadi: emp.pribadi?.emailPribadi || `${cleanName.toLowerCase().replace(/\s+/g, '.')}94@gmail.com`,
    alamatKtp: emp.pribadi?.alamatKtp || `Jl. Melati Raya No. ${emp.id * 7}, Tebet, ${lokasi}`,
    alamatDomisili: emp.pribadi?.alamatDomisili || `Jl. Melati Raya No. ${emp.id * 7}, Tebet, ${lokasi} (Sesuai KTP)`,
    statusTempatTinggal: 'Milik Sendiri / Keluarga',
  }

  const pribadiKeluarga = {
    pendidikanTerakhir: emp.pribadi?.pendidikanTerakhir || 'S1 Teknik Informatika - Institut Teknologi Bandung (ITB)',
    tahunKelulusan: 'Tahun 2016 · IPK 3.78',
    namaIbuKandung: emp.pribadi?.namaIbuKandung || 'Hj. Siti Rahmawati',
    namaPasangan: emp.pribadi?.kontakDaruratNama || 'Nurul Hidayah',
    kontakDaruratNama: emp.pribadi?.kontakDaruratNama || 'Nurul Hidayah',
    kontakDaruratHubungan: emp.pribadi?.kontakDaruratHubungan || 'Istri / Pasangan',
    kontakDaruratTelp: emp.pribadi?.kontakDaruratTelp || '0813-8899-7711',
  }

  // Presensi & Shift
  const presensi = matchedHris?.presensi || {
    kehadiranBulanIni: '96.2%',
    tepatWaktu: 21,
    terlambat: 1,
    cuti: 1,
    sakit: 0,
    alpha: 0,
    totalJamKerja: '172 Jam',
    jadwalShift: 'Reguler Pagi (08:00 - 17:00 WIB)',
    toleransiTelat: '15 Menit',
    lokasiGeofence: `${lokasi} (Radius Maks. 50 Meter)`,
    riwayatTerbaru: [
      { tgl: '10 Nov 2026', masuk: '07:54 WIB', pulang: '17:05 WIB', status: 'Tepat Waktu', lokasi: `${lokasi} (Radius 12m)` },
      { tgl: '09 Nov 2026', masuk: '08:02 WIB', pulang: '17:15 WIB', status: 'Tepat Waktu', lokasi: `${lokasi} (Radius 15m)` },
      { tgl: '08 Nov 2026', masuk: '08:18 WIB', pulang: '17:30 WIB', status: 'Terlambat 18m', lokasi: `${lokasi} (Radius 28m)` },
      { tgl: '07 Nov 2026', masuk: '07:50 WIB', pulang: '17:00 WIB', status: 'Tepat Waktu', lokasi: `${lokasi} (Radius 10m)` },
      { tgl: '06 Nov 2026', masuk: '-', pulang: '-', status: 'Cuti Tahunan (Disetujui)', lokasi: 'Cuti Resmi' },
    ],
  }

  // Payroll & Kompensasi
  const payroll = matchedHris?.payroll || {
    gajiPokok: gajiPokok,
    tunjanganJabatan: tunjangan,
    tunjanganMakanTransport: 1500000,
    upahLemburEstimasi: 750000,
    potonganBpjs: Math.round(gajiPokok * 0.04),
    potonganPph21: Math.round(gajiPokok * 0.05),
    netSalaryEstimasi: gajiPokok + tunjangan + 1500000 + 750000 - Math.round(gajiPokok * 0.09),
    bank: bankName,
    rekeningNomor: rekNo,
    rekeningNama: emp.nama,
    metodePajak: 'TER Kategori A (Gross-Up Perusahaan)',
  }

  // BPJS & Asuransi
  const bpjs = matchedHris?.bpjs || {
    bpjsTkNomor: `01928374${String(emp.id).padStart(3, '0')}`,
    bpjsTkStatus: bpjsAktif ? 'Aktif (Perusahaan)' : 'Tidak Aktif',
    bpjsTkProgram: 'JKK, JKM, JHT, JP',
    bpjsKesNomor: `0001928374${String(emp.id).padStart(3, '0')}`,
    bpjsKesStatus: bpjsAktif ? 'Aktif (Kelas 1)' : 'Tidak Aktif',
    faskes1: `Klinik Pratama Sehat Mandiri (${lokasi})`,
    tanggunganKeluarga: '2 Jiwa (Istri & 1 Anak Terdaftar)',
  }

  // Dokumen Digital
  const dokumen = matchedHris?.dokumen || [
    { id: `doc-${emp.id}-1`, title: 'Kartu Tanda Penduduk (KTP)', category: 'Identitas', fileNumber: pribadiIdentitas.nik, fileName: `ktp_${cleanName.toLowerCase().replace(/\s+/g, '_')}.pdf`, fileSize: '1.2 MB', updatedAt: tanggalMasuk, status: 'verified' },
    { id: `doc-${emp.id}-2`, title: 'Nomor Pokok Wajib Pajak (NPWP)', category: 'Pajak', fileNumber: pribadiIdentitas.npwp, fileName: `npwp_${cleanName.toLowerCase().replace(/\s+/g, '_')}.pdf`, fileSize: '850 KB', updatedAt: tanggalMasuk, status: 'verified' },
    { id: `doc-${emp.id}-3`, title: 'Kartu Keluarga (KK)', category: 'Identitas', fileNumber: `31710299011900${String(emp.id).padStart(2, '0')}`, fileName: `kk_keluarga_${cleanName.toLowerCase().replace(/\s+/g, '_')}.pdf`, fileSize: '1.8 MB', updatedAt: '15 Mar 2022', status: 'verified' },
    { id: `doc-${emp.id}-4`, title: 'Ijazah S1 Pendidikan Terakhir', category: 'Pendidikan', fileNumber: `IJZ-2016-${emp.id * 100}`, fileName: `ijazah_s1_${cleanName.toLowerCase().replace(/\s+/g, '_')}.pdf`, fileSize: '3.4 MB', updatedAt: tanggalMasuk, status: 'verified' },
    { id: `doc-${emp.id}-5`, title: 'SK Perjanjian Kerja Tetap (PKWTT)', category: 'Legalitas', fileNumber: `SK-HRIS/2021/${emp.id}`, fileName: `sk_kerja_${cleanName.toLowerCase().replace(/\s+/g, '_')}.pdf`, fileSize: '2.1 MB', updatedAt: tanggalMasuk, status: 'verified' },
    { id: `doc-${emp.id}-6`, title: 'Buku Tabungan Payroll BCA', category: 'Keuangan', fileNumber: `Rek: ${rekNo}`, fileName: `buku_tabungan_${bankName.toLowerCase()}.pdf`, fileSize: '980 KB', updatedAt: tanggalMasuk, status: 'verified' },
  ]

  // Galeri Foto Presensi, Surat & Kerja
  const galeri = matchedHris?.galeri || [
    { id: `gal-${emp.id}-1`, title: 'Presensi Masuk (Selfie Liveness)', category: 'absen', categoryLabel: 'Foto Presensi', timestamp: '10 Nov 2026, 07:54 WIB', location: `${lokasi} (Radius 12m)`, imageUrl: '' },
    { id: `gal-${emp.id}-2`, title: 'Presensi Pulang (Selfie Liveness)', category: 'absen', categoryLabel: 'Foto Presensi', timestamp: '09 Nov 2026, 17:15 WIB', location: `${lokasi} (Radius 15m)`, imageUrl: '' },
    { id: `gal-${emp.id}-3`, title: 'Surat Keterangan Dokter (SKD) / Cuti', category: 'surat', categoryLabel: 'Surat Izin / Dokter', timestamp: '05 Nov 2026', location: 'Disetujui Tim Medis & HRD', imageUrl: '' },
    { id: `gal-${emp.id}-4`, title: 'Dokumentasi Aktivitas & Seragam Kerja', category: 'kerja', categoryLabel: 'Dokumentasi Kerja', timestamp: '01 Nov 2026', location: `Ruang Kerja ${divisi}`, imageUrl: '' },
  ]

  return {
    id: emp.id,
    nip: emp.nip,
    nama: emp.nama,
    panggilan: names[0],
    avatar: initials,
    jabatan: jabatan,
    divisi: divisi,
    departemen: emp.departemen || divisi,
    cabang: lokasi,
    lokasi: lokasi,
    status: status,
    statusBadge: status === 'Tetap' ? 'success' : status === 'Kontrak' ? 'warning' : 'info',
    level: pribadiPekerjaan.level,
    tanggalMasuk: tanggalMasuk,
    masaKerja: pribadiPekerjaan.masaKerja,
    gaji: gajiPokok,
    tunjangan: tunjangan,
    bpjsAktif: bpjsAktif,

    // Sub-data terstruktur
    pribadi: {
      ...emp.pribadi,
      pekerjaan: pribadiPekerjaan,
      biodata: pribadiBiodata,
      identitas: pribadiIdentitas,
      keluarga: pribadiKeluarga,
      // Backward compatibility props
      nik: pribadiIdentitas.nik,
      npwp: pribadiIdentitas.npwp,
      tempatLahir: lokasi,
      tanggalLahir: pribadiBiodata.tempatTanggalLahir.split(', ')[1] || '14 Mei 1994 (30 Tahun)',
      jenisKelamin: pribadiBiodata.jenisKelamin,
      agama: pribadiBiodata.agama,
      statusPernikahan: pribadiBiodata.statusPernikahan,
      ptkp: pribadiBiodata.ptkp,
      emailKantor: pribadiBiodata.kredensialLogin,
      emailPribadi: pribadiIdentitas.emailPribadi,
      telepon: pribadiIdentitas.telepon,
      alamatKtp: pribadiIdentitas.alamatKtp,
      alamatDomisili: pribadiIdentitas.alamatDomisili,
      kontakDaruratNama: pribadiKeluarga.kontakDaruratNama,
      kontakDaruratHubungan: pribadiKeluarga.kontakDaruratHubungan,
      kontakDaruratTelp: pribadiKeluarga.kontakDaruratTelp,
      pendidikanTerakhir: pribadiKeluarga.pendidikanTerakhir,
    },

    presensi,
    payroll,
    bpjs,
    dokumen,
    galeri,
  }
}

// Seluruh daftar karyawan untuk switcher / dropdown
export const getAllEmployeesList = () => {
  return karyawanList.map((emp) => ({
    id: emp.id,
    nip: emp.nip,
    nama: emp.nama,
    jabatan: emp.jabatan,
    divisi: emp.divisi,
    lokasi: emp.lokasi,
    avatar: emp.avatar,
    status: emp.status,
  }))
}

