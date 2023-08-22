import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl, ScrollView, View, Text, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Entypo from 'react-native-vector-icons/Entypo';

import axiosInstance from '../../api/API_Server';

const daysOfWeek = ['월', '화', '수', '목', '금']
const times = ['1교시', '2교시', '3교시', '4교시', '5교시', '6교시', '7교시', '8교시']

export default function StudentHomeScreen({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'

  const [startMessage, setStartMessage] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const [roomStateType, setRoomStateType] = useState(null)
  const [roomStateMessage, setRoomStateMessage] = useState(null)
  const [roomNumber, setRoomNumber] = useState(null)
  const [roomAcceptor, setRoomAcceptor] = useState(null)
  const [roomStartTime, setRoomStartTime] = useState(null)
  const [roomEndTime, setRoomEndTime] = useState(null)

  const [mealStateType, setMealStateType] = useState(null)
  const [mealNowScreen, setMealNowScreen] = useState(1)
  const [mealTitle, setMealTitle] = useState('급식')
  const [mealMessage, setMealMessage] = useState(null)
  const [mealBreakfast, setMealBreakfast] = useState(null)
  const [mealLunch, setMealLunch] = useState(null)
  const [mealDinner, setMealDinner] = useState(null)

  const [timetableStateType, setTimetableStateType] = useState(null)
  const [timetableData, setTimetableData] = useState(null)
  const [timetableMessage, setTimetableMessage] = useState(null)

  const [busArrivalInformationIsRefreshing, setBusArrivalInformationIsRefreshing] = useState(false)
  const [busArrivalInformationTitle, setBusArrivalInformationTitle] = useState('버스')
  const [busArrivalInformationMessage, setBusArrivalInformationMessage] = useState(null)
  const [busArrivalInformationData, setBusArrivalInformationData] = useState([])
  const [busArrivalInformationType, setBusArrivalInformationType] = useState(null)

  const handleRefresh = () => {
    setRefreshing(true)

    rentalRefresh()
    mealRefresh()
    timetableRefresh()
    getBusStopID()

    setRefreshing(false)
  }

  const rentalRefresh = async () => {
    setRoomStateType(null) // 'Type'을 'null'로 설정하여 '로딩중...'을 표시
    AsyncStorage.getItem('id') // 'ID' 가져오기
      .then(async (ID) => {
        axiosInstance.post('/RoomRental/CheckUserStatus', { id: ID }) // '/CheckUserStatus'에 'ID'값을 넣어 API요청
          .then((res) => {
            //console.log(res.data)
            if (res.status === 200) { // 'status'가 '200'이면
              if (res.data.type === 3) { // 'Type'이 '3'이면 데이터를 순차적으로 저장
                setRoomStateType(res.data.type) // 'Type'을 '3'으로 설정
                setRoomNumber(res.data.room_number)
                setRoomStartTime(res.data.start_time)
                setRoomEndTime(res.data.end_time)
                setRoomAcceptor(res.data.acceptor)
              } else if (res.data.type === 4 || res.data.type === 2 || res.data.type === 1) { // 'Type'이 '1' 또는 '2'이면
                setRoomStateType(res.data.type) // 'Type'을 'data.type'에서 받아온 값으로 설정
                setRoomStateMessage(res.data.message) // 'Message'를 'data.message'에서 받아온 값으로 설정
              }
            } else { // 예외가 발생하면
              setRoomStateType(0) // 'Type'을 '0'으로 설정
              setRoomStateMessage('예외가 발생했습니다.\n나중에 다시 시도해 주세요.')
            }
          }).catch((error) => {
            console.log('CheckUserStatus API | ', error)
            setRoomStateType(0) // 'Type'을 '0'으로 설정
            setRoomStateMessage('오류가 발생했습니다.\n나중에 다시 시도해 주세요.') // 'Message'를 'error.message'로 설정
          })
      }).catch((error) => {
        setRoomStateType(0) // 'Type'을 '0'으로 설정
        setRoomStateMessage('오류가 발생했습니다.\n나중에 다시 시도해 주세요.') // 'Message'를 'error.message'로 설정
      })
  }

  const rentalCancel = async () => {
    AsyncStorage.getItem('id') // 'ID' 가져오기
      .then(async (ID) => {
        axiosInstance.post('/RoomRental/RentalCancel', { id: ID }) // '/RentalCancel'에 'ID'값을 넣어 API요청
          .then((res) => {
            if (res.status === 200) { // 'status'가 '200'이면
              Alert.alert('부스 대여', res.data.message) // 'data.message' 메세지 표시
              rentalRefresh() // 정보를 새로고침
            } else {
              setRoomStateType(0) // 'Type'을 '0'으로 설정
              setRoomStateMessage('예외가 발생했습니다.\n나중에 다시 시도해 주세요.')
            }
          }).catch((error) => { // 에러가 발생하면
            console.log(error)
            return Alert.alert('에러', '요청에 실패했습니다.', [
              {
                text: '다시시도',
                onPress: () => {
                  rentalCancel()
                },
              },
              {
                text: '확인',
              }
            ])
          })
      }).catch((error) => { // 에러가 발생하면
        console.log('RentalCancel API | ', error)
        return Alert.alert('에러', '요청에 실패했습니다.', [
          {
            text: '다시시도',
            onPress: () => {
              rentalCancel()
            },
          },
          {
            text: '확인',
          }
        ])
      })
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

  const timetableRefresh = async () => {
    setTimetableStateType(null)
    const ID = await AsyncStorage.getItem('id')
    const JOB = await AsyncStorage.getItem('job')
    await axiosInstance.post('/profile', { id: ID, job: JOB })
      .then((res) => {
        if (res.status === 200) {
          axiosInstance.post('/timeTable', { GRADE: res.data.studentID[0], CLASS_NM: res.data.studentID[2], })
            .then((res) => {
              setTimetableData(res.data.data)
              setTimetableStateType(1)
            }).catch((error) => {
              console.log(error)
              setTimetableStateType(2)
              setTimetableMessage('오류가 발생했습니다.\n나중에 다시 시도해 주세요.')
            })
        } else {
          setTimetableStateType(2)
          setTimetableMessage('오류가 발생했습니다.\n나중에 다시 시도해 주세요.')
        }
      }).catch((error) => {
        console.log(error)
        setTimetableStateType(2)
        setTimetableMessage('오류가 발생했습니다.\n나중에 다시 시도해 주세요.')
      })
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
    //const busStopID_2 = await AsyncStorage.getItem('set_busStopID_2')
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

  useEffect(() => {
    rentalRefresh() // 스크린이 처음 시작될 때 한번 실행
    mealRefresh() // 스크린이 처음 시작될 때 한번 실행
    mealNowScreenTime() // 스크린이 처음 시작될 때 한번 실행
    timetableRefresh() // 스크린이 처음 시작될 때 한번 실행
    getBusStopID()

    // const interval = setInterval(() => {
    //   // 데이터 새로고침을 수행하는 함수 호출
    //   busArrivalInformationRefresh()
    // }, 15000)

    // return () => {
    //   // 컴포넌트가 언마운트되면 인터벌 클리어
    //   clearInterval(interval)
    // }

    // messaging().onMessage(async (remoteMessage) => {
    //   console.log('Received foreground message', remoteMessage)
    //   if (remoteMessage.data && remoteMessage.data.type === '1') { // type1은 학생용
    //     if (remoteMessage.data.name === 'RentalForm') {
    //       return Alert.alert(`${remoteMessage.notification?.title}`, `${remoteMessage.notification?.body}`,[
    //         {
    //           text: '확인',
    //           onPress: () => {
    //             navigation.reset({
    //               index: 0,
    //               routes: [{ name: 'S_Home' }], // 현재 스크린의 이름을 여기에 입력해야 합니다.
    //             })
    //           }
    //         }
    //       ])
    //     }
    //     if (remoteMessage.data.name === 'RentalReturn') {
    //       return Alert.alert(`${remoteMessage.notification?.title}`, `${remoteMessage.notification?.body}`,[
    //         {
    //           text: '확인',
    //           onPress: () => {
    //             navigation.reset({
    //               index: 0,
    //               routes: [{ name: 'S_Home' }], // 현재 스크린의 이름을 여기에 입력해야 합니다.
    //             })
    //           }
    //         }
    //       ])
    //     }
    //   }
    // })
  }, [])

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#FFFFFF', }, isDarkMode && { ...styles.container, backgroundColor: '#000000', }]}>
      {/* 로고 */}
      <View style={styles.logoView}>
        <Text style={[{ ...styles.logo, color: '#000000', }, isDarkMode && { ...styles.logo, color: '#ffffff', }]}>홈</Text>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />} contentContainerStyle={[{ ...styles.scrollContainer, backgroundColor: '#FFFFFF', }, isDarkMode && { ...styles.scrollContainer, backgroundColor: '#000000', }]}>
        {/* 방음부스 */}
        <View style={[{ ...styles.Info, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
          <Text style={[{ ...styles.Title, color: '#000000' }, isDarkMode && { ...styles.Title, color: '#FFFFFF' }]}>방음부스</Text>
          {roomStateType === null &&
            <ActivityIndicator style={{ marginTop: 15 }} size="large" color="#0000ff" />
          }
          {roomStateType === 0 || roomStateType === 4 &&
            <View>
              <Text style={[{ ...rentalStyles.Text, color: '#000000', marginBottom: -30 }, isDarkMode && { ...rentalStyles.Text, color: '#ffffff', marginBottom: -30 }]}>{roomStateMessage}</Text>
            </View>
          }
          {roomStateType === 1 &&
            <View>
              <Text style={[{ ...rentalStyles.Text, color: '#000000', }, isDarkMode && { ...rentalStyles.Text, color: '#ffffff', }]}>{roomStateMessage}</Text>
              <TouchableOpacity style={rentalStyles.rentalBtn} onPress={() => navigation.navigate('S_RoomRental')}>
                <Text style={rentalStyles.rentalBtnText}>대여하기</Text>
              </TouchableOpacity>
            </View>
          }
          {roomStateType === 2 &&
            <View>
              <Text style={[{ ...rentalStyles.Text, color: '#000000', }, isDarkMode && { ...rentalStyles.Text, color: '#ffffff', }]}>{roomStateMessage}</Text>
              <TouchableOpacity style={rentalStyles.rentalBtn} onPress={rentalCancel}>
                <Text style={rentalStyles.rentalBtnText}>취소하기</Text>
              </TouchableOpacity>
            </View>
          }
          {roomStateType === 3 &&
            <View>
              <View style={{ marginTop: 10, marginBottom: 50, marginLeft: 20 }}>
                <View style={rentalStyles.Item}>
                  <Text style={[{ ...rentalStyles.Label, color: '#000000' }, isDarkMode && { ...rentalStyles.Label, color: '#ffffff' }]}>방번호</Text>
                  <Text style={[{ ...rentalStyles.Value, color: '#000000' }, isDarkMode && { ...rentalStyles.Value, color: '#ffffff' }]}>{roomNumber}</Text>
                </View>

                <View style={rentalStyles.Item}>
                  <Text style={[{ ...rentalStyles.Label, color: '#000000' }, isDarkMode && { ...rentalStyles.Label, color: '#ffffff' }]}>시작 시간</Text>
                  <Text style={[{ ...rentalStyles.Value, color: '#000000' }, isDarkMode && { ...rentalStyles.Value, color: '#ffffff' }]}>{roomStartTime}</Text>
                </View>

                <View style={rentalStyles.Item}>
                  <Text style={[{ ...rentalStyles.Label, color: '#000000' }, isDarkMode && { ...rentalStyles.Label, color: '#ffffff' }]}>종료 시간</Text>
                  <Text style={[{ ...rentalStyles.Value, color: '#000000' }, isDarkMode && { ...rentalStyles.Value, color: '#ffffff' }]}>{roomEndTime}</Text>
                </View>

                <View style={rentalStyles.Item}>
                  <Text style={[{ ...rentalStyles.Label, color: '#000000' }, isDarkMode && { ...rentalStyles.Label, color: '#ffffff' }]}>승인자</Text>
                  <Text style={[{ ...rentalStyles.Value, color: '#000000' }, isDarkMode && { ...rentalStyles.Value, color: '#ffffff' }]}>{roomAcceptor}</Text>
                </View>
              </View>

              <TouchableOpacity style={rentalStyles.rentalBtn} onPress={() => navigation.navigate('S_RoomCancel')}>
                <Text style={rentalStyles.rentalBtnText}>사용 종료하기</Text>
              </TouchableOpacity>
            </View>
          }
        </View>

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
        <View style={[{ ...styles.Info, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
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
        </View>

        {/* 시간표 */}
        <View style={[{ ...styles.Info, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
          <Text style={[{ ...styles.Title, color: '#000000' }, isDarkMode && { ...styles.Title, color: '#ffffff' }]}>시간표</Text>
          <View style={{ marginBottom: 20, }}></View>
          {timetableStateType === null ?
            <ActivityIndicator style={{ marginTop: -5 }} size="large" color="#0000ff" />
            :
            <>
              {timetableStateType === 1 &&
                <View style={timetableStyles.table}>
                  {/* 테이블 헤더 */}
                  <View style={timetableStyles.headerRow}>
                    <View style={timetableStyles.emptyCell} />
                    {/* 요일별 헤더 셀 */}
                    {daysOfWeek.map((day, index) => (
                      <View key={index} style={timetableStyles.headerCell}>
                        <Text style={timetableStyles.headerText}>{day}</Text>
                      </View>
                    ))}
                  </View>

                  {/* 시간표 내용 */}
                  {times.map((time, timeIndex) => (
                    <View key={timeIndex} style={timetableStyles.row}>
                      {/* 시간 표시 셀 */}
                      <View style={timetableStyles.timeCell}>
                        <Text style={timetableStyles.timeText}>{time}</Text>
                      </View>

                      {/* 각 요일별 셀 */}
                      {daysOfWeek.map((day, dayIndex) => (
                        <View key={dayIndex} style={timetableStyles.cell}>
                          {/* 해당 시간과 요일에 해당하는 데이터 출력 */}
                          {timetableData[dayIndex]?.data.map((rowData, rowIndex) => {
                            if (rowData.time === time) {
                              return (
                                <View key={rowIndex}>
                                  <Text style={[{ ...timetableStyles.subjectText, color: '#000000', }, isDarkMode && { ...timetableStyles.subjectText, color: '#ffffff', }]}>{rowData.subject}</Text>
                                  <Text style={timetableStyles.instructorText}>{rowData.instructor}</Text>
                                </View>
                              )
                            } else {
                              return null
                            }
                          })}
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              }
              {timetableStateType === 2 &&
                <Text style={[{ ...timetableStyles.Text, color: '#000000' }, isDarkMode && { ...timetableStyles.Text, color: '#ffffff' }]}>{timetableMessage}</Text>
              }
            </>
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

const rentalStyles = StyleSheet.create({
  Text: {
    padding: 30,
    paddingBottom: 65,
    textAlign: 'center',
  },
  rentalBtn: {
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
  rentalBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  Item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  Label: {
    fontWeight: 'bold',
    width: 80,
    marginRight: 3,
  },
  Value: {
    flex: 1,
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

const timetableStyles = StyleSheet.create({
  Text: {
    padding: 30,
    paddingBottom: 65,
    textAlign: 'center',
  },
  table: {
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#000000',
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000000',
  },
  row: {
    flexDirection: 'row',
  },
  emptyCell: {
    width: 55,
    borderWidth: 1,
    borderColor: '#000000',
    padding: 10,
    backgroundColor: '#F0F0F0',
  },
  headerCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
    padding: 10,
    backgroundColor: '#F0F0F0',
  },
  timeCell: {
    width: 55,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
    padding: 10,
    backgroundColor: '#F0F0F0',
  },
  cell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
    padding: 5,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#000000',
  },
  timeText: {
    fontWeight: 'bold',
    fontSize: 10,
    color: '#000000',
  },
  subjectText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  instructorText: {
    fontSize: 9,
    textAlign: 'center',
    color: '#666666',
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