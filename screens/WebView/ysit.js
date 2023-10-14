import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal, Dimensions } from 'react-native';
import { CommonActions, useFocusEffect, useIsFocused } from "@react-navigation/native";
import DeviceInfo from 'react-native-device-info';
import WebView from 'react-native-webview';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

import axiosInstance from "../../api/API_Server";

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

export default function WebView_ysit({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
      <WebView
        style={{ width: windowWidth, height: windowHeight, }}
        source={{ uri: 'https://ysit-front-murex.vercel.app/' }}
      />
    </SafeAreaView>
  )
}