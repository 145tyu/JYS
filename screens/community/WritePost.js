import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, Button, KeyboardAvoidingView, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useIsFocused } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import { Picker } from '@react-native-picker/picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PERMISSIONS, request, check } from 'react-native-permissions';
import FastImage from 'react-native-fast-image';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';
import Icon_Entypo from 'react-native-vector-icons/Entypo';

import axiosInstance from '../../api/API_Server';

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
          <Text style={[{ ...uploadModalStyles.boxText, color: '#000000' }, isDarkMode && { ...uploadModalStyles.boxText, color: '#ffffff' }]}>게시글 생성 중... {uploadCount}</Text>
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

export default function WritePost({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'
  const isFocused = useIsFocused()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const [selectedImages, setSelectedImages] = useState([])
  const [uploadCount, setUploadCount] = useState('')

  const [selectBoard, setSelectBoard] = useState('board-Free')
  const [isSelectBoardVisible, setIsSelectBoardVisible] = useState(false)

  const [uploadModalState, setUploadModalState] = useState(false)

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission()
    if (hasPermission) {
      const options = {
        mediaType: 'photo',
        cameraType: 'back',
        quality: 0.5,
      }
      await launchCamera(options, async (res) => {
        if (res.didCancel) {
          return null
        } else if (res.errorCode) {
          return Alert.alert(res.errorCode, res.errorMessage)
        } else {
          const _imageData = res.assets
          setSelectedImages((prevImages) => [...prevImages, _imageData])
        }
      })
    } else {
      return Alert.alert('권한 확인', '카메라 권한을 확인해주세요.')
    }
  }

  const handleChoosePhoto = async () => {
    const options = {
      title: 'Select an image',
      quality: 0.5,
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
          const _imageData = res.assets
          setSelectedImages((prevImages) => [...prevImages, _imageData])
        }
      })
    } catch (error) {
      return Alert.alert('권한 확인', '저장공간 접근 권한이 없습니다.')
    }
  }

  const showSelectBoardPicker = () => {
    setIsSelectBoardVisible(true)
  }

  const hideSelectBoardPicker = () => {
    setIsSelectBoardVisible(false)
  }

  const handlePostForm = async (formData) => {
    setUploadModalState(true)
    try {
      await axiosInstance.post('/Community/postWrite', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: function (progressEvent) {
          var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadCount(percentCompleted)
        },
      }).then((res) => {
        setUploadModalState(false)
        if (res.status === 200) {
          Alert.alert('성공', res.data.message)
          return navigation.goBack()
        } else {
          return Alert.alert('에러', '게시글을 작성하지 못했습니다.')
        }
      }).catch((error) => {
        setUploadModalState(false)
        console.log(error)
        if (error.response) {
          const res = error.response
          if (res.status === 400) {
            return Alert.alert(res.data.error, res.data.errorDescription, [{ text: '확인', }])
          } else if (res.status === 500) {
            return Alert.alert(res.data.error, res.data.errorDescription, [{ text: '확인', }])
          } else {
            return Alert.alert('정보', '서버와 연결할 수 없습니다.', [{ text: '확인', }])
          }
        } else {
          return Alert.alert('정보', '서버와 연결할 수 없습니다.', [{ text: '확인', }])
        }
      })
    } catch (error) {
      setUploadModalState(false)
      return Alert.alert('에러', '게시글을 작성하지 못했어요.', [
        {
          text: '확인',
        }
      ])
    }
  }

  const handleSumit = async () => {
    AsyncStorage.getItem('id')
      .then(async (ID) => {
        AsyncStorage.getItem('job')
          .then(async (JOB) => {
            const formData = new FormData()
            if (selectedImages != 0) {
              selectedImages.forEach((imageData, index) => {
                formData.append(`image`, {
                  uri: imageData[0].uri,
                  type: imageData[0].type,
                  name: `image${index}${imageData[0].fileName.substr((imageData[0].fileName).indexOf('.'), imageData[0].fileName.length)}`,
                })
              })
            }
            formData.append('data', JSON.stringify({
              accountID: ID,
              job: JOB,
              category: selectBoard,
              title: title,
              content: content,
            }))
            handlePostForm(formData)
          }).catch((error) => {
            console.log(error)
          }).finally(() => {
            // setTitle('')
            // setContent('')
            // setSelectedImages([])
          })
      }).catch((error) => {
        console.log(error)
      }).finally(() => {
        // setTitle('')
        // setContent('')
        // setSelectedImages([])
      })
  }

  const renderSelectedImages = () => {
    return selectedImages.map((image, index) => (
      <FastImage key={index} source={{ uri: image[0].uri }} style={{ width: 150, height: 150, marginRight: 10, }} />
    ))
  }

  return (
    <SafeAreaView style={[{ ...styles.safeArea, backgroundColor: '#FFFFFF' }, isDarkMode && { ...styles.safeArea, backgroundColor: '#000000' }]}>
      <UploadModal uploadCount={uploadCount} isDarkMode={isDarkMode} visible={uploadModalState} />
      <KeyboardAvoidingView style={{ flex: 1, }} behavior={Platform.select({ ios: 'padding' })}>
        {/* 로고 */}
        <View style={styles.logoView}>
          <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 50 } : { ...styles.backButtonView, }} onPress={() => navigation.goBack()}>
            <Text style={[{ ...styles.logoText, color: '#000000' }, isDarkMode && { ...styles.logoText, color: '#ffffff' }]}>{<Icon_Ionicons name='chevron-back-outline' size={21} />} 게시글 작성</Text>
          </TouchableOpacity>

          <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.sendPostButtonView, marginTop: 50 } : { ...styles.sendPostButtonView }} onPress={handleSumit}>
            <Text style={{ textAlign: 'center', color: '#ffffff' }}>글쓰기</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={[{ ...styles.container, backgroundColor: '#FFFFFF' }, isDarkMode && { ...styles.container, backgroundColor: '#000000' }]}>
          {/* 게시판 선택 */}
          <View style={{ width: 'auto', height: 0.7, backgroundColor: '#333333' }}></View>
          <View>
            <>
              {Platform.OS === 'ios' ?
                <TouchableOpacity style={{ width: "100%", height: 50, marginLeft: 2, color: '#4682b4', justifyContent: 'center', }} onPress={() => showSelectBoardPicker()}>
                  <Text style={{ marginLeft: 7, fontSize: 15, color: '#4682b4', }}>
                    {selectBoard === 'board-Free' && <>자유게시판</>}
                    {selectBoard === 'board-Anonymous' && <>익명게시판</>}
                  </Text>
                  <Modal visible={isSelectBoardVisible} onRequestClose={hideSelectBoardPicker}>
                    <View style={{ flex: 1, justifyContent: 'center', }}>
                      <Picker
                        selectedValue={selectBoard}
                        onValueChange={(value) => setSelectBoard(value)}
                      >
                        <Picker.Item label='자유게시판' value='board-Free' />
                        <Picker.Item label='익명게시판' value='board-Anonymous' />
                      </Picker>
                      <Button title='닫기' onPress={hideSelectBoardPicker} />
                    </View>
                  </Modal>
                </TouchableOpacity>
                :
                <Picker
                  selectedValue={selectBoard}
                  onValueChange={(value) => setSelectBoard(value)}
                >
                  <Picker.Item label='자유게시판' value='board-Free' />
                  <Picker.Item label='익명게시판' value='board-Anonymous' />
                </Picker>
              }
            </>
          </View>
          <View style={{ width: 'auto', height: 0.7, backgroundColor: '#333333' }}></View>
          <TextInput
            style={[{ ...styles.titleInput, color: '#000000' }, isDarkMode && { ...styles.titleInput, color: '#ffffff' }]}
            placeholder="제목을 입력하세요"
            placeholderTextColor={isDarkMode ? '#ffffff' : '#000000'}
            value={title}
            onChangeText={(text) => setTitle(text)}
            multiline
          />
          <View style={{ width: 'auto', height: 0.7, backgroundColor: '#333333' }}></View>
          <TextInput
            style={[{ ...styles.contentInput, color: '#000000' }, isDarkMode && { ...styles.contentInput, color: '#ffffff' }]}
            placeholder="내용을 입력하세요"
            placeholderTextColor={isDarkMode ? '#ffffff' : '#000000'}
            value={content}
            onChangeText={(text) => setContent(text)}
            multiline
          />

          <View>
            <ScrollView horizontal style={{ marginTop: 20, }}>
              <TouchableOpacity
                style={{ width: 150, height: 150, marginRight: 10, borderRadius: 10, justifyContent: 'center', backgroundColor: '#DCDCDC' }}
                onPress={() => { Alert.alert('사진 선택', '사진을 업로드할 방식을 선택해주세요.', [{ text: '취소' }, { text: '카메라', onPress: () => { handleTakePhoto() } }, { text: '앨범', onPress: () => { handleChoosePhoto() } }]) }}
              >
                <Text style={{ textAlign: 'center' }}>
                  <Icon_Ionicons name="add-circle-outline" size={30} />
                </Text>
              </TouchableOpacity>
              {renderSelectedImages()}
            </ScrollView>
          </View>

          <View style={{ marginTop: 100, }}>
            <Text style={[{ color: '#999999', }, isDarkMode && { color: '#666666', }]}>
              영실커넥트는 누구나 기분 좋게 참여할 수 있는 커뮤니티를 만들기 위해 커뮤니티 이용규칙을 제정하여 운영하고 있습니다.
              {'\n'}{'\n'}
              위반 게시물이 삭제되고 서비스 이용이 일정 기간 제한될 수 있습니다.
              {'\n'}{'\n'}
              게시물 작성 전 커뮤니티 이용규칙을 반드시 확인하시기 바랍니다.
              {'\n'}{'\n'}
              1. 불법촬영물 유통 금지
              {'\n'}{'\n'}
              불법촬영물등을 게재할 경우 전기통신사업법에 따라 삭제 조치 및 서비스 이용이 영구적으로 제한될 수 있으며 관련 법률에 따라 처벌받을 수 있습니다.
              {'\n'}{'\n'}
              2. 규칙 위반
              {'\n'}{'\n'}
              - 타인의 권리를 침해하거나 불쾌감을 주는 행위
              {'\n'}
              - 범죄, 불법 행위 등 법령을 위반하는 행위
              {'\n'}
              - 욕설, 비하, 차별, 혐오, 자살, 폭력, 관련 내용을 포함한 게시물 작성 행위
              {'\n'}
              - 음란물, 성적 수치심을 유발하는 행위
              {'\n'}
              - 스포일러, 공포, 속임, 놀라게 하는 행위
              {'\n'}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 16,
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
  sendPostButtonView: {
    position: 'absolute',
    width: 60,
    height: 35,
    right: 20,
    borderRadius: 10,
    backgroundColor: '#9ACD32',
    justifyContent: 'center',
  },
  titleInput: {
    flex: 1,
    fontSize: 20,
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 8,
    paddingRight: 8,
    textAlignVertical: 'top', // 내용이 여러 줄일 경우 위쪽 정렬
  },
  contentInput: {
    flex: 1,
    marginBottom: 20,
    fontSize: 16,
    padding: 8,
    textAlignVertical: 'top', // 내용이 여러 줄일 경우 위쪽 정렬
  },
})