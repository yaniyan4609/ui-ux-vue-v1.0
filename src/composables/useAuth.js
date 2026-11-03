import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from './useToast'

const currentUser = ref({
  name: 'Admin Digaji.id',
  email: 'admin@digaji.id',
  role: 'Super Admin',
  avatar: '',
  company: 'PT Digaji Indonesia',
})

const isAuthenticated = ref(true)

export function useAuth() {
  const router = useRouter()
  const toast = useToast()

  const login = async (credentials) => {
    // Simulasi autentikasi
    if (credentials.email.includes('hr')) {
      currentUser.value = {
        name: 'Sarah HR Manager',
        email: credentials.email,
        role: 'HR & Payroll Lead',
        avatar: '',
        company: 'PT Digaji Indonesia',
      }
    } else if (credentials.email.includes('staf')) {
      currentUser.value = {
        name: 'Budi Santoso',
        email: credentials.email,
        role: 'Staf Operasional',
        avatar: '',
        company: 'PT Digaji Indonesia',
      }
    } else {
      currentUser.value = {
        name: 'Admin Digaji.id',
        email: credentials.email || 'admin@digaji.id',
        role: 'Super Admin',
        avatar: '',
        company: 'PT Digaji Indonesia',
      }
    }

    isAuthenticated.value = true
    return true
  }

  const register = async (data) => {
    currentUser.value = {
      name: data.name || 'Pengguna Baru',
      email: data.email,
      role: 'Administrator Perusahaan',
      avatar: '',
      company: data.company || 'PT Mitra Baru',
    }
    isAuthenticated.value = true
    return true
  }

  const logout = () => {
    isAuthenticated.value = false
    toast.info('Sesi telah berakhir. Silakan masuk kembali.')
    router.push('/login')
  }

  return {
    currentUser,
    isAuthenticated,
    login,
    register,
    logout,
  }
}
