// Data Master Shift & Roster Kerja HRIS Digaji.id
// Mendukung Mode Mingguan (7 Hari) & Mode 1 Bulan Penuh (30 Hari)
// Dilengkapi Struktur Tree Wilayah/Kantor & Organisasi (Divisi -> Departemen -> Jabatan)

export const shiftTypes = [
  {
    id: 1,
    code: 'P',
    name: 'Shift Pagi',
    time: '07:00 - 15:00',
    startTime: '07:00',
    endTime: '15:00',
    hours: 8,
    breakTime: 60,
    lateTolerance: 15,
    color: 'emerald',
    badgeVariant: 'success',
    isActive: true,
    employeeCount: 14,
    desc: 'Shift operasional pagi hari',
  },
  {
    id: 2,
    code: 'S',
    name: 'Shift Siang',
    time: '15:00 - 23:00',
    startTime: '15:00',
    endTime: '23:00',
    hours: 8,
    breakTime: 60,
    lateTolerance: 15,
    color: 'amber',
    badgeVariant: 'warning',
    isActive: true,
    employeeCount: 9,
    desc: 'Shift sore & pergantian malam',
  },
  {
    id: 3,
    code: 'M',
    name: 'Shift Malam',
    time: '23:00 - 07:00',
    startTime: '23:00',
    endTime: '07:00',
    hours: 8,
    breakTime: 60,
    lateTolerance: 15,
    color: 'purple',
    badgeVariant: 'purple',
    isActive: true,
    employeeCount: 7,
    desc: 'Shift jaga malam 24/7',
  },
  {
    id: 4,
    code: 'REG',
    name: 'Shift Kantor Reguler',
    time: '08:30 - 17:30',
    startTime: '08:30',
    endTime: '17:30',
    hours: 8,
    breakTime: 60,
    lateTolerance: 10,
    color: 'sky',
    badgeVariant: 'info',
    isActive: true,
    employeeCount: 22,
    desc: 'Shift kantor reguler Senin - Jumat',
  },
  {
    id: 5,
    code: 'FLX',
    name: 'Shift Fleksibel / Remote',
    time: '09:00 - 18:00',
    startTime: '09:00',
    endTime: '18:00',
    hours: 8,
    breakTime: 60,
    lateTolerance: 30,
    color: 'neutral',
    badgeVariant: 'neutral',
    isActive: true,
    employeeCount: 8,
    desc: 'Shift jam kerja fleksibel & remote work',
  },
  {
    id: 6,
    code: 'OFF',
    name: 'Libur (Off)',
    time: 'Bebas Tugas',
    startTime: '00:00',
    endTime: '00:00',
    hours: 0,
    breakTime: 0,
    lateTolerance: 0,
    color: 'neutral',
    badgeVariant: 'neutral',
    isActive: true,
    employeeCount: 26,
    desc: 'Hari libur resmi / istirahat mingguan',
  },
  {
    id: 7,
    code: 'C',
    name: 'Cuti / Izin',
    time: 'Cuti Terencana',
    startTime: '00:00',
    endTime: '00:00',
    hours: 0,
    breakTime: 0,
    lateTolerance: 0,
    color: 'blue',
    badgeVariant: 'info',
    isActive: true,
    employeeCount: 4,
    desc: 'Cuti tahunan atau izin resmi disetujui HR',
  },
]

// 1 Bulan Penuh: November 2026 (30 Hari)
const fullDayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const shortDayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

export const fullMonthDays = Array.from({ length: 30 }, (_, i) => {
  const dayNum = i + 1
  const dateStr = `2026-11-${String(dayNum).padStart(2, '0')}`
  const dateObj = new Date(2026, 10, dayNum) // November 2026
  const dIndex = dateObj.getDay()
  const isWeekend = dIndex === 0 || dIndex === 6

  return {
    date: dateStr,
    dayName: fullDayNames[dIndex],
    shortDay: shortDayNames[dIndex],
    dateLabel: `${dayNum} Nov`,
    dayNumber: dayNum,
    isToday: dayNum === 10,
    isWeekend,
  }
})

// Mode Mingguan: 10 Nov - 16 Nov 2026 (Minggu ke-2)
export const defaultWeekDays = fullMonthDays.slice(9, 16)

// Pola dasar rotasi 30 hari untuk tiap pegawai
const generateMonthlySchedule = (pattern, seedOffset = 0) => {
  const schedules = {}
  fullMonthDays.forEach((day, idx) => {
    const patIndex = (idx + seedOffset) % pattern.length
    schedules[day.date] = pattern[patIndex]
  })
  return schedules
}

export const rosterEmployees = [
  {
    id: 1,
    nip: 'EMP-2024-001',
    name: 'Rizky Pratama',
    avatar: 'RP',
    role: 'Lead IT Support 24/7',
    divisi: 'Teknologi & IT',
    departemen: 'Software & Cloud 24/7',
    cabang: 'Kantor Pusat Jakarta',
    wilayah: 'Wilayah DKI Jakarta & Banten',
    schedules: generateMonthlySchedule(['P', 'P', 'P', 'S', 'S', 'OFF', 'OFF', 'P', 'P', 'S', 'S', 'M', 'OFF', 'OFF'], 0),
  },
  {
    id: 2,
    nip: 'EMP-2024-002',
    name: 'Bagas Wicaksono',
    avatar: 'BW',
    role: 'Staff DevOps & Cloud',
    divisi: 'Teknologi & IT',
    departemen: 'Software & Cloud 24/7',
    cabang: 'Kantor Pusat Jakarta',
    wilayah: 'Wilayah DKI Jakarta & Banten',
    schedules: generateMonthlySchedule(['S', 'S', 'M', 'M', 'OFF', 'OFF', 'P', 'S', 'S', 'M', 'OFF', 'OFF', 'P', 'P'], 2),
  },
  {
    id: 3,
    nip: 'EMP-2024-003',
    name: 'Fajar Nugroho',
    avatar: 'FN',
    role: 'Network Engineer On-Site',
    divisi: 'Teknologi & IT',
    departemen: 'Software & Cloud 24/7',
    cabang: 'Kantor Pusat Jakarta',
    wilayah: 'Wilayah DKI Jakarta & Banten',
    schedules: generateMonthlySchedule(['M', 'M', 'OFF', 'OFF', 'P', 'P', 'S', 'M', 'OFF', 'OFF', 'P', 'P', 'S', 'S'], 4),
  },
  {
    id: 4,
    nip: 'EMP-2024-004',
    name: 'Budi Santoso',
    avatar: 'BS',
    role: 'Supervisor Keamanan (Satpam)',
    divisi: 'Keamanan & Fasilitas',
    departemen: 'Pengamanan Fisik (Satpam)',
    cabang: 'Kantor Pusat Jakarta',
    wilayah: 'Wilayah DKI Jakarta & Banten',
    schedules: generateMonthlySchedule(['P', 'P', 'S', 'S', 'M', 'OFF', 'OFF'], 0),
  },
  {
    id: 5,
    nip: 'EMP-2024-005',
    name: 'Hendro Gunawan',
    avatar: 'HG',
    role: 'Petugas Jaga Regu A',
    divisi: 'Keamanan & Fasilitas',
    departemen: 'Pengamanan Fisik (Satpam)',
    cabang: 'Kantor Pusat Jakarta',
    wilayah: 'Wilayah DKI Jakarta & Banten',
    schedules: generateMonthlySchedule(['S', 'S', 'M', 'M', 'OFF', 'P', 'P'], 1),
  },
  {
    id: 6,
    nip: 'EMP-2024-006',
    name: 'Agus Setiawan',
    avatar: 'AS',
    role: 'Petugas Jaga Regu B',
    divisi: 'Keamanan & Fasilitas',
    departemen: 'Pengamanan Fisik (Satpam)',
    cabang: 'Kantor Pusat Jakarta',
    wilayah: 'Wilayah DKI Jakarta & Banten',
    schedules: generateMonthlySchedule(['M', 'M', 'OFF', 'OFF', 'P', 'S', 'S'], 3),
  },
  {
    id: 7,
    nip: 'EMP-2024-007',
    name: 'Dewi Lestari',
    avatar: 'DL',
    role: 'Supervisor Customer Care',
    divisi: 'Layanan & CS',
    departemen: 'Customer Contact Center',
    cabang: 'Cabang Bandung',
    wilayah: 'Wilayah Jawa Barat',
    schedules: generateMonthlySchedule(['P', 'P', 'P', 'P', 'P', 'OFF', 'OFF'], 0),
  },
  {
    id: 8,
    nip: 'EMP-2024-008',
    name: 'Rina Marlina',
    avatar: 'RM',
    role: 'Helpdesk Call Center',
    divisi: 'Layanan & CS',
    departemen: 'Customer Contact Center',
    cabang: 'Cabang Bandung',
    wilayah: 'Wilayah Jawa Barat',
    schedules: generateMonthlySchedule(['S', 'S', 'S', 'S', 'S', 'OFF', 'OFF'], 0),
  },
  {
    id: 9,
    nip: 'EMP-2024-009',
    name: 'Arif Hidayat',
    avatar: 'AH',
    role: 'Night Support Dispatcher',
    divisi: 'Layanan & CS',
    departemen: 'Customer Contact Center',
    cabang: 'Cabang Bandung',
    wilayah: 'Wilayah Jawa Barat',
    schedules: generateMonthlySchedule(['M', 'M', 'M', 'M', 'OFF', 'OFF', 'P'], 2),
  },
  {
    id: 10,
    nip: 'EMP-2024-010',
    name: 'Wahyu Ramadhan',
    avatar: 'WR',
    role: 'Supervisor Gudang & Rantai Pasok',
    divisi: 'Operasional Gudang',
    departemen: 'Logistik & Distribusi',
    cabang: 'Gudang Logistik Cikarang',
    wilayah: 'Wilayah DKI Jakarta & Banten',
    schedules: generateMonthlySchedule(['P', 'P', 'P', 'P', 'P', 'OFF', 'OFF'], 0),
  },
  {
    id: 11,
    nip: 'EMP-2024-011',
    name: 'Siti Rahmawati',
    avatar: 'SR',
    role: 'Petugas Sortir & Quality Check',
    divisi: 'Operasional Gudang',
    departemen: 'Logistik & Distribusi',
    cabang: 'Gudang Logistik Cikarang',
    wilayah: 'Wilayah DKI Jakarta & Banten',
    schedules: generateMonthlySchedule(['S', 'S', 'S', 'OFF', 'OFF', 'P', 'P'], 3),
  },
  {
    id: 12,
    nip: 'EMP-2024-012',
    name: 'Dodi Firmansyah',
    avatar: 'DF',
    role: 'Forklift Operator Malam',
    divisi: 'Operasional Gudang',
    departemen: 'Logistik & Distribusi',
    cabang: 'Gudang Logistik Cikarang',
    wilayah: 'Wilayah DKI Jakarta & Banten',
    schedules: generateMonthlySchedule(['M', 'M', 'M', 'M', 'OFF', 'OFF', 'S'], 1),
  },
  {
    id: 13,
    nip: 'EMP-2024-013',
    name: 'dr. Indah Permata',
    avatar: 'IP',
    role: 'Dokter Klinik Perusahaan Pagi',
    divisi: 'Medis & Kesehatan',
    departemen: 'Layanan Kesehatan & K3',
    cabang: 'Kantor Pusat Jakarta',
    wilayah: 'Wilayah DKI Jakarta & Banten',
    schedules: generateMonthlySchedule(['P', 'P', 'P', 'P', 'P', 'OFF', 'OFF'], 0),
  },
  {
    id: 14,
    nip: 'EMP-2024-014',
    name: 'Suster Nurul Aini',
    avatar: 'NA',
    role: 'Perawat On-Call / UGD',
    divisi: 'Medis & Kesehatan',
    departemen: 'Layanan Kesehatan & K3',
    cabang: 'Kantor Pusat Jakarta',
    wilayah: 'Wilayah DKI Jakarta & Banten',
    schedules: generateMonthlySchedule(['S', 'S', 'OFF', 'M', 'M', 'OFF', 'P'], 2),
  },
  {
    id: 15,
    nip: 'EMP-2024-015',
    name: 'Eko Prasetyo',
    avatar: 'EP',
    role: 'Teknisi MEP & Genset',
    divisi: 'Keamanan & Fasilitas',
    departemen: 'Mekanikal, Elektrikal & Gedung',
    cabang: 'Kantor Pusat Jakarta',
    wilayah: 'Wilayah DKI Jakarta & Banten',
    schedules: generateMonthlySchedule(['C', 'C', 'P', 'P', 'S', 'OFF', 'OFF', 'P', 'P', 'P', 'S', 'S', 'OFF', 'OFF'], 0),
  },
  {
    id: 16,
    nip: 'EMP-2024-016',
    name: 'Ratna Kusuma',
    avatar: 'RK',
    role: 'Facility Officer',
    divisi: 'Keamanan & Fasilitas',
    departemen: 'Mekanikal, Elektrikal & Gedung',
    cabang: 'Kantor Pusat Jakarta',
    wilayah: 'Wilayah DKI Jakarta & Banten',
    schedules: generateMonthlySchedule(['P', 'S', 'S', 'OFF', 'OFF', 'M', 'M'], 2),
  },
]

// Struktur Pohon Wilayah & Kantor Cabang (Untuk BaseTree / BaseTreeSelect)
export const locationTreeNodes = [
  {
    id: 'wilayah-dki',
    label: 'Wilayah DKI Jakarta & Banten',
    badge: '11 Pegawai',
    children: [
      { id: 'Kantor Pusat Jakarta', label: 'Kantor Pusat Jakarta (Menara Digaji)', badge: '8 Pegawai' },
      { id: 'Gudang Logistik Cikarang', label: 'Gudang Logistik Cikarang', badge: '3 Pegawai' },
    ],
  },
  {
    id: 'wilayah-jabar',
    label: 'Wilayah Jawa Barat',
    badge: '3 Pegawai',
    children: [
      { id: 'Cabang Bandung', label: 'Cabang Bandung (Dago)', badge: '3 Pegawai' },
    ],
  },
  {
    id: 'wilayah-jatim',
    label: 'Wilayah Jawa Timur',
    badge: 'Cabang Baru',
    children: [
      { id: 'Cabang Surabaya', label: 'Cabang Surabaya (Gubeng)', badge: 'Standby' },
    ],
  },
]

// Struktur Pohon Organisasi: Divisi -> Departemen -> Jabatan (Untuk BaseTree / BaseTreeSelect)
export const organizationTreeNodes = [
  {
    id: 'Teknologi & IT',
    label: 'Divisi Teknologi & IT',
    badge: '3 Pegawai',
    children: [
      {
        id: 'dept-it-ops',
        label: 'Departemen Software & Cloud 24/7',
        children: [
          { id: 'Lead IT Support 24/7', label: 'Lead IT Support 24/7' },
          { id: 'Staff DevOps & Cloud', label: 'Staff DevOps & Cloud' },
          { id: 'Network Engineer On-Site', label: 'Network Engineer On-Site' },
        ],
      },
    ],
  },
  {
    id: 'Keamanan & Fasilitas',
    label: 'Divisi Keamanan & Fasilitas',
    badge: '5 Pegawai',
    children: [
      {
        id: 'dept-sec-guard',
        label: 'Departemen Pengamanan Fisik (Satpam)',
        children: [
          { id: 'Supervisor Keamanan (Satpam)', label: 'Supervisor Keamanan (Satpam)' },
          { id: 'Petugas Jaga Regu A', label: 'Petugas Jaga Regu A' },
          { id: 'Petugas Jaga Regu B', label: 'Petugas Jaga Regu B' },
        ],
      },
      {
        id: 'dept-sec-facility',
        label: 'Departemen Mekanikal, Elektrikal & Gedung',
        children: [
          { id: 'Teknisi MEP & Genset', label: 'Teknisi MEP & Genset' },
          { id: 'Facility Officer', label: 'Facility Officer' },
        ],
      },
    ],
  },
  {
    id: 'Layanan & CS',
    label: 'Divisi Layanan & CS',
    badge: '3 Pegawai',
    children: [
      {
        id: 'dept-cs-care',
        label: 'Departemen Customer Contact Center',
        children: [
          { id: 'Supervisor Customer Care', label: 'Supervisor Customer Care' },
          { id: 'Helpdesk Call Center', label: 'Helpdesk Call Center' },
          { id: 'Night Support Dispatcher', label: 'Night Support Dispatcher' },
        ],
      },
    ],
  },
  {
    id: 'Operasional Gudang',
    label: 'Divisi Operasional Gudang',
    badge: '3 Pegawai',
    children: [
      {
        id: 'dept-gudang-log',
        label: 'Departemen Logistik & Distribusi',
        children: [
          { id: 'Supervisor Gudang & Rantai Pasok', label: 'Supervisor Gudang & Rantai Pasok' },
          { id: 'Petugas Sortir & Quality Check', label: 'Petugas Sortir & Quality Check' },
          { id: 'Forklift Operator Malam', label: 'Forklift Operator Malam' },
        ],
      },
    ],
  },
  {
    id: 'Medis & Kesehatan',
    label: 'Divisi Medis & Kesehatan',
    badge: '2 Pegawai',
    children: [
      {
        id: 'dept-medis-k3',
        label: 'Departemen Layanan Kesehatan & K3',
        children: [
          { id: 'Dokter Klinik Perusahaan Pagi', label: 'Dokter Klinik Perusahaan Pagi' },
          { id: 'Perawat On-Call / UGD', label: 'Perawat On-Call / UGD' },
        ],
      },
    ],
  },
]

export const shiftSwapRequests = [
  {
    id: 'SWAP-001',
    requestDate: '10 Nov 2026',
    targetDate: '2026-11-12',
    requester: {
      id: 2,
      name: 'Bagas Wicaksono',
      role: 'Staff DevOps',
      avatar: 'BW',
      currentShift: 'M',
    },
    targetEmployee: {
      id: 1,
      name: 'Rizky Pratama',
      role: 'Lead IT Support',
      avatar: 'RP',
      currentShift: 'P',
    },
    reason: 'Keperluan keluarga mendadak pada shift malam tanggal 12 Nov',
    status: 'pending',
  },
  {
    id: 'SWAP-002',
    requestDate: '09 Nov 2026',
    targetDate: '2026-11-14',
    requester: {
      id: 5,
      name: 'Hendro Gunawan',
      role: 'Petugas Jaga Regu A',
      avatar: 'HG',
      currentShift: 'OFF',
    },
    targetEmployee: {
      id: 6,
      name: 'Agus Setiawan',
      role: 'Petugas Jaga Regu B',
      avatar: 'AS',
      currentShift: 'P',
    },
    reason: 'Menukar jatah piket akhir pekan agar bisa menghadiri wisuda anak',
    status: 'approved',
  },
]

export const rosterTemplates = [
  {
    id: 'tpl-5-2',
    name: 'Pola Standar 5-2 (Office Hours)',
    type: 'weekly',
    desc: '5 hari kerja shift pagi berturut-turut, 2 hari libur akhir pekan (Sabtu & Minggu).',
    pattern: ['P', 'P', 'P', 'P', 'P', 'OFF', 'OFF'],
    suitableFor: 'Administrasi, Keuangan, HR, dan Tim Non-Shift',
    isDatabase: true,
    activeEmployees: 22,
  },
  {
    id: 'tpl-2-2-2-1',
    name: 'Pola Kontinu 2-2-2-1 (Rotasi 24 Jam)',
    type: 'weekly',
    desc: '2 hari Pagi, 2 hari Siang, 2 hari Malam, 1 hari Libur Off. Menjaga kebugaran tim operasional shift.',
    pattern: ['P', 'P', 'S', 'S', 'M', 'M', 'OFF'],
    suitableFor: 'IT Operations 24/7, Security Satpam, Tenaga Medis, dan Gudang Logistik',
    isDatabase: true,
    activeEmployees: 14,
  },
  {
    id: 'tpl-3-3-1',
    name: 'Pola Bergilir 3-3-1 (Sore & Malam)',
    type: 'weekly',
    desc: '3 hari Siang, 3 hari Malam, 1 hari Libur untuk tim maintenance fasilitas.',
    pattern: ['S', 'S', 'S', 'M', 'M', 'M', 'OFF'],
    suitableFor: 'Teknisi Mesin, Pemeliharaan Gedung & Gardu Listrik',
    isDatabase: true,
    activeEmployees: 6,
  },
  {
    id: 'tpl-4-2',
    name: 'Pola Regu Shift 4-2 (Rolling 6 Hari)',
    type: 'weekly',
    desc: '4 hari bertugas (2 Pagi, 2 Siang), 2 hari libur pemulihan berturut-turut.',
    pattern: ['P', 'P', 'S', 'S', 'OFF', 'OFF', 'P'],
    suitableFor: 'Operasional Gudang & Distribusi Lapangan',
    isDatabase: false,
    activeEmployees: 8,
  },
  {
    id: 'tpl-month-it-30',
    name: 'Pola Rotasi Bulanan IT 24/7 (30 Hari)',
    type: 'monthly',
    desc: 'Siklus rotasi 30 hari kalender dengan pembagian proporsional Pagi, Siang, Malam, dan libur akhir pekan berkala.',
    pattern: [
      'P', 'P', 'P', 'S', 'S', 'OFF', 'OFF',
      'P', 'P', 'S', 'S', 'M', 'OFF', 'OFF',
      'P', 'P', 'P', 'S', 'S', 'OFF', 'OFF',
      'P', 'P', 'S', 'S', 'M', 'M', 'OFF',
      'P', 'P'
    ],
    suitableFor: 'Divisi Teknologi & IT, DevOps Cloud 24/7',
    isDatabase: true,
    activeEmployees: 12,
  },
  {
    id: 'tpl-month-sec-30',
    name: 'Pola Bulanan Pengamanan Fisik 24 Jam',
    type: 'monthly',
    desc: 'Rotasi 30 hari penuh untuk personil satpam dan pos komando keamanan dengan rotasi giliran regu berkala.',
    pattern: [
      'P', 'P', 'M', 'M', 'OFF', 'P', 'P',
      'S', 'S', 'M', 'M', 'OFF', 'S', 'S',
      'P', 'P', 'M', 'M', 'OFF', 'P', 'P',
      'S', 'S', 'M', 'M', 'OFF', 'S', 'S',
      'OFF', 'OFF'
    ],
    suitableFor: 'Divisi Keamanan & Fasilitas (Security & Safety)',
    isDatabase: true,
    activeEmployees: 9,
  },
]
