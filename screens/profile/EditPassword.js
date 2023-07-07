import React, { useEffect, useState } from "react";
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

import axiosInstance from "../../api/API_Server";

export default function EditPassword({ navigation }) {
    const isDarkMode = useColorScheme() === 'dark'

    const [isLoading, setIsLoading] = useState(false)

    const [oldPassword, setOldPassword] = useState(null)
    const [newPassword, setNewPassword] = useState(null)
    const [confirmNewPassword, setConfirmNewPassword] = useState(null)

    const handleEditProfile = async () => {
        if (oldPassword === null) {
            return Alert.alert('경고', '현재 비밀번호를 입력해주세요.')
        } else if (newPassword !== confirmNewPassword) {
            return Alert.alert('경고', '새로운 비밀번호가 일치하지 않습니다.\n비밀번호를 확인해주세요.')
        } else {
            setIsLoading(true)
            try {
                const ID = await AsyncStorage.getItem('id')
                const JOB = await AsyncStorage.getItem('job')
    
                await axiosInstance.post('/profile', { id: ID, job: JOB, methodName: 'edit', oldPassword: oldPassword, newPassword: newPassword })
                    .then((res) => {
                        setIsLoading(false)
                        if (res.status === 200) {
                            return Alert.alert('성공', '비밀번호를 성공적으로 수정했어요.', [
                                {
                                    text: '확인',
                                    onPress: () => {navigation.goBack()}
                                }
                            ])
                        }
                    }).catch((error) => {
                        setIsLoading(false)
                        const res = error.response
                        if (res.status === 400) {
                            return Alert.alert(res.data.error, res.data.errorDescription, [
                                {
                                    text: '확인',
                                    onPress: () => {navigation.goBack()}
                                },
                                {
                                    text: '다시시도',
                                    onPress: () => {
                                        handleEditProfile()
                                    }
                                }
                            ])
                        } else if (res.status === 500) {
                            return Alert.alert('에러', '변경에 실패했습니다.', [
                                {
                                    text: '확인',
                                    onPress: () => {navigation.goBack()}
                                },
                                {
                                    text: '다시시도',
                                    onPress: () => {
                                        handleEditProfile()
                                    }
                                }
                            ])
                        } else {
                            console.log('ProfileEdit API |', error)
                            return Alert.alert('에러', '요청을 처리하지 못했습니다.', [
                                {
                                    text: '확인',
                                    onPress: () => {navigation.goBack()}
                                }
                            ])
                        }
                    })
            } catch (error) {
                setIsLoading(false)
                console.log('ProfileEdit API |', error)
                return Alert.alert('에러', '요청에 실패했습니다.', [
                    {
                        text: '확인',
                        onPress: () => {navigation.goBack()}
                    },
                    {
                        text: '다시시도',
                        onPress: () => {
                            handleEditProfile()
                        }
                    }
                ])
            }
        }
    }

    useEffect(() => {
    }, [])

    return(
        <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
            {/* 로고 */}
            <View style={styles.logoView} >
                <TouchableOpacity style={styles.backButtonView} onPress={() => navigation.goBack()}>
                    <Icon_Ionicons name='arrow-back-outline' size={30} style={[styles.backButtonIcon, isDarkMode && styles.backButtonIconDark]}/>
                </TouchableOpacity>
                <Text style={[styles.logoText, isDarkMode && styles.logoTextDark]}>비밀번호 수정</Text>
            </View>

            {/* 스크롤 */}
            <ScrollView style={[styles.scrollContainer, isDarkMode && styles.scrollContainerDark]}>
                {/* 개인정보 */}
                <>
                    <Text style={profileStyles.InfoTopText}>현재 비밀번호</Text>
                    <View style={[profileStyles.Info, isDarkMode && profileStyles.InfoDark]}>
                        <Text style={[profileStyles.Title, isDarkMode && profileStyles.TitleDark]}>현재 비밀번호</Text>
                        <TextInput 
                            style={profileStyles.Value}  
                            placeholder={oldPassword}
                            onChangeText={(text) => setOldPassword(text)}
                            secureTextEntry={true}
                            value={oldPassword}
                            editable={true}
                        />
                        <View style={{ width: '100%', height: 1, backgroundColor: 'gray'}}></View>
                    </View>
                </>

                <>
                    <Text style={profileStyles.InfoTopText}>새로운 비밀번호</Text>
                    <View style={[profileStyles.Info, isDarkMode && profileStyles.InfoDark]}>
                        <Text style={[profileStyles.Title, isDarkMode && profileStyles.TitleDark]}>새로운 비밀번호</Text>
                        <TextInput 
                            style={profileStyles.Value}  
                            placeholder={newPassword}
                            onChangeText={(text) => setNewPassword(text)}
                            secureTextEntry={true}
                            value={newPassword}
                            editable={true}
                        />
                        <View style={{ width: '100%', height: 1, backgroundColor: 'gray'}}></View>

                        <View style={{ marginBottom: 15}}></View>

                        <Text style={[profileStyles.Title, isDarkMode && profileStyles.TitleDark]}>새로운 비밀번호 확인</Text>
                        <TextInput 
                            style={profileStyles.Value}  
                            placeholder={confirmNewPassword}
                            onChangeText={(text) => setConfirmNewPassword(text)}
                            secureTextEntry={true}
                            value={confirmNewPassword}
                            editable={true}
                        />
                        <View style={{ width: '100%', height: 1, backgroundColor: 'gray'}}></View>  
                    </View>
                </>
            </ScrollView>

            {/* 요청 */}
                <TouchableOpacity style={profileStyles.checkBtn} onPress={handleEditProfile}>
                {isLoading === false ?
                    <Text style={profileStyles.checkBtnText}>{<Icon_Feather name="check" size={17}/>} 확인</Text>
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
        width: "100%",
        marginLeft: 2,
        color: '#4682b4',
        height: 40,
    },
    rankView: {
        width: '100%',
        height: 1,
        marginTop: 15,
        marginBottom: 15,
        backgroundColor: 'gray',
    },
    checkBtn: {
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