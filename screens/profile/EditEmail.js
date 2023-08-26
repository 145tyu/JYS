import React, { useEffect, useState } from "react";
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  const handleEditProfile = async () => {
    if (newEmail === null) {
      return Alert.alert('정보', '새로운 이메일을 입력해주세요.')
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
                return Alert.alert('성공', '이메일을 성공적으로 수정했어요.', [
                  {
                    text: '확인',
                    onPress: () => { navigation.goBack() }
                  }
                ])
              } else {
                Alert.alert('에러', '서버와 연결할 수 없습니다.')
              }
            }).catch((error) => {
              setIsLoading(false)
              console.log(error)
              if (error.response) {
                const res = error.response
                if (res.status === 400) {
                  return Alert.alert(res.data.error, res.data.errorDescription, [
                    { text: '확인' },
                  ])
                } else if (res.status === 500) {
                  return Alert.alert(res.data.error, res.data.errorDescription, [
                    { text: '확인' },
                  ])
                } else {
                  return Alert.alert('정보', '서버와 연결할 수 없습니다.', [
                    { text: '확인' },
                  ])
                }
              } else {
                return Alert.alert('정보', '서버와 연결할 수 없습니다.', [
                  { text: '확인' },
                ])
              }
            })
        }
      } catch (error) {
        setIsLoading(false)
        console.log('ProfileEdit API |', error)
        return Alert.alert('정보', '서버와 연결할 수 없습니다.', [
          { text: '확인' },
        ])
      }
    }
  }

  const handleSetMethod = () => {
    const { methodName, email } = route.params
    setMethodName(methodName)
    if (methodName === 'email') {
      setPlaceholder(email)
    } else {
      return Alert.alert('에러', '나중에 다시 시도해보세요.', [
        {
          text: '확인',
          onPress: () => { navigation.goBack() }
        }
      ])
    }
  }

  useEffect(() => {
    handleSetMethod()
  }, [])

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#f0f0f0' }, isDarkMode && { ...styles.container, backgroundColor: '#000000' },]}>
      {/* 로고 */}
      <View style={styles.logoView}>
        <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 50 } : { ...styles.backButtonView, }} onPress={() => navigation.goBack()}>
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