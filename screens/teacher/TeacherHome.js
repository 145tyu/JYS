import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Image, Modal, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useIsFocused } from "@react-navigation/native";
// import messaging from '@react-native-firebase/messaging';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Entypo from 'react-native-vector-icons/Entypo';

import axiosInstance from '../../api/API_Server';
import ImageViewer from '../../api/ImageViewer';

export default function TeacherHomeScreen({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'
  const isFocused = useIsFocused()

  const [startMessage, setStartMessage] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const [saveRentalStateType, setSaveRentalStateType] = useState(null)
  const [saveRentalMessage, setSaveRentalMessage] = useState('현재 요청이 없어요.')
  const [saveRentalInfo, setSaveRentalInfo] = useState(null)

  const [mealStateType, setMealStateType] = useState(null)
  const [mealNowScreen, setMealNowScreen] = useState(1)
  const [mealTitle, setMealTitle] = useState('급식')
  const [mealMessage, setMealMessage] = useState(null)
  const [mealBreakfast, setMealBreakfast] = useState(null)
  const [mealLunch, setMealLunch] = useState(null)
  const [mealDinner, setMealDinner] = useState(null)

  const [busArrivalInformationIsRefreshing, setBusArrivalInformationIsRefreshing] = useState(false)
  const [busArrivalInformationTitle, setBusArrivalInformationTitle] = useState('버스')
  const [busArrivalInformationMessage, setBusArrivalInformationMessage] = useState(null)
  const [busArrivalInformationData, setBusArrivalInformationData] = useState([])
  const [busArrivalInformationType, setBusArrivalInformationType] = useState(null)

  const [imageViewerState, setImageViewerState] = useState(false)
  const [imageViewerData, setImageViewerData] = useState('')
  const [imageViewerInfo, setImageViewerInfo] = useState([])

  const handleRefresh = () => {
    setRefreshing(true)

    // rentalInquiry()
    mealRefresh()
    getBusStopID()

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

  const getBusStopID = async () => {
    setBusArrivalInformationIsRefreshing(true)
    setBusArrivalInformationTitle('버스')
    setBusArrivalInformationType(null)
    setBusArrivalInformationData([])
    setBusArrivalInformationMessage(null)

    AsyncStorage.getItem('set_busStopID_1')
      .then((ID) => {
        setBusArrivalInformationIsRefreshing(false)
        if (ID === null) {
          setBusArrivalInformationType(1)
          setBusArrivalInformationTitle('버스')
          setBusArrivalInformationMessage('자주 타는 정류장을 추가해보세요')
        } else {
          busArrivalInformationRefresh(ID)
        }
      }).catch((error) => {
        console.log(error)
        setBusArrivalInformationMessage(`${error}`)
        setBusArrivalInformationType(3)
        setBusArrivalInformationIsRefreshing(false)
      })
  }

  const busArrivalInformationRefresh = async (ID) => {
    setBusArrivalInformationIsRefreshing(true)
    axiosInstance.post('/Bus/ArrivalInformation', { busStopID: ID })
      .then((res) => {
        setBusArrivalInformationIsRefreshing(false)
        if (res.status === 200) { // 'status'가 200이면
          const busData = res.data.data
          const busStopInfo = res.data.busStopInfo
          setBusArrivalInformationTitle(busStopInfo[0].busStopName)
          setBusArrivalInformationData(busData)
          setBusArrivalInformationType(2)
        }
      }).catch((error) => {
        console.log('busArrivalInformation | ', error)
        setBusArrivalInformationMessage(`${error}`)
        setBusArrivalInformationType(3)
        setBusArrivalInformationIsRefreshing(false)
      })
  }

  const openImageViewer = (imageData, imageInfo) => {
    setImageViewerData(imageData)
    setImageViewerInfo(imageInfo)
    setImageViewerState(true)
  }

  const closeImageViewer = () => {
    setImageViewerData('')
    setImageViewerState(false)
  }

  useEffect(() => {
    // rentalInquiry() // 스크린이 처음 시작될 때 한번 실행
    mealRefresh() // 스크린이 처음 시작될 때 한번 실행
    getBusStopID()

    const intervalId = setInterval(() => {
      if (isFocused) {
        getBusStopID()
      }
    }, 15000)

    // 컴포넌트가 언마운트 될 때 clearInterval 호출하여 메모리 누수 방지
    return () => {
      clearInterval(intervalId)
    }
  }, [])

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#FFFFFF', }, isDarkMode && { ...styles.container, backgroundColor: '#000000', }]}>
      {/* 이미지 뷰어 */}
      <ImageViewer imageData={imageViewerData} imageInfo={imageViewerInfo} visible={imageViewerState} onClose={() => closeImageViewer()} />

      {/* 로고 */}
      <View style={styles.logoView}>
        <Text style={[{ ...styles.logo, color: '#000000', }, isDarkMode && { ...styles.logo, color: '#ffffff', }]}>홈</Text>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />} contentContainerStyle={[{ ...styles.scrollContainer, backgroundColor: '#FFFFFF', }, isDarkMode && { ...styles.scrollContainer, backgroundColor: '#000000', }]}>
        {/* 방음부스 */}

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

        {/* 버스 */}
        <TouchableOpacity onPress={() => navigation.navigate('Bus_Home')} style={[{ ...styles.Info, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
          <Text style={[{ ...styles.Title, color: '#000000' }, isDarkMode && { ...styles.Title, color: '#FFFFFF' }]}>{busArrivalInformationTitle}</Text>
          {busArrivalInformationIsRefreshing === true ?
            <>
              <ActivityIndicator size="large" color="#0000ff" />
            </>
            :
            <>
              {busArrivalInformationType === null ?
                <>
                  <ActivityIndicator size="large" color="#0000ff" />
                </>
                :
                <>
                  {busArrivalInformationType === 3 &&
                    <>
                      <Text style={[{ ...mealStyles.Text, color: '#000000', }, isDarkMode && { ...mealStyles.Text, color: '#ffffff', }]}>{busArrivalInformationMessage}</Text>
                    </>
                  }
                  {busArrivalInformationType === 1 &&
                    <View>
                      <Text style={[{ ...busArrivalInformationStyles.Text, color: '#000000', }, isDarkMode && { ...busArrivalInformationStyles.Text, color: '#ffffff', }]}>{busArrivalInformationMessage}</Text>
                      <TouchableOpacity style={busArrivalInformationStyles.addBusStopBtn} onPress={() => navigation.navigate('Bus_AddBusStopID')}>
                        <Text style={busArrivalInformationStyles.addBusStopBtnText}>추가하기</Text>
                      </TouchableOpacity>
                    </View>
                  }
                  {busArrivalInformationType === 2 &&
                    <>
                      {busArrivalInformationData.length === 0 ?
                        <>
                          <ActivityIndicator size="large" color="#0000ff" />
                        </>
                        :
                        <>
                          <View style={{ marginTop: 15 }}></View>
                          {busArrivalInformationData.map((data, index) => {
                            const direction = (data.direction).substr(0, data.direction.length - 2).length >= 5 ? `${(data.direction).substr(0, 4)}...` : `${(data.direction).substr(0, data.direction.length - 2)} 방향`
                            //console.log(direction)
                            const currentLocation = (data.currentLocation).substring((data.currentLocation).lastIndexOf('(') + 1, (data.currentLocation).lastIndexOf(')'))
                            return (
                              <View key={index} style={{ marginBottom: 25 }}>
                                <Text style={[{ left: 10, marginBottom: 7, color: '#000000', fontWeight: 'bold', position: 'absolute' }, isDarkMode && { left: 10, marginBottom: 7, color: '#ffffff', fontWeight: 'bold', position: 'absolute' }]}>
                                  {data.busNumber}번 {'('}{direction}{')'}
                                </Text>
                                <Text style={[{ right: 10, marginBottom: 7, color: '#000000', fontWeight: 'bold', position: 'absolute' }, isDarkMode && { right: 10, marginBottom: 7, color: '#ffffff', fontWeight: 'bold', position: 'absolute' }]}>
                                  {data.arrivalTime} {currentLocation ? `[${currentLocation}]` : null}
                                </Text>
                              </View>
                            )
                          })}
                        </>
                      }
                    </>
                  }
                </>
              }
            </>
          }
        </TouchableOpacity>
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
  Text: {
    padding: 30,
    paddingBottom: 65,
    textAlign: 'center',
  },
})

const RoomRentalStyles = StyleSheet.create({
  Info: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    width: '95%',
    maxWidth: 400,
    position: 'relative'
  },
  InfoDark: {
    backgroundColor: '#121212', // 다크모드에서의 배경색상
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    width: '95%',
    maxWidth: 400,
    position: 'relative',
    borderColor: '#FFFFFF', // 다크모드에서의 테두리 색상
    borderWidth: 1,
  },
  Item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: 13,
  },
  Label: {
    fontSize: 18,
    fontWeight: 'bold',
    width: 100,
    marginRight: 1,
    color: '#000', // 다크모드에서의 글자색상
  },
  LabelDark: {
    fontSize: 18,
    fontWeight: 'bold',
    width: 100,
    marginRight: 1,
    color: '#fff', // 다크모드에서의 글자색상
  },
  Value: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000', // 다크모드에서의 글자색상
  },
  ValueDark: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff', // 다크모드에서의 글자색상
  },
  Title: {
    marginBottom: 5,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 15,
    color: '#000000', // 다크모드에서의 글자색상
  },
  TitleDark: {
    marginBottom: 5,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 15,
    color: '#FFFFFF', // 다크모드에서의 글자색상
  },
  Text: {
    padding: 30,
    paddingBottom: 30,
    textAlign: 'center',
    color: "#000", // 다크모드에서의 글자색상
  },
  TextDark: {
    padding: 30,
    paddingBottom: 30,
    textAlign: 'center',
    color: "#fff", // 다크모드에서의 글자색상
  },
  redCircle: {
    width: 13,
    height: 13,
    borderRadius: 25,
    backgroundColor: 'red',
    position: 'absolute',
    top: -45,
    right: -5
  },
  greenCircle: {
    width: 13,
    height: 13,
    borderRadius: 25,
    backgroundColor: 'green',
    position: 'absolute',
    top: -45,
    right: -5
  },
  acceptBtn: {
    position: 'absolute',
    bottom: 10,
    right: 70,
    backgroundColor: 'green',
    borderRadius: 5,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  declineBtn: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    backgroundColor: 'red',
    borderRadius: 5,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  acceptBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  declineBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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

const busArrivalInformationStyles = StyleSheet.create({
  Text: {
    padding: 30,
    paddingBottom: 65,
    textAlign: 'center',
  },
  addBusStopBtn: {
    backgroundColor: '#393939',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 0,
    marginTop: 50,
    marginBottom: 5,
  },
  addBusStopBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
})

{/* <>
          {saveRentalStateType === null &&
            <View style={[{ ...styles.Info, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
              <Text style={[{ ...styles.Title, color: '#000000' }, isDarkMode && { ...styles.Title, color: '#FFFFFF' }]}>부스대여 신청</Text>
              {saveRentalStateType === null &&
                <ActivityIndicator style={{ marginTop: 15 }} size="large" color="#0000ff" />
              }
            </View>
          }
          {saveRentalStateType === 1 &&
            <View style={[{ ...styles.Info, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
              <Text style={[{ ...styles.Title, color: '#000000' }, isDarkMode && { ...styles.Title, color: '#FFFFFF' }]}>부스대여 신청</Text>
              <Text style={[{ ...styles.Text, color: '#000000', marginBottom: -30 }, isDarkMode && { ...styles.Text, color: '#ffffff', marginBottom: -30 }]}>{saveRentalMessage}</Text>
            </View>
          }
          {saveRentalStateType === 2 &&
            <>
              {saveRentalInfo.map((Info) => {
                if (Info.type === 2) {
                  return (
                    <View key={Info.id} style={[{ ...styles.Info, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
                      <Text style={[{ ...styles.Title, marginBottom: 10, color: '#000000' }, isDarkMode && { ...styles.Title, marginBottom: 10, color: '#FFFFFF' }]}>대여 요청</Text>

                      <View style={RoomRentalStyles.Item}>
                        <Text style={[{ ...RoomRentalStyles.Value, color: '#000000' }, isDarkMode && { ...RoomRentalStyles.Value, color: '#ffffff' }]}>방 번호 : </Text>
                        <Text style={[{ ...RoomRentalStyles.Value, color: '#000000' }, isDarkMode && { ...RoomRentalStyles.Value, color: '#ffffff' }]}>{`${Info.room_number}번 방`}</Text>
                      </View>

                      <View style={RoomRentalStyles.Item}>
                        <Text style={[{ ...RoomRentalStyles.Value, color: '#000000' }, isDarkMode && { ...RoomRentalStyles.Value, color: '#ffffff' }]}>학번 이름 : </Text>
                        <Text style={[{ ...RoomRentalStyles.Value, color: '#000000' }, isDarkMode && { ...RoomRentalStyles.Value, color: '#ffffff' }]}>{`${Info.studentID} ${Info.first_name}${Info.last_name}`}</Text>
                      </View>

                      <View style={RoomRentalStyles.Item}>
                        <Text style={[{ ...RoomRentalStyles.Value, color: '#000000' }, isDarkMode && { ...RoomRentalStyles.Value, color: '#ffffff' }]}>사용 시간 : </Text>
                        <Text style={[{ ...RoomRentalStyles.Value, color: '#000000' }, isDarkMode && { ...RoomRentalStyles.Value, color: '#ffffff' }]}>{`${Info.start_time} ~ ${Info.end_time}`}</Text>
                      </View>

                      <View style={RoomRentalStyles.Item}>
                        <Text style={[{ ...RoomRentalStyles.Value, color: '#000000' }, isDarkMode && { ...RoomRentalStyles.Value, color: '#ffffff' }]}>대여 목적 : </Text>
                        <Text style={[{ ...RoomRentalStyles.Value, color: '#000000' }, isDarkMode && { ...RoomRentalStyles.Value, color: '#ffffff' }]}>{`${Info.purpose}`}</Text>
                      </View>

                      {/* 버튼
                      <>
                        <TouchableOpacity style={RoomRentalStyles.acceptBtn} onPress={() => {
                          acceptBtn(Info.id, 'rental')
                          rentalInquiry()
                        }}>
                          <Text style={RoomRentalStyles.acceptBtnText}>수락</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={RoomRentalStyles.declineBtn} onPress={() => {
                          declineBtn(Info.id, 'rental')
                          rentalInquiry()
                        }}>
                          <Text style={RoomRentalStyles.declineBtnText}>거절</Text>
                        </TouchableOpacity>
                      </>
                    </View>
                  )
                }
                if (Info.type === 4) {
                  return (
                    <View key={Info.id} style={[{ ...styles.Info, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
                      <Text style={[{ ...styles.Title, marginBottom: 10, color: '#000000' }, isDarkMode && { ...styles.Title, marginBottom: 10, color: '#FFFFFF' }]}>반납 요청</Text>

                      <View style={RoomRentalStyles.Item}>
                        <Text style={[{ ...RoomRentalStyles.Value, color: '#000000' }, isDarkMode && { ...RoomRentalStyles.Value, color: '#ffffff' }]}>방 번호 : </Text>
                        <Text style={[{ ...RoomRentalStyles.Value, color: '#000000' }, isDarkMode && { ...RoomRentalStyles.Value, color: '#ffffff' }]}>{`${Info.room_number}번 방`}</Text>
                      </View>

                      <View style={RoomRentalStyles.Item}>
                        <Text style={[{ ...RoomRentalStyles.Value, color: '#000000' }, isDarkMode && { ...RoomRentalStyles.Value, color: '#ffffff' }]}>학번 : </Text>
                        <Text style={[{ ...RoomRentalStyles.Value, color: '#000000' }, isDarkMode && { ...RoomRentalStyles.Value, color: '#ffffff' }]}>{`${Info.studentID}`}</Text>
                      </View>

                      <View style={RoomRentalStyles.Item}>
                        <Text style={[{ ...RoomRentalStyles.Value, color: '#000000' }, isDarkMode && { ...RoomRentalStyles.Value, color: '#ffffff' }]}>이름 : </Text>
                        <Text style={[{ ...RoomRentalStyles.Value, color: '#000000' }, isDarkMode && { ...RoomRentalStyles.Value, color: '#ffffff' }]}>{`${Info.first_name}${Info.last_name}`}</Text>
                      </View>

                      <TouchableOpacity style={{ position: 'absolute', top: 13, right: 13, }} onPress={() => {
                        openImageViewer(`data:image/jpeg;base64,${Info.image}`, [{ "type": "image/jpeg", "width": 2000, "height": 2000, "size": 3261937 }])
                      }}>
                        {Info.image && <Image source={{ uri: Info.image }} style={{ width: 100, height: 100 }} />}
                      </TouchableOpacity>

                      {/* 버튼
                      <>
                        <TouchableOpacity style={RoomRentalStyles.acceptBtn} onPress={() => {
                          acceptBtn(Info.id, 'return')
                          rentalInquiry()
                        }}>
                          <Text style={RoomRentalStyles.acceptBtnText}>수락</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={RoomRentalStyles.declineBtn} onPress={() => {
                          declineBtn(Info.id, 'return')
                          rentalInquiry()
                        }}>
                          <Text style={RoomRentalStyles.declineBtnText}>거절</Text>
                        </TouchableOpacity>
                      </>
                    </View>
                  )
                } else {
                  setSaveRentalStateType(1)
                }
                return null
              })}
            </>
          }
        </> */}

// const rentalInquiry = async () => {
//   setSaveRentalStateType(null)
//   await axiosInstance.post('/RoomRental/RentalInquiry')
//     .then((res) => {
//       if (res.status === 200) {
//         if (res.data.type === 1) {
//           setSaveRentalMessage(res.data.message)
//           setSaveRentalStateType(1)
//         } else if (res.data.type === 2) {
//           setSaveRentalInfo(res.data.data)
//           setSaveRentalStateType(2)
//         }
//       } else {
//         setSaveRentalStateType(0)
//         setSaveRentalMessage('예외가 발생했습니다.\n나중에 다시 시도해 주세요.')
//       }
//     }).catch((error) => {
//       console.log('RentalInquiry API | ', error)
//       setSaveRentalStateType(0)
//       setSaveRentalMessage('오류가 발생했습니다.\n나중에 다시 시도해 주세요.')
//     })
// }

// async function acceptBtn(studentID, query) {
//   const teacherID = await AsyncStorage.getItem('id')
//   if (query === 'rental') {
//     axiosInstance.post('/RoomRental/AcceptorButton', { studentID: studentID, teacherID: teacherID, buttonType: 'accept', methodName: 'rentalForm' })
//       .then((res) => {
//         if (res.status === 200) {
//           rentalInquiry()
//         } else {
//           return Alert.alert('에러', '요청에 실패했습니다.', [
//             { text: '확인', }
//           ])
//         }
//       }).catch((error) => {
//         console.log('AcceptorButton API | ', error)
//         return Alert.alert('에러', '서버와 연결할 수 없습니다.', [
//           { text: '확인', }
//         ])
//       })
//   } else if (query === 'return') {
//     axiosInstance.post('/RoomRental/AcceptorButton', { studentID: studentID, teacherID: teacherID, buttonType: 'accept', methodName: 'rentalReturn' })
//       .then((res) => {
//         if (res.status === 200) {
//           rentalInquiry()
//         } else {
//           return Alert.alert('에러', '요청에 실패했습니다.', [
//             { text: '확인', }
//           ])
//         }
//       }).catch((error) => {
//         console.log('AcceptorButton API | ', error)
//         return Alert.alert('에러', '서버와 연결할 수 없습니다.', [
//           { text: '확인', }
//         ])
//       })
//   }
// }

// async function declineBtn(studentID, query) {
//   const teacherID = await AsyncStorage.getItem('id')
//   if (query === 'rental') {
//     axiosInstance.post('/RoomRental/AcceptorButton', { studentID: studentID, teacherID: teacherID, buttonType: 'decline', methodName: 'rentalForm', query: 'rental' })
//       .then((res) => {
//         if (res.status === 200) {
//           rentalInquiry()
//         } else {
//           return Alert.alert('에러', '요청에 실패했습니다.', [
//             { text: '확인', }
//           ])
//         }
//       }).catch((error) => {
//         console.log('DeclineButton API | ', error)
//         return Alert.alert('에러', '서버와 연결할 수 없습니다.', [
//           { text: '확인', }
//         ])
//       })
//   } else if (query === 'return') {
//     axiosInstance.post('/RoomRental/AcceptorButton', { studentID: studentID, teacherID: teacherID, buttonType: 'decline', methodName: 'rentalReturn', query: 'rental' })
//       .then((res) => {
//         if (res.status === 200) {
//           rentalInquiry()
//         } else {
//           return Alert.alert('에러', '요청에 실패했습니다.', [
//             { text: '확인', }
//           ])
//         }
//       }).catch((error) => {
//         console.log('DeclineButton API | ', error)
//         return Alert.alert('에러', '서버와 연결할 수 없습니다.', [
//           { text: '확인', }
//         ])
//       })
//   }
// }