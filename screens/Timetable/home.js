import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl, ScrollView, View, Text, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Entypo from 'react-native-vector-icons/Entypo';

import axiosInstance from '../../api/API_Server';
import { MoveScreen } from '../../api/MoveScreen';

const daysOfWeek = ['월', '화', '수', '목', '금']
const times = ['1교시', '2교시', '3교시', '4교시', '5교시', '6교시', '7교시', '8교시']

export default function TimetableHomeScreen({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'

  const [startMessage, setStartMessage] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const [timetableStateType, setTimetableStateType] = useState(null)
  const [timetableData, setTimetableData] = useState(null)
  const [timetableMessage, setTimetableMessage] = useState(null)

  const handleRefresh = () => {
    setRefreshing(true)

    timetableRefresh()

    setRefreshing(false)
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

  useEffect(() => {
    timetableRefresh() // 스크린이 처음 시작될 때 한번 실행
  }, [])

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#FFFFFF', }, isDarkMode && { ...styles.container, backgroundColor: '#000000', }]}>
      {/* 로고 */}
      <View style={styles.logoView}>
        <Text style={[{ ...styles.logo, color: '#000000', }, isDarkMode && { ...styles.logo, color: '#ffffff', }]}>시간표</Text>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />} contentContainerStyle={[{ ...styles.scrollContainer, backgroundColor: '#FFFFFF', }, isDarkMode && { ...styles.scrollContainer, backgroundColor: '#000000', }]}>
        {/* 시간표 */}
        <View style={[{ ...styles.Info, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
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