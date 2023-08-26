import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, KeyboardAvoidingView, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Button, Image, Modal } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import { Picker } from '@react-native-picker/picker';
import FastImage from 'react-native-fast-image';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';

import axiosInstance from "../../../api/API_Server";

const SelectStudentIDModal = ({ type, _grade, _class, _number, setGrade, setClass, setNumber, isDarkMode, visible, onClose }) => {
  if (type === 'grade') {
    return (
      <Modal animationType='slide' transparent={true} visible={visible} onRequestClose={() => onClose()}>
        <View style={SelectStudentIDModalStyles.container}>
          <View style={[{ ...SelectStudentIDModalStyles.boxContainer, backgroundColor: '#f2f4f6' }, isDarkMode && { ...SelectStudentIDModalStyles.boxContainer, backgroundColor: '#121212' }]}>
            <Picker
              style={{ color: isDarkMode ? '#ffffff' : '#000000' }}
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
          <View style={[{ ...SelectStudentIDModalStyles.boxContainer, backgroundColor: '#f2f4f6' }, isDarkMode && { ...SelectStudentIDModalStyles.boxContainer, backgroundColor: '#121212' }]}>
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
          <View style={[{ ...SelectStudentIDModalStyles.boxContainer, backgroundColor: '#f2f4f6' }, isDarkMode && { ...SelectStudentIDModalStyles.boxContainer, backgroundColor: '#121212' }]}>
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

export default function S_SignUp_StudentID({ navigation }) {
  const route = useRoute()
  const { email, accountID, password, confirmPassword, phoneNumber } = route.params

  const isDarkMode = useColorScheme() === 'dark'

  const [isLoading, setIsLoading] = useState(false)

  const [message, setMessage] = useState('학년을 선택해 주세요.')

  const [_grade, setGrade] = useState(null)
  const [_class, setClass] = useState(null)
  const [_number, setNumber] = useState(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

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
    handelUpdateMessage()
    setSelectType('')
  }

  const handelUpdateMessage = () => {
    if (_grade === null) {
      setMessage('학년을 선택해주세요.')
    } else if (_class === null) {
      setMessage('반을 선택해주세요.')
    } else if (_number === null) {
      setMessage('번호를 선택해주세요.')
    } else if (firstName === '') {
      setMessage('성을 입력해주세요.')
    } else if (lastName === '') {
      setMessage('이름을 입력해주세요.')
    } else {
      setMessage('모두 작성하였습니다.')
    }
  }

  const handleNextScreen = () => {
    handelUpdateMessage()
    if (_grade === null) {
      return Alert.alert('경고', '학년을 선택해 주세요.')
    } else if (_class === null) {
      return Alert.alert('경고', '반을 선택해 주세요.')
    } else if (_number === null) {
      return Alert.alert('경고', '번호를 선택해 주세요.')
    } else if (firstName === '') {
      return Alert.alert('경고', '성 작성란이 비어있습니다.')
    } else if (lastName === '') {
      return Alert.alert('경고', '이름 작성락인 비어있습니다.')
    } else {
      return navigation.navigate('SignUp_CheckStudentID', { email: email, accountID: accountID, password: password, phoneNumber: phoneNumber, _grade: _grade, _class: _class, _number: _number, firstName: firstName, lastName: lastName, })
    }
  }

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#ffffff' }, isDarkMode && { ...styles.container, backgroundColor: '#000000' }]}>
      {/* 정보 선택 모달 */}
      <SelectStudentIDModal type={SelectType} _grade={_grade} _class={_class} _number={_number} setGrade={setGrade} setClass={setClass} setNumber={setNumber} isDarkMode={isDarkMode} onClose={() => { closeModal() }} />
      <KeyboardAvoidingView style={{ flex: 1, }} behavior={Platform.select({ ios: 'padding' })}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', }}>
          <View style={{ marginTop: 20, }}>
            <FastImage style={{ width: 150, height: 150, }} source={require('../../../resource/logo_v1.png')} />
          </View>

          <View style={{ marginTop: 40, }}>
            <Text style={[{ ...styles.Title, color: '#000000', }, isDarkMode && { ...styles.Title, color: '#ffffff', }]}>{message}</Text>
          </View>

          <View style={{ marginTop: 25, marginBottom: 100, }}>
            <TouchableOpacity onPress={() => { openModal('grade') }} style={[{ ...styles.inputView, borderColor: '#E9E9E9', backgroundColor: '#E9E9E9', }, isDarkMode && { ...styles.inputView, borderColor: '#333333', backgroundColor: '#333333', }]}>
              <Text style={[{ color: '#000000' }, isDarkMode && { color: '#ffffff' }]}>
                {_grade != null ?
                  <>{_grade}학년</>
                  :
                  <>학년</>
                }
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { openModal('class') }} style={[{ ...styles.inputView, borderColor: '#E9E9E9', backgroundColor: '#E9E9E9', }, isDarkMode && { ...styles.inputView, borderColor: '#333333', backgroundColor: '#333333', }]}>
              <Text style={[{ color: '#000000' }, isDarkMode && { color: '#ffffff' }]}>
                {_class != null ?
                  <>{_class}반</>
                  :
                  <>반</>
                }
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { openModal('number') }} style={[{ ...styles.inputView, borderColor: '#E9E9E9', backgroundColor: '#E9E9E9', }, isDarkMode && { ...styles.inputView, borderColor: '#333333', backgroundColor: '#333333', }]}>
              <Text style={[{ color: '#000000' }, isDarkMode && { color: '#ffffff' }]}>
                {_number != null ?
                  <>{_number}번</>
                  :
                  <>번호</>
                }
              </Text>
            </TouchableOpacity>

            <View style={[{ ...styles.inputView, borderColor: '#E9E9E9', backgroundColor: '#E9E9E9', }, isDarkMode && { ...styles.inputView, borderColor: '#333333', backgroundColor: '#333333', }]}>
              <TextInput
                style={[{ ...styles.inputText, color: '#000000' }, isDarkMode && { ...styles.inputText, color: '#ffffff' }]}
                placeholder='성 (이름)'
                value={firstName}
                placeholderTextColor={isDarkMode ? "#CCCCCC" : "#999999"}
                onChangeText={(text) => {
                  setFirstName(text)
                  handelUpdateMessage()
                }}
              />
            </View>

            <View style={[{ ...styles.inputView, borderColor: '#E9E9E9', backgroundColor: '#E9E9E9', }, isDarkMode && { ...styles.inputView, borderColor: '#333333', backgroundColor: '#333333', }]}>
              <TextInput
                style={[{ ...styles.inputText, color: '#000000' }, isDarkMode && { ...styles.inputText, color: '#ffffff' }]}
                placeholder='이름'
                value={lastName}
                placeholderTextColor={isDarkMode ? "#CCCCCC" : "#999999"}
                onChangeText={(text) => {
                  setLastName(text)
                  handelUpdateMessage()
                }}
              />
            </View>
          </View>
        </ScrollView>

        <View style={{ justifyContent: 'center', alignItems: 'center', }}>
          <TouchableOpacity style={{ ...styles.nextBtn, position: 'absolute', bottom: 30, }} onPress={handleNextScreen}>
            {isLoading === false ?
              <Text style={styles.nextBtnText}>다음</Text>
              :
              <ActivityIndicator size="small" color="#ffffff" />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView >
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  Title: {
    padding: 13,
    fontWeight: 'bold',
    fontSize: 30,
  },
  inputView: {
    width: 310,
    height: 50,
    padding: 13,
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 20,
    justifyContent: 'center',
  },
  inputText: {
    height: 50,
    color: '#000000',
  },
  nextBtn: {
    width: 310,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#EB4E45',
    justifyContent: 'center',
  },
  nextBtnText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '400',
    alignContent: 'center',
    alignItems: 'center',
  },
})