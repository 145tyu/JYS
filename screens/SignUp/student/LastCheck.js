import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, KeyboardAvoidingView, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Image, Modal } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-toast-message';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';

import axiosInstance from "../../../api/API_Server";

export default function S_SignUp_LastCheck({ navigation }) {
  const route = useRoute()
  const { data } = route.params

  const isDarkMode = useColorScheme() === 'dark'
  const [isLoading, setIsLoading] = useState(false)

  const [birthday, setBirthday] = useState(data.birthday)

  const handleNextScreen = async () => {
    setIsLoading(true)
    if (birthday === '' || birthday.replace(/\./g, '').length != 8) {
      setIsLoading(false)
      Toast.show({
        type: 'error',
        text1: '생년월일은 xxxx.xx.xx와 같이 작성해 주세요.',
      })
    } else {
      const tempData = {
        email: data.email,
        accountID: data.accountID,
        password: data.password,
        phoneNumber: data.phoneNumber,
        studentID: `${data._grade}${data._class}${data._number}`,
        firstName: data.firstName,
        lastName: data.lastName,
        birthday: birthday,
      }
      await axiosInstance.post('/register', { SubscriptionForm: tempData, })
        .then((res) => {
          setIsLoading(false)
          if (res.status === 200) {
            return navigation.navigate('SignUp_Success')
          } else {
            Toast.show({
              type: 'error',
              text1: '문제가 발생했어요.',
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
              text1: '서버와 연결할 수 없습니다.',
              text2: '다시 시도해 주세요.',
            })
          }
        })
    }
  }

  return (
    <SafeAreaView style={{ ...styles.container, backgroundColor: isDarkMode ? '#000000' : '#ffffff', }}>
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
          <Text style={{ ...styles.Title, color: isDarkMode ? '#ffffff' : '#000000', }}>정보가 맞는지 확인해 주세요.</Text>
        </View>

        <Text style={{ color: isDarkMode ? '#999999' : '#666666', marginLeft: 25, marginBottom: 7, }}>이메일</Text>
        <View style={{ justifyContent: 'center', alignItems: 'center', }}>
          <View style={{ ...styles.inputView, borderColor: isDarkMode ? '#333333' : '#E9E9E9', backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
            <Text style={{ color: isDarkMode ? '#ffffff' : '#000000', }}>{data.email}</Text>
          </View>
        </View>

        <Text style={{ marginTop: 10, color: isDarkMode ? '#999999' : '#666666', marginLeft: 25, marginBottom: 7, }}>아이디</Text>
        <View style={{ justifyContent: 'center', alignItems: 'center', }}>
          <View style={{ ...styles.inputView, borderColor: isDarkMode ? '#333333' : '#E9E9E9', backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
            <Text style={{ color: isDarkMode ? '#ffffff' : '#000000', }}>{data.accountID}</Text>
          </View>
        </View>

        <Text style={{ marginTop: 10, color: isDarkMode ? '#999999' : '#666666', marginLeft: 25, marginBottom: 7, }}>전화번호</Text>
        <View style={{ justifyContent: 'center', alignItems: 'center', }}>
          <View style={{ ...styles.inputView, borderColor: isDarkMode ? '#333333' : '#E9E9E9', backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
            <Text style={{ color: isDarkMode ? '#ffffff' : '#000000', }}>{data.phoneNumber != null && data.phoneNumber.replace(/[^0-9]/g, '').replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3").replace(/(\-{1,2})$/g, "")}</Text>
          </View>
        </View>

        <Text style={{ marginTop: 10, color: isDarkMode ? '#999999' : '#666666', marginLeft: 25, marginBottom: 7, }}>생년월일</Text>
        <View style={{ justifyContent: 'center', alignItems: 'center', }}>
          <View style={{ ...styles.inputView, borderColor: `${birthday === '' ? isDarkMode ? '#333333' : '#E9E9E9' : `${birthday.replace(/\./g, '').length != 8 ? '#B22222' : isDarkMode ? '#333333' : '#E9E9E9'}`}`, backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
            <TextInput
              style={{ ...styles.inputText, color: isDarkMode ? '#ffffff' : '#000000', }}
              placeholder='생년월일   ex) xxxx.xx.xx'
              placeholderTextColor={isDarkMode ? '#CCCCCC' : '#999999'}
              value={birthday.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3')}
              keyboardType='number-pad'
              onChangeText={(text) => {
                setBirthday(text)
              }}
            />
          </View>
          {birthday != '' && birthday.replace(/\./g, '').length != 8 &&
            <Text style={{ marginTop: 3, textAlign: 'left', fontSize: 13, color: isDarkMode ? '#ffffff' : '#000000', }}>생년월일은 xxxx.xx.xx와 같이 작성해 주세요.</Text>
          }
        </View>

        <Text style={{ marginTop: 10, color: isDarkMode ? '#999999' : '#666666', marginLeft: 25, marginBottom: 7, }}>학년정보</Text>
        <View style={{ justifyContent: 'center', alignItems: 'center', }}>
          <View style={{ ...styles.inputView, borderColor: isDarkMode ? '#333333' : '#E9E9E9', backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
            <Text style={{ color: isDarkMode ? '#ffffff' : '#000000', }}>{`${data._grade}학년 ${data._class}반 ${data._number}번`}</Text>
          </View>
        </View>

        <Text style={{ marginTop: 10, color: isDarkMode ? '#999999' : '#666666', marginLeft: 25, marginBottom: 7, }}>이름</Text>
        <View style={{ justifyContent: 'center', alignItems: 'center', }}>
          <View style={{ ...styles.inputView, borderColor: isDarkMode ? '#333333' : '#E9E9E9', backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
            <Text style={{ color: isDarkMode ? '#ffffff' : '#000000', }}>{`${data.firstName}${data.lastName}`}</Text>
          </View>
        </View>

        <View style={{ marginBottom: 200, }}></View>
      </ScrollView>

      <View style={{ justifyContent: 'center', alignItems: 'center', }}>
        <TouchableOpacity onPress={() => handleNextScreen()} disabled={birthday === '' ? true : false} style={{ ...styles.button, position: 'absolute', bottom: 30, backgroundColor: birthday === '' ? '#D46A66' : '#EB4E45', }}>
          {isLoading === false ?
            <Text style={styles.buttonText}>가입하기</Text>
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