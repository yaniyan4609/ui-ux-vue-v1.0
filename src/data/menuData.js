import { Home, LayoutTemplate, Sliders, Palette, Shield, Bell, Layers, Mountain, Users, KanbanSquare, Component, Sparkles, LayoutDashboard, Network, Contact, CalendarDays, Clock, CalendarRange, Map } from 'lucide-vue-next'

export const menuItems = [
  {
    id: 'beranda',
    label: 'Beranda',
    icon: Home,
    route: '/',
    submenus: [],
  },
  {
    id: 'contoh-ui',
    label: 'Contoh UI',
    icon: Sparkles,
    route: '/contoh-ui',
    submenus: [
      { id: 'dashboard-hris', label: 'Dashboard HRIS', icon: LayoutDashboard, route: '/contoh-ui/dashboard-hris' },
      { id: 'karyawan', label: 'Direktori Karyawan', icon: Contact, route: '/contoh-ui/karyawan' },
      { id: 'organisasi', label: 'Struktur Organisasi', icon: Network, route: '/contoh-ui/organisasi' },
      { id: 'roster', label: 'Roster & Jadwal Shift', icon: CalendarDays, route: '/contoh-ui/roster' },
      { id: 'shift', label: 'Master Shift', icon: Clock, route: '/contoh-ui/shift' },
      { id: 'pola-roster', label: 'Pola', icon: CalendarRange, route: '/contoh-ui/pola-roster' },
      { id: 'wilayah', label: 'Kantor & Wilayah', icon: Map, route: '/contoh-ui/kantor' },
    ],
  },
  {
    id: 'template',
    label: 'Template',
    icon: LayoutTemplate,
    route: '/template',
    submenus: [
      { id: 'komponen', label: 'Komponen', icon: Component, route: '/template/komponen' },
      { id: 'kanban', label: 'Contoh Kanban', icon: KanbanSquare, route: '/template/kanban' },
      { id: 'data-1', label: 'Contoh Data 1', icon: Mountain, route: '/template/data-1' },
      { id: 'data-2', label: 'Contoh Data 2', icon: Users, route: '/template/data-2' },
      { id: 'umum', label: 'Pengaturan Umum', icon: Sliders, route: '/template/umum' },
      { id: 'dasar1', label: 'Dasar Pertama (Background)', icon: Palette, route: '/template/dasar-pertama' },
      { id: 'modal', label: 'Modal & Konfirmasi', icon: Layers, route: '/template/modal' },
      { id: 'notifikasi', label: 'Notifikasi & Toast', icon: Bell, route: '/template/notifikasi' },
      { id: 'keamanan', label: 'Keamanan & Akun', icon: Shield, route: '/template/keamanan' },
    ],
  },
]
