import api from './axios'

const normalizeError = (error) => ({
  status: error.response?.status,
  message:
    error.response?.data?.message ||
    error.message ||
    'Unexpected error'
})

export const listUsersApi = async (search = '') => {
  try {
    const response = await api.get('/admin/users', {
      params: search ? { search } : {}
    })
    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}

export const updateUserRoleApi = async (userId, role) => {
  try {
    const response = await api.patch(`/admin/users/${userId}/role`, { role })
    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}

export const deleteUserApi = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`)
    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}

export const getAdminStatsApi = async () => {
  try {
    const response = await api.get('/admin/stats')
    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}
