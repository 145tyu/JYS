import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Button, View, Text, TextInput, Modal, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useIsFocused } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-toast-message';

import axiosInstance from '../../api/API_Server';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

export default function BusHome({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'
  const isFocused = useIsFocused()

  const [busArrivalInformationIsRefreshing_0, setBusArrivalInformationIsRefreshing_0] = useState(false)
  const [busArrivalInformationData_0, setBusArrivalInformationData_0] = useState([])
  const [busArrivalInformationType_0, setBusArrivalInformationType_0] = useState(null)

  const [busArrivalInformationIsRefreshing_1, setBusArrivalInformationIsRefreshing_1] = useState(false)
  const [busArrivalInformationData_1, setBusArrivalInformationData_1] = useState([])
  const [busArrivalInformationType_1, setBusArrivalInformationType_1] = useState(null)

  const [busArrivalInformationIsRefreshing_2, setBusArrivalInformationIsRefreshing_2] = useState(false)
  const [busArrivalInformationData_2, setBusArrivalInformationData_2] = useState([])
  const [busArrivalInformationType_2, setBusArrivalInformationType_2] = useState(null)

  const [busArrivalInformationIsRefreshing_3, setBusArrivalInformationIsRefreshing_3] = useState(false)
  const [busArrivalInformationData_3, setBusArrivalInformationData_3] = useState([])
  const [busArrivalInformationType_3, setBusArrivalInformationType_3] = useState(null)

  const [BusFavoritesData, setBusFavoritesData] = useState([])

  const handleGetBusFavorites = async () => {
    await AsyncStorage.getItem('Bus_FavoritesList')
      .then((data) => {
        if (data) {
          setBusFavoritesData(JSON.parse(data))
        } else {
          setBusFavoritesData([])
        }
      }).catch((error) => {
        setBusFavoritesData([])
        Toast.show({
          type: 'error',
          text1: '데이터를 불러오지 못했어요.',
          text2: `${error}`
        })
      })
  }

  const busArrivalInformationRefresh_0 = async () => {
    setBusArrivalInformationIsRefreshing_0(true)
    axiosInstance.post('/Bus/ArrivalInformation', { busStopID: 51004, })
      .then((res) => {
        setBusArrivalInformationIsRefreshing_0(false)
        if (res.status === 200) { // 'status'가 200이면
          setBusArrivalInformationData_0(res.data)
          setBusArrivalInformationType_0(1)
        }
      }).catch((error) => {
        setBusArrivalInformationType_0(0)
        setBusArrivalInformationIsRefreshing_0(false)
      })
  }

  const busArrivalInformationRefresh_1 = async () => {
    setBusArrivalInformationIsRefreshing_1(true)
    axiosInstance.post('/Bus/ArrivalInformation', { busStopID: 34019, })
      .then((res) => {
        setBusArrivalInformationIsRefreshing_1(false)
        if (res.status === 200) { // 'status'가 200이면
          setBusArrivalInformationData_1(res.data)
          setBusArrivalInformationType_1(1)
        }
      }).catch((error) => {
        setBusArrivalInformationType_1(0)
        setBusArrivalInformationIsRefreshing_1(false)
      })
  }

  const busArrivalInformationRefresh_2 = async () => {
    setBusArrivalInformationIsRefreshing_2(true)
    axiosInstance.post('/Bus/ArrivalInformation', { busStopID: 51097, })
      .then((res) => {
        setBusArrivalInformationIsRefreshing_2(false)
        if (res.status === 200) { // 'status'가 200이면
          setBusArrivalInformationData_2(res.data)
          setBusArrivalInformationType_2(1)
        }
      }).catch((error) => {
        setBusArrivalInformationType_2(0)
        setBusArrivalInformationIsRefreshing_2(false)
      })
  }

  const busArrivalInformationRefresh_3 = async () => {
    setBusArrivalInformationIsRefreshing_3(true)
    axiosInstance.post('/Bus/ArrivalInformation', { busStopID: 51096, })
      .then((res) => {
        setBusArrivalInformationIsRefreshing_3(false)
        if (res.status === 200) { // 'status'가 200이면
          setBusArrivalInformationData_3(res.data)
          setBusArrivalInformationType_3(1)
        }
      }).catch((error) => {
        setBusArrivalInformationType_3(0)
        setBusArrivalInformationIsRefreshing_3(false)
      })
  }

  useEffect(() => {
    handleGetBusFavorites()

    busArrivalInformationRefresh_0()
    busArrivalInformationRefresh_2()
    busArrivalInformationRefresh_1()
    busArrivalInformationRefresh_3()

    const intervalId = setInterval(() => {
      if (isFocused) {
        busArrivalInformationRefresh_0()
        busArrivalInformationRefresh_2()
        busArrivalInformationRefresh_1()
        busArrivalInformationRefresh_3()
      }
    }, 15000)

    // 컴포넌트가 언마운트 될 때 clearInterval 호출하여 메모리 누수 방지
    return () => {
      clearInterval(intervalId)
    }
  }, [isFocused])

  return (
    <SafeAreaView style={{ ...styles.container, backgroundColor: isDarkMode ? '#000000' : '#ffffff', }}>
      {/* 로고 */}
      <View style={styles.logoView}>
        <Text style={{ ...styles.logo, color: isDarkMode ? '#ffffff' : '#000000', }}>버스</Text>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Bus_Search')} style={{ ...styles.inputContainer, }}>
        <View style={{ ...styles.inputView, backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', borderColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
          <Text style={{ color: isDarkMode ? '#CCCCCC' : '#999999' }}>버스, 정류장 검색</Text>
        </View>
      </TouchableOpacity>

      <ScrollView>
        <View>
          <ScrollView horizontal style={{ marginLeft: 13, marginBottom: 20, }}>
            <TouchableOpacity onPress={() => navigation.navigate('Bus_BusStopView', { data: { busStopID: 51004, busStopName: busArrivalInformationData_0.busStopInfo[0].busStopName } })} style={{ width: (windowHeight / 2) - 55, height: 'auto', borderRadius: 10, marginRight: 15, backgroundColor: isDarkMode ? '#121212' : '#f2f4f6', }}>
              <Text style={{ textAlign: 'center', fontSize: 15, fontWeight: '600', marginTop: 7, marginBottom: 7, color: isDarkMode ? '#ffffff' : '#000000', }}>장영실고등학교,호탄리(안터) (세종터미널 방면)</Text>

              {busArrivalInformationType_0 === null || busArrivalInformationIsRefreshing_0 === true ?
                <View style={{ marginTop: 5, marginBottom: 10, }}>
                  <ActivityIndicator size={15} color="green" />
                </View>
                :
                <>
                  {busArrivalInformationType_0 === 1 &&
                    <View style={{ marginBottom: 13, }}>
                      {(busArrivalInformationData_0).data.map((data, index) => {
                        const currentLocation = (data.currentLocation).substring((data.currentLocation).lastIndexOf('(') + 1, (data.currentLocation).lastIndexOf(')'))
                        return (
                          <View key={index} style={{ marginBottom: 17, }}>
                            <Text style={{ left: 20, position: 'absolute', color: isDarkMode ? '#ffffff' : '#000000', }}>{data.busNumber}번</Text>
                            <Text style={{ right: 20, position: 'absolute', color: isDarkMode ? '#ffffff' : '#000000', }}>{data.arrivalTime} {currentLocation ? `[${currentLocation}]` : null}</Text>
                          </View>
                        )
                      })}
                    </View>
                  }
                  {busArrivalInformationType_0 === 0 &&
                    <Text style={{ marginTop: 3, marginBottom: 5, textAlign: 'center', color: isDarkMode ? '#ffffff' : '#000000', }}>정보를 표시할 수 없어요.{'\n'}15초마다 새로 고칩니다.</Text>
                  }
                </>
              }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Bus_BusStopView', { data: { busStopID: 34019, busStopName: busArrivalInformationData_1.busStopInfo[0].busStopName } })} style={{ width: (windowHeight / 2) - 55, height: 'auto', borderRadius: 10, marginRight: 15, backgroundColor: isDarkMode ? '#121212' : '#f2f4f6', }}>
              <Text style={{ textAlign: 'center', fontSize: 15, fontWeight: '600', marginTop: 7, marginBottom: 7, color: isDarkMode ? '#ffffff' : '#000000', }}>장영실고등학교,호탄리(안터) (장재리 방면)</Text>

              {busArrivalInformationType_1 === null || busArrivalInformationIsRefreshing_1 === true ?
                <View style={{ marginTop: 5, marginBottom: 10, }}>
                  <ActivityIndicator size={15} color="green" />
                </View>
                :
                <>
                  {busArrivalInformationType_1 === 1 &&
                    <View style={{ marginBottom: 13, }}>
                      {(busArrivalInformationData_1).data.map((data, index) => {
                        const currentLocation = (data.currentLocation).substring((data.currentLocation).lastIndexOf('(') + 1, (data.currentLocation).lastIndexOf(')'))
                        return (
                          <View key={index} style={{ marginBottom: 17, }}>
                            <Text style={{ left: 20, position: 'absolute', color: isDarkMode ? '#ffffff' : '#000000', }}>{data.busNumber}번</Text>
                            <Text style={{ right: 20, position: 'absolute', color: isDarkMode ? '#ffffff' : '#000000', }}>{data.arrivalTime} {currentLocation ? `[${currentLocation}]` : null}</Text>
                          </View>
                        )
                      })}
                    </View>
                  }
                  {busArrivalInformationType_1 === 0 &&
                    <Text style={{ marginTop: 3, marginBottom: 5, textAlign: 'center', color: isDarkMode ? '#ffffff' : '#000000', }}>정보를 표시할 수 없어요.{'\n'}15초마다 새로 고칩니다.</Text>
                  }
                </>
              }
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View>
          <ScrollView horizontal style={{ marginLeft: 13, marginBottom: 20, }}>
            <TouchableOpacity onPress={() => navigation.navigate('Bus_BusStopView', { data: { busStopID: 51097, busStopName: busArrivalInformationData_2.busStopInfo[0].busStopName } })} style={{ width: (windowHeight / 2) - 55, height: 'auto', borderRadius: 10, marginRight: 15, backgroundColor: isDarkMode ? '#121212' : '#f2f4f6', }}>
              <Text style={{ textAlign: 'center', fontSize: 15, fontWeight: '600', marginTop: 7, marginBottom: 7, color: isDarkMode ? '#ffffff' : '#000000', }}>시청, 시의회, 교육청, 세무서 (대평동 방면)</Text>

              {busArrivalInformationType_2 === null || busArrivalInformationIsRefreshing_2 === true ?
                <View style={{ marginTop: 5, marginBottom: 10, }}>
                  <ActivityIndicator size={15} color="green" />
                </View>
                :
                <>
                  {busArrivalInformationType_2 === 1 &&
                    <View style={{ marginBottom: 13, }}>
                      {(busArrivalInformationData_2).data.map((data, index) => {
                        const currentLocation = (data.currentLocation).substring((data.currentLocation).lastIndexOf('(') + 1, (data.currentLocation).lastIndexOf(')'))
                        return (
                          <View key={index} style={{ marginBottom: 17, }}>
                            <Text style={{ left: 20, position: 'absolute', color: isDarkMode ? '#ffffff' : '#000000', }}>{data.busNumber}번</Text>
                            <Text style={{ right: 20, position: 'absolute', color: isDarkMode ? '#ffffff' : '#000000', }}>{data.arrivalTime} {currentLocation ? `[${currentLocation}]` : null}</Text>
                          </View>
                        )
                      })}
                    </View>
                  }
                  {busArrivalInformationType_2 === 0 &&
                    <Text style={{ marginTop: 3, marginBottom: 5, textAlign: 'center', color: isDarkMode ? '#ffffff' : '#000000', }}>정보를 표시할 수 없어요.{'\n'}15초마다 새로 고칩니다.</Text>
                  }
                </>
              }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Bus_BusStopView', { data: { busStopID: 51096, busStopName: busArrivalInformationData_3.busStopInfo[0].busStopName } })} style={{ width: (windowHeight / 2) - 55, height: 'auto', borderRadius: 10, marginRight: 15, backgroundColor: isDarkMode ? '#121212' : '#f2f4f6', }}>
              <Text style={{ textAlign: 'center', fontSize: 15, fontWeight: '600', marginTop: 7, marginBottom: 7, color: isDarkMode ? '#ffffff' : '#000000', }}>시청, 시의회, 교육청, 세무서 (세종우체국 방면)</Text>

              {busArrivalInformationType_3 === null || busArrivalInformationIsRefreshing_3 === true ?
                <View style={{ marginTop: 5, marginBottom: 10, }}>
                  <ActivityIndicator size={15} color="green" />
                </View>
                :
                <>
                  {busArrivalInformationType_3 === 1 &&
                    <View style={{ marginBottom: 13, }}>
                      {(busArrivalInformationData_3).data.map((data, index) => {
                        const currentLocation = (data.currentLocation).substring((data.currentLocation).lastIndexOf('(') + 1, (data.currentLocation).lastIndexOf(')'))
                        return (
                          <View key={index} style={{ marginBottom: 17, }}>
                            <Text style={{ left: 20, position: 'absolute', color: isDarkMode ? '#ffffff' : '#000000', }}>{data.busNumber}번</Text>
                            <Text style={{ right: 20, position: 'absolute', color: isDarkMode ? '#ffffff' : '#000000', }}>{data.arrivalTime} {currentLocation ? `[${currentLocation}]` : null}</Text>
                          </View>
                        )
                      })}
                    </View>
                  }
                  {busArrivalInformationType_3 === 0 &&
                    <Text style={{ marginTop: 3, marginBottom: 5, textAlign: 'center', color: isDarkMode ? '#ffffff' : '#000000', }}>정보를 표시할 수 없어요.{'\n'}15초마다 새로 고칩니다.</Text>
                  }
                </>
              }
            </TouchableOpacity>
          </ScrollView>
        </View>

        {BusFavoritesData.length === 0 ?
          <>
            <View style={{ justifyContent: 'center', alignItems: 'center', pointerEvents: 'none', }}>
              <Text style={{ fontSize: 15, textAlign: 'center', color: isDarkMode ? '#ffffff' : '#000000', }}>검색을 사용하여 버스, 정류장을 검색하여{'\n'}즐겨찾기에 추가해보세요.</Text>
            </View>
          </>
          :
          <>
            <ScrollView>
              {BusFavoritesData.map((data, index) => {
                if (data.type === 'route') {
                  return (
                    <TouchableOpacity key={index} onPress={() => {
                      navigation.navigate('Bus_RouteView', { data: data.data, index, RouteSearchValue: data.data.busID })
                    }}>
                      <View style={{ width: '100%', height: 70, marginBottom: 5, backgroundColor: isDarkMode ? '#121212' : '#F5F5F5', }}>
                        <FastImage style={{ width: 30, height: 30, left: 10, top: 20, position: 'absolute', }} source={require('../../resource/bus/bus_Icon.png')} />
                        <Text style={{ marginTop: 10, marginLeft: 53, fontSize: 20, fontWeight: '700', color: isDarkMode ? '#ffffff' : '#000000', }}>{data.data.type ? data.data.type : '구분'} {data.data.busID}번</Text>
                        <Text style={{ marginTop: 1, marginLeft: 50, fontSize: 13, fontWeight: '400', color: isDarkMode ? '#ffffff' : '#000000', }}>{data.data.EndingPoint} 방면</Text>
                      </View>
                    </TouchableOpacity>
                  )
                } else if (data.type === 'busStop') {
                  return (
                    <TouchableOpacity key={index} onPress={() => {
                      navigation.navigate('Bus_BusStopView', { data: data.data })
                    }}>
                      <View style={{ width: '100%', height: 70, marginBottom: 5, backgroundColor: isDarkMode ? '#121212' : '#F5F5F5', }}>
                        <Icon_Feather style={{ width: 30, height: 30, left: 12, top: 20, position: 'absolute', color: isDarkMode ? '#ffffff' : '#000000', }} name='map-pin' size={30} />
                        <Text style={{ marginTop: 10, marginLeft: 53, fontSize: 20, fontWeight: '700', color: isDarkMode ? '#ffffff' : '#000000', }}>{data.data.busStopName}</Text>
                        <Text style={{ marginTop: 1, marginLeft: 53, fontSize: 13, fontWeight: '400', color: isDarkMode ? '#ffffff' : '#000000', }}>{data.data.busStopID}</Text>
                      </View>
                    </TouchableOpacity>
                  )
                }
              })}
              {/* 화면 늘리기 */}
              <View style={{ marginBottom: 100, }}></View>
            </ScrollView>
          </>
        }
      </ScrollView>
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
    marginBottom: 45,
    marginTop: 10
  },
  logo: {
    fontSize: 30,
    fontWeight: 'bold',
    top: 20,
    left: 25,
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