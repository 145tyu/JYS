import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl, ScrollView, View, Text, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import FastImage from 'react-native-fast-image';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Entypo from 'react-native-vector-icons/Entypo';

import axiosInstance from '../../api/API_Server';
import { MoveScreen } from '../../api/MoveScreen';
import { useIsFocused } from '@react-navigation/native';

const daysOfWeek = ['월', '화', '수', '목', '금']
const times = ['1교시', '2교시', '3교시', '4교시', '5교시', '6교시', '7교시', '8교시']

const SelectStudentIDModal = ({ handleFriendTimetable, type, FriendGrade, FriendClass, setFriendGrade, setFriendClass, isDarkMode, visible, onClose }) => {
  if (type === 'grade') {
    return (
      <Modal animationType='slide' transparent={true} visible={visible} onRequestClose={() => onClose()}>
        <View style={SelectStudentIDModalStyles.container}>
          <View style={[{ ...SelectStudentIDModalStyles.boxContainer, backgroundColor: '#f2f4f6' }, isDarkMode && { ...SelectStudentIDModalStyles.boxContainer, backgroundColor: '#121212' }]}>
            <Picker
              style={{ color: isDarkMode ? '#ffffff' : '#000000' }}
              selectedValue={FriendGrade}
              onValueChange={(value) => {
                setFriendGrade(value)
                handleFriendTimetable(value, FriendClass)
                onClose()
              }}
            >
              <Picker.Item label='학년 선택' enabled={false} />
              <Picker.Item label="1학년" value="1" />
              <Picker.Item label="2학년" value="2" />
              <Picker.Item label="3학년" value="3" />
            </Picker>
            <View style={{ justifyContent: 'center', alignItems: 'center', }}>
              <TouchableOpacity style={SelectStudentIDModalStyles.btn} onPress={() => onClose()}>
                <Text style={SelectStudentIDModalStyles.btnText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  } else if (type === 'class') {
    return (
      <Modal animationType='slide' transparent={true} visible={visible} onRequestClose={() => onClose()}>
        <View style={SelectStudentIDModalStyles.container}>
          <View style={[{ ...SelectStudentIDModalStyles.boxContainer, backgroundColor: '#f2f4f6' }, isDarkMode && { ...SelectStudentIDModalStyles.boxContainer, backgroundColor: '#121212' }]}>
            <Picker
              style={{ color: isDarkMode ? '#ffffff' : '#000000' }}
              selectedValue={FriendClass}
              onValueChange={(value) => {
                setFriendClass(value)
                handleFriendTimetable(FriendGrade, value)
                onClose()
              }}
            >
              <Picker.Item label='반 선택' enabled={false} />
              <Picker.Item label="1반" value="01" />
              <Picker.Item label="2반" value="02" />
              <Picker.Item label="3반" value="03" />
              <Picker.Item label="4반" value="04" />
              <Picker.Item label="5반" value="05" />
              <Picker.Item label="6반" value="06" />
              <Picker.Item label="7반" value="07" />
              <Picker.Item label="8반" value="08" />
            </Picker>
            <View style={{ justifyContent: 'center', alignItems: 'center', }}>
              <TouchableOpacity style={SelectStudentIDModalStyles.btn} onPress={() => onClose()}>
                <Text style={SelectStudentIDModalStyles.btnText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  }
}

const SelectStudentIDModalStyles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 20,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  boxContainer: {
    width: '95%',
    height: 'auto',
    padding: 15,
    borderRadius: 15,
  },
  boxText: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
  },
  boxFooter: {
    marginTop: 5,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '400',
  },
  btn: {
    width: 100,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#EB4E45',
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '400',
    alignContent: 'center',
    alignItems: 'center',
  }
})

export default function TimetableHomeScreen({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'
  const isFocused = useIsFocused()

  const [refreshing, setRefreshing] = useState(false)

  const [MyTimetableStateType, setMyTimetableStateType] = useState(null)
  const [MyTimetableData, setMyTimetableData] = useState(null)
  const [MyTimetableMessage, setMyTimetableMessage] = useState(null)

  const [FriendTimetableStateType, setFriendTimetableStateType] = useState(null)
  const [FriendTimetableData, setFriendTimetableData] = useState(null)
  const [FriendTimetableMessage, setFriendTimetableMessage] = useState(null)

  const [MyGrade, setMyGrade] = useState(null)
  const [MyClass, setMyClass] = useState(null)

  const [SelectType, setSelectType] = useState('')
  const [FriendGrade, setFriendGrade] = useState(null)
  const [FriendClass, setFriendClass] = useState(null)

  const handleRefresh = () => {
    setRefreshing(true)

    MytimetableRefresh()
    handleFriendTimetable()

    setRefreshing(false)
  }

  const MytimetableRefresh = async () => {
    setMyTimetableStateType(null)
    setMyGrade(null)
    setMyClass(null)
    const ID = await AsyncStorage.getItem('id')
    const JOB = await AsyncStorage.getItem('job')
    await axiosInstance.post('/profile', { id: ID, job: JOB })
      .then((res) => {
        if (res.status === 200) {
          setMyGrade(res.data.studentID[0])
          setMyClass(res.data.studentID[2])
          axiosInstance.post('/timeTable', { GRADE: res.data.studentID[0], CLASS_NM: res.data.studentID[2], })
            .then((res) => {
              setMyTimetableData(res.data.data)
              setMyTimetableStateType(1)
            }).catch((error) => {
              console.log(error)
              setMyTimetableStateType(0)
              setMyTimetableMessage('오류가 발생했습니다.\n나중에 다시 시도해 주세요.')
            })
        } else {
          setMyTimetableStateType(0)
          setMyTimetableMessage('오류가 발생했습니다.\n나중에 다시 시도해 주세요.')
        }
      }).catch((error) => {
        console.log(error)
        setMyTimetableStateType(0)
        setMyTimetableMessage('오류가 발생했습니다.\n나중에 다시 시도해 주세요.')
      })
  }

  const handleFriendTimetable = async (feGrade, feClass) => {
    if (feGrade && feClass) {
      FriendTimetableRefresh(feGrade, feClass)
    } else if (FriendGrade, FriendClass) {
      FriendTimetableRefresh(FriendGrade, FriendClass)
    }
  }

  const FriendTimetableRefresh = async (grade, _class) => {
    setFriendTimetableStateType(null)
    await axiosInstance.post('/timeTable', { GRADE: Number(grade), CLASS_NM: Number(_class), })
      .then((res) => {
        setFriendTimetableData(res.data.data)
        setFriendTimetableStateType(1)
      }).catch((error) => {
        console.log(error)
        setFriendTimetableStateType(0)
        setFriendTimetableMessage('오류가 발생했습니다.\n나중에 다시 시도해 주세요.')
      })
  }

  const openModal = (type) => {
    if (type === 'grade') {
      setSelectType('grade')
    } else if (type === 'class') {
      setSelectType('class')
    }
  }

  const closeModal = () => {
    setSelectType('')
  }

  useEffect(() => {
    MytimetableRefresh() // 스크린이 처음 시작될 때 한번 실행
  }, [isFocused])

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#FFFFFF', }, isDarkMode && { ...styles.container, backgroundColor: '#000000', }]}>
      <SelectStudentIDModal handleFriendTimetable={handleFriendTimetable} type={SelectType} FriendGrade={FriendGrade} FriendClass={FriendClass} setFriendGrade={setFriendGrade} setFriendClass={setFriendClass} isDarkMode={isDarkMode} onClose={() => { closeModal() }} />
      {/* 로고 */}
      <View style={styles.logoView}>
        <Text style={[{ ...styles.logo, color: '#000000', }, isDarkMode && { ...styles.logo, color: '#ffffff', }]}>시간표</Text>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />} contentContainerStyle={[{ ...styles.scrollContainer, backgroundColor: '#FFFFFF', }, isDarkMode && { ...styles.scrollContainer, backgroundColor: '#000000', }]}>
        {/* 시간표 */}
        <View style={[{ ...styles.Info, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
          <Text style={[{ ...styles.Title, color: '#000000' }, isDarkMode && { ...styles.Title, color: '#FFFFFF' }]}>{MyGrade != null || MyClass != null ? `${Number(MyGrade)}학년 ${Number(MyClass)}반 시간표` : '내 시간표'}</Text>
          <View style={{ marginBottom: 20, }}></View>
          {MyTimetableStateType === null ?
            <ActivityIndicator style={{ marginTop: -5 }} size="large" color="#0000ff" />
            :
            <>
              {MyTimetableStateType === 1 &&
                <>
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
                            {MyTimetableData[dayIndex]?.data.map((rowData, rowIndex) => {
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
                </>
              }
              {MyTimetableStateType === 0 &&
                <Text style={[{ ...timetableStyles.Text, color: '#000000' }, isDarkMode && { ...timetableStyles.Text, color: '#ffffff' }]}>{MyTimetableMessage}</Text>
              }
            </>
          }
        </View>

        {/* 시간표 */}
        <View style={[{ ...styles.Info, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]}>
          <Text style={[{ ...styles.Title, color: '#000000' }, isDarkMode && { ...styles.Title, color: '#FFFFFF' }]}>{FriendGrade != null || FriendClass != null ? `${Number(FriendGrade)}학년 ${Number(FriendClass)}반 시간표` : '친구 시간표'}</Text>
          <View style={{ marginBottom: 10, }}></View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
            <TouchableOpacity onPress={() => openModal('grade')}>
              <View style={{ width: 80, height: 37, marginRight: 10, borderRadius: 10, justifyContent: 'center', backgroundColor: '#EB4E45' }}>
                <Text style={{ fontSize: 18, fontWeight: '600', textAlign: 'center', color: '#ffffff' }}>학년 : {FriendGrade}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => openModal('class')}>
              <View style={{ width: 80, height: 37, marginLeft: 10, borderRadius: 10, justifyContent: 'center', backgroundColor: '#EB4E45' }}>
                <Text style={{ fontSize: 18, fontWeight: '600', textAlign: 'center', color: '#ffffff' }}>반 : {FriendClass}</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ marginBottom: 20, }}></View>

          <>
            {FriendGrade != null && FriendClass != null &&
              <>
                {FriendTimetableStateType === null ?
                  <ActivityIndicator style={{ marginTop: -5 }} size="large" color="#0000ff" />
                  :
                  <>
                    {FriendTimetableStateType === 1 &&
                      <>
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
                                  {FriendTimetableData[dayIndex]?.data.map((rowData, rowIndex) => {
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
                      </>
                    }
                    {FriendTimetableStateType === 0 &&
                      <Text style={[{ ...timetableStyles.Text, color: '#000000' }, isDarkMode && { ...timetableStyles.Text, color: '#ffffff' }]}>{FriendTimetableMessage}</Text>
                    }
                  </>
                }
              </>
            }
          </>
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
