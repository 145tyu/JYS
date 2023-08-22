import React, { useEffect, useState } from "react";
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

import axiosInstance from "../../api/API_Server";

export default function EditProfile({ navigation }) {
    const route = useRoute()

    const isDarkMode = useColorScheme() === 'dark'

    const [isLoading, setIsLoading] = useState(false)

    const [methodName,  setMethodName] = useState(null)
    const [Title, setTitle] = useState('프로필 수정')
    const [TopText, setTopText] = useState('프로필')
    const [placeholder, setPlaceholder] = useState('이곳에 적어주세요.')

    const [oldAccountID, setOldAccountID] = useState(null)
    const [oldPassword, setOldPassword] = useState(null)
    const [oldPhoneNumber, setOldPhoneNumber] = useState('')
    const [oldFirstName, setOldFirstName] = useState(null)
    const [oldLastName, setOldLastName] = useState(null)

    const [newAccountID, setNewAccountID] = useState(null)
    const [newPhoneNumber, setNewPhoneNumber] = useState('')
    const [newFirstName, setNewFirstName] = useState(null)
    const [newLastName, setNewLastName] = useState(null)

    const handleEditProfile = async () => {
        if (oldPassword === null) {
            return Alert.alert('에러', '현재 비밀번호를 입력해주세요.')
        } else {
            setIsLoading(true)
            try {
                const ID = await AsyncStorage.getItem('id')
                const JOB = await AsyncStorage.getItem('job')
    
                if (methodName === 'accountID') {
                    if (newAccountID === null) {
                        setIsLoading(false)
                        return Alert.alert('에러', '새로운 아이디를 입력하지 않았습니다.')
                    } else {
                        await axiosInstance.post('/profile', { id: ID, job: JOB, methodName: 'edit', accountID: newAccountID, oldPassword: oldPassword })
                        .then((res) => {
                            setIsLoading(false)
                            if (res.status === 200) {
                                return Alert.alert('성공', '프로필을 성공적으로 수정했어요.', [
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
                    }
                } else if (methodName === 'phoneNumber') {
                    if (newPhoneNumber === null) {
                        setIsLoading(false)
                        return Alert.alert('에러', '새로운 전화번호를 입력하지 않았습니다.')
                    } else {
                        await axiosInstance.post('/profile', { id: ID, job: JOB, methodName: 'edit', phoneNumber: newPhoneNumber, oldPassword: oldPassword })
                        .then((res) => {
                            setIsLoading(false)
                            if (res.status === 200) {
                                return Alert.alert('성공', '프로필을 성공적으로 수정했어요.', [
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
                    }
                } else if (methodName === 'name') {
                    if (newFirstName === null || newLastName === null) {
                        setIsLoading(false)
                        return Alert.alert('에러', '성 또는 이름을 입력하지 않았습니다.')
                    } else {
                        await axiosInstance.post('/profile', { id: ID, job: JOB, methodName: 'edit', firstName: newFirstName, lastName: newLastName, oldPassword: oldPassword })
                        .then((res) => {
                            setIsLoading(false)
                            if (res.status === 200) {
                                return Alert.alert('성공', '프로필을 성공적으로 수정했어요.', [
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
                    }
                }
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

    const handleSetMethod = () => {
        const { methodName, accountID, phoneNumber, firstName, lastName } = route.params
        setMethodName(methodName)
        if (methodName === 'accountID') {
            setTitle('아이디 수정')
            setTopText('아이디')
            setPlaceholder(accountID)
            setOldAccountID(accountID)
        } else if (methodName === 'phoneNumber') {
            setTitle('전화번호 수정')
            setTopText('전화번호')
            setPlaceholder(phoneNumber)
            setOldPhoneNumber(phoneNumber)
        } else if (methodName === 'name') {
            setTitle('이름 수정')
            setTopText('이름')
            setPlaceholder(firstName+lastName)
            setOldFirstName(firstName)
            setOldLastName(lastName)
        } else {
            return Alert.alert('에러', '나중에 다시 시도해보세요.', [
                {
                    text: '확인',
                    onPress: () => {navigation.goBack()}
                }
            ])
        }
    }

    useEffect(() => {
        handleSetMethod()
    }, [])

    return(
        <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
            {/* 로고 */}
            <View style={styles.logoView} >
                <TouchableOpacity style={styles.backButtonView} onPress={() => navigation.goBack()}>
                    <Icon_Ionicons name='arrow-back-outline' size={30} style={[styles.backButtonIcon, isDarkMode && styles.backButtonIconDark]}/>
                </TouchableOpacity>

                <Text style={[styles.logoText, isDarkMode && styles.logoTextDark]}>{Title}</Text>
            </View>

            {/* 스크롤 */}
            <ScrollView style={[styles.scrollContainer, isDarkMode && styles.scrollContainerDark]}>
                {/* 계정ID */}
                <>
                    {methodName === 'accountID' &&
                        <>
                            <Text style={profileStyles.InfoTopText}>비밀번호</Text>
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

                            <Text style={profileStyles.InfoTopText}>프로필 수정</Text>
                            <View style={[profileStyles.Info, isDarkMode && profileStyles.InfoDark]}>
                                <Text style={[profileStyles.Title, isDarkMode && profileStyles.TitleDark]}>{TopText}</Text>
                                <TextInput 
                                    style={profileStyles.Value}  
                                    placeholder={placeholder}
                                    onChangeText={(text) => setNewAccountID(text)}
                                    value={newAccountID}
                                    editable={true}
                                />
                                <View style={{ width: '100%', height: 1, backgroundColor: 'gray'}}></View>
                            </View>
                        </>
                    }
                    {methodName === 'phoneNumber' &&
                        <>
                            <Text style={profileStyles.InfoTopText}>비밀번호</Text>
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

                            <Text style={profileStyles.InfoTopText}>프로필 수정</Text>
                            <View style={[profileStyles.Info, isDarkMode && profileStyles.InfoDark]}>
                                <Text style={[profileStyles.Title, isDarkMode && profileStyles.TitleDark]}>{TopText}</Text>
                                <TextInput
                                    style={profileStyles.Value}
                                    placeholder={placeholder}
                                    keyboardType="number-pad"
                                    onChangeText={(text) => setNewPhoneNumber(text)}
                                    value={newPhoneNumber.replace(/[^0-9]/g, '').replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3").replace(/(\-{1,2})$/g, "")}
                                    editable={true}
                                />
                                <View style={{ width: '100%', height: 1, backgroundColor: 'gray'}}></View>
                            </View>
                        </>
                    }
                    {methodName === 'name' &&
                        <>
                            <Text style={profileStyles.InfoTopText}>비밀번호</Text>
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

                            <Text style={profileStyles.InfoTopText}>프로필 수정</Text>
                            <View style={[profileStyles.Info, isDarkMode && profileStyles.InfoDark]}>
                                <Text style={[profileStyles.Title, isDarkMode && profileStyles.TitleDark]}>성</Text>
                                <TextInput 
                                    style={profileStyles.Value}  
                                    placeholder={oldFirstName}
                                    onChangeText={(text) => setNewFirstName(text)}
                                    value={newFirstName}
                                    editable={true}
                                />
                                <View style={{ width: '100%', height: 1, backgroundColor: 'gray'}}></View>

                                <View style={{ marginBottom: 15}}></View>

                                <Text style={[profileStyles.Title, isDarkMode && profileStyles.TitleDark]}>이름</Text>
                                <TextInput 
                                    style={profileStyles.Value}  
                                    placeholder={oldLastName}
                                    onChangeText={(text) => setNewLastName(text)}
                                    value={newLastName}
                                    editable={true}
                                />
                                <View style={{ width: '100%', height: 1, backgroundColor: 'gray'}}></View>  
                            </View>
                        </>
                    }
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
        width: '100%',
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
        left: 15,
    },
    backButtonIcon: {
        color: 'black',
    },
    backButtonIconDark: {
        color: 'white',
    },
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