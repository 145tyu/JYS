import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://www.zena.co.kr/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 항상 포함되어야 하는 데이터
// const getCommonData = async () => {
//   const id = await AsyncStorage.getItem('id')
//   const job = await AsyncStorage.getItem('job')

//   return { id, job, }
// }

// 요청 전에 실행되는 인터셉터 추가
// axiosInstance.interceptors.request.use(
//   async (config) => {
//     // commonData를 요청 데이터에 항상 추가
//     const commonData = await getCommonData()
//     config.data = {
//       ...config.data,
//       //...commonData,
//     };

//     return config
//   },
//   (error) => {
//     return Promise.reject(error)
//   }
// )

export default axiosInstance