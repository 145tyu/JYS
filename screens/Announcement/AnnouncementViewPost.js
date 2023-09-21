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

export default function AnnouncementViewPost({ navigation }) {
  const route = useRoute()
  const { postID, Title } = route.params

  const isDarkMode = useColorScheme() === 'dark'
  const isFocused = useIsFocused()

  const [refreshing, setRefreshing] = useState(false)

  const [postsData, setPostsData] = useState([])
  const [postsType, setPostsType] = useState(null)

  const [imageViewerState, setImageViewerState] = useState(false)
  const [imageViewerData, setImageViewerData] = useState('')
  const [imageViewerInfo, setImageViewerInfo] = useState([])

  const AnnouncementInquiry = async () => {
    setPostsType(null)
    try {
      const params = {
        postID: postID,
      }
      await axiosInstance.get('/Announcement/postInquiry', { params })
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

  const handleRefresh = () => {
    setRefreshing(true)
    AnnouncementInquiry()
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
    AnnouncementInquiry()
  }, [isFocused])

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#ffffff' }, isDarkMode && { ...styles.container, backgroundColor: '#000000' },]}>
      {/* 이미지뷰어 */}
      <ImageViewer imageData={imageViewerData} imageInfo={imageViewerInfo} visible={imageViewerState} onClose={() => closeImageViewer()} />

      {/* 로고 */}
      <View style={styles.logoView}>
        <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 50 } : { ...styles.backButtonView, }} onPress={() => navigation.goBack()}>
          <Text style={[{ ...styles.logoText, color: '#000000' }, isDarkMode && { ...styles.logoText, color: '#ffffff' },]}>
            {<Icon_Ionicons name="chevron-back-outline" size={21} />} {Title == null ? '게시글' : Title}
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
              <Text style={[{ ...styles.Message, color: '#666666', }, isDarkMode && { ...styles.Message, color: '#999999', },]}>공지를 불러올 수 없어요.</Text>

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