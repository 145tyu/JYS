import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
//import messaging from '@react-native-firebase/messaging';

import axiosInstance from "../api/API_Server";

export default function LoginScreen({ navigation }) {
    const isDarkMode = useColorScheme() === 'dark'

    const [isLoading, setIsLoading] = useState(false)

    const [alert, setAlert] = useState(null)
    const [alertDescription, setAlertDescription] = useState(null)
    const [alertStatus, setAlertStatus] = useState(null)
    const [isAlertModalVisible, setIsAlertModalVisible] = useState(false)

    const [email, setEmail] = useState('')
    const [accountID, setAccountID] = useState('')
    const [password, setPassword] = useState('')
    const [job, setJob] = useState('student')

    const handleJob = async () => {
        if (job === 'student') {
            setJob('teacher')
        } else if (job === 'teacher') {
            setJob('student')
        }
    }

    const resetAlert = () => {
        setAlert(null) // 에러메시지 초기화
        setAlertDescription(null) // 에러메시지 초기화
        setAlertStatus(null) // 에러상태 초기화
        setIsAlertModalVisible(false) // 에러 모달 닫기
    }

    const handleLogin = async () => {
        resetAlert()
        if (!accountID || !password) {
            // 에러 모달 설정
            setAlert('아이디 또는 비밀번호를 입력해주세요.')
            setAlertStatus(400)
            setIsAlertModalVisible(true) // 에러 모달 표시
        } else {
            setIsLoading(true)
            try {
                let fcmToken = ''
                if (Platform.OS === 'ios') {
                    fcmToken = 'ios_test1234'
                }
                if (Platform.OS === 'android') {
                    //fcmToken = await messaging().getToken()
                    fcmToken = 'android_test1234'
                }
                await axiosInstance.post('/login', { accountID, password, job, fcmToken })
                    .then((res) => {
                        setIsLoading(false)
                        if (res.status === 200) {
                            AsyncStorage.setItem('id', res.data.id)
                            AsyncStorage.setItem('job', res.data.job)
                            AsyncStorage.setItem('access_token', res.data.accessToken)
                            AsyncStorage.setItem('refresh_token', res.data.refreshToken)
                            AsyncStorage.setItem('fcm_token', fcmToken)
                            if (res.data.job === 'student') {
                                return navigation.dispatch(
                                    CommonActions.reset({
                                        index: 0,
                                        routes: [{ name: 'S_Home' }]
                                    })
                                )
                            } else if (res.data.job === 'teacher') {
                                return navigation.dispatch(
                                    CommonActions.reset({
                                        index: 0,
                                        routes: [{ name: 'T_Home' }]
                                    })
                                )
                            }
                        } else {
                            // 에러 모달 설정
                            setAlert('예외가 발생했습니다.')
                            setAlertStatus(400)
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
                            setAlert('로그인에 실패했습니다.')
                            if (res.data.errorDescription) setAlertDescription(res.data.errorDescription)
                            setAlertStatus(500)
                            setIsAlertModalVisible(true) // 에러 모달 표시
                        } else {
                            console.log('LoginAPI | ', error)
                            // 에러 모달 설정
                            setAlert('예외가 발생했습니다.')
                            setAlertStatus(500)
                            setIsAlertModalVisible(true) // 에러 모달 표시
                        }
                    })
            } catch (error) {
                setIsLoading(false)
                console.log('LoginAPI | ', error)
                // 에러 모달 설정
                setAlert('로그인에 실패했습니다.')
                setAlertStatus(500)
                setIsAlertModalVisible(true) // 에러 모달 표시
            }
        }
    }

    const closeErrModal = () => {
        setIsAlertModalVisible(false)
    }

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
            <Text style={styles.logo}>JYS</Text>

            <Modal animationType="fade" transparent={true} visible={isAlertModalVisible} onRequestClose={closeErrModal}>
                {alertStatus === 400 &&
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                        <View style={[{ backgroundColor: 'white', padding: 10, borderRadius: 20, width: '90%' }, isDarkMode && { backgroundColor: '#121212', padding: 10, borderRadius: 20, width: '90%' }]}>
                            <Text style={[{ fontSize: 17, fontWeight: 'bold', color: 'black', textAlign: 'center', marginTop: 10 }, isDarkMode && { fontSize: 17, fontWeight: 'bold', color: 'white', textAlign: 'center', marginTop: 10 }]}>{alert}</Text>
                            {alertDescription != null && <Text style={[{ fontSize: 13, fontWeight: 'bold', color: 'black', textAlign: 'center', marginTop: 15 }, isDarkMode && { fontSize: 13, fontWeight: 'bold', color: 'white', textAlign: 'center', marginTop: 15 }]}>{alertDescription}</Text>}
                            <View style={{ width: '100%', height: 1, backgroundColor: 'gray', marginTop: 20, marginBottom: 10 }}></View>
                            <TouchableOpacity onPress={closeErrModal}><Text style={{ color: '#4682b4', fontSize: 15, textAlign: 'center' }}>확인</Text></TouchableOpacity>
                        </View>
                    </View>
                }
                {alertStatus === 500 &&
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                        <View style={[{ backgroundColor: 'white', padding: 10, borderRadius: 20, width: '90%' }, isDarkMode && { backgroundColor: '#121212', padding: 10, borderRadius: 20, width: '90%' }]}>
                            <Text style={[{ fontSize: 17, fontWeight: 'bold', color: 'black', textAlign: 'center', marginTop: 10 }, isDarkMode && { fontSize: 17, fontWeight: 'bold', color: 'white', textAlign: 'center', marginTop: 10 }]}>{alert}</Text>
                            {alertDescription != null && <Text style={[{ fontSize: 13, fontWeight: 'bold', color: 'black', textAlign: 'center', marginTop: 15 }, isDarkMode && { fontSize: 13, fontWeight: 'bold', color: 'white', textAlign: 'center', marginTop: 15 }]}>{alertDescription}</Text>}
                            <View style={{ width: '100%', height: 1, backgroundColor: 'gray', marginTop: 20, marginBottom: 10 }}></View>
                            <TouchableOpacity onPress={handleLogin}><Text style={{ color: '#4682b4', fontSize: 15, textAlign: 'center' }}>다시시도</Text></TouchableOpacity>
                            <View style={{ width: '100%', height: 1, backgroundColor: 'gray', marginTop: 10, marginBottom: 10 }}></View>
                            <TouchableOpacity onPress={closeErrModal}><Text style={{ color: '#4682b4', fontSize: 15, textAlign: 'center' }}>확인</Text></TouchableOpacity>
                        </View>
                    </View>
                }
            </Modal>

            <View style={[LoginStyles.inputView, isDarkMode && LoginStyles.inputViewDark]}>
                <TextInput
                    style={LoginStyles.inputText}
                    placeholder="아이디"
                    placeholderTextColor="#003f5c"
                    onChangeText={(text) => setAccountID(text)}
                />
            </View>
            <View style={[LoginStyles.inputView, isDarkMode && LoginStyles.inputViewDark]}>
                <TextInput
                    style={LoginStyles.inputText}
                    placeholder="비밀번호"
                    placeholderTextColor="#003f5c"
                    secureTextEntry={true}
                    onChangeText={(text) => setPassword(text)}
                />
            </View>
            <TouchableOpacity style={LoginStyles.jobBtn} onPress={handleJob}>
                <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>
                    {job === 'student' ?
                        <>
                            {<Icon_Ionicons name='school-outline' size={18}/>} 학생
                        </>
                        :
                        <>
                            {<Icon_Ionicons name='options-outline' size={18}/>} 교사
                        </>
                    }
                </Text>
            </TouchableOpacity>
            <View>
                <TouchableOpacity onPress={() => { navigation.navigate('SignUp')}}>
                    <Text style={[LoginStyles.signUpText, isDarkMode && LoginStyles.signUpTextDark]}>회원가입</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={LoginStyles.loginBtn} onPress={handleLogin}>
                {isLoading === false ?
                    <Text style={LoginStyles.loginBtnText}>{<Icon_Ionicons name='enter-outline' size={20}/>} 로그인</Text>
                    :
                    <ActivityIndicator size="small" color="white"/>
                }
            </TouchableOpacity>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    },
    containerDark: {
        flex: 1,
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center'
    },
    logo: {
        fontWeight: 'bold',
        fontSize: 70,
        color: '#fb5b5a',
        marginBottom: 40,
    },
})

const LoginStyles = StyleSheet.create({
    inputView: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 25,
        height: 50,
        marginBottom: 20,
        justifyContent: 'center',
        padding: 20,
        borderColor: '#fb5b5a',
        borderWidth: 2,
    },
    inputViewDark: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 25,
        height: 50,
        marginBottom: 20,
        justifyContent: 'center',
        padding: 20,
        borderColor: '#fb5b5a',
        borderWidth: 2,
    },
    inputText: {
        height: 50,
        color: '#000',
    },
    loginBtn: {
        width: '30%',
        backgroundColor: '#fb5b5a',
        borderRadius: 15,
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 10,
        marginLeft: 100,
        marginRight: 100,
    },
    loginBtnText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 20,
        alignContent: 'center',
        alignItems: 'center',
    },
    signUpText: {
        color: '#000',
    },
    signUpTextDark: {
        color: '#fff',
    },
    jobBtn: {
        width: '25%',
        backgroundColor: '#fb5b5a',
        borderRadius: 25,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
        marginBottom: 20,
    }
})