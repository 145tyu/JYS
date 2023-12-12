import React, { useEffect, useState } from "react";
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal, KeyboardAvoidingView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

import axiosInstance from "../../api/API_Server";

const SelectStudentIDModal = ({ type, _grade, _class, _number, setGrade, setClass, setNumber, isDarkMode, visible, onClose }) => {
  if (type === 'grade') {
    return (
      <Modal animationType='slide' transparent={true} visible={visible} onRequestClose={() => onClose()}>
        <View style={SelectStudentIDModalStyles.container}>
          <View style={{ ...SelectStudentIDModalStyles.boxContainer, backgroundColor: isDarkMode ? '#121212' : '#f2f4f6', }}>
            <Picker
              style={{ color: isDarkMode ? '#ffffff' : '#000000', }}
              selectedValue={_grade}
              onValueChange={(value) => {
                setGrade(value)
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
          <View style={{ ...SelectStudentIDModalStyles.boxContainer, backgroundColor: isDarkMode ? '#121212' : '#f2f4f6', }}>
            <Picker
              style={{ color: isDarkMode ? '#ffffff' : '#000000' }}
              selectedValue={_class}
              onValueChange={(value) => {
                setClass(value)
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
  } else if (type === 'number') {
    return (
      <Modal animationType='slide' transparent={true} visible={visible} onRequestClose={() => onClose()}>
        <View style={SelectStudentIDModalStyles.container}>
          <View style={{ ...SelectStudentIDModalStyles.boxContainer, backgroundColor: isDarkMode ? '#121212' : '#f2f4f6', }}>
            <Picker
              style={{ color: isDarkMode ? '#ffffff' : '#000000' }}
              selectedValue={_number}
              onValueChange={(value) => {
                setNumber(value)
                onClose()
              }}
            >
              <Picker.Item label='번호 선택' enabled={false} />
              <Picker.Item label="1번" value="01" />
              <Picker.Item label="2번" value="02" />
              <Picker.Item label="3번" value="03" />
              <Picker.Item label="4번" value="04" />
              <Picker.Item label="5번" value="05" />
              <Picker.Item label="6번" value="06" />
              <Picker.Item label="7번" value="07" />
              <Picker.Item label="8번" value="08" />
              <Picker.Item label="9번" value="09" />
              <Picker.Item label="10번" value="10" />
              <Picker.Item label="11번" value="11" />
              <Picker.Item label="12번" value="12" />
              <Picker.Item label="13번" value="13" />
              <Picker.Item label="14번" value="14" />
              <Picker.Item label="15번" value="15" />
              <Picker.Item label="16번" value="16" />
              <Picker.Item label="17번" value="17" />
              <Picker.Item label="18번" value="18" />
              <Picker.Item label="19번" value="19" />
              <Picker.Item label="20번" value="20" />
              <Picker.Item label="21번" value="21" />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxContainer: {
    width: 300,
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

export default function EditStudentID({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'
  const [isLoading, setIsLoading] = useState(false)

  const [oldPassword, setOldPassword] = useState('')

  const [_grade, setGrade] = useState(null)
  const [_class, setClass] = useState(null)
  const [_number, setNumber] = useState(null)
  const [SelectType, setSelectType] = useState('')

  const openModal = (type) => {
    if (type === 'grade') {
      setSelectType('grade')
    } else if (type === 'class') {
      setSelectType('class')
    } else if (type === 'number') {
      setSelectType('number')
    }
  }

  const closeModal = () => {
    setSelectType('')
  }

  const handleEditProfile = async () => {
    if (oldPassword === '') {
      Toast.show({
        type: 'error',
        text1: '현재 비밀번호를 입력해주세요.',
      })
    } else if (_grade === null || _class === null || _number === null) {
      Toast.show({
        type: 'error',
        text1: '학교 정보를 모두 기입해주세요.',
      })
    } else {
      setIsLoading(true)
      try {
        const ID = await AsyncStorage.getItem('id')
        const JOB = await AsyncStorage.getItem('job')
        await axiosInstance.post('/v2/profile', { id: ID, job: JOB, methodName: 'edit', data: { oldPassword: oldPassword, _grade: _grade, _class: _class, _number: _number, } })
          .then((res) => {
            setIsLoading(false)
            if (res.status === 200) {
              Toast.show({
                type: 'success',
                text1: `${res.data.message}`,
              })
              navigation.goBack()
            } else {
              Toast.show({
                type: 'error',
                text1: '학번을 변경하지 못했어요.',
                text2: '다시 시도해 주세요.',
              })
            }
          }).catch((error) => {
            setIsLoading(false)
            if (error.response) {
              const res = error.response
              if (res.status === 400) {
                Toast.show({
                  type: 'error',
                  text1: `${res.data.errorDescription}`,
                  text2: `${res.data.error}`,
                })
              } else if (res.status === 500) {
                Toast.show({
                  type: 'error',
                  text1: `${res.data.errorDescription}`,
                  text2: `${res.data.error}`,
                })
              } else {
                Toast.show({
                  type: 'error',
                  text1: '서버와 연결할 수 없습니다.',
                  text2: '다시 시도해 주세요.',
                })
              }
            } else {
              Toast.show({
                type: 'error',
                text1: '서버와 연결할 수 없습니다.',
                text2: `${error}`,
              })
            }
          })
      } catch (error) {
        setIsLoading(false)
        Toast.show({
          type: 'error',
          text1: '학번을 변경하지 못했어요.',
          text2: `${error}`,
        })
      }
    }
  }

  return (
    <SafeAreaView style={{ ...styles.container, backgroundColor: isDarkMode ? '#000000' : '#ffffff', }}>
      {/* 정보 선택 모달 */}
      <SelectStudentIDModal type={SelectType} _grade={_grade} _class={_class} _number={_number} setGrade={setGrade} setClass={setClass} setNumber={setNumber} isDarkMode={isDarkMode} onClose={() => { closeModal() }} />
      <KeyboardAvoidingView style={{ flex: 1, }} behavior={Platform.select({ ios: 'padding' })}>
        {/* 로고 */}
        <View style={styles.logoView}>
          <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 10 } : { ...styles.backButtonView, }} onPress={() => navigation.goBack()}>
            <Text style={{ ...styles.logoText, color: isDarkMode ? '#ffffff' : '#000000', }}>
              {<Icon_Ionicons name="chevron-back-outline" size={21} />} 학번 변경
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1, }}>
          <Text style={{ marginTop: 15, color: isDarkMode ? '#999999' : '#666666', marginLeft: 20, marginBottom: 7, }}>현재 비밀번호</Text>
          <View style={{ justifyContent: 'center', alignItems: 'center', }}>
            <View style={{ ...styles.inputView, borderColor: isDarkMode ? '#333333' : '#E9E9E9', backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
              <TextInput
                style={{ ...styles.inputText, color: isDarkMode ? '#ffffff' : '#000000', }}
                placeholder='비밀번호'
                placeholderTextColor={isDarkMode ? '#CCCCCC' : '#999999'}
                value={oldPassword}
                secureTextEntry={true}
                editable={true}
                onChangeText={(text) => setOldPassword(text)}
              />
            </View>
          </View>

          <Text style={{ marginTop: 10, color: isDarkMode ? '#999999' : '#666666', marginLeft: 20, marginBottom: 7, }}>새로운 학번</Text>
          <View style={{ justifyContent: 'center', alignItems: 'center', }}>
            <TouchableOpacity onPress={() => openModal('grade')} style={{ ...styles.inputView, borderColor: isDarkMode ? '#333333' : '#E9E9E9', backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
              <Text style={[{ color: '#000000' }, isDarkMode && { color: '#ffffff' }]}>
                {_grade != null ?
                  <>{_grade}학년</>
                  :
                  <>학년</>
                }
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center', }}>
            <TouchableOpacity onPress={() => openModal('class')} style={{ ...styles.inputView, borderColor: isDarkMode ? '#333333' : '#E9E9E9', backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
              <Text style={[{ color: '#000000' }, isDarkMode && { color: '#ffffff' }]}>
                {_class != null ?
                  <>{_class}반</>
                  :
                  <>반</>
                }
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center', }}>
            <TouchableOpacity onPress={() => openModal('number')} style={{ ...styles.inputView, borderColor: isDarkMode ? '#333333' : '#E9E9E9', backgroundColor: isDarkMode ? '#333333' : '#E9E9E9', }}>
              <Text style={[{ color: '#000000' }, isDarkMode && { color: '#ffffff' }]}>
                {_number != null ?
                  <>{_number}번</>
                  :
                  <>번호</>
                }
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginBottom: 100, }}></View>
        </ScrollView>

        {/* 요청 */}
        <TouchableOpacity style={styles.checkBtnContainer} onPress={handleEditProfile}>
          {isLoading === false ?
            <Text style={styles.checkBtnText}>{<Icon_Feather name="check" size={17} />} 확인</Text>
            :
            <ActivityIndicator size="small" color="white" />
          }
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView >
  )
}

function validatePhoneNumber(phoneNumber) {
  const pattern = /^010-\d{4}-\d{4}$/
  return pattern.test(phoneNumber)
}

function isPasswordLengthValid(password) {
  return password.length >= 8
}

function isPasswordComplex(password) {
  const Lower = /[a-z]/.test(password)
  const Digit = /[0-9]/.test(password)
  const Special = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/\-=|]/.test(password)

  return Lower && Digit && Special
}

function isCommonPassword(password) {
  const commonPasswords = ['password', '123456', 'qwerty', 'abc123'] // 일반적인 비밀번호 목록

  return commonPasswords.includes(password)
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    marginTop: 20,
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
    top: 20,
    left: 10,
  },
  inputView: {
    width: '95%',
    height: 50,
    padding: 13,
    borderWidth: 2,
    borderRadius: 10,
    justifyContent: 'center',
  },
  inputText: {
    height: 50,
    color: '#000000',
  },
  checkBtnContainer: {
    backgroundColor: '#1E00D3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 0,
    marginBottom: 20,
  },
  checkBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 15,
  },
})