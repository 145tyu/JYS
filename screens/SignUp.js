import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View, useColorScheme, TouchableOpacity, ScrollView, SafeAreaView, Platform, Modal, Button } from "react-native";
import { CommonActions } from "@react-navigation/native";
import { Picker } from '@react-native-picker/picker';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';

import axiosInstance from "../api/API_Server";

export default function SignUpScreen({ navigation }) {
    const isDarkMode = useColorScheme() === 'dark'

    const [ isLoading, setIsLoading ] = useState(false)

    const [is_gradeModalVisible, setIs_gradeModalVisible] = useState(false)
    const [is_classModalVisible, setIs_classModalVisible] = useState(false)
    const [is_numberModalVisible, setIs_numberModalVisible] = useState(false)

    const [ email, setEmail ] = useState(null)
    const [ accountID, setAccountID ] = useState(null)
    const [ password, setPassword ] = useState(null)
    const [ confirmPassword, setConfirmPassword ] = useState(null)
    const [ phoneNumber, setPhoneNumber ] = useState('')
    const [ _grade, setGrade ] = useState(null)
    const [ _class, setClass] = useState(null)
    const [ _number, setNumber] = useState(null)
    const [ firstName, setFirstName ] = useState(null)
    const [ lastName, setLastName ] = useState(null)

    const handleSignUp = async() => {
        if (email === null) {
            return Alert.alert('경고', '이메일을 입력해주세요.')
        } else if (accountID === null) {
            return Alert.alert('경고', '로그인에 사용될 아이디를 입력해주세요.')
        } else if (password === null) {
            return Alert.alert('경고', '비밀번호를 입력해주세요.')
        } else if (confirmPassword === null) {
            return Alert.alert('경고', '확인 비밀번호를 입력해주세요.')
        } else if (phoneNumber === null) {
            return Alert.alert('경고', '전화번호를 입력해주세요.')
        } else if (_grade === null || _grade === '?') {
            return Alert.alert('경고', '학년을 선택해주세요.')
        } else if (_class === null || _class === '?') {
            return Alert.alert('경고', '반을 선택해주세요.')
        } else if (_number === null || _number === '?') {
            return Alert.alert('경고', '번호를 선택해주세요.')
        } else if (firstName === null) {
            return Alert.alert('경고', '성을 입력해주세요.')
        } else if (lastName === null) {
            return Alert.alert('경고', '이름을 입력해주세요.')
        } else if (password !== confirmPassword) {
            return Alert.alert('경고', '비밀번호가 일치하지 않습니다.\n비밀번호를 확인해주세요.')
        }
         else {
            setIsLoading(true)
            try {
                await axiosInstance.post('/register', {
                    email: email,
                    accountID: accountID,
                    password: password,
                    phoneNumber: phoneNumber,
                    studentID: `${_grade}${_class}${_number}`,
                    firstName: firstName,
                    lastName: lastName,
                }).then((res) => {
                    setIsLoading(false)
                    if (res.status === 200) {
                        Alert.alert('정보', res.data.message)
                        return navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: 'Login' }]
                            })
                        )
                    } else {
                        return Alert.alert('에러', '예외가 발생했습니다.')
                    }
                }).catch((error) => {
                    setIsLoading(false)
                    const res = error.response
                    if (res.status === 400) {
                        return Alert.alert(res.data.error, res.data.errorDescription)
                    } else if (res.status === 500) {
                        return Alert.alert('에러', '회원가입에 실패했습니다.', [
                            {
                                text: '다시시도',
                                onPress: () => {
                                    handleSignUp()
                                }
                            }
                        ])
                    } else {
                        console.log('SignUp API | ', error)
                        return Alert.alert('에러', '예외가 발생했습니다.')
                    }
                })
            } catch (error) {
                setIsLoading(false)
                console.log('SignUp API | ', error)
                Alert.alert('에러', error.message)
            }
        }
    }

    const open_gradeModal = () => {
        setIs_gradeModalVisible(true)
    }

    const close_gradeModal = () => {
        setIs_gradeModalVisible(false)
    }

    const open_classModal = () => {
        setIs_classModalVisible(true)
    }

    const close_classModal = () => {
        setIs_classModalVisible(false)
    }

    const open_numberModal = () => {
        setIs_numberModalVisible(true)
    }

    const close_numberModal = () => {
        setIs_numberModalVisible(false)
    }

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
            <Text style={[SignUpStyles.Title, isDarkMode && SignUpStyles.TitleDark]}>회원가입</Text>

            <TouchableOpacity style={Platform.OS === 'ios' ? {...styles.backButtonContainer, marginTop: 50} : {...styles.backButtonContainer}} onPress={() => navigation.goBack()}>
                <Icon_Ionicons name='arrow-back-outline' size={30} style={[{color: 'black'}, isDarkMode && {color: 'white'}]}></Icon_Ionicons>
            </TouchableOpacity>

            <Text style={{textAlign: 'center'}}>{_grade}{_class}{_number}</Text>

            <ScrollView contentContainerStyle={[styles.scrollContainer, isDarkMode && styles.scrollContainerDark]}>
                <View style={SignUpStyles.inputView}>
                    <TextInput
                        style={SignUpStyles.inputText}
                        placeholder="이메일"
                        placeholderTextColor="#003f5c"
                        onChangeText={(text) => setEmail(text)}
                        value={email}
                    />
                </View>

                <View style={SignUpStyles.inputView}>
                    <TextInput
                        style={SignUpStyles.inputText}
                        placeholder="아이디"
                        placeholderTextColor="#003f5c"
                        onChangeText={(text) => setAccountID(text)}
                        value={accountID}
                    />
                </View>

                <View style={SignUpStyles.inputView}>
                    <TextInput
                        style={SignUpStyles.inputText}
                        placeholder="비밀번호"
                        placeholderTextColor="#003f5c"
                        secureTextEntry
                        onChangeText={(text) => setPassword(text)}
                        value={password}
                    />
                </View>

                <View style={SignUpStyles.inputView}>
                    <TextInput
                        style={SignUpStyles.inputText}
                        placeholder="비밀번호 확인"
                        placeholderTextColor="#003f5c"
                        secureTextEntry
                        onChangeText={(text) => setConfirmPassword(text)}
                        value={confirmPassword}
                    />
                </View>

                <View style={SignUpStyles.inputView}>
                    <TextInput
                        style={SignUpStyles.inputText}
                        placeholder="전화번호"
                        placeholderTextColor="#003f5c"
                        keyboardType="number-pad"
                        onChangeText={(text) => setPhoneNumber(text)}
                        value={phoneNumber.replace(/[^0-9]/g, '').replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3").replace(/(\-{1,2})$/g, "")}
                    />
                </View>

                <View style={SignUpStyles.inputView}>
                    {Platform.OS === 'ios' ?
                        <TouchableOpacity style={SignUpStyles.inputText} onPress={() => {open_gradeModal()}}>
                            <Text style={{textAlign: 'center', fontSize: 15, color: '#4682b4', position: 'absolute', top: 15,}}>
                                {_grade === null ?
                                    <>선택하기</>
                                    :
                                    <>{_grade}학년</>
                                }
                            </Text>
                            <Modal visible={is_gradeModalVisible} onRequestClose={close_gradeModal}>
                                <View style={{ flex: 1, justifyContent: 'center'}}>
                                    <Picker
                                        selectedValue={_grade}
                                        onValueChange={(value) => setGrade(value)}
                                    >
                                        <Picker.Item label="1학년" value="1" />
                                        <Picker.Item label="2학년" value="2" />
                                        <Picker.Item label="3학년" value="3" />
                                    </Picker>
                                    <Button title="닫기" onPress={close_gradeModal} />
                                </View>
                            </Modal>
                        </TouchableOpacity>
                        :
                        <Picker
                            style={SignUpStyles.inputText}
                            selectedValue={_grade}
                            onValueChange={(value) => setGrade(value)}
                        >
                            <Picker.Item label="1학년" value="1" />
                            <Picker.Item label="2학년" value="2" />
                            <Picker.Item label="3학년" value="3" />
                        </Picker>
                    }
                </View>

                <View style={SignUpStyles.inputView}>
                    {Platform.OS === 'ios' ?
                        <TouchableOpacity style={SignUpStyles.inputText} onPress={() => {open_classModal()}}>
                            <Text style={{textAlign: 'center', fontSize: 15, color: '#4682b4', position: 'absolute', top: 15,}}>
                                {_class === null ?
                                    <>선택하기</>
                                    :
                                    <>{_class}반</>
                                }
                            </Text>
                            <Modal visible={is_classModalVisible} onRequestClose={close_classModal}>
                                <View style={{ flex: 1, justifyContent: 'center'}}>
                                    <Picker
                                        selectedValue={_class}
                                        onValueChange={(value) => setClass(value)}
                                    >
                                        <Picker.Item label="1반" value="01" />
                                        <Picker.Item label="2반" value="02" />
                                        <Picker.Item label="3반" value="03" />
                                        <Picker.Item label="4반" value="04" />
                                        <Picker.Item label="5반" value="05" />
                                        <Picker.Item label="6반" value="06" />
                                        <Picker.Item label="7반" value="07" />
                                        <Picker.Item label="8반" value="08" />
                                    </Picker>
                                    <Button title="닫기" onPress={close_classModal} />
                                </View>
                            </Modal>
                        </TouchableOpacity>
                        :
                        <Picker
                            style={SignUpStyles.inputText}
                            selectedValue={_class}
                            onValueChange={(value) => setClass(value)}
                        >
                            <Picker.Item label="1반" value="01" />
                            <Picker.Item label="2반" value="02" />
                            <Picker.Item label="3반" value="03" />
                            <Picker.Item label="4반" value="04" />
                            <Picker.Item label="5반" value="05" />
                            <Picker.Item label="6반" value="06" />
                            <Picker.Item label="7반" value="07" />
                            <Picker.Item label="8반" value="08" />
                        </Picker>
                    }
                </View>

                <View style={SignUpStyles.inputView}>
                    {Platform.OS === 'ios' ?
                        <TouchableOpacity style={SignUpStyles.inputText} onPress={() => {open_numberModal()}}>
                            <Text style={{textAlign: 'center', fontSize: 15, color: '#4682b4', position: 'absolute', top: 15,}}>
                                {_number === null ?
                                    <>선택하기</>
                                    :
                                    <>{_number}번</>
                                }
                            </Text>
                            <Modal visible={is_numberModalVisible} onRequestClose={close_numberModal}>
                                <View style={{ flex: 1, justifyContent: 'center'}}>
                                    <Picker
                                        selectedValue={_number}
                                        onValueChange={(value) => setNumber(value)}
                                    >
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
                                    <Button title="닫기" onPress={close_numberModal} />
                                </View>
                            </Modal>
                        </TouchableOpacity>
                        :
                        <Picker
                            style={SignUpStyles.inputText}
                            selectedValue={_number}
                            onValueChange={(value) => setNumber(value)}
                        >
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
                    }
                </View>

                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={
                        {
                            width: '36%',
                            backgroundColor: '#fff',
                            borderRadius: 15,
                            height: 50,
                            justifyContent: 'center',
                            padding: 20,
                            borderColor: '#1E00D3',
                            borderWidth: 2,
                            marginRight: 10,
                        }
                    }>
                        <TextInput
                            style={SignUpStyles.inputText}
                            placeholder="성"
                            placeholderTextColor="#003f5c"
                            onChangeText={(text) => setFirstName(text)}
                            value={firstName}
                        />
                    </View>
                    <View style={
                        {
                            width: '36%',
                            backgroundColor: '#fff',
                            borderRadius: 15,
                            height: 50,
                            justifyContent: 'center',
                            padding: 20,
                            borderColor: '#1E00D3',
                            borderWidth: 2,
                            marginLeft: 10,
                        }
                    }>
                        <TextInput
                            style={SignUpStyles.inputText}
                            placeholder="이름"
                            placeholderTextColor="#003f5c"
                            onChangeText={(text) => setLastName(text)}
                            value={lastName}
                        />
                    </View>
                </View>

                <TouchableOpacity style={SignUpStyles.sumitBtn} onPress={handleSignUp}>
                    {isLoading === false ?
                        <Text style={SignUpStyles.sumitBtnText}>가입하기</Text>
                        :
                        <ActivityIndicator size="small" color="white"/>
                    }
                </TouchableOpacity>

                <TouchableOpacity style={SignUpStyles.signInBtn} onPress={() => navigation.navigate('Login')}>
                    <Text style={SignUpStyles.signInBtnText}>이미 계정이 있으신가요? 로그인</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    containerDark: {
        flex: 1,
        backgroundColor: '#000000',
    },
    scrollContainer: {
        alignItems: 'center',
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    scrollContainerDark: {
        alignItems: 'center',
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#000000',
    },
    backButtonContainer: {
        position: 'absolute',
        top: 16,
        left: 16,
    },
})

const SignUpStyles = StyleSheet.create({
    Title: {
        fontSize: 35,
        fontWeight: 'bold',
        marginBottom: 5,
        marginTop: 30,
        textAlign: 'center',
        color: '#000', // 다크모드에서의 글자색상
    },
    TitleDark: {
        fontSize: 35,
        fontWeight: 'bold',
        marginBottom: 5,
        marginTop: 30,
        textAlign: 'center',
        color: '#fff', // 다크모드에서의 글자색상
    },
    inputView: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 35,
        height: 50,
        marginBottom: 20,
        justifyContent: 'center',
        padding: 20,
        borderColor: '#1E00D3',
        borderWidth: 2,
    },
    inputViewDark: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 35,
        height: 50,
        marginBottom: 20,
        justifyContent: 'center',
        padding: 20,
        borderColor: '#1E00D3',
        borderWidth: 2,
    },
    inputText: {
        height: 50,
        color: '#000',
    },
    sumitBtn: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 4,
        width: '80%',
        alignItems: 'center',
        marginTop: 20,
    },
    sumitBtnText: {
        color: '#fff',
        fontSize: 16,
    },
    signInBtn: {
        marginTop: 10,
    },
    signInBtnText: {
        color: 'red',
        fontSize: 16,
    }
})