import React, { useEffect, useState } from "react";
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal, KeyboardAvoidingView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from 'react-native-toast-message';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

import axiosInstance from "../../api/API_Server";

export default function EditProfile({ navigation }) {
  const route = useRoute()

  const isDarkMode = useColorScheme() === 'dark'
  const [isLoading, setIsLoading] = useState(false)

  const [methodName, setMethodName] = useState(null)
  const [Title, setTitle] = useState('프로필 수정')
  const [placeholder, setPlaceholder] = useState('이곳에 적어주세요.')

  const [oldPassword, setOldPassword] = useState('')
  const [oldFirstName, setOldFirstName] = useState('')
  const [oldLastName, setOldLastName] = useState('')

  const [newAccountID, setNewAccountID] = useState('')
  const [newPhoneNumber, setNewPhoneNumber] = useState('')
  const [newFirstName, setNewFirstName] = useState('')
  const [newLastName, setNewLastName] = useState('')

  const handleEditProfile = async (data) => {
    setIsLoading(true)
    const ID = await AsyncStorage.getItem('id')
    const JOB = await AsyncStorage.getItem('job')

    await axiosInstance.post('/v2/profile', { id: ID, job: JOB, methodName: 'edit', data: data, })
      .then((res) => {
        setIsLoading(false)
        if (res.status === 200) {
          Toast.show({
            type: 'success',
            text1: `${res.data.message}`,
            position: 'bottom',
          })
          navigation.goBack()
        } else {
          Toast.show({
            type: 'error',
            text1: '프로필을 변경하지 못했어요.',
            text2: '다시 시도해 주세요.',
            position: 'bottom',
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
              position: 'bottom',
            })
          } else if (res.status === 500) {
            Toast.show({
              type: 'error',
              text1: `${res.data.errorDescription}`,
              text2: `${res.data.error}`,
              position: 'bottom',
            })
          } else {
            Toast.show({
              type: 'error',
              text1: '서버와 연결할 수 없습니다.',
              text2: '다시 시도해 주세요.',
              position: 'bottom',
            })
          }
        } else {
          Toast.show({
            type: 'error',
            text1: '서버와 연결할 수 없습니다.',
            position: 'bottom',
          })
        }
      })
  }

  const handleCheckData = async () => {
    if (oldPassword === '') {
      Toast.show({
        type: 'error',
        text1: '현재 비밀번호를 입력해주세요.',
        position: 'bottom',
      })
    } else {
      setIsLoading(true)
      try {
        if (methodName === 'accountID') {
          if (newAccountID === '') {
            setIsLoading(false)
            Toast.show({
              type: 'error',
              text1: '새로운 아이디를 입력하지 않았습니다.',
              position: 'bottom',
            })
          } else {
            const data = {
              oldPassword: oldPassword,
              accountID: newAccountID,
            }
            handleEditProfile(data)
          }
        } else if (methodName === 'phoneNumber') {
          if (newPhoneNumber === '') {
            setIsLoading(false)
            Toast.show({
              type: 'error',
              text1: '새로운 전화번호를 입력하지 않았습니다.',
              position: 'bottom',
            })
          } else if (!validatePhoneNumber(newPhoneNumber)) {
            setIsLoading(false)
            Toast.show({
              type: 'error',
              text1: '전화번호 형식이 맞지 않습니다.',
              text2: '숫자만 입력해주세요.',
              position: 'bottom',
            })
          } else {
            const data = {
              oldPassword: oldPassword,
              phoneNumber: newPhoneNumber,
            }
            handleEditProfile(data)
          }
        } else if (methodName === 'name') {
          if (newFirstName === '' || newLastName === '') {
            setIsLoading(false)
            Toast.show({
              type: 'error',
              text1: '성 또는 이름을 입력하지 않았습니다.',
              position: 'bottom',
            })
          } else {
            const data = {
              oldPassword: oldPassword,
              firstName: newFirstName,
              lastName: newLastName,
            }
            handleEditProfile(data)
          }
        } else if (methodName === 'community_nickname') {
          if (newFirstName === '') {
            setIsLoading(false)
            Toast.show({
              type: 'error',
              text1: '새로운 닉네임을 입력하지 않았습니다.',
              position: 'bottom',
            })
          } else {
            const data = {
              oldPassword: oldPassword,
              firstName: newFirstName,
            }
            handleEditProfile(data)
          }
        }
      } catch (error) {
        setIsLoading(false)
        Toast.show({
          type: 'error',
          text1: '프로필을 변경하지 못했어요.',
          text2: `${error}`,
          position: 'bottom',
        })
      }
    }
  }

  const handleSetMethod = () => {
    const { methodName, accountID, phoneNumber, firstName, lastName, nickname } = route.params
    setMethodName(methodName)
    if (methodName === 'accountID') {
      setTitle('아이디 변경')
      setPlaceholder(accountID)
    } else if (methodName === 'phoneNumber') {
      setTitle('전화번호 변경')
      setPlaceholder(phoneNumber)
    } else if (methodName === 'name') {
      setTitle('이름 변경')
      setPlaceholder(firstName + lastName)
      setOldFirstName(firstName)
      setOldLastName(lastName)
    } else if (methodName === 'community_nickname') {
      setTitle('닉네임 변경')
      setPlaceholder(nickname)
      setOldFirstName(nickname)
    } else {
      Toast.show({
        type: 'error',
        text1: '나중에 다시 시도해보세요.',
        position: 'bottom',
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
              {<Icon_Ionicons name="chevron-back-outline" size={21} />} {Title}
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

          {methodName === 'accountID' &&
            <>
              <Text style={{ marginTop: 10, color: isDarkMode ? '#999999' : '#666666', marginLeft: 20, marginBottom: 7, }}>아이디</Text>
              <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                <View style={{ ...styles.inputView, borderColor: isDarkMode ? '#333333' : '#E9E9E9', backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
                  <TextInput
                    style={{ ...styles.inputText, color: isDarkMode ? '#ffffff' : '#000000', }}
                    placeholder={placeholder}
                    placeholderTextColor={isDarkMode ? '#CCCCCC' : '#999999'}
                    value={newAccountID}
                    editable={true}
                    onChangeText={(text) => setNewAccountID(text)}
                  />
                </View>
              </View>
            </>
          }
          {methodName === 'phoneNumber' &&
            <>
              <Text style={{ marginTop: 10, color: isDarkMode ? '#999999' : '#666666', marginLeft: 20, marginBottom: 7, }}>전화번호</Text>
              <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                <View style={{ ...styles.inputView, borderColor: isDarkMode ? '#333333' : '#E9E9E9', backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
                  <TextInput
                    style={{ ...styles.inputText, color: isDarkMode ? '#ffffff' : '#000000', }}
                    placeholder={placeholder}
                    placeholderTextColor={isDarkMode ? '#CCCCCC' : '#999999'}
                    value={newPhoneNumber.replace(/[^0-9]/g, '').replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3").replace(/(\-{1,2})$/g, "")}
                    keyboardType='number-pad'
                    editable={true}
                    onChangeText={(text) => setNewPhoneNumber(text)}
                  />
                </View>
              </View>
            </>
          }
          {methodName === 'name' &&
            <>
              <Text style={{ marginTop: 10, color: isDarkMode ? '#999999' : '#666666', marginLeft: 20, marginBottom: 7, }}>이름</Text>
              <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                <View style={{ ...styles.inputView, borderColor: isDarkMode ? '#333333' : '#E9E9E9', backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
                  <TextInput
                    style={{ ...styles.inputText, color: isDarkMode ? '#ffffff' : '#000000', }}
                    placeholder={oldFirstName}
                    placeholderTextColor={isDarkMode ? '#CCCCCC' : '#999999'}
                    value={newFirstName}
                    editable={true}
                    onChangeText={(text) => setNewFirstName(text)}
                  />
                </View>
              </View>

              <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center', }}>
                <View style={{ ...styles.inputView, borderColor: isDarkMode ? '#333333' : '#E9E9E9', backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
                  <TextInput
                    style={{ ...styles.inputText, color: isDarkMode ? '#ffffff' : '#000000', }}
                    placeholder={oldLastName}
                    placeholderTextColor={isDarkMode ? '#CCCCCC' : '#999999'}
                    value={newLastName}
                    secureTextEntry={true}
                    onChangeText={(text) => setNewLastName(text)}
                  />
                </View>
              </View>
            </>
          }
          {methodName === 'community_nickname' &&
            <>
              <Text style={{ marginTop: 10, color: isDarkMode ? '#999999' : '#666666', marginLeft: 20, marginBottom: 7, }}>닉네임</Text>
              <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                <View style={{ ...styles.inputView, borderColor: isDarkMode ? '#333333' : '#E9E9E9', backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
                  <TextInput
                    style={{ ...styles.inputText, color: isDarkMode ? '#ffffff' : '#000000', }}
                    placeholder={placeholder}
                    placeholderTextColor={isDarkMode ? '#CCCCCC' : '#999999'}
                    value={newFirstName}
                    editable={true}
                    onChangeText={(text) => setNewFirstName(text)}
                  />
                </View>
              </View>

              <View style={{ marginTop: 10, paddingLeft: 20, paddingRight: 20, }}>
                <Text style={[{ color: '#333333' }, isDarkMode && { color: '#999999' }]}>
                  부적절한 닉네임을 사용거나 규칙 위반 시 커뮤니티 이용이 제한될 수 있어요.
                </Text>
              </View>
            </>
          }

          <View style={{ marginBottom: 100, }}></View>
        </ScrollView>

        {/* 요청 */}
        <TouchableOpacity style={styles.checkBtnContainer} onPress={handleCheckData}>
          {isLoading === false ?
            <Text style={styles.checkBtnText}>{<Icon_Feather name="check" size={17} />} 확인</Text>
            :
            <ActivityIndicator size="small" color="white" />
          }
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function validatePhoneNumber(phoneNumber) {
  const pattern = /^010-\d{4}-\d{4}$/
  return pattern.test(phoneNumber)
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