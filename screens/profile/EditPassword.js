import React, { useEffect, useState } from "react";
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal, KeyboardAvoidingView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from 'react-native-toast-message';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

import axiosInstance from "../../api/API_Server";

export default function EditPassword({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'
  const [isLoading, setIsLoading] = useState(false)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  const [passwordCount, setPasswordCount] = useState(0)

  const handlePasswordColor = (text) => {
    let count = 0
    if (isPasswordLengthValid(text)) count += 1
    if (isPasswordComplex(text)) count += 2
    if (!isCommonPassword(text)) count += 1
    setPasswordCount(count)
  }

  const handleEditProfile = async () => {
    if (oldPassword === '') {
      Toast.show({
        type: 'error',
        text1: '현재 비밀번호를 입력해주세요.',
      })
    } else if (newPassword !== confirmNewPassword) {
      Toast.show({
        type: 'error',
        text1: '새로운 비밀번호와 확인 비밀번호와 일치하지 않습니다.',
        text2: '비밀번호를 확인해주세요.'
      })
    } else if (passwordCount < 4) {
      Toast.show({
        type: 'error',
        text1: '새로운 비밀번호가 안전하지 않습니다.',
        text2: '비밀번호를 확인해주세요.'
      })
    } else {
      setIsLoading(true)
      try {
        const ID = await AsyncStorage.getItem('id')
        const JOB = await AsyncStorage.getItem('job')
        await axiosInstance.post('/v2/profile', { id: ID, job: JOB, methodName: 'edit', data: { oldPassword: oldPassword, newPassword: newPassword, } })
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
                text1: '비밀번호를 변경하지 못했어요.',
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
          text1: '비밀번호를 변경하지 못했어요.',
          text2: `${error}`,
        })
      }
    }
  }

  return (
    <SafeAreaView style={{ ...styles.container, backgroundColor: isDarkMode ? '#000000' : '#ffffff', }}>
      <KeyboardAvoidingView style={{ flex: 1, }} behavior={Platform.select({ ios: 'padding' })}>
        {/* 로고 */}
        <View style={styles.logoView}>
          <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 10 } : { ...styles.backButtonView, }} onPress={() => navigation.goBack()}>
            <Text style={{ ...styles.logoText, color: isDarkMode ? '#ffffff' : '#000000', }}>
              {<Icon_Ionicons name="chevron-back-outline" size={21} />} 비밀번호 변경
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

          <Text style={{ marginTop: 10, color: isDarkMode ? '#999999' : '#666666', marginLeft: 20, marginBottom: 7, }}>새로운 비밀번호</Text>
          <View style={{ justifyContent: 'center', alignItems: 'center', }}>
            <View style={{ ...styles.inputView, borderColor: `${newPassword === '' ? isDarkMode ? '#333333' : '#E9E9E9' : passwordCount >= 4 ? isDarkMode ? '#333333' : '#E9E9E9' : '#B22222'}`, backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
              <TextInput
                style={{ ...styles.inputText, color: isDarkMode ? '#ffffff' : '#000000', }}
                placeholder='새로운 비밀번호'
                placeholderTextColor={isDarkMode ? '#CCCCCC' : '#999999'}
                value={newPassword}
                secureTextEntry={true}
                editable={true}
                onChangeText={(text) => {
                  handlePasswordColor(text)
                  setNewPassword(text)
                }}
              />
            </View>
            {newPassword != '' && passwordCount < 4 &&
              <Text style={{ marginTop: 3, textAlign: 'left', fontSize: 13, color: isDarkMode ? '#ffffff' : '#000000', }}>비밀번호는 8자 이상, 숫자와 특수문자가 포함되어야 해요.</Text>
            }
          </View>

          <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center', }}>
            <View style={{ ...styles.inputView, borderColor: `${confirmNewPassword === '' ? isDarkMode ? '#333333' : '#E9E9E9' : `${newPassword === confirmNewPassword ? isDarkMode ? '#333333' : '#E9E9E9' : '#B22222'}`}`, backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
              <TextInput
                style={{ ...styles.inputText, color: isDarkMode ? '#ffffff' : '#000000', }}
                placeholder='비밀번호 확인'
                placeholderTextColor={isDarkMode ? '#CCCCCC' : '#999999'}
                value={confirmNewPassword}
                secureTextEntry={true}
                onChangeText={(text) => setConfirmNewPassword(text)}
              />
            </View>
            {confirmNewPassword != '' && newPassword != confirmNewPassword &&
              <Text style={{ marginTop: 3, textAlign: 'left', fontSize: 13, color: isDarkMode ? '#ffffff' : '#000000', }}>비밀번호가 서로 일치하지 않아요.</Text>
            }
          </View>

          <View style={{ marginBottom: 100, }}></View>
        </ScrollView>

        {/* 요청 */}
        <TouchableOpacity style={styles.checkBtnContainer} onPress={handleEditProfile}>
          {isLoading === false ?
            <Text style={styles.checkBtnText}>{<Icon_Feather name="check" size={17} />} 확인</Text>
            :
            <ActivityIndicator size="small" color="white" />
          }
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView >
  )
}

function validatePhoneNumber(phoneNumber) {
  const pattern = /^010-\d{4}-\d{4}$/
  return pattern.test(phoneNumber)
}

function isPasswordLengthValid(password) {
  return password.length >= 8
}

function isPasswordComplex(password) {
  const Lower = /[a-z]/.test(password)
  const Digit = /[0-9]/.test(password)
  const Special = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/\-=|]/.test(password)

  return Lower && Digit && Special
}

function isCommonPassword(password) {
  const commonPasswords = ['password', '123456', 'qwerty', 'abc123'] // 일반적인 비밀번호 목록

  return commonPasswords.includes(password)
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    marginTop: 20,
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