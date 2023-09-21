import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, KeyboardAvoidingView, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Image, Modal } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import FastImage from 'react-native-fast-image';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';

import axiosInstance from "../../api/API_Server";

export default function SignUp_Email({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'

  const [isLoading, setIsLoading] = useState(false)

  const [email, setEmail] = useState('')

  const [message, setMessage] = useState('이메일을 알려주세요.')

  const handelCheckEmail = async () => {
    if (email === '') {
      setMessage('이메일을 입력해주세요.')
      return Alert.alert('경고', '이메일이 비어있습니다.')
    } else {
      await axiosInstance.post('/register', {
        email: email,
      }).then((res) => {
        setIsLoading(false)
        if (res.status === 200) {
          setMessage('이메일을 알려주세요.')
          //return navigation.navigate('SignUp_Account', { email: email })
        } else {
          setMessage('다시 시도해 주세요.')
          return Alert.alert('에러', '이메일 확인 도중 예외가 발생했습니다.')
        }
      }).catch((error) => {
        setIsLoading(false)
        const res = error.response
        if (res.status === 400) {
          setMessage('이메일을 확인해주세요.')
          return Alert.alert(res.data.error, res.data.errorDescription)
        } else if (res.status === 500) {
          setMessage('다시 시도해 주세요.')
          return Alert.alert(res.data.error, res.data.errorDescription)
        } else {
          console.log('SignUp API | ', error)
          setMessage(error)
          return Alert.alert('에러', '이메일 확인 도중 예외가 발생했습니다.')
        }
      })
    }
  }

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#ffffff' }, isDarkMode && { ...styles.container, backgroundColor: '#000000' }]}>
      <KeyboardAvoidingView style={{ flex: 1, }} behavior={Platform.select({ ios: 'padding' })}>
        {/* 로고 */}
        <View style={styles.logoView}>
          <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 50 } : { ...styles.backButtonView, }}
            onPress={() => navigation.goBack()}
          >
            <Text style={[{ ...styles.logoText, color: '#000000' }, isDarkMode && { ...styles.logoText, color: '#ffffff' },]}>
              {<Icon_Ionicons name="chevron-back-outline" size={25} />}
            </Text>
          </TouchableOpacity>
          {/* 제목 */}
          <Text style={[{ ...styles.logo, color: '#000000', }, isDarkMode && { ...styles.logo, color: '#ffffff', }]}>회원가입</Text>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', }}>
          <View style={{ marginTop: 60, marginBottom: 100, }}>
            <View style={[{ ...styles.inputView, borderColor: '#E9E9E9', backgroundColor: '#E9E9E9', }, isDarkMode && { ...styles.inputView, borderColor: '#333333', backgroundColor: '#333333', }]}>
              <TextInput
                style={[{ ...styles.inputText, color: '#000000' }, isDarkMode && { ...styles.inputText, color: '#ffffff' }]}
                placeholder='이메일'
                value={email}
                placeholderTextColor={isDarkMode ? "#CCCCCC" : "#999999"}
                onChangeText={(text) => setEmail(text)}
              />
            </View>
            {/* <Text style={{ marginTop: 10, color: '#666666', textAlign: 'center', fontSize: 12 }}>이메일로 아이디가 자동으로 추가되어요. (변경 가능)</Text> */}
          </View>
        </ScrollView>

        <View style={{ justifyContent: 'center', alignItems: 'center', }}>
          <TouchableOpacity style={{ ...styles.nextBtn, position: 'absolute', bottom: 30, }} onPress={handelCheckEmail}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoView: {
    height: 60,
    justifyContent: 'center',
  },
  logo: {
    fontSize: 33,
    fontWeight: 'bold',
    top: 50,
    left: 25,
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
    width: 370,
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