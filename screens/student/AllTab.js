import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal } from 'react-native';
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import DeviceInfo from 'react-native-device-info';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

import axiosInstance from "../../api/API_Server";

const appVersion = DeviceInfo.getVersion() // 앱 버전 가져오기
const buildNumber = DeviceInfo.getBuildNumber() // 빌드 번호 가져오기

export default function StudentAllTab({ navigation }) {
    const isDarkMode = useColorScheme() === 'dark'

    const [email, setEmail] = useState('')
    const [firstName, setFirstName] = useState(null)
    const [lastName, setLastName] = useState(null)

    const [developerModeCount, setDeveloperModeCount] = useState(0)

    const [profileStateType, setProfileStateType] = useState(null)

    const handelTestAPI = async() => {
        await axiosInstance.post('/',)
            .then((res) => {
                console.log(res.data)
            }).catch((error) => {
                console.log(error)
            })
    }

    const handleProfile = async() => {
        try {
            const ID = await AsyncStorage.getItem('id')
            const JOB = await AsyncStorage.getItem('job')
            
            await axiosInstance.post('/profile', { id: ID, job: JOB })
                .then((res) => {
                    setProfileStateType(1)
                    setEmail(res.data.email)
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

    const developerMode = AsyncStorage.getItem('developerMode')
        .then((res) => {
            //console.log(res)
            if (res !== 'developer') {
                //console.log('개발자 모드가 활성화 되어있지 않습니다.')
            }
        })

    const handelDeveloperModeActivation = async () => {
        //console.log(developerModeCount)
        if (developerModeCount >= 5) {
            if (developerMode == 'developer') {
                Alert.alert('개발자 모드', '개발자 모드를 비활성화 했습니다.')
                AsyncStorage.setItem('developerMode', 'developer') //개발자 모드 활성화 데이터
                setDeveloperModeCount(0)
            } else {
                Alert.alert('개발자 모드', '개발자 모드를 활성화 했습니다.')
                AsyncStorage.setItem('developerMode', 'developer') //개발자 모드 활성화 데이터
                setDeveloperModeCount(0)
            }
        } else {
            const temp = developerModeCount+1
            setDeveloperModeCount(temp)
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
            <View style={{marginBottom: 50, marginTop: 10,}}>
                <TouchableOpacity onPress={() => {handelDeveloperModeActivation()}}>
                    <Text style={[styles.logo, isDarkMode && styles.logoDark]}>전체</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {navigation.navigate("Settings")}}>
                    <Icon_Feather name="settings" size={30} style={[{ color: 'black', top: -17, right: 30, position: 'absolute',}, isDarkMode && { color: 'white', top: -17, right: 30, position: 'absolute'}]}/>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.scrollContainer, isDarkMode && styles.scrollContainerDark]} onPress={() => navigation.navigate('Profile_View')}>
                <View style={[allTabStyles.Info, isDarkMode && allTabStyles.InfoDark]}>
                    <Text style={[allTabStyles.profileTitle, isDarkMode && allTabStyles.profileTitleDark]}>{firstName+lastName}</Text>
                    <Text style={{ color: 'gray', fontSize: 12, fontWeight: 'normal',}}>계정ㆍ{email}</Text>
                    {/* 아이콘 */}
                    <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#dcdcdc', right: 20, position: 'absolute'}}></View>
                    <Icon_Feather name='user' size={30} style={{ color: 'black', borderRadius: 25, right: 30, position: 'absolute'}}/>
                </View>
            </TouchableOpacity>

            <View style={{ width: "100%", marginBottom: 30,}}></View>

            <TouchableOpacity style={[styles.scrollContainer, isDarkMode && styles.scrollContainerDark]} onPress={() => navigation.navigate('Bus_main')}>
                <View style={[allTabStyles.Info, isDarkMode && allTabStyles.InfoDark]}>
                    <Text style={[allTabStyles.profileTitle, isDarkMode && allTabStyles.profileTitleDark]}>버스 조회</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.scrollContainer, isDarkMode && styles.scrollContainerDark]}>
                <View style={[allTabStyles.Info, isDarkMode && allTabStyles.InfoDark]}>
                    <Text style={[allTabStyles.profileTitle, isDarkMode && allTabStyles.profileTitleDark]}>ysit 바로가기</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.scrollContainer, isDarkMode && styles.scrollContainerDark]}>
                <View style={[allTabStyles.Info, isDarkMode && allTabStyles.InfoDark]}>
                    <Text style={[allTabStyles.profileTitle, isDarkMode && allTabStyles.profileTitleDark]}>장영실고등학교 홈페이지</Text>
                </View>
            </TouchableOpacity>

            {/* <View style={[styles.scrollContainer, isDarkMode && styles.scrollContainerDark]}>
                <View style={[allTabStyles.Info, isDarkMode && allTabStyles.InfoDark]}>
                    <View style={allTabStyles.Item}>
                        <Text style={[allTabStyles.Label, isDarkMode && allTabStyles.LabelDark]}>앱 버전</Text>
                        <Text style={[allTabStyles.Value, isDarkMode && allTabStyles.ValueDark]}>{appVersion}</Text>
                    </View>

                    <View style={allTabStyles.Item}>
                        <Text style={[allTabStyles.Label, isDarkMode && allTabStyles.LabelDark]}>빌드 번호</Text>
                        <Text style={[allTabStyles.Value, isDarkMode && allTabStyles.ValueDark]}>{buildNumber}</Text>
                    </View>
                </View>
            </View> */}

            <>
                {developerMode === 'developer' &&
                    <TouchableOpacity style={{
                        backgroundColor: '#1E00D3',
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderRadius: 20,
                        alignSelf: 'center',
                        position: 'absolute',
                        bottom: 70,
                    }} onPress={() => navigation.navigate('Bus_main')}>
                        <Text style={allTabStyles.logoutBtnText}>버스</Text>
                    </TouchableOpacity>
                }
            </>

            <>
                {developerMode === 'developer' &&
                    <TouchableOpacity style={{
                        backgroundColor: '#1E00D3',
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderRadius: 20,
                        right: 20,
                        alignSelf: 'center',
                        position: 'absolute',
                        bottom: 70,
                    }} onPress={handelTestAPI}>
                        <Text style={allTabStyles.logoutBtnText}>Test API</Text>
                    </TouchableOpacity>
                }
            </>
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
        color: 'black',
        fontSize: 30,
        fontWeight: 'bold',
        top: 20,
        left: 25,
        width: '20%',
    },
    logoDark: {
        color: 'white',
        fontSize: 30,
        fontWeight: 'bold',
        top: 20,
        left: 25,
    },
})

const allTabStyles = StyleSheet.create({
    Info: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 25,
        marginBottom: 10,
        justifyContent: 'center',
        width: '95%',
        maxWidth: 400,
    },
    InfoDark: {
        backgroundColor: '#121212', // 다크모드에서의 배경색상
        padding: 20,
        borderRadius: 25,
        marginBottom: 10,
        justifyContent: 'center',
        width: '95%',
        maxWidth: 400,
    },
    profileTitle: {
        marginBottom: 3,
        color: 'black',
        fontSize: 25,
        fontWeight: 'bold',
    },
    profileTitleDark: {
        marginBottom: 3,
        color: 'white',
        fontSize: 25,
        fontWeight: 'bold'
    },
})