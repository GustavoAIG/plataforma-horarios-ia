import api from './axios.js'

const normalizeError = (error) => ({
  status: error.response?.status,
  message:
    error.response?.data?.message ||
    error.message ||
    'Unexpected error'
})

export const generateScheduleApi = async ({
  startDate,
  endDate,
  courses,
  classrooms
}) => {
  try {
    const response = await api.post(
      '/schedule/generate',
      {
        startDate,
        endDate,
        courses,
        classrooms
      }
    )

    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}

export const getLatestScheduleApi = async () => {
  try {
    const response = await api.get(
      '/schedule/latest'
    )

    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}