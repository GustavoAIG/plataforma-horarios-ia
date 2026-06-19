import api from './axios.js'

const normalizeError = (error) => ({
  status: error.response?.status,
  message:
    error.response?.data?.message ||
    error.message ||
    'Unexpected error'
})

export const getCoursesApi = async () => {
  try {
    const response = await api.get('/courses')
    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}

export const createCourseApi = async ({
  title,
  description
}) => {
  try {
    const response = await api.post('/courses', {
      title,
      description
    })

    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}

export const deleteCourseApi = async (id) => {
  try {
    if (!id) {
      throw new Error('Course ID is required')
    }

    const response = await api.delete(`/courses/${id}`)

    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}

export const updateCourseApi = async (
  id,
  data
) => {
  try {
    if (!id) {
      throw new Error('Course ID is required')
    }

    const response = await api.put(
      `/courses/${id}`,
      data
    )

    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}