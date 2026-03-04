import axios from 'axios'

// 生产环境使用服务器 API，开发环境使用本地代理
const API_BASE_URL = import.meta.env.PROD 
  ? 'http://8.213.221.238:3002/api' 
  : '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default api
