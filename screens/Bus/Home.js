import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Button, View, Text, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';

import axiosInstance from '../../api/API_Server';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

const BusData = {
  "340": {
    "0": { start: "세종고속시외버스터미널", end: "조치원버스터미널", busStopID: "" },
    "1": { start: "조치원버스터미널", end: "세종고속시외버스터미널", busStopID: "" },
  },
  "430": {
    "0": { start: "가톨릭꽃동네대학교", end: "세종고속시외버스터미널", busStopID: "" },
    "1": { start: "세종고속시외버스터미널", end: "가톨릭꽃동네대학교", busStopID: "" },
  },
  "550": {
    "0": { start: "산성동종점", end: "조치원역", busStopID: "" },
    "1": { start: "조치원역", end: "산성동종점", busStopID: "" },
  },
  "551": {
    "0": { start: "조치원역", end: "산성시장", busStopID: "" },
  },
  "601": {
    "0": { start: "새나루마을9,10단지", end: "조치원역", busStopID: "" },
    "1": { start: "조치원역", end: "새나루마을9,10단지", busStopID: "" },
  },
  "655": {
    "0": { start: "충남대학교", end: "세종고속시외버스터미널", busStopID: "" },
    "1": { start: "세종고속시외버스터미널", end: "충남대학교", busStopID: "" },
  },
  "801": {
    "0": { start: "민석아파트입구", end: "세종고속시외버스터미널", busStopID: "" },
    "1": { start: "세종고속시외버스터미널", end: "민석아파트입구", busStopID: "" },
  },
  "991": {
    "0": { start: "국책연구단지북측", end: "대곡리", busStopID: "" },
    "1": { start: "대곡리", end: "국책연구단지북측", busStopID: "" },
  },
}

export default function BusHome({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'

  const [isLoading, setIsLoading] = useState(false)

  const [nu, setnu] = useState(0)
  const [busNum, setBusNum] = useState('')

  const [businfo, setBusInfo] = useState(null)
  const [busType, setBusType] = useState(0)

  const getBusInfo = async () => {
    setIsLoading(true)
    try {
      await axiosInstance.post('/BusInfo', { busNum, nu })
        .then((res) => {
          setIsLoading(false)
          setBusInfo(res.data.data)
          setBusType(1)
        }).catch((error) => {

        })
    } catch (error) {
      console.log('BusInfo | ', error)
    }
  }

  const handle_nu = async () => {
    if (nu === 0) {
      setnu(1)
    } else if (nu === 1) {
      setnu(0)
    }
  }

  useEffect(() => { // 이 스크린이 실행되면 한번 실행
  }, [])

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      {/* 로고 */}
      <View style={styles.logoView}>
        <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 50 } : { ...styles.backButtonView, left: 20, }} onPress={() => navigation.goBack()}>
          <Text style={[{ ...styles.logoText, color: '#000000' }, isDarkMode && { ...styles.logoText, color: '#ffffff' },]}>
            {<Icon_Ionicons name="chevron-back-outline" size={21} />} 버스 조회
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading === true ?
        <>
          <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', }}>
            <ActivityIndicator size="large" color="green" />
          </View>
        </>
        :
        <>
          {busType === 0 ?
            <>
              <View style={{
                width: '90%',
                height: 10,
                marginTop: 20,
                backgroundColor: '#fff',
                padding: 20,
                borderColor: '#1E00D3',
                borderWidth: 3,
                borderRadius: 35,
                justifyContent: 'center',
              }}
              >
                <TextInput
                  style={{
                    height: 50,
                    color: '#000',
                  }}
                  placeholder="검색"
                  placeholderTextColor="#003f5c"
                  onChangeText={(text) => setBusNum(text)}
                  value={busNum}
                />
              </View>

              <Text style={{ color: 'black', fontSize: 20, }}>선택 노선 : {busNum}</Text>
              <Text style={{ color: 'black', fontSize: 20, marginBottom: 50, }}>기점 위치 : {nu}</Text>

              <Button title={'991'} onPress={() => { setBusNum('991') }} />
              <Button title={'601'} onPress={() => { setBusNum('601') }} />
              <Button title={'801'} onPress={() => { setBusNum('801') }} />
              <Button title={'221'} onPress={() => { setBusNum('221') }} />
              <Button title={'222'} onPress={() => { setBusNum('222') }} />
              <Button title={'1000'} onPress={() => { setBusNum('1000') }} />

              <TouchableOpacity style={{ ...styles.Btn, marginBottom: 80, }} onPress={handle_nu}>
                <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>
                  {nu === 0 ?
                    <>기점 : 0</>
                    :
                    <>기점 : 1</>
                  }
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ ...styles.Btn, marginBottom: 40, }} onPress={() => getBusInfo()}>
                <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>조회</Text>
              </TouchableOpacity>
            </>
            :
            null
          }
          {busType === 1 ?
            <>
              <Text style={{ marginTop: 30, fontSize: 20, color: 'black', }}>노선 번호 : {businfo[0].busID}</Text>
              <Text style={{ fontSize: 20, color: 'black', }}>기점 : {businfo[1].start}</Text>
              <Text style={{ fontSize: 20, color: 'black', }}>종점 : {businfo[1].end}</Text>

              <ScrollView contentContainerStyle={[styles.scrollContainer, isDarkMode && styles.scrollContainerDark]}>
                {
                  businfo[2].busStop.map((data, index) => {
                    const regex = /\d{4}$/ // 정규 표현식: 맨 끝에 4개의 숫자를 찾음
                    const matches = data.match(regex) // 정규 표현식에 맞는 부분을 추출

                    const result = data.substring(data.lastIndexOf(']') + 1, data.search(/\d{4}$/))
                    const result1 = data.substring(data.lastIndexOf(']') + 1, data.lastIndexOf(""))

                    if (matches && matches.length > 0) {
                      return (
                        <TouchableOpacity key={index}>
                          <Text key={index} style={{ fontSize: 13, color: 'black', }}>{result} 번호:{matches[0]}{'\n'}</Text>
                        </TouchableOpacity>
                      )
                    } else {
                      const regex = /(\d{4})\]/ // 정규 표현식: 4개의 숫자 뒤에 ']' 문자가 오는 패턴을 찾음
                      const matches = data.match(regex) // 정규 표현식에 맞는 부분을 추출

                      if (matches && matches.length > 0) {
                        return (
                          <TouchableOpacity key={index}>
                            <Text key={index} style={{ fontSize: 13, color: 'black', }}>{result1}{'\n'}</Text>
                          </TouchableOpacity>
                        )
                      }
                    }
                  })
                }
              </ScrollView>
            </>
            :
            null
          }
        </>
      }
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  scrollContainerDark: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  logo: {
    fontWeight: 'bold',
    fontSize: 100,
    color: '#fb5b5a',
    marginBottom: 40,
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
    left: 10,
  },
  Btn: {
    backgroundColor: '#1E00D3',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 0,
    marginTop: 50,
    marginBottom: 5,
  }
})