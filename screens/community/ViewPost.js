import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl, ScrollView, View, Text, TxtInput, Button, Modal, } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { CommonActions, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';
import Icon_Entypo from 'react-native-vector-icons/Entypo';

import axiosInstance from '../../api/API_Server';
import ImageViewer from '../../api/ImageViewer';

export default function ViewPost({ navigation }) {
  const route = useRoute()
  const { postID, Title } = route.params

  const isDarkMode = useColorScheme() === 'dark'
  const isFocused = useIsFocused()

  const [refreshing, setRefreshing] = useState(false)

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
    try {
      const params = {
        postID: postID,
      }
      await axiosInstance.get('/Community/postInquiry', { params })
        .then(res => {
          const data = res.data.data
          setPostsData(data)
          setPostsType(1)
        }).catch(error => {
          setPostsType(0)
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
      setPostsType(0)
      console.log(error)
    }
  }

  const commentsCheck = async () => {
    setCommentsType(null)
    try {
      await axiosInstance.post('/Community/commentsCheck', { postID: postID })
        .then(res => {
          const data = res.data.data
          setCommentsData(data)
          setCommentsType(1)
        }).catch(error => {
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
        .then(res => {
          const data = res.data.data
          setRepliesData(data)
          setRepliesType(1)
        }).catch(error => {
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

  const handleRefresh = () => {
    setRefreshing(true)
    communityInquiry()
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
    communityInquiry()
    commentsCheck()
    repliesCheck()
  }, [isFocused])

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#ffffff' }, isDarkMode && { ...styles.container, backgroundColor: '#000000' },]}>
      {/* 이미지뷰어 */}
      <ImageViewer imageData={imageViewerData} imageInfo={imageViewerInfo} visible={imageViewerState} onClose={() => closeImageViewer()} />

      {/* 로고 */}
      <View style={styles.logoView}>
        <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 50 } : { ...styles.backButtonView }} onPress={() => navigation.goBack()}>
          <Text style={[{ ...styles.logoText, color: '#000000' }, isDarkMode && { ...styles.logoText, color: '#ffffff' },]}>
            {<Icon_Ionicons name="chevron-back-outline" size={21} />} {Title}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 50 } : { ...styles.backButtonView, marginLeft: 0, marginRight: 10, }} onPress={() => navigation.goBack()}>
          <Text style={[{ ...styles.logoText, color: '#000000' }, isDarkMode && { ...styles.logoText, color: '#ffffff' },]}>
            {<Icon_Ionicons name="more-vertical" size={21} />} {Title}
          </Text>
        </TouchableOpacity>
      </View>

      {postsType === null ?
        <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', }}>
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
              <Text style={[{ ...styles.PostTitleFooter, color: '#666666', }, isDarkMode && { ...styles.PostTitleFooter, color: '#666666', }]}>{postsData[0].author} {(postsData[0].date).substr(11, 5)} 조회{postsData[0].views}</Text>

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
                            <TouchableOpacity style={[{ ...styles.CommentsReplyContainer, backgroundColor: '#DCDCDC' }, isDarkMode && { ...styles.CommentsReplyContainer, backgroundColor: '#808080' }]} onPress={() => navigation.navigate('Community_WriteComments', { postID: postID })}>
                              <Text style={[{ ...styles.CommentsReplyText, color: '#666666' }, isDarkMode && { ...styles.CommentsReplyText, color: '#FFFFFF' }]}>댓글 남기기</Text>
                            </TouchableOpacity>

                            {commentsData.length != 0 &&
                              <>
                                <TouchableOpacity onPress={() => navigation.navigate('Community_WriteComments', { postID: postID })}>
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

                                      <View>
                                        {/* 댓글 모달 */}
                                        {/* <TouchableOpacity key={data.id} style={{position: 'absolute', right: 10}}>
                                          <Icon_Ionicons name='ellipsis-horizontal-circle-outline' size={20} style={[{color: '#000000'}, isDarkMode && {color: '#ffffff'}]}/>
                                        </TouchableOpacity> */}
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

                                      {repliesData.length != 0 &&
                                        <>
                                          {repliesData.map((_data) => {
                                            if (data.id === _data.comments_id) {
                                              return (
                                                <View key={_data.id} style={{ flex: 1 }}>
                                                  {/* <TouchableOpacity style={{ position: 'absolute', right: 30 }} onPress={() => {
                                                    console.log(_data.id, data.id)
                                                    deleteReplies(_data.id, data.id)
                                                  }}>
                                                    <Text>답글 삭제</Text>
                                                  </TouchableOpacity>

                                                  <TouchableOpacity style={{ position: 'absolute', right: 120 }} onPress={() => {
                                                    console.log(_data.id, data.id)
                                                    editReplies(_data.id, data.id)
                                                  }}>
                                                    <Text>답글 수정</Text>
                                                  </TouchableOpacity> */}

                                                  {/* 아이콘 */}
                                                  <View>
                                                    <View style={{ width: 30, height: 30, left: 37, borderRadius: 25, backgroundColor: '#C0C0C0', position: 'absolute' }}></View>
                                                    <Icon_Feather name='user' size={15} style={{ left: 45, top: 7, borderRadius: 25, color: 'black', position: 'absolute' }} />
                                                  </View>

                                                  {/* 답글 */}
                                                  <View style={{ marginBottom: 13, }} onPress={() => navigation.navigate('Community_WriteReplies', { commentsID: data.id, postID: postID })}>
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
    marginLeft: 20,
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
