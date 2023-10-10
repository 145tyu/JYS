import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Button, View, Text, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useRoute } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';

import axiosInstance from '../../api/API_Server';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

export default function BusSearch({ navigation }) {
  const route = useRoute()
  const isDarkMode = useColorScheme() === 'dark'

  const [message, setMessage] = useState('')

  const [RouteSearchValue, setRouteSearchValue] = useState(null)
  const [RouteSearchData, setRouteSearchData] = useState([])
  const [RouteSearchType, setRouteSearchType] = useState(0)
  const [RouteSearchLoadingState, setRouteSearchLoadingState] = useState(false)

  const [BusStopSearchValue, setBusStopSearchValue] = useState(null)
  const [BusStopSearchData, setBusStopSearchData] = useState([])
  const [BusStopSearchType, setBusStopSearchType] = useState(0)
  const [BusStopSearchLoadingState, setBusStopSearchLoadingState] = useState(false)

  const [option, setOption] = useState('Route')

  const handleBusRouteSearch = async (text) => {
    setRouteSearchLoadingState(true)
    await axiosInstance.post('/v1/Bus/RouteSearch', { RouteNumber: text })
      .then((res) => {
        setRouteSearchLoadingState(false)
        if (res.status === 200) {
          setRouteSearchData(res.data.data)
          setRouteSearchType(1)
        } else {
          setRouteSearchType(0)
        }
      }).catch((error) => {
        setRouteSearchLoadingState(false)
        setRouteSearchType(0)
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

  const handleBusStopSearch = async (text) => {
    setBusStopSearchLoadingState(true)
    await axiosInstance.post('/v1/Bus/BusStopSearch', { BusStopName: text })
      .then((res) => {
        setBusStopSearchLoadingState(false)
        if (res.status === 200) {
          setBusStopSearchData(res.data.data)
          setBusStopSearchType(1)
        } else {
          setBusStopSearchType(0)
        }
      }).catch((error) => {
        setBusStopSearchLoadingState(false)
        setBusStopSearchType(0)
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
    if (route.params) {
      if (route.params.setType === 'Route') {
        setOption('Route')
      } else if (route.params.setType === 'BusStop') {
        setOption('BusStop')
      }
    }
  }, [])

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#ffffff' }, isDarkMode && { ...styles.container, backgroundColor: '#000000' }]}>
      {/* 로고 */}
      <View style={styles.logoView}>
        <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 50 } : { ...styles.backButtonView, }} onPress={() => navigation.goBack()}>
          <Text style={[{ ...styles.backButtonText, color: '#000000' }, isDarkMode && { ...styles.backButtonText, color: '#ffffff' }]}>{<Icon_Ionicons name='chevron-back-outline' size={21} />} 검색</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Bus_Search')} style={styles.inputContainer}>
        <View style={[{ ...styles.inputView, backgroundColor: '#E9E9E9', borderColor: '#E9E9E9' }, isDarkMode && { ...styles.inputView, backgroundColor: '#333333', borderColor: '#333333' }]}>
          <TextInput
            style={[{ ...styles.inputText, color: '#000000', }, isDarkMode && { ...styles.inputText, color: '#ffffff' }]}
            placeholder={option === 'Route' ? '버스 검색' : '정류장 검색'}
            placeholderTextColor={isDarkMode ? "#CCCCCC" : "#999999"}
            value={option === 'Route' ? RouteSearchValue : BusStopSearchValue}
            onChangeText={(text) => {
              if (option === 'Route') {
                setRouteSearchValue(text)
              } else if (option === 'BusStop') {
                setBusStopSearchValue(text)
              }
            }}
            onEndEditing={() => {
              if (option === 'Route') {
                handleBusRouteSearch(RouteSearchValue)
              } else if (option === 'BusStop') {
                handleBusStopSearch(BusStopSearchValue)
              }
            }}
          />
        </View>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={() => {
          if (option === 'BusStop') {
            setOption('Route')
          }
        }} style={{ width: '50%', height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: option === 'Route' ? '#E6E6E6' : '#FAFAFA' }}>
          <Text style={{ textAlign: 'center', color: '#000000', }}>버스</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          if (option === 'Route') {
            setOption('BusStop')
          }
        }} style={{ width: '50%', height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: option === 'BusStop' ? '#E6E6E6' : '#FAFAFA' }}>
          <Text style={{ textAlign: 'center', color: '#000000', }}>정류장</Text>
        </TouchableOpacity>
      </View>

      {option === 'Route' &&
        <>
          {RouteSearchLoadingState === true ?
            <>
              <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', }}>
                <ActivityIndicator size="large" color="green" />
              </View>
            </>
            :
            <>
              {RouteSearchData.length === 0 ?
                <>
                  <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', }}>
                    <Text style={[{ marginTop: 20, color: '#333333' }, isDarkMode && { marginTop: 20, color: '#999999' }]}>검색 결과가 없습니다.</Text>
                  </View>
                </>
                :
                <>
                  <ScrollView>
                    {RouteSearchData.map((data, index) => {
                      return (
                        <TouchableOpacity key={index} onPress={() => {
                          navigation.navigate('Bus_RouteView', { data, index, RouteSearchValue })
                        }}>
                          <View style={{ width: '100%', height: 85, marginBottom: 5, backgroundColor: '#E9E9E9' }}>
                            <Text style={{ marginTop: 13, marginLeft: 13, fontSize: 20, fontWeight: '700', color: '#000000', }}>{data.type ? data.type : '구분'} {data.busID}번</Text>
                            <Text style={{ marginTop: 10, marginLeft: 13, fontSize: 13, fontWeight: '400', color: '#000000', }}>{data.StartingPoint} {'->'} {data.EndingPoint}</Text>
                          </View>
                        </TouchableOpacity>
                      )
                    })}
                  </ScrollView>
                </>
              }
            </>
          }
        </>
      }
      {option === 'BusStop' &&
        <>
          {BusStopSearchLoadingState === true ?
            <>
              <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', }}>
                <ActivityIndicator size="large" color="green" />
              </View>
            </>
            :
            <>
              {BusStopSearchData.length === 0 ?
                <>
                  <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', }}>
                    <Text style={[{ marginTop: 20, color: '#333333' }, isDarkMode && { marginTop: 20, color: '#999999' }]}>검색 결과가 없습니다.</Text>
                  </View>
                </>
                :
                <>
                  <ScrollView>
                    {BusStopSearchData.map((data, index) => {
                      return (
                        <TouchableOpacity key={index} onPress={() => {
                          navigation.navigate('Bus_BusStopView', { data })
                        }}>
                          <View style={{ width: '100%', height: 85, marginBottom: 5, backgroundColor: '#E9E9E9' }}>
                            <Text style={{ marginTop: 13, marginLeft: 13, fontSize: 20, fontWeight: '700', color: '#000000', }}>{data.busStopName}</Text>
                            <Text style={{ marginTop: 10, marginLeft: 13, fontSize: 13, fontWeight: '400', color: '#000000', }}>{data.busStopID}</Text>
                          </View>
                        </TouchableOpacity>
                      )
                    })}
                  </ScrollView>
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