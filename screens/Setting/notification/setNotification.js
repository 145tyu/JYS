import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal, Linking, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import messaging from '@react-native-firebase/messaging';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

import axiosInstance from '../../../api/API_Server';
import Toast from 'react-native-toast-message';

export default function Settings_setNotificationScreen({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'

  const [isEnabledMainNotification, setIsEnabledMainNotification] = useState(false)

  const [isEnabledLunch, setIsEnabledLunch] = useState(false)

  const toggleSwitchMainNotification = async () => {
    setIsEnabledMainNotification(previousState => !previousState)
    if (isEnabledMainNotification) {
      await AsyncStorage.setItem('Notification_Allowed_Status', 'false')
        .then(() => {
          //console.log('알림 권한을 거부로 변경했습니다.')
          //handleDeleteFcmToken()
          handleFcmDelete()
        })
    } else {
      await AsyncStorage.setItem('Notification_Allowed_Status', 'true')
        .then(() => {
          //console.log('알림 권한을 허용으로 변경했습니다.')
          //handleCreateFcmToken()
          fcmInsertToken()
        })
    }
  }

  const toggleSwitchLunch = async () => {
    setIsEnabledLunch(previousState => !previousState)
    if (isEnabledLunch) {
      await AsyncStorage.setItem('Meal_Lunch_Notification_Allowed_Status', 'false')
        .then(() => {
          console.log('중식 알림 권한을 거부로 변경했습니다.')
        })
    } else {
      await AsyncStorage.setItem('Meal_Lunch_Notification_Allowed_Status', 'true')
        .then(() => {
          console.log('중식 알림 권한을 허용으로 변경했습니다.')
        })
    }
  }

  const fcmInsertToken = async () => {
    await messaging()
      .getToken()
      .then(async (fcmToken) => {
        await AsyncStorage.setItem('fcm_token', fcmToken)

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
              Toast.show({
                type: 'error',
                text1: '알림 서비스를 등록하지 못했습니다.',
                position: 'bottom',
              })
            }
          }).catch((error) => {
            Toast.show({
              type: 'error',
              text1: '알림 서비스를 등록하지 못했습니다.',
              text2: `${error}`,
              position: 'bottom',
            })
          })
      })
  }

  const handleFcmDelete = async () => {
    try {
      const fcmToken = await messaging().getToken()
      await axiosInstance.post('/Fcm/deleteToken', { fcmToken: fcmToken })
        .then((res) => {
          Toast.show({
            type: 'success',
            text1: `알림 서비스를 해지했어요.`,
            position: 'bottom',
          })
        }).catch((error) => {
          Toast.show({
            type: 'error',
            text1: '알름 서비스를 해지하지 못했어요.',
            text2: `${error}`,
            position: 'bottom',
          })
        })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '알름 서비스를 해지하지 못했어요.',
        text2: `${error}`,
        position: 'bottom',
      })
    }
  }

  const LunchfcmInsertToken = async () => {
    await messaging()
      .getToken()
      .then(async (fcmToken) => {
        await AsyncStorage.setItem('fcm_token', fcmToken)

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
              Toast.show({
                type: 'error',
                text1: '알림 서비스를 등록하지 못했습니다.',
                position: 'bottom',
              })
            }
          }).catch((error) => {
            Toast.show({
              type: 'error',
              text1: '알림 서비스를 등록하지 못했습니다.',
              text2: `${error}`,
              position: 'bottom',
            })
          })
      })
  }

  const LunchhandleFcmDelete = async () => {
    try {
      const fcmToken = await messaging().getToken()
      await axiosInstance.post('/Fcm/deleteToken', { fcmToken: fcmToken })
        .then((res) => {
          Toast.show({
            type: 'success',
            text1: `알림 서비스를 해지했어요.`,
            position: 'bottom',
          })
        }).catch((error) => {
          Toast.show({
            type: 'error',
            text1: '알름 서비스를 해지하지 못했어요.',
            text2: `${error}`,
            position: 'bottom',
          })
        })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '알름 서비스를 해지하지 못했어요.',
        text2: `${error}`,
        position: 'bottom',
      })
    }
  }

  const checkNotificationState = () => {
    AsyncStorage.getItem('Notification_Allowed_Status')
      .then((res) => {
        if (res != null) {
          if (res == 'true') {
            setIsEnabledMainNotification(true)
          } else if (res == 'false') {
            setIsEnabledMainNotification(false)
          }
        }
      })
  }

  const checkLunchNotificationState = () => {
    AsyncStorage.getItem('Meal_Lunch_Notification_Allowed_Status')
      .then((res) => {
        if (res != null) {
          if (res == 'true') {
            setIsEnabledMainNotification(true)
          } else if (res == 'false') {
            setIsEnabledMainNotification(false)
          }
        }
      })
  }

  useEffect(() => {
    checkNotificationState()
    checkLunchNotificationState()
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
              thumbColor={isEnabledMainNotification ? '#4682B4' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitchMainNotification}
              value={isEnabledMainNotification}
            />
          </View>

          <View style={{ paddingLeft: 20, paddingRight: 20, }}>
            <Text style={[{ color: '#333333' }, isDarkMode && { color: '#999999' }]}>
              커뮤니티 알람이나 공지사항 또는 기타 알림을 활성화하거나 비활성화합니다.
            </Text>
          </View>
        </>

        {/* 급식 알림 */}
        {/* <>
          <View style={{ ...styles.Info, marginTop: 30, backgroundColor: isDarkMode ? '#000000' : '#ffffff', }}>
            <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>급식 알림</Text>
            <Switch
              style={Platform.OS === 'ios' ? { position: 'absolute', right: 20, top: 15, } : { position: 'absolute', right: 20, top: 20, }}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isEnabledLunch ? '#4682B4' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitchLunch}
              value={isEnabledLunch}
            />
          </View>

          <View style={{ paddingLeft: 20, paddingRight: 20, }}>
            <Text style={[{ color: '#333333' }, isDarkMode && { color: '#999999' }]}>
              아침마다 전송되는 중식 알림을 활성화하거나 비활성화합니다.
            </Text>
          </View>
        </> */}
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