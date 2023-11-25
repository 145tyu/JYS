import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl, KeyboardAvoidingView, ScrollView, View, Image, Text, TextInput, Modal } from 'react-native';
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

import axiosInstance from '../../api/API_Server';
import ImageViewer from '../../api/ImageViewer';

const CAMERA_PERMISSION = Platform.select({
  ios: PERMISSIONS.IOS.CAMERA,
  android: PERMISSIONS.ANDROID.CAMERA,
})

const SeeMoreModal = ({ reporterUserID, contentData, contentType, openReportModal, handleDeleteComment, handleDeleteReplies, handleBlockedUser, isDarkMode, visible, onClose }) => {
  return (
    <Modal animationType='slide' transparent={true} visible={visible} onRequestClose={() => onClose()}>
      <View style={modalStyles.container}>
        <View style={[{ ...modalStyles.boxContainer, backgroundColor: '#EBEBEB', }, isDarkMode && { ...modalStyles.boxContainer, backgroundColor: '#363638', }]}>
          <TouchableOpacity style={{ padding: 3, }} onPress={openReportModal}>
            <Text style={[{ ...modalStyles.boxText, color: '#000000', }, isDarkMode && { ...modalStyles.boxText, color: '#ffffff', }]}>신고하기</Text>
          </TouchableOpacity>

          {contentData != null && reporterUserID != contentData.account_id &&
            <>
              <View style={{ width: '100%', height: 1, marginTop: 10, marginBottom: 10, backgroundColor: '#999999' }}></View>
              <TouchableOpacity style={{ padding: 3, }} onPress={() => {
                onClose()
                return Alert.alert('차단', '해당 사용자를 차단하시겠습니까?', [
                  {
                    text: '차단',
                    onPress: () => {
                      handleBlockedUser()
                    }
                  },
                  { text: '취소', }
                ])
              }}>
                <Text style={[{ ...modalStyles.boxText, color: '#000000', }, isDarkMode && { ...modalStyles.boxText, color: '#ffffff', }]}>차단하기</Text>
              </TouchableOpacity>
            </>
          }

          {contentData != null && reporterUserID === contentData.account_id &&
            <>
              <View style={{ width: '100%', height: 1, marginTop: 10, marginBottom: 10, backgroundColor: '#999999' }}></View>
              <TouchableOpacity onPress={() => {
                Toast.show({
                  type: 'error',
                  text1: `수정 기능을 준비하고 있어요.`,
                })
              }} style={{ padding: 3, }}>
                <Text style={[{ ...modalStyles.boxText, color: '#000000', }, isDarkMode && { ...modalStyles.boxText, color: '#ffffff', }]}>수정하기</Text>
              </TouchableOpacity>

              <View style={{ width: '100%', height: 1, marginTop: 10, marginBottom: 10, backgroundColor: '#999999' }}></View>
              <TouchableOpacity onPress={() => {
                if (contentType === 'Comment') {
                  handleDeleteComment()
                } else if (contentType === 'Reply') {
                  handleDeleteReplies()
                }
              }} style={{ padding: 3, }}>
                <Text style={[{ ...modalStyles.boxText, color: '#E83F00', }, isDarkMode && { ...modalStyles.boxText, color: '#E83F00', }]}>삭제하기</Text>
              </TouchableOpacity>
            </>
          }
        </View>

        <TouchableOpacity onPress={() => onClose()} style={[{ ...modalStyles.boxContainer, backgroundColor: '#EBEBEB', }, isDarkMode && { ...modalStyles.boxContainer, backgroundColor: '#363638', }]}>
          <Text style={[{ ...modalStyles.boxText, color: '#000000', }, isDarkMode && { ...modalStyles.boxText, color: '#ffffff', }]}>닫기</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

const ReportSelectModal = ({ setReportType, isDarkMode, visible, onClose }) => {
  return (
    <Modal animationType='slide' transparent={true} visible={visible} onRequestClose={() => onClose()}>
      <View style={modalStyles.container}>
        <View style={[{ ...modalStyles.boxContainer, backgroundColor: '#EBEBEB', }, isDarkMode && { ...modalStyles.boxContainer, backgroundColor: '#363638', }]}>
          <Text style={[{ ...modalStyles.boxTitle, color: '#E83F00', }, isDarkMode && { ...modalStyles.boxTitle, color: '#E83F00', }]}>신고하기</Text>
          <Text style={[{ ...modalStyles.boxText, fontSize: 13, fontWeight: '400', marginTop: 15, marginBottom: 15, color: '#000000', }, isDarkMode && { ...modalStyles.boxText, fontSize: 13, fontWeight: '400', marginTop: 15, marginBottom: 15, color: '#ffffff', }]}>게시글을 신고하려는 이유를 선택해 주세요.</Text>

          <ScrollView style={{ height: 300, borderRadius: 15, }}>
            <TouchableOpacity onPress={() => {
              setReportType('마음에 들지 않습니다.')
              onClose('마음에 들지 않습니다.')
            }} style={[{ ...modalStyles.boxSelectorContainer, backgroundColor: '#D8D8D8', }, isDarkMode && { ...modalStyles.boxSelectorContainer, backgroundColor: '#424242', }]}>
              <Text style={[{ ...modalStyles.boxText, color: '#000000', }, isDarkMode && { ...modalStyles.boxText, color: '#ffffff', }]}>마음에 들지 않습니다.</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              setReportType('스팸')
              onClose('스팸')
            }} style={[{ ...modalStyles.boxSelectorContainer, backgroundColor: '#D8D8D8', }, isDarkMode && { ...modalStyles.boxSelectorContainer, backgroundColor: '#424242', }]}>
              <Text style={[{ ...modalStyles.boxText, color: '#000000', }, isDarkMode && { ...modalStyles.boxText, color: '#ffffff', }]}>스팸</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              setReportType('나체 이미지 또는 성적 행위')
              onClose('나체 이미지 또는 성적 행위')
            }} style={[{ ...modalStyles.boxSelectorContainer, backgroundColor: '#D8D8D8', }, isDarkMode && { ...modalStyles.boxSelectorContainer, backgroundColor: '#424242', }]}>
              <Text style={[{ ...modalStyles.boxText, color: '#000000', }, isDarkMode && { ...modalStyles.boxText, color: '#ffffff', }]}>나체 이미지 또는 성적 행위</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              setReportType('과도한 욕설')
              onClose('과도한 욕설')
            }} style={[{ ...modalStyles.boxSelectorContainer, backgroundColor: '#D8D8D8', }, isDarkMode && { ...modalStyles.boxSelectorContainer, backgroundColor: '#424242', }]}>
              <Text style={[{ ...modalStyles.boxText, color: '#000000', }, isDarkMode && { ...modalStyles.boxText, color: '#ffffff', }]}>과도한 욕설</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              setReportType('따돌림 또는 괴롭힘')
              onClose('따돌림 또는 괴롭힘')
            }} style={[{ ...modalStyles.boxSelectorContainer, backgroundColor: '#D8D8D8', }, isDarkMode && { ...modalStyles.boxSelectorContainer, backgroundColor: '#424242', }]}>
              <Text style={[{ ...modalStyles.boxText, color: '#000000', }, isDarkMode && { ...modalStyles.boxText, color: '#ffffff', }]}>따돌림 또는 괴롭힘</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              setReportType('거짓 정보')
              onClose('거짓 정보')
            }} style={[{ ...modalStyles.boxSelectorContainer, backgroundColor: '#D8D8D8', }, isDarkMode && { ...modalStyles.boxSelectorContainer, backgroundColor: '#424242', }]}>
              <Text style={[{ ...modalStyles.boxText, color: '#000000', }, isDarkMode && { ...modalStyles.boxText, color: '#ffffff', }]}>거짓 정보</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              setReportType('광고성 게시글')
              onClose('광고성 게시글')
            }} style={[{ ...modalStyles.boxSelectorContainer, backgroundColor: '#D8D8D8', }, isDarkMode && { ...modalStyles.boxSelectorContainer, backgroundColor: '#424242', }]}>
              <Text style={[{ ...modalStyles.boxText, color: '#000000', }, isDarkMode && { ...modalStyles.boxText, color: '#ffffff', }]}>광고성 게시글</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              setReportType('자살 또는 자해')
              onClose('자살 또는 자해')
            }} style={[{ ...modalStyles.boxSelectorContainer, backgroundColor: '#D8D8D8', }, isDarkMode && { ...modalStyles.boxSelectorContainer, backgroundColor: '#424242', }]}>
              <Text style={[{ ...modalStyles.boxText, color: '#000000', }, isDarkMode && { ...modalStyles.boxText, color: '#ffffff', }]}>자살 또는 자해</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              setReportType('지식재산권 침해')
              onClose('지식재산권 침해')
            }} style={[{ ...modalStyles.boxSelectorContainer, backgroundColor: '#D8D8D8', }, isDarkMode && { ...modalStyles.boxSelectorContainer, backgroundColor: '#424242', }]}>
              <Text style={[{ ...modalStyles.boxText, color: '#000000', }, isDarkMode && { ...modalStyles.boxText, color: '#ffffff', }]}>지식재산권 침해</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              setReportType('기타 문제')
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

const ReportCheckModal = ({ handelReport, reportType, isDarkMode, visible, onClose }) => {
  return (
    <Modal animationType='slide' transparent={true} visible={visible} onRequestClose={() => onClose()}>
      <View style={modalStyles.container}>
        <View style={[{ ...modalStyles.boxContainer, backgroundColor: '#EBEBEB', }, isDarkMode && { ...modalStyles.boxContainer, backgroundColor: '#363638', }]}>
          <Text style={[{ ...modalStyles.boxTitle, color: '#000000', }, isDarkMode && { ...modalStyles.boxTitle, color: '#ffffff', }]}>게시글을 신고하시겠습니까?</Text>
          <Text style={[{ ...modalStyles.boxText, fontSize: 13, fontWeight: '400', marginTop: 15, marginBottom: 15, color: '#000000', }, isDarkMode && { ...modalStyles.boxText, fontSize: 13, fontWeight: '400', marginTop: 15, marginBottom: 15, color: '#ffffff', }]}>사유 : {reportType}</Text>

          <View style={{ width: '100%', height: 1, marginTop: 10, marginBottom: 10, backgroundColor: '#999999' }}></View>
          <TouchableOpacity onPress={() => {
            handelReport()
            onClose()
          }} style={{ padding: 3, }}>
            <Text style={[{ ...modalStyles.boxText, color: '#E83F00', }, isDarkMode && { ...modalStyles.boxText, color: '#E83F00', }]}>신고하기</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => onClose()} style={[{ ...modalStyles.boxContainer, backgroundColor: '#EBEBEB', }, isDarkMode && { ...modalStyles.boxContainer, backgroundColor: '#363638', }]}>
          <Text style={[{ ...modalStyles.boxText, color: '#000000', }, isDarkMode && { ...modalStyles.boxText, color: '#ffffff', }]}>취소하기</Text>
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

export default function WriteComments({ navigation }) {
  const route = useRoute()
  const { postID } = route.params

  const isDarkMode = useColorScheme() === 'dark'
  const isFocused = useIsFocused()

  const [refreshing, setRefreshing] = useState(false)

  const [seeMoreModalState, setSeeMoreModalState] = useState(false)
  const [reportSelectModalState, setReportSelectModalState] = useState(false)
  const [reportCheckModalState, setReportCheckModalState] = useState(false)

  const [reportType, setReportType] = useState(null) // 신고 유형
  const [contentData, setContentData] = useState(null) // 콘텐츠 데이터
  const [contentType, setContentType] = useState(null) // 콘텐츠 유형
  const [reporterUserID, setReporterUserID] = useState(null) // 모달 관리 ID 설정

  const [commentData, setCommentData] = useState([])
  const [commentType, setCommentType] = useState(null)

  const [repliesData, setRepliesData] = useState([])
  const [repliesType, setRepliesType] = useState(null)

  const [commentForm, setCommentsForm] = useState('')

  const [selectedMedia, setSelectedMedia] = useState([])
  const [uploadCount, setUploadCount] = useState('')

  const [imageViewerState, setImageViewerState] = useState(false)
  const [imageViewerData, setImageViewerData] = useState('')
  const [imageViewerInfo, setImageViewerInfo] = useState([])

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

  const handleChooseMedia = async () => {
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

  const commentCheck = async () => {
    setCommentType(null)
    const blockUser = await AsyncStorage.getItem('community_blockedUser')
    try {
      await axiosInstance.post('/Community/commentsCheck', { postID: postID, blockUser: JSON.parse(blockUser), })
        .then((res) => {
          if (res.status === 200) {
            const data = res.data.data
            setCommentData(data)
            setCommentType(1)
          } else {
            setCommentType(0)
          }
        }).catch((error) => {
          setCommentType(0)
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
      setCommentType(0)
      Toast.show({
        type: 'error',
        text1: '댓글을 불러오지 못했어요.',
        text2: `${error}`,
        position: 'bottom',
      })
    }
  }

  const repliesCheck = async () => {
    setRepliesType(null)
    const blockUser = await AsyncStorage.getItem('community_blockedUser')
    try {
      await axiosInstance.post('/Community/repliesCheck', { postID: postID, blockUser: JSON.parse(blockUser), })
        .then((res) => {
          if (res.status === 200) {
            const data = res.data.data
            setRepliesData(data)
            setRepliesType(1)
          } else {
            setRepliesType(0)
          }
        }).catch((error) => {
          setRepliesType(0)
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
      setRepliesType(0)
      Toast.show({
        type: 'error',
        text1: '답글을 불러오지 못했어요.',
        text2: `${error}`,
        position: 'bottom',
      })
    }
  }

  const handleDeleteComment = async (contentData) => {
    closeSeeMoreModal()
    await AsyncStorage.getItem('id')
      .then(async (accountID) => {
        await axiosInstance.post('/Community/deleteComment', { postID: contentData.post_id, commentID: contentData.id, accountID: accountID })
          .then(async (res) => {
            if (res.status === 200) {
              commentCheck()
              repliesCheck()
            } else {
              Toast.show({
                type: 'error',
                text1: '댓글을 삭제하지 못했습니다.',
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
      }).catch((error) => {
        Toast.show({
          type: 'error',
          text1: '댓글을 삭제하지 못했어요.',
          text2: `${error}`,
          position: 'bottom',
        })
      })
  }

  const handleDeleteReplies = async (contentData) => {
    closeSeeMoreModal()
    await AsyncStorage.getItem('id')
      .then(async (accountID) => {
        await axiosInstance.post('/Community/deleteReplies', { repliesID: contentData.id, postID: contentData.post_id, commentID: contentData.comments_id, accountID: accountID })
          .then(async (res) => {
            if (res.status === 200) {
              commentCheck()
              repliesCheck()
            } else {
              Toast.show({
                type: 'error',
                text1: '답글을 삭제하지 못했어요.',
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
      }).catch((error) => {
        Toast.show({
          type: 'error',
          text1: '답글을 삭제하지 못했어요.',
          text2: `${error}`,
          position: 'bottom',
        })
      })
  }

  const handelReport = async () => {
    try {
      await axiosInstance.post('/Community/Report/reportForm', { reporterUserID: reporterUserID, reportType: reportType, contentUserID: contentData.account_id, contentID: contentData.id, contentType: contentType, })
        .then((res) => {
          if (res.status === 200) {
            if (contentType === 'Post') {
              navigation.goBack()
              Alert.alert('신고하기', `${res.data.message}\n이 사용자를 차단할까요?`, [{ text: '차단하기', onPress: () => handleBlockedUser() }, { text: '아니요' }])
            } else {
              handleRefresh()
              Toast.show({
                type: 'success',
                text1: `${res.data.message}`,
                position: 'bottom',
              })
            }
          } else {
            Toast.show({
              type: 'error',
              text1: '신고를 접수하지 못했어요.',
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
        text1: '신고를 접수하지 못했어요.',
        text2: `${error}`,
        position: 'bottom',
      })
    }
  }

  const handleBlockedUser = async () => {
    await AsyncStorage.getItem('community_blockedUser')
      .then(async (user) => {
        const blockUser = []
        const blockUserObject = {
          id: contentData.account_id,
          studentID: contentData.studentID,
          author: contentData.author,
        }
        if (user === null) {
          blockUser.push(blockUserObject)
          BlockUser(blockUser)
        } else {
          const existingBlockUser = JSON.parse(user)
          const duplicationUser = existingBlockUser.some(data => data.id === blockUserObject.id)

          if (duplicationUser) {
            Toast.show({
              type: 'error',
              text1: '이 기기에서 이미 차단된 사용자입니다.',
              position: 'bottom',
            })
          } else {
            existingBlockUser.push(blockUserObject)
            BlockUser(existingBlockUser)
          }
        }

        function BlockUser(updatedBlockUser) {
          AsyncStorage.setItem('community_blockedUser', JSON.stringify(updatedBlockUser))
            .then(() => {
              handleRefresh()
              Toast.show({
                type: 'success',
                text1: '이 기기에서 사용자를 차단했습니다.',
                position: 'bottom',
              })
              if (contentType === 'Post') {
                navigation.goBack()
              }
            }).catch((error) => {
              Toast.show({
                type: 'error',
                text1: '사용자를 차단하지 못했습니다.',
                text2: `${error}`,
                position: 'bottom',
              })
            })
        }
      }).catch((error) => {
        Toast.show({
          type: 'error',
          text1: '사용자를 차단하지 못했습니다.',
          text2: `${error}`,
          position: 'bottom',
        })
      })
  }

  const handleCommentsForm = async (formData) => {
    Toast.show({
      type: 'info',
      text1: `전송 중... ${uploadCount}`,
      text2: '앱을 종료하지 마세요.',
      autoHide: false,
      position: 'bottom',
    })

    try {
      await axiosInstance.post('/v2/Community/commentForm', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: function (progressEvent) {
          var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadCount(percentCompleted)
        },
      }).then(async (res) => {
        if (res.status === 200) {
          // 댓글 작성칸 초기화
          setCommentsForm('')
          setSelectedMedia([])
          setUploadCount('')
          // 데이터 새로고침
          commentCheck()
          repliesCheck()

          Toast.show({
            type: 'success',
            text1: `${res.data.message}`,
            position: 'bottom',
          })
        } else {
          Toast.show({
            type: 'error',
            text1: '댓글을 작성하지 못했어요.',
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
        text1: '댓글을 작성하지 못했어요.',
        text2: `${error}`,
        position: 'bottom',
      })
    }
  }

  const handleSumit = async () => {
    const ID = await AsyncStorage.getItem('id')
    const JOB = await AsyncStorage.getItem('job')

    const formData = new FormData()

    if (selectedMedia.length != 0) { // 이미지만 있을 때
      selectedMedia.forEach((media, index) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        formData.append('media', {
          uri: media.path,
          type: media.mime,
          name: `media${index}-${uniqueSuffix}-${media.modificationDate}-${media.size}`,
        })
      })
    }

    formData.append('data', JSON.stringify({
      accountID: ID,
      job: JOB,
      postID: postID,
      content: commentForm,
      date: new Date(),
    }))

    handleCommentsForm(formData)
  }

  const handleRefresh = () => {
    setRefreshing(true)

    commentCheck()
    repliesCheck()

    setRefreshing(false)
  }

  const openSeeMoreModal = async (contentData, contentType) => {
    const accountID = await AsyncStorage.getItem('id')
    setReporterUserID(accountID)
    setContentType(contentType)
    setContentData(contentData)
    setSeeMoreModalState(true)
  }

  const closeSeeMoreModal = () => {
    setSeeMoreModalState(false)
  }

  const openReportSelectModal = () => {
    closeSeeMoreModal()
    setReportSelectModalState(true)
  }

  const closeReportSelectModal = (value) => {
    closeSeeMoreModal()
    setReportSelectModalState(false)
    if (value) openReportCheckModal()
  }

  const openReportCheckModal = () => {
    setReportCheckModalState(true)
  }

  const closeReportCheckModal = () => {
    setReportCheckModalState(false)
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
    commentCheck()
    repliesCheck()
  }, [isFocused])

  return (
    <SafeAreaView style={{ ...styles.container, backgroundColor: isDarkMode ? '#000000' : '#ffffff', }}>
      {/* 이미지뷰어 */}
      <ImageViewer imageData={imageViewerData} imageInfo={imageViewerInfo} visible={imageViewerState} onClose={() => closeImageViewer()} />
      {/* 더보기 모달 */}
      <SeeMoreModal reporterUserID={reporterUserID} contentType={contentType} contentData={contentData} openReportModal={openReportSelectModal} handleDeleteComment={() => handleDeleteComment(contentData)} handleDeleteReplies={() => handleDeleteReplies(contentData)} isDarkMode={isDarkMode} visible={seeMoreModalState} onClose={() => closeSeeMoreModal()} />
      {/* 신고 모달 */}
      <ReportSelectModal setReportType={setReportType} isDarkMode={isDarkMode} visible={reportSelectModalState} onClose={closeReportSelectModal} />
      {/* 신고 확인 모달 */}
      <ReportCheckModal handelReport={handelReport} reportType={reportType} isDarkMode={isDarkMode} visible={reportCheckModalState} onClose={closeReportCheckModal} />

      <KeyboardAvoidingView style={{ flex: 1, }} behavior={Platform.select({ ios: 'padding' })}>
        {/* 로고 */}
        <View style={styles.logoView}>
          <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 50 } : { ...styles.backButtonView, }} onPress={() => navigation.navigate('Community_ViewPost', { postID: postID })}>
            <Text style={{ ...styles.logoText, color: isDarkMode ? '#ffffff' : '#000000', }}>{<Icon_Ionicons name='chevron-back-outline' size={21} />} 댓글 {commentData === null ? '0' : commentData.length}</Text>
          </TouchableOpacity>
        </View>

        {commentType === null || repliesType === null ?
          <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', pointerEvents: 'none', }}>
            <ActivityIndicator size="large" color="green" />
          </View>
          :
          <>
            {commentType === 0 || repliesType === 0 ?
              <>
                <View style={{ ...StyleSheet.absoluteFillObject, ...styles.MessageContainer, }}>
                  <Text style={{ ...styles.Message, color: isDarkMode ? '#999999' : '#666666', }}>댓글을 불러오지 못했어요.</Text>
                </View>

                <View style={{ ...StyleSheet.absoluteFillObject, ...styles.refresBtnContainer, }}>
                  <TouchableOpacity onPress={() => handleRefresh()} style={{ ...styles.refresBtn, }}>
                    <Text style={{ textAlign: 'center', color: '#ffffff' }}>다시시도</Text>
                  </TouchableOpacity>
                </View>
              </>
              :
              <>
                <ScrollView style={{ ...styles.scrollContainer, backgroundColor: isDarkMode ? '#000000' : '#ffffff', }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
                  {commentType === 1 && repliesType === 1 ?
                    <>
                      {commentData.length != 0 &&
                        <View style={{ ...styles.CommentsContainer, backgroundColor: isDarkMode ? '#121212' : '#f2f4f6', }}>
                          {commentData.map((data) => {
                            return (
                              <View key={data.id} style={{ flex: 1, marginTop: 10, }}>
                                {/* 아이콘 */}
                                <View>
                                  <View style={{ width: 40, height: 40, left: 7, borderRadius: 25, backgroundColor: '#dcdcdc', position: 'absolute' }}></View>
                                  <Icon_Feather name='user' size={20} style={{ left: 17, top: 8, borderRadius: 25, color: 'black', position: 'absolute' }} />
                                </View>

                                {/* 댓글 모달 */}
                                <TouchableOpacity onPress={() => openSeeMoreModal(data, 'Comment')} style={{ zIndex: 999, position: 'absolute', right: 10, }}>
                                  <Icon_Feather color={isDarkMode ? '#ffffff' : '#000000'} name="more-vertical" size={20} />
                                </TouchableOpacity>

                                <View>
                                  {/* 사용자ID */}
                                  <Text style={{ ...styles.CommentsAuthorText, color: isDarkMode ? '#ffffff' : '#000000', }}>
                                    <View style={{ width: 30, height: 15, borderRadius: 3, top: 7, position: 'absolute', justifyContent: 'center', alignItems: 'center', backgroundColor: data.studentID.substr(2, 1) == '1' || data.studentID.substr(2, 1) == '2' ? '#82FA58' : data.studentID.substr(2, 1) == '3' || data.studentID.substr(2, 1) == '4' ? '#2E9AFE' : data.studentID.substr(2, 1) == '5' || data.studentID.substr(2, 1) == '6' ? '#FA58F4' : data.studentID.substr(2, 1) == '7' || data.studentID.substr(2, 1) == '8' ? '#FE9A2E' : '#E0F8F7', }}>
                                      <Text style={{ fontSize: 10, fontWeight: '400', color: '#000000' }}>{data.studentID.substr(0, 1)}학년</Text>
                                    </View>
                                    {' '}{data.author}</Text>
                                  {/* 댓글 존재 */}
                                  {data.content &&
                                    <Text style={{ ...styles.CommentsContentText, color: isDarkMode ? '#ffffff' : '#000000', }}>{data.content}</Text>
                                  }
                                  {/* 이미지 존재 */}
                                  {data.image &&
                                    <>
                                      {JSON.parse(data.image_Info) && data.image ?
                                        <TouchableOpacity style={{ marginTop: 28, }} onPress={() => { openImageViewer(`data:${JSON.parse(data.image_Info).type};base64,${data.image}`, JSON.parse(data.image_Info)) }}>
                                          <FastImage
                                            style={{ maxWidth: 250, width: JSON.parse(data.image_Info).width / 6, height: JSON.parse(data.image_Info).height / 12, left: 58, marginBottom: 5, }}
                                            source={{
                                              uri: `data:${JSON.parse(data.image_Info).type};base64,${data.image}`, // 또는 require()로 local 이미지 사용 가능
                                              priority: FastImage.priority.normal, // 다운로드 우선순위 설정 (optional)
                                            }}
                                          //resizeMode={FastImage.resizeMode.contain} // 이미지 크기 조절 방식 설정 (optional)
                                          />
                                        </TouchableOpacity>
                                        :
                                        <View style={{ maxWidth: 250, width: 200, height: 150, left: 58, marginBottom: 5, justifyContent: 'center', alignItems: 'center', }}>
                                          <Text style={{ color: isDarkMode ? '#ffffff' : '#000000', }}>미디어를 표시하지 못했어요.</Text>
                                        </View>
                                      }
                                    </>
                                  }

                                  {/* 작성 시간 */}
                                  <View>
                                    <Text key={data.id} style={{ ...styles.CommentsDateText, color: isDarkMode ? '#ffffff' : '#000000', }}>{data.date.substring(0, 10)} {data.date.substring(11, 19)}</Text>
                                    <TouchableOpacity style={{ position: 'absolute', marginLeft: 165, }} onPress={() => navigation.navigate('Community_WriteReplies', { commentsID: data.id, postID: postID })}>
                                      <Text style={{ ...styles.RepliesButtonText, color: isDarkMode ? '#ffffff' : '#000000', }}>  답글쓰기</Text>
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

                                            {/* 댓글 모달 */}
                                            <TouchableOpacity onPress={() => openSeeMoreModal(_data, 'Reply')} style={{ zIndex: 999, position: 'absolute', right: 10, }}>
                                              <Icon_Feather color={isDarkMode ? '#ffffff' : '#000000'} name="more-vertical" size={20} />
                                            </TouchableOpacity>

                                            {/* 답글 */}
                                            <View key={data.id} style={{ marginBottom: 13, }} onPress={() => navigation.navigate('Community_WriteReplies', { commentsID: data.id, postID: postID })}>
                                              {/* 사용자ID */}
                                              <Text style={{ ...styles.RepliesAuthorText, color: isDarkMode ? '#ffffff' : '#000000', }}>
                                                <View style={{ width: 30, height: 15, borderRadius: 3, top: 7, position: 'absolute', justifyContent: 'center', alignItems: 'center', backgroundColor: _data.studentID.substr(2, 1) == '1' || _data.studentID.substr(2, 1) == '2' ? '#82FA58' : _data.studentID.substr(2, 1) == '3' || _data.studentID.substr(2, 1) == '4' ? '#2E9AFE' : _data.studentID.substr(2, 1) == '5' || _data.studentID.substr(2, 1) == '6' ? '#FA58F4' : _data.studentID.substr(2, 1) == '7' || _data.studentID.substr(2, 1) == '8' ? '#FE9A2E' : '#E0F8F7', }}>
                                                  <Text style={{ fontSize: 10, fontWeight: '400', color: '#000000' }}>{_data.studentID.substr(0, 1)}학년</Text>
                                                </View>
                                                {' '}{_data.author}
                                              </Text>
                                              {/* 댓글 존재 */}
                                              {_data.content &&
                                                <Text style={{ ...styles.RepliesContentText, color: isDarkMode ? '#ffffff' : '#000000', }}>{_data.content}</Text>
                                              }
                                              {/* 이미지 존재 */}
                                              {_data.image &&
                                                <>
                                                  {JSON.parse(_data.image_Info) && _data.image ?
                                                    <TouchableOpacity style={{ marginTop: 28, }} onPress={() => { openImageViewer(`data:${JSON.parse(_data.image_Info).type};base64,${_data.image}`, JSON.parse(_data.image_Info)) }}>
                                                      <FastImage
                                                        style={{ maxWidth: 230, width: JSON.parse(_data.image_Info).width / 6, height: JSON.parse(_data.image_Info).height / 6, left: 78, marginBottom: 5, }}
                                                        source={{
                                                          uri: `data:${JSON.parse(_data.image_Info).type};base64,${_data.image}`, // 또는 require()로 local 이미지 사용 가능
                                                          priority: FastImage.priority.normal, // 다운로드 우선순위 설정 (optional)
                                                        }}
                                                      //resizeMode={FastImage.resizeMode.contain} // 이미지 크기 조절 방식 설정 (optional)
                                                      />
                                                    </TouchableOpacity>
                                                    :
                                                    <View style={{ maxWidth: 250, width: 200, height: 150, left: 58, marginBottom: 5, justifyContent: 'center', alignItems: 'center', }}>
                                                      <Text style={{ color: isDarkMode ? '#ffffff' : '#000000', }}>미디어를 표시하지 못했어요.</Text>
                                                    </View>
                                                  }
                                                </>
                                              }

                                              {/* 작성 시간 */}
                                              <View>
                                                <Text key={data.id} style={{ ...styles.RepliesDateText, color: isDarkMode ? '#ffffff' : '#000000', }}>{data.date.substring(0, 10)} {data.date.substring(11, 19)}</Text>
                                                <TouchableOpacity style={{ position: 'absolute', marginLeft: 175, }} onPress={() => navigation.navigate('Community_WriteReplies', { commentsID: data.id, postID: postID })}>
                                                  <Text style={{ ...styles.RepliesButtonText, color: isDarkMode ? '#ffffff' : '#000000', }}>  답글쓰기</Text>
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

                {selectedMedia.length === 0 ?
                  null
                  :
                  <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)', }}>
                    <FastImage source={{ uri: selectedMedia[0].path }} style={{ width: 150, height: 150 }} />
                    <TouchableOpacity style={{ width: 23, height: 23, top: 5, right: 15, position: 'absolute', justifyContent: 'center', alignItems: 'center', backgroundColor: '#DCDCDC', }} onPress={() => {
                      setSelectedMedia([])
                    }}>
                      <Icon_Feather name="x" size={20} />
                    </TouchableOpacity>
                  </View>
                }

                <View style={{ width: '100%', height: 1, backgroundColor: '#A9A9A9' }}></View>

                {/* 댓글달기 */}
                <View style={{ ...styles.CommentsReplyContainer, backgroundColor: isDarkMode ? '#000000' : '#ffffff', }}>
                  <View style={Platform.OS === 'ios' && { marginTop: 20, marginBottom: 20, }}>
                    <TextInput
                      style={{ ...styles.CommentReplyText, color: isDarkMode ? '#ffffff' : '#000000', }}
                      placeholder={'댓글을 남겨보세요.' + uploadCount}
                      placeholderTextColor={isDarkMode ? '#ffffff' : '#000000'}
                      value={commentForm}
                      onChangeText={(text) => setCommentsForm(text)}
                      multiline={true} // 여러 줄 입력 활성화
                      numberOfLines={2} // 보여질 줄의 개수
                    />
                  </View>

                  {/* 카메라, 사진 */}
                  <TouchableOpacity style={styles.CommentsReplyImageButton} onPress={() => {
                    Alert.alert('사진 선택', '사진을 업로드할 방식을 선택해주세요.', [
                      { text: '취소' },
                      { text: '카메라', onPress: () => handleTakePhoto() },
                      { text: '앨범', onPress: () => handleChooseMedia() },
                    ])
                  }}>
                    <Icon_Ionicons name='camera-outline' size={21} style={{ color: isDarkMode ? '#ffffff' : '#000000', }} />
                  </TouchableOpacity>

                  {/* 등록버튼 */}
                  <TouchableOpacity style={commentForm || selectedMedia.length != 0 ? styles.CommentsReplySumitButton : { ...styles.CommentsReplySumitButton, backgroundColor: '#696969' }} disabled={commentForm || selectedMedia.length != 0 ? false : true} onPress={handleSumit}>
                    <Text style={{ textAlign: 'center', color: '#ffffff' }}>등록</Text>
                  </TouchableOpacity>
                </View>
              </>
            }
          </>
        }
      </KeyboardAvoidingView>
    </SafeAreaView >
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
    left: 10,
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