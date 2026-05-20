import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import {
  getMeApi,
  loginApi,
  registerApi
} from '../api/auth'

const AuthContext =
  createContext(null)

export function AuthProvider({
  children
}) {
  const [user, setUser] =
    useState(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [isAuthenticated,
    setIsAuthenticated] =
    useState(false)

  /**
   * LOGOUT
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token')

    setUser(null)

    setIsAuthenticated(false)
  }, [])

  /**
   * SET SESSION
   */
  const setSession = useCallback(
    (token, userData) => {
      localStorage.setItem(
        'token',
        token
      )

      setUser(userData)

      setIsAuthenticated(true)
    },
    []
  )

  /**
   * LOGIN
   */
  const login = useCallback(
    async (credentials) => {
      // Quitamos las llaves de { data }, ahora recibimos la respuesta directa de tu API
      const res = await loginApi(credentials)

      // Dependiendo de cómo responda tu backend, cámbialo a res.token o res.data.token
      // Si tu backend responde con { token, user }, se usa res.token:
      setSession(
        res?.token || res?.data?.token,
        res?.user || res?.data?.user
      )

      return res?.user || res?.data?.user
    },
    [setSession]
  )

  /**
   * REGISTER
   */
  const register = useCallback(
    async (payload) => {
      // Quitamos las llaves de { data } aquí también
      const res = await registerApi(payload)

      // Protegemos la lectura con encadenamiento opcional (?.) por si las llaves varían
      setSession(
        res?.token || res?.data?.token,
        res?.user || res?.data?.user
      )

      return res?.user || res?.data?.user
    },
    [setSession]
  )

  /**
   * VERIFY SESSION
   */
  useEffect(() => {
    let isMounted = true

    async function verifySession() {
      const token = localStorage.getItem('token')

      if (!token) {
        if (isMounted) {
          setIsLoading(false)
        }
        return
      }

      try {
        // CORRECCIÓN: Eliminamos { data }, ya que getMeApi() ya devuelve la data directa
        const res = await getMeApi()

        if (!isMounted) return

        // Leemos el usuario de forma segura adaptándonos a cómo lo devuelva tu backend
        const userData = res?.user || res?.data?.user || res
        setUser(userData)
        setIsAuthenticated(true)
        
      } catch (error) {
        console.error('Session verification failed:', error)
        
        if (isMounted) {
          logout()
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    verifySession()

    return () => {
      isMounted = false
    }
    // Usamos una función anónima para ejecutar logout de forma segura sin causar bucles en las dependencias
  }, [])

  /**
   * CONTEXT VALUE
   */
  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout
  }), [
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout
  ])

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context =
    useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    )
  }

  return context
}