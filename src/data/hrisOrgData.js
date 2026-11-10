// Struktur Organisasi Perusahaan Digaji.id
// Hierarki: Direksi ➔ Divisi ➔ Departemen ➔ Jabatan

export const hrisOrgData = {
  id: 'org-root',
  name: 'Budi Santoso, M.B.A',
  role: 'Direktur Utama (CEO)',
  division: 'Direksi Eksekutif',
  department: 'Kantor Direksi',
  level: 'direksi',
  levelLabel: 'DIREKSI',
  badgeVariant: 'primary',
  count: 3,
  children: [
    // ----------------------------------------------------
    // DIVISI 1: TEKNOLOGI & IT
    // ----------------------------------------------------
    {
      id: 'div-tech',
      name: 'Ir. Hendra Kusuma',
      role: 'Head of Division (VP of Engineering)',
      division: 'Divisi Teknologi & IT',
      department: 'Manajemen Rekayasa',
      level: 'divisi',
      levelLabel: 'DIVISI',
      badgeVariant: 'info',
      count: 2,
      children: [
        // DEPARTEMEN 1.1: SOFTWARE ENGINEERING
        {
          id: 'dept-soft-eng',
          name: 'Rizky Pratama, S.Kom',
          role: 'Engineering Manager',
          division: 'Divisi Teknologi',
          department: 'Dept. Software Engineering',
          level: 'departemen',
          levelLabel: 'DEPARTEMEN',
          badgeVariant: 'warning',
          count: 3,
          children: [
            {
              id: 'pos-fe-lead',
              name: 'Farhan Maulana',
              role: 'Lead Frontend Engineer',
              division: 'Divisi Teknologi',
              department: 'Software Engineering',
              level: 'jabatan',
              levelLabel: 'JABATAN',
              badgeVariant: 'neutral',
              children: [],
            },
            {
              id: 'pos-be-lead',
              name: 'Bagas Wicaksono',
              role: 'Lead Backend Engineer',
              division: 'Divisi Teknologi',
              department: 'Software Engineering',
              level: 'jabatan',
              levelLabel: 'JABATAN',
              badgeVariant: 'neutral',
              children: [],
            },
            {
              id: 'pos-qa-lead',
              name: 'Siti Rahmawati',
              role: 'Senior QA & Automation',
              division: 'Divisi Teknologi',
              department: 'Software Engineering',
              level: 'jabatan',
              levelLabel: 'JABATAN',
              badgeVariant: 'neutral',
              children: [],
            },
          ],
        },

        // DEPARTEMEN 1.2: IT INFRASTRUCTURE & CYBERSECURITY
        {
          id: 'dept-infra',
          name: 'Dimas Aditya, M.T',
          role: 'Head of Infrastructure & SecOps',
          division: 'Divisi Teknologi',
          department: 'Dept. IT Infrastructure & Security',
          level: 'departemen',
          levelLabel: 'DEPARTEMEN',
          badgeVariant: 'warning',
          count: 2,
          children: [
            {
              id: 'pos-devops',
              name: 'Agus Setiawan',
              role: 'DevOps & Cloud Specialist',
              division: 'Divisi Teknologi',
              department: 'Infrastructure & Security',
              level: 'jabatan',
              levelLabel: 'JABATAN',
              badgeVariant: 'neutral',
              children: [],
            },
            {
              id: 'pos-secops',
              name: 'Rian Hidayat',
              role: 'Cybersecurity Analyst',
              division: 'Divisi Teknologi',
              department: 'Infrastructure & Security',
              level: 'jabatan',
              levelLabel: 'JABATAN',
              badgeVariant: 'neutral',
              children: [],
            },
          ],
        },
      ],
    },

    // ----------------------------------------------------
    // DIVISI 2: OPERASIONAL & RANTAI PASOK
    // ----------------------------------------------------
    {
      id: 'div-ops',
      name: 'Gunawan Prasetyo',
      role: 'Chief Operating Officer (COO)',
      division: 'Divisi Operasional & Rantai Pasok',
      department: 'Manajemen Operasional',
      level: 'divisi',
      levelLabel: 'DIVISI',
      badgeVariant: 'info',
      count: 2,
      children: [
        // DEPARTEMEN 2.1: LOGISTIK & PERGUDANGAN
        {
          id: 'dept-logistik',
          name: 'Hadi Firmansyah',
          role: 'Head of Logistics & Supply Chain',
          division: 'Divisi Operasional',
          department: 'Dept. Logistik & Warehouse',
          level: 'departemen',
          levelLabel: 'DEPARTEMEN',
          badgeVariant: 'warning',
          count: 2,
          children: [
            {
              id: 'pos-koor-medan',
              name: 'Budi Santoso',
              role: 'Koordinator Gudang Hub Medan',
              division: 'Divisi Operasional',
              department: 'Logistik & Warehouse',
              level: 'jabatan',
              levelLabel: 'JABATAN',
              badgeVariant: 'neutral',
              children: [],
            },
            {
              id: 'pos-staff-sby',
              name: 'Wahyu Nugroho',
              role: 'Staff Pergudangan Rungkut',
              division: 'Divisi Operasional',
              department: 'Logistik & Warehouse',
              level: 'jabatan',
              levelLabel: 'JABATAN',
              badgeVariant: 'neutral',
              children: [],
            },
          ],
        },

        // DEPARTEMEN 2.2: LAYANAN PELANGGAN & SUPPORT
        {
          id: 'dept-cs',
          name: 'Ratna Dewi, S.I.Kom',
          role: 'Customer Success Manager',
          division: 'Divisi Operasional',
          department: 'Dept. Layanan Pelanggan',
          level: 'departemen',
          levelLabel: 'DEPARTEMEN',
          badgeVariant: 'warning',
          count: 1,
          children: [
            {
              id: 'pos-cs-lead',
              name: 'Ni Made Ayu Sri',
              role: 'Guest Relations & CS Lead',
              division: 'Divisi Operasional',
              department: 'Layanan Pelanggan',
              level: 'jabatan',
              levelLabel: 'JABATAN',
              badgeVariant: 'neutral',
              children: [],
            },
          ],
        },
      ],
    },

    // ----------------------------------------------------
    // DIVISI 3: KEUANGAN, AKUNTANSI & HRIS
    // ----------------------------------------------------
    {
      id: 'div-finance-hr',
      name: 'Maya Indriyani, S.E., Ak.',
      role: 'Chief Financial Officer (CFO)',
      division: 'Divisi Keuangan & People Ops',
      department: 'Manajemen Keuangan & SDM',
      level: 'divisi',
      levelLabel: 'DIVISI',
      badgeVariant: 'info',
      count: 2,
      children: [
        // DEPARTEMEN 3.1: FINANCE & PERPAJAKAN
        {
          id: 'dept-tax-payroll',
          name: 'Clarissa Natalia, S.E',
          role: 'Lead Finance & Payroll Specialist',
          division: 'Divisi Keuangan',
          department: 'Dept. Finance & Pajak',
          level: 'departemen',
          levelLabel: 'DEPARTEMEN',
          badgeVariant: 'warning',
          count: 2,
          children: [
            {
              id: 'pos-payroll-officer',
              name: 'Dewi Lestari',
              role: 'Tax & Payroll Specialist',
              division: 'Divisi Keuangan',
              department: 'Finance & Pajak',
              level: 'jabatan',
              levelLabel: 'JABATAN',
              badgeVariant: 'neutral',
              children: [],
            },
            {
              id: 'pos-accountant',
              name: 'Kevin Jonathan',
              role: 'Senior General Accountant',
              division: 'Divisi Keuangan',
              department: 'Finance & Pajak',
              level: 'jabatan',
              levelLabel: 'JABATAN',
              badgeVariant: 'neutral',
              children: [],
            },
          ],
        },

        // DEPARTEMEN 3.2: PEOPLE OPERATIONS & LEGALITAS
        {
          id: 'dept-hr',
          name: 'Sarah Wijaya, S.Psi',
          role: 'People Operations Manager',
          division: 'Divisi Keuangan & SDM',
          department: 'Dept. People Operations (HRD)',
          level: 'departemen',
          levelLabel: 'DEPARTEMEN',
          badgeVariant: 'warning',
          count: 1,
          children: [
            {
              id: 'pos-talent-acq',
              name: 'Jessica Tan',
              role: 'Talent Acquisition & Employee Relations',
              division: 'Divisi SDM',
              department: 'People Operations',
              level: 'jabatan',
              levelLabel: 'JABATAN',
              badgeVariant: 'neutral',
              children: [],
            },
          ],
        },
      ],
    },
  ],
}

// Rekapitulasi Hierarki Divisi, Departemen, dan Jabatan (Untuk Tabel & Statistik)
export const hrisHierarchySummary = [
  {
    divisi: 'Teknologi & IT',
    kepalaDivisi: 'Ir. Hendra Kusuma',
    departemenList: [
      { nama: 'Software Engineering', head: 'Rizky Pratama', totalJabatan: 6, totalKaryawan: 320 },
      { nama: 'IT Infrastructure & Security', head: 'Dimas Aditya', totalJabatan: 4, totalKaryawan: 45 },
    ],
  },
  {
    divisi: 'Operasional & Rantai Pasok',
    kepalaDivisi: 'Gunawan Prasetyo',
    departemenList: [
      { nama: 'Logistik & Warehouse', head: 'Hadi Firmansyah', totalJabatan: 8, totalKaryawan: 480 },
      { nama: 'Layanan Pelanggan (CS)', head: 'Ratna Dewi', totalJabatan: 5, totalKaryawan: 134 },
    ],
  },
  {
    divisi: 'Keuangan & People Operations',
    kepalaDivisi: 'Maya Indriyani',
    departemenList: [
      { nama: 'Finance & Pajak', head: 'Clarissa Natalia', totalJabatan: 5, totalKaryawan: 85 },
      { nama: 'People Operations (HRD)', head: 'Sarah Wijaya', totalJabatan: 4, totalKaryawan: 55 },
    ],
  },
]

