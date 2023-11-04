import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Button, View, Text, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import Toast from 'react-native-toast-message';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';
import Icon_Entypo from 'react-native-vector-icons/Entypo';

import axiosInstance from '../../api/API_Server';

export default function AddBusStopID({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'

  const handelAddBusStop = async (ID) => {
    Alert.alert('알림', `선택하신 정류장(${ID})을 추가하시겠습니까?`, [
      {
        text: '추가', onPress: () => {
          AsyncStorage.setItem('set_busStopID_1', `${ID}`)
            .then(() => {
              Toast.show({
                type: 'success',
                text1: `정류장(${ID})을 홈에 추가했어요.`,
                text2: '홈을 쓸어내려 새로고침 해주세요.',
              })
            }).catch((error) => {
              Toast.show({
                type: 'error',
                text1: '정류장을 추가하지 못했어요.',
                text2: `${error}`,
              })
            })
        }
      },
      { text: '취소', }
    ])
  }

  const handelDeleteBusStop = async () => {
    Alert.alert('알림', '현재 등록된 정류장을 삭제하시겠습니까?', [
      {
        text: '삭제', onPress: () => {
          AsyncStorage.removeItem('set_busStopID_1')
            .then(() => {
              Toast.show({
                type: 'success',
                text1: '등록된 정류장을 홈에서 삭제했어요.',
              })
            }).catch((error) => {
              Toast.show({
                type: 'error',
                text1: '등록된 정류장을 삭제하지 못했어요.',
                text2: `${error}`,
              })
            })
        }
      },
      { text: '취소', }
    ])
  }

  return (
    <SafeAreaView style={{ ...styles.container, backgroundColor: isDarkMode ? '#000000' : '#ffffff', }}>
      {/* 로고 */}
      <View style={styles.logoView}>
        <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 50 } : { ...styles.backButtonView, }} onPress={() => navigation.goBack()}>
          <Text style={{ ...styles.backButtonText, color: isDarkMode ? '#ffffff' : '#000000', }}>{<Icon_Ionicons name='chevron-back-outline' size={21} />} 정류장 추가</Text>
        </TouchableOpacity>

        <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.deleteBusStopView, marginTop: 50 } : { ...styles.deleteBusStopView }} onPress={() => { handelDeleteBusStop() }}>
          <Text style={{ ...styles.deleteBusStopText, color: '#ffffff' }}>삭제하기</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Bus_Search', { setType: 'BusStop', })} style={{ ...styles.inputContainer, }}>
        <View style={{ ...styles.inputView, backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', borderColor: isDarkMode ? '#333333' : '#E9E9E9' }}>
          <Text style={{ color: isDarkMode ? '#CCCCCC' : '#999999' }}>버스, 정류장 검색</Text>
        </View>
      </TouchableOpacity>

      <View style={{ width: '100%', height: 80, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? '#121212' : '#f2f4f6' }}>
        <Text style={{ fontSize: 17, textAlign: 'center', color: isDarkMode ? '#333333' : '#999999', }}>검색을 사용하여 정류장을 검색하거나{'\n'}미리 설정된 프리셋을 사용하여 추가해보세요.</Text>
      </View>

      <ScrollView>
        <View style={{ marginTop: 20, }}>
          <Button title='세종우체국 | 시청,시의회,교육청,세무서 방면' onPress={() => { handelAddBusStop(51101) }} />
          <View style={{ marginBottom: 10 }}></View>
          <Button title='세종우체국 | 소담동(새샘마을) 방면' onPress={() => { handelAddBusStop(51100) }} />
          <View style={{ marginBottom: 10 }}></View>
          <Button title='호려울마을8,9단지 | 세종우체국 방면' onPress={() => { handelAddBusStop(51102) }} />
          <View style={{ marginBottom: 10 }}></View>
          <Button title='호려울마을8,9단지 | 새샘마을1,2단지 방면' onPress={() => { handelAddBusStop(51103) }} />
          <View style={{ marginBottom: 10 }}></View>
          <Button title='장영실고등학교,호탄리(안터) | 호탄리 방면' onPress={() => { handelAddBusStop(51004) }} />
          <View style={{ marginBottom: 10 }}></View>
          <Button title='장영실고등학교,호탄리(안터) | 장재리 방면' onPress={() => { handelAddBusStop(34019) }} />
          <View style={{ marginBottom: 10 }}></View>
          <Button title='세종고속시외버스터미널 | 한솔동(첫마을) 방면' onPress={() => { handelAddBusStop(51052) }} />
          <View style={{ marginBottom: 10 }}></View>
          <Button title='세종고속시외버스터미널 | 용포리 방면' onPress={() => { handelAddBusStop(51053) }} />
          <View style={{ marginBottom: 10 }}></View>
        </View>
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