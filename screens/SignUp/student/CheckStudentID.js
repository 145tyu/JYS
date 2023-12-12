import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl, KeyboardAvoidingView, ScrollView, View, Image, Text, TextInput, Modal, Button, Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { CommonActions, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PERMISSIONS, request, check } from 'react-native-permissions';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-toast-message';
import ImagePicker from 'react-native-image-crop-picker';

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
    Toast.show({
      type: 'error',
      text1: '카메라 권한을 확인해주세요.',
      text2: `${error}`,
      position: 'bottom',
    })
    return false
  }
}

export default function S_SignUp_CheckStudentID({ navigation }) {
  const route = useRoute()
  const { data } = route.params

  const isDarkMode = useColorScheme() === 'dark'
  const [isLoading, setIsLoading] = useState(false)

  const [selectedMedia, setSelectedMedia] = useState([])
  const [uploadCount, setUploadCount] = useState('')

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission()
    if (hasPermission) {
      ImagePicker.openCamera({
        mediaType: 'photo',
      }).then((res) => {
        if (res) {
          const _imageData = {
            ...res,
            fileName: res.filename ? res.filename : `media${selectedMedia.length}-${res.modificationDate}-${res.size}.${(res.mime).split('/')[1]}`
          }
          setSelectedMedia([_imageData])
        } else {
          Toast.show({
            type: 'error',
            text1: '미디어를 추가하지 못했어요.',
            position: 'bottom',
          })
        }
      }).catch((error) => {
        console.log(error)
        Toast.show({
          type: 'error',
          text1: '미디어를 추가하지 못했어요.',
          position: 'bottom',
        })
      })
    } else {
      Toast.show({
        type: 'error',
        text1: '카메라 권한을 확인해주세요.',
        position: 'bottom',
      })
    }
  }

  const handleChoosePhoto = async () => {
    try {
      await ImagePicker.openPicker({ mediaType: 'photo', })
        .then((res) => {
          if (res) {
            const _imageData = {
              ...res,
              fileName: res.filename ? res.filename : `media${selectedMedia.length}-${res.modificationDate}-${res.size}.${(res.mime).split('/')[1]}`
            }
            setSelectedMedia([_imageData])
          } else {
            Toast.show({
              type: 'error',
              text1: '미디어를 추가하지 못했어요.',
              position: 'bottom',
            })
          }
        }).catch((error) => {
          console.log(error)
          Toast.show({
            type: 'error',
            text1: '미디어를 추가하지 못했어요.',
            position: 'bottom',
          })
        })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: `${error}`,
        position: 'bottom',
      })
    }
  }

  const handleCheckStudentIDForm = async (formData) => {
    Toast.show({
      type: 'info',
      text1: `전송 중... ${uploadCount}`,
      text2: '앱을 종료하지 마세요.',
      autoHide: false,
    })
    setIsLoading(true)
    await axiosInstance.post('/register/CheckStudentID', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: function (progressEvent) {
        var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        setUploadCount(percentCompleted)
      },
    }).then(async (res) => {
      setIsLoading(false)
      if (res.status === 200) {
        Toast.show({
          type: 'success',
          text1: `${res.data.message}`,
          autoHide: true,
        })
        if (res.data.birthDate) {
          const resData = res.data.birthDate
          const tempData = {
            ...data,
            birthday: `${resData.year}${resData.month}${resData.day}`,
          }
          return navigation.navigate('SignUp_LastCheck', { data: tempData, })
        } else {
          const tempData = {
            ...data,
            birthday: '',
          }
          return navigation.navigate('SignUp_LastCheck', { data: tempData, })
        }
      } else {
        Toast.show({
          type: 'error',
          text1: '학생증을 확인하지 못했어요.',
          autoHide: true,
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
            autoHide: true,
          })
        } else if (res.status === 500) {
          Toast.show({
            type: 'error',
            text1: `${res.data.errorDescription}`,
            text2: `${res.data.error}`,
            autoHide: true,
          })
        } else {
          Toast.show({
            type: 'error',
            text1: '서버와 연결할 수 없습니다.',
            text2: '다시 시도해 주세요.',
            autoHide: true,
          })
        }
      } else {
        Toast.show({
          type: 'error',
          text1: '서버와 연결할 수 없습니다.',
          text2: `${error}`,
          autoHide: true,
        })
      }
    })
  }

  const handleSumit = async () => {
    if (selectedMedia.length === 0) {
      Toast.show({
        type: 'error',
        text1: '먼저 사진을 선택해주세요.',
        position: 'bottom',
      })
    } else {
      Toast.show({
        type: 'info',
        text1: `업로드 준비 중...`,
        autoHide: false,
      })

      const formData = new FormData()
      selectedMedia.forEach((media, index) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        formData.append('image', {
          uri: media.path,
          type: media.mime,
          name: `media${index}-${uniqueSuffix}-${media.modificationDate}-${media.size}`,
        })
      })

      formData.append('data', JSON.stringify({
        studentID: `${data._grade}${data._class}${data._number}`,
        firstName: data.firstName,
        lastName: data.lastName,
      }))

      handleCheckStudentIDForm(formData)
    }
  }

  return (
    <SafeAreaView style={{ ...styles.container, backgroundColor: isDarkMode ? '#000000' : '#ffffff', }}>
      {/* 로고 */}
      < View style={styles.logoView} >
        <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 50 } : { ...styles.backButtonView, }} onPress={() => navigation.goBack()}>
          <Text style={{ ...styles.logoText, color: isDarkMode ? '#ffffff' : '#000000', }}>
            {<Icon_Ionicons name="chevron-back-outline" size={21} />}
          </Text>
        </TouchableOpacity>
      </View >

      <ScrollView contentContainerStyle={{ flexGrow: 1, }}>
        <View style={{ padding: 10, }}>
          <Text style={{ ...styles.Title, color: isDarkMode ? '#ffffff' : '#000000', }}>학생증을 확인할게요.{'\n'}학생증 사진을 제공해주세요.</Text>
        </View>

        <View style={{ marginTop: 25, justifyContent: 'center', alignItems: 'center', }}>
          <TouchableOpacity onPress={() => { Alert.alert('사진 선택', '사진을 업로드할 방식을 선택해주세요.', [{ text: '취소' }, { text: '카메라', onPress: () => { handleTakePhoto() } }, { text: '앨범', onPress: () => { handleChoosePhoto() } }]) }} style={[{ ...styles.inputView, borderColor: '#E9E9E9', backgroundColor: '#E9E9E9', }, isDarkMode && { ...styles.inputView, borderColor: '#333333', backgroundColor: '#333333', }]}>
            <Text style={{ color: isDarkMode ? '#ffffff' : '#000000', }}>여기를 눌러 사진을 선택해 주세요.</Text>
          </TouchableOpacity>
          <Text style={{ marginTop: 10, color: '#666666', textAlign: 'center', fontSize: 12 }}>학생증 확인 후 데이터는 바로 파기돼요.</Text>
        </View>

        {selectedMedia.length === 0 ?
          null
          :
          <View style={{ marginTop: 30, justifyContent: 'center', alignItems: 'center', }}>
            <View style={{ width: '90%', height: 'auto', borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)', }}>
              <TouchableOpacity onPress={() => setSelectedMedia([])} style={{ zIndex: 999, width: 30, height: 30, borderRadius: 5, top: 10, right: 10, position: 'absolute', justifyContent: 'center', alignItems: 'center', backgroundColor: '#DCDCDC', }}>
                <Icon_Feather name="x" size={20} color={'#000000'} />
              </TouchableOpacity>
              <FastImage resizeMode={FastImage.resizeMode.contain} source={{ uri: selectedMedia[0].path, priority: FastImage.priority.normal, }} style={{ width: windowWidth - 80, height: windowHeight - 300, marginTop: 20, }} />
            </View>
          </View>
        }

        <View style={{ marginBottom: 100, }}></View>
      </ScrollView>

      <View style={{ justifyContent: 'center', alignItems: 'center', }}>
        <TouchableOpacity disabled={selectedMedia.length != 0 ? false : true} style={{ ...styles.button, position: 'absolute', bottom: 30, backgroundColor: selectedMedia.length != 0 ? '#EB4E45' : '#D46A66', }} onPress={handleSumit}>
          {isLoading === false ?
            <Text style={styles.buttonText}>확인하기</Text>
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