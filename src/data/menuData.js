import { Home, Database, Settings, Sliders, Palette, Shield, Bell, Layers, Mountain, Users, KanbanSquare } from 'lucide-vue-next'

export const menuItems = [
  {
    id: 'beranda',
    label: 'Beranda',
    icon: Home,
    route: '/',
    submenus: [],
  },
  {
    id: 'pesanan',
    label: 'Pesanan',
    icon: KanbanSquare,
    route: '/pesanan/kanban',
    submenus: [
      { id: 'kanban', label: 'Kanban Pipeline', icon: KanbanSquare, route: '/pesanan/kanban' },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    icon: Database,
    route: '/data',
    submenus: [
      { id: 'gunung', label: 'Data Gunung', icon: Mountain, route: '/data/gunung' },
      { id: 'karyawan', label: 'Data Karyawan & Payroll', icon: Users, route: '/data/karyawan' },
    ],
  },
  {
    id: 'setting',
    label: 'Setting',
    icon: Settings,
    route: '/setting',
    submenus: [
      { id: 'umum', label: 'Pengaturan Umum', icon: Sliders, route: '/setting/umum' },
      { id: 'dasar1', label: 'Dasar Pertama (Background)', icon: Palette, route: '/setting/dasar-pertama' },
      { id: 'modal', label: 'Modal & Konfirmasi', icon: Layers, route: '/setting/modal' },
      { id: 'notifikasi', label: 'Notifikasi & Toast', icon: Bell, route: '/setting/notifikasi' },
      { id: 'keamanan', label: 'Keamanan & Akun', icon: Shield, route: '/setting/keamanan' },
    ],
  },
]

