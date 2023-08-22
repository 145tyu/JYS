import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, KeyboardAvoidingView, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Image, Modal } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import FastImage from 'react-native-fast-image';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';

import axiosInstance from "../../../api/API_Server";

export default function S_SignUp_Account({ navigation }) {
  const route = useRoute()
  const { email } = route.params

  const isDarkMode = useColorScheme() === 'dark'

  const [isLoading, setIsLoading] = useState(false)

  const [message, setMessage] = useState('양식에 맞게 작성해주세요.')

  //${email.substring(0, (email.indexOf('@')))}
  const [accountID, setAccountID] = useState('')
  const [password, setPassword] = useState(null)
  const [confirmPassword, setConfirmPassword] = useState(null)
  const [phoneNumber, setPhoneNumber] = useState('')

  const [passwordColor, setPasswordColor] = useState('#B22222')
  const [passwordCount, setPasswordCount] = useState(0)

  const handlePasswordColor = (text) => {
    let count = 0

    if (isPasswordLengthValid(text)) count += 1

    if (isPasswordComplex(text)) count += 2

    if (!isCommonPassword(text)) count += 1

    setPasswordCount(count)

    if (count >= 4) {
      setMessage('양식에 맞게 작성해주세요.')
      setPasswordColor('#008000')
    } else {
      setPasswordColor('#B22222')
    }
  }

  const handleNextScreen = () => {
    if (accountID === null) {
      setMessage('아이디를 입력해주세요.')
      return Alert.alert('경고', '로그인에 사용될 아이디를 입력해주세요.')
    } else if (password === null) {
      setMessage('비밀번호를 입력해주세요.')
      return Alert.alert('경고', '비밀번호를 입력해주세요.')
    } else if (confirmPassword === null) {
      setMessage('확인 비밀번호를 입력해주세요.')
      return Alert.alert('경고', '확인 비밀번호를 입력해주세요.')
    } else if (phoneNumber === '') {
      setMessage('전화번호를 입력해주세요.')
      return Alert.alert('경고', '전화번호를 입력해주세요.')
    } else if (!validatePhoneNumber(phoneNumber)) {
      setMessage('전화번호 형식이 맞지 않습니다.')
      return Alert.alert('경고', '전화번호 형식이 맞지 않습니다.')
    } else if (password !== confirmPassword) {
      setMessage('비밀번호가 서로 일치하지 않습니다.')
      return Alert.alert('경고', '비밀번호가 일치하지 않습니다.\n비밀번호를 확인해주세요.')
    } else if (passwordCount < 4) {
      setMessage('비밀번호는 8자 이상, 숫자와 특수문자가 포함되어야 해요.')
      return Alert.alert('경고', '비밀번호는 8자 이상, 숫자, 특수문자가 포함되어야 합니다.')
    } else {
      setMessage('양식에 맞게 작성해주세요.')
      return navigation.navigate('SignUp_StudentID', { email: email, accountID: accountID, password: password, phoneNumber: phoneNumber, })
    }
  }

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#ffffff' }, isDarkMode && { ...styles.container, backgroundColor: '#000000' }]}>
      <KeyboardAvoidingView style={{ flex: 1, }} behavior={Platform.select({ ios: 'padding' })}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', }}>
          <View style={{ marginTop: 20, }}>
            <FastImage style={{ width: 150, height: 150, }} source={require('../../../resource/logo_v1.png')} />
          </View>

          <View style={{ marginTop: 40, }}>
            <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>{message}</Text>
          </View>

          <View style={{ marginTop: 25, marginBottom: 100, }}>
            <View style={[{ ...styles.inputView, borderColor: '#E9E9E9', backgroundColor: '#E9E9E9', }, isDarkMode && { ...styles.inputView, borderColor: '#333333', backgroundColor: '#333333', }]}>
              <TextInput
                style={[{ ...styles.inputText, color: '#000000' }, isDarkMode && { ...styles.inputText, color: '#ffffff' }]}
                placeholder='아이디'
                value={accountID}
                placeholderTextColor={isDarkMode ? "#CCCCCC" : "#999999"}
                onChangeText={(text) => setAccountID(text)}
              />
            </View>

            <View style={[{ ...styles.inputView, borderColor: '#E9E9E9', backgroundColor: '#E9E9E9', }, isDarkMode && { ...styles.inputView, borderColor: '#333333', backgroundColor: '#333333', }]}>
              <TextInput
                style={[{ ...styles.inputText, color: '#000000' }, isDarkMode && { ...styles.inputText, color: '#ffffff' }]}
                placeholder='전화번호   ex) 010-xxxx-xxxx'
                keyboardType='number-pad'
                placeholderTextColor={isDarkMode ? "#CCCCCC" : "#999999"}
                onChangeText={(text) => setPhoneNumber(text)}
                value={phoneNumber.replace(/[^0-9]/g, '').replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3").replace(/(\-{1,2})$/g, "")}
              />
            </View>

            <View style={[
              { ...styles.inputView, borderColor: `${password === null || password === '' ? '#E9E9E9' : passwordColor}`, backgroundColor: '#E9E9E9', },
              isDarkMode &&
              { ...styles.inputView, borderColor: `${password === null || password === '' ? '#333333' : passwordColor}`, backgroundColor: '#333333', }
            ]}>
              <TextInput
                style={[{ ...styles.inputText, color: '#000000' }, isDarkMode && { ...styles.inputText, color: '#ffffff' }]}
                placeholder='비밀번호'
                secureTextEntry
                value={password}
                placeholderTextColor={isDarkMode ? "#CCCCCC" : "#999999"}
                onChangeText={(text) => {
                  setMessage('비밀번호는 8자 이상, 숫자와 특수문자가 포함되어야 해요.')
                  handlePasswordColor(text)
                  setPassword(text)
                }}
              />
            </View>

            <View style={[
              { ...styles.inputView, borderColor: `${confirmPassword === null || confirmPassword === '' ? '#E9E9E9' : `${password === confirmPassword ? '#008000' : '#B22222'}`}`, backgroundColor: '#E9E9E9', },
              isDarkMode &&
              { ...styles.inputView, borderColor: `${confirmPassword === null || confirmPassword === '' ? '#333333' : `${password === confirmPassword ? '#008000' : '#B22222'}`}`, backgroundColor: '#333333', }
            ]}>
              <TextInput
                style={[{ ...styles.inputText, color: '#000000' }, isDarkMode && { ...styles.inputText, color: '#ffffff' }]}
                placeholder='비밀번호 확인'
                secureTextEntry
                value={confirmPassword}
                placeholderTextColor={isDarkMode ? "#CCCCCC" : "#999999"}
                onChangeText={(text) => setConfirmPassword(text)}
              />
            </View>
          </View>
        </ScrollView>

        <View style={{ justifyContent: 'center', alignItems: 'center', }}>
          <TouchableOpacity style={{ ...styles.nextBtn, position: 'absolute', bottom: 30, }} onPress={handleNextScreen}>
            {isLoading === false ?
              <Text style={styles.nextBtnText}>다음</Text>
              :
              <ActivityIndicator size="small" color="#ffffff" />
            }
          </TouchableOpacity>
        </View>
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
  Title: {
    padding: 13,
    fontWeight: 'bold',
    fontSize: 30,
  },
  inputView: {
    width: 310,
    height: 50,
    padding: 13,
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 20,
    justifyContent: 'center',
  },
  inputText: {
    height: 50,
    color: '#000000',
  },
  nextBtn: {
    width: 310,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#EB4E45',
    justifyContent: 'center',
  },
  nextBtnText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '400',
    alignContent: 'center',
    alignItems: 'center',
  },
})