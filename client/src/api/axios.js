import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  throw new Error('VITE_API_URL is not defined')
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    
    // AGREGA ESTE CONSOLE.LOG TEMPORAL:
    console.log(`[Axios Request] URL: ${config.url} | ¿Hay token en localStorage?:`, !!token)

    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`)
    }

    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // AGREGA ESTE CONSOLE.LOG TEMPORAL:
    console.error(`[Axios Error] URL: ${error.config?.url} | Status: ${error.response?.status} | Mensaje del Backend:`, error.response?.data)

    if (error.response?.status === 401) {
      console.warn('[Axios] Borrando token por culpa de un 401')
      localStorage.removeItem('token')
    }

    return Promise.reject(error)
  }
)

export default api