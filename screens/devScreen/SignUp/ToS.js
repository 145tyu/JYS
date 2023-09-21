import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, KeyboardAvoidingView, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Image, Modal } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import FastImage from 'react-native-fast-image';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

import axiosInstance from "../../api/API_Server";

export default function SignUp_ToS({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'

  const [check_1, setCheck_1] = useState(false)

  const handleCheck_1 = () => {
    if (check_1 === false) {
      setCheck_1(true)
    } else {
      setCheck_1(false)
    }
  }

  const handleNextScreen = () => {
    if (check_1 === true) {
      return navigation.navigate('SignUp_Email')
    } else {
      return Alert.alert('정보', '이용약관에 동의하지 않으면 회원가입을 진행할 수 없습니다.')
    }
  }

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#ffffff' }, isDarkMode && { ...styles.container, backgroundColor: '#000000' }]}>
      {/* 로고 */}
      <View style={styles.logoView}>
        <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 50 } : { ...styles.backButtonView, }}
          onPress={() => navigation.goBack()}
        >
          <Text style={[{ ...styles.logoText, color: '#000000' }, isDarkMode && { ...styles.logoText, color: '#ffffff' },]}>
            {<Icon_Ionicons name="chevron-back-outline" size={25} />}
          </Text>
        </TouchableOpacity>
        {/* 제목 */}
        <Text style={[{ ...styles.logo, color: '#000000', }, isDarkMode && { ...styles.logo, color: '#ffffff', }]}>이용약관</Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', }}>
        <View style={{ height: '70%', height: 450, marginTop: 70, padding: 20, }}>
          <Text style={[{ marginLeft: 3, marginBottom: 5, color: '#000000', }, isDarkMode && { marginLeft: 3, marginBottom: 5, color: '#ffffff', }]}>이용약관</Text>
          <ScrollView contentContainerStyle={{ padding: 10, }} style={{ marginBottom: 10, borderWidth: 1.5, borderColor: '#000000', backgroundColor: '#ffffff' }}>
            <Text style={{ fontWeight: '400', fontSize: 15, color: '#666666' }}>
              회원가입 동의 및 개인정보 처리방침{'\n'}
              {'\n'}
              안녕하세요, "영실커넥트" 앱을 이용해 주셔서 감사합니다. 회원가입을 시작하기 전에 아래의 내용을 숙지하고 동의해주시기 바랍니다.{'\n'}
              {'\n'}

              1. 개인정보 수집 및 이용 동의{'\n'}
              {'\n'}
              본 앱은 회원가입 및 서비스 이용을 위해 다음과 같은 개인정보를 수집하고 이용합니다:{'\n'}
              {'\n'}
              - 이메일 주소{'\n'}
              - 사용자명{'\n'}
              - 전화번호{'\n'}
              - 학번{'\n'}
              - 학생증 (확인 후 데이터 파기){'\n'}
              - 이용 기록 (서비스 이용 내역){'\n'}
              - 기기 정보 (기기 종류, 운영 체제, IP 주소 등){'\n'}
              - 게시판 정보 (게시물 및 댓글 내용){'\n'}
              {'\n'}
              이러한 개인정보는 회원 식별, 서비스 제공, 품질 향상, 사용자 지원 등의 목적으로 사용됩니다.{'\n'}
              {'\n'}

              2. 개인정보 제3자 제공 동의{'\n'}
              {'\n'}
              앱은 사용자의 개인정보를 본래 수집 목적 범위 내에서 사용하며, 사용자의 사전 동의 없이는 제3자에게 제공하지 않습니다. 다만, 관련 법령에 따른 정부 기관이나 수사 기관의 요청이 있는 경우 등의 예외 상황이 있을 수 있습니다.{'\n'}
              {'\n'}

              3. 개인정보 보관 및 보호{'\n'}
              {'\n'}
              개인정보는 회원이 탈퇴하기 전까지 보유되며, 관련 법규 및 정책을 준수하여 적절한 보안 조치가 취해집니다.{'\n'}
              {'\n'}

              4. 개인정보 열람, 수정 및 삭제 권리{'\n'}
              {'\n'}
              회원님은 언제든지 자신의 개인정보를 열람, 수정, 삭제할 수 있습니다. 개인정보 열람 및 수정은 앱 내 "계정 설정"을 통해 가능하며, 삭제를 원하실 경우 고객센터로 문의하시기 바랍니다.{'\n'}
              {'\n'}

              5. 게시판 이용 및 처리방침 동의{'\n'}
              {'\n'}
              앱의 게시판 이용에 대한 내용을 숙지하시고 동의해주시기 바랍니다. 게시물 작성 및 관리에 대한 내용을 확인하실 수 있습니다.{'\n'}
              {'\n'}
              위 내용을 확인하고 동의해주시면 "체크표시" 버튼을 눌러 회원가입을 진행해주시기 바랍니다.{'\n'}
              {'\n'}
              동의하지 않으실 경우 회원가입이 제한될 수 있습니다.{'\n'}
              {'\n'}
              더 자세한 내용은 [개인정보 처리방침](https://www.zena.co.kr/jys/privacy)에서 확인하실 수 있습니다.
            </Text>
          </ScrollView>
          <TouchableOpacity onPress={handleCheck_1}>
            {check_1 === true ?
              <Text style={[{ marginLeft: 3, fontWeight: '400', fontSize: 15, color: '#000000', }, isDarkMode && { marginLeft: 3, fontWeight: '400', fontSize: 15, color: '#ffffff', }]}>
                <Icon_Feather name='check-square' size={15} /> 동의하기
              </Text>
              :
              <Text style={[{ marginLeft: 3, fontWeight: '400', fontSize: 15, color: '#000000', }, isDarkMode && { marginLeft: 3, fontWeight: '400', fontSize: 15, color: '#ffffff', }]}>
                <Icon_Feather name='square' size={15} /> 동의하기
              </Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={{ justifyContent: 'flex-end', alignItems: 'center', }}>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNextScreen}>
          <Text style={styles.nextBtnText}>다음</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoView: {
    height: 60,
    justifyContent: 'center',
  },
  logo: {
    fontSize: 33,
    fontWeight: 'bold',
    top: 50,
    left: 25,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '400',
  },
  backButtonView: {
    position: 'absolute',
    left: 10,
  },
  Title: {
    paddingLeft: 15,
    paddingRight: 15,
    fontWeight: 'bold',
    fontSize: 30,
    textAlign: 'left',
  },
  nextBtn: {
    width: 310,
    height: 45,
    borderRadius: 10,
    marginBottom: 20,
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