import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import KanbanView from '../views/KanbanView.vue'
import DataView from '../views/DataView.vue'
import DataKaryawanView from '../views/DataKaryawanView.vue'
import SettingView from '../views/SettingView.vue'

const routes = [
  {
    path: '/',
    name: 'Beranda',
    component: DashboardView,
  },
  {
    path: '/pesanan',
    redirect: '/pesanan/kanban',
  },
  {
    path: '/pesanan/kanban',
    name: 'PesananKanban',
    component: KanbanView,
  },
  {
    path: '/data',
    redirect: '/data/gunung',
  },
  {
    path: '/data/gunung',
    name: 'DataGunung',
    component: DataView,
  },
  {
    path: '/data/karyawan',
    name: 'DataKaryawan',
    component: DataKaryawanView,
  },
  {
    path: '/setting',
    redirect: '/setting/umum',
  },
  {
    path: '/setting/umum',
    name: 'SettingUmum',
    component: SettingView,
  },
  {
    path: '/setting/dasar-pertama',
    name: 'SettingDasarPertama',
    component: SettingView,
  },
  {
    path: '/setting/modal',
    name: 'SettingModal',
    component: SettingView,
  },
  {
    path: '/setting/notifikasi',
    name: 'SettingNotifikasi',
    component: SettingView,
  },
  {
    path: '/setting/keamanan',
    name: 'SettingKeamanan',
    component: SettingView,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
