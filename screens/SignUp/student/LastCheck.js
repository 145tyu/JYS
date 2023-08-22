import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, KeyboardAvoidingView, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Image, Modal } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import FastImage from 'react-native-fast-image';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';

import axiosInstance from "../../../api/API_Server";

export default function S_SignUp_LastCheck({ navigation }) {
  const route = useRoute()
  const { email, accountID, password, phoneNumber, _grade, _class, _number, firstName, lastName, birthday } = route.params

  const isDarkMode = useColorScheme() === 'dark'

  const [isLoading, setIsLoading] = useState(false)

  const [message, setMessage] = useState('양식을 확인해 주세요.')

  const [_birthday, setBirthday] = useState(birthday)

  const handelUpdateMessage = () => {
    if (_birthday === '' || _birthday.replace(/\./g, '').length != 8) {
      setMessage('생년월일은 xxxx.xx.xx와 같이 작성해 주세요.')
    } else {
      setMessage('양식을 확인해 주세요.')
    }
  }

  const handleNextScreen = async () => {
    setIsLoading(true)
    setMessage('잠시만 기다려주세요...')
    if (_birthday === '' || _birthday.replace(/\./g, '').length != 8) {
      setIsLoading(false)
      setMessage('생년월일은 xxxx.xx.xx와 같이 작성해 주세요.')
      return Alert.alert('경고', '생일을 올바르게 입력했는지 확인해주세요.')
    } else {
      await axiosInstance.post('/register', {
        email: email,
        accountID: accountID,
        password: password,
        phoneNumber: phoneNumber,
        studentID: `${_grade}${_class}${_number}`,
        firstName: firstName,
        lastName: lastName,
        birthday: _birthday,
      }).then((res) => {
        setIsLoading(false)
        if (res.status === 200) {
          return navigation.navigate('SignUp_Success')
        } else {
          setMessage('문제가 발생했어요.')
          return Alert.alert('실패', '문제가 발생했어요.\n다시 시도해 주세요.')
        }
      }).catch((error) => {
        setIsLoading(false)
        setMessage('문제가 발생했어요.')
        const res = error.response
        if (res.status === 400) {
          return Alert.alert(res.data.error, res.data.errorDescription)
        } else if (res.status === 500) {
          return Alert.alert(res.data.error, res.data.errorDescription)
        } else {
          console.log('register API | ', error)
          return Alert.alert('실패', '문제가 발생했어요.\n다시 시도해 주세요.')
        }
      })
    }
  }

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#ffffff' }, isDarkMode && { ...styles.container, backgroundColor: '#000000' }]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', }}>
        <View style={{ marginTop: 20, }}>
          <FastImage style={{ width: 150, height: 150, }} source={require('../../../resource/logo_v1.png')} />
        </View>

        <View style={{ marginTop: 40, paddingLeft: 17, paddingRight: 17, }}>
          <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>{message}</Text>
        </View>

        <View style={{ marginTop: 25, marginBottom: 100, }}>

          <Text style={[{ color: '#666666', marginLeft: 5, marginBottom: 7, }, isDarkMode && { color: '#999999', marginLeft: 5, marginBottom: 7, }]}>이메일</Text>
          <View style={[{ ...styles.inputView, borderColor: '#E9E9E9', backgroundColor: '#E9E9E9', }, isDarkMode && { ...styles.inputView, borderColor: '#333333', backgroundColor: '#333333', }]}>
            <Text style={[{ color: '#000000' }, isDarkMode && { color: '#ffffff' }]}>
              {email}
            </Text>
          </View>

          <Text style={[{ color: '#666666', marginLeft: 5, marginBottom: 7, }, isDarkMode && { color: '#999999', marginLeft: 5, marginBottom: 7, }]}>아아디</Text>
          <View style={[{ ...styles.inputView, borderColor: '#E9E9E9', backgroundColor: '#E9E9E9', }, isDarkMode && { ...styles.inputView, borderColor: '#333333', backgroundColor: '#333333', }]}>
            <Text style={[{ color: '#000000' }, isDarkMode && { color: '#ffffff' }]}>
              {accountID}
            </Text>
          </View>

          <Text style={[{ color: '#666666', marginLeft: 5, marginBottom: 7, }, isDarkMode && { color: '#999999', marginLeft: 5, marginBottom: 7, }]}>전화번호</Text>
          <View style={[{ ...styles.inputView, borderColor: '#E9E9E9', backgroundColor: '#E9E9E9', }, isDarkMode && { ...styles.inputView, borderColor: '#333333', backgroundColor: '#333333', }]}>
            <Text style={[{ color: '#000000' }, isDarkMode && { color: '#ffffff' }]}>
              {phoneNumber.replace(/[^0-9]/g, '').replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3").replace(/(\-{1,2})$/g, "")}
            </Text>
          </View>

          <Text style={[{ color: '#666666', marginLeft: 5, marginBottom: 7, }, isDarkMode && { color: '#999999', marginLeft: 5, marginBottom: 7, }]}>생일</Text>
          <View style={[{ ...styles.inputView, borderColor: '#E9E9E9', backgroundColor: '#E9E9E9', }, isDarkMode && { ...styles.inputView, borderColor: '#333333', backgroundColor: '#333333', }]}>
            <TextInput
              style={[{ ...styles.inputText, color: '#000000' }, isDarkMode && { ...styles.inputText, color: '#ffffff' }]}
              placeholder='생일'
              keyboardType='number-pad'
              placeholderTextColor={isDarkMode ? "#CCCCCC" : "#999999"}
              onChangeText={(text) => {
                setBirthday(text)
                handelUpdateMessage()
              }}
              value={_birthday.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3')}
            />
          </View>

          <Text style={[{ color: '#666666', marginLeft: 5, marginBottom: 7, }, isDarkMode && { color: '#999999', marginLeft: 5, marginBottom: 7, }]}>학번</Text>
          <View style={[{ ...styles.inputView, borderColor: '#E9E9E9', backgroundColor: '#E9E9E9', }, isDarkMode && { ...styles.inputView, borderColor: '#333333', backgroundColor: '#333333', }]}>
            <Text style={[{ color: '#000000' }, isDarkMode && { color: '#ffffff' }]}>
              {`${_grade}${_class}${_number}`}
            </Text>
          </View>

          <Text style={[{ color: '#666666', marginLeft: 5, marginBottom: 7, }, isDarkMode && { color: '#999999', marginLeft: 5, marginBottom: 7, }]}>이름</Text>
          <View style={[{ ...styles.inputView, borderColor: '#E9E9E9', backgroundColor: '#E9E9E9', }, isDarkMode && { ...styles.inputView, borderColor: '#333333', backgroundColor: '#333333', }]}>
            <Text style={[{ color: '#000000' }, isDarkMode && { color: '#ffffff' }]}>
              {`${firstName}${lastName}`}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={{ justifyContent: 'center', alignItems: 'center', }}>
        <TouchableOpacity style={{ ...styles.nextBtn, position: 'absolute', bottom: 30, }} onPress={handleNextScreen}>
          {isLoading === false ?
            <Text style={styles.nextBtnText}>가입하기</Text>
            :
            <ActivityIndicator size="small" color="#ffffff" />
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView >
  )
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
    marginBottom: 10,
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