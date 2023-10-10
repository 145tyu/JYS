import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Button, View, Text, TextInput, Modal, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useRoute } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';

import axiosInstance from '../../api/API_Server';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';
import FastImage from 'react-native-fast-image';

export default function RouteView({ navigation }) {
  const route = useRoute()
  const { data, index, RouteSearchValue } = route.params

  const isDarkMode = useColorScheme() === 'dark'

  const [RouteData, setRouteDate] = useState([])
  const [RouteType, setRouteType] = useState(null)

  const [NowLoading, setNowLoading] = useState(false)

  const [favoriteState, setFavoriteState] = useState(false)

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
                  type: 'route',
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
              }
            }).catch((error) => {
              Alert.alert('에러', '데이터를 추가하거나 삭제하지 못했습니다.')
            })
        } else {
          // 데이터를 처음 저장
          const tempData = []
          const DATA = {
            type: 'route',
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

  const handleBusLocationInquiry = async () => {
    await axiosInstance.post('/v1/Bus/LocationInquiry', { RouteNumber: RouteSearchValue, ButtonID: data.btnID })
      .then((res) => {
        setNowLoading(false)
        if (res.status === 200) {
          setRouteDate(res.data.data)
          setRouteType(1)
        } else {
          setRouteType(0)
        }
      }).catch((error) => {
        setNowLoading(false)
        setRouteType(0)
        console.log(error)
        if (error.response) {
          const res = error.response
          if (res.status === 400) {
            return Alert.alert(res.data.error, res.data.errorDescription, [{ text: '확인', }])
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
    handleBusLocationInquiry()
    handleGetBusFavorites() // 즐겨찾기에 추가되어있는지 조회

    const intervalId = setInterval(() => {
      setNowLoading(true)
      handleBusLocationInquiry()
    }, 20000)

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
          <Text style={[{ ...styles.backButtonText, color: '#000000' }, isDarkMode && { ...styles.backButtonText, color: '#ffffff' }]}>{<Icon_Ionicons name='chevron-back-outline' size={21} />} {data.busID ? data.busID : '버스'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleBusFavorites()} style={Platform.OS === 'ios' ? { position: 'absolute', marginTop: 50, right: 20, } : { position: 'absolute', right: 20, }}>
          <Icon_Feather style={{ color: favoriteState ? 'yellow' : `${isDarkMode ? '#ffffff' : '#000000'}` }} color={isDarkMode ? '#ffffff' : '#000000'} name="star" size={20} />
        </TouchableOpacity>
      </View>

      {NowLoading === true &&
        <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 999, pointerEvents: "none", }}>
          <ActivityIndicator size={15} color="green" />
        </View>
      }

      {RouteType === null ?
        <>
          <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', }}>
            <ActivityIndicator size="large" color="green" />
          </View>
        </>
        :
        <>
          {RouteType === 0 &&
            <>
              <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', }}>
                <ActivityIndicator size="large" color="green" />
                <Text>데이터를 불러오지 못했어요.{'\n'}20초 뒤 다시시도합니다.</Text>
              </View>
            </>
          }

          {RouteType === 1 &&
            <>
              <TouchableOpacity onPress={() => {
                setNowLoading(true)
                handleBusLocationInquiry()
              }} style={{ zIndex: 999, position: 'absolute', width: 50, height: 50, right: 10, bottom: 13, borderRadius: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#999999' }}>
                <Icon_Feather color={'#333333'} name="refresh-cw" size={25} />
              </TouchableOpacity>

              <ScrollView>
                <View style={{ width: '100%', height: 100, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
                  <Text style={{ marginBottom: 10, fontSize: 20, color: '#000000' }}>{data.busID}번</Text>
                  <Text style={{ fontSize: 15, color: '#333333' }}>{data.StartingPoint} -{'>'} {data.EndingPoint}</Text>
                </View>

                {RouteData['Location'].map((data, index) => {
                  return (
                    <TouchableOpacity key={index} onPress={() => navigation.navigate('Bus_BusStopView', { data })}>
                      <View style={{ width: '100%', height: 0.5, backgroundColor: '#999999' }}></View>
                      <View style={{ flexDirection: 'row', width: '100%', height: 70, paddingLeft: 10, alignItems: 'center', borderTopColor: '#000000', borderBottomColor: '#000000', backgroundColor: '#ffffff' }}>
                        <Text style={{ position: 'absolute', left: 10, top: 7, width: 'auto', borderWidth: data.uniqueNum === '' ? 0 : 1, borderColor: '#000000', paddingLeft: 1, paddingRight: 1, fontSize: 10, color: '#000000' }}>{data.uniqueNum}</Text>
                        {data.uniqueNum != '' &&
                          // <Icon_Feather style={{ zIndex: 999, position: 'absolute', left: 43, top: 5, width: 30, height: 72, }} color={'#000000'} name="square" size={19} />
                          <FastImage style={{ zIndex: 999, position: 'absolute', left: 43, top: 5, width: 20, height: 20, }} source={require('../../resource/버스_아이콘.png')} />
                        }
                        {/* <Icon_Feather style={{ zIndex: 999, position: 'absolute', left: 43, top: 25, width: 30, height: 72, }} color={'#000000'} name="arrow-down-circle" size={19} /> */}
                        <FastImage style={{ zIndex: 999, position: 'absolute', left: 43, width: 20, height: 20, }} source={require('../../resource/버스_방향.png')} />
                        <View style={{ position: 'absolute', left: 50, width: 5, height: 72, backgroundColor: '#999999' }}></View>

                        <View style={{ paddingLeft: 70, alignContent: 'center', }}>
                          <Text style={{ fontSize: 15, color: '#000000' }}>{data.busStopName}</Text>
                          <Text style={{ fontSize: 11, color: '#666666' }}>{data.busStopID}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
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