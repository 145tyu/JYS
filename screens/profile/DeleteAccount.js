import React, { useEffect, useState } from "react";
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from 'react-native-toast-message';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

import axiosInstance from "../../api/API_Server";

const SelectModal = ({ setReason, isDarkMode, visible, onClose }) => {
  return (
    <Modal animationType='slide' transparent={true} visible={visible} onRequestClose={() => onClose()}>
      <View style={modalStyles.container}>
        <View style={[{ ...modalStyles.boxContainer, backgroundColor: '#EBEBEB', }, isDarkMode && { ...modalStyles.boxContainer, backgroundColor: '#363638', }]}>
          <Text style={[{ ...modalStyles.boxTitle, marginBottom: 30, color: '#000000', }, isDarkMode && { ...modalStyles.boxTitle, marginBottom: 30, color: '#ffffff', }]}>선택하기</Text>

          <ScrollView style={{ height: 300, borderRadius: 15, }}>
            <TouchableOpacity onPress={() => {
              setReason('더 이상 소속이 아닙니다.')
              onClose()
            }} style={[{ ...modalStyles.boxSelectorContainer, backgroundColor: '#D8D8D8', }, isDarkMode && { ...modalStyles.boxSelectorContainer, backgroundColor: '#424242', }]}>
              <Text style={[{ ...modalStyles.boxText, color: '#000000', }, isDarkMode && { ...modalStyles.boxText, color: '#ffffff', }]}>더 이상 소속이 아닙니다.</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              setReason('서비스가 만족스럽지 않습니다.')
              onClose()
            }} style={[{ ...modalStyles.boxSelectorContainer, backgroundColor: '#D8D8D8', }, isDarkMode && { ...modalStyles.boxSelectorContainer, backgroundColor: '#424242', }]}>
              <Text style={[{ ...modalStyles.boxText, color: '#000000', }, isDarkMode && { ...modalStyles.boxText, color: '#ffffff', }]}>서비스가 만족스럽지 않습니다.</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              setReason('이 학교를 졸업했습니다.')
              onClose()
            }} style={[{ ...modalStyles.boxSelectorContainer, backgroundColor: '#D8D8D8', }, isDarkMode && { ...modalStyles.boxSelectorContainer, backgroundColor: '#424242', }]}>
              <Text style={[{ ...modalStyles.boxText, color: '#000000', }, isDarkMode && { ...modalStyles.boxText, color: '#ffffff', }]}>이 학교를 졸업했습니다.</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              setReason('괴롭힘 또는 따돌림을 당했습니다.')
              onClose()
            }} style={[{ ...modalStyles.boxSelectorContainer, backgroundColor: '#D8D8D8', }, isDarkMode && { ...modalStyles.boxSelectorContainer, backgroundColor: '#424242', }]}>
              <Text style={[{ ...modalStyles.boxText, color: '#000000', }, isDarkMode && { ...modalStyles.boxText, color: '#ffffff', }]}>괴롭힘 또는 따돌림을 당했습니다.</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              setReason('더 이상 이 서비스를 이용하고 싶지 않습니다.')
              onClose()
            }} style={[{ ...modalStyles.boxSelectorContainer, backgroundColor: '#D8D8D8', }, isDarkMode && { ...modalStyles.boxSelectorContainer, backgroundColor: '#424242', }]}>
              <Text style={[{ ...modalStyles.boxText, color: '#000000', }, isDarkMode && { ...modalStyles.boxText, color: '#ffffff', }]}>더 이상 이 서비스를 이용하고 싶지 않습니다.</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              setReason('기타 문제')
              onClose('기타 문제')
            }} style={[{ ...modalStyles.boxSelectorContainer, backgroundColor: '#D8D8D8', }, isDarkMode && { ...modalStyles.boxSelectorContainer, backgroundColor: '#424242', }]}>
              <Text style={[{ ...modalStyles.boxText, color: '#000000', }, isDarkMode && { ...modalStyles.boxText, color: '#ffffff', }]}>기타 문제</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <TouchableOpacity onPress={() => onClose()} style={[{ ...modalStyles.boxContainer, backgroundColor: '#EBEBEB', }, isDarkMode && { ...modalStyles.boxContainer, backgroundColor: '#363638', }]}>
          <Text style={[{ ...modalStyles.boxText, color: '#000000', }, isDarkMode && { ...modalStyles.boxText, color: '#ffffff', }]}>닫기</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  boxContainer: {
    width: '95%',
    height: 'auto',
    paddingTop: 15,
    paddingBottom: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  boxTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  boxText: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
  },
  boxSelectorContainer: {
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 2,
  },
})

export default function Profile_DeleteAccount({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'

  const [selectModalState, setSelectModalState] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  const [reason, setReason] = useState('선택된 사유가 없습니다.')

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

  const handleAccountDelete = async () => {
    setIsLoading(true)
    try {
      const ID = await AsyncStorage.getItem('id')
      const JOB = await AsyncStorage.getItem('job')
      await axiosInstance.post('/v1/profile/deleteAccount', { id: ID, job: JOB, reason: reason, })
        .then((res) => {
          setIsLoading(false)
          if (res.status === 200) {
            Toast.show({
              type: 'success',
              text1: `${res.data.message}`,
            })
            handleLogout()
          } else {
            Toast.show({
              type: 'error',
              text1: '서버와 연결할 수 없습니다.',
            })
          }
        }).catch((error) => {
          setIsLoading(false)
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
      setIsLoading(false)
      Toast.show({
        type: 'error',
        text1: '서버와 연결할 수 없습니다.',
        text2: `${error}`,
      })
    }
  }

  const handleSubmit = async () => {
    if (reason === '선택된 사유가 없습니다.') {
      Toast.show({
        type: 'error',
        text1: '탈퇴 사유를 선택하지 않았습니다.',
      })
    } else {
      Alert.alert('경고', '회원 탈퇴를 신청하면 더 이상 로그인할 수 없게 됩니다.\n회원탈퇴를 신청하시겠습니까?', [
        { text: '신청', onPress: () => handleAccountDelete() },
        { text: '취소', }
      ])
    }
  }

  const openSelectModal = () => {
    setSelectModalState(true)
  }

  const closeSelectModal = () => {
    setSelectModalState(false)
  }

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#f0f0f0' }, isDarkMode && { ...styles.container, backgroundColor: '#000000' },]}>
      <SelectModal setReason={setReason} isDarkMode={isDarkMode} visible={selectModalState} onClose={closeSelectModal} />

      {/* 로고 */}
      <View style={styles.logoView}>
        <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 10 } : { ...styles.backButtonView, }} onPress={() => navigation.goBack()}>
          <Text style={[{ ...styles.logoText, color: '#000000' }, isDarkMode && { ...styles.logoText, color: '#ffffff' },]}>
            {<Icon_Ionicons name="chevron-back-outline" size={21} />} 회원 탈퇴
          </Text>
        </TouchableOpacity>
      </View>

      {/* 스크롤 */}
      <ScrollView style={[{ ...styles.scrollContainer, backgroundColor: '#f0f0f0', }, isDarkMode && { ...styles.scrollContainer, backgroundColor: '#000000', }]}>
        {/* 개인정보 */}
        <>
          <Text style={styles.InfoTopText}>탈퇴 사유</Text>
          <TouchableOpacity onPress={() => openSelectModal()} style={[{ ...styles.Info, backgroundColor: '#ffffff', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
            <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>{reason}</Text>
          </TouchableOpacity>
          <View style={{ marginBottom: 100, }}></View>
        </>
      </ScrollView>

      {/* 요청 */}
      <TouchableOpacity style={styles.checkBtnContainer} onPress={handleSubmit}>
        {isLoading === false ?
          <Text style={styles.checkBtnText}>{<Icon_Feather name="check" size={17} />} 탈퇴 신청</Text>
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