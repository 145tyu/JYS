import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, KeyboardAvoidingView, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Image, Modal } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import FastImage from 'react-native-fast-image';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';

import axiosInstance from "../../../api/API_Server";

export default function T_SignUp_Welcome({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'

  const handleNextScreen = () => {
    return navigation.navigate('SignUp_ToS')
  }

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#ffffff' }, isDarkMode && { ...styles.container, backgroundColor: '#000000' }]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', }}>
        <View style={{}}>
          <FastImage style={{ width: 150, height: 150, }} source={require('../../../resource/logo_v1.png')} />
        </View>

        <View style={{ marginTop: 40, marginBottom: 100, }}>
          <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>선생님!{'\n'}안녕하세요.</Text>
        </View>

        <View style={{ position: 'absolute', bottom: 30, }}>
          <TouchableOpacity style={styles.nextBtn} onPress={handleNextScreen}>
            <Text style={styles.nextBtnText}>다음</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  Title: {
    paddingLeft: 15,
    paddingRight: 15,
    fontWeight: 'bold',
    fontSize: 30,
    textAlign: 'center',
  },
  nextBtn: {
    width: 310,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#EB4E45',
    justifyContent: 'center',
  },
  nextBtnText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '400',
    alignContent: 'center',
    alignItems: 'center',
  },
})