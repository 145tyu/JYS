import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal, Linking, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import messaging from '@react-native-firebase/messaging';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

import axiosInstance from '../../../api/API_Server';

export default function Settings_setNotificationScreen({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'

  const [isEnabled, setIsEnabled] = useState(false)

  const toggleSwitch = async () => {
    setIsEnabled(previousState => !previousState)
    if (isEnabled) {
      await AsyncStorage.setItem('Notification_Allowed_Status', 'false')
        .then(() => {
          console.log('알림 권한을 거부로 변경했습니다.')
          //handleDeleteFcmToken()
          handleFcmDelete()
        })
    } else {
      await AsyncStorage.setItem('Notification_Allowed_Status', 'true')
        .then(() => {
          console.log('알림 권한을 허용으로 변경했습니다.')
          //handleCreateFcmToken()
          fcmInsertToken()
        })
    }
  }

  const fcmInsertToken = async () => {
    await messaging()
      .getToken()
      .then(async (fcmToken) => {
        AsyncStorage.setItem('fcm_token', fcmToken)
        const data = [
          {
            "fcmToken": fcmToken,
            "accountID": await AsyncStorage.getItem('id'),
            "deviceInfo": {
              "uniqueId": await DeviceInfo.getUniqueId(),
              "brand": DeviceInfo.getBrand(),
              "model": DeviceInfo.getModel(),
              "systemVersion": DeviceInfo.getSystemVersion(),
              "appVersion": DeviceInfo.getVersion(),
              "buildNumber": DeviceInfo.getBuildNumber(),
            },
          }
        ]

        await axiosInstance.post('/Fcm/insertToken', { data: data[0] })
          .then((res) => {
            if (res.status === 200) {
              console.log(res.data.message)
            } else {
              console.log('FCM을 등록하지 못했습니다.')
            }
          }).catch((error) => {
            console.log('FcmInsertToken |', error)
            if (error.response) {
              const res = error.response
              if (res.status === 400) {
                console.log(error.data.errorDescription)
              } else if (res.status === 500) {
                console.log(error.data.errorDescription)
              } else {
                console.log('FCM을 등록하지 못했습니다.')
              }
            } else {
              console.log('FCM을 등록하지 못했습니다.')
            }
          })
      })
  }

  const handleFcmDelete = async () => {
    try {
      const fcmToken = await messaging().getToken()
      await axiosInstance.post('/Fcm/deleteToken', { fcmToken: fcmToken })
        .then((res) => {
          console.log(res.data.message)
        }).catch((error) => {
          console.log('Fcm API | ', error)
        })
    } catch (error) {
      console.log('Fcm API | ', error)
    }
  }

  const handleCreateFcmToken = async () => {
    try {
      await messaging().getToken()
        .then((res) => {
          console.log('FcmToken | ', res)
        }).catch((error) => {
          console.log('FcmToken | ', error)
        })
    } catch (error) {
      console.log('FcmToken | ', error)
    }
  }

  const handleDeleteFcmToken = async () => {
    try {
      await messaging().deleteToken()
        .then((res) => {
          console.log('FcmToken | ', res)
        }).catch((error) => {
          console.log('FcmToken | ', error)
        })
    } catch (error) {
      console.log('FcmToken | ', error)
    }
  }

  const checkNotificationState = () => {
    AsyncStorage.getItem('Notification_Allowed_Status')
      .then((res) => {
        if (res != null) {
          if (res == 'true') {
            setIsEnabled(true)
          } else if (res == 'false') {
            setIsEnabled(false)
          }
        }
      })
  }

  useEffect(() => {
    checkNotificationState()
  }, [])

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#f0f0f0' }, isDarkMode && { ...styles.container, backgroundColor: '#000000' },]}>
      {/* 로고 */}
      <View style={styles.logoView}>
        <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 10 } : { ...styles.backButtonView, }} onPress={() => navigation.goBack()}>
          <Text style={[{ ...styles.logoText, color: '#000000' }, isDarkMode && { ...styles.logoText, color: '#ffffff' },]}>
            {<Icon_Ionicons name="chevron-back-outline" size={21} />} 설정
          </Text>
        </TouchableOpacity>
      </View>

      {/* 스크롤 */}
      <ScrollView style={[{ ...styles.scrollContainer, backgroundColor: '#f0f0f0', }, isDarkMode && { ...styles.scrollContainer, backgroundColor: '#000000', }]}>
        {/* 알림 */}
        <>
          <View style={[{ ...styles.Info, backgroundColor: '#ffffff', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
            <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>알림</Text>
            {/* <Text style={[{ ...styles.Title, position: 'absolute', top:20, right: 80, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>{isEnabled? '켜짐':'꺼짐'}</Text> */}
            <Switch
              style={Platform.OS === 'ios' ? { position: 'absolute', right: 20, top: 15, } : { position: 'absolute', right: 20, top: 20, }}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isEnabled ? '#4682B4' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </View>

          <View style={{ paddingLeft: 20, paddingRight: 20, }}>
            <Text style={[{ color: '#333333' }, isDarkMode && { color: '#999999' }]}>
              커뮤니티 알람이나 공지사항 또는 기타 알림을 활성화하거나 비활성화합니다.
            </Text>
          </View>
        </>
      </ScrollView>
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
})