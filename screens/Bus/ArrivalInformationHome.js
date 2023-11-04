import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl, ScrollView, View, Text, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Entypo from 'react-native-vector-icons/Entypo';

import axiosInstance from '../../api/API_Server';
import { MoveScreen } from '../../api/MoveScreen';

export default function ArrivalInformationHomeScreen({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'

  const [startMessage, setStartMessage] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const [busArrivalInformationIsRefreshing, setBusArrivalInformationIsRefreshing] = useState(false)
  const [busArrivalInformationTitle, setBusArrivalInformationTitle] = useState('버스')
  const [busArrivalInformationMessage, setBusArrivalInformationMessage] = useState(null)
  const [busArrivalInformationData, setBusArrivalInformationData] = useState([])
  const [busArrivalInformationType, setBusArrivalInformationType] = useState(null)

  const handleRefresh = () => {
    setRefreshing(true)

    getBusStopID()

    setRefreshing(false)
  }

  const getBusStopID = async () => {
    setBusArrivalInformationIsRefreshing(true)
    setBusArrivalInformationTitle('버스')
    setBusArrivalInformationType(null)
    setBusArrivalInformationData([])
    setBusArrivalInformationMessage(null)

    AsyncStorage.getItem('set_busStopID_1')
      .then((ID) => {
        setBusArrivalInformationIsRefreshing(false)
        if (ID === null) {
          setBusArrivalInformationType(1)
          setBusArrivalInformationTitle('버스')
          setBusArrivalInformationMessage('자주 타는 정류장을 추가해보세요')
        } else {
          busArrivalInformationRefresh(ID)
        }
      }).catch((error) => {
        console.log(error)
        setBusArrivalInformationMessage(`${error}`)
        setBusArrivalInformationType(3)
        setBusArrivalInformationIsRefreshing(false)
      })
    //const busStopID_2 = await AsyncStorage.getItem('set_busStopID_2')
  }

  const busArrivalInformationRefresh = async (ID) => {
    setBusArrivalInformationIsRefreshing(true)
    axiosInstance.post('/Bus/ArrivalInformation', { busStopID: ID })
      .then((res) => {
        setBusArrivalInformationIsRefreshing(false)
        if (res.status === 200) { // 'status'가 200이면
          const busData = res.data.data
          const busStopInfo = res.data.busStopInfo
          setBusArrivalInformationTitle(busStopInfo[0].busStopName)
          setBusArrivalInformationData(busData)
          setBusArrivalInformationType(2)
        }
      }).catch((error) => {
        console.log('busArrivalInformation | ', error)
        setBusArrivalInformationMessage(`${error}`)
        setBusArrivalInformationType(3)
        setBusArrivalInformationIsRefreshing(false)
      })
  }

  useEffect(() => {
    getBusStopID()
  }, [])

  return (
    <SafeAreaView style={{ ...styles.container, backgroundColor: isDarkMode ? '#000000' : '#ffffff', }}>
      {/* 로고 */}
      < View style={styles.logoView} >
        <Text style={{ ...styles.logo, color: isDarkMode ? '#ffffff' : '#000000', }}>홈</Text>
      </View >

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />} contentContainerStyle={{ ...styles.scrollContainer, backgroundColor: isDarkMode ? '#000000' : '#ffffff', }}>
        {/* 버스 */}
        <View style={{ ...styles.Info, backgroundColor: isDarkMode ? '#121212' : '#f2f4f6', }}>
          <TouchableOpacity>
            <Text style={{ ...styles.Title, color: isDarkMode ? '#ffffff' : '#000000', }}>
              {busArrivalInformationTitle}{<Icon_Ionicons name="chevron-forward-outline" size={25} />}
            </Text>
          </TouchableOpacity>

          {busArrivalInformationIsRefreshing === true ?
            <>
              <ActivityIndicator size="large" color="#0000ff" />
            </>
            :
            <>
              {busArrivalInformationType === null ?
                <>
                  <ActivityIndicator size="large" color="#0000ff" />
                </>
                :
                <>
                  {busArrivalInformationType === 3 &&
                    <>
                      <TouchableOpacity>
                        <Text style={{ ...styles.Title, color: isDarkMode ? '#ffffff' : '#000000' }}>{busArrivalInformationTitle}{<Icon_Ionicons name="chevron-forward-outline" size={25} />}</Text>
                      </TouchableOpacity>
                    </>
                  }
                  {busArrivalInformationType === 1 &&
                    <View>
                      <TouchableOpacity>
                        <Text style={{ ...styles.Title, color: isDarkMode ? '#ffffff' : '#000000' }}>{busArrivalInformationTitle}{<Icon_Ionicons name="chevron-forward-outline" size={25} />}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={busArrivalInformationStyles.addBusStopBtn} onPress={() => navigation.navigate('Bus_AddBusStopID')}>
                        <Text style={busArrivalInformationStyles.addBusStopBtnText}>추가하기</Text>
                      </TouchableOpacity>
                    </View>
                  }
                  {busArrivalInformationType === 2 &&
                    <>
                      {busArrivalInformationData.length === 0 ?
                        <>
                          <ActivityIndicator size="large" color="#0000ff" />
                        </>
                        :
                        <>
                          <View style={{ marginTop: 15 }}></View>
                          {busArrivalInformationData.map((data, index) => {
                            const direction = (data.direction).substr(0, data.direction.length - 2).length >= 5 ? `${(data.direction).substr(0, 4)}...` : `${(data.direction).substr(0, data.direction.length - 2)} 방향`
                            const currentLocation = (data.currentLocation).substring((data.currentLocation).lastIndexOf('(') + 1, (data.currentLocation).lastIndexOf(')'))
                            return (
                              <View key={index} style={{ marginBottom: 25 }}>
                                <Text style={{ left: 10, marginBottom: 7, fontWeight: 'bold', position: 'absolute', color: isDarkMode ? '#ffffff' : '#000000', }}>
                                  {data.busNumber}번 {'('}{direction}{')'}
                                </Text>
                                <Text style={{ right: 10, marginBottom: 7, fontWeight: 'bold', position: 'absolute', color: isDarkMode ? '#ffffff' : '#000000', }}>
                                  {data.arrivalTime} {currentLocation ? `[${currentLocation}]` : null}
                                </Text>
                              </View>
                            )
                          })}
                        </>
                      }
                    </>
                  }
                </>
              }
            </>
          }
        </View>
      </ScrollView>
    </SafeAreaView >
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
    marginBottom: 50,
    marginTop: 10
  },
  logo: {
    fontSize: 30,
    fontWeight: 'bold',
    top: 20,
    left: 25,
  },
  Info: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    width: '95%',
    maxWidth: 400,
    position: 'relative'
  },
  Title: {
    marginBottom: 5,
    left: 5,
    fontSize: 25,
    fontWeight: 'bold',
  },
})

const rentalStyles = StyleSheet.create({
  Text: {
    padding: 30,
    paddingBottom: 65,
    textAlign: 'center',
  },
  rentalBtn: {
    backgroundColor: '#393939',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 0,
    marginTop: 50,
    marginBottom: 5,
  },
  rentalBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  Item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  Label: {
    fontWeight: 'bold',
    width: 80,
    marginRight: 3,
  },
  Value: {
    flex: 1,
  },
})

const mealStyles = StyleSheet.create({
  Text: {
    borderRadius: 20,
    padding: 30,
    paddingLeft: 50,
    paddingRight: 50,
    paddingTop: 15,
    paddingBottom: 5,
    textAlign: 'center',
    color: "#000000", // 다크모드에서의 글자색상
  },
  leftBtn: {
    position: 'absolute',
    top: 60,
    left: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  rightBtn: {
    position: 'absolute',
    top: 60,
    right: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
})

const busArrivalInformationStyles = StyleSheet.create({
  Text: {
    padding: 30,
    paddingBottom: 65,
    textAlign: 'center',
  },
  addBusStopBtn: {
    backgroundColor: '#393939',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 0,
    marginTop: 50,
    marginBottom: 5,
  },
  addBusStopBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
})