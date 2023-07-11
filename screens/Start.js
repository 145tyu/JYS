import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Image, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';

import axiosInstance from '../api/API_Server';

const appVersion = DeviceInfo.getVersion() // 앱 버전 가져오기
const buildVersion = DeviceInfo.getBuildNumber()

export default function StartScreen({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'

  const [isLoading, setIsLoading] = useState(true)

  const [alert, setAlert] = useState(null)
  const [alertDescription, setAlertDescription] = useState(null)
  const [alertStatus, setAlertStatus] = useState(null)
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false)

  const [message, setMessage] = useState('시작 중...')

  const delData = async () => {
    setIsLoading(false)
    AsyncStorage.removeItem('id')
    AsyncStorage.removeItem('job')
    AsyncStorage.removeItem('access_token')
    AsyncStorage.removeItem('refresh_token')
    AsyncStorage.removeItem('fcm_token')
  }

  const checkIntegrity = async () => { // 데이터 무결성 검사
    setIsLoading(true)
    setMessage('데이터 무결성 검사 중...')
    setAlert(null) // 에러메시지 초기화
    setAlertDescription(null) // 에러메시지 초기화
    setAlertStatus(null) // 에러상태 초기화
    setIsAlertModalVisible(false) // 에러 모달 닫기
    try {
      AsyncStorage.getItem('access_token') // 토큰값을 가져옴
        .then((token) => {
          if (token) {
            AsyncStorage.getItem('job') // 'job' 키를 가져옴
              .then((job) => {
                setIsLoading(false)
                if (job === 'student') { // 'job'이 'student'라면
                  return navigation.dispatch( // 기존에 있던 모든 스크린을 없애고 'S_Home'스크린으로 이동
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: 'S_Home'}]
                    })
                  )
                } else if (job === 'teacher') { // 'job'이 'teacher'라면
                  return navigation.dispatch(  // 기존에 있던 모든 스크린을 없애고 'T_Home'스크린으로 이동
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: 'T_Home'}]
                    })
                  )
                } else { // 'job'이 없다면 모든 데이터 삭제
                  delData()
                  return navigation.dispatch( // 'Login' 스크린으로 이동하고 기존에 있던 모든 스크린을 삭제
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: 'Login'}]
                    })
                  )
                }
              }).catch((error) => {
                delData()
                setIsLoading(false)
                console.log('checkIntegrity | ', error)
                setAlert('데이터 무결성 검사를 실패했습니다.')
                setAlertStatus('checkIntegrity')
                setIsAlertModalVisible(true) // 에러 모달 표시
              })
          } else { // 'token'이 없다면 모든 데이터 삭제
            delData()
            return navigation.dispatch( // 'Login' 스크린으로 이동하고 기존에 있던 모든 스크린을 삭제
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login'}]
              })
            )
          }
        }).catch((error) => {
          setIsLoading(false)
          console.log('checkIntegrity | ', error)
          setAlert('데이터 무결성 검사를 실패했습니다.')
          setAlertStatus('checkIntegrity')
          setIsAlertModalVisible(true) // 에러 모달 표시
        })
    } catch (error) {
      setIsLoading(false)
      console.log('checkIntegrity | ', error)
      setAlert('데이터 무결성 검사를 실패했습니다.')
      setAlertStatus('checkIntegrity')
      setIsAlertModalVisible(true) // 에러 모달 표시
    }
  }

  const checkVersion = async () => { // Version 확인
    setIsLoading(true)
    setMessage('버전 확인 중...')
    setAlert(null) // 에러메시지 초기화
    setAlertDescription(null) // 에러메시지 초기화
    setAlertStatus(null) // 에러상태 초기화
    setIsAlertModalVisible(false) // 에러 모달 닫기
    try {
      await axiosInstance.post('/version')
        .then((res) => {
          //setIsLoading(false)
          console.log(res.data)
          if (res.data.version === appVersion && res.data.build <= buildVersion) { // 앱 버전이 같으면
            checkIntegrity() // 데이터 무결성 검사 실행
          } else {
            if (res.data.type === 2) { // 'type'이 '2'이면 긴급
              setAlert('긴급 | 앱을 업데이트해야 합니다.')
              setAlertStatus('update')
              setIsAlertModalVisible(true) // 에러 모달 표시
            } else if (res.data.version != appVersion && res.data.type === 1) {
              setAlert('새로운 버전이 출시되었습니다.')
              setAlertDescription(' ')
              setAlertStatus('update')
              setIsAlertModalVisible(true) // 에러 모달 표시
            }
          }
        }).catch((error) => {
          setIsLoading(false)
          console.log('checkVersion | ', error)
          setAlert('서버와 연결할 수 없습니다.')
          setAlertStatus('checkVersion')
          setIsAlertModalVisible(true) // 에러 모달 표시
        })
    } catch (error) {
      setIsLoading(false)
      console.log('checkVersion | ', error)
      setAlert('버전을 검사하지 못했습니다.')
      setAlertStatus('checkVersion')
      setIsAlertModalVisible(true) // 에러 모달 표시
    }
  }

  const closeAlertModal = () => {
    setIsAlertModalVisible(false)
  }
  
  useEffect(() => {
    //handleStartData()
    checkVersion() // 버전 체크
  }, [])

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <Modal animationType="fade" transparent={true}visible={isAlertModalVisible} onRequestClose={closeAlertModal}>
        {alertStatus === 'checkIntegrity' &&
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <View style={[{ backgroundColor: 'white', padding: 10, borderRadius: 20, width: '90%' }, isDarkMode && { backgroundColor: '#121212', padding: 10, borderRadius: 20, width: '90%' }]}>
              <Text style={[{ fontSize: 17, fontWeight: 'bold', color: 'black', textAlign: 'center', marginTop: 10 }, isDarkMode && { fontSize: 17, fontWeight: 'bold', color: 'white', textAlign: 'center', marginTop: 10 }]}>{alert}</Text>
              {alertDescription != null && <Text style={[{ fontSize: 13, fontWeight: 'bold', color: 'black', textAlign: 'center', marginTop: 15 }, isDarkMode && { fontSize: 13, fontWeight: 'bold', color: 'white', textAlign: 'center', marginTop: 15 }]}>{alertDescription}</Text>}
              <View style={{ width: '100%', height: 1, backgroundColor: 'gray', marginTop: 20, marginBottom: 10 }}></View>
              <TouchableOpacity onPress={checkIntegrity}><Text style={{ color: '#4682b4', fontSize: 15, textAlign: 'center' }}>다시시도</Text></TouchableOpacity>
            </View>
          </View>
        }
        {alertStatus === 'checkVersion' &&
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <View style={[{ backgroundColor: 'white', padding: 10, borderRadius: 20, width: '90%' }, isDarkMode && { backgroundColor: '#121212', padding: 10, borderRadius: 20, width: '90%' }]}>
              <Text style={[{ fontSize: 17, fontWeight: 'bold', color: 'black', textAlign: 'center', marginTop: 10 }, isDarkMode && { fontSize: 17, fontWeight: 'bold', color: 'white', textAlign: 'center', marginTop: 10 }]}>{alert}</Text>
              {alertDescription != null && <Text style={[{ fontSize: 13, fontWeight: 'bold', color: 'black', textAlign: 'center', marginTop: 15 }, isDarkMode && { fontSize: 13, fontWeight: 'bold', color: 'white', textAlign: 'center', marginTop: 15 }]}>{alertDescription}</Text>}
              <View style={{ width: '100%', height: 1, backgroundColor: 'gray', marginTop: 20, marginBottom: 10 }}></View>
              <TouchableOpacity onPress={checkVersion}><Text style={{ color: '#4682b4', fontSize: 15, textAlign: 'center' }}>다시시도</Text></TouchableOpacity>
            </View>
          </View>
        }
        {alertStatus === 'update' &&
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <View style={[{ backgroundColor: 'white', padding: 10, borderRadius: 20, width: '90%' }, isDarkMode && { backgroundColor: '#121212', padding: 10, borderRadius: 20, width: '90%' }]}>
              <Text style={[{ fontSize: 17, fontWeight: 'bold', color: 'black', textAlign: 'center', marginTop: 10 }, isDarkMode && { fontSize: 17, fontWeight: 'bold', color: 'white', textAlign: 'center', marginTop: 10 }]}>{alert}</Text>
              {/* {alertDescription != null && <Text style={[{ fontSize: 13, fontWeight: 'bold', color: 'black', textAlign: 'center', marginTop: 15 }, isDarkMode && { fontSize: 13, fontWeight: 'bold', color: 'white', textAlign: 'center', marginTop: 15 }]}>{alertDescription}</Text>} */}
              <View style={{ width: '100%', height: 1, backgroundColor: 'gray', marginTop: 20, marginBottom: 10 }}></View>
              <TouchableOpacity onPress={closeAlertModal}><Text style={{ color: '#4682b4', fontSize: 15, textAlign: 'center' }}>업데이트</Text></TouchableOpacity>
              {alertDescription != null && <View style={{ width: '100%', height: 1, backgroundColor: 'gray', marginTop: 10, marginBottom: 10 }}></View>}
              {alertDescription != null && <TouchableOpacity onPress={checkIntegrity}><Text style={{ color: '#4682b4', fontSize: 15, textAlign: 'center' }}>나중에</Text></TouchableOpacity>}
            </View>
          </View>
        }
      </Modal>
      <Image style={{ justifyContent: 'center', alignItems: 'center', width: 350, height: 350}} source={require('../resource/2.png')}/>
      {/* <Text style={styles.logo}>JYS</Text> */}
      {isLoading === true ?
        <>
          <ActivityIndicator style={{ justifyContent: 'center', alignItems: 'center'}} size="small" color="green"/>
          <Text style={[styles.messageText, isDarkMode && styles.messageTextDark]}>{message}</Text>
        </>
        : null
      }
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerDark: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontWeight: 'bold',
    fontSize: 100,
    color: '#fb5b5a',
    marginBottom: 40,
  },
  messageText: {
    fontWeight: 'bold',
    color: 'black',
    marginTop: 10,
  },
  messageTextDark: {
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  }
})