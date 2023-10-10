import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Button, View, Text, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useRoute } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';

import axiosInstance from '../../api/API_Server';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

export default function BusStopView({ navigation }) {
  const route = useRoute()
  const { data } = route.params

  const isDarkMode = useColorScheme() === 'dark'

  const [BusStopData, setBusStopDate] = useState([])
  const [BusStopType, setBusStopType] = useState(null)

  const [NowLoading, setNowLoading] = useState(false)

  const [favoriteState, setFavoriteState] = useState(false)

  const handleAddBusStop = async (ID) => {
    Alert.alert('알림', '선택하신 정류장을 추가하시겠습니까?', [
      {
        text: '추가', onPress: () => {
          AsyncStorage.setItem('set_busStopID_1', `${ID}`)
            .then(() => {
              return Alert.alert('성공', '정류장을 등록했습니다.\n홈에서 쓸어내려 새로고침 해주세요.')
            }).catch((error) => {
              return Alert.alert('에러', '정류장을 추가하지 못했습니다.')
            })
        }
      },
      { text: '취소' }
    ])
  }

  const handleDeleteBusStop = async (ID) => {
    Alert.alert('알림', '현재 등록된 정류장을 삭제하시겠습니까?', [
      {
        text: '삭제', onPress: () => {
          AsyncStorage.removeItem('set_busStopID_1')
            .then(() => {
              return Alert.alert('성공', '정류장을 삭제했습니다.')
            }).catch((error) => {
              return Alert.alert('에러', '정류장을 삭제하지 못했습니다.')
            })
        }
      },
      { text: '취소' }
    ])
  }

  async function handleGetBusFavorites() { // 즐겨찾기 활성화 여부
    const _data = await AsyncStorage.getItem('Bus_FavoritesList')

    if (_data) { // 데이터가 있을 경우
      const favorites = JSON.parse(_data)
      for (const [index, favoriteData] of favorites.entries()) {
        if (favoriteData.data.btnID === data.btnID) {
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

  const handleBusFavorites = async () => {
    await AsyncStorage.getItem('Bus_FavoritesList')
      .then(async (_data) => {
        if (_data) {
          const tempData = JSON.parse(_data)
          handleGetBusFavorites()
            .then((result) => {
              if (result === false) { // 데이터가 존재하지 않으면 추가
                const DATA = {
                  type: 'busStop',
                  data: data
                }
                tempData.push(DATA)
                AsyncStorage.setItem('Bus_FavoritesList', JSON.stringify(tempData)) // 데이터 저장
                handleGetBusFavorites() // 즐겨찾기 데이터 다시 조회
              } else {
                const newData = []
                for (const [index, favoriteData] of tempData.entries()) {
                  console.log(favoriteData)
                  if (favoriteData != tempData[result]) {
                    newData.push(favoriteData)
                  }
                }
                AsyncStorage.setItem('Bus_FavoritesList', JSON.stringify(newData)) // 데이터 저장
                handleGetBusFavorites() // 즐겨찾기 데이터 다시 조회
                // handleDeleteBusStop(data.busStopID)
              }
            }).catch((error) => {
              console.log(error)
              Alert.alert('에러', '데이터를 추가하거나 삭제하지 못했습니다.')
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
          handleGetBusFavorites() // 즐겨찾기 데이터 조회
        }
      }).catch((error) => {
        Alert.alert('에러', '데이터를 추가하지 못했습니다.')
      })
  }

  const handleBusArrivalInformation = async () => {
    await axiosInstance.post('/Bus/ArrivalInformation', { busStopID: data.busStopID })
      .then((res) => {
        setNowLoading(false)
        if (res.status === 200) {
          setBusStopDate(res.data.data)
          setBusStopType(1)
        } else {
          setBusStopType(0)
        }
      }).catch((error) => {
        setNowLoading(false)
        setBusStopType(0)
        console.log(error)
        if (error.response) {
          const res = error.response
          if (res.status === 400) {
            // return Alert.alert(res.data.error, res.data.errorDescription, [{ text: '확인', }])
          } else if (res.status === 500) {
            return Alert.alert(res.data.error, res.data.errorDescription, [{ text: '확인', }])
          } else {
            return Alert.alert('정보', '서버와 연결할 수 없습니다.', [{ text: '확인', }])
          }
        } else {
          return Alert.alert('정보', '서버와 연결할 수 없습니다.', [{ text: '확인', }])
        }
      })
  }

  useEffect(() => {
    handleBusArrivalInformation()
    handleGetBusFavorites()

    const intervalId = setInterval(() => {
      setNowLoading(true)
      handleBusArrivalInformation()
    }, 15000)

    // 컴포넌트가 언마운트 될 때 clearInterval 호출하여 메모리 누수 방지
    return () => {
      clearInterval(intervalId)
    }
  }, [])

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#ffffff' }, isDarkMode && { ...styles.container, backgroundColor: '#000000' }]}>
      {/* 로고 */}
      <View style={styles.logoView}>
        <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 50 } : { ...styles.backButtonView, }} onPress={() => navigation.goBack()}>
          <Text style={[{ ...styles.backButtonText, color: '#000000' }, isDarkMode && { ...styles.backButtonText, color: '#ffffff' }]}>{<Icon_Ionicons name='chevron-back-outline' size={21} />} {data.busStopName ? data.busStopName : '정류장'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleBusFavorites()} style={Platform.OS === 'ios' ? { position: 'absolute', marginTop: 50, right: 20, } : { position: 'absolute', right: 20, }}>
          <Icon_Feather style={{ color: favoriteState ? 'yellow' : `${isDarkMode ? '#ffffff' : '#000000'}` }} color={isDarkMode ? '#ffffff' : '#000000'} name="star" size={20} />
        </TouchableOpacity>
      </View>

      {NowLoading === true &&
        <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 999, }}>
          <ActivityIndicator size={15} color="green" />
        </View>
      }

      {BusStopType === null ?
        <>
          <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', }}>
            <ActivityIndicator size="large" color="green" />
          </View>
        </>
        :
        <>
          {BusStopType === 0 &&
            <>
              <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', }}>
                <ActivityIndicator size="large" color="green" />
                <Text>데이터를 불러오지 못했어요.{'\n'}20초 뒤 다시시도합니다.</Text>
              </View>
            </>
          }

          {BusStopType === 1 &&
            <>
              <TouchableOpacity onPress={() => {
                handleAddBusStop(data.busStopID) // 홈 화면 버스정류장 즐겨찾기 추가
              }} style={{ zIndex: 999, position: 'absolute', width: 50, height: 50, right: 10, bottom: 73, borderRadius: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#999999' }}>
                <Text style={{ textAlign: 'center', color: '#ffffff', }}>홈에{'\n'}추가</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => {
                setNowLoading(true)
                handleBusArrivalInformation()
              }} style={{ zIndex: 999, position: 'absolute', width: 50, height: 50, right: 10, bottom: 13, borderRadius: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#999999' }}>
                <Icon_Feather color={'#333333'} name="refresh-cw" size={25} />
              </TouchableOpacity>

              <ScrollView>
                <View style={{ width: '100%', height: 100, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
                  <Text style={{ marginBottom: 10, fontSize: 20, color: '#000000' }}>{data.busStopName}</Text>
                </View>

                {BusStopData.map((data, index) => {
                  const direction = (data.direction).substr(0, data.direction.length - 2).length >= 10 ? `${(data.direction).substr(0, 9)}...` : `${(data.direction).substr(0, data.direction.length - 2)} 방향`
                  const currentLocation = (data.currentLocation).substring((data.currentLocation).lastIndexOf('(') + 1, (data.currentLocation).lastIndexOf(')'))
                  return (
                    <View key={index}>
                      <View style={{ width: '100%', height: 0.5, backgroundColor: '#999999' }}></View>
                      <View style={{ flexDirection: 'row', width: '100%', height: 70, paddingLeft: 10, alignItems: 'center', backgroundColor: isDarkMode ? '#000000' : '#ffffff' }}>
                        <Text style={[{ left: 10, marginBottom: 7, color: '#000000', fontWeight: 'bold', position: 'absolute' }, isDarkMode && { left: 10, marginBottom: 7, color: '#ffffff', fontWeight: 'bold', position: 'absolute' }]}>
                          {data.busNumber}번 {'('}{direction}{')'}
                        </Text>
                        <Text style={[{ right: 10, marginBottom: 7, color: '#000000', fontWeight: 'bold', position: 'absolute' }, isDarkMode && { right: 10, marginBottom: 7, color: '#ffffff', fontWeight: 'bold', position: 'absolute' }]}>
                          {data.arrivalTime} {currentLocation ? `[${currentLocation}]` : null}
                        </Text>
                      </View>
                    </View>
                  )
                })}
              </ScrollView>
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