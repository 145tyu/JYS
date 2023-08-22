import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl, KeyboardAvoidingView, ScrollView, View, Image, Text, TextInput, Modal, Button, Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { CommonActions, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PERMISSIONS, request, check } from 'react-native-permissions';
import FastImage from 'react-native-fast-image';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';
import Icon_Entypo from 'react-native-vector-icons/Entypo';

import axiosInstance from '../../../api/API_Server';

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

const CAMERA_PERMISSION = Platform.select({
  ios: PERMISSIONS.IOS.CAMERA,
  android: PERMISSIONS.ANDROID.CAMERA,
})

const requestCameraPermission = async () => {
  try {
    const result = await request(CAMERA_PERMISSION)
    return result === 'granted'
  } catch (error) {
    console.log('CameraPermission API | ', error)
    Alert.alert('CameraPermission API', `${error}`)
    return false
  }
}

const UploadModal = ({ uploadCount, isDarkMode, visible }) => {
  return (
    <Modal animationType='none' transparent={true} visible={visible}>
      <View style={uploadModalStyles.container}>
        <View style={[{ ...uploadModalStyles.boxContainer, borderBlockColor: '#f2f4f6' }, isDarkMode && { ...uploadModalStyles.boxContainer, backgroundColor: '#121212' }]}>
          <Text style={[{ ...uploadModalStyles.boxText, color: '#000000' }, isDarkMode && { ...uploadModalStyles.boxText, color: '#ffffff' }]}>서버로 전송 중... {uploadCount}</Text>
          <Text style={[{ ...uploadModalStyles.boxFooter, color: '#666666' }, isDarkMode && { ...uploadModalStyles.boxFooter, color: '#999999' }]}>앱을 종료하지 마세요.</Text>
          <ActivityIndicator style={{ marginTop: 10, }} size="large" color="blue" />
        </View>
      </View>
    </Modal>
  )
}

const uploadModalStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxContainer: {
    width: 300,
    height: 130,
    padding: 25,
    borderRadius: 15,
    backgroundColor: '#f2f4f6',
  },
  boxText: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
  },
  boxFooter: {
    marginTop: 5,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '400',
  }
})

export default function S_SignUp_CheckStudentID({ navigation }) {
  const route = useRoute()
  const { email, accountID, password, phoneNumber, _grade, _class, _number, firstName, lastName, } = route.params

  const isDarkMode = useColorScheme() === 'dark'
  const isFocused = useIsFocused()

  const [isLoading, setIsLoading] = useState(false)

  const [message, setMessage] = useState('학생증을 확인할게요.')

  const [imageData, setImageData] = useState([])
  const [uploadCount, setUploadCount] = useState('')

  const [uploadModalState, setUploadModalState] = useState(false)

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission()
    if (hasPermission) {
      const options = {
        mediaType: 'photo',
        cameraType: 'back',
        quality: 1,
      }
      await launchCamera(options, async (res) => {
        if (res.didCancel) {
          return null
        } else if (res.errorCode) {
          return Alert.alert(res.errorCode, res.errorMessage)
        } else {
          setImageData(res.assets)
          setMessage('학생증이 중앙에 오면 인식률이 올라가요!')
        }
      })
    } else {
      return Alert.alert('권한 확인', '카메라 권한을 확인해주세요.')
    }
  }

  const handleChoosePhoto = async () => {
    const options = {
      title: 'Select an image',
      quality: 1,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    }
    try {
      launchImageLibrary(options, (res) => {
        if (res.didCancel) {
          return null
        } else if (res.errorCode) {
          return Alert.alert(res.errorCode, res.errorMessage)
        } else {
          setImageData(res.assets)
          setMessage('학생증이 중앙에 오면 인식률이 올라가요!')
        }
      })
    } catch (error) {
      return Alert.alert('권한 확인', '저장공간 접근 권한이 없습니다.')
    }
  }

  const handleCheckStudentIDForm = async (formData) => {
    setIsLoading(true)
    setUploadModalState(true)
    setMessage('잠시 기다려주세요...')
    await axiosInstance.post('/register/CheckStudentID', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: function (progressEvent) {
        var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        setUploadCount(percentCompleted)
      },
    }).then(async (res) => {
      setIsLoading(false)
      setUploadModalState(false)
      if (res.status === 200) {
        setMessage('학생증을 확인했어요.')
        if (res.data.birthDate) {
          const data = res.data.birthDate
          return Alert.alert('정보', res.data.message, [{
            text: '확인', onPress: () => {
              return navigation.navigate('SignUp_LastCheck', { email: email, accountID: accountID, password: password, phoneNumber: phoneNumber, _grade: _grade, _class: _class, _number: _number, firstName: firstName, lastName: lastName, birthday: `${data.year}${data.month}${data.day}`, })
            }
          }])
        } else {
          return Alert.alert('정보', res.data.message, [{
            text: '확인', onPress: () => {
              return navigation.navigate('SignUp_LastCheck', { email: email, accountID: accountID, password: password, phoneNumber: phoneNumber, _grade: _grade, _class: _class, _number: _number, firstName: firstName, lastName: lastName, birthday: '', })
            }
          }])
        }
      } else {
        return Alert.alert('에러', '예외가 발생했습니다.\n나중에 다시 시도해 주세요.')
      }
    }).catch((error) => {
      setIsLoading(false)
      setUploadModalState(false)
      setMessage('학생증을 확인하지 못했어요.')
      console.log(error)
      const res = error.response
      if (res.status === 400) {
        return Alert.alert(res.data.error, res.data.errorDescription)
      } else if (res.status === 500) {
        return Alert.alert(res.data.error, res.data.errorDescription)
      } else {
        return Alert.alert('에러', '예외가 발생했습니다.\n나중에 다시 시도해 주세요.')
      }
    })
  }

  const handleSumit = async () => {
    if (imageData.length === 0) {
      setMessage('먼저 사진을 촬영하거나 선택해주세요.')
      return Alert.alert('경고', '이미지가 없습니다.')
    } else {
      const formData = new FormData()
      formData.append('image', {
        uri: imageData[0].uri,
        type: imageData[0].type,
        name: imageData[0].fileName,
      })
      formData.append('data', JSON.stringify({
        studentID: `${_grade}${_class}${_number}`,
        firstName: firstName,
        lastName: lastName,
      }))
      handleCheckStudentIDForm(formData)
    }
  }

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#ffffff' }, isDarkMode && { ...styles.container, backgroundColor: '#000000' }]}>
      {/* 업로드 모달 */}
      <UploadModal uploadCount={uploadCount} isDarkMode={isDarkMode} visible={uploadModalState} />
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', }}>
        <View style={{ marginTop: 20, }}>
          <FastImage style={{ width: 150, height: 150, }} source={require('../../../resource/logo_v1.png')} />
        </View>

        <View style={{ marginTop: 40, paddingLeft: 15, paddingRight: 15, }}>
          <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>{message}</Text>
        </View>

        <View style={{ marginTop: 25, }}>
          <TouchableOpacity onPress={() => { Alert.alert('사진 선택', '사진을 업로드할 방식을 선택해주세요.', [{ text: '취소' }, { text: '카메라', onPress: () => { handleTakePhoto() } }, { text: '앨범', onPress: () => { handleChoosePhoto() } }]) }} style={[{ ...styles.inputView, borderColor: '#E9E9E9', backgroundColor: '#E9E9E9', }, isDarkMode && { ...styles.inputView, borderColor: '#333333', backgroundColor: '#333333', }]}>
            <Text style={[{ color: '#000000' }, isDarkMode && { color: '#ffffff' }]}>여기를 눌러 사진을 선택해 주세요.</Text>
          </TouchableOpacity>
          <Text style={{ marginTop: 10, color: '#666666', textAlign: 'center', fontSize: 12 }}>학생증 확인 후 데이터는 바로 파기돼요.</Text>
        </View>

        {imageData.length === 0 ?
          null
          :
          <View>
            <FastImage resizeMode={FastImage.resizeMode.contain} source={{ uri: imageData[0].uri, priority: FastImage.priority.normal, }} style={{ width: windowWidth - 80, height: windowHeight - 300, marginTop: 20, }} />
          </View>
        }

        <View style={{ marginBottom: 100, }}></View>
      </ScrollView>

      <View style={{ justifyContent: 'center', alignItems: 'center', }}>
        <TouchableOpacity style={{ ...styles.nextBtn, position: 'absolute', bottom: 30, }} onPress={handleSumit}>
          {isLoading === false ?
            <Text style={styles.nextBtnText}>확인하기</Text>
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