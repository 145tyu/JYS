import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal } from 'react-native';
import { CommonActions } from "@react-navigation/native";
import DeviceInfo from 'react-native-device-info';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';

import axiosInstance from "../../api/API_Server";

const appVersion = DeviceInfo.getVersion() // 앱 버전 가져오기
const buildNumber = DeviceInfo.getBuildNumber() // 빌드 번호 가져오기

export default function Profile({ navigation }) {
    const isDarkMode = useColorScheme() === 'dark'

    const [email, setEmail] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [studentID, setStudentID] = useState(null)
    const [firstName, setFirstName] = useState(null)
    const [lastName, setLastName] = useState(null)

    const [profileStateType, setProfileStateType] = useState(null)

    const handleProfile = async() => {
        try {
            const ID = await AsyncStorage.getItem('id')
            const JOB = await AsyncStorage.getItem('job')
            
            await axiosInstance.post('/profile', { id: ID, job: JOB })
                .then((res) => {
                    setProfileStateType(1)
                    setEmail(res.data.email)
                    setPhoneNumber(res.data.phoneNumber)
                    setStudentID(res.data.studentID)
                    setFirstName(res.data.firstName)
                    setLastName(res.data.lastName)
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
            const ID = await AsyncStorage.getItem('id')
            const fcm_Token = await AsyncStorage.getItem('fcm_token')

            await axiosInstance.post('/logout', { id: ID, fcmToken: fcm_Token })
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
            AsyncStorage.removeItem('fcm_token')
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
        handleProfile()
    }, [])

    return(
        <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
            {/* 로고 */}
            <Text style={styles.logo}>JYS</Text>

            <View style={[styles.scrollContainer, isDarkMode && styles.scrollContainerDark]}>
                <View style={[profileStyles.Info, isDarkMode && profileStyles.InfoDark]}>
                    <Text style={[profileStyles.Title, isDarkMode && profileStyles.TitleDark]}>프로필</Text>
                    {profileStateType === null ?
                        <ActivityIndicator size="large" color="#0000ff" />
                        : 
                        <>
                            {profileStateType === 1 ? 
                                <>
                                    <View style={profileStyles.Item}>
                                        <Text style={[profileStyles.Label, isDarkMode && profileStyles.LabelDark]}>이름</Text>
                                        <Text style={[profileStyles.Value, isDarkMode && profileStyles.ValueDark]}>{firstName}{lastName}</Text>
                                    </View>
                                    <View style={profileStyles.Item}>
                                        <Text style={[profileStyles.Label, isDarkMode && profileStyles.LabelDark]}>이메일</Text>
                                        <Text style={[profileStyles.Value, isDarkMode && profileStyles.ValueDark]}>{email}</Text>
                                    </View>
                                    <View style={profileStyles.Item}>
                                        <Text style={[profileStyles.Label, isDarkMode && profileStyles.LabelDark]}>전화번호</Text>
                                        <Text style={[profileStyles.Value, isDarkMode && profileStyles.ValueDark]}>{phoneNumber}</Text>
                                    </View>
                                </>
                                :
                                <Text style={[profileStyles.Text, isDarkMode && profileStyles.TextDark]}>요청에 실패했습니다.</Text>
                            }
                        </>
                    }
                </View>

                <View style={[profileStyles.Info, isDarkMode && profileStyles.InfoDark]}>
                    <View style={profileStyles.Item}>
                        <Text style={[profileStyles.Label, isDarkMode && profileStyles.LabelDark]}>앱 버전</Text>
                        <Text style={[profileStyles.Value, isDarkMode && profileStyles.ValueDark]}>{appVersion}</Text>
                    </View>

                    <View style={profileStyles.Item}>
                        <Text style={[profileStyles.Label, isDarkMode && profileStyles.LabelDark]}>빌드 번호</Text>
                        <Text style={[profileStyles.Value, isDarkMode && profileStyles.ValueDark]}>{buildNumber}</Text>
                    </View>
                </View>
            </View>

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
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0F0F0',
    },
    scrollContainerDark: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
    },
    logo: {
        fontWeight: 'bold',
        fontSize: 50,
        color: '#fb5b5a',
        marginTop: 20,
        marginBottom: 20,
        textAlign: 'center',
    },
})

const profileStyles = StyleSheet.create({
    Info: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        width: '95%',
        maxWidth: 400,
    },
    InfoDark: {
        backgroundColor: '#121212', // 다크모드에서의 배경색상
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        width: '95%',
        maxWidth: 400,
        borderColor: '#FFFFFF', // 다크모드에서의 테두리 색상
        borderWidth: 1,
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
        textAlign: 'center',
        color: "#000", // 다크모드에서의 글자색상

    },
    TextDark: {
        textAlign: 'center',
        color: "#fff", // 다크모드에서의 글자색상
    },
    Item: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 7,
        marginTop: 7,
        marginLeft: 10,
    },
    Label: {
        fontWeight: 'bold',
        width: 80,
        marginRight: 3,
        color: '#000', // 다크모드에서의 글자색상
    },
    LabelDark: {
        fontWeight: 'bold',
        width: 80,
        marginRight: 3,
        color: '#fff', // 다크모드에서의 글자색상
    },
    Value: {
        flex: 1,
        color: '#000', // 다크모드에서의 글자색상
    },
    ValueDark: {
        flex: 1,
        color: '#fff', // 다크모드에서의 글자색상
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
    },
})