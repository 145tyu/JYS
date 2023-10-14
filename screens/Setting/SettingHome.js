import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

import axiosInstance from '../../api/API_Server';

const appVersion = DeviceInfo.getVersion() // 앱 버전 가져오기
const buildVersion = DeviceInfo.getBuildNumber()

export default function SettingsHomeScreen({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#f0f0f0' }, isDarkMode && { ...styles.container, backgroundColor: '#000000' },]}>
      {/* 로고 */}
      <View style={styles.logoView}>
        <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 10 } : { ...styles.backButtonView, }} onPress={() => navigation.goBack()}>
          <Text style={[{ ...styles.logoText, color: '#000000' }, isDarkMode && { ...styles.logoText, color: '#ffffff' },]}>
            {<Icon_Ionicons name="chevron-back-outline" size={21} />} 설정
          </Text>
        </TouchableOpacity>
      </View>

      {/* 스크롤 */}
      <ScrollView style={[{ ...styles.scrollContainer, backgroundColor: '#f0f0f0', }, isDarkMode && { ...styles.scrollContainer, backgroundColor: '#000000', }]}>
        {/* 알림 */}
        <>
          <Text style={styles.InfoTopText}>알림</Text>
          <TouchableOpacity style={[{ ...styles.Info, backgroundColor: '#ffffff', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]} onPress={() => {
            navigation.navigate('Setting_setNotification')
          }}>
            <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>알림</Text>
          </TouchableOpacity>
        </>

        {/* 커뮤니티 */}
        <>
          <Text style={styles.InfoTopText}>커뮤니티</Text>
          <TouchableOpacity style={[{ ...styles.Info, backgroundColor: '#ffffff', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]} onPress={() => {
            AsyncStorage.removeItem('community_blockedUser')
              .then((res) => {
                Alert.alert('정보', '모든 사용자 차단을 해제했습니다.')
              }).catch((error) => {
                Alert.alert('정보', '차단 해제를 실패했습니다.')
              })
          }}>
            <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>사용자 차단 모두 해제</Text>
          </TouchableOpacity>
        </>

        {/* 버스 */}
        <>
          <Text style={styles.InfoTopText}>버스</Text>
          <TouchableOpacity style={[{ ...styles.Info, backgroundColor: '#ffffff', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]} onPress={() => navigation.navigate('Bus_AddBusStopID')}>
            <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>정류장 설정</Text>
          </TouchableOpacity>
        </>

        {/* 크레딧 */}
        <>
          <Text style={styles.InfoTopText}>크레딧</Text>
          <TouchableOpacity style={[{ ...styles.Info, backgroundColor: '#ffffff', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]} onPress={() => navigation.navigate('Credits_Home')}>
            <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>크레딧</Text>
          </TouchableOpacity>
        </>

        {/* 앱 정보 */}
        <>
          <Text style={styles.InfoTopText}>정보</Text>
          <TouchableOpacity style={[{ ...styles.Info, backgroundColor: '#ffffff', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]} onPress={() => {
            Alert.alert('앱 정보', `버전 : ${appVersion}\n빌드 번호 : ${buildVersion}`)
          }}>
            <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>앱 정보</Text>
          </TouchableOpacity>
        </>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    marginTop: 20,
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
    top: 20,
    left: 10,
  },
  Info: {
    padding: 20,
    borderRadius: 25,
    marginBottom: 20,
    width: '100%',
  },
  InfoTopText: {
    color: 'gray',
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 5,
  },
  Title: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '400',
    marginLeft: 5,
  },
  Value: {
    color: '#4682b4',
    fontSize: 14,
    marginLeft: 5,
  },
})