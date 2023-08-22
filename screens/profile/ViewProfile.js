import React, { useEffect, useState } from "react";
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal } from 'react-native';
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from "@react-native-async-storage/async-storage";

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

import axiosInstance from "../../api/API_Server";

export default function ViewProfile({ navigation }) {
    const isDarkMode = useColorScheme() === 'dark'

    const [accountID, setAccountID] = useState('로딩 중...')
    const [email, setEmail] = useState('로딩 중...')
    const [phoneNumber, setPhoneNumber] = useState('로딩 중...')
    const [studentID, setStudentID] = useState('로딩 중...')
    const [firstName, setFirstName] = useState(null)
    const [lastName, setLastName] = useState(null)
    const [fullName,  setFullName] = useState('로딩 중...')

    const [profileStateType, setProfileStateType] = useState(null)

    const handleProfile = async() => {
        try {
            const ID = await AsyncStorage.getItem('id')
            const JOB = await AsyncStorage.getItem('job')
            
            await axiosInstance.post('/profile', { id: ID, job: JOB })
                .then((res) => {
                    setProfileStateType(1)
                    setAccountID(res.data.accountID)
                    setEmail(res.data.email)
                    setPhoneNumber(res.data.phoneNumber)
                    setStudentID(res.data.studentID)
                    setFirstName(res.data.firstName)
                    setLastName(res.data.lastName)
                    setFullName(res.data.firstName + res.data.lastName)
                }).catch((error) => {
                    setProfileStateType(2)
                    console.log('Profile API |', error)
                    return Alert.alert('에러', '요청에 실패했습니다.', [
                        {
                            text: '다시시도',
                            onPress: () => {
                                handleProfile()
                            }
                        }
                    ])
                })
        } catch (error) {
            setProfileStateType(2)
            console.log('Profile API |', error)
            return Alert.alert('에러', '요청에 실패했습니다.', [
                {
                    text: '다시시도',
                    onPress: () => {
                        handleProfile()
                    }
                }
            ])
        }
    }

    const handleLogout = async() => {
        try {
            const fcmToken = await messaging().getToken()
            await axiosInstance.post('/Fcm/deleteToken', { fcmToken: fcmToken })
                .then((res) => {
                    console.log(res.data.message)
                }).catch((error) => {
                    console.log('logout API | ', error)
                    return Alert.alert('에러', '요청을 실패했습니다.', [
                        {
                            text: '다시시도',
                            onPress: () => {
                                handleLogout()
                            }
                        }
                    ])
                })
            AsyncStorage.removeItem('id')
            AsyncStorage.removeItem('job')
            AsyncStorage.removeItem('access_token')
            AsyncStorage.removeItem('refresh_token')
            //AsyncStorage.removeItem('fcm_token')
            return navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login'}]
                })
            )
        } catch (error) {
            console.log('logout API | ', error)
            return Alert.alert('에러', '요청을 실패했습니다.', [
                {
                    text: '다시시도',
                    onPress: () => {
                        handleLogout()
                    }
                }
            ])
        }
    }

    useEffect(() => {
        handleProfile() // 스크린이 처음 시작될 때 한번 실행
    }, [])

    useFocusEffect(() => {
        handleProfile() // 스크린 다시 렌더
    })

    return(
        <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
            {/* 로고 */}
            <View style={styles.logoView} >
                <TouchableOpacity style={styles.backButtonView} onPress={() => navigation.goBack()}>
                    <Icon_Ionicons name='arrow-back-outline' size={30} style={[styles.backButtonIcon, isDarkMode && styles.backButtonIconDark]}/>
                </TouchableOpacity>
                <Text style={[styles.logoText, isDarkMode && styles.logoTextDark]}>프로필</Text>
            </View>

            {/* 스크롤 */}
            <ScrollView style={[styles.scrollContainer, isDarkMode && styles.scrollContainerDark]}>
                {/* 계정ID */}
                <>
                    <Text style={profileStyles.InfoTopText}>계정ID</Text>
                    <View style={[profileStyles.Info, isDarkMode && profileStyles.InfoDark]}>
                        <TouchableOpacity onPress={() => navigation.navigate('Profile_Edit_Email', { methodName: 'email', email: email})}>
                            <Text style={[profileStyles.Title, isDarkMode && profileStyles.TitleDark]}>이메일</Text>
                            <Text style={profileStyles.Value}>{email}</Text>
                        </TouchableOpacity>
                    </View>
                </>
                {/* 개인정보 */}
                <>
                    <Text style={profileStyles.InfoTopText}>개인정보</Text>
                    <View style={[profileStyles.Info, isDarkMode && profileStyles.InfoDark]}>
                        <TouchableOpacity onPress={() => navigation.navigate('Profile_Edit', { methodName: 'accountID', accountID: accountID })}>
                            <Text style={[profileStyles.Title, isDarkMode && profileStyles.TitleDark]}>아이디</Text>
                            <Text style= {profileStyles.Value}>{accountID}</Text>
                        </TouchableOpacity>

                        <View style={profileStyles.rankView}></View>

                        <TouchableOpacity onPress={() => navigation.navigate('Profile_Edit_Password')}>
                            <Text style={[profileStyles.Title, isDarkMode && profileStyles.TitleDark]}>비밀번호</Text>
                        </TouchableOpacity>

                        <View style={profileStyles.rankView}></View>

                        <View>
                            <Text style={[profileStyles.Title, isDarkMode && profileStyles.TitleDark]}>학번</Text>
                            <Text style= {profileStyles.Value}>{studentID}</Text>
                        </View>

                        <View style={profileStyles.rankView}></View>

                        <TouchableOpacity onPress={() => navigation.navigate('Profile_Edit', { methodName: 'phoneNumber', phoneNumber: phoneNumber })}>
                            <Text style={[profileStyles.Title, isDarkMode && profileStyles.TitleDark]}>전화번호</Text>
                            <Text style= {profileStyles.Value}>{phoneNumber}</Text>
                        </TouchableOpacity>

                        <View style={profileStyles.rankView}></View>
                        
                        <TouchableOpacity onPress={() => navigation.navigate('Profile_Edit', { methodName: 'name', firstName: firstName, lastName: lastName })}>
                            <Text style={[profileStyles.Title, isDarkMode && profileStyles.TitleDark]}>이름</Text>
                            <Text style= {profileStyles.Value}>{fullName}</Text>
                        </TouchableOpacity>
                    </View>
                </>
            </ScrollView>
            {/* 로그아웃 */}
            <TouchableOpacity style={profileStyles.logoutBtn} onPress={handleLogout}>
                <Text style={profileStyles.logoutBtnText}>{<Icon_Ionicons name="log-out-outline" size={17}></Icon_Ionicons>} 로그아웃</Text>
            </TouchableOpacity>
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
    },
    scrollContainerDark: {
        backgroundColor: '#000000',
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

const profileStyles = StyleSheet.create({
    Info: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 25,
        marginBottom: 20,
        width: '100%',
        maxWidth: 400,
    },
    InfoDark: {
        backgroundColor: '#121212', // 다크모드에서의 배경색상
        padding: 20,
        borderRadius: 25,
        marginBottom: 20,
        width: '100%',
        maxWidth: 400,
    },
    InfoTopText: {
        color: 'gray',
        fontWeight: 'bold',
        marginLeft: 20,
        marginBottom: 5,
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
        color: '#4682b4',
        fontSize: 14,
        marginLeft: 5,
    },
    rankView: {
        width: '100%',
        height: 1,
        marginTop: 15,
        marginBottom: 15,
        backgroundColor: 'gray',
    },
    logoutBtn: {
        backgroundColor: '#1E00D3',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignSelf: 'center',
        position: 'absolute',
        bottom: 0,
        marginBottom: 20,
    },
    logoutBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 15,
    },
})