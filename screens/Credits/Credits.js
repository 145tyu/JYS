import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

export default function CreditsScreen({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#f0f0f0' }, isDarkMode && { ...styles.container, backgroundColor: '#000000' },]}>
      {/* 로고 */}
      <View style={styles.logoView}>
        <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 10 } : { ...styles.backButtonView, }} onPress={() => navigation.goBack()}>
          <Text style={[{ ...styles.logoText, color: '#000000' }, isDarkMode && { ...styles.logoText, color: '#ffffff' },]}>
            {<Icon_Ionicons name="chevron-back-outline" size={21} />} 크레딧
          </Text>
        </TouchableOpacity>
      </View>

      {/* 스크롤 */}
      <ScrollView style={[{ ...styles.scrollContainer, backgroundColor: '#f0f0f0', }, isDarkMode && { ...styles.scrollContainer, backgroundColor: '#000000', }]}>
        <>
          <Text style={styles.InfoTopText}>앱 개발</Text>
          <View style={[{ ...styles.Info, backgroundColor: '#ffffff', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
            <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>이영준</Text>

            <View style={{ width: '100%', height: 1, marginTop: 10, marginBottom: 15, backgroundColor: 'gray' }}></View>

            <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>박종찬</Text>

            <View style={{ width: '100%', height: 1, marginTop: 15, marginBottom: 10, backgroundColor: 'gray' }}></View>

            <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>박현우</Text>
          </View>
        </>

        <>
          <Text style={styles.InfoTopText}>웹 개발</Text>
          <View style={[{ ...styles.Info, backgroundColor: '#ffffff', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
            <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>박상규</Text>

            <View style={{ width: '100%', height: 1, marginTop: 10, marginBottom: 10, backgroundColor: 'gray' }}></View>

            <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>정채윤</Text>
          </View>
        </>

        <>
          <Text style={styles.InfoTopText}>디자인</Text>
          <View style={[{ ...styles.Info, backgroundColor: '#ffffff', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
            <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>김승민</Text>

            <View style={{ width: '100%', height: 1, marginTop: 10, marginBottom: 10, backgroundColor: 'gray' }}></View>

            <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>민태원</Text>
          </View>
        </>

        <>
          <Text style={styles.InfoTopText}>도움을 주신 분들</Text>
          <View style={[{ ...styles.Info, backgroundColor: '#ffffff', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
            <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>김준혁 선생님</Text>
          </View>
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