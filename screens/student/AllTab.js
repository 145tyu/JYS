import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal } from 'react-native';
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import DeviceInfo from 'react-native-device-info';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

import axiosInstance from "../../api/API_Server";

const appVersion = DeviceInfo.getVersion() // 앱 버전 가져오기
const buildNumber = DeviceInfo.getBuildNumber() // 빌드 번호 가져오기

export default function StudentAllTab({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'

  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const [developerModeCount, setDeveloperModeCount] = useState(0)

  const [profileStateType, setProfileStateType] = useState(null)

  const handelTestAPI = async () => {
    await axiosInstance.post('/',)
      .then((res) => {
        console.log(res.data)
      }).catch((error) => {
        console.log(error)
      })
  }

  const handleProfile = async () => {
    try {
      const ID = await AsyncStorage.getItem('id')
      const JOB = await AsyncStorage.getItem('job')

      await axiosInstance.post('/profile', { id: ID, job: JOB })
        .then((res) => {
          if (res.status === 200) {
            setProfileStateType(1)
            setEmail(res.data.email)
            setFirstName(res.data.firstName)
            setLastName(res.data.lastName)
          } else {
            return Alert.alert('정보', '계정 인증 도중 예외가 발생했습니다.\n', [
              {
                text: '다시시도',
                onPress: () => {
                  handleProfile()
                }
              },
              {
                text: '확인',
              }
            ])
          }
        }).catch((error) => {
          setProfileStateType(2)
          console.log('Profile API |', error)
          const res = error.response
          if (res.status === 400) {
            AsyncStorage.clear() // 앱 데이터 모두 삭제
            Alert.alert(res.data.error, res.data.errorDescription)
            return navigation.dispatch( // 'Login' 스크린으로 이동하고 기존에 있던 모든 스크린을 삭제
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }]
              })
            )
          } else {
            return Alert.alert('에러', '오류가 발생했습니다.\n나중에 다시 시도해 주세요.', [
              {
                text: '다시시도',
                onPress: () => {
                  handleProfile()
                },
              },
              {
                text: '확인',
              }
            ])
          }
        })
    } catch (error) {
      setProfileStateType(2)
      console.log('Profile API |', error)
      return Alert.alert('에러', '오류가 발생했습니다.\n나중에 다시 시도해 주세요.', [
        {
          text: '다시시도',
          onPress: () => {
            handleProfile()
          },
        },
        {
          text: '확인',
        }
      ])
    }
  }

  const developerMode = AsyncStorage.getItem('developerMode')
    .then((res) => {
      //console.log(res)
      if (res !== 'developer') {
        //console.log('개발자 모드가 활성화 되어있지 않습니다.')
      }
    })

  const handelDeveloperModeActivation = async () => {
    //console.log(developerModeCount)
    if (developerModeCount >= 5) {
      if (developerMode == 'developer') {
        //Alert.alert('개발자 모드', '개발자 모드를 비활성화 했습니다.')
        //AsyncStorage.setItem('developerMode', 'developer') //개발자 모드 활성화 데이터
        //setDeveloperModeCount(0)
      } else {
        //Alert.alert('개발자 모드', '개발자 모드를 활성화 했습니다.')
        //AsyncStorage.setItem('developerMode', 'developer') //개발자 모드 활성화 데이터
        //setDeveloperModeCount(0)
      }
    } else {
      //const temp = developerModeCount + 1
      //setDeveloperModeCount(temp)
    }
  }

  useEffect(() => {
    handleProfile() // 스크린이 처음 시작될 때 한번 실행
  }, [])

  useFocusEffect(() => {
    handleProfile() // 스크린 다시 렌더
  })

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#ffffff', }, isDarkMode && { ...styles.container, backgroundColor: '#000000', }]}>
      {/* 로고 */}
      <View style={{ marginBottom: 50, marginTop: 10, }}>
        <Text style={[{ ...styles.logo, color: '#000000', }, isDarkMode && { ...styles.logo, color: '#ffffff', }]}>전체</Text>

        {/* <TouchableOpacity onPress={() => { navigation.navigate("Settings") }}>
          <Icon_Feather name="settings" size={30} style={[{ color: 'black', top: -17, right: 30, position: 'absolute', }, isDarkMode && { color: 'white', top: -17, right: 30, position: 'absolute' }]} />
        </TouchableOpacity> */}
      </View>

      <TouchableOpacity style={[{ ...styles.InfoContainer, }, isDarkMode && { ...styles.scrollContainer, }]} onPress={() => navigation.navigate('Profile_View')}>
        <View style={[{ ...styles.Info, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
          <Text style={[{ ...styles.InfoTitle, color: '#000000', }, isDarkMode && { ...styles.InfoTitle, color: '#ffffff', }]}>{firstName + lastName}</Text>
          <Text style={{ color: 'gray', fontSize: 12, fontWeight: 'normal', }}>계정ㆍ{email}</Text>
          {/* 아이콘 */}
          <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#dcdcdc', right: 20, position: 'absolute' }}></View>
          <Icon_Feather name='user' size={30} style={{ color: 'black', borderRadius: 25, right: 30, position: 'absolute' }} />
        </View>
      </TouchableOpacity>

      <View style={{ width: "100%", marginBottom: 30, }}></View>

      <TouchableOpacity style={[{ ...styles.InfoContainer, }, isDarkMode && { ...styles.scrollContainer, }]} onPress={() => navigation.navigate('Bus_main')}>
        <View style={[{ ...styles.Info, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
          <Text style={[{ ...styles.InfoTitle, color: '#000000', }, isDarkMode && { ...styles.InfoTitle, color: '#ffffff', }]}>버스 조회 (Alpha)</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={[{ ...styles.InfoContainer, }, isDarkMode && { ...styles.scrollContainer, }]} onPress={() => navigation.navigate('Bus_AddBusStopID')}>
        <View style={[{ ...styles.Info, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
          <Text style={[{ ...styles.InfoTitle, color: '#000000', }, isDarkMode && { ...styles.InfoTitle, color: '#ffffff', }]}>정류장 설정</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={[{ ...styles.InfoContainer, }, isDarkMode && { ...styles.scrollContainer, }]} onPress={() => {
        AsyncStorage.removeItem('community_blockedUser')
        Alert.alert('정보', '모든 사용자 차단을 해제했습니다.')
      }}>
        <View style={[{ ...styles.Info, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
          <Text style={[{ ...styles.InfoTitle, color: '#000000', }, isDarkMode && { ...styles.InfoTitle, color: '#ffffff', }]}>게시판 차단 모두 해제</Text>
        </View>
      </TouchableOpacity>

      {/* <TouchableOpacity style={[{ ...styles.InfoContainer, }, isDarkMode && { ...styles.scrollContainer, }]}>
        <View style={[{ ...styles.Info, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
          <Text style={[{ ...styles.InfoTitle, color: '#000000', }, isDarkMode && { ...styles.InfoTitle, color: '#ffffff', }]}>ysit 바로가기</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={[{ ...styles.InfoContainer, }, isDarkMode && { ...styles.scrollContainer, }]}>
        <View style={[{ ...styles.Info, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
          <Text style={[{ ...styles.InfoTitle, color: '#000000', }, isDarkMode && { ...styles.InfoTitle, color: '#ffffff', }]}>세종장영실고등학교 홈페이지</Text>
        </View>
      </TouchableOpacity> */}

      <View style={[{ ...styles.InfoContainer, }, isDarkMode && { ...styles.scrollContainer, }]}>
        <View style={[{ ...styles.Info, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
          <Text style={[{ ...styles.InfoTitle, color: '#000000', }, isDarkMode && { ...styles.InfoTitle, color: '#ffffff', }]}>버전 : {appVersion} 빌드 : {buildNumber}</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerDark: {
    flex: 1,
  },
  InfoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    top: 20,
    left: 25,
    width: '20%',
    fontSize: 30,
    fontWeight: 'bold',
  },
  Info: {
    width: '95%',
    maxWidth: 400,
    padding: 20,
    marginBottom: 10,
    borderRadius: 25,
    justifyContent: 'center',
  },
  InfoTitle: {
    marginBottom: 3,
    fontSize: 25,
    fontWeight: 'bold',
  },
})