import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, FlatList, Text, TextInput, Image, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useIsFocused } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import { Picker } from '@react-native-picker/picker';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-toast-message';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

import axiosInstance from '../../api/API_Server';

const SelectBoardModal = ({ setTitle, setSelectBoard, handleRefresh, selectBoard, visible, isDarkMode, closeModal }) => {
  return (
    <Modal animationType='slide' transparent={true} visible={visible} onRequestClose={() => closeModal()}>
      <View style={SelectModalStyles.container}>
        <View style={[{ ...SelectModalStyles.boxContainer, backgroundColor: '#EBEBEB' }, isDarkMode && { ...SelectModalStyles.boxContainer, backgroundColor: '#363638' }]}>
          <Picker
            style={{ color: isDarkMode ? '#ffffff' : '#000000' }}
            selectedValue={selectBoard}
            onValueChange={async (value) => {
              setSelectBoard(value)
              if (value === 'board-Free') {
                setTitle('자유게시판')
              } else if (value === 'board-Anonymous') {
                setTitle('익명게시판')
              } else {
                setTitle('커뮤니티')
              }
              closeModal()
              handleRefresh(value)
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
    marginBottom: 70,
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

export default function CommunityHome({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'
  const isFocused = useIsFocused()

  const [postType, setPostType] = useState(null)

  const [Title, setTitle] = useState('커뮤니티')
  const [selectModalState, setSelectModalState] = useState(false)
  const [selectBoard, setSelectBoard] = useState('board-Free')

  const [state, setState] = useState({
    postData: [],
    currentPage: 1,
    totalPages: 0,
    refreshing: false,
  })

  const communityInquiry = async (page, boardType) => {
    const blockUser = await AsyncStorage.getItem('community_blockedUser')
    try {
      const params = {
        page: page ? page : state.currentPage,
        limit: 20,
        board: boardType ? boardType : selectBoard,
        blockUser: JSON.parse(blockUser)
      }
      await axiosInstance.get('/Community/postInquiry', { params })
        .then(async (res) => {
          if (res.status === 200) {
            const data = res.data.data
            setState((prevState) => ({
              ...prevState,
              postData: [...prevState.postData, ...data],
              totalPages: res.data.totalPages,
              currentPage: page ? state.currentPage - (state.currentPage - 2) : state.currentPage + 1,
              refreshing: false
            }))
            setPostType(1)
          } else {
            setPostType(0) // 예외 발생
          }
        }).catch((error) => {
          setPostType(0)
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
      setPostType(0)
      Toast.show({
        type: 'error',
        text1: '예외가 발생했습니다.',
        text2: `${error}`,
      })
    }
  }

  const renderItems = ({ item }) => {
    const today = new Date()
    const itemDate = new Date(item.date)

    return (
      <View style={{ ...styles.InfoContainer, }}>
        <TouchableOpacity key={item.id} style={[{ ...styles.Info, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]} onPress={() => { navigation.navigate('Community_ViewPost', { postID: item.id, Title: Title, }) }}>
          <View style={styles.Item}>
            <>
              {item.post_type === 0 && <Text style={[{ ...styles.Title, width: `${item.image_Preview ? '65%' : '85%'}`, color: '#000000', }, isDarkMode && { ...styles.Title, width: `${item.image_Preview ? '65%' : '85%'}`, color: '#ffffff', }]}>{item.title}</Text>}
              {item.post_type === 1 && <Text style={[{ ...styles.Title, width: `${item.image_Preview ? '65%' : '85%'}`, color: '#000000', }, isDarkMode && { ...styles.Title, width: `${item.image_Preview ? '65%' : '85%'}`, color: '#ffffff', }]}>신고된 게시글</Text>}
              {item.post_type === 2 && <Text style={[{ ...styles.Title, width: `${item.image_Preview ? '65%' : '85%'}`, color: '#000000', }, isDarkMode && { ...styles.Title, width: `${item.image_Preview ? '65%' : '85%'}`, color: '#ffffff', }]}>비공개 게시글</Text>}
            </>
          </View>
          <View style={styles.Item}>
            <Text style={[{ ...styles.Value, color: '#666666', }, isDarkMode && { ...styles.Value, color: '#666666', }]}>
              {
                <>
                  {item.post_type === 0 && item.author}
                  {item.post_type === 1 && '신고됨'}
                  {item.post_type === 2 && '비공개'}
                </>
              }{'   '}
              {`${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}` === `${itemDate.getFullYear()}-${itemDate.getMonth() + 1}-${itemDate.getDate()}` ?
                `${itemDate.getHours().toString().length === 1 ? `0${itemDate.getHours()}` : `${itemDate.getHours()}`}:${itemDate.getMinutes().toString().length === 1 ? `0${itemDate.getMinutes()}` : `${itemDate.getMinutes()}`}`
                :
                `${itemDate.getFullYear().toString().substring(2, 4)}.${(itemDate.getMonth() + 1).toString().length === 1 ? `0${itemDate.getMonth()}` : `${itemDate.getMonth()}`}.${itemDate.getDate().toString().length === 1 ? `0${itemDate.getDate()}` : `${itemDate.getDate()}`}`
              }
              {'   '}
              조회{'  '}{item.views}</Text>
          </View>

          {item.post_type === 0 && item.image_Preview &&
            <View style={[{ ...styles.imageContainer, backgroundColor: '#ffffff', }, isDarkMode && { ...styles.imageContainer, backgroundColor: '#000000', }]}>
              <FastImage source={{ uri: `data:image/jpeg;base64,${item.image_Preview}` }} style={{ width: 45, height: '100%', }} />
            </View>
          }

          <View style={[{ ...styles.commentsContainer, backgroundColor: '#ffffff', }, isDarkMode && { ...styles.commentsContainer, backgroundColor: '#000000', }]}>
            <Text style={[{ ...styles.commentsTitle, color: '#333333', }, isDarkMode && { ...styles.commentsTitle, color: '#999999', }]}>{item.commentsCount}</Text>
            <Text style={[{ ...styles.commentsValue, color: '#666666', }, isDarkMode && { ...styles.commentsValue, color: '#999999', }]}>댓글</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  const loadNextPage = () => {
    communityInquiry()
  }

  const handleRefresh = (boardType) => {
    setPostType(null)
    setState({
      postData: [],
      currentPage: 1,
      totalPages: 0,
      refreshing: true,
    })
    setTimeout(() => {
      communityInquiry(1, boardType)
    }, 1000)
  }

  const openModal = () => {
    setSelectModalState(true)
  }

  const closeModal = () => {
    setSelectModalState(false)
  }

  useEffect(() => {
    communityInquiry()
    if (selectBoard === 'board-Free') {
      setTitle('자유게시판')
    } else if (selectBoard === 'board-Anonymous') {
      setTitle('익명게시판')
    } else {
      setTitle('커뮤니티')
    }
  }, [])

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#FFFFFF' }, isDarkMode && { ...styles.container, backgroundColor: '#000000' }]}>
      {/* 게시판 선택 모달 */}
      <SelectBoardModal setTitle={setTitle} setSelectBoard={setSelectBoard} handleRefresh={handleRefresh} selectBoard={selectBoard} visible={selectModalState} isDarkMode={isDarkMode} closeModal={() => closeModal()} />

      {/* 로고 */}
      <TouchableOpacity style={{ marginBottom: 50, marginTop: 10 }} onPress={openModal} >
        <Text style={[{ ...styles.logo, color: '#000000' }, isDarkMode && { ...styles.logo, color: '#ffffff' }]}>{<Image style={{ width: 30, height: 30 }} source={require('../../resource/logo_v1.png')} />} {Title} {<Icon_Feather size={18} name='chevron-down' />}</Text>
      </TouchableOpacity>

      {postType === null ?
        <View style={{ ...StyleSheet.absoluteFillObject, ...styles.MessageContainer, }}>
          <Text style={[{ ...styles.Message, color: '#666666', }, isDarkMode && { ...styles.Message, color: '#999999', }]}>새로 고치는 중...</Text>
        </View>
        :
        <>
          {postType === 0 &&
            <>
              <View style={{ ...StyleSheet.absoluteFillObject, ...styles.MessageContainer, }}>
                <Text style={[{ ...styles.Message, color: '#666666', }, isDarkMode && { ...styles.Message, color: '#999999', }]}>게시글을 불러오지 못했어요.</Text>
              </View>

              <View style={{ ...StyleSheet.absoluteFillObject, ...styles.refresBtnContainer, }}>
                <TouchableOpacity onPress={() => { handleRefresh() }} style={{ ...styles.refresBtn, }}>
                  <Text style={{ textAlign: 'center', color: '#ffffff' }}>다시시도</Text>
                </TouchableOpacity>
              </View>
            </>
          }
          {postType === 1 &&
            <>
              {/* 게시글 생성 버튼 */}
              <TouchableOpacity style={styles.newPostButton} onPress={() => { navigation.navigate('Community_WritePost') }}>
                <Text style={{ textAlign: 'center' }}>
                  {<Icon_Ionicons name='add-circle-outline' size={35} style={{ paddingLeft: 10, color: '#ffffff' }} />}
                </Text>
              </TouchableOpacity>

              {state.postData.length === 0 ?
                <>
                  <View style={{ ...StyleSheet.absoluteFillObject, ...styles.MessageContainer, }}>
                    <Text style={[{ ...styles.Message, color: '#666666', }, isDarkMode && { ...styles.Message, color: '#999999', }]}>불러올 데이터가 없습니다.</Text>
                  </View>

                  <View style={{ ...StyleSheet.absoluteFillObject, ...styles.refresBtnContainer, }}>
                    <TouchableOpacity onPress={() => { handleRefresh() }} style={{ ...styles.refresBtn, }}>
                      <Text style={{ textAlign: 'center', color: '#ffffff' }}>새로고침</Text>
                    </TouchableOpacity>
                  </View>
                </>
                :
                <>
                  {/* 게시글 표시 */}
                  <View style={{ marginBottom: 100, }}>
                    <FlatList
                      data={state.postData}
                      renderItem={renderItems}
                      onEndReached={loadNextPage}
                      onEndReachedThreshold={1}
                      refreshing={state.refreshing}
                      onRefresh={handleRefresh}
                    />
                  </View>
                </>
              }
            </>
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
  logo: {
    fontSize: 30,
    fontWeight: 'bold',
    top: 20,
    left: 25,
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
  InfoContainer: {
    paddingLeft: 8,
    paddingRight: 8,
  },
  Info: {
    backgroundColor: '#f2f4f6',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 17,
    borderRadius: 10,
    marginBottom: 10,
    width: 'auto',
    position: 'relative',
  },
  Item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  Title: {
    fontSize: 18,
    fontWeight: 'bold',
    width: '85%',
  },
  Value: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: 'bold',
  },
  newPostButton: {
    bottom: 10,
    right: 10,
    width: 53,
    height: 53,
    zIndex: 999,
    paddingLeft: 2,
    borderRadius: 10,
    position: 'absolute',
    justifyContent: 'center',
    backgroundColor: '#778899',
  },
  imageContainer: {
    position: 'absolute',
    top: 10,
    right: 55,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentsContainer: {
    position: 'absolute',
    borderRadius: 3,
    paddingLeft: 5,
    paddingRight: 5,
    right: 10,
    top: 10,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentsTitle: {
    textAlign: 'center',
    justifyContent: 'center',
  },
  commentsValue: {
    textAlign: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: '400',
  },
})