import api from './axios'

const normalizeError = (error) => ({
  status: error.response?.status,
  message:
    error.response?.data?.message ||
    error.message ||
    'Unexpected error'
})

export const loginApi = async ({ email, password }) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password
    })

    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}

export const registerApi = async ({
  name,
  lastName1,
  lastName2,
  university,
  career,
  email,
  password
}) => {
  try {
    const response = await api.post('/auth/register', {
      name,
      lastName1, 
      lastName2,
      university,
      career,
      email,
      password
    })

    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}

export const getMeApi = async () => {
  try {
    const response = await api.get('/auth/me')
    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}