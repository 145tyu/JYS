import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Button, View, Text, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useIsFocused } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';

import axiosInstance from '../../api/API_Server';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

export default function BusHome({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'
  const isFocused = useIsFocused()

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
        console.log(error)
        setBusFavoritesData([])
        Alert.alert('에러', '데이터를 불러오지 못했어요.', [{ text: '확인' }])
      })
  }

  useEffect(() => {
    //AsyncStorage.removeItem('Bus_FavoritesList')
    handleGetBusFavorites()
  }, [isFocused])

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#ffffff' }, isDarkMode && { ...styles.container, backgroundColor: '#000000' }]}>
      {/* 로고 */}
      <View style={styles.logoView}>
        <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 50 } : { ...styles.backButtonView, }} onPress={() => navigation.goBack()}>
          <Text style={[{ ...styles.backButtonText, color: '#000000' }, isDarkMode && { ...styles.backButtonText, color: '#ffffff' }]}>{<Icon_Ionicons name='chevron-back-outline' size={21} />} 버스</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Bus_Search')} style={styles.inputContainer}>
        <View style={[{ ...styles.inputView, backgroundColor: '#E9E9E9', borderColor: '#E9E9E9' }, isDarkMode && { ...styles.inputView, backgroundColor: '#333333', borderColor: '#333333' }]}>
          <TextInput
            style={[{ ...styles.inputText, color: '#000000', }, isDarkMode && { ...styles.inputText, color: '#ffffff' }]}
            placeholder='버스, 정류장 검색'
            placeholderTextColor={isDarkMode ? "#CCCCCC" : "#999999"}
            editable={false}
          />
        </View>
      </TouchableOpacity>

      {BusFavoritesData.length === 0 ?
        <>
          <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', }}>
            <Text style={[{ fontSize: 15, textAlign: 'center', color: '#000000' }, isDarkMode && { fontSize: 15, textAlign: 'center', color: '#ffffff' }]}>검색을 사용하여 버스, 정류장을 검색하여{'\n'}즐겨찾기에 추가해보세요.</Text>
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
                    <View style={{ width: '100%', height: 85, marginBottom: 5, backgroundColor: '#E9E9E9' }}>
                      <Text style={{ marginTop: 13, marginLeft: 13, fontSize: 20, fontWeight: '700', color: '#000000', }}>{data.data.type ? data.data.type : '구분'} {data.data.busID}번</Text>
                      <Text style={{ marginTop: 10, marginLeft: 13, fontSize: 13, fontWeight: '400', color: '#000000', }}>{data.data.EndingPoint} 방면</Text>
                    </View>
                  </TouchableOpacity>
                )
              } else if (data.type === 'busStop') {
                return (
                  <TouchableOpacity key={index} onPress={() => {
                    navigation.navigate('Bus_BusStopView', { data: data.data })
                  }}>
                    <View style={{ width: '100%', height: 85, marginBottom: 5, backgroundColor: '#E9E9E9' }}>
                      <Text style={{ marginTop: 13, marginLeft: 13, fontSize: 20, fontWeight: '700', color: '#000000', }}>{data.data.busStopName}</Text>
                      <Text style={{ marginTop: 10, marginLeft: 13, fontSize: 13, fontWeight: '400', color: '#000000', }}>{data.data.busStopID}</Text>
                    </View>
                  </TouchableOpacity>
                )
              }
            })}
          </ScrollView>
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