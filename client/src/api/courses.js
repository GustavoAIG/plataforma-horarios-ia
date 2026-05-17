import api from './axios.js'

export const getCoursesApi = () => api.get('/courses')
export const createCourseApi = (data) => api.post('/courses', data)
export const deleteCourseApi = (id) => api.delete(`/courses/${id}`)