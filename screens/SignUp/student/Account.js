import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, KeyboardAvoidingView, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Image, Modal } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-toast-message';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';

import axiosInstance from "../../../api/API_Server";

export default function S_SignUp_Account({ navigation }) {
  const route = useRoute()
  const { data } = route.params

  const isDarkMode = useColorScheme() === 'dark'
  const [isLoading, setIsLoading] = useState(false)

  const [accountID, setAccountID] = useState('')
  const [accountIDCheck, setAccountIDCheck] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [passwordCount, setPasswordCount] = useState(0)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const handlePasswordColor = (text) => {
    let count = 0
    if (isPasswordLengthValid(text)) count += 1
    if (isPasswordComplex(text)) count += 2
    if (!isCommonPassword(text)) count += 1
    setPasswordCount(count)
  }

  const handleCheckAccountID = async (accountID) => {
    setIsLoading(true)
    if (accountID != '') {
      await axiosInstance.post('/register', { accountID: accountID, })
        .then((res) => {
          setIsLoading(false)
          if (res.status === 200) {
            setAccountIDCheck(true)
            Toast.show({
              type: 'success',
              text1: `${res.data.message}`,
            })
          } else {
            setAccountIDCheck(false)
            Toast.show({
              type: 'error',
              text1: `아이디를 확인하지 못했어요.`,
            })
          }
        }).catch((error) => {
          setIsLoading(false)
          setAccountIDCheck(false)
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

  const handleNextScreen = async () => {
    if (accountID.indexOf(' ') !== -1) {
      Toast.show({
        type: 'error',
        text1: '아이디에 공백을 포함할 수 없습니다.',
      })
    } else if (firstName.indexOf(' ') !== -1 || lastName.indexOf(' ') !== -1) {
      Toast.show({
        type: 'error',
        text1: '이름에 공백을 포함할 수 없습니다.',
      })
    } else if (accountIDCheck === false) {
      Toast.show({
        type: 'error',
        text1: '사용 가능한 아이디인지 확인해주세요.',
      })
    } else if (!validatePhoneNumber(phoneNumber)) {
      Toast.show({
        type: 'error',
        text1: '전화번호 형식이 올바르지 않아요.',
      })
    } else if (passwordCount < 4) {
      Toast.show({
        type: 'error',
        text1: '비밀번호는 8자 이상, 숫자, 특수문자가 포함되어야 합니다.',
      })
    } else if (password != confirmPassword) {
      Toast.show({
        type: 'error',
        text1: '비밀번호가 서로 일치하지 않아요.',
      })
    } else {
      const tempData = {
        ...data,
        accountID: accountID,
        phoneNumber: phoneNumber,
        password: password,
        firstName: firstName,
        lastName: lastName,
      }
      return navigation.navigate('SignUp_StudentID', { data: tempData })
    }
  }

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
            <Text style={{ ...styles.Title, color: isDarkMode ? '#ffffff' : '#000000', }}>계정 정보를 입력해주세요.</Text>
          </View>

          <View style={{ justifyContent: 'center', alignItems: 'center', }}>
            <View style={{ ...styles.inputView, borderColor: isDarkMode ? '#333333' : '#E9E9E9', backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
              <TextInput
                style={{ ...styles.inputText, color: isDarkMode ? '#ffffff' : '#000000', }}
                placeholder='아이디'
                placeholderTextColor={isDarkMode ? '#CCCCCC' : '#999999'}
                value={accountID}
                onChangeText={(text) => {
                  setAccountID(text)
                  handleCheckAccountID(text)
                }}
              />
            </View>
          </View>

          <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center', }}>
            <View style={{ ...styles.inputView, borderColor: `${phoneNumber === '' ? isDarkMode ? '#333333' : '#E9E9E9' : validatePhoneNumber(phoneNumber) ? isDarkMode ? '#333333' : '#E9E9E9' : '#B22222'}`, backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
              <TextInput
                style={{ ...styles.inputText, color: isDarkMode ? '#ffffff' : '#000000', }}
                placeholder='전화번호   ex) 010-xxxx-xxxx'
                placeholderTextColor={isDarkMode ? '#CCCCCC' : '#999999'}
                value={phoneNumber.replace(/[^0-9]/g, '').replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3").replace(/(\-{1,2})$/g, "")}
                keyboardType='number-pad'
                onChangeText={(text) => {
                  setPhoneNumber(text)
                }}
              />
            </View>
            {phoneNumber != '' && !validatePhoneNumber(phoneNumber) &&
              <Text style={{ marginTop: 3, textAlign: 'left', fontSize: 13, color: isDarkMode ? '#ffffff' : '#000000', }}>전화번호 형식이 올바르지 않아요.</Text>
            }
          </View>

          <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center', }}>
            <View style={{ ...styles.inputView, borderColor: `${password === '' ? isDarkMode ? '#333333' : '#E9E9E9' : passwordCount >= 4 ? isDarkMode ? '#333333' : '#E9E9E9' : '#B22222'}`, backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
              <TextInput
                style={{ ...styles.inputText, color: isDarkMode ? '#ffffff' : '#000000', }}
                secureTextEntry={true}
                placeholder='비밀번호'
                placeholderTextColor={isDarkMode ? '#CCCCCC' : '#999999'}
                value={password}
                onChangeText={(text) => {
                  handlePasswordColor(text)
                  setPassword(text)
                }}
              />
            </View>
            {password != '' && passwordCount < 4 &&
              <Text style={{ marginTop: 3, textAlign: 'left', fontSize: 13, color: isDarkMode ? '#ffffff' : '#000000', }}>비밀번호는 8자 이상, 숫자와 특수문자가 포함되어야 해요.</Text>
            }
          </View>

          <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center', }}>
            <View style={{ ...styles.inputView, borderColor: `${confirmPassword === '' ? isDarkMode ? '#333333' : '#E9E9E9' : `${password === confirmPassword ? isDarkMode ? '#333333' : '#E9E9E9' : '#B22222'}`}`, backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
              <TextInput
                style={{ ...styles.inputText, color: isDarkMode ? '#ffffff' : '#000000', }}
                secureTextEntry={true}
                placeholder='비밀번호 확인'
                placeholderTextColor={isDarkMode ? '#CCCCCC' : '#999999'}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text)
                }}
              />
            </View>
            {confirmPassword != '' && password != confirmPassword &&
              <Text style={{ marginTop: 3, textAlign: 'left', fontSize: 13, color: isDarkMode ? '#ffffff' : '#000000', }}>비밀번호가 서로 일치하지 않아요.</Text>
            }
          </View>

          <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center', }}>
            <View style={{ ...styles.inputView, borderColor: isDarkMode ? '#333333' : '#E9E9E9', backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
              <TextInput
                style={{ ...styles.inputText, color: isDarkMode ? '#ffffff' : '#000000', }}
                placeholder='성 (이름)'
                placeholderTextColor={isDarkMode ? '#CCCCCC' : '#999999'}
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text)
                }}
              />
            </View>
          </View>

          <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center', }}>
            <View style={{ ...styles.inputView, borderColor: isDarkMode ? '#333333' : '#E9E9E9', backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
              <TextInput
                style={{ ...styles.inputText, color: isDarkMode ? '#ffffff' : '#000000', }}
                placeholder='이름'
                placeholderTextColor={isDarkMode ? '#CCCCCC' : '#999999'}
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text)
                }}
              />
            </View>
          </View>

          <View style={{ marginBottom: 200, }}></View>
        </ScrollView>

        <View style={{ justifyContent: 'center', alignItems: 'center', }}>
          <TouchableOpacity onPress={() => handleNextScreen()} disabled={accountID === '' || phoneNumber === '' || password === '' || confirmPassword === '' || firstName === '' || lastName === '' ? true : false} style={{ ...styles.button, position: 'absolute', bottom: 30, backgroundColor: accountID === '' || phoneNumber === '' || password === '' || confirmPassword === '' || firstName === '' || lastName === '' ? '#D46A66' : '#EB4E45', }}>
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