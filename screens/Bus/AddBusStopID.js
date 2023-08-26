import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Button, View, Text, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';
import Icon_Entypo from 'react-native-vector-icons/Entypo';

import axiosInstance from '../../api/API_Server';

export default function AddBusStopID({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'

  const [isLoading, setIsLoading] = useState(false)

  const [businfo, setBusInfo] = useState(null)
  const [busType, setBusType] = useState(0)

  const [busStopName, setBusStopName] = useState(null)
  const [busStopID, setBusStopID] = useState(null)

  const getBusInfo = async () => {
    setIsLoading(true)
    try {
      await axiosInstance.post('/Bus/getBusStopID', { busStopName: busStopName })
        .then((res) => {
          console.log(res.data)
        }).catch((error) => {
          console.log(error)
        })
    } catch (error) {
      console.log('AddBusStopID | ', error)
    }
  }

  const handelAddBusStop = async (ID) => {
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

  const handelDeleteBusStop = async () => {
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

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#ffffff' }, isDarkMode && { ...styles.container, backgroundColor: '#000000' }]}>
      <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', }}>
        <ActivityIndicator size="large" color="green" />
        <Text style={[{ marginTop: 20, color: '#333333' }, isDarkMode && { marginTop: 20, color: '#999999' }]}>검색 기능을 준비 중입니다...</Text>
      </View>

      {/* 로고 */}
      <View style={styles.logoView}>
        <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 50 } : { ...styles.backButtonView, }} onPress={() => navigation.goBack()}>
          <Text style={[{ ...styles.backButtonText, color: '#000000' }, isDarkMode && { ...styles.backButtonText, color: '#ffffff' }]}>{<Icon_Ionicons name='chevron-back-outline' size={21} />} 정류장 추가</Text>
        </TouchableOpacity>

        <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.deleteBusStopView, marginTop: 50 } : { ...styles.deleteBusStopView }} onPress={() => {handelDeleteBusStop()}}>
          <Text style={{ ...styles.deleteBusStopText, color: '#ffffff' }}>삭제하기</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <View style={[{ ...styles.inputView, backgroundColor: '#E9E9E9', borderColor: '#E9E9E9' }, isDarkMode && { ...styles.inputView, backgroundColor: '#333333', borderColor: '#333333' }]}>
          <TextInput
            style={[{ ...styles.inputText, color: '#000000', }, isDarkMode && { ...styles.inputText, color: '#ffffff' }]}
            placeholder='정류장명을 입력해주세요.'
            placeholderTextColor={isDarkMode ? "#CCCCCC" : "#999999"}
            value={busStopName}
            onChangeText={(text) => setBusStopName(text)}
          />
          <TouchableOpacity style={styles.searchBtnContainer}>
            <Icon_Feather name='search' style={isDarkMode ? { color: '#ffffff' } : { color: '#000000' }} size={21} />
          </TouchableOpacity>
        </View>
      </View>

      <View>
        <Button title='세종우체국 | 시청,시의회,교육청,세무서 방면' onPress={() => { handelAddBusStop(51101) }} />
        <View style={{ marginBottom: 10 }}></View>
        <Button title='세종우체국 | 소담동(새샘마을) 방면' onPress={() => { handelAddBusStop(51100) }} />
        <View style={{ marginBottom: 10 }}></View>
        <Button title='호려울마을8,9단지 | 세종우체국 방면' onPress={() => { handelAddBusStop(51102) }} />
        <View style={{ marginBottom: 10 }}></View>
        <Button title='호려울마을8,9단지 | 새샘마을1,2단지 방면' onPress={() => { handelAddBusStop(51103) }} />
        <View style={{ marginBottom: 150 }}></View>

        <Button title='장영실고등학교,호탄리(안터) | 호탄리 방면' onPress={() => { handelAddBusStop(51004) }} />
        <View style={{ marginBottom: 10 }}></View>
        <Button title='장영실고등학교,호탄리(안터) | 장재리 방면' onPress={() => { handelAddBusStop(34019) }} />
        <View style={{ marginBottom: 10 }}></View>
        <Button title='세종고속시외버스터미널 | 한솔동(첫마을) 방면' onPress={() => { handelAddBusStop(51052) }} />
        <View style={{ marginBottom: 10 }}></View>
        <Button title='세종고속시외버스터미널 | 용포리 방면' onPress={() => { handelAddBusStop(51053) }} />
        <View style={{ marginBottom: 10 }}></View>
      </View>
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