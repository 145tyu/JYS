import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal } from 'react-native';
import { CommonActions, useFocusEffect, useIsFocused } from "@react-navigation/native";
import Toast from "react-native-toast-message";

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

import axiosInstance from "../../api/API_Server";

export default function StudentAllTab({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'
  const isFocused = useIsFocused()

  const [profileData, setProfileData] = useState([])
  const [profileType, setProfileType] = useState(null)

  const handleProfile = async () => {
    try {
      const ID = await AsyncStorage.getItem('id')
      const JOB = await AsyncStorage.getItem('job')

      await axiosInstance.post('/profile', { id: ID, job: JOB })
        .then((res) => {
          if (res.status === 200) {
            setProfileData(res.data)
            setProfileType(1)
          } else {
            setProfileType(0)

            Toast.show({
              type: 'error',
              text1: '계정을 확인하지 못했어요.'
            })
          }
        }).catch((error) => {
          setProfileType(0)
          if (error.response) {
            const res = error.response
            if (res.status === 400) {
              Toast.show({
                type: 'error',
                text1: `${res.data.errorDescription}`,
                text2: `${res.data.error}`
              })
            } else if (res.status === 500) {
              Toast.show({
                type: 'error',
                text1: `${res.data.errorDescription}`,
                text2: `${res.data.error}`
              })
            } else {
              Toast.show({
                type: 'error',
                text1: `서버와 연결할 수 없습니다.`,
              })
            }
          } else {
            Toast.show({
              type: 'error',
              text1: `서버와 연결할 수 없습니다.`,
              text2: `${error}`,
            })
          }
        })
    } catch (error) {
      setProfileType(0)
      Toast.show({
        type: 'error',
        text1: `계정 데이터를 불러올 수 없어요.`,
        text2: `${error}`,
      })
    }
  }

  const handleGuestLogout = () => {
    AsyncStorage.removeItem('job')
    navigation.navigate('Login')
  }

  useEffect(() => {
    AsyncStorage.getItem('job')
      .then((data) => {
        if (data === 'guest') {
          setProfileType(2)
        } else {
          handleProfile()
        }
      })
  }, [isFocused])

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#ffffff', }, isDarkMode && { ...styles.container, backgroundColor: '#000000', }]}>
      {/* 로고 */}
      <View style={{ marginBottom: 50, marginTop: 10, }}>
        <Text style={[{ ...styles.logo, color: '#000000', }, isDarkMode && { ...styles.logo, color: '#ffffff', }]}>전체</Text>

        <TouchableOpacity onPress={() => { navigation.navigate("Setting_Home") }}>
          <Icon_Ionicons name='settings-outline' size={30} style={[{ color: 'black', top: -17, right: 30, position: 'absolute', }, isDarkMode && { color: 'white', top: -17, right: 30, position: 'absolute' }]} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <TouchableOpacity style={[{ ...styles.InfoContainer, }, isDarkMode && { ...styles.scrollContainer, }]}>
          <View style={[{ ...styles.Info, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
            {profileType === null ?
              <View style={{ padding: 1, justifyContent: 'center', alignItems: 'center', }}>
                <ActivityIndicator size={30} color='green' />
              </View>
              :
              <>
                {profileType === 0 &&
                  <TouchableOpacity onPress={() => handleProfile()}>
                    <Text style={[{ fontSize: 15, fontWeight: '600', color: '#000000' }, isDarkMode && { fontSize: 15, fontWeight: '600', color: '#ffffff' }]}>
                      프로필을 불러 오지 못했습니다.{'\n'}
                      여기를 눌러 다시 시도하세요.
                    </Text>
                  </TouchableOpacity>
                }
                {profileType === 1 &&
                  <TouchableOpacity onPress={() => navigation.navigate('Profile_View')}>
                    <Text style={[{ ...styles.InfoTitle, color: '#000000', }, isDarkMode && { ...styles.InfoTitle, color: '#ffffff', }]}>{profileData.firstName + profileData.lastName}</Text>
                    <Text style={{ color: 'gray', fontSize: 12, fontWeight: 'normal', }}>계정ㆍ{profileData.email}</Text>
                    {/* 아이콘 */}
                    <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#dcdcdc', top: 5, right: 5, position: 'absolute' }}></View>
                    <Icon_Feather name='user' size={30} style={{ color: 'black', borderRadius: 25, top: 13, right: 15, position: 'absolute' }} />
                  </TouchableOpacity>
                }
                {profileType === 2 &&
                  <TouchableOpacity onPress={() => handleGuestLogout()}>
                    <Text style={[{ fontSize: 15, fontWeight: '600', color: '#000000' }, isDarkMode && { fontSize: 15, fontWeight: '600', color: '#ffffff' }]}>
                      여기를 눌러 로그인을 시도하세요.
                    </Text>
                  </TouchableOpacity>
                }
              </>
            }
          </View>
        </TouchableOpacity>

        <View style={{ width: "100%", marginBottom: 30, }}></View>

        <TouchableOpacity style={[{ ...styles.InfoContainer, }, isDarkMode && { ...styles.scrollContainer, }]} onPress={() => navigation.navigate('Bus_Home')}>
          <View style={[{ ...styles.Info, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
            <Text style={[{ ...styles.InfoTitle, color: '#000000', }, isDarkMode && { ...styles.InfoTitle, color: '#ffffff', }]}>실시간 버스 조회</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[{ ...styles.InfoContainer, }, isDarkMode && { ...styles.scrollContainer, }]} onPress={() => navigation.navigate('WebView_ysit')}>
          <View style={[{ ...styles.Info, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
            <Text style={[{ ...styles.InfoTitle, color: '#000000', }, isDarkMode && { ...styles.InfoTitle, color: '#ffffff', }]}>ysit 바로가기</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[{ ...styles.InfoContainer, }, isDarkMode && { ...styles.scrollContainer, }]} onPress={() => navigation.navigate('WebView_SejongJangYeongsilHighSchool')}>
          <View style={[{ ...styles.Info, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
            <Text style={[{ ...styles.InfoTitle, color: '#000000', }, isDarkMode && { ...styles.InfoTitle, color: '#ffffff', }]}>세종장영실고등학교 홈페이지</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
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