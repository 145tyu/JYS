import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, Button, KeyboardAvoidingView, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useIsFocused } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import { Picker } from '@react-native-picker/picker';
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

const UserSelectionModal = ({
  checkGrade, checkDepartment,
  handleSetGrade, handleSetDepartment,
  isDarkMode, visible, closeModal }) => {
  return (
    <Modal animationType='slide' transparent={true} visible={visible} onRequestClose={() => closeModal()}>
      <View style={UserSelectionModalStyles.container}>
        <View style={[{ ...UserSelectionModalStyles.boxContainer, backgroundColor: '#EBEBEB' }, isDarkMode && { ...UserSelectionModalStyles.boxContainer, backgroundColor: '#363638' }]}>
          <Text style={[{ ...UserSelectionModalStyles.boxTitle, marginBottom: 10, color: '#000000', }, isDarkMode && { ...UserSelectionModalStyles.boxTitle, marginBottom: 10, color: '#ffffff', }]}>사용자 선택</Text>

          <ScrollView style={{}}>
            {/* 학년 */}
            <Text style={[{ fontWeight: 'bold', fontSize: 19, marginBottom: 3, color: '#000000', }, isDarkMode && { fontWeight: 'bold', fontSize: 19, marginBottom: 3, color: '#ffffff' }]}>학년</Text>
            <TouchableOpacity onPress={() => handleSetGrade(1)}>
              <Text style={[{ marginLeft: 3, fontWeight: '400', fontSize: 20, color: '#000000', }, isDarkMode && { marginLeft: 3, fontWeight: '400', fontSize: 20, color: '#ffffff', }]}>
                {checkGrade.Grade1 === true ? <Icon_Feather name='check-square' size={20} /> : <Icon_Feather name='square' size={20} />} 1학년
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSetGrade(2)}>
              <Text style={[{ marginLeft: 3, fontWeight: '400', fontSize: 20, color: '#000000', }, isDarkMode && { marginLeft: 3, fontWeight: '400', fontSize: 20, color: '#ffffff', }]}>
                {checkGrade.Grade2 === true ? <Icon_Feather name='check-square' size={20} /> : <Icon_Feather name='square' size={20} />} 2학년
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSetGrade(3)}>
              <Text style={[{ marginLeft: 3, fontWeight: '400', fontSize: 20, color: '#000000', }, isDarkMode && { marginLeft: 3, fontWeight: '400', fontSize: 20, color: '#ffffff', }]}>
                {checkGrade.Grade3 === true ? <Icon_Feather name='check-square' size={20} /> : <Icon_Feather name='square' size={20} />} 3학년
              </Text>
            </TouchableOpacity>

            {/* 학과 */}
            <Text style={[{ fontWeight: 'bold', marginTop: 10, fontSize: 19, marginBottom: 3, color: '#000000', }, isDarkMode && { fontWeight: 'bold', marginTop: 10, fontSize: 19, marginBottom: 3, color: '#ffffff' }]}>학과</Text>
            <TouchableOpacity onPress={() => handleSetDepartment('it')}>
              <Text style={[{ marginLeft: 3, fontWeight: '400', fontSize: 20, color: '#000000', }, isDarkMode && { marginLeft: 3, fontWeight: '400', fontSize: 20, color: '#ffffff', }]}>
                {checkDepartment.it === true ? <Icon_Feather name='check-square' size={20} /> : <Icon_Feather name='square' size={20} />} IT콘텐츠과
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSetDepartment('health')}>
              <Text style={[{ marginLeft: 3, fontWeight: '400', fontSize: 20, color: '#000000', }, isDarkMode && { marginLeft: 3, fontWeight: '400', fontSize: 20, color: '#ffffff', }]}>
                {checkDepartment.health === true ? <Icon_Feather name='check-square' size={20} /> : <Icon_Feather name='square' size={20} />} 보건간호과
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSetDepartment('beauty')}>
              <Text style={[{ marginLeft: 3, fontWeight: '400', fontSize: 20, color: '#000000', }, isDarkMode && { marginLeft: 3, fontWeight: '400', fontSize: 20, color: '#ffffff', }]}>
                {checkDepartment.beauty === true ? <Icon_Feather name='check-square' size={20} /> : <Icon_Feather name='square' size={20} />} 뷰티미용과
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSetDepartment('cook')}>
              <Text style={[{ marginLeft: 3, fontWeight: '400', fontSize: 20, color: '#000000', }, isDarkMode && { marginLeft: 3, fontWeight: '400', fontSize: 20, color: '#ffffff', }]}>
                {checkDepartment.cook === true ? <Icon_Feather name='check-square' size={20} /> : <Icon_Feather name='square' size={20} />} 외식조리과
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={{ height: 30, }}>
            <Text>전송대상 : </Text>
          </View>

          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            {/* <View style={{ ...UserSelectionModalStyles.btn, width: 145, backgroundColor: '#FB9E95' }} onPress={() => closeModal()}>
              <Text style={UserSelectionModalStyles.btnText}>커스텀</Text>
            </View> */}
            <TouchableOpacity style={{ ...UserSelectionModalStyles.btn, }} onPress={() => closeModal()}>
              <Text style={UserSelectionModalStyles.btnText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const UserSelectionModalStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  boxContainer: {
    width: '95%',
    height: 450,
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
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

export default function WriteAnnouncement({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'
  const isFocused = useIsFocused()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const [selectedImages, setSelectedImages] = useState([])

  const [checkGrade, setCheckGrade] = useState({
    Grade1: false,
    Grade2: false,
    Grade3: false,
  })

  const [checkDepartment, setCheckDepartment] = useState({
    it: false,
    health: false,
    beauty: false,
    cook: false,
  })

  const [FcmTokenArray, setFcmTokenArray] = useState([])

  const [UserSelectionModalState, setUserSelectionModalState] = useState(false)

  const [uploadCount, setUploadCount] = useState('')
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
          Toast.show({
            type: 'error',
            text1: `${res.errorMessage}`,
            text2: `${res.errorCode}`,
          })
        } else {
          const _imageData = res.assets
          setSelectedImages((prevImages) => [...prevImages, _imageData])
        }
      })
    } else {
      Toast.show({
        type: 'error',
        text1: '카메라 권한을 확인해주세요.',
        text2: '권한 확인 필요!',
      })
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
          Toast.show({
            type: 'error',
            text1: `${res.errorMessage}`,
            text2: `${res.errorCode}`,
          })
        } else {
          const _imageData = res.assets
          setSelectedImages((prevImages) => [...prevImages, _imageData])
        }
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '저장공간 접근 권한이 없습니다.',
        text2: `${error}`,
      })
    }
  }

  const handlePostForm = async (formData) => {
    setUploadModalState(true)
    try {
      await axiosInstance.post('/Announcement/postWrite', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: function (progressEvent) {
          var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadCount(percentCompleted)
        },
      }).then((res) => {
        setUploadModalState(false)
        if (res.status === 200) {
          const data = res.data.data
          const postID = data.insertId
          Alert.alert('정보', `${res.data.message}\n기기에 푸쉬를 발송하겠습니까?`, [
            {
              text: '전송', onPress: () => {
                handlePushSend(postID)
                navigation.goBack()
              }
            },
            {
              text: '아니요', onPress: () => {
                navigation.goBack()
              }
            }
          ])
        } else {
          Toast.show({
            type: 'error',
            text1: '공지를 작성하지 못했습니다.',
          })
        }
      }).catch((error) => {
        setUploadModalState(false)
        console.log(error)
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
      setUploadModalState(false)
      Toast.show({
        type: 'error',
        text1: '공지를 작성하지 못했어요.',
        text2: `${error}`,
      })
    }
  }

  const handleSumit = async () => {
    const tempData = []
    tempData.push(checkGrade)
    tempData.push(checkDepartment)
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
              title: title,
              content: content,
              category: JSON.stringify(tempData)
            }))
            handlePostForm(formData)
          }).catch((error) => {
            Toast.show({
              type: 'error',
              text1: '예외가 발생했습니다.',
              text2: `${error}`,
            })

          })
      }).catch((error) => {
        Toast.show({
          type: 'error',
          text1: '예외가 발생했습니다.',
          text2: `${error}`,
        })
      })
  }

  const handleActivatedDepartments = () => {
    const departmentRanges = {
      'it': [1, 2],
      'health': [3, 4],
      'beauty': [5, 6],
      'cook': [7, 8],
    }

    for (const gradeKey in checkGrade) {
      if (checkGrade.hasOwnProperty(gradeKey) && checkGrade[gradeKey] === true) {
        const gradeText = gradeKey.replace('Grade', '') // 학년 값 추출
        //console.log(`${gradeText}학년 활성화`)

        for (const departmentKey in checkDepartment) {
          if (checkDepartment.hasOwnProperty(departmentKey) && checkDepartment[departmentKey] === true) {
            const [start, end] = departmentRanges[departmentKey]
            for (let i = start; i <= end; i++) {
              handleUserInquiry(Number(gradeText), i)
            }
          }
        }
      }
    }
  }

  const handleUserInquiry = async (grade, department) => {
    setFcmTokenArray([])
    try {
      await axiosInstance.post('/v1/profile/userInquiry', { grade: grade, department: department })
        .then((res) => {
          if (res.status === 200) {
            const data = res.data.data
            data.map((_data) => {
              handleFcmTokenInquiry(_data.id)
            })
          } else {
            Toast.show({
              type: 'error',
              text1: '사용자를 불러오지 못했습니다.',
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
      Toast.show({
        type: 'error',
        text1: '예외가 발생했습니다.',
        text2: `${error}`,
      })
    }
  }

  const handleFcmTokenInquiry = async (accountID) => {
    try {
      await axiosInstance.post('/v1/Fcm/tokenInquiry', { accountID: accountID })
        .then((res) => {
          if (res.status === 200) {
            console.log(res.data.data)
            const data = res.data.data
            setFcmTokenArray(prevFcmTokens => {
              const newFcmTokens = data.map((_data) => _data.fcmToken)
              return [...prevFcmTokens, ...newFcmTokens]
            })
          } else {
            Toast.show({
              type: 'error',
              text1: '조회를 실패했습니다.',
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
      Toast.show({
        type: 'error',
        text1: '예외가 발생했습니다.',
        text2: `${error}`,
      })
    }
  }

  const handlePushSend = async (postID) => {
    console.log(FcmTokenArray)

    const message = {
      notification: {
        title: '새로운 공지가 등록되었습니다.',
        body: title,
      },
      data: {
        screenType: 'Announcement_ViewPost',
        screenData: `${postID},`
      },
    }

    await axiosInstance.post('/Fcm/pushSend', { FcmTokenArray: FcmTokenArray, message: message })
      .then((res) => {
        if (res.status === 200) {
          Toast.show({
            type: 'error',
            text1: `${res.data.message}`,
          })
        } else {
          Toast.show({
            type: 'error',
            text1: '전송을 실패했습니다.',
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
  }

  const renderSelectedImages = () => {
    return selectedImages.map((image, index) => (
      <FastImage key={index} source={{ uri: image[0].uri }} style={{ width: 150, height: 150, marginRight: 10, }} />
    ))
  }

  const handleSetGrade = (value) => {
    if (value === 1) {
      setCheckGrade(prevState => ({
        ...prevState,
        Grade1: checkGrade.Grade1 === true ? false : true
      }))
    } else if (value === 2) {
      setCheckGrade(prevState => ({
        ...prevState,
        Grade2: checkGrade.Grade2 === true ? false : true
      }))
    } else if (value === 3) {
      setCheckGrade(prevState => ({
        ...prevState,
        Grade3: checkGrade.Grade3 === true ? false : true
      }))
    }
  }

  const handleSetDepartment = (value) => {
    if (value === 'it') {
      setCheckDepartment(prevState => ({
        ...prevState,
        it: checkDepartment.it === true ? false : true
      }))
    } else if (value === 'health') {
      setCheckDepartment(prevState => ({
        ...prevState,
        health: checkDepartment.health === true ? false : true
      }))
    } else if (value === 'beauty') {
      setCheckDepartment(prevState => ({
        ...prevState,
        beauty: checkDepartment.beauty === true ? false : true
      }))
    } else if (value === 'cook') {
      setCheckDepartment(prevState => ({
        ...prevState,
        cook: checkDepartment.cook === true ? false : true
      }))
    }
  }

  const UserSelectionOpenModal = () => {
    setUserSelectionModalState(true)
  }

  const UserSelectionCloseModal = () => {
    setUserSelectionModalState(false)
    handleActivatedDepartments()
  }

  return (
    <SafeAreaView style={[{ ...styles.safeArea, backgroundColor: '#FFFFFF' }, isDarkMode && { ...styles.safeArea, backgroundColor: '#000000' }]}>
      {/* 업로드 모달 */}
      <UploadModal uploadCount={uploadCount} isDarkMode={isDarkMode} visible={uploadModalState} />
      {/* 사용자 선택 모달 */}
      <UserSelectionModal
        checkGrade={checkGrade} checkDepartment={checkDepartment}
        handleSetGrade={handleSetGrade} handleSetDepartment={handleSetDepartment}
        isDarkMode={isDarkMode} visible={UserSelectionModalState}
        closeModal={() => UserSelectionCloseModal()}
      />

      <KeyboardAvoidingView style={{ flex: 1, }} behavior={Platform.select({ ios: 'padding' })}>
        {/* 로고 */}
        <View style={styles.logoView}>
          <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 50 } : { ...styles.backButtonView, }} onPress={() => navigation.goBack()}>
            <Text style={[{ ...styles.logoText, color: '#000000' }, isDarkMode && { ...styles.logoText, color: '#ffffff' }]}>{<Icon_Ionicons name='chevron-back-outline' size={21} />} 공지 작성</Text>
          </TouchableOpacity>

          <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.sendPostButtonView, marginTop: 50 } : { ...styles.sendPostButtonView }} onPress={handleSumit}>
            <Text style={{ textAlign: 'center', color: '#ffffff' }}>전송</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={[{ ...styles.container, backgroundColor: '#FFFFFF' }, isDarkMode && { ...styles.container, backgroundColor: '#000000' }]}>
          {/* 게시판 선택 */}
          <View style={{ width: 'auto', height: 0.7, backgroundColor: '#333333' }}></View>
          <TouchableOpacity onPress={() => UserSelectionOpenModal()}>
            <Text style={[{ ...styles.titleInput, color: '#000000' }, isDarkMode && { ...styles.titleInput, color: '#ffffff' }]}>전송 대상 | {FcmTokenArray.length}개의 기기</Text>
          </TouchableOpacity>
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