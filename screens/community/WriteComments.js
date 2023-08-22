import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl, KeyboardAvoidingView, ScrollView, View, Image, Text, TextInput, Modal } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { CommonActions, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PERMISSIONS, request, check } from 'react-native-permissions';
import FastImage from 'react-native-fast-image';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';
import Icon_Entypo from 'react-native-vector-icons/Entypo';

import axiosInstance from '../../api/API_Server';
import ImageViewer from '../../api/ImageViewer';

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
          <Text style={[{ ...uploadModalStyles.boxText, color: '#000000' }, isDarkMode && { ...uploadModalStyles.boxText, color: '#ffffff' }]}>댓글 생성 중... {uploadCount}</Text>
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

export default function WriteComments({ navigation }) {
  const route = useRoute()
  const { postID } = route.params

  const isDarkMode = useColorScheme() === 'dark'
  const isFocused = useIsFocused()

  const [refreshing, setRefreshing] = useState(false)

  const [commentsData, setCommentsData] = useState([])
  const [commentsType, setCommentsType] = useState(null)

  const [repliesData, setRepliesData] = useState([])
  const [repliesType, setRepliesType] = useState(null)

  const [commentsForm, setCommentsForm] = useState('')

  const [imageData, setImageData] = useState([])
  const [uploadCount, setUploadCount] = useState('')

  const [imageViewerState, setImageViewerState] = useState(false)
  const [imageViewerData, setImageViewerData] = useState('')
  const [imageViewerInfo, setImageViewerInfo] = useState([])

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
          setImageData(res.assets)
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
          setImageData(res.assets)
        }
      })
    } catch (error) {
      return Alert.alert('권한 확인', '저장공간 접근 권한이 없습니다.')
    }
  }

  const commentsCheck = async () => {
    setCommentsType(null)
    try {
      await axiosInstance.post('/Community/commentsCheck', { postID: postID })
        .then((res) => {
          const data = res.data.data
          setCommentsData(data)
          setCommentsType(1)
        }).catch((error) => {
          setCommentsType(0)
          console.log(error)
          if (error.response) {
            const res = error.response
            if (res.status === 400) {
              return Alert.alert(res.data.error, res.data.errorDescription, [
                { text: '확인' },
              ])
            } else if (res.status === 500) {
              return Alert.alert(res.data.error, res.data.errorDescription, [
                { text: '확인' },
              ])
            } else {
              return Alert.alert('정보', '서버와 연결할 수 없습니다.', [
                { text: '확인' },
              ])
            }
          } else {
            return Alert.alert('정보', '서버와 연결할 수 없습니다.', [
              { text: '확인' },
            ])
          }
        })
    } catch (error) {
      setCommentsType(0)
      console.log(error)
    }
  }

  const repliesCheck = async () => {
    setRepliesType(null)
    try {
      await axiosInstance.post('/Community/repliesCheck', { postID: postID })
        .then((res) => {
          const data = res.data.data
          setRepliesData(data)
          setRepliesType(1)
        }).catch((error) => {
          setRepliesType(0)
          console.log(error)
          if (error.response) {
            const res = error.response
            if (res.status === 400) {
              return Alert.alert(res.data.error, res.data.errorDescription, [
                { text: '확인' },
              ])
            } else if (res.status === 500) {
              return Alert.alert(res.data.error, res.data.errorDescription, [
                { text: '확인' },
              ])
            } else {
              return Alert.alert('정보', '서버와 연결할 수 없습니다.', [
                { text: '확인' },
              ])
            }
          } else {
            return Alert.alert('정보', '서버와 연결할 수 없습니다.', [
              { text: '확인' },
            ])
          }
        })
    } catch (error) {
      setRepliesType(0)
      console.log(error)
    }
  }

  const handleCommentsForm = async (formData) => {
    setUploadModalState(true)
    try {
      await axiosInstance.post('/Community/commentsForm', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: function (progressEvent) {
          var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadCount(percentCompleted)
        },
      }).then(async (res) => {
        setUploadModalState(false)
        if (res.status === 200) {
          commentsCheck()
          repliesCheck()
        } else {
          return Alert.alert('에러', '댓글을 작성하지 못했어요.')
        }
      }).catch((error) => {
        setUploadModalState(false)
        console.log(error)
        if (error.response) {
          const res = error.response
          if (res.status === 400) {
            return Alert.alert(res.data.error, res.data.errorDescription, [
              { text: '확인' },
            ])
          } else if (res.status === 500) {
            return Alert.alert(res.data.error, res.data.errorDescription, [
              { text: '확인' },
            ])
          } else {
            return Alert.alert('정보', '서버와 연결할 수 없습니다.', [
              { text: '확인' },
            ])
          }
        } else {
          return Alert.alert('정보', '서버와 연결할 수 없습니다.', [
            { text: '확인' },
          ])
        }
      })
    } catch (error) {
      console.log(error)
      setUploadModalState(false)
      return Alert.alert('에러', '댓글을 작성하지 못했어요.', [
        {
          text: '확인',
        }
      ])
    }
  }

  const handleSumit = async () => {
    await AsyncStorage.getItem('id')
      .then(async (ID) => {
        const formData = new FormData()
        if (imageData.length != 0 && commentsForm != '') { // 이미지, 글 모두 있을 때
          formData.append('image', {
            uri: imageData[0].uri,
            type: imageData[0].type,
            name: imageData[0].fileName,
          })
          formData.append('data', JSON.stringify({
            accountID: ID,
            postID: postID,
            content: commentsForm,
          }))
        } else if (imageData.length != 0) { // 이미지만 있을 때
          formData.append('image', {
            uri: imageData[0].uri,
            type: imageData[0].type,
            name: imageData[0].fileName,
          })
          formData.append('data', JSON.stringify({
            accountID: ID,
            postID: postID,
          }))
        } else { // 글만 있을 때
          formData.append('data', JSON.stringify({
            accountID: ID,
            postID: postID,
            content: commentsForm,
          }))
        }
        handleCommentsForm(formData)
      }).catch((error) => {
        console.log(error)
      }).finally(() => {
        setCommentsForm('')
        setImageData([])
        setUploadCount('')
      })
  }

  const handleRefresh = () => {
    setRefreshing(true)
    commentsCheck()
    repliesCheck()
    setRefreshing(false)
  }

  const openImageViewer = (imageData, imageInfo) => {
    setImageViewerData(imageData)
    setImageViewerInfo(imageInfo)
    setImageViewerState(true)
  }

  const closeImageViewer = () => {
    setImageViewerData('')
    setImageViewerState(false)
  }

  useEffect(() => {
    commentsCheck()
    repliesCheck()
  }, [isFocused])

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#ffffff' }, isDarkMode && { ...styles.container, backgroundColor: '#000000' }]}>
      {/* 이미지뷰어 */}
      <ImageViewer imageData={imageViewerData} imageInfo={imageViewerInfo} visible={imageViewerState} onClose={() => closeImageViewer()} />
      {/* 업로드 모달 */}
      <UploadModal uploadCount={uploadCount} isDarkMode={isDarkMode} visible={uploadModalState} />

      <KeyboardAvoidingView style={{ flex: 1, }} behavior={Platform.select({ ios: 'padding' })}>
        {/* 로고 */}
        <View style={styles.logoView}>
          <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 50 } : { ...styles.backButtonView }} onPress={() => navigation.goBack()}>
            <Text style={[{ ...styles.logoText, color: '#000000' }, isDarkMode && { ...styles.logoText, color: '#ffffff' }]}>{<Icon_Ionicons name='chevron-back-outline' size={21} />} 댓글 {commentsData === null ? '0' : commentsData.length}</Text>
          </TouchableOpacity>
        </View>

        {commentsType === null || repliesType === null ?
          <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', }}>
            <ActivityIndicator size="large" color="green" />
          </View>
          :
          <>
            {commentsType === 0 || repliesType === 0 ?
              <>
                <View style={{ ...StyleSheet.absoluteFillObject, ...styles.MessageContainer, }}>
                  <Text style={[{ ...styles.Message, color: '#666666', }, isDarkMode && { ...styles.Message, color: '#999999', }]}>댓글을 불러오지 못했어요.</Text>
                </View>

                <View style={{ ...StyleSheet.absoluteFillObject, ...styles.refresBtnContainer, }}>
                  <TouchableOpacity onPress={() => { handleRefresh() }} style={{ ...styles.refresBtn, }}>
                    <Text style={{ textAlign: 'center', color: '#ffffff' }}>다시시도</Text>
                  </TouchableOpacity>
                </View>
              </>
              :
              <>
                <ScrollView style={[{ ...styles.scrollContainer, backgroundColor: '#ffffff' }, isDarkMode && { ...styles.scrollContainer, backgroundColor: '#000000' }]} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
                  {commentsType === 1 && repliesType === 1 ?
                    <>
                      {commentsData.length != 0 &&
                        <View style={[{ ...styles.CommentsContainer, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.CommentsContainer, backgroundColor: '#121212' }]}>
                          {commentsData.map((data) => {
                            return (
                              <View key={data.id} style={{ flex: 1, marginTop: 10, }}>
                                {/* 아이콘 */}
                                <View>
                                  <View style={{ width: 40, height: 40, left: 7, borderRadius: 25, backgroundColor: '#dcdcdc', position: 'absolute' }}></View>
                                  <Icon_Feather name='user' size={20} style={{ left: 17, top: 8, borderRadius: 25, color: 'black', position: 'absolute' }} />
                                </View>

                                <View>
                                  {/* 댓글 모달 */}
                                  <TouchableOpacity style={{ position: 'absolute', right: 10 }}>
                                    {/* <Icon_Ionicons name='ellipsis-horizontal-circle-outline' size={20} style={[{color: '#000000'}, isDarkMode && {color: '#ffffff'}]}/> */}
                                  </TouchableOpacity>
                                  {/* 사용자ID */}
                                  <Text style={[{ ...styles.CommentsAuthorText, color: '#000000' }, isDarkMode && { ...styles.CommentsAuthorText, color: '#ffffff' }]}>{data.author}</Text>

                                  {/* 댓글만 존재 */}
                                  {data.content != null && !data.image &&
                                    <Text style={[{ ...styles.CommentsContentText, color: '#000000' }, isDarkMode && { ...styles.CommentsContentText, color: '#ffffff' }]}>{data.content}</Text>
                                  }
                                  {/* 이미지만 존재 */}
                                  {data.content === null && data.image &&
                                    <>
                                      <Text style={[{ ...styles.CommentsContentText, color: '#000000' }, isDarkMode && { ...styles.CommentsContentText, color: '#ffffff' }]}>{data.content}</Text>
                                      <TouchableOpacity onPress={() => { openImageViewer(`data:${JSON.parse(data.image_Info).type};base64,${data.image}`, JSON.parse(data.image_Info)) }}>
                                        <FastImage
                                          style={{ maxWidth: 250, width: JSON.parse(data.image_Info).width / 6, height: JSON.parse(data.image_Info).height / 6, left: 58, marginBottom: 5, }}
                                          source={{
                                            uri: `data:${JSON.parse(data.image_Info).type};base64,${data.image}`, // 또는 require()로 local 이미지 사용 가능
                                            priority: FastImage.priority.normal, // 다운로드 우선순위 설정 (optional)
                                          }}
                                        //resizeMode={FastImage.resizeMode.contain} // 이미지 크기 조절 방식 설정 (optional)
                                        />
                                      </TouchableOpacity>
                                    </>
                                  }
                                  {/* 댓글, 이미지 존재 */}
                                  {data.content != null && data.image &&
                                    <>
                                      <Text style={[{ ...styles.CommentsContentText, color: '#000000' }, isDarkMode && { ...styles.CommentsContentText, color: '#ffffff' }]}>{data.content}</Text>
                                      <TouchableOpacity style={{ marginTop: 7, }} onPress={() => { openImageViewer(`data:${JSON.parse(data.image_Info).type};base64,${data.image}`, JSON.parse(data.image_Info)) }}>
                                        <FastImage
                                          style={{ maxWidth: 250, width: JSON.parse(data.image_Info).width / 6, height: JSON.parse(data.image_Info).height / 6, left: 58, marginBottom: 5, }}
                                          source={{
                                            uri: `data:${JSON.parse(data.image_Info).type};base64,${data.image}`, // 또는 require()로 local 이미지 사용 가능
                                            priority: FastImage.priority.normal, // 다운로드 우선순위 설정 (optional)
                                          }}
                                        //resizeMode={FastImage.resizeMode.contain} // 이미지 크기 조절 방식 설정 (optional)
                                        />
                                      </TouchableOpacity>
                                    </>
                                  }

                                  {/* 작성 시간 */}
                                  <View>
                                    <Text key={data.id} style={[{ ...styles.CommentsDateText, color: '#000000' }, isDarkMode && { ...styles.CommentsDateText, color: '#ffffff' }]}>{data.date.substring(0, 10)} {data.date.substring(11, 19)}</Text>
                                    <TouchableOpacity style={{ position: 'absolute', marginLeft: 165, }} onPress={() => navigation.navigate('Community_WriteReplies', { commentsID: data.id, postID: postID })}>
                                      <Text style={[{ ...styles.RepliesButtonText, color: '#000000', }, isDarkMode && { ...styles.RepliesButtonText, color: '#ffffff' }]}>  답글쓰기</Text>
                                    </TouchableOpacity>
                                  </View>
                                </View>

                                <View style={{ marginBottom: 15 }}></View>

                                {/* 대댓글 */}
                                {repliesData.length != 0 &&
                                  <>
                                    {repliesData.map((_data) => {
                                      if (data.id === _data.comments_id) {
                                        return (
                                          <View key={_data.id} style={{ flex: 1 }}>
                                            {/* 아이콘 */}
                                            <View>
                                              <View style={{ width: 30, height: 30, left: 37, borderRadius: 25, backgroundColor: '#C0C0C0', position: 'absolute' }}></View>
                                              <Icon_Feather name='user' size={15} style={{ left: 45, top: 7, borderRadius: 25, color: 'black', position: 'absolute' }} />
                                            </View>

                                            {/* 답글 */}
                                            <View key={data.id} style={{ marginBottom: 13, }} onPress={() => navigation.navigate('Community_WriteReplies', { commentsID: data.id, postID: postID })}>
                                              {/* 사용자ID */}
                                              <Text style={[{ ...styles.RepliesAuthorText, color: '#000000' }, isDarkMode && { ...styles.RepliesAuthorText, color: '#ffffff' }]}>{_data.author}</Text>

                                              {/* 댓글만 존재 */}
                                              {_data.content != null && !_data.image &&
                                                <Text style={[{ ...styles.RepliesContentText, color: '#000000' }, isDarkMode && { ...styles.RepliesContentText, color: '#ffffff' }]}>{_data.content}</Text>
                                              }
                                              {/* 이미지만 존재 */}
                                              {_data.content === null && _data.image &&
                                                <>
                                                  <Text style={[{ ...styles.RepliesContentText, color: '#000000' }, isDarkMode && { ...styles.RepliesContentText, color: '#ffffff' }]}>{_data.content}</Text>
                                                  <TouchableOpacity onPress={() => { openImageViewer(`data:${JSON.parse(_data.image_Info).type};base64,${_data.image}`, JSON.parse(_data.image_Info)) }}>
                                                    <FastImage
                                                      style={{ maxWidth: 230, width: JSON.parse(_data.image_Info).width / 6, height: JSON.parse(_data.image_Info).height / 6, left: 78, marginBottom: 5, }}
                                                      source={{
                                                        uri: `data:${JSON.parse(_data.image_Info).type};base64,${_data.image}`, // 또는 require()로 local 이미지 사용 가능
                                                        priority: FastImage.priority.normal, // 다운로드 우선순위 설정 (optional)
                                                      }}
                                                    //resizeMode={FastImage.resizeMode.contain} // 이미지 크기 조절 방식 설정 (optional)
                                                    />
                                                  </TouchableOpacity>
                                                </>
                                              }
                                              {/* 댓글, 이미지 존재 */}
                                              {_data.content != null && _data.image &&
                                                <>
                                                  <Text style={[{ ...styles.RepliesContentText, color: '#000000' }, isDarkMode && { ...styles.RepliesContentText, color: '#ffffff' }]}>{_data.content}</Text>
                                                  <TouchableOpacity style={{ marginTop: 7, }} onPress={() => { openImageViewer(`data:${JSON.parse(_data.image_Info).type};base64,${_data.image}`, JSON.parse(_data.image_Info)) }}>
                                                    <FastImage
                                                      style={{ maxWidth: 230, width: JSON.parse(_data.image_Info).width / 6, height: JSON.parse(_data.image_Info).height / 6, left: 78, marginBottom: 5, }}
                                                      source={{
                                                        uri: `data:${JSON.parse(_data.image_Info).type};base64,${_data.image}`, // 또는 require()로 local 이미지 사용 가능
                                                        priority: FastImage.priority.normal, // 다운로드 우선순위 설정 (optional)
                                                      }}
                                                    //resizeMode={FastImage.resizeMode.contain} // 이미지 크기 조절 방식 설정 (optional)
                                                    />
                                                  </TouchableOpacity>
                                                </>
                                              }

                                              {/* 작성 시간 */}
                                              <View>
                                                <Text key={data.id} style={[{ ...styles.RepliesDateText, color: '#000000' }, isDarkMode && { ...styles.RepliesDateText, color: '#ffffff' }]}>{data.date.substring(0, 10)} {data.date.substring(11, 19)}</Text>
                                                <TouchableOpacity style={{ position: 'absolute', marginLeft: 175, }} onPress={() => navigation.navigate('Community_WriteReplies', { commentsID: data.id, postID: postID })}>
                                                  <Text style={[{ ...styles.RepliesButtonText, color: '#000000', }, isDarkMode && { ...styles.RepliesButtonText, color: '#ffffff' }]}>  답글쓰기</Text>
                                                </TouchableOpacity>
                                              </View>
                                            </View>
                                          </View>
                                        )
                                      }
                                    })}
                                  </>
                                }
                              </View>
                            )
                          })}
                        </View>
                      }
                    </>
                    :
                    null
                  }
                </ScrollView>

                {imageData.length === 0 ?
                  null
                  :
                  <View style={{}}>
                    {/* uri: `data:image/jpeg;base64,${imageData}` */}
                    <FastImage source={{ uri: imageData[0].uri }} style={{ width: 100, height: 100 }} />
                  </View>
                }

                <View style={{ width: '100%', height: 1, backgroundColor: '#A9A9A9' }}></View>

                {/* 댓글달기 */}
                <View style={[{ ...styles.CommentsReplyContainer, backgroundColor: '#ffffff' }, isDarkMode && { ...styles.CommentsReplyContainer, backgroundColor: '#000000' }]}>
                  <View style={Platform.OS === 'ios' && { marginTop: 20, marginBottom: 20, }}>
                    <TextInput
                      style={[{ ...styles.CommentReplyText, color: '#000000' }, isDarkMode && { ...styles.CommentReplyText, color: '#ffffff' }]}
                      placeholder={'댓글을 남겨보세요.' + uploadCount}
                      placeholderTextColor={isDarkMode ? '#ffffff' : '#000000'}
                      value={commentsForm}
                      onChangeText={(text) => setCommentsForm(text)}
                      multiline={true} // 여러 줄 입력 활성화
                      numberOfLines={2} // 보여질 줄의 개수
                    />
                  </View>

                  {/* 카메라, 사진 */}
                  <TouchableOpacity style={styles.CommentsReplyImageButton} onPress={() => { Alert.alert('사진 선택', '사진을 업로드할 방식을 선택해주세요.', [{ text: '취소' }, { text: '카메라', onPress: () => { handleTakePhoto() } }, { text: '앨범', onPress: () => { handleChoosePhoto() } }]) }}>
                    <Icon_Ionicons name='camera-outline' size={21} style={[{ color: '#000000' }, isDarkMode && { color: '#ffffff' }]} />
                  </TouchableOpacity>

                  {/* 등록버튼 */}
                  <TouchableOpacity style={commentsForm || imageData.length != 0 ? styles.CommentsReplySumitButton : { ...styles.CommentsReplySumitButton, backgroundColor: '#696969' }} disabled={commentsForm || imageData.length != 0 ? false : true} onPress={handleSumit}>
                    <Text style={{ textAlign: 'center', color: '#ffffff' }}>등록</Text>
                  </TouchableOpacity>
                </View>
              </>
            }
          </>
        }
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  logoView: {
    height: 60,
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '400',
  },
  MessageContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  Message: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    position: 'absolute',
    width: '100%',
    marginTop: 100,
  },
  refresBtnContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 100,
  },
  refresBtn: {
    width: '30%',
    backgroundColor: '#EB4E45',
    borderRadius: 10,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonView: {
    position: 'absolute',
    marginLeft: 20,
  },
  CommentsContainer: {
    width: 'auto',
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
  },
  CommentsReplyContainer: {
    justifyContent: 'flex-end',
    width: '100%',
    height: 'auto',
    maxHeight: 100,
  },
  CommentReplyText: {
    width: '65%',
    marginLeft: 20,
  },
  CommentsReplySumitButton: {
    width: 50,
    height: 35,
    bottom: 13,
    right: 10,
    borderRadius: 10,
    justifyContent: 'center',
    backgroundColor: '#00BFFF',
    position: 'absolute',
  },
  CommentsReplyImageButton: {
    width: 50,
    height: 50,
    right: 50,
    bottom: 7,
    justifyContent: 'center',
    position: 'absolute',
  },
  CommentsLengthText: {
    marginTop: 13,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  CommentsAuthorText: {
    paddingLeft: 58,
    width: '100%',
    fontWeight: '400',
    position: 'absolute',
  },
  CommentsContentText: {
    paddingLeft: 58,
    paddingRight: 10,
    marginTop: 23,
    fontWeight: '800',
  },
  CommentsDateText: {
    paddingLeft: 58,
    paddingRight: 10,
    fontWeight: '400',
    fontSize: 10,
  },
  RepliesButtonText: {
    fontWeight: '400',
    fontSize: 10,
  },
  RepliesAuthorText: {
    paddingLeft: 78,
    marginTop: 6,
    width: '100%',
    fontWeight: '400',
    fontSize: 13,
  },
  RepliesContentText: {
    paddingLeft: 78,
    paddingRight: 30,
    marginTop: 1,
    fontWeight: '500',
    fontSize: 13,
  },
  RepliesDateText: {
    paddingLeft: 78,
    marginTop: 1,
    width: '100%',
    fontWeight: '400',
    fontSize: 9,
  },
})