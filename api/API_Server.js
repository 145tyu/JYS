import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://www.zena.co.kr/api';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

const setAccessToken = async (config) => {
    const accessToken = await AsyncStorage.getItem('access_token')
    if (accessToken) {
        config.headers.Authorization = `hi ${accessToken}`
    }
    return config
}

const refreshAccessToken = async (error) => {
    const originalRequest = error.config
    if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
        const refreshToken = await AsyncStorage.getItem('refresh_token')
        if (refreshToken) {
            try {
                const refreshResponse = await axios.post(`${API_BASE_URL}/refresh_token`, {refreshToken})
                const { accessToken, refreshToken } = refreshResponse.data
                await AsyncStorage.setItem('access_token', accessToken)
                await AsyncStorage.setItem('refresh_token', refreshToken)
                originalRequest.headers['Authorization'] = `hi ${accessToken}`
                return axios(originalRequest)
            } catch (error) {
                console.error('Failed to refresh access token', error)
            }
        }
    }
    return Promise.reject(error)
}

// request 인터셉터를 사용하여 엑세스 토큰 및 리프레시 토큰을 검증
axiosInstance.interceptors.request.use(async (config) => {
    const accessToken = await AsyncStorage.getItem('access_token')
    // 엑세스 토큰이 있는 경우
    if (accessToken) {
        config.headers.Authorization = `hi ${accessToken}`
    }
    return config
}), (error) => {
    return Promise.reject(error)
}

// response 인터셉터를 사용하여 엑세스 토큰 및 리프레시 토큰을 검증
axiosInstance.interceptors.response.use((response) => {
    return response
}), async (error) => {
    // 엑세스 토큰이 만료된 경우
    if (error.response.status === 401 || error.response.status === 403) {
        const refreshToken = await AsyncStorage.getItem('refresh_token')
        // 리프레시 토큰이 있는 경우
        if (refreshToken) {
            try {
                // 리프레시 토큰으로 새로운 엑세스 토큰 발급 요청
                const refreshResponse = await axios.post(`${API_BASE_URL}/refresh_Token`, {
                    refreshToken
                })
                const { accessToken, refreshToken } = refreshResponse.data
                await AsyncStorage.setItem('access_token', accessToken)
                await AsyncStorage.setItem('refresh_token', refreshToken)
                // 새로운 엑세스 토큰으로 API 요청 재시도
                error.config.headers.Authorization = `hi ${accessToken}`
                return axiosInstance(error.config)
            } catch (error) {
                // 리프레시 토큰도 만료된 경우
                console.error('토큰이 모두 만료되었습니다.')
                return Promise.reject(error)
            }
        } else {
            // 리프레시 토큰이 없는 경우
            console.error('리프레시 토큰이 유효하지 않습니다. 엑세스 토큰이 만료되었습니다.')
            return Promise.reject(error)
        }
    }
    return Promise.reject(error)
}

export default axiosInstance