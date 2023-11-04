import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl, ScrollView, View, Text, TxtInput, Button, Modal, } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { CommonActions, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-toast-message';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';
import Icon_Entypo from 'react-native-vector-icons/Entypo';

import axiosInstance from '../../api/API_Server';
import ImageViewer from '../../api/ImageViewer';

const SeeMoreModal = ({ reporterUserID, contentData, contentType, openReportModal, handelDeletePost, handleDeleteComment, handleDeleteReplies, handleBlockedUser, isDarkMode, visible, onClose }) => {
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
                if (contentType === 'Post') {
                  handelDeletePost()
                } else if (contentType === 'Comment') {
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

export default function ViewPost({ navigation }) {
  const route = useRoute()
  const { postID, Title } = route.params

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

  const [postsData, setPostsData] = useState([])
  const [postsType, setPostsType] = useState(null)

  const [commentsData, setCommentsData] = useState([])
  const [commentsType, setCommentsType] = useState(null)

  const [repliesData, setRepliesData] = useState([])
  const [repliesType, setRepliesType] = useState(null)

  const [imageViewerState, setImageViewerState] = useState(false)
  const [imageViewerData, setImageViewerData] = useState('')
  const [imageViewerInfo, setImageViewerInfo] = useState([])

  const communityInquiry = async () => {
    setPostsType(null)
    const blockUser = await AsyncStorage.getItem('community_blockedUser')
    try {
      const params = {
        postID: postID,
        blockUser: JSON.parse(blockUser),
      }
      await axiosInstance.get('/Community/postInquiry', { params })
        .then((res) => {
          if (res.status === 200) {
            const data = res.data.data
            setPostsData(data)
            setPostsType(1)
          } else {
            setPostsType(0)
          }
        }).catch((error) => {
          setPostsType(0)
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
      setPostsType(0)
      Toast.show({
        type: 'error',
        text1: '예외가 발생했습니다.',
        text2: `${error}`,
      })
    }
  }

  const commentsCheck = async () => {
    setCommentsType(null)
    const blockUser = await AsyncStorage.getItem('community_blockedUser')
    try {
      await axiosInstance.post('/Community/commentsCheck', { postID: postID, blockUser: JSON.parse(blockUser), })
        .then((res) => {
          if (res.status === 200) {
            const data = res.data.data
            setCommentsData(data)
            setCommentsType(1)
          } else {
            setCommentsType(0)
          }
        }).catch((error) => {
          setCommentsType(0)
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
      setCommentsType(0)
      Toast.show({
        type: 'error',
        text1: '예외가 발생했습니다.',
        text2: `${error}`,
      })
    }
  }

  const repliesCheck = async () => {
    setRepliesType(null)
    const blockUser = await AsyncStorage.getItem('community_blockedUser')
    try {
      await axiosInstance.post('/Community/repliesCheck', { postID: postID, blockUser: JSON.parse(blockUser), })
        .then((res) => {
          if (res.status = 200) {
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
      setRepliesType(0)
      Toast.show({
        type: 'error',
        text1: '예외가 발생했습니다.',
        text2: `${error}`,
      })
    }
  }

  const handelDeletePost = async () => {
    closeSeeMoreModal()
    Alert.alert('정보', '게시글을 삭제할까요?', [
      {
        text: '삭제', onPress: async () => {
          await AsyncStorage.getItem('id')
            .then(async (accountID) => {
              await axiosInstance.post('/Community/deletePost/', { postID: postID, accountID: accountID })
                .then(async (res) => {
                  if (res.status === 200) {
                    navigation.goBack()
                    Toast.show({
                      type: 'success',
                      text1: `${res.data.message}`
                    })
                  } else {
                    Toast.show({
                      type: 'error',
                      text1: '게시글을 삭제하지 못했습니다.',
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
            }).catch((error) => {
              Toast.show({
                type: 'error',
                text1: '게시글을 삭제하지 못했어요.',
                text2: `${error}`
              })
            })
        }
      },
      { text: '취소', }
    ])
  }

  const handleDeleteComment = async (contentData) => {
    closeSeeMoreModal()
    await AsyncStorage.getItem('id')
      .then(async (accountID) => {
        await axiosInstance.post('/Community/deleteComment', { postID: contentData.post_id, commentID: contentData.id, accountID: accountID })
          .then(async (res) => {
            if (res.status === 200) {
              commentsCheck()
              repliesCheck()
            } else {
              Toast.show({
                type: 'error',
                text1: '댓글을 삭제하지 못했습니다.',
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
      }).catch((error) => {
        Toast.show({
          type: 'error',
          text1: '댓글을 삭제하지 못했어요.',
          text2: `${error}`
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
              commentsCheck()
              repliesCheck()
            } else {
              Toast.show({
                type: 'error',
                text1: '답글을 삭제하지 못했어요.',
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
      }).catch((error) => {
        Toast.show({
          type: 'error',
          text1: '답글을 삭제하지 못했어요.',
          text2: `${error}`
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
              })
            }
          } else {
            Toast.show({
              type: 'error',
              text1: '신고를 접수하지 못했어요.',
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
        text1: '신고를 접수하지 못했어요.',
        text2: `${error}`
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
              })
              if (contentType === 'Post') {
                navigation.goBack()
              }
            }).catch((error) => {
              Toast.show({
                type: 'error',
                text1: '사용자를 차단하지 못했습니다.',
                text2: `${error}`
              })
            })
        }
      }).catch((error) => {
        Toast.show({
          type: 'error',
          text1: '사용자를 차단하지 못했습니다.',
          text2: `${error}`
        })
      })
  }

  const handleRefresh = () => {
    setRefreshing(true)
    communityInquiry()
    commentsCheck()
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
    communityInquiry()
    commentsCheck()
    repliesCheck()
  }, [isFocused])

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#ffffff' }, isDarkMode && { ...styles.container, backgroundColor: '#000000' },]}>
      {/* 이미지뷰어 */}
      <ImageViewer imageData={imageViewerData} imageInfo={imageViewerInfo} visible={imageViewerState} onClose={() => closeImageViewer()} />
      {/* 더보기 모달 */}
      <SeeMoreModal reporterUserID={reporterUserID} contentType={contentType} contentData={contentData} openReportModal={openReportSelectModal} handleBlockedUser={handleBlockedUser} handelDeletePost={() => handelDeletePost(contentData)} handleDeleteComment={() => handleDeleteComment(contentData)} handleDeleteReplies={() => handleDeleteReplies(contentData)} isDarkMode={isDarkMode} visible={seeMoreModalState} onClose={() => closeSeeMoreModal()} />
      {/* 신고 모달 */}
      <ReportSelectModal setReportType={setReportType} isDarkMode={isDarkMode} visible={reportSelectModalState} onClose={closeReportSelectModal} />
      {/* 신고 확인 모달 */}
      <ReportCheckModal handelReport={handelReport} reportType={reportType} isDarkMode={isDarkMode} visible={reportCheckModalState} onClose={closeReportCheckModal} />

      {/* 로고 */}
      <View style={styles.logoView}>
        <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 50 } : { ...styles.backButtonView, }} onPress={() => navigation.goBack()}>
          <Text style={[{ ...styles.logoText, color: '#000000' }, isDarkMode && { ...styles.logoText, color: '#ffffff' },]}>
            {<Icon_Ionicons name="chevron-back-outline" size={21} />} {Title == null ? '게시글' : Title}
          </Text>
        </TouchableOpacity>
        {postsType === 1 &&
          <TouchableOpacity style={Platform.OS === 'ios' ? { position: 'absolute', marginTop: 50, right: 20, } : { position: 'absolute', right: 20, }} onPress={() => openSeeMoreModal(postsData[0], 'Post')}>
            <Icon_Feather color={isDarkMode ? '#ffffff' : '#000000'} name="more-vertical" size={20} />
          </TouchableOpacity>
        }
      </View>

      {postsType === null ?
        <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', pointerEvents: 'none', }}>
          <ActivityIndicator size="large" color="green" />
        </View>
        :
        <>
          {postsType === 0 &&
            <View style={{ ...StyleSheet.absoluteFillObject, ...styles.MessageContainer, }}>
              <Text style={[{ ...styles.Message, color: '#666666', }, isDarkMode && { ...styles.Message, color: '#999999', },]}>게시글을 불러올 수 없어요.</Text>

              <View style={{ ...StyleSheet.absoluteFillObject, ...styles.refresBtnContainer, }}>
                <TouchableOpacity onPress={() => { handleRefresh() }} style={{ ...styles.refresBtn, }}>
                  <Text style={{ textAlign: 'center', color: '#ffffff', }}>다시시도</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          {postsType === 1 &&
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />} style={[{ ...styles.scrollContainer, backgroundColor: '#ffffff', }, isDarkMode && { ...styles.scrollContainer, backgroundColor: '#000000', }]}>
              {/* 제목 */}
              <Text style={[{ ...styles.PostTitle, color: '#000000', }, isDarkMode && { ...styles.PostTitle, color: '#ffffff', }]}>{postsData[0].title}</Text>

              {/* 프로필 정보 */}
              <Text style={[{ ...styles.PostTitleFooter, color: '#666666', }, isDarkMode && { ...styles.PostTitleFooter, color: '#666666', }]}>{postsData[0].category === 'board-Anonymous' ? '익명' : postsData[0].author} {(postsData[0].date).substr(11, 5)} 조회{postsData[0].views}</Text>

              {/* 게시글 내용 */}
              <Text style={[{ ...styles.PostContent, color: '#000000', }, isDarkMode && { ...styles.PostContent, color: '#ffffff', }]}>{postsData[0].content}</Text>

              {/* 이미지 */}
              {postsData.imageData &&
                <View style={[{ ...styles.PostImageContainer, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.PostImageContainer, backgroundColor: '#121212', }]}>
                  <ScrollView horizontal>
                    {(postsData.imageData).map((image, index) => (
                      <TouchableOpacity key={index} onPress={() => { openImageViewer(`data:${JSON.parse(postsData.imageInfo)[index].type};base64,${image}`, JSON.parse(postsData.imageInfo)[index]) }}>
                        <FastImage key={index} source={{ uri: `data:${JSON.parse(postsData.imageInfo)[index].type};base64,${image}` }} style={{ width: 150, height: 150, marginRight: 15, borderRadius: 10, }} />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              }

              {/* 댓글 */}
              <View style={[{ ...styles.CommentsContainer, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.CommentsContainer, backgroundColor: '#121212', }]}>
                {commentsType === null || repliesType === null ?
                  <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', }}>
                    <ActivityIndicator size={20} color="blue" />
                  </View>
                  :
                  <>
                    {commentsType === 0 || repliesType === 0 ?
                      <View style={{ ...styles.MessageContainer, }}>
                        <Text style={[{ marginTop: 10, fontSize: 15, color: '#666666', }, isDarkMode && { marginTop: 10, fontSize: 15, color: '#999999', }]}>댓글을 불러올 수 없어요.</Text>

                        <View style={{ ...styles.refresBtnContainer, marginTop: 20, marginBottom: 1, justifyContent: 'flex-end', }}>
                          <TouchableOpacity onPress={() => { handleRefresh() }} style={{ ...styles.refresBtn, width: 80, height: 40, }}>
                            <Text style={{ textAlign: 'center', color: '#ffffff', }}>다시시도</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      :
                      <>
                        {commentsType === 1 && repliesType === 1 ?
                          <>
                            {/* 댓글달기 */}
                            <TouchableOpacity style={[{ ...styles.CommentsReplyContainer, backgroundColor: '#DCDCDC' }, isDarkMode && { ...styles.CommentsReplyContainer, backgroundColor: '#808080' }]} onPress={() => navigation.navigate('Community_WriteComments', { postID: postID, category: postsData[0].category, })}>
                              <Text style={[{ ...styles.CommentsReplyText, color: '#666666' }, isDarkMode && { ...styles.CommentsReplyText, color: '#FFFFFF' }]}>댓글 남기기</Text>
                            </TouchableOpacity>

                            {commentsData.length != 0 &&
                              <>
                                <TouchableOpacity onPress={() => navigation.navigate('Community_WriteComments', { postID: postID, category: postsData[0].category, })}>
                                  <Text style={[{ ...styles.CommentsLengthText, color: '#000000' }, isDarkMode && { ...styles.CommentsLengthText, color: '#ffffff' }]}>댓글 {commentsData === null ? '0' : commentsData.length} {<Icon_Ionicons name='chevron-forward-outline' size={17} />}</Text>
                                </TouchableOpacity>

                                {commentsData.map((data) => {
                                  return (
                                    <View key={data.id} style={{ flex: 1, marginTop: 20 }}>
                                      {/* 아이콘 */}
                                      <View style={{ position: 'absolute' }}>
                                        <View style={{ width: 40, height: 40, left: 7, borderRadius: 25, backgroundColor: '#C0C0C0', position: 'absolute' }}></View>
                                        <Icon_Feather name='user' size={20} style={{ left: 17, top: 8, borderRadius: 25, color: 'black', position: 'absolute' }} />
                                      </View>

                                      {/* 댓글 모달 */}
                                      <TouchableOpacity onPress={() => openSeeMoreModal(data, 'Comment')} style={{ zIndex: 999, position: 'absolute', right: 10, }}>
                                        <Icon_Feather color={isDarkMode ? '#ffffff' : '#000000'} name="more-vertical" size={20} />
                                      </TouchableOpacity>

                                      <View>
                                        {/* 사용자ID */}
                                        <Text style={[{ ...styles.CommentsAuthorText, color: '#000000' }, isDarkMode && { ...styles.CommentsAuthorText, color: '#ffffff' }]}>{postsData[0].category === 'board-Anonymous' ? '익명' : data.author}</Text>
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
                                                style={{ maxWidth: 250, width: JSON.parse(data.image_Info).width / 6, height: JSON.parse(data.image_Info).height / 12, left: 58, marginBottom: 5, }}
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

                                                  {/* 댓글 모달 */}
                                                  <TouchableOpacity onPress={() => openSeeMoreModal(_data, 'Reply')} style={{ zIndex: 999, position: 'absolute', right: 10, }}>
                                                    <Icon_Feather color={isDarkMode ? '#ffffff' : '#000000'} name="more-vertical" size={20} />
                                                  </TouchableOpacity>

                                                  {/* 답글 */}
                                                  <View style={{ marginBottom: 13, }} onPress={() => navigation.navigate('Community_WriteReplies', { commentsID: data.id, postID: postID, category: postsData[0].category })}>
                                                    {/* 사용자ID */}
                                                    <Text style={[{ ...styles.RepliesAuthorText, color: '#000000' }, isDarkMode && { ...styles.RepliesAuthorText, color: '#ffffff' }]}>{postsData[0].category === 'board-Anonymous' ? '익명' : _data.author}</Text>
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
                              </>
                            }
                          </>
                          :
                          null
                        }
                      </>
                    }
                  </>
                }
              </View>
            </ScrollView>
          }
        </>
      }
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
  backButtonView: {
    position: 'absolute',
    left: 10,
  },
  MessageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  PostTitle: {
    width: '93%',
    marginLeft: 15,
    fontSize: 25,
    fontWeight: '600',
  },
  PostTitleFooter: {
    marginTop: 1,
    marginLeft: 18,
    fontSize: 11,
    fontWeight: '500',
  },
  PostContent: {
    marginTop: 20,
    marginLeft: 18,
    marginRight: 15,
    marginBottom: 30,
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
  },
  PostImageContainer: {
    width: 'auto',
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
  },
  CommentsContainer: {
    width: 'auto',
    marginTop: 5,
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
  },
  CommentsReplyContainer: {
    width: '100%',
    height: 40,
    borderRadius: 25,
    backgroundColor: '#DCDCDC',
    justifyContent: 'center',
    alignContent: 'center',
  },
  CommentsReplyText: {
    left: 20,
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

// const deleteComment = async(commentID) => {
//     AsyncStorage.getItem('id')
//         .then(async(accountID) => {
//             await axiosInstance.post('/Community/deleteComments', {postID: postID, commentID: commentID, accountID: accountID })
//                 .then(async(res) => {
//                     if (res.status === 200) {
//                         commentCheck()
//                         repliesCheck()
//                         return Alert.alert('성공', res.data.message)
//                     } else {
//                         return Alert.alert('에러', '예외가 발생하였습니다.')
//                     }
//                 }).catch((error) => {
//                     console.log(error)
//                     const res = error.response
//                     if (res.status === 400) {
//                         return Alert.alert(res.data.error, res.data.errorDescription)
//                     } else if (res.status === 500) {
//                         return Alert.alert(res.data.error, res.data.errorDescription)
//                     } else {
//                         // 예외발생
//                         return Alert.alert('에러', '예외')
//                     }
//                 })
//         }).catch((error) => {
//             console.log(error)
//         })
//   }

//   const editComment = async(commentID) => {
//     const content = '수정된 댓글'
//     AsyncStorage.getItem('id')
//         .then(async(accountID) => {
//             await axiosInstance.post('/Community/editComments', { postID: postID, commentID: commentID, accountID: accountID, content: content })
//                 .then(async(res) => {
//                     if (res.status === 200) {
//                         commentCheck()
//                         repliesCheck()
//                         return Alert.alert('성공', res.data.message)
//                     } else {
//                         return Alert.alert('에러', '예외가 발생하였습니다.')
//                     }
//                 }).catch((error) => {
//                     console.log(error)
//                     const res = error.response
//                     if (res.status === 400) {
//                         return Alert.alert(res.data.error, res.data.errorDescription)
//                     } else if (res.status === 500) {
//                         return Alert.alert(res.data.error, res.data.errorDescription)
//                     } else {
//                         // 예외발생
//                         return Alert.alert('에러', '예외')
//                     }
//                 })
//         }).catch((error) => {
//             console.log(error)
//         })
//   }

//   const deleteReplies = async(repliesID, commentID) => {
//     AsyncStorage.getItem('id')
//         .then(async(accountID) => {
//             await axiosInstance.post('/Community/deleteReplies', {repliesID: repliesID, commentID: commentID, postID: postID, accountID: accountID })
//                 .then(async(res) => {
//                     if (res.status === 200) {
//                         commentCheck()
//                         repliesCheck()
//                         return Alert.alert('성공', res.data.message)
//                     } else {
//                         return Alert.alert('에러', '예외가 발생하였습니다.')
//                     }
//                 }).catch((error) => {
//                     console.log(error)
//                     const res = error.response
//                     if (res.status === 400) {
//                         return Alert.alert(res.data.error, res.data.errorDescription)
//                     } else if (res.status === 500) {
//                         return Alert.alert(res.data.error, res.data.errorDescription)
//                     } else {
//                         // 예외발생
//                         return Alert.alert('에러', '예외')
//                     }
//                 })
//         }).catch((error) => {
//             console.log(error)
//         })
//   }

//   const editReplies = async(repliesID, commentID) => {
//     const content = '수정된 답글'
//     AsyncStorage.getItem('id')
//         .then(async(accountID) => {
//             await axiosInstance.post('/Community/editReplies', {repliesID: repliesID, commentID: commentID, postID: postID, accountID: accountID, content: content })
//                 .then(async(res) => {
//                     if (res.status === 200) {
//                         commentCheck()
//                         repliesCheck()
//                         return Alert.alert('성공', res.data.message)
//                     } else {
//                         return Alert.alert('에러', '예외가 발생하였습니다.')
//                     }
//                 }).catch((error) => {
//                     console.log(error)
//                     const res = error.response
//                     if (res.status === 400) {
//                         return Alert.alert(res.data.error, res.data.errorDescription)
//                     } else if (res.status === 500) {
//                         return Alert.alert(res.data.error, res.data.errorDescription)
//                     } else {
//                         // 예외발생
//                         return Alert.alert('에러', '예외')
//                     }
//                 })
//         }).catch((error) => {
//             console.log(error)
//         })
//   }

{
  /* <TouchableOpacity onPress={() => {
          console.log(item.id)
          deletePost(item.id)
        }}><Text>삭제하기</Text></TouchableOpacity>

        <TouchableOpacity onPress={() => {
          console.log(item.id)
          editPost(item.id)
        }}><Text>수정하기</Text></TouchableOpacity> */
}

// const deletePost = async (postID) => {
//   AsyncStorage.getItem('id')
//     .then(async (accountID) => {
//       await axiosInstance.post('/Community/deletePost', { postID: postID, accountID: accountID })
//         .then(async (res) => {
//           if (res.status === 200) {
//             handleRefresh()
//             return Alert.alert('성공', res.data.message)
//           } else {
//             return Alert.alert('에러', '예외가 발생하였습니다.')
//           }
//         }).catch((error) => {
//           console.log(error)
//           const res = error.response
//           if (res.status === 400) {
//             return Alert.alert(res.data.error, res.data.errorDescription)
//           } else if (res.status === 500) {
//             return Alert.alert(res.data.error, res.data.errorDescription)
//           } else {
//             // 예외발생
//             return Alert.alert('에러', '예외')
//           }
//         })
//     }).catch((error) => {
//       console.log(error)
//     })
// }

// const editPost = async (postID) => {
//   const title = '게시글 수정 테스트'
//   const content = '테스트'
//   AsyncStorage.getItem('id')
//     .then(async (accountID) => {
//       await axiosInstance.post('/Community/editPost', { postID: postID, accountID: accountID, title: title, content: content })
//         .then(async (res) => {
//           if (res.status === 200) {
//             handleRefresh()
//             return Alert.alert('성공', res.data.message)
//           } else {
//             console.log(res)
//             return Alert.alert('에러', '예외가 발생하였습니다.')
//           }
//         }).catch((error) => {
//           console.log(error)
//           const res = error.response
//           if (res.status === 400) {
//             return Alert.alert(res.data.error, res.data.errorDescription)
//           } else if (res.status === 500) {
//             return Alert.alert(res.data.error, res.data.errorDescription)
//           } else {
//             // 예외발생
//             return Alert.alert('에러', '예외')
//           }
//         })
//     }).catch((error) => {
//       console.log(error)
//     })
// }
