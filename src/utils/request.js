import axios from 'axios'

// 创建axios实例
const service = axios.create({
    baseURL: 'http://localhost:80', // 后端API基础地址
    timeout: 10000 // 请求超时时间
})

// 请求拦截器（可选）
service.interceptors.request.use(
    config => {
        // 可在此处添加token等
        // config.headers['Authorization'] = 'Bearer ' + token
        return config
    },
    error => Promise.reject(error)
)

// 响应拦截器（可选）
service.interceptors.response.use(
    response => response.data,
    error => Promise.reject(error)
)

export default service