import React, { useEffect, useState } from "react";
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal } from 'react-native';
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

  const [oldPassword, setOldPassword] = useState(null)
  const [newPassword, setNewPassword] = useState(null)
  const [confirmNewPassword, setConfirmNewPassword] = useState(null)

  const [passwordCount, setPasswordCount] = useState(0)

  const handlePassword = (text) => {
    let count = 0

    if (isPasswordLengthValid(text)) count += 1

    if (isPasswordComplex(text)) count += 2

    if (!isCommonPassword(text)) count += 1

    setPasswordCount(count)

    if (count < 4) {
      Toast.show({
        type: 'error',
        text1: '비밀번호는 8자 이상, 숫자, 특수문자가 포함되어야 합니다.',
      })
    } else {
      Toast.show({
        type: 'success',
        text1: '비밀번호가 안전합니다.',
      })
    }
  }

  const handleEditProfile = async () => {
    if (oldPassword === null) {
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
    } else if (passwordCount < 4){
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
        await axiosInstance.post('/profile', { id: ID, job: JOB, methodName: 'edit', oldPassword: oldPassword, newPassword: newPassword })
          .then((res) => {
            setIsLoading(false)
            if (res.status === 200) {
              Toast.show({
                type: 'success',
                text1: '비밀번호를 변경했어요.',
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
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#f0f0f0' }, isDarkMode && { ...styles.container, backgroundColor: '#000000' },]}>
      {/* 로고 */}
      <View style={styles.logoView}>
        <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 10 } : { ...styles.backButtonView, }} onPress={() => navigation.goBack()}>
          <Text style={[{ ...styles.logoText, color: '#000000' }, isDarkMode && { ...styles.logoText, color: '#ffffff' },]}>
            {<Icon_Ionicons name="chevron-back-outline" size={21} />} 비밀번호 수정
          </Text>
        </TouchableOpacity>
      </View>

      {/* 스크롤 */}
      <ScrollView style={[{ ...styles.scrollContainer, backgroundColor: '#f0f0f0', }, isDarkMode && { ...styles.scrollContainer, backgroundColor: '#000000', }]}>
        {/* 개인정보 */}
        <>
          <Text style={styles.InfoTopText}>현재 비밀번호</Text>
          <View style={[{ ...styles.Info, backgroundColor: '#ffffff', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
            <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>현재 비밀번호</Text>
            <TextInput
              style={styles.Value}
              placeholder={oldPassword}
              onChangeText={(text) => setOldPassword(text)}
              secureTextEntry={true}
              value={oldPassword}
              editable={true}
            />
            <View style={{ width: '100%', height: 1, backgroundColor: 'gray' }}></View>
          </View>
        </>

        <>
          <Text style={styles.InfoTopText}>새로운 비밀번호</Text>
          <View style={[{ ...styles.Info, backgroundColor: '#ffffff', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
            <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>새로운 비밀번호</Text>
            <TextInput
              style={styles.Value}
              placeholder={newPassword}
              onChangeText={(text) => {
                setNewPassword(text)
                handlePassword(text)
              }}
              secureTextEntry={true}
              value={newPassword}
              editable={true}
            />
            <View style={{ width: '100%', height: 1, backgroundColor: 'gray' }}></View>

            <View style={{ marginBottom: 15 }}></View>

            <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>새로운 비밀번호 확인</Text>
            <TextInput
              style={styles.Value}
              placeholder={confirmNewPassword}
              onChangeText={(text) => setConfirmNewPassword(text)}
              secureTextEntry={true}
              value={confirmNewPassword}
              editable={true}
            />
            <View style={{ width: '100%', height: 1, backgroundColor: 'gray' }}></View>
          </View>

          <View style={{ marginBottom: 100, }}></View>
        </>
      </ScrollView>

      {/* 요청 */}
      <TouchableOpacity style={styles.checkBtnContainer} onPress={handleEditProfile}>
        {isLoading === false ?
          <Text style={styles.checkBtnText}>{<Icon_Feather name="check" size={17} />} 확인</Text>
          :
          <ActivityIndicator size="small" color="white" />
        }
      </TouchableOpacity>
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
  Info: {
    padding: 20,
    borderRadius: 25,
    marginBottom: 20,
    width: '100%',
  },
  InfoTopText: {
    color: 'gray',
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 5,
  },
  Title: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '400',
    marginLeft: 5,
  },
  Value: {
    color: '#4682b4',
    fontSize: 14,
    marginLeft: 5,
    width: '100%',
    height: 40,
  },
  rankView: {
    width: '100%',
    height: 1,
    marginTop: 15,
    marginBottom: 15,
    backgroundColor: 'gray',
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