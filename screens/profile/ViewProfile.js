import React, { useEffect, useState } from "react";
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal, Linking } from 'react-native';
import { CommonActions, useFocusEffect, useIsFocused } from "@react-navigation/native";
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from 'react-native-toast-message';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

import axiosInstance from "../../api/API_Server";

export default function ViewProfile({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'
  const isFocused = useIsFocused()

  const [job, setJob] = useState(null)

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
          }
        }).catch((error) => {
          setProfileType(0)
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
      setProfileType(0)
      Toast.show({
        type: 'error',
        text1: '계정을 불러오지 못했어요.',
        text2: `${error}`,
      })
    }
  }

  const handleFcmDelete = async () => {
    try {
      const fcmToken = await messaging().getToken()
      await axiosInstance.post('/Fcm/deleteToken', { fcmToken: fcmToken })
        .then((res) => {
          Toast.show({
            type: 'success',
            text1: `알림 서비스를 해지했어요.`,
          })
        }).catch((error) => {
          Toast.show({
            type: 'error',
            text1: '알름 서비스를 해지하지 못했어요.',
            text2: `${error}`,
          })
        })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '알름 서비스를 해지하지 못했어요.',
        text2: `${error}`,
      })
    }
  }

  const handleLogout = async () => {
    try {
      await handleFcmDelete()
      AsyncStorage.removeItem('id')
      AsyncStorage.removeItem('job')
      AsyncStorage.removeItem('access_token')
      AsyncStorage.removeItem('refresh_token')
      AsyncStorage.removeItem('fcm_token')
      AsyncStorage.removeItem('Notification_List')

      Toast.show({
        type: 'success',
        text1: `로그아웃을 성공했어요.`,
      })
      return navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }]
        })
      )
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '서버와 연결할 수 없습니다.',
        text2: `${error}`,
      })
    }
  }

  const handleGetJob = async () => {
    await AsyncStorage.getItem('job')
      .then((res) => {
        setJob(res)
      }).catch((error) => {
        setJob(null)
      })
  }

  useEffect(() => {
    handleGetJob()
    handleProfile() // 스크린이 처음 시작될 때 한번 실행
  }, [isFocused])

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#f0f0f0' }, isDarkMode && { ...styles.container, backgroundColor: '#000000' },]}>
      {/* 로고 */}
      <View style={styles.logoView}>
        <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 10 } : { ...styles.backButtonView, }} onPress={() => navigation.goBack()}>
          <Text style={[{ ...styles.logoText, color: '#000000' }, isDarkMode && { ...styles.logoText, color: '#ffffff' },]}>
            {<Icon_Ionicons name="chevron-back-outline" size={21} />} 프로필
          </Text>
        </TouchableOpacity>
      </View>

      {profileType === null || job === null ?
        <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', }}>
          <ActivityIndicator size='large' color='green' />
        </View>
        :
        <>
          {profileType === 0 &&
            <View style={{ ...StyleSheet.absoluteFillObject, ...styles.MessageContainer, }}>
              <Text style={[{ ...styles.Message, color: '#666666', }, isDarkMode && { ...styles.Message, color: '#999999', },]}>프로필 정보를 불러올 수 없어요.</Text>

              <View style={{ ...StyleSheet.absoluteFillObject, ...styles.refresBtnContainer, }}>
                <TouchableOpacity onPress={() => { handleProfile() }} style={{ ...styles.refresBtn, }}>
                  <Text style={{ textAlign: 'center', color: '#ffffff', }}>다시시도</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          {profileType === 1 &&
            <>
              {/* 스크롤 */}
              <ScrollView style={[{ ...styles.scrollContainer, backgroundColor: '#f0f0f0', }, isDarkMode && { ...styles.scrollContainer, backgroundColor: '#000000', }]}>
                {/* 계정ID */}
                <>
                  <Text style={styles.InfoTopText}>계정ID</Text>
                  <View style={[{ ...styles.Info, backgroundColor: '#ffffff', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile_Edit_Email', { methodName: 'email', email: profileData.email })}>
                      <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>이메일</Text>
                      <Text style={styles.Value}>{profileData.email}</Text>
                    </TouchableOpacity>
                  </View>
                </>
                {/* 개인정보 */}
                <>
                  <Text style={styles.InfoTopText}>개인정보</Text>
                  <View style={[{ ...styles.Info, backgroundColor: '#ffffff', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
                    {job === 'student' &&
                      <>
                        <TouchableOpacity onPress={() => navigation.navigate('Profile_Edit', { methodName: 'accountID', accountID: profileData.accountID })}>
                          <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>아이디</Text>
                          <Text style={styles.Value}>{profileData.accountID}</Text>
                        </TouchableOpacity>

                        <View style={styles.rankView}></View>
                      </>
                    }

                    <TouchableOpacity onPress={() => navigation.navigate('Profile_Edit_Password')}>
                      <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>비밀번호</Text>
                    </TouchableOpacity>

                    <View style={styles.rankView}></View>

                    {job === 'student' &&
                      <>
                        <View>
                          <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>학번</Text>
                          <Text style={styles.Value}>{profileData.studentID}</Text>
                        </View>

                        <View style={styles.rankView}></View>
                      </>
                    }

                    <TouchableOpacity onPress={() => navigation.navigate('Profile_Edit', { methodName: 'phoneNumber', phoneNumber: profileData.phoneNumber })}>
                      <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>전화번호</Text>
                      <Text style={styles.Value}>{profileData.phoneNumber}</Text>
                    </TouchableOpacity>

                    <View style={styles.rankView}></View>

                    <TouchableOpacity onPress={() => navigation.navigate('Profile_Edit', { methodName: 'name', firstName: profileData.firstName, lastName: profileData.lastName })}>
                      <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>이름</Text>
                      <Text style={styles.Value}>{profileData.firstName}{profileData.lastName}</Text>
                    </TouchableOpacity>
                  </View>
                </>
                {/* 커뮤니티 */}
                <>
                  <Text style={styles.InfoTopText}>커뮤니티</Text>
                  <View style={[{ ...styles.Info, backgroundColor: '#ffffff', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile_Edit', { methodName: 'community_nickname', nickname: profileData.nickname })}>
                      <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>닉네임</Text>
                      <Text style={styles.Value}>{profileData.nickname ? profileData.nickname : '닉네임을 설정해주세요.'}</Text>
                    </TouchableOpacity>
                  </View>
                </>
                {/* 계정 */}
                <>
                  <Text style={styles.InfoTopText}>계정</Text>
                  <View style={[{ ...styles.Info, marginBottom: 0, backgroundColor: '#ffffff', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
                    <TouchableOpacity onPress={() => {
                      Alert.alert('정보', '원활한 상담을 위해 학번, 이름과 용건을 말해주세요.', [
                        { text: '이동', onPress: () => Linking.openURL('https://x8640.channel.io/home') },
                        { text: '취소', }
                      ])
                    }}>
                      <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>
                        계정 문의
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.rankView}></View>

                    <TouchableOpacity onPress={() => navigation.navigate('Profile_Delete_Account')}>
                      <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>
                        탈퇴 신청
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
                <View style={{ marginBottom: 100, }}></View>
              </ScrollView>

              {/* 로그아웃 */}
              <TouchableOpacity style={styles.logoutBtnContainer} onPress={handleLogout}>
                <Text style={styles.logoutBtnText}>{<Icon_Ionicons name="log-out-outline" size={17}></Icon_Ionicons>} 로그아웃</Text>
              </TouchableOpacity>
            </>
          }
        </>
      }
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
  },
  logoutBtnContainer: {
    backgroundColor: '#1E00D3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 0,
    marginBottom: 20,
  },
  logoutBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 15,
  },
  rankView: {
    width: '100%',
    height: 1,
    marginTop: 15,
    marginBottom: 15,
    backgroundColor: 'gray',
  },
  MessageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  Message: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    position: 'absolute',
    width: '100%',
    marginTop: 100,
  },
  refresBtnContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 100,
  },
  refresBtn: {
    width: '30%',
    backgroundColor: '#EB4E45',
    borderRadius: 10,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
})