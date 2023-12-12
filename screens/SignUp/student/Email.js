import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, KeyboardAvoidingView, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Image, Modal } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-toast-message';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';

import axiosInstance from "../../../api/API_Server";

export default function S_SignUp_Email({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'
  const [isLoading, setIsLoading] = useState(false)

  const [email, setEmail] = useState('')

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

  const handleCheckEmail = async () => {
    setIsLoading(true)
    if (email != '') {
      await axiosInstance.post('/register', { email: email, })
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
    if (inputAuthCode != '') {
      setIsLoading(true)
      await axiosInstance.post('/register', { authData: { email: email, code: inputAuthCode }, })
        .then((res) => {
          setIsLoading(false)
          if (res.status === 200) {
            handleResetAuthStage()
            Toast.show({
              type: 'success',
              text1: `${res.data.message}`,
            })

            const tempData = { email: email, }
            return navigation.navigate('SignUp_Account', { data: tempData, })
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

  return (
    <SafeAreaView style={{ ...styles.container, backgroundColor: isDarkMode ? '#000000' : '#ffffff', }}>
      <KeyboardAvoidingView style={{ flex: 1, }} behavior={Platform.select({ ios: 'padding' })}>
        {/* 로고 */}
        <View style={styles.logoView}>
          <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 50 } : { ...styles.backButtonView, }} onPress={() => navigation.goBack()}>
            <Text style={{ ...styles.logoText, color: isDarkMode ? '#ffffff' : '#000000', }}>
              {<Icon_Ionicons name="chevron-back-outline" size={21} />}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1, }}>
          <View style={{ padding: 10, }}>
            <Text style={{ ...styles.Title, color: isDarkMode ? '#ffffff' : '#000000', }}>먼저 이메일을 알려주세요.</Text>
          </View>

          <View style={{ justifyContent: 'center', alignItems: 'center', }}>
            <View style={{ ...styles.inputView, borderColor: isDarkMode ? '#333333' : '#E9E9E9', backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
              <TextInput
                style={{ ...styles.inputText, color: isDarkMode ? '#ffffff' : '#000000', }}
                placeholder='이메일'
                placeholderTextColor={isDarkMode ? '#CCCCCC' : '#999999'}
                value={email}
                editable={authStage === true && timerActive === true ? false : true}
                onChangeText={(text) => setEmail(text)}
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

        <View style={{ justifyContent: 'center', alignItems: 'center', }}>
          <TouchableOpacity onPress={() => {
            if (authStage === true) {
              handleAuthConfirmation()
            } else {
              handleCheckEmail()
            }
          }} disabled={email === '' ? true : false} style={{ ...styles.button, position: 'absolute', bottom: 30, backgroundColor: email === '' ? '#D46A66' : '#EB4E45', }}>
            {isLoading === false ?
              <Text style={styles.buttonText}>다음</Text>
              :
              <ActivityIndicator size="small" color="#ffffff" />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    left: 10,
  },
  Title: {
    padding: 13,
    fontWeight: 'bold',
    fontSize: 30,
  },
  inputView: {
    width: '90%',
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
  button: {
    width: 310,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '400',
    alignContent: 'center',
    alignItems: 'center',
  },
})