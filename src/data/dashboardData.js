// ========================================================
// DASHBOARD OPERASIONAL BISNIS & ORDER DATASET
// Terinspirasi dari sistem operasional modern (gambar referensi)
// ========================================================

// 1. KPI Top Summary Cards
export const kpiSummary = {
  totalOrder: {
    value: 142,
    unit: 'order',
    growth: '+12,7%',
    growthType: 'up',
    subtitle: 'dari kemarin',
  },
  omzet: {
    value: 7850000,
    formatted: 'Rp 7.850.000',
    growth: '+18,4%',
    growthType: 'up',
    subtitle: 'dari kemarin',
  },
  orderDiproses: {
    value: 36,
    unit: 'order',
    subtitle: 'Sedang berjalan di antrean',
  },
  pelangganAktif: {
    value: 1248,
    unit: 'org',
    growth: '+3,9%',
    growthType: 'up',
    subtitle: '7 hari terakhir',
  },
  mesinAktif: {
    aktif: 8,
    total: 10,
    utilisasiPct: 80,
    subtitle: '80% Utilisasi',
  },
  stokMenipis: {
    count: 4,
    unit: 'item',
    warning: 'Perlu restok segera',
    isAlert: true,
  },
}

// 2. Data Tren Omzet & Order (Dual Line / Area Chart)
export const trenDataPresets = {
  '7hari': {
    label: '7 Hari Terakhir',
    dates: ['21 Jan', '22 Jan', '23 Jan', '24 Jan', '25 Jan', '26 Jan', '27 Jan'],
    omzet: [4200000, 4800000, 5100000, 5600000, 6900000, 7200000, 7850000],
    order: [82, 94, 98, 110, 132, 136, 142],
    maxOmzet: 10000000,
    maxOrder: 200,
  },
  '14hari': {
    label: '14 Hari Terakhir',
    dates: ['14 Jan', '16 Jan', '18 Jan', '20 Jan', '22 Jan', '24 Jan', '27 Jan'],
    omzet: [3800000, 4100000, 4600000, 4900000, 5800000, 6700000, 7850000],
    order: [74, 80, 88, 96, 114, 128, 142],
    maxOmzet: 10000000,
    maxOrder: 200,
  },
  'bulan': {
    label: 'Bulan Ini',
    dates: ['W1', 'W2', 'W3', 'W4'],
    omzet: [22400000, 28500000, 34200000, 39800000],
    order: [450, 560, 670, 780],
    maxOmzet: 50000000,
    maxOrder: 1000,
  },
}

// 3. Volume Order per Layanan (Horizontal Bar Chart)
export const layananData = [
  { id: 'cuci-kiloan', label: 'Cuci Kiloan', count: 68, pct: 47.8, color: '#3b82f6' },
  { id: 'cuci-satuan', label: 'Cuci Satuan', count: 28, pct: 19.7, color: '#60a5fa' },
  { id: 'setrika-saja', label: 'Setrika Saja', count: 18, pct: 12.6, color: '#93c5fd' },
  { id: 'cuci-bedcover', label: 'Cuci Bedcover', count: 12, pct: 8.5, color: '#a5b4fc' },
  { id: 'cuci-ekspres', label: 'Cuci Ekspres', count: 9, pct: 6.3, color: '#f59e0b' },
  { id: 'lainnya', label: 'Lainnya', count: 7, pct: 5.1, color: '#94a3b8' },
]

// 4. Distribusi Status Order (Donut Chart)
export const statusDistribusi = [
  { id: 'selesai', label: 'Selesai', count: 72, pct: 50.7, color: '#10b981', softBg: '#ecfdf5' },
  { id: 'diproses', label: 'Diproses', count: 36, pct: 25.4, color: '#3b82f6', softBg: '#eff6ff' },
  { id: 'siap', label: 'Siap Diambil', count: 24, pct: 16.9, color: '#f59e0b', softBg: '#fffbeb' },
  { id: 'batal', label: 'Dibatalkan', count: 10, pct: 7.0, color: '#f43f5e', softBg: '#fff1f2' },
]

// 5. Ringkasan Keuangan
export const ringkasanKeuangan = {
  pemasukan: 7850000,
  pengeluaran: 2145000,
  labaKotor: 5705000,
  labaGrowthPct: '+72,7%',
}

// 6. Utilisasi Mesin
export const utilisasiMesin = {
  totalUnit: 10,
  aktifUnit: 8,
  utilisasiPct: 80,
  totalSiklus: 64,
  totalKg: 436.5,
}

// 7. Stok & Inventaris (Peringatan Menipis)
export const inventarisWarning = [
  { id: 1, nama: 'Parfum Laundry Premium', sisa: '2,5 L', status: 'Kritis', badgeVariant: 'danger' },
  { id: 2, nama: 'Deterjen Cair Konsentrat', sisa: '5,0 kg', status: 'Menipis', badgeVariant: 'warning' },
  { id: 3, nama: 'Softener Anti Bakteri', sisa: '4,2 L', status: 'Menipis', badgeVariant: 'warning' },
  { id: 4, nama: 'Plastik Packing Klip (L)', sisa: '80 pcs', status: 'Menipis', badgeVariant: 'warning' },
]

// 8. Pickup, Delivery & Absensi
export const logistikDanKaryawan = {
  pickup: {
    count: 18,
    growth: '+28,6%',
  },
  delivery: {
    count: 20,
    growth: '+11,1%',
  },
  absensi: {
    hadir: 12,
    total: 14,
    pct: 85.7,
  },
}

// 9. Timeline Aktivitas Operasional Real-Time
export const aktivitasOperasional = [
  {
    id: 'act-1',
    waktu: '10:24',
    judul: 'Order baru masuk',
    deskripsi: 'ORD-250127-0142 • Budi Santoso • Cuci Kiloan (5,0 kg)',
    icon: 'cart',
    color: 'emerald',
  },
  {
    id: 'act-2',
    waktu: '10:18',
    judul: 'Pembayaran diterima',
    deskripsi: 'ORD-250127-0140 • Rp 45.000 (QRIS Merchant)',
    icon: 'wallet',
    color: 'blue',
  },
  {
    id: 'act-3',
    waktu: '10:07',
    judul: 'Pickup selesai',
    deskripsi: 'ORD-250127-0138 • Diambil oleh Kurir Armada #K003',
    icon: 'truck',
    color: 'sky',
  },
  {
    id: 'act-4',
    waktu: '09:56',
    judul: 'Mesin selesai siklus',
    deskripsi: 'Mesin M-02 • 12,5 kg • Durasi 48 menit wash-dry',
    icon: 'machine',
    color: 'purple',
  },
  {
    id: 'act-5',
    waktu: '09:41',
    judul: 'Stok berkurang',
    deskripsi: 'Deterjen • -5,0 kg • Sisa 5,0 kg (Ambang Menipis)',
    icon: 'box',
    color: 'amber',
  },
]

// 10. Tabel Order Terbaru
export const orderTerbaruList = [
  {
    noOrder: 'ORD-250127-0142',
    pelanggan: 'Budi Santoso',
    layanan: 'Cuci Kiloan',
    berat: '5,0 kg',
    total: 45000,
    status: 'Diproses',
    statusVariant: 'info',
    waktu: '10:24',
  },
  {
    noOrder: 'ORD-250127-0141',
    pelanggan: 'Siti Rahma',
    layanan: 'Cuci Satuan (Kemeja)',
    berat: '3 pcs',
    total: 36000,
    status: 'Siap Diambil',
    statusVariant: 'warning',
    waktu: '10:20',
  },
  {
    noOrder: 'ORD-250127-0140',
    pelanggan: 'Andi Pratama',
    layanan: 'Cuci Bedcover',
    berat: '2,5 kg',
    total: 75000,
    status: 'Selesai',
    statusVariant: 'success',
    waktu: '10:18',
  },
  {
    noOrder: 'ORD-250127-0139',
    pelanggan: 'Dewi Lestari',
    layanan: 'Setrika Saja',
    berat: '10 pcs',
    total: 50000,
    status: 'Diproses',
    statusVariant: 'info',
    waktu: '10:02',
  },
  {
    noOrder: 'ORD-250127-0138',
    pelanggan: 'Rizky Maulana',
    layanan: 'Cuci Ekspres',
    berat: '4,0 kg',
    total: 60000,
    status: 'Selesai',
    statusVariant: 'success',
    waktu: '09:56',
  },
]

