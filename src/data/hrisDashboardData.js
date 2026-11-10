// Data Mockup untuk Dashboard HRIS Digaji.id
// Representasi multi-tenant, multi-cabang, dan metrik operasional presensi & payroll

export const hrisBranches = [
  { id: 'all', label: 'Semua Cabang (4 Lokasi)', code: 'ALL', employees: 1284, tz: 'WIB' },
  { id: 'jkt', label: 'Kantor Pusat Jakarta', code: 'JKT-HQ', employees: 680, tz: 'WIB' },
  { id: 'sby', label: 'Cabang Surabaya (Rungkut)', code: 'SBY-01', employees: 340, tz: 'WIB' },
  { id: 'dps', label: 'Cabang Denpasar (Kuta)', code: 'DPS-02', employees: 144, tz: 'WITA' },
  { id: 'mdn', label: 'Hub Logistik Medan', code: 'MDN-03', employees: 120, tz: 'WIB' },
]

export const hrisKpiMetrics = {
  totalKaryawan: {
    value: 1284,
    trend: 3.2,
    trendDirection: 'up',
    badgeText: '+14 bulan ini',
    subtext: '98.2% retensi talenta',
  },
  kehadiranHariIni: {
    value: 94.6,
    trend: 1.8,
    trendDirection: 'up',
    badgeText: '1.215 / 1.284',
    subtext: '1.140 tepat waktu · 75 telat',
  },
  cutiDanIzin: {
    value: 46,
    trend: 8.5,
    trendDirection: 'down',
    badgeText: '3.6% staf',
    subtext: '28 cuti tahunan · 12 sakit · 6 izin',
  },
  estimasiPayroll: {
    value: 5420800000,
    trend: 2.4,
    trendDirection: 'up',
    badgeText: 'Cut-off H-5',
    subtext: '94% komponen terhitung',
  },
}

export const hrisShiftSummary = [
  { id: 'pagi', name: 'Shift Pagi', time: '07:00 - 15:00', total: 680, present: 652, color: 'blue' },
  { id: 'siang', name: 'Shift Siang', time: '15:00 - 23:00', total: 360, present: 344, color: 'amber' },
  { id: 'malam', name: 'Shift Malam', time: '23:00 - 07:00', total: 172, present: 161, color: 'purple' },
  { id: 'off', name: 'Lepas / Libur', time: 'Non-Aktif', total: 72, present: 0, color: 'neutral' },
]

export const hrisLiveAttendance = [
  {
    id: 1,
    name: 'Budi Santoso',
    role: 'Staff Warehouse',
    dept: 'Logistik & Operasional',
    branch: 'Hub Medan',
    time: '07:54 WIB',
    shift: 'Pagi (07:00 - 15:00)',
    status: 'ontime',
    statusLabel: 'Tepat Waktu',
    locationAccuracy: 'Radius 18m (Valid)',
    device: 'Mobile GPS · Verified',
  },
  {
    id: 2,
    name: 'Siti Rahmawati',
    role: 'Senior Frontend Engineer',
    dept: 'Engineering & Tech',
    branch: 'Pusat Jakarta',
    time: '08:02 WIB',
    shift: 'Reguler (08:00 - 17:00)',
    status: 'ontime',
    statusLabel: 'Tepat Waktu',
    locationAccuracy: 'Radius 12m (Valid)',
    device: 'Face Biometric · Valid',
  },
  {
    id: 3,
    name: 'Dimas Pratama',
    role: 'Account Executive',
    dept: 'Sales & Growth',
    branch: 'Pusat Jakarta',
    time: '08:24 WIB',
    shift: 'Reguler (08:00 - 17:00)',
    status: 'late',
    statusLabel: 'Terlambat 24m',
    locationAccuracy: 'Radius 32m (Valid)',
    device: 'Mobile GPS · Verified',
  },
  {
    id: 4,
    name: 'Ni Made Ayu Sri',
    role: 'Guest Relations Lead',
    dept: 'Operasional Layanan',
    branch: 'Cabang Bali',
    time: '08:52 WITA',
    shift: 'Pagi (09:00 - 17:00)',
    status: 'ontime',
    statusLabel: 'Tepat Waktu',
    locationAccuracy: 'Radius 8m (Valid)',
    device: 'Face Biometric · Valid',
  },
  {
    id: 5,
    name: 'Rian Hidayat',
    role: 'Maintenance Specialist',
    dept: 'Teknik Fasilitas',
    branch: 'Cabang Surabaya',
    time: '06:55 WIB',
    shift: 'Pagi (07:00 - 15:00)',
    status: 'ontime',
    statusLabel: 'Tepat Waktu',
    locationAccuracy: 'Radius 25m (Valid)',
    device: 'Mobile GPS · Verified',
  },
  {
    id: 6,
    name: 'Dewi Lestari',
    role: 'Tax & Payroll Specialist',
    dept: 'Finance & HR',
    branch: 'Pusat Jakarta',
    time: '08:05 WIB',
    shift: 'Reguler (08:00 - 17:00)',
    status: 'ontime',
    statusLabel: 'Tepat Waktu',
    locationAccuracy: 'Radius 15m (Valid)',
    device: 'Face Biometric · Valid',
  },
]

export const hrisPendingApprovals = [
  {
    id: 101,
    type: 'Cuti Tahunan',
    typeBadge: 'info',
    applicant: 'Agus Setiawan',
    dept: 'Engineering',
    duration: '3 Hari (12 - 14 Nov 2026)',
    reason: 'Urusan keluarga di Jawa Tengah',
    approverLevel: 'Menunggu HRD (L2)',
    avatarBg: 'bg-blue-500',
  },
  {
    id: 102,
    type: 'Lembur Operasional',
    typeBadge: 'warning',
    applicant: 'Wahyu Nugroho',
    dept: 'Logistik Surabaya',
    duration: '3.5 Jam (Hari Ini 18:00 - 21:30)',
    reason: 'Bongkar muat kontainer batch impor 4',
    approverLevel: 'Menunggu Supervisor',
    avatarBg: 'bg-amber-500',
  },
  {
    id: 103,
    type: 'Klaim Medis',
    typeBadge: 'success',
    applicant: 'Clarissa Natalia',
    dept: 'Product Design',
    duration: 'Rp 650.000',
    reason: 'Pemeriksaan mata & resep kacamata kerja',
    approverLevel: 'Menunggu Finance',
    avatarBg: 'bg-emerald-500',
  },
  {
    id: 104,
    type: 'Tukar Shift',
    typeBadge: 'neutral',
    applicant: 'Faisal Basri',
    dept: 'Security Medan',
    duration: '11 Nov 2026 (Shift Malam ➔ Pagi)',
    reason: 'Jadwal kontrol kesehatan berkala di RSUD',
    approverLevel: 'Menunggu Kepala Regu',
    avatarBg: 'bg-purple-500',
  },
]

export const hrisDepartmentBreakdown = [
  { name: 'Engineering & Tech', count: 320, percent: 25.0, color: '#3b82f6' },
  { name: 'Operasional & Gudang', count: 480, percent: 37.4, color: '#10b981' },
  { name: 'Sales & Marketing', count: 210, percent: 16.4, color: '#f59e0b' },
  { name: 'Finance & HRIS', count: 140, percent: 10.9, color: '#8b5cf6' },
  { name: 'Layanan Pelanggan', count: 134, percent: 10.3, color: '#06b6d4' },
]

export const hrisContractBreakdown = [
  { label: 'PKWTT (Tetap)', count: 780, percent: 60.7, color: '#10b981' },
  { label: 'PKWT (Kontrak)', count: 360, percent: 28.0, color: '#3b82f6' },
  { label: 'Probation (Percobaan)', count: 88, percent: 6.9, color: '#f59e0b' },
  { label: 'Magang / Internship', count: 56, percent: 4.4, color: '#8b5cf6' },
]

export const hrisComplianceAlerts = [
  {
    id: 1,
    title: 'Masa Percobaan (Probation) Berakhir',
    desc: '4 Karyawan masa probation habis dalam 7 hari ke depan (Evaluasi L1 diperlukan).',
    type: 'warning',
    actionText: 'Review Evaluasi',
  },
  {
    id: 2,
    title: 'Pembaruan Kontrak Kerja PKWT',
    desc: '6 Karyawan kontrak akan jatuh tempo dalam 30 hari ke depan.',
    type: 'info',
    actionText: 'Lihat Daftar',
  },
  {
    id: 3,
    title: 'Batas Pelaporan PPh 21 Masa',
    desc: 'Batas akhir sinkronisasi e-Bupot 21 sebelum tanggal 20 bulan berjalan.',
    type: 'neutral',
    actionText: 'Cek Rekap Pajak',
  },
]

export const hrisUpcomingHolidays = [
  { date: '25 Des 2026', name: 'Hari Raya Natal', daysLeft: '45 hari lagi' },
  { date: '01 Jan 2027', name: 'Tahun Baru 2027 Masehi', daysLeft: '52 hari lagi' },
  { date: '29 Jan 2027', name: 'Tahun Baru Imlek 2578', daysLeft: '80 hari lagi' },
]

