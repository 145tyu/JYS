import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Image, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { CommonActions } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import FastImage from 'react-native-fast-image';

import axiosInstance from '../api/API_Server';
import ErrorAlert from '../api/ErrorModal';

const appVersion = DeviceInfo.getVersion()
const buildVersion = DeviceInfo.getBuildNumber()

export default function StartScreen({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'

  const [isLoading, setIsLoading] = useState(true)
  const [retry, setRetry] = useState(false)

  const [message, setMessage] = useState('시작 중...')

  const checkTokenValidation = async (job) => {
    setIsLoading(true)
    setRetry(false)
    setMessage('로그인 중...')
    try {
      const accessToken = await AsyncStorage.getItem('access_token')
      const refreshToken = await AsyncStorage.getItem('refresh_token')
      const accountID = await AsyncStorage.getItem('id')

      const handleRefreshToken = async () => {
        setIsLoading(true)
        setRetry(false)
        setMessage('로그인 중...')
        await axiosInstance.post('/v1/refreshToken', { refreshToken: refreshToken, accountID: accountID })
          .then((res) => {
            if (res.status === 200) {
              AsyncStorage.setItem('access_token', res.data.accessToken)
              AsyncStorage.setItem('refresh_token', res.data.refreshToken)
              handleTokenCheck(res.data.accessToken)
            } else {
              setIsLoading(false)
              setRetry(true)
              setMessage('로그인을 실패했습니다.')
            }
          }).catch((error) => {
            console.error(error)
            if (error.response) {
              const res = error.response
              if (res.status === 400) {
                deleteData()
                moveLoginScreen()
                setIsLoading(false)
                setRetry(true)
                setMessage('로그인을 실패했습니다.')
                return Alert.alert('로그인 실패', '자동 로그아웃되었습니다.', [{ text: '확인', }])
              } else if (res.status === 401) {
                deleteData()
                moveLoginScreen()
                setIsLoading(false)
                setMessage('세션이 만료되었습니다.')
                return Alert.alert('로그인 실패', '자동 로그아웃되었습니다.\n다시 로그인 해주세요.', [{ text: '확인', }])
              } else {
                setIsLoading(false)
                setRetry(true)
                setMessage('서버와 연결할 수 없습니다.')
              }
            } else {
              setIsLoading(false)
              setRetry(true)
              setMessage('서버와 연결할 수 없습니다.')
            }
          })
      }

      const handleTokenCheck = async (accessToken) => {
        setIsLoading(true)
        setRetry(false)
        setMessage('로그인 중...')
        await axiosInstance.get('/v1/tokenCheck', { headers: { Authorization: accessToken } })
          .then((res) => {
            if (res.status === 200) {
              if (job === 'student') {
                return navigation.dispatch( // 기존에 있던 모든 스크린을 없애고 'S_Home'스크린으로 이동
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'S_Home' }]
                  })
                )
              } else if (job === 'teacher') {
                return navigation.dispatch(  // 기존에 있던 모든 스크린을 없애고 'T_Home'스크린으로 이동
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'T_Home' }]
                  })
                )
              } else {
                deleteData()
                moveLoginScreen()
              }
            } else {
              setIsLoading(false)
              setRetry(true)
              setMessage('로그인을 실패했습니다.')
              return Alert.alert('로그인 실패', '자동 로그아웃 되었습니다.', [{ text: '확인', }])
            }
          }).catch((error) => {
            console.error(error)
            if (error.response) {
              const res = error.response
              if (res.status === 400) {
                setIsLoading(false)
                handleRefreshToken() // 리프레시 토큰을 검사
              } else if (res.status === 401) {
                setIsLoading(false)
                handleRefreshToken() // 리프레시 토큰을 검사
              } else {
                setIsLoading(false)
                setRetry(true)
                setMessage('서버와 연결할 수 없습니다.')
              }
            } else {
              setIsLoading(false)
              setRetry(true)
              setMessage('서버와 연결할 수 없습니다.')
            }
          })
      }
      if (accessToken && refreshToken) {
        handleTokenCheck(accessToken)
      } else {
        deleteData()
        moveLoginScreen()
      }
    } catch (error) {
      console.log(error)
      deleteData()
      setIsLoading(false)
      setRetry(true)
      setMessage('로그인을 실패했습니다.')
    }
  }

  const checkIntegrity = async () => {
    setIsLoading(true)
    setRetry(false)
    setMessage('데이터 무결성 검사 중...')
    try {
      await AsyncStorage.getItem('id')
        .then(async (ID) => {
          if (ID) {
            await AsyncStorage.getItem('job')
              .then(async (job) => {
                if (job) {
                  await axiosInstance.post('/profile', { id: ID, job: job })
                    .then((res) => {
                      if (res.status === 200) {
                        checkTokenValidation(job)
                      } else {
                        setIsLoading(false)
                        setRetry(true)
                        setMessage('계정 인증 도중 예외가 발생했습니다.')
                      }
                    }).catch((error) => {
                      console.error(error)
                      if (error.response) {
                        const res = error.response
                        if (res.status === 400) {
                          deleteData()
                          moveLoginScreen()
                          return Alert.alert(res.data.error, res.data.errorDescription)
                        } else {
                          setIsLoading(false)
                          setRetry(true)
                          setMessage('서버와 연결할 수 없습니다.')
                        }
                      } else {
                        setIsLoading(false)
                        setRetry(true)
                        setMessage('서버와 연결할 수 없습니다.')
                      }
                    })
                } else {
                  // job 데이터 유실
                  deleteData()
                  moveLoginScreen()
                }
              }).catch((error) => {
                // job 가져오기 에러
                console.log(error)
                deleteData()
                setIsLoading(false)
                setRetry(true)
                setMessage('데이터 무결성 검사를 실패했습니다.')
              })
          } else {
            // 계정ID 데이터 유실
            deleteData()
            moveLoginScreen()
          }
        }).catch((error) => {
          // 계정ID 가져오기 에러
          console.log(error)
          deleteData()
          setIsLoading(false)
          setRetry(true)
          setMessage('데이터 무결성 검사를 실패했습니다.')
        })
    } catch (error) {
      console.log(error)
      deleteData()
      setIsLoading(false)
      setRetry(true)
      setMessage('데이터 무결성 검사를 실패했습니다.')
    }
  }

  const checkVersion = async () => {
    setIsLoading(true)
    setRetry(false)
    setMessage('버전 확인 중...')
    try {
      await axiosInstance.post('/v2/version', { os: `${Platform.OS === 'android' ? `android` : `ios`}` })
        .then((res) => {
          const data = res.data
          if (JSON.parse(data.blackListVersions).includes(appVersion) || appVersion < data.version || buildVersion < Number(data.build)) {
            if (data.type == 2 || JSON.parse(data.blackListVersions).includes(appVersion)) {
              return Alert.alert('업데이트 필요', '필수 업데이트가 배포되었습니다.\n계속하려면 앱을 업데이트하세요.', [
                {
                  text: '확인',
                  onPress: () => {
                    setIsLoading(false)
                    setRetry(true)
                    setMessage('필수 업데이트를 진행해야 합니다.')
                  }
                },
                {
                  text: '스토어로 이동',
                  onPress: () => {
                    setIsLoading(false)
                    setRetry(true)
                    setMessage('필수 업데이트를 진행해야 합니다.')
                    return Alert.alert('정보', '죄송합니다 스토어로 이동할 수 없습니다.\n수동으로 스토어에서 업데이트를 해주세요.')
                  },
                }
              ])
            } else {
              return Alert.alert('업데이트 가능', '새 업데이트가 배포되었습니다.\n지금 업데이트하시겠습니까?', [
                {
                  text: '나중에',
                  onPress: () => {
                    checkIntegrity()
                  }
                },
                {
                  text: '지금 업데이트',
                  onPress: () => {
                    setIsLoading(false)
                    setRetry(true)
                    setMessage('스토어로 이동하여 업데이트를 해주세요.')
                    return Alert.alert('정보', '죄송합니다 스토어로 이동할 수 없습니다.\n수동으로 스토어에서 업데이트를 해주세요.')
                  },
                },
              ])
            }
          } else {
            checkIntegrity()
          }
        }).catch((error) => {
          console.log(error)
          if (error.response) {
            const res = error.response
            if (res.status === 400) {
              setIsLoading(false)
              setRetry(true)
              setMessage('지원 기기 : Android, IOS, MacOS')
            } else if (res.status === 500) {
              setIsLoading(false)
              setRetry(true)
              setMessage('서버가 점검 중일 수 있습니다.')
            } else {
              setIsLoading(false)
              setRetry(true)
              setMessage('서버와 연결할 수 없습니다.')
            }
          } else {
            setIsLoading(false)
            setRetry(true)
            setMessage('서버와 연결할 수 없습니다.')
          }
        })
    } catch (error) {
      console.error(error)
      setIsLoading(false)
      setRetry(true)
      setMessage('버전 검사를 실패했습니다.')
    }
  }

  const fcmInsertToken = async () => {
    await messaging()
      .getToken()
      .then(async (fcmToken) => {
        AsyncStorage.setItem('fcm_token', fcmToken)
        const data = [
          {
            "fcmToken": fcmToken,
            "accountID": await AsyncStorage.getItem('id'),
            "deviceInfo": {
              "uniqueId": await DeviceInfo.getUniqueId(),
              "brand": DeviceInfo.getBrand(),
              "model": DeviceInfo.getModel(),
              "systemVersion": DeviceInfo.getSystemVersion(),
              "appVersion": DeviceInfo.getVersion(),
              "buildNumber": DeviceInfo.getBuildNumber(),
            },
          }
        ]

        await axiosInstance.post('/Fcm/insertToken', { data: data[0] })
          .then((res) => {
            if (res.status === 200) {
              console.log(res.data.message)
            } else {
              console.log('FCM을 등록하지 못했습니다.')
            }
          }).catch((error) => {
            console.log('FcmInsertToken |', error)
            if (error.response) {
              const res = error.response
              if (res.status === 400) {
                console.log(error.data.errorDescription)
              } else if (res.status === 500) {
                console.log(error.data.errorDescription)
              } else {
                console.log('FCM을 등록하지 못했습니다.')
              }
            } else {
              console.log('FCM을 등록하지 못했습니다.')
            }
          })
      })
  }

  const moveLoginScreen = () => {
    return navigation.dispatch( // 'Login' 스크린으로 이동하고 기존에 있던 모든 스크린을 삭제
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }]
      })
    )
  }

  const deleteData = async () => {
    AsyncStorage.clear()
  }

  useEffect(() => {
    fcmInsertToken() // fcm토큰 등록
    checkVersion() // 버전 체크
  }, [])

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#ffffff', }, isDarkMode && { ...styles.container, backgroundColor: '#000000', }]}>
      {isLoading === true &&
        <>
          <ActivityIndicator style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', }} size={30} color="blue" />
        </>
      }
      <FastImage style={{ width: 200, height: 200, marginBottom: 20, }} source={require('../resource/logo_v1.png')} />

      <View style={{ ...StyleSheet.absoluteFillObject, flex: 1, justifyContent: 'flex-end', alignItems: 'center', marginBottom: 200, }}>
        <Text style={[{ ...styles.messageText, color: '#000000', }, isDarkMode && { ...styles.messageText, color: '#ffffff', }]}>{message}</Text>
      </View>

      {retry === true &&
        <View style={{ ...StyleSheet.absoluteFillObject, flex: 1, justifyContent: 'flex-end', alignItems: 'center', marginBottom: 100, }}>
          <TouchableOpacity onPress={() => { checkVersion() }} style={{ width: '30%', backgroundColor: '#EB4E45', borderRadius: 10, height: 45, alignItems: 'center', justifyContent: 'center', }}>
            <Text style={{ textAlign: 'center', color: '#ffffff' }}>다시시도</Text>
          </TouchableOpacity>
        </View>
      }
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    marginTop: 10,
    fontWeight: 'bold',
  },
})