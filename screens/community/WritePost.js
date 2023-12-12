import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, Button, KeyboardAvoidingView, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useIsFocused } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import { Picker } from '@react-native-picker/picker';
import DocumentPicker from 'react-native-document-picker';
import ImagePicker from 'react-native-image-crop-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PERMISSIONS, request, check } from 'react-native-permissions';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-toast-message';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';
import Icon_Entypo from 'react-native-vector-icons/Entypo';

import axiosInstance from '../../api/API_Server';

const CAMERA_PERMISSION = Platform.select({
  ios: PERMISSIONS.IOS.CAMERA,
  android: PERMISSIONS.ANDROID.CAMERA,
})

const SelectBoardModal = ({ setSelectBoard, selectBoard, visible, isDarkMode, closeModal }) => {
  return (
    <Modal animationType='slide' transparent={true} visible={visible} onRequestClose={() => closeModal()}>
      <View style={SelectModalStyles.container}>
        <View style={{ ...SelectModalStyles.boxContainer, backgroundColor: isDarkMode ? '#363638' : '#EBEBEB', }}>
          <Picker
            style={{ color: isDarkMode ? '#ffffff' : '#000000' }}
            selectedValue={selectBoard}
            onValueChange={async (value) => {
              setSelectBoard(value)
              closeModal()
            }}
          >
            <Picker.Item label="자유게시판" value="board-Free" />
            <Picker.Item label="익명게시판" value="board-Anonymous" />
          </Picker>
          <View style={{ justifyContent: 'center', alignItems: 'center', }}>
            <TouchableOpacity style={SelectModalStyles.btn} onPress={() => closeModal()}>
              <Text style={SelectModalStyles.btnText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const SelectModalStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  boxContainer: {
    width: '95%',
    height: 'auto',
    padding: 15,
    borderRadius: 15,
    marginBottom: 50,
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
  },
  btn: {
    width: 100,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#EB4E45',
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '400',
    alignContent: 'center',
    alignItems: 'center',
  }
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

export default function WritePost({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'
  const isFocused = useIsFocused()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const [selectedImages, setSelectedImages] = useState([])
  const [uploadCount, setUploadCount] = useState('')

  const [selectBoard, setSelectBoard] = useState('board-Free')
  const [isSelectBoardVisible, setIsSelectBoardVisible] = useState(false)

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission()
    if (hasPermission) {
      ImagePicker.openCamera({
        mediaType: 'photo',
      }).then((res) => {
        if (res) {
          const _imageData = {
            ...res,
            fileName: res.filename ? res.filename : `media${selectedImages.length}-${res.modificationDate}-${res.size}.${(res.mime).split('/')[1]}`
          }
          setSelectedImages((prevImages) => [...prevImages, _imageData])
        } else {
          Toast.show({
            type: 'error',
            text1: '미디어를 추가하지 못했어요.',
            position: 'bottom',
          })
        }
      }).catch((error) => {
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

  const handleChooseMedia = async () => {
    try {
      await ImagePicker.openPicker({ mediaType: 'photo', })
        .then((res) => {
          if (res) {
            const _imageData = {
              ...res,
              fileName: res.filename ? res.filename : `media${selectedImages.length}-${res.modificationDate}-${res.size}.${(res.mime).split('/')[1]}`
            }
            setSelectedImages((prevImages) => [...prevImages, _imageData])
          } else {
            Toast.show({
              type: 'error',
              text1: '미디어를 추가하지 못했어요.',
              position: 'bottom',
            })
          }
        }).catch((error) => {
          Toast.show({
            type: 'error',
            text1: '미디어를 추가하지 못했어요.',
            text2: `${error}`,
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

  const handlePostForm = async (formData) => {
    setUploadCount(0)
    Toast.show({
      type: 'info',
      text1: `전송 중... ${uploadCount}`,
      text2: '앱을 종료하지 마세요.',
      autoHide: false,
      position: 'bottom',
    })

    try {
      await axiosInstance.post('/v2/Community/postWrite', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: function (progressEvent) {
          var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadCount(percentCompleted)
        },
      }).then((res) => {
        if (res.status === 200) {
          navigation.goBack()
          Toast.show({
            type: 'success',
            text1: `${res.data.message}`,
            position: 'bottom',
          })
        } else {
          Toast.show({
            type: 'error',
            text1: '게시글을 작성하지 못했어요.',
            position: 'bottom',
          })
        }
      }).catch((error) => {
        if (error.response) {
          const res = error.response
          if (res.status === 400) {
            Toast.show({
              type: 'error',
              text1: `${res.data.errorDescription}`,
              text2: `${res.data.error}`,
              position: 'bottom',
            })
          } else if (res.status === 500) {
            Toast.show({
              type: 'error',
              text1: `${res.data.errorDescription}`,
              text2: `${res.data.error}`,
              position: 'bottom',
            })
          } else {
            Toast.show({
              type: 'error',
              text1: '서버와 연결할 수 없습니다.',
              text2: '다시 시도해 주세요.',
              position: 'bottom',
            })
          }
        } else {
          Toast.show({
            type: 'error',
            text1: '서버와 연결할 수 없습니다.',
            text2: `${error}`,
            position: 'bottom',
          })
        }
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '게시글을 작성하지 못했어요.',
        text2: `${error}`,
        position: 'bottom',
      })
    }
  }

  const handleSumit = async () => {
    if (!title) {
      Toast.show({
        type: 'error',
        text1: '제목을 입력해주세요.',
        position: 'bottom',
      })
    } else if (!content) {
      Toast.show({
        type: 'error',
        text1: '내용을 입력해주세요.',
        position: 'bottom',
      })
    } else {
      const ID = await AsyncStorage.getItem('id')
      const JOB = await AsyncStorage.getItem('job')

      const formData = new FormData()

      if (selectedImages != 0) {
        selectedImages.forEach((media, index) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
          formData.append(`media`, {
            uri: media.path,
            type: media.mime,
            name: `media${index}-${uniqueSuffix}-${media.modificationDate}-${media.size}`,
          })
        })
      }

      formData.append('data', JSON.stringify({
        accountID: ID,
        job: JOB,
        category: selectBoard,
        title: title,
        content: content,
        date: new Date(),
      }))

      handlePostForm(formData)
    }
  }

  const handleDeleteSelectedImage = (index) => {
    const tempArray = selectedImages
    tempArray.splice(index, 1)
    setSelectedImages([...tempArray])
  }

  const renderSelectedImages = () => {
    return selectedImages.map((image, index) => (
      <View key={index}>
        <FastImage source={{ uri: image.path }} style={{ width: 150, height: 150, marginRight: 10, }} />
        <TouchableOpacity style={{ width: 23, height: 23, top: 5, right: 15, borderRadius: 5, position: 'absolute', justifyContent: 'center', alignItems: 'center', backgroundColor: '#DCDCDC', }} onPress={() => {
          handleDeleteSelectedImage(index)
        }}>
          <Icon_Feather name="x" size={20} color={'#000000'} />
        </TouchableOpacity>
      </View>
    ))
  }

  const showSelectBoardPicker = () => {
    setIsSelectBoardVisible(true)
  }

  const hideSelectBoardPicker = () => {
    setIsSelectBoardVisible(false)
  }

  return (
    <SafeAreaView style={{ ...styles.safeArea, backgroundColor: isDarkMode ? '#000000' : '#FFFFFF', }}>
      <KeyboardAvoidingView style={{ flex: 1, }} behavior={Platform.select({ ios: 'padding' })}>
        {/* 게시판 선택 모달 */}
        <SelectBoardModal setSelectBoard={setSelectBoard} selectBoard={selectBoard} visible={isSelectBoardVisible} isDarkMode={isDarkMode} closeModal={() => hideSelectBoardPicker()} />

        {/* 로고 */}
        <View style={styles.logoView}>
          <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 50 } : { ...styles.backButtonView, }} onPress={() => navigation.goBack()}>
            <Text style={{ ...styles.logoText, color: isDarkMode ? '#ffffff' : '#000000', }}>{<Icon_Ionicons name='chevron-back-outline' size={21} />} 게시글 작성</Text>
          </TouchableOpacity>

          <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.sendPostButtonView, marginTop: 50 } : { ...styles.sendPostButtonView }} onPress={handleSumit}>
            <Text style={{ textAlign: 'center', color: '#ffffff' }}>글쓰기</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ ...styles.container, backgroundColor: isDarkMode ? '#000000' : '#FFFFFF', }}>
          {/* 게시판 선택 */}
          <View style={{ borderTopWidth: 0.5, borderBottomColor: isDarkMode ? '#999999' : '#333333', }}>
            <TouchableOpacity style={{ width: "100%", height: 50, marginLeft: 2, color: '#4682b4', justifyContent: 'center', }} onPress={() => showSelectBoardPicker()}>
              <Text style={{ marginLeft: 7, fontSize: 15, color: '#4682b4', }}>
                {selectBoard === 'board-Free' && <>자유게시판</>}
                {selectBoard === 'board-Anonymous' && <>익명게시판</>}
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={{ ...styles.titleInput, borderTopWidth: 0.5, borderBottomColor: isDarkMode ? '#999999' : '#333333', color: isDarkMode ? '#ffffff' : '#000000', }}
            placeholder="제목을 입력하세요"
            placeholderTextColor={isDarkMode ? '#ffffff' : '#000000'}
            value={title}
            onChangeText={(text) => setTitle(text)}
            multiline
          />
          <TextInput
            style={{ ...styles.contentInput, borderTopWidth: 0.5, borderBottomColor: isDarkMode ? '#999999' : '#333333', color: isDarkMode ? '#ffffff' : '#000000', }}
            placeholder="내용을 입력하세요"
            placeholderTextColor={isDarkMode ? '#ffffff' : '#000000'}
            value={content}
            onChangeText={(text) => setContent(text)}
            multiline
          />

          <View>
            <ScrollView horizontal style={{ marginTop: 20, }}>
              {renderSelectedImages()}
              {selectedImages.length < 5 &&
                <TouchableOpacity style={{ width: 150, height: 150, marginRight: 10, borderRadius: 10, justifyContent: 'center', backgroundColor: '#DCDCDC' }}
                  onPress={() => {
                    Alert.alert('사진 선택', '사진을 업로드할 방식을 선택해주세요.', [
                      { text: '취소' },
                      {
                        text: '카메라', onPress: () => {
                          handleTakePhoto()
                        }
                      },
                      {
                        text: '앨범', onPress: () => {
                          handleChooseMedia()
                        }
                      }
                    ])
                  }}
                >
                  <Text style={{ textAlign: 'center' }}>
                    <Icon_Ionicons color={'#000000'} name="add-circle-outline" size={30} />
                  </Text>
                </TouchableOpacity>
              }
            </ScrollView>
          </View>

          <View style={{ marginTop: 100, }}>
            <Text style={{ color: isDarkMode ? '#666666' : '#999999', }}>
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
              {'\n'}{'\n'}
              3. 익명게시판
              {'\n'}{'\n'}
              - 익명게시판의 작성자 이름(댓글 포함)은 등록 시 매번 변경됩니다.
              {'\n'}
              - 규칙 위반 시 게시글이 경고 없이 삭제될 수 있습니다.
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