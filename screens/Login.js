import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, KeyboardAvoidingView, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Image, Modal } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from '@react-native-firebase/messaging';
import { CommonActions } from "@react-navigation/native";
import DeviceInfo from 'react-native-device-info';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-toast-message';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';

import axiosInstance from "../api/API_Server";

export default function LoginScreen({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'

  const [isLoading, setIsLoading] = useState(false)

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

  const handelNotificationStatus = async (accountID) => {
    const NotificationAllowedStatus = await AsyncStorage.getItem('Notification_Allowed_Status')

    if (NotificationAllowedStatus === null || NotificationAllowedStatus === 'true') {
      fcmInsertToken(accountID)
    }
  }

  const fcmInsertToken = async (accountID) => {
    await messaging()
      .getToken()
      .then(async (fcmToken) => {
        await AsyncStorage.setItem('fcm_token', fcmToken)

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

  const handleLogin = async () => {
    if (!accountID || !password) {
      Toast.show({
        type: 'error',
        text1: '아이디 또는 비밀번호를 입력해주세요.',
      })
    } else {
      setIsLoading(true)
      try {
        await axiosInstance.post('/login', { accountID, password, job })
          .then((res) => {
            setIsLoading(false)
            if (res.status === 200) {
              handelNotificationStatus(res.data.id)
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
              Toast.show({
                type: 'error',
                text1: '로그인을 실패했어요.',
                text2: '다시 시도해 주세요.',
              })
            }
          }).catch((error) => {
            setIsLoading(false)
            if (error.response) {
              const res = error.response
              if (res.status === 400) {
                if (res.data.errorDescription) {
                  Toast.show({
                    type: 'error',
                    text1: `${res.data.errorDescription}`,
                    text2: `${res.data.error}`,
                  })
                } else {
                  Toast.show({
                    type: 'error',
                    text1: `${res.data.error}`,
                  })
                }
              } else if (res.status === 500) {
                if (res.data.errorDescription) {
                  Toast.show({
                    type: 'error',
                    text1: `${res.data.errorDescription}`,
                    text2: `${res.data.error}`,
                  })
                } else {
                  Toast.show({
                    type: 'error',
                    text1: `${res.data.error}`,
                  })
                }
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
                text2: '다시 시도해 주세요.',
              })
            }
          })
      } catch (error) {
        setIsLoading(false)
        Toast.show({
          type: 'error',
          text1: '서버와 연결할 수 없습니다.',
          text2: '다시 시도해 주세요.',
        })
      }
    }
  }

  const handleGuestLogin = async () => {
    const ID = await DeviceInfo.getUniqueId()

    handelNotificationStatus()

    AsyncStorage.setItem('id', ID)
    AsyncStorage.setItem('job', 'guest')
    AsyncStorage.setItem('access_token', 'guestLoginAccessToken1234')
    AsyncStorage.setItem('refresh_token', 'guestLoginRefreshToken1234')

    return navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'S_Home' }]
      })
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#000000' : '#ffffff' }}>
      <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }} behavior={Platform.select({ ios: 'padding' })}>
        <FastImage style={{ justifyContent: 'center', alignItems: 'center', width: 150, height: 150, marginBottom: 40 }} source={require('../resource/logo_v1.png')} />

        <View style={{ ...styles.inputView, borderColor: isDarkMode ? '#333333' : '#E9E9E9', backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
          <TextInput
            style={{ height: 50, color: isDarkMode ? '#ffffff' : '#000000' }}
            placeholder='아이디'
            placeholderTextColor={isDarkMode ? "#CCCCCC" : "#999999"}
            onChangeText={(text) => setAccountID(text)}
          />
        </View>

        <View style={{ ...styles.inputView, borderColor: isDarkMode ? '#333333' : '#E9E9E9', backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
          <TextInput
            style={{ height: 50, color: isDarkMode ? '#ffffff' : '#000000' }}
            placeholder='비밀번호'
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
          <TouchableOpacity style={{ position: 'absolute', left: -95 }} onPress={() => { navigation.navigate('SignUp_ToS') }}>
            <Text style={{ color: '#666666', textAlign: 'center', fontSize: 12 }}>회원가입</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ position: 'absolute', left: -33 }} onPress={() => {
            Toast.show({
              type: 'error',
              text1: '아이디 찾기를 사용할 수 없습니다.',
              text2: '준비 중',
            })
          }}>
            <Text style={{ color: '#666666', textAlign: 'center', fontSize: 12 }}>아아디찾기</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ position: 'absolute', left: 40 }} onPress={() => {
            Toast.show({
              type: 'error',
              text1: '비밀번호 찾기를 사용할 수 없습니다.',
              text2: '준비 중',
            })
          }}>
            <Text style={{ color: '#666666', textAlign: 'center', fontSize: 12 }}>비밀번호찾기</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={{ position: 'absolute', bottom: 10, }} onPress={() => {
          Alert.alert('정보', '게스트로 로그인을 하시겠습니까?\n로그인 필요 서비스는 이용할 수 없습니다.', [{ text: '게스트로 로그인', onPress: () => handleGuestLogin() }, { text: '취소', }])
        }}>
          <Text style={{ color: '#666666', textAlign: 'center', fontSize: 12 }}>게스트로 로그인</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView >
  )
}

const styles = StyleSheet.create({
  inputView: {
    width: '85%',
    height: 50,
    padding: 13,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
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