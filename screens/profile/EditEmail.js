import React, { useEffect, useState } from "react";
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal } from 'react-native';
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

  const [oldPassword, setOldPassword] = useState(null)
  const [newEmail, setNewEmail] = useState(null)

  const handelCheckEmail = async () => {
    if (newEmail === null) {
      Toast.show({
        type: 'error',
        text1: '새로운 이메일을 입력해주세요.',
      })
    } else {
      await axiosInstance.post('/register', {
        email: newEmail,
      }).then((res) => {
        setIsLoading(false)
        if (res.status === 200) {
          handleEditProfile()
        } else {
          Toast.show({
            type: 'error',
            text1: `이메일 확인 도중 예외가 발생했습니다.`,
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
            text1: `이메일을 확인하지 못했습니다.`,
            text2: `${error}`,
          })
        }
      })
    }
  }

  const handleEditProfile = async () => {
    if (newEmail === null) {
      Toast.show({
        type: 'error',
        text1: '새로운 이메일을 입력해주세요.',
      })
    } else {
      setIsLoading(true)
      try {
        const ID = await AsyncStorage.getItem('id')
        const JOB = await AsyncStorage.getItem('job')
        if (methodName === 'email') {
          await axiosInstance.post('/profile', { id: ID, job: JOB, methodName: 'edit', oldPassword: oldPassword, email: newEmail })
            .then((res) => {
              setIsLoading(false)
              if (res.status === 200) {
                Toast.show({
                  type: 'success',
                  text1: '이메일을 변경했어요.',
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
        }
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
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#f0f0f0' }, isDarkMode && { ...styles.container, backgroundColor: '#000000' },]}>
      {/* 로고 */}
      <View style={styles.logoView}>
        <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 10 } : { ...styles.backButtonView, }} onPress={() => navigation.goBack()}>
          <Text style={[{ ...styles.logoText, color: '#000000' }, isDarkMode && { ...styles.logoText, color: '#ffffff' },]}>
            {<Icon_Ionicons name="chevron-back-outline" size={21} />} 이메일 수정
          </Text>
        </TouchableOpacity>
      </View>

      {/* 스크롤 */}
      <ScrollView style={[{ ...styles.scrollContainer, backgroundColor: '#f0f0f0', }, isDarkMode && { ...styles.scrollContainer, backgroundColor: '#000000', }]}>
        {/* 개인정보 */}
        <>
          <Text style={styles.InfoTopText}>비밀번호</Text>
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

          <Text style={styles.InfoTopText}>개인정보</Text>
          <View style={[{ ...styles.Info, backgroundColor: '#ffffff', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
            <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>새로운 이메일</Text>
            <TextInput
              style={styles.Value}
              placeholder={placeholder}
              onChangeText={(text) => setNewEmail(text)}
              value={newEmail}
              editable={true}
            />
            <View style={{ width: '100%', height: 1, backgroundColor: 'gray' }}></View>
          </View>

          <View style={{ marginBottom: 100, }}></View>
        </>
      </ScrollView>

      {/* 요청 */}
      <TouchableOpacity style={styles.checkBtnContainer} onPress={handelCheckEmail}>
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