import React, { useEffect, useState } from "react";
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

import axiosInstance from "../../api/API_Server";

export default function EditPassword({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'

  const [isLoading, setIsLoading] = useState(false)

  const [oldPassword, setOldPassword] = useState(null)
  const [newPassword, setNewPassword] = useState(null)
  const [confirmNewPassword, setConfirmNewPassword] = useState(null)

  const handleEditProfile = async () => {
    if (oldPassword === null) {
      return Alert.alert('정보', '현재 비밀번호를 입력해주세요.')
    } else if (newPassword !== confirmNewPassword) {
      return Alert.alert('정보', '새로운 비밀번호가 일치하지 않습니다.\n비밀번호를 확인해주세요.')
    } else {
      setIsLoading(true)
      try {
        const ID = await AsyncStorage.getItem('id')
        const JOB = await AsyncStorage.getItem('job')
        await axiosInstance.post('/profile', { id: ID, job: JOB, methodName: 'edit', oldPassword: oldPassword, newPassword: newPassword })
          .then((res) => {
            setIsLoading(false)
            if (res.status === 200) {
              return Alert.alert('성공', '비밀번호를 성공적으로 수정했어요.', [
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
      } catch (error) {
        setIsLoading(false)
        console.log('ProfileEdit API |', error)
        return Alert.alert('정보', '서버와 연결할 수 없습니다.', [
          { text: '확인' },
        ])
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
              onChangeText={(text) => setNewPassword(text)}
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