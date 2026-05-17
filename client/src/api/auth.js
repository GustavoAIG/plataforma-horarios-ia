import api from './axios.js'

export const registerApi = (data) => api.post('/auth/register', data)
export const loginApi = (data) => api.post('/auth/login', data)
export const getMeApi = () => api.get('/auth/me')
export const saveLearningAnswersApi = (answers) => api.post('/auth/learning-answers', { answers })