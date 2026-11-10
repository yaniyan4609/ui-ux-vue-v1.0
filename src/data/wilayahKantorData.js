export const wilayahList = [
  { id: 1, kode: 'WLY-01', nama: 'Jabodetabek & Banten', jumlahKantor: 3, statusAktif: true },
  { id: 2, kode: 'WLY-02', nama: 'Jawa Barat', jumlahKantor: 2, statusAktif: true },
  { id: 3, kode: 'WLY-03', nama: 'Jawa Timur', jumlahKantor: 1, statusAktif: false },
]

export const kantorList = [
  {
    id: 1,
    kode: 'KTR-001',
    nama: 'Kantor Pusat Jakarta',
    wilayahId: 1,
    wilayahNama: 'Jabodetabek & Banten',
    alamat: 'Jl. Sudirman Kav 52-53, Jakarta Selatan',
    picNama: 'Budi Santoso',
    picKontak: '0812-1111-2222',
    koordinatPusat: { lat: -6.215, lng: 106.822 },
    polygon: [
      { lat: -6.214, lng: 106.821 },
      { lat: -6.214, lng: 106.823 },
      { lat: -6.216, lng: 106.823 },
      { lat: -6.216, lng: 106.821 },
    ],
    luasAreaM2: 1200,
    statusAktif: true,
  },
  {
    id: 2,
    kode: 'KTR-002',
    nama: 'Kantor Cabang Bandung',
    wilayahId: 2,
    wilayahNama: 'Jawa Barat',
    alamat: 'Jl. Asia Afrika No. 1, Bandung',
    picNama: 'Siti Aminah',
    picKontak: '0813-3333-4444',
    koordinatPusat: { lat: -6.914, lng: 107.610 },
    polygon: [
      { lat: -6.913, lng: 107.609 },
      { lat: -6.913, lng: 107.611 },
      { lat: -6.915, lng: 107.611 },
      { lat: -6.915, lng: 107.609 },
    ],
    luasAreaM2: 850,
    statusAktif: true,
  },
]
