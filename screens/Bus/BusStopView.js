import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Button, View, Text, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useIsFocused, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import axiosInstance from '../../api/API_Server';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

export default function BusStopView({ navigation }) {
  const route = useRoute()
  const { data } = route.params

  const isDarkMode = useColorScheme() === 'dark'
  const isFocused = useIsFocused()

  const [BusStopData, setBusStopDate] = useState([])
  const [BusStopType, setBusStopType] = useState(null)

  const [NowLoading, setNowLoading] = useState(false)

  const [favoriteState, setFavoriteState] = useState(false)

  const handleAddBusStop = async (ID) => {
    Alert.alert('알림', `선택하신 정류장(${ID})을 홈 즐겨찾기에 추가하시겠습니까?`, [
      {
        text: '추가', onPress: () => {
          AsyncStorage.setItem('set_busStopID_1', `${ID}`)
            .then(() => {
              Toast.show({
                type: 'success',
                text1: `정류장(${ID})을 홈에 추가했어요.`,
                text2: '홈을 쓸어내려 새로고침 해주세요.',
                position: 'bottom',
              })
            }).catch((error) => {
              Toast.show({
                type: 'error',
                text1: `정류장(${ID})을 추가하지 못했어요.`,
                text2: `${error}`,
                position: 'bottom',
              })
            })
        }
      },
      { text: '취소', }
    ])
  }

  async function handleGetBusStopFavorites() { // 즐겨찾기 활성화 여부
    const _data = await AsyncStorage.getItem('Bus_FavoritesList')

    if (_data) { // 데이터가 있을 경우
      const favorites = JSON.parse(_data)
      for (const [index, favoriteData] of favorites.entries()) {
        if (favoriteData.data.busStopID === data.busStopID) {
          setFavoriteState(true)
          return index
        }
      }
      setFavoriteState(false)
      return false
    } else { // 데이터가 없을 경우
      setFavoriteState(false)
      return false
    }
  }

  const handleBusStopFavorites = async () => {
    await AsyncStorage.getItem('Bus_FavoritesList')
      .then(async (_data) => {
        if (_data) {
          const tempData = JSON.parse(_data)
          handleGetBusStopFavorites()
            .then((result) => {
              if (result === false) { // 데이터가 존재하지 않으면 추가
                const DATA = {
                  type: 'busStop',
                  data: data
                }
                tempData.push(DATA)
                AsyncStorage.setItem('Bus_FavoritesList', JSON.stringify(tempData)) // 데이터 저장
                handleGetBusStopFavorites() // 즐겨찾기 데이터 다시 조회

                Toast.show({
                  type: 'info',
                  text1: '즐겨찾기에 추가했어요.',
                  position: 'bottom',
                })
              } else {
                const newData = []
                for (const [index, favoriteData] of tempData.entries()) {
                  if (favoriteData != tempData[result]) {
                    newData.push(favoriteData)
                  }
                }
                AsyncStorage.setItem('Bus_FavoritesList', JSON.stringify(newData)) // 데이터 저장
                handleGetBusStopFavorites() // 즐겨찾기 데이터 다시 조회

                Toast.show({
                  type: 'info',
                  text1: '즐겨찾기에서 삭제했어요.',
                  position: 'bottom',
                })
              }
            }).catch((error) => {
              Toast.show({
                type: 'error',
                text1: '데이터를 추가하거나 삭제하지 못했습니다.',
                text2: `${error}`,
              })
            })
        } else {
          // 데이터를 처음 저장
          const tempData = []
          const DATA = {
            type: 'busStop',
            data: data
          }
          tempData.push(DATA)
          AsyncStorage.setItem('Bus_FavoritesList', JSON.stringify(tempData))
          handleGetBusStopFavorites() // 즐겨찾기 데이터 조회

          Toast.show({
            type: 'info',
            text1: '즐겨찾기에 추가했어요.',
            position: 'bottom',
          })
        }
      }).catch((error) => {
        Toast.show({
          type: 'error',
          text1: '데이터를 추가하지 못했습니다.',
          text2: `${error}`,
        })
      })
  }

  const handleBusArrivalInformation = async () => {
    await axiosInstance.post('/Bus/ArrivalInformation', { busStopID: data.busStopID })
      .then((res) => {
        setNowLoading(false)
        if (res.status === 200) {
          setBusStopDate(res.data)
          setBusStopType(1)
        } else {
          setBusStopType(0)
        }
      }).catch((error) => {
        setNowLoading(false)
        setBusStopType(0)
        if (error.response) {
          const res = error.response
          if (res.status === 500) {
            Toast.show({
              type: 'error',
              text1: `${res.data.errorDescription}`,
              text2: `${res.data.error}`,
            })
          } else {
            Toast.show({
              type: 'error',
              text1: '서버와 연결할 수 없습니다.',
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

  useEffect(() => {
    handleBusArrivalInformation()
    handleGetBusStopFavorites()

    const intervalId = setInterval(() => {
      if (isFocused) {
        setNowLoading(true)
        handleBusArrivalInformation()
      }
    }, 15000)

    // 컴포넌트가 언마운트 될 때 clearInterval 호출하여 메모리 누수 방지
    return () => {
      clearInterval(intervalId)
    }
  }, [isFocused])

  return (
    <SafeAreaView style={{ ...styles.container, backgroundColor: isDarkMode ? '#000000' : '#ffffff' }}>
      {/* 로고 */}
      <View style={styles.logoView}>
        <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 50 } : { ...styles.backButtonView, }} onPress={() => navigation.goBack()}>
          <Text style={{ ...styles.backButtonText, color: isDarkMode ? '#ffffff' : '#000000' }}>{<Icon_Ionicons name='chevron-back-outline' size={21} />} 정류장</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleBusStopFavorites()} style={Platform.OS === 'ios' ? { position: 'absolute', marginTop: 50, right: 20, } : { position: 'absolute', right: 20, }}>
          <Icon_Feather style={{ color: favoriteState ? '#FFD700' : `${isDarkMode ? '#ffffff' : '#000000'}` }} color={isDarkMode ? '#ffffff' : '#000000'} name="star" size={20} />
        </TouchableOpacity>
      </View>

      {/* 현재 로딩 중 */}
      {NowLoading === true || BusStopType === null || BusStopType === 0 ?
        <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 999, pointerEvents: 'none', }}>
          <ActivityIndicator size={15} color="green" />
        </View> : null
      }

      <>
        {/* 버튼 */}
        <TouchableOpacity onPress={() => {
          setNowLoading(true)
          handleBusArrivalInformation()
        }} style={{ zIndex: 999, position: 'absolute', right: 10, bottom: 13, }}>
          <View style={{ width: 50, height: 50, borderRadius: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? '#999999' : '#1D1E23', }}>
            <Icon_Feather color={'#ffffff'} name="rotate-cw" size={25} />
          </View>
        </TouchableOpacity>
      </>

      {/* 정류장 정보 */}
      <>
        <View style={{ width: '100%', height: 90, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? '#000000' : '#ffffff', }}>
          <Text style={{ marginBottom: 3, fontSize: 23, color: isDarkMode ? '#ffffff' : '#000000', }}>{data.busStopName}</Text>
          <Text style={{ fontSize: 13, color: isDarkMode ? '#ffffff' : '#000000', }}>{data.busStopID}</Text>
        </View>

        {/* 버튼 */}
        <View style={{ flexDirection: 'row', width: '100%', height: 50, marginTop: 10, marginBottom: 20, justifyContent: 'center', alignItems: 'center', }}>
          <TouchableOpacity onPress={() => handleAddBusStop(data.busStopID)}>
            <View style={{ justifyContent: 'center', alignItems: 'center', }}>
              <View style={{ width: 40, height: 40, borderRadius: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? '#999999' : '#F5F5F5', }}>
                <Icon_Feather color={isDarkMode ? '#333333' : '#000000'} name="home" size={23} />
              </View>
              <Text style={{ marginTop: 5, fontSize: 10, color: isDarkMode ? '#ffffff' : '#000000', }}>홈에 추가</Text>
            </View>
          </TouchableOpacity>
        </View>
      </>

      {/* 곧 도착 */}
      <>
        <View style={{ width: '100%', padding: 7, borderTopWidth: 0.5, borderBottomWidth: 0.5, borderTopColor: '#999999', borderBottomColor: '#999999', }}>
          <Text style={{ marginLeft: 7, color: isDarkMode ? '#ffffff' : '#000000' }}>곧 도착  {
            BusStopType === 1 && BusStopData.ArrivingSoon.length != 0 ?
              (BusStopData.ArrivingSoon).map((text, index) => {
                return (
                  <Text key={index} style={{ color: '#FF4500', }}>
                    {text}번{BusStopData.ArrivingSoon.length - 1 != index ? ' ' : ''}
                  </Text>
                )
              })
              :
              <Text style={{ color: '#FF4500', }}>
                없음
              </Text>
          }</Text>
        </View>
      </>

      {/* 버스 도착 정보 */}
      {BusStopData.data &&
        <>
          <ScrollView style={{ flex: 1, }}>
            {(BusStopData.data).map((data, index) => {
              const direction = (data.direction).substr(0, data.direction.length - 2).length >= 10 ? `${(data.direction).substr(0, 9)}...` : `${(data.direction).substr(0, data.direction.length - 2)} 방향`
              const currentLocation = (data.currentLocation).substring((data.currentLocation).lastIndexOf('(') + 1, (data.currentLocation).lastIndexOf(')'))
              return (
                <View key={index}>
                  <View style={{ width: '100%', height: 0.5, backgroundColor: '#999999' }}></View>
                  <View style={{ flexDirection: 'row', width: '100%', height: 70, paddingLeft: 10, alignItems: 'center', backgroundColor: isDarkMode ? '#000000' : '#ffffff' }}>
                    <Text style={{ left: 10, marginBottom: 7, fontWeight: '400', position: 'absolute', color: isDarkMode ? '#ffffff' : '#000000', }}>
                      {data.busNumber}번 {'('}{direction}{')'}
                    </Text>
                    <Text style={{ right: 10, marginBottom: 7, fontWeight: '500', position: 'absolute', color: isDarkMode ? '#ffffff' : '#000000', }}>
                      {data.arrivalTime} {currentLocation ? `[${currentLocation}]` : null}
                    </Text>
                  </View>
                  {/* 마지막에 선 추가 */}
                  {BusStopData.data.length - 1 === index &&
                    <View style={{ width: '100%', height: 0.5, backgroundColor: '#999999' }}></View>
                  }
                </View>
              )
            })}
          </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoView: {
    height: 60,
    justifyContent: 'center',
  },
  backButtonView: {
    position: 'absolute',
    left: 10,
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '400',
  },
  deleteBusStopView: {
    width: 70,
    height: 35,
    right: 20,
    borderRadius: 10,
    position: 'absolute',
    justifyContent: 'center',
    backgroundColor: 'red',
  },
  deleteBusStopText: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
  },
  inputContainer: {
    alignItems: 'center',
  },
  inputView: {
    width: '90%',
    borderRadius: 10,
    height: 50,
    marginBottom: 20,
    justifyContent: 'center',
    padding: 13,
    borderWidth: 2,
  },
  inputText: {
    width: '90%',
    height: 40,
    left: 10,
    position: 'absolute',
  },
  searchBtnContainer: {
    position: 'absolute',
    right: 15,
  },
})