import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, Platform, useColorScheme, ActivityIndicator, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';

import axiosInstance from '../api/API_Server';

const appVersion = DeviceInfo.getVersion() // 앱 버전 가져오기
const buildVersion = DeviceInfo.getBuildNumber()

export default function SettingsScreen({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
        <View style={[styles.scrollContainer, isDarkMode && styles.scrollContainerDark]}>
            <View style={[allTabStyles.Info, isDarkMode && allTabStyles.InfoDark]}>
                <View style={allTabStyles.Item}>
                    <Text style={[allTabStyles.Label, isDarkMode && allTabStyles.LabelDark]}>앱 버전</Text>
                    <Text style={[allTabStyles.Value, isDarkMode && allTabStyles.ValueDark]}>{appVersion}</Text>
                </View>

                <View style={allTabStyles.Item}>
                    <Text style={[allTabStyles.Label, isDarkMode && allTabStyles.LabelDark]}>빌드 번호</Text>
                    <Text style={[allTabStyles.Value, isDarkMode && allTabStyles.ValueDark]}>{buildVersion}</Text>
                </View>
            </View>
        </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerDark: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontWeight: 'bold',
    fontSize: 100,
    color: '#fb5b5a',
    marginBottom: 40,
  },
  messageText: {
    fontWeight: 'bold',
    color: 'black',
    marginTop: 10,
  },
  messageTextDark: {
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  }
})

const allTabStyles = StyleSheet.create({
    Info: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 25,
        marginBottom: 10,
        justifyContent: 'center',
        width: '95%',
        maxWidth: 400,
    },
    InfoDark: {
        backgroundColor: '#121212', // 다크모드에서의 배경색상
        padding: 20,
        borderRadius: 25,
        marginBottom: 10,
        justifyContent: 'center',
        width: '95%',
        maxWidth: 400,
    },
    profileTitle: {
        marginBottom: 3,
        color: 'black',
        fontSize: 25,
        fontWeight: 'bold',
    },
    profileTitleDark: {
        marginBottom: 3,
        color: 'white',
        fontSize: 25,
        fontWeight: 'bold'
    },
})