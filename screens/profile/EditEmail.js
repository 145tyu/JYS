import React, { useEffect, useState } from "react";
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, KeyboardAvoidingView, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from 'react-native-toast-message';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

import axiosInstance from "../../api/API_Server";

export default function EditEmail({ navigation }) {
  const route = useRoute()

  const isDarkMode = useColorScheme() === 'dark'

  const [isLoading, setIsLoading] = useState(false)

  const [methodName, setMethodName] = useState(null)
  const [placeholder, setPlaceholder] = useState('이곳에 적어주세요.')

  const [oldPassword, setOldPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')

  const [authStage, setAuthStage] = useState(false)
  const [inputAuthCode, setInputAuthCode] = useState('')

  const [timerSeconds, setTimerSeconds] = useState(300)
  const [timerActive, setTimerActive] = useState(false)

  const handleResetAuthStage = () => {
    setAuthStage(false) // 인증 단계 비활성화
    setTimerActive(false) // 타이머 비활성화
    setTimerSeconds(300) // 타이머 시간 초기화
    setInputAuthCode('') // 인증코드 입력창 초기화
  }

  const handelCheckEmail = async () => {
    if (newEmail === '') {
      Toast.show({
        type: 'error',
        text1: '새로운 이메일을 입력해주세요.',
      })
    } else {
      setIsLoading(true)
      await axiosInstance.post('/register', { email: newEmail, })
        .then((res) => {
          setIsLoading(false)
          if (res.status === 200) {
            setAuthStage(true) // 인증 단계 활성화
            setTimerSeconds(300) // 타이머 초기화
            setTimerActive(true) // 타이머 활성화
            Toast.show({
              type: 'success',
              text1: `${res.data.message}`,
            })
          } else {
            handleResetAuthStage()
            Toast.show({
              type: 'error',
              text1: '이메일을 확인하지 못했어요.',
            })
          }
        }).catch((error) => {
          setIsLoading(false)
          handleResetAuthStage()
          const res = error.response
          if (res.status === 400) {
            Toast.show({
              type: 'error',
              text1: `${res.data.errorDescription}`,
              text2: `${res.data.error}`,
            })
          } else if (res.status === 500) {
            Toast.show({
              type: 'error',
              text1: `${res.data.errorDescription}`,
              text2: `${res.data.error}`,
            })
          } else {
            Toast.show({
              type: 'error',
              text1: '서버와 연결할 수 없습니다.',
              text2: '다시 시도해 주세요.',
            })
          }
        })
    }
  }

  const handleAuthConfirmation = async () => {
    if (inputAuthCode == '') {
      Toast.show({
        type: 'error',
        text1: '인증코드를 입력해주세요.',
      })
    } else {
      setIsLoading(true)
      await axiosInstance.post('/register', { authData: { email: newEmail, code: inputAuthCode }, })
        .then((res) => {
          setIsLoading(false)
          if (res.status === 200) {
            handleResetAuthStage()
            Toast.show({
              type: 'success',
              text1: `${res.data.message}`,
            })
            handleEditProfile()
          } else {
            Toast.show({
              type: 'error',
              text1: '인증번호를 확인하지 못했어요.',
            })
          }
        }).catch((error) => {
          setIsLoading(false)
          const res = error.response
          if (res.status === 400) {
            Toast.show({
              type: 'error',
              text1: `${res.data.errorDescription}`,
              text2: `${res.data.error}`,
            })
          } else if (res.status === 500) {
            Toast.show({
              type: 'error',
              text1: `${res.data.errorDescription}`,
              text2: `${res.data.error}`,
            })
          } else {
            Toast.show({
              type: 'error',
              text1: '서버와 연결할 수 없습니다.',
              text2: '다시 시도해 주세요.',
            })
          }
        })
    }
  }

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const remainingSeconds = timeInSeconds % 60
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
  }

  useEffect(() => {
    let intervalId

    if (timerActive && timerSeconds > 0) {
      intervalId = setInterval(() => {
        setTimerSeconds((prevSeconds) => prevSeconds - 1)
      }, 1000)
    }

    return () => clearInterval(intervalId)
  }, [timerActive, timerSeconds])

  useEffect(() => {
    if (timerSeconds === 0) {
      handleResetAuthStage()
    }
  }, [timerSeconds])

  const handleEditProfile = async () => {
    if (oldPassword === '') {
      Toast.show({
        type: 'error',
        text1: '현재 비밀번호를 입력해주세요.',
      })
    } else if (newEmail === '') {
      Toast.show({
        type: 'error',
        text1: '새로운 이메일을 입력해주세요.',
      })
    } else {
      setIsLoading(true)
      try {
        const ID = await AsyncStorage.getItem('id')
        const JOB = await AsyncStorage.getItem('job')
        await axiosInstance.post('/v2/profile', { id: ID, job: JOB, methodName: 'edit', data: { oldPassword: oldPassword, email: newEmail } })
          .then((res) => {
            setIsLoading(false)
            if (res.status === 200) {
              Toast.show({
                type: 'success',
                text1: `${res.data.message}`,
              })
              navigation.goBack()
            } else {
              Toast.show({
                type: 'error',
                text1: '이메일을 변경하지 못했어요.',
                text2: '다시 시도해 주세요.',
              })
            }
          }).catch((error) => {
            setIsLoading(false)
            if (error.response) {
              const res = error.response
              if (res.status === 400) {
                Toast.show({
                  type: 'error',
                  text1: `${res.data.errorDescription}`,
                  text2: `${res.data.error}`,
                })
              } else if (res.status === 500) {
                Toast.show({
                  type: 'error',
                  text1: `${res.data.errorDescription}`,
                  text2: `${res.data.error}`,
                })
              } else {
                Toast.show({
                  type: 'error',
                  text1: '서버와 연결할 수 없습니다.',
                  text2: '다시 시도해 주세요.',
                })
              }
            } else {
              Toast.show({
                type: 'error',
                text1: '서버와 연결할 수 없습니다.',
                text2: `${error}`,
              })
            }
          })
      } catch (error) {
        setIsLoading(false)
        Toast.show({
          type: 'error',
          text1: '이메일을 변경하지 못했어요.',
          text2: `${error}`,
        })
      }
    }
  }

  const handleSetMethod = () => {
    const { methodName, email } = route.params
    setMethodName(methodName)
    if (methodName === 'email') {
      setPlaceholder(email)
    } else {
      Toast.show({
        type: 'error',
        text1: '나중에 다시 시도해보세요.',
      })
      navigation.goBack()
    }
  }

  useEffect(() => {
    handleSetMethod()
  }, [])

  return (
    <SafeAreaView style={{ ...styles.container, backgroundColor: isDarkMode ? '#000000' : '#ffffff', }}>
      <KeyboardAvoidingView style={{ flex: 1, }} behavior={Platform.select({ ios: 'padding' })}>
        {/* 로고 */}
        <View style={styles.logoView}>
          <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 10 } : { ...styles.backButtonView, }} onPress={() => navigation.goBack()}>
            <Text style={{ ...styles.logoText, color: isDarkMode ? '#ffffff' : '#000000', }}>
              {<Icon_Ionicons name="chevron-back-outline" size={21} />} 이메일 변경
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1, }}>
          <Text style={{ marginTop: 15, color: isDarkMode ? '#999999' : '#666666', marginLeft: 20, marginBottom: 7, }}>현재 비밀번호</Text>
          <View style={{ justifyContent: 'center', alignItems: 'center', }}>
            <View style={{ ...styles.inputView, borderColor: isDarkMode ? '#333333' : '#E9E9E9', backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
              <TextInput
                style={{ ...styles.inputText, color: isDarkMode ? '#ffffff' : '#000000', }}
                placeholder='비밀번호'
                placeholderTextColor={isDarkMode ? '#CCCCCC' : '#999999'}
                value={oldPassword}
                secureTextEntry={true}
                editable={true}
                onChangeText={(text) => setOldPassword(text)}
              />
            </View>
          </View>

          <Text style={{ marginTop: 10, color: isDarkMode ? '#999999' : '#666666', marginLeft: 20, marginBottom: 7, }}>새로운 이메일</Text>
          <View style={{ justifyContent: 'center', alignItems: 'center', }}>
            <View style={{ ...styles.inputView, borderColor: isDarkMode ? '#333333' : '#E9E9E9', backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
              <TextInput
                style={{ ...styles.inputText, color: isDarkMode ? '#ffffff' : '#000000', }}
                placeholder={placeholder}
                placeholderTextColor={isDarkMode ? '#CCCCCC' : '#999999'}
                value={newEmail}
                editable={true}
                onChangeText={(text) => setNewEmail(text)}
              />
            </View>
          </View>

          {authStage === true &&
            <>
              <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center', }}>
                <View style={{ ...styles.inputView, borderColor: isDarkMode ? '#333333' : '#E9E9E9', backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
                  <Text style={{ right: 15, position: 'absolute', color: isDarkMode ? '#ffffff' : '#000000', }}>{formatTime(timerSeconds)}</Text>
                  <TextInput
                    style={{ ...styles.inputText, color: isDarkMode ? '#ffffff' : '#000000', }}
                    placeholder={'인증번호'}
                    placeholderTextColor={isDarkMode ? '#CCCCCC' : '#999999'}
                    value={inputAuthCode}
                    keyboardType='number-pad'
                    onChangeText={(text) => setInputAuthCode(text)}
                  />
                </View>
              </View>
            </>
          }

          <View style={{ marginBottom: 100, }}></View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 요청 */}
      <TouchableOpacity style={styles.checkBtnContainer} onPress={() => {
        if (authStage === true) {
          handleAuthConfirmation()
        } else {
          handelCheckEmail()
        }
      }}>
        {isLoading === false ?
          <Text style={styles.checkBtnText}>{<Icon_Feather name="check" size={17} />} 확인</Text>
          :
          <ActivityIndicator size="small" color="white" />
        }
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoView: {
    height: 60,
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '400',
  },
  backButtonView: {
    position: 'absolute',
    top: 20,
    left: 10,
  },
  inputView: {
    width: '95%',
    height: 50,
    padding: 13,
    borderWidth: 2,
    borderRadius: 10,
    justifyContent: 'center',
  },
  inputText: {
    height: 50,
    color: '#000000',
  },
  checkBtnContainer: {
    backgroundColor: '#1E00D3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 0,
    marginBottom: 20,
  },
  checkBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 15,
  },
})