import React, { useEffect, useState } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Image, Modal } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PERMISSIONS, request, check } from 'react-native-permissions';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';

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
    return false
  }
}

export default function StudentRoomCancel({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'

  const [isLoading, setIsLoading] = useState(false)

  const [roomStateType, setRoomStateType] = useState(null)
  const [roomNumber, setRoomNumber] = useState(null)
  const [roomAcceptor, setRoomAcceptor] = useState(null)
  const [roomPurpose, setRoomPurpose] = useState(null)

  const [imageURI, setImageURI] = useState(null)
  const [imageUploadCount, setImageUploadCount] = useState('')

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
          setImageData(res.assets[0].uri)
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
          setImageData(res.assets[0].uri)
        }
      })
    } catch (error) {
      return Alert.alert('권한 확인', '저장공간 접근 권한이 없습니다.')
    }
  }

  const rentalRefresh = async () => {
    setRoomStateType(null) // 'Type'을 'null'로 설정하여 '로딩중...'을 표시
    AsyncStorage.getItem('id') // 'ID' 가져오기
      .then(async (ID) => {
        axiosInstance.post('/RoomRental/CheckUserStatus', { id: ID }) // '/CheckUserStatus'에 'ID'값을 넣어 API요청
          .then((res) => {
            if (res.status === 200) { // 'status'가 '200'이면
              if (res.data.type === 3) { // 'Type'이 '3'이면 데이터를 순차적으로 저장
                setRoomStateType(res.data.type) // 'Type'을 '3'으로 설정
                setRoomNumber(res.data.room_number)
                setRoomAcceptor(res.data.acceptor)
                setRoomPurpose(res.data.purpose)
              }
            } else {
              setRoomStateType(0) // 'Type'을 '0'으로 설정
              setRoomStateMessage(error.message) // 'Message'를 'error.message'로 설정
            }
          }).catch((error) => {
            console.log('CheckUserStatus API | ', error)
            setRoomStateType(0) // 'Type'을 '0'으로 설정
            setRoomStateMessage(error.message) // 'Message'를 'error.message'로 설정
          })
      }).catch((error) => {
        console.log('CheckUserStatus API | ', error)
        setRoomStateType(0) // 'Type'을 '0'으로 설정
        setRoomStateMessage('에러가 발생했습니다.\n나중에 다시 시도해 주세요.') // 'Message'를 'error.message'로 설정
      })
  }

  const handleUploadPhoto = async () => {
    if (imageURI === null) {
      return Alert.alert('경고', '이미지가 선택되지 않았습니다.')
    } else {
      try {
        setIsLoading(true) // 로딩중 표시
        AsyncStorage.getItem('id')
          .then(async (ID) => {
            const formData = new FormData()
            formData.append('image', {
              uri: imageURI,
              type: 'image/jpeg',
              name: `${ID}.jpg`, // 파일 이름을 'userID'값으로 설정
            })

            axiosInstance.post('/RoomRental/ReturnImageUpload', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
              onUploadProgress: function (progressEvent) {
                var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                setImageUploadCount(percentCompleted)
              },
            }).then(async (res) => {
              if (res.status === 200) {
                setIsLoading(false)
                if (res.data.type === 1) {
                  return Alert.alert('에러', res.data.message)
                } else if (res.data.type === 2) {
                  Alert.alert('정보', res.data.message)
                  await axiosInstance.post('/RoomRental/RentalStop', { id: ID })
                    .then((res) => {
                      Alert.alert('정보', res.data.message)
                      return navigation.goBack()
                    }).catch((error) => {
                      setIsLoading(false)
                      console.log('RentalStop API | ', error)
                      return Alert.alert('에러', '요청을 실패했습니다.', [
                        {
                          text: '다시시도',
                          onPress: () => {
                            handleUploadPhoto()
                          },
                        },
                        {
                          text: '확인',
                        }
                      ])
                    })
                }
              } else {
                return Alert.alert('에러', '요청을 실패했습니다.', [
                  {
                    text: '다시시도',
                    onPress: () => {
                      handleUploadPhoto()
                    },
                  },
                  {
                    text: '확인',
                  }
                ])
              }
            }).catch((error) => {
              setIsLoading(false)
              console.log('RentalStop API | ', error)
              return Alert.alert('에러', '요청을 실패했습니다.', [
                {
                  text: '다시시도',
                  onPress: () => {
                    handleUploadPhoto()
                  },
                },
                {
                  text: '확인',
                }
              ])
            })
          })
      } catch (error) {
        setIsLoading(false)
        console.log(error)
        return Alert.alert('에러', '요청을 실패했습니다.', [
          {
            text: '다시시도',
            onPress: () => {
              handleUploadPhoto()
            },
          },
          {
            text: '확인',
          }
        ])
      }
    }
  }

  useEffect(() => {
    rentalRefresh()
  }, [])

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      {/* 로고 */}
      <View style={styles.logoView} >
        <TouchableOpacity style={styles.backButtonView} onPress={() => navigation.goBack()}>
          <Icon_Ionicons name='arrow-back-outline' size={30} style={[styles.backButtonIcon, isDarkMode && styles.backButtonIconDark]} />
        </TouchableOpacity>
        <Text style={[styles.logoText, isDarkMode && styles.logoTextDark]}>반납 신청</Text>
      </View>

      <ScrollView style={[styles.scrollContainer, isDarkMode && styles.scrollContainerDark]}>
        {/* 대여 정보 */}
        <>
          <Text style={roomStyles.InfoTopText}>대여 정보</Text>
          <View style={[roomStyles.Info, isDarkMode && roomStyles.InfoDark]}>
            {roomStateType === null ?
              <ActivityIndicator style={{ marginTop: 10, marginBottom: 10 }} size="large" color="#0000ff" />
              :
              <>
                {roomStateType === 3 ?
                  <>
                    <View>
                      <Text style={[roomStyles.Title, isDarkMode && roomStyles.TitleDark]}>부스번호</Text>
                      <Text style={roomStyles.Value}>{roomNumber}번</Text>
                    </View>

                    <View style={roomStyles.rankView}></View>

                    <View>
                      <Text style={[roomStyles.Title, isDarkMode && roomStyles.TitleDark]}>수락자</Text>
                      <Text style={roomStyles.Value}>{roomAcceptor}</Text>
                    </View>

                    <View style={roomStyles.rankView}></View>

                    <View>
                      <Text style={[roomStyles.Title, isDarkMode && roomStyles.TitleDark]}>사유</Text>
                      <Text style={roomStyles.Value}>{roomPurpose}</Text>
                    </View>
                  </>
                  :
                  <>
                    <Text style={[roomStyles.Text, isDarkMode && roomStyles.TextDark]}>불러오지 못했어요.</Text>
                    <TouchableOpacity style={{ ...roomStyles.rentalBtn, marginBottom: 10 }} onPress={rentalRefresh}>
                      <Text style={roomStyles.rentalBtnText}>다시시도</Text>
                    </TouchableOpacity>
                  </>
                }
              </>
            }
          </View>
        </>
        {/* 이미지 */}
        <>
          <Text style={roomStyles.InfoTopText}>이미지</Text>
          <View style={[roomStyles.Info, isDarkMode && roomStyles.InfoDark]}>
            {isLoading === false ?
              <View style={{ alignItems: 'center', }}>
                {imageURI ?
                  <Image source={{ uri: imageURI }} style={roomStyles.Image} />
                  :
                  <View>
                    <Text style={[roomStyles.Text, isDarkMode && roomStyles.TextDark]}>사진을 선택해야 반납신청을 할 수 있어요.</Text>
                    <TouchableOpacity style={roomStyles.imageBtn} onPress={handleTakePhoto}>
                      <Text style={roomStyles.imageBtnText}>{<Icon_Ionicons name='camera-outline' size={15}></Icon_Ionicons>} 사진 찍기</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={roomStyles.imageBtn} onPress={handleChoosePhoto}>
                      <Text style={roomStyles.imageBtnText}>{<Icon_Ionicons name='file-tray-full-outline' size={15}></Icon_Ionicons>} 사진 선택</Text>
                    </TouchableOpacity>
                  </View>
                }
              </View>
              :
              <View>
                <ActivityIndicator style={{ marginTop: 10 }} size="large" color="#0000ff" />
                <Text style={[roomStyles.Text, isDarkMode && roomStyles.TextDark]}>사진을 업로드 하고 있어요...({imageUploadCount})</Text>
              </View>
            }
          </View>
        </>
      </ScrollView>

      <View style={roomStyles.btnView}>
        <TouchableOpacity style={roomStyles.sumitBtn} onPress={() => {
          handleUploadPhoto()
        }}>
          {isLoading === true ?
            <ActivityIndicator size="small" color="#0000ff" />
            :
            <Text style={roomStyles.sumitBtnText}>대여 종료하기</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  containerDark: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContainer: {
    backgroundColor: '#F0F0F0',
  },
  scrollContainerDark: {
    backgroundColor: '#000000',
  },
  logoView: {
    height: '7%',
    marginTop: 20,
    marginBottom: 20,
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 21,
    fontWeight: 'bold',
    marginLeft: 60,
    color: 'black',
  },
  logoTextDark: {
    fontSize: 21,
    fontWeight: 'bold',
    marginLeft: 60,
    color: 'white',
  },
  backButtonView: {
    position: 'absolute',
    marginLeft: 15,
  },
  backButtonIcon: {
    color: 'black',
  },
  backButtonIconDark: {
    color: 'white',
  },
})

const roomStyles = StyleSheet.create({
  Info: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 25,
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
  },
  InfoDark: {
    backgroundColor: '#121212', // 다크모드에서의 배경색상
    padding: 20,
    borderRadius: 25,
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
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
  TitleDark: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '400',
    marginLeft: 5,
  },
  Text: {
    color: 'black',
    marginTop: 20,
    marginBottom: 20,
  },
  TextDark: {
    color: 'white',
    marginTop: 20,
    marginBottom: 20,
  },
  Value: {
    color: '#4682b4',
    fontSize: 14,
    marginLeft: 5,
  },
  rankView: {
    width: '100%',
    height: 1,
    marginTop: 15,
    marginBottom: 10,
    backgroundColor: 'gray',
  },
  rentalBtn: {
    backgroundColor: '#1E00D3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 0,
    marginBottom: 20,
  },
  rentalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 15,
  },
  Image: {
    width: '100%',
    height: 500,
    resizeMode: 'contain',
    marginTop: 5,
    marginBottom: 5,
    alignContent: 'center',
  },
  btnView: {
    alignSelf: 'center',
    position: 'absolute',
    bottom: 20,
  },
  imageBtn: {
    backgroundColor: '#1E00D3',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginLeft: 60,
    marginRight: 60,
    marginTop: 10,
    marginBottom: 3,
  },
  imageBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sumitBtn: {
    backgroundColor: '#1E00D3',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 3,
  },
  sumitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
})