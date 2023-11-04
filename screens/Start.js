import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Image, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { CommonActions } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-toast-message';

import axiosInstance from '../api/API_Server';

const appVersion = DeviceInfo.getVersion()
const buildVersion = DeviceInfo.getBuildNumber()

export default function StartScreen({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'

  const [isLoading, setIsLoading] = useState(true)
  const [retry, setRetry] = useState(false)

  const [message, setMessage] = useState('시작 중...')

  const checkTokenValidation = async (job, profileData) => {
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
              deleteData()
              moveLoginScreen()

              Toast.show({
                type: 'error',
                text1: '로그인을 실패했어요.',
              })
            }
          }).catch((error) => {
            if (error.response) {
              const res = error.response
              if (res.status === 400) {
                deleteData()
                moveLoginScreen()

                Toast.show({
                  type: 'error',
                  text1: '자동 로그아웃되었습니다.',
                  text2: '다시 로그인을 해주세요.',
                })
              } else if (res.status === 401) {
                deleteData()
                moveLoginScreen()

                Toast.show({
                  type: 'error',
                  text1: '세션이 만료되었습니다.',
                  text2: '다시 로그인을 해주세요.',
                })
              } else {
                setIsLoading(false)
                setRetry(true)
                setMessage('서버와 연결할 수 없습니다.')

                Toast.show({
                  type: 'error',
                  text1: '서버와 연결할 수 없습니다.',
                })
              }
            } else {
              setIsLoading(false)
              setRetry(true)
              setMessage('서버와 연결할 수 없습니다.')

              Toast.show({
                type: 'error',
                text1: '서버와 연결할 수 없습니다.',
              })
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
              Toast.show({ // 메세지 표시
                type: 'success',
                text1: `${profileData.firstName + profileData.lastName}(으)로 로그인했습니다.`
              })

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

                Toast.show({
                  type: 'error',
                  text1: '로그아웃 되었어요.',
                })
              }
            } else {
              deleteData()
              moveLoginScreen()

              Toast.show({
                type: 'error',
                text1: '로그아웃 되었어요.',
              })
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

                Toast.show({
                  type: 'error',
                  text1: '서버와 연결할 수 없습니다.',
                })
              }
            } else {
              setIsLoading(false)
              setRetry(true)
              setMessage('서버와 연결할 수 없습니다.')

              Toast.show({
                type: 'error',
                text1: '서버와 연결할 수 없습니다.',
              })
            }
          })
      }

      if (accessToken && refreshToken) {
        handleTokenCheck(accessToken)
      } else {
        deleteData()
        moveLoginScreen()

        Toast.show({
          type: 'error',
          text1: '로그인을 실패했어요.',
        })
      }
    } catch (error) {
      deleteData()
      moveLoginScreen()

      Toast.show({
        type: 'error',
        text1: '로그인을 실패했어요.',
      })
    }
  }

  const checkIntegrity = async () => {
    setIsLoading(true)
    setRetry(false)
    setMessage('데이터 무결성 검사 중...')

    try {
      const ID = await AsyncStorage.getItem('id')
      const JOB = await AsyncStorage.getItem('job')

      if (ID && JOB) {
        if (JOB === 'student' || JOB === 'teacher') {
          await axiosInstance.post('/profile', { id: ID, job: JOB })
            .then((res) => {
              if (res.status === 200) {
                checkTokenValidation(JOB, res.data)
              } else {
                setIsLoading(false)
                setRetry(true)
                setMessage('계정 인증 도중 예외가 발생했습니다.')

                Toast.show({
                  type: 'error',
                  text1: '계정 인증을 실패했어요.',
                })
              }
            }).catch((error) => {
              if (error.response) {
                const res = error.response
                if (res.status === 400) {
                  deleteData()
                  moveLoginScreen()

                  Toast.show({
                    type: 'error',
                    text1: `${res.data.errorDescription}`,
                  })
                } else {
                  setIsLoading(false)
                  setRetry(true)
                  setMessage('서버와 연결할 수 없습니다.')

                  Toast.show({
                    type: 'error',
                    text1: '서버와 연결할 수 없습니다.',
                  })
                }
              } else {
                setIsLoading(false)
                setRetry(true)
                setMessage('서버와 연결할 수 없습니다.')

                Toast.show({
                  type: 'error',
                  text1: '서버와 연결할 수 없습니다.',
                })
              }
            })
        } else if (JOB === 'guest') {
          Toast.show({ // 메세지 표시
            type: 'success',
            text1: '게스트로 로그인했습니다.',
          })

          return navigation.dispatch( // 기존에 있던 모든 스크린을 없애고 'S_Home'스크린으로 이동
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'S_Home' }]
            })
          )
        } else {
          deleteData()
          moveLoginScreen()

          Toast.show({
            type: 'error',
            text1: '무결성을 위반했습니다.',
          })
        }
      } else {
        deleteData()
        moveLoginScreen()
      }
    } catch (error) {
      deleteData()
      moveLoginScreen()

      Toast.show({
        type: 'error',
        text1: '데이터 무결성 검사를 실패했습니다.',
      })
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

                    Toast.show({
                      type: 'error',
                      text1: '스토어로 이동할 수 없습니다.',
                      text2: '스토어에서 업데이트가 필요합니다.',
                    })
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

                    Toast.show({
                      type: 'error',
                      text1: '스토어로 이동할 수 없습니다.',
                      text2: '스토어에서 업데이트가 필요합니다.',
                    })
                  },
                },
              ])
            }
          } else {
            checkIntegrity()
          }
        }).catch((error) => {
          if (error.response) {
            const res = error.response
            if (res.status === 400) {
              setIsLoading(false)
              setRetry(true)
              setMessage('지원 기기 : Android, IOS, MacOS')
            } else {
              setIsLoading(false)
              setRetry(true)
              setMessage('서버와 연결할 수 없습니다.')

              Toast.show({
                type: 'error',
                text1: '서버와 연결할 수 없습니다.',
              })
            }
          } else {
            setIsLoading(false)
            setRetry(true)
            setMessage('서버와 연결할 수 없습니다.')

            Toast.show({
              type: 'error',
              text1: '서버와 연결할 수 없습니다.',
            })
          }
        })
    } catch (error) {
      setIsLoading(false)
      setRetry(true)
      setMessage('버전 검사를 실패했습니다.')

      Toast.show({
        type: 'error',
        text1: '버전 검사를 실패했습니다.',
      })
    }
  }

  const handelNotificationStatus = async () => {
    const NotificationAllowedStatus = await AsyncStorage.getItem('Notification_Allowed_Status')

    if (NotificationAllowedStatus === null || NotificationAllowedStatus === 'true') {
      fcmInsertToken()
    }
  }

  const fcmInsertToken = async () => {
    await messaging()
      .getToken()
      .then(async (fcmToken) => {
        await AsyncStorage.setItem('fcm_token', fcmToken)

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
              Toast.show({
                type: 'error',
                text1: '알림 서비스를 등록하지 못했습니다.',
              })
            }
          }).catch((error) => {
            Toast.show({
              type: 'error',
              text1: '알림 서비스를 등록하지 못했습니다.',
            })
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
    handelNotificationStatus() // fcm토큰 등록 확인
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