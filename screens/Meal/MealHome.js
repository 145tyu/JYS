import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl, ScrollView, View, Text, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Entypo from 'react-native-vector-icons/Entypo';

import axiosInstance from '../../api/API_Server';
import { MoveScreen } from '../../api/MoveScreen';

const daysOfWeek = ['월', '화', '수', '목', '금']
const times = ['1교시', '2교시', '3교시', '4교시', '5교시', '6교시', '7교시', '8교시']

export default function MealHomeScreen({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'

  const [startMessage, setStartMessage] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const [mealStateType, setMealStateType] = useState(null)
  const [mealNowScreen, setMealNowScreen] = useState(1)
  const [mealTitle, setMealTitle] = useState('급식')
  const [mealMessage, setMealMessage] = useState(null)
  const [mealBreakfast, setMealBreakfast] = useState(null)
  const [mealLunch, setMealLunch] = useState(null)
  const [mealDinner, setMealDinner] = useState(null)

  const handleRefresh = () => {
    setRefreshing(true)

    mealRefresh()

    setRefreshing(false)
  }

  const mealRefresh = async () => {
    setMealStateType(null) // 'Type'을 'null'로 설정하여 '로딩중...'을 표시
    setMealTitle('급식') // 'Title'을 '급식'으로 초기화
    axiosInstance.post('/meal') // '/meal'에 API요청
      .then((res) => {
        if (res.status === 200) { // 'status'가 200이면
          if (res.data.type === 1) { // 'Type'이 '1'이면 급식 데이터를 순차적으로 저장
            if (mealNowScreen === 0) setMealTitle('조식')
            if (mealNowScreen === 1) setMealTitle('중식')
            if (mealNowScreen === 2) setMealTitle('석식')
            setMealStateType(res.data.type) // 'Type'을 'data.type'에서 받아온 값으로 설정
            setMealBreakfast(res.data.breakfast || null) // 'data.breakfast'에 값이 없을 경우 'null'로 설정
            setMealLunch(res.data.lunch || null) // 'data.lunch'에 값이 없을 경우 'null'로 설정
            setMealDinner(res.data.dinner || null) // 'data.dinner'에 값이 없을 경우 'null'로 설정
          } else if (res.data.type === 2 || res.data.type === 3) { // 'Type'이 '2' 또는 '3'이면
            setMealStateType(res.data.type) // 'Type'을 'data.type'에서 받아온 값으로 설정
            setMealTitle('급식')
            setMealMessage(res.data.message) // 'Message'를 'error.message'로 설정
          }
        } else {
          setMealStateType(0) // 'Type'을 '0'으로 설정
          setMealTitle('급식')
          setMealMessage('예외가 발생했습니다.\n나중에 다시 시도해 주세요.')
        }
      }).catch((error) => {
        setMealStateType(0) // 'Type'을 '0'으로 설정
        setMealTitle('급식')
        setMealMessage('오류가 발생했습니다.\n나중에 다시 시도해 주세요.') // 'Message'를 'error.message'로 설정
      })
  }

  const beforeMeal = async () => { // 이전 버튼을 눌렀을 때
    if (mealNowScreen === 2 && mealLunch !== null) { // 만약 'NowScreen'이 '2'이고 'Lunch'가 'null'이 아니라면
      setMealNowScreen(1) // 'NowScreen'을 '1'로 설정
      setMealTitle('중식') // 'Title'을 '중식'으로 설정
    } else if (mealNowScreen === 1 && mealBreakfast !== null) { // 만약 'NowScreen'이 '1'이고 'Breakfast'가 'null'이 아니라면
      setMealNowScreen(0) // 'NowScreen'을 '0'로 설정
      setMealTitle('조식') // 'Title'을 '조식'으로 설정
    }
  }

  const nextMeal = async () => { // 다음 버튼을 눌렀을 때
    if (mealNowScreen === 0 && mealLunch !== null) { // 만약 'NowScreen'이 '0'이고 'Lunch'가 'null'이 아니라면
      setMealNowScreen(1) // 'NowScreen'을 '1'로 설정
      setMealTitle('중식') // 'Title'을 '중식'으로 설정
    } else if (mealNowScreen === 1 && mealDinner !== null) { // 만약 'NowScreen'이 '1'이고 'Dinner'가 'null'이 아니라면
      setMealNowScreen(2) // 'NowScreen'을 '2'로 설정
      setMealTitle('석식') // 'Title'을 '석식'으로 설정
    }
  }

  const mealNowScreenTime = async () => { // 현재 시간 기준으로 급식 스크린 변경
    const nowData = new Date() // 현재 시간값을 가져옴
    let nowHour = nowData.getHours() // 시간값만 받아옴

    if (nowHour < 9) { // 현재 시간이 '9'시 이전일 경우
      if (mealBreakfast) {
        setMealNowScreen(0) // 조식을 표시
        setMealTitle('조식')
      }
    }
    else if (nowHour < 13) { // 현재 시간이 '13'시 이전일 경우
      if (mealLunch) {
        setMealNowScreen(1) // 중식을 표시
        setMealTitle('중식')
      }
    }
    else if (nowHour < 19) { // 현재 시간이 '19'시 이전일 경우
      if (mealDinner) {
        setMealNowScreen(2) // 석식을 표시
        setMealTitle('석식')
      }
    } else { // 이도저도 아닐경우
      setMealNowScreen(1) // 중식을 표시
      setMealTitle('중식')
    }
  }

  useEffect(() => {
    mealRefresh() // 스크린이 처음 시작될 때 한번 실행
    mealNowScreenTime() // 스크린이 처음 시작될 때 한번 실행\
  }, [])

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#FFFFFF', }, isDarkMode && { ...styles.container, backgroundColor: '#000000', }]}>
      {/* 로고 */}
      <View style={styles.logoView}>
        <Text style={[{ ...styles.logo, color: '#000000', }, isDarkMode && { ...styles.logo, color: '#ffffff', }]}>급식</Text>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />} contentContainerStyle={[{ ...styles.scrollContainer, backgroundColor: '#FFFFFF', }, isDarkMode && { ...styles.scrollContainer, backgroundColor: '#000000', }]}>
        {/* 급식 */}
        <View style={[{ ...styles.Info, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
          <Text style={[{ ...styles.Title, color: '#000000' }, isDarkMode && { ...styles.Title, color: '#FFFFFF' }]}>{mealTitle}</Text>

          {mealStateType === null ?
            <ActivityIndicator style={{ marginTop: 15 }} size="large" color="#0000ff" /> : null
          }
          {mealStateType === 2 || mealStateType === 3 ?
            <Text style={[{ ...mealStyles.Text, color: '#000000', }, isDarkMode && { ...mealStyles.Text, color: '#ffffff', }]}>{mealMessage}</Text> : null
          }
          {mealStateType === 1 && mealNowScreen === 0 &&
            <View>
              <Text style={[{ ...mealStyles.Text, color: '#000000', }, isDarkMode && { ...mealStyles.Text, color: '#ffffff', }]}>{mealBreakfast}</Text>

              <TouchableOpacity style={mealStyles.leftBtn} onPress={beforeMeal}>
                <Text style={[{ textAlign: 'center', color: '#000000' }, isDarkMode && { textAlign: 'center', color: '#ffffff' }]}>{<Icon_Entypo name="chevron-with-circle-left" size={25} />}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={mealStyles.rightBtn} onPress={nextMeal}>
                <Text style={[{ textAlign: 'center', color: '#000000' }, isDarkMode && { textAlign: 'center', color: '#ffffff' }]}>{<Icon_Entypo name="chevron-with-circle-right" size={25} />}</Text>
              </TouchableOpacity>
            </View>
          }
          {mealStateType === 1 && mealNowScreen === 1 &&
            <View>
              <Text style={[{ ...mealStyles.Text, color: '#000000', }, isDarkMode && { ...mealStyles.Text, color: '#ffffff', }]}>{mealLunch}</Text>

              <TouchableOpacity style={mealStyles.leftBtn} onPress={beforeMeal}>
                <Text style={[{ textAlign: 'center', color: '#000000' }, isDarkMode && { textAlign: 'center', color: '#ffffff' }]}>{<Icon_Entypo name="chevron-with-circle-left" size={25} />}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={mealStyles.rightBtn} onPress={nextMeal}>
                <Text style={[{ textAlign: 'center', color: '#000000' }, isDarkMode && { textAlign: 'center', color: '#ffffff' }]}>{<Icon_Entypo name="chevron-with-circle-right" size={25} />}</Text>
              </TouchableOpacity>
            </View>
          }
          {mealStateType === 1 && mealNowScreen === 2 &&
            <View>
              <Text style={[{ ...mealStyles.Text, color: '#000000', }, isDarkMode && { ...mealStyles.Text, color: '#ffffff', }]}>{mealDinner}</Text>

              <TouchableOpacity style={mealStyles.leftBtn} onPress={beforeMeal}>
                <Text style={[{ textAlign: 'center', color: '#000000' }, isDarkMode && { textAlign: 'center', color: '#ffffff' }]}>{<Icon_Entypo name="chevron-with-circle-left" size={25} />}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={mealStyles.rightBtn} onPress={nextMeal}>
                <Text style={[{ textAlign: 'center', color: '#000000' }, isDarkMode && { textAlign: 'center', color: '#ffffff' }]}>{<Icon_Entypo name="chevron-with-circle-right" size={25} />}</Text>
              </TouchableOpacity>
            </View>
          }
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
    marginBottom: 50,
    marginTop: 10
  },
  logo: {
    fontSize: 30,
    fontWeight: 'bold',
    top: 20,
    left: 25,
  },
  Info: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    width: '95%',
    maxWidth: 400,
    position: 'relative'
  },
  Title: {
    marginBottom: 5,
    left: 5,
    fontSize: 25,
    fontWeight: 'bold',
  },
})

const mealStyles = StyleSheet.create({
  Text: {
    borderRadius: 20,
    padding: 30,
    paddingLeft: 50,
    paddingRight: 50,
    paddingTop: 15,
    paddingBottom: 5,
    textAlign: 'center',
    color: "#000000", // 다크모드에서의 글자색상
  },
  leftBtn: {
    position: 'absolute',
    top: 60,
    left: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  rightBtn: {
    position: 'absolute',
    top: 60,
    right: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
})