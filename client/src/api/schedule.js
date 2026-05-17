import api from './axios.js'

export const generateScheduleApi = (data) => api.post('/schedule/generate', data)
export const getLatestScheduleApi = () => api.get('/schedule/latest')