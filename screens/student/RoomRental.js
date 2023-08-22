import React, { useEffect, useState } from "react";
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Button, Modal } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from '@react-native-picker/picker';
import { CommonActions } from "@react-navigation/native";
import DatePicker from 'react-native-date-picker'

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';

import axiosInstance from "../../api/API_Server";
import ErrorAlert from "../../api/ErrorModal";

export default function StudentRoomRental({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'

  const [isLoading, setIsLoading] = useState(false)

  const [alert, setAlert] = useState(null)
  const [alertDescription, setAlertDescription] = useState(null)
  const [alertStatus, setAlertStatus] = useState(null)
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false)

  const [studentID, setStudentID] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const [roomNumber, setRoomNumber] = useState('')
  const [roomPurpose, setRoomPurpose] = useState('')
  const [roomStatus, setRoomStatus] = useState([])
  const [isRoomNumModalVisible, setIsRoomNumModalVisible] = useState(false)

  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false)
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false)
  const [roomUsingStartTime, setRoomUsingStartTime] = useState('')
  const [roomUsingEndTime, setRoomUsingEndTime] = useState('')

  const [strRoomUsingStartTime, setStrRoomUsingStartTime] = useState('')
  const [strRoomUsingEndTime, setStrRoomUsingEndTime] = useState('')

  const isButtonDisabled = studentID != '' && firstName != '' && lastName != '' && (roomNumber === '1' || roomNumber === '2' || roomNumber === '3' || roomNumber === '4') && roomUsingStartTime != '' && roomUsingEndTime != '' && roomPurpose != '' ? false : true

  const resetAlert = () => {
    setAlert(null) // 에러메시지 초기화
    setAlertDescription(null) // 에러메시지 초기화
    setAlertStatus(null) // 에러상태 초기화
    setIsAlertModalVisible(false) // 에러 모달 닫기
  }

  const closeErrModal = () => {
    setIsAlertModalVisible(false)
  }

  const handleRentalSumit = async () => {
    resetAlert()
    if (studentID === '' || firstName === '' || lastName === '') {
      setAlert('프로필이 동기화되지 않았습니다.')
      setAlertStatus(400)
      setIsAlertModalVisible(true) // 에러 모달 표시
    } else if (roomNumber === '' || roomNumber === '?') {
      setAlert('부스가 선택되지 않았습니다.')
      setAlertStatus(400)
      setIsAlertModalVisible(true) // 에러 모달 표시
    } else if (roomUsingStartTime === '') {
      setAlert('대여 시작시간을 선택하지 않으셨습니다.')
      setAlertStatus(400)
      setIsAlertModalVisible(true) // 에러 모달 표시
    } else if (roomUsingEndTime === '') {
      setAlert('대여 종료시간을 선택하지 않으셨습니다.')
      setAlertStatus(400)
      setIsAlertModalVisible(true) // 에러 모달 표시
    } else if (roomPurpose === '') {
      setAlert('대여 사유 작성란이 비어있습니다.')
      setAlertStatus(400)
      setIsAlertModalVisible(true) // 에러 모달 표시
    } else {
      setIsLoading(true)
      AsyncStorage.getItem('id')
        .then(async (ID) => {
          await axiosInstance.post('/RoomRental/RentalForm', {
            id: ID,
            studentID: studentID,
            firstName: firstName,
            lastName: lastName,
            roomNumber: roomNumber,
            purpose: roomPurpose,
            usingStartTime: roomUsingStartTime,
            usingEndTime: roomUsingEndTime,
          }).then((res) => {
            setIsLoading(false)
            if (res.status === 200) {
              setAlert(res.data.message)
              setAlertStatus(400)
              setIsAlertModalVisible(true) // 모달 표시
              return navigation.goBack()
            } else {
              // 에러 모달 설정
              setAlert('예외가 발생했습니다.\n나중에 다시 시도해 주세요.')
              setAlertStatus(500)
              setIsAlertModalVisible(true) // 에러 모달 표시
            }
          }).catch((error) => {
            setIsLoading(false)
            const res = error.response
            if (res.status === 400) {
              // 에러 모달 설정
              setAlert(res.data.error)
              if (res.data.errorDescription) setAlertDescription(res.data.errorDescription)
              setAlertStatus(400)
              setIsAlertModalVisible(true) // 에러 모달 표시
            } else if (res.status === 500) {
              console.log(res.data)
              // 에러 모달 설정
              setAlert('대여 요청을 실패했습니다.')
              if (res.data.errorDescription) setAlertDescription(res.data.errorDescription)
              setAlertStatus(500)
              setIsAlertModalVisible(true) // 에러 모달 표시
            } else {
              console.log('RentalForm API | ', error)
              // 에러 모달 설정
              setAlert('예외가 발생했습니다.\n나중에 다시 시도해 주세요.')
              setAlertStatus(500)
              setIsAlertModalVisible(true) // 에러 모달 표시
            }
          })
        }).catch((error) => {
          setIsLoading(false)
          console.log('RentalForm API | ', error)
          setAlert('대여 요청을 실패했습니다.\n나중에 다시 시도해 주세요.')
          setAlertStatus(500)
          setIsAlertModalVisible(true) // 에러 모달 표시
        })
    }
  }

  const handleProfile = async () => {
    try {
      const ID = await AsyncStorage.getItem('id')
      const JOB = await AsyncStorage.getItem('job')

      await axiosInstance.post('/profile', { id: ID, job: JOB })
        .then((res) => {
          if (res.status === 200) {
            setStudentID(res.data.studentID)
            setFirstName(res.data.firstName)
            setLastName(res.data.lastName)
          } else {
            return Alert.alert('동기화 오류', '프로필을 동기화할 수 없습니다.', [
              {
                text: '다시시도',
                onPress: () => {
                  handleProfile()
                },
              },
              {
                text: '확인',
              }
            ])
          }
        }).catch((error) => {
          console.log('Profile API | ', error)
          return Alert.alert('동기화 오류', '프로필을 동기화할 수 없습니다.', [
            {
              text: '다시시도',
              onPress: () => {
                handleProfile()
              },
            },
            {
              text: '확인',
            }
          ])
        })
    } catch (error) {
      console.log('Profile API | ', error)
      return Alert.alert('동기화 오류', '프로필을 동기화할 수 없습니다.', [
        {
          text: '다시시도',
          onPress: () => {
            handleProfile()
          },
        },
        {
          text: '확인',
        }
      ])
    }
  }

  const handleRoomStatus = async () => {
    setRoomStatus([])
    try {
      await axiosInstance.post('/RoomRental/RoomStatus')
        .then((res) => {
          const temp = [
            { label: '희망 부스번호', value: '?', enabled: false },
          ]

          if (res.data.room1.is_available === 1) {
            temp.push({ label: '1번 (사용 중)', value: '1', enabled: false })
          } else {
            temp.push({ label: '1번', value: '1', enabled: true })
          }
          if (res.data.room2.is_available === 1) {
            temp.push({ label: '2번 (사용 중)', value: '2', enabled: false })
          } else {
            temp.push({ label: '2번', value: '2', enabled: true })
          }
          if (res.data.room3.is_available === 1) {
            temp.push({ label: '3번 (사용 중)', value: '3', enabled: false })
          } else {
            temp.push({ label: '3번', value: '3', enabled: true })
          }
          if (res.data.room4.is_available === 1) {
            temp.push({ label: '4번 (사용 중)', value: '4', enabled: false })
          } else {
            temp.push({ label: '4번', value: '4', enabled: true })
          }
          setRoomStatus(temp)
        }).catch((error) => {
          console.log('RoomStatus API | ', error)
          return Alert.alert('동기화 오류', '부스를 동기화할 수 없습니다.', [
            {
              text: '다시시도',
              onPress: () => {
                handleRoomStatus()
              },
            },
            {
              text: '확인',
            }
          ])
        })
    } catch (error) {
      console.log('RoomStatus API | ', error)
      return Alert.alert('동기화 오류', '부스를 동기화할 수 없습니다.', [
        {
          text: '다시시도',
          onPress: () => {
            handleRoomStatus()
          },
        },
        {
          text: '확인',
        }
      ])
    }
  }

  const showStartTimePicker = () => {
    setStartTimePickerVisibility(true)
  }

  const showEndTimePicker = () => {
    setEndTimePickerVisibility(true)
  }

  const hideStartTimePicker = () => {
    setStartTimePickerVisibility(false)
  }

  const hideEndTimePicker = () => {
    setEndTimePickerVisibility(false)
  }

  const handleRoomUsingStartTime = (time) => {
    const dateObj = new Date(String(time))
    const year = dateObj.getFullYear()
    const month = dateObj.getMonth() + 1 // 0부터 시작하므로 +1 처리 필요
    const date = dateObj.getDate()
    const hours = String(dateObj.getHours()).length === 1 ? '0' + String(dateObj.getHours()) : String(dateObj.getHours())
    const minutes = String(dateObj.getMinutes()).length === 1 ? '0' + String(dateObj.getMinutes()) : String(dateObj.getMinutes())
    setRoomUsingStartTime(`${hours}시 ${minutes}분`)
    setStrRoomUsingStartTime(`오늘 ${hours}시 ${minutes}분`)
  }

  const handleRoomUsingEndTime = (time) => {
    const dateObj = new Date(String(time))
    const year = dateObj.getFullYear()
    const month = dateObj.getMonth() + 1 // 0부터 시작하므로 +1 처리 필요
    const date = dateObj.getDate()
    const hours = String(dateObj.getHours()).length === 1 ? '0' + String(dateObj.getHours()) : String(dateObj.getHours())
    const minutes = String(dateObj.getMinutes()).length === 1 ? '0' + String(dateObj.getMinutes()) : String(dateObj.getMinutes())
    setRoomUsingEndTime(`${hours}시 ${minutes}분`)
    setStrRoomUsingEndTime(`오늘 ${hours}시 ${minutes}분`)
  }

  const openRoomNumModal = () => {
    setIsRoomNumModalVisible(true)
  }

  const closeRoomNumModal = () => {
    setIsRoomNumModalVisible(false)
  }

  useEffect(() => {
    handleProfile() // 스크린이 처음 시작될 때 한번 실행
    handleRoomStatus()
  }, [])

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <ErrorAlert error={alert} errorDescription={alertDescription} status={alertStatus} isDarkMode={isDarkMode} visible={isAlertModalVisible} onComponent={handleRentalSumit} onClose={closeErrModal} />

      {/* 로고 */}
      <View style={styles.logoView} >
        <TouchableOpacity style={styles.backButtonView} onPress={() => navigation.goBack()}>
          <Icon_Ionicons name='arrow-back-outline' size={30} style={[styles.backButtonIcon, isDarkMode && styles.backButtonIconDark]} />
        </TouchableOpacity>
        <Text style={[styles.logoText, isDarkMode && styles.logoTextDark]}>대여 신청</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContainer, isDarkMode && styles.scrollContainerDark]}>
        <View style={[rentalStyles.Info, isDarkMode && rentalStyles.InfoDark]}>
          {/* 계정ID */}
          <>
            <View>
              <Text style={[rentalStyles.Title, isDarkMode && rentalStyles.TitleDark]}>학번</Text>
              <TextInput
                style={rentalStyles.Value}
                placeholder="학번 예) 30101"
                keyboardType="numeric"
                onChangeText={setStudentID}
                value={studentID}
                editable={false}
              />
            </View>

            <View style={rentalStyles.rankView}></View>

            <View>
              <Text style={[rentalStyles.Title, isDarkMode && rentalStyles.TitleDark]}>이름</Text>
              <TextInput
                style={rentalStyles.Value}
                placeholder="이름"
                value={firstName + lastName}
                editable={false}
              />
            </View>

            <View style={rentalStyles.rankView}></View>

            <View>
              <Text style={[rentalStyles.Title, isDarkMode && rentalStyles.TitleDark]}>시작 시간</Text>
              <TouchableOpacity onPress={showStartTimePicker}>
                <TextInput
                  pointerEvents="none"
                  style={rentalStyles.Value}
                  placeholder="대여를 시작할 시간을 선택해주세요."
                  value={strRoomUsingStartTime}
                  editable={false}
                />
                <DatePicker
                  modal
                  open={isStartTimePickerVisible}
                  date={new Date()}
                  mode="time"
                  onConfirm={(date) => {
                    hideStartTimePicker()
                    handleRoomUsingStartTime(date)
                  }}
                  onCancel={() => {
                    hideStartTimePicker()
                  }}
                />
              </TouchableOpacity>
            </View>

            <View style={rentalStyles.rankView}></View>

            <View>
              <Text style={[rentalStyles.Title, isDarkMode && rentalStyles.TitleDark]}>종료 시간</Text>
              <TouchableOpacity onPress={showEndTimePicker}>
                <TextInput
                  pointerEvents="none"
                  style={rentalStyles.Value}
                  placeholder="대여를 종료할 시간을 선택해주세요."
                  value={strRoomUsingEndTime}
                  editable={false}
                />
                <DatePicker
                  modal
                  open={isEndTimePickerVisible}
                  date={new Date()}
                  mode="time"
                  onConfirm={(date) => {
                    hideEndTimePicker()
                    handleRoomUsingEndTime(date)
                  }}
                  onCancel={() => {
                    hideEndTimePicker()
                  }}
                />
              </TouchableOpacity>
            </View>

            <View style={rentalStyles.rankView}></View>

            <View>
              <Text style={[rentalStyles.Title, isDarkMode && rentalStyles.TitleDark]}>사용 목적</Text>
              <TextInput
                style={rentalStyles.Value}
                placeholder="사용목적을 자세히 적어주세요."
                onChangeText={setRoomPurpose}
                value={roomPurpose}
              />
            </View>

            <View style={rentalStyles.rankView}></View>

            <View>
              <Text style={[rentalStyles.Title, isDarkMode && rentalStyles.TitleDark]}>부스 선택</Text>
              <>
                {Platform.OS === 'ios' ?
                  <TouchableOpacity style={rentalStyles.Value} onPress={() => { openRoomNumModal() }}>
                    <Text style={{ textAlign: 'center', fontSize: 15, color: '#4682b4', position: 'absolute', left: 10, top: 15, }}>
                      {roomNumber === '' || roomNumber === '?' ?
                        <>선택하기</>
                        :
                        <>{roomNumber}</>
                      }
                    </Text>

                    <Modal visible={isRoomNumModalVisible} onRequestClose={closeRoomNumModal}>
                      <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Picker
                          selectedValue={roomNumber}
                          onValueChange={(value) => setRoomNumber(value)}
                        >
                          {roomStatus.map((item, index) => (
                            <Picker.Item key={index} label={item.label} value={item.value} enabled={item.enabled} />
                          ))}
                        </Picker>
                        <Button title="닫기" onPress={closeRoomNumModal} />
                      </View>
                    </Modal>
                  </TouchableOpacity>
                  :
                  <>
                    <Picker
                      style={rentalStyles.Value}
                      selectedValue={roomNumber}
                      onValueChange={(value) => setRoomNumber(value)}
                    >
                      {roomStatus.map((item, index) => (
                        <Picker.Item key={index} label={item.label} value={item.value} enabled={item.enabled} />
                      ))}
                    </Picker>
                  </>
                }
              </>
            </View>
          </>
        </View>

        <TouchableOpacity style={isButtonDisabled ? rentalStyles.sumitDisabledBtn : rentalStyles.sumitBtn} disabled={isButtonDisabled ? true : false} onPress={handleRentalSumit}>
          {isLoading === false ?
            <Text style={{ color: "white" }}>신청하기</Text>
            :
            <ActivityIndicator size="small" color="white" />
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  containerDark: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContainer: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainerDark: {
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoView: {
    height: '7%',
    marginTop: 20,
    marginBottom: 20,
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 21,
    fontWeight: 'bold',
    marginLeft: 60,
    color: 'black',
  },
  logoTextDark: {
    fontSize: 21,
    fontWeight: 'bold',
    marginLeft: 60,
    color: 'white',
  },
  backButtonView: {
    position: 'absolute',
    marginLeft: 15,
  },
  backButtonIcon: {
    color: 'black',
  },
  backButtonIconDark: {
    color: 'white',
  }
})

const rentalStyles = StyleSheet.create({
  Info: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
    position: 'relative'
  },
  InfoDark: {
    backgroundColor: '#121212', // 다크모드에서의 배경색상
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
    position: 'relative',
  },
  Title: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '400',
    marginLeft: 5,
  },
  TitleDark: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '400',
    marginLeft: 5,
  },
  Value: {
    width: "100%",
    height: 40,
    marginLeft: 2,
    color: '#4682b4',
  },
  rankView: {
    width: '100%',
    height: 1,
    marginTop: 5,
    marginBottom: 10,
    backgroundColor: 'gray',
  },
  sumitBtn: {
    width: '80%',
    backgroundColor: '#fb5b5a',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  sumitDisabledBtn: {
    width: '80%',
    backgroundColor: '#696969',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  }
})