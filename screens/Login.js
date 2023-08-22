import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, KeyboardAvoidingView, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Image, Modal } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from '@react-native-firebase/messaging';
import { CommonActions } from "@react-navigation/native";
import DeviceInfo from 'react-native-device-info';
import FastImage from 'react-native-fast-image';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';

import axiosInstance from "../api/API_Server";
import ErrorAlert from '../api/ErrorModal';

export default function LoginScreen({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'

  const [isLoading, setIsLoading] = useState(false)

  const [alert, setAlert] = useState(null)
  const [alertDescription, setAlertDescription] = useState(null)
  const [alertStatus, setAlertStatus] = useState(null)
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false)

  const [accountID, setAccountID] = useState('')
  const [password, setPassword] = useState('')
  const [job, setJob] = useState('student')

  const handleJob = async () => {
    if (job === 'student') {
      setJob('teacher')
    } else if (job === 'teacher') {
      setJob('student')
    }
  }

  const resetAlert = () => {
    setAlert(null) // 에러메시지 초기화
    setAlertDescription(null) // 에러메시지 초기화
    setAlertStatus(null) // 에러상태 초기화
    setIsAlertModalVisible(false) // 에러 모달 닫기
  }

  const fcmInsertToken = async (accountID) => {
    await messaging()
      .getToken()
      .then(async (fcmToken) => {
        AsyncStorage.setItem('fcm_token', fcmToken)
        const data = [
          {
            "fcmToken": fcmToken,
            "accountID": accountID,
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

  const handleLogin = async () => {
    resetAlert()
    if (!accountID || !password) {
      // 에러 모달 설정
      setAlert('아이디 또는 비밀번호를 입력해주세요.')
      setAlertStatus(400)
      setIsAlertModalVisible(true) // 에러 모달 표시
    } else {
      setIsLoading(true)
      try {
        await axiosInstance.post('/login', { accountID, password, job })
          .then((res) => {
            setIsLoading(false)
            if (res.status === 200) {
              fcmInsertToken(res.data.id)
              AsyncStorage.setItem('id', res.data.id)
              AsyncStorage.setItem('job', res.data.job)
              AsyncStorage.setItem('access_token', res.data.accessToken)
              AsyncStorage.setItem('refresh_token', res.data.refreshToken)

              if (res.data.job === 'student') {
                return navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'S_Home' }]
                  })
                )
              } else if (res.data.job === 'teacher') {
                return navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'T_Home' }]
                  })
                )
              }
            } else {
              // 에러 모달 설정
              setAlert('로그인 시도 중 예외가 발생했습니다.')
              setAlertDescription('다시 시도해 주세요.')
              setAlertStatus(400)
              setIsAlertModalVisible(true) // 에러 모달 표시
            }
          }).catch((error) => {
            setIsLoading(false)
            if (error.response) {
              const res = error.response
              if (res.status === 400) {
                // 에러 모달 설정
                setAlert(res.data.error)
                if (res.data.errorDescription) setAlertDescription(res.data.errorDescription)
                setAlertStatus(400)
                setIsAlertModalVisible(true) // 에러 모달 표시
              } else if (res.status === 500) {
                console.log(res.data)
                // 에러 모달 설정
                setAlert('로그인에 실패했습니다.')
                if (res.data.errorDescription) setAlertDescription(res.data.errorDescription)
                setAlertStatus(500)
                setIsAlertModalVisible(true) // 에러 모달 표시
              } else {
                console.log('LoginAPI | ', error)
                // 에러 모달 설정
                setAlert('서버와 연결할 수 없습니다.')
                setAlertDescription('다시 시도해 주세요.')
                setAlertStatus(500)
                setIsAlertModalVisible(true) // 에러 모달 표시
              }
            } else {
              // 에러 모달 설정
              setAlert('서버와 연결할 수 없습니다.')
              setAlertDescription('다시 시도해 주세요.')
              setAlertStatus(500)
              setIsAlertModalVisible(true) // 에러 모달 표시
            }
          })
      } catch (error) {
        setIsLoading(false)
        console.log('LoginAPI | ', error)
        // 에러 모달 설정
        setAlert('로그인에 실패했습니다.')
        setAlertDescription('다시 시도해 주세요.')
        setAlertStatus(500)
        setIsAlertModalVisible(true) // 에러 모달 표시
      }
    }
  }

  const closeErrModal = () => {
    setIsAlertModalVisible(false)
  }

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <ErrorAlert error={alert} errorDescription={alertDescription} status={alertStatus} isDarkMode={isDarkMode} visible={isAlertModalVisible} onComponent={handleLogin} onClose={closeErrModal} />

      <FastImage style={{ justifyContent: 'center', alignItems: 'center', width: 150, height: 150, marginBottom: 40 }} source={require('../resource/logo_v1.png')} />

      <View style={[styles.inputView, isDarkMode && styles.inputViewDark]}>
        <TextInput
          style={[styles.inputText, isDarkMode && styles.inputTextDark]}
          placeholder="아이디"
          placeholderTextColor={isDarkMode ? "#CCCCCC" : "#999999"}
          onChangeText={(text) => setAccountID(text)}
        />
      </View>
      <View style={[styles.inputView, isDarkMode && styles.inputViewDark]}>
        <TextInput
          style={[styles.inputText, isDarkMode && styles.inputTextDark]}
          placeholder="비밀번호"
          placeholderTextColor={isDarkMode ? "#CCCCCC" : "#999999"}
          secureTextEntry={true}
          onChangeText={(text) => setPassword(text)}
        />
      </View>

      <TouchableOpacity style={styles.jobBtn} onPress={handleJob}>
        <Text style={styles.jobBtnText}>
          {job === 'student' ?
            <>
              {<Icon_Ionicons name='school-outline' size={14} />} 학생
            </>
            :
            <>
              {<Icon_Ionicons name='options-outline' size={14} />} 교사
            </>
          }
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        {isLoading === false ?
          <Text style={styles.loginBtnText}>로그인</Text>
          :
          <ActivityIndicator size="small" color="white" />
        }
      </TouchableOpacity>

      <View style={{ justifyContent: 'center', marginTop: 10, }}>
        <TouchableOpacity style={{ position: 'absolute', left: -95 }} onPress={() => { navigation.navigate('SignUp_Welcome') }}>
          <Text style={{ color: '#666666', textAlign: 'center', fontSize: 12 }}>회원가입</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ position: 'absolute', left: -33 }} onPress={() => { Alert.alert('준비 중', '아이디찾기를 사용할 수 없습니다.') }}>
          <Text style={{ color: '#666666', textAlign: 'center', fontSize: 12 }}>아아디찾기</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ position: 'absolute', left: 40 }} onPress={() => { Alert.alert('준비 중', '비밀번호찾기를 사용할 수 없습니다.') }}>
          <Text style={{ color: '#666666', textAlign: 'center', fontSize: 12 }}>비밀번호찾기</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity style={{ position: 'absolute', top: 30,}} onPress={() => { navigation.navigate('SignUp_Welcome')}}>
                    <Text style={{color: '#666666', textAlign: 'center', fontSize: 12}}>새로운회원가입</Text>
                </TouchableOpacity> */}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerDark: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputView: {
    width: '85%',
    backgroundColor: '#E9E9E9',
    borderRadius: 10,
    height: 50,
    marginBottom: 20,
    justifyContent: 'center',
    padding: 13,
    borderColor: '#E9E9E9',
    borderWidth: 2,
  },
  inputViewDark: {
    width: '85%',
    backgroundColor: '#333333',
    borderRadius: 10,
    height: 50,
    marginBottom: 20,
    justifyContent: 'center',
    padding: 13,
    borderColor: '#333333',
    borderWidth: 2,
  },
  inputText: {
    height: 50,
    color: '#000',
  },
  inputTextDark: {
    height: 50,
    color: '#fff',
  },
  loginBtn: {
    width: '85%',
    backgroundColor: '#EB4E45',
    borderRadius: 10,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginLeft: 100,
    marginRight: 100,
  },
  loginBtnText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '400',
    alignContent: 'center',
    alignItems: 'center',
  },
  jobBtn: {
    width: '23%',
    backgroundColor: '#EB4E45',
    borderRadius: 15,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  jobBtnText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center'
  }
})

const LoginStyles = StyleSheet.create({
  signUpText: {
    color: '#000',
  },
  signUpTextDark: {
    color: '#fff',
  },
})