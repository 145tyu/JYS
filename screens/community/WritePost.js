import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useIsFocused } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';

import axiosInstance from '../../api/API_Server';

export default function WritePost({ navigation }) {
    const isDarkMode = useColorScheme() === 'dark'
    const isFocused = useIsFocused()

    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')

    const handleWrite = async () => {
        const ID = await AsyncStorage.getItem('id')
        const JOB = await AsyncStorage.getItem('job')

        await axiosInstance.post('/profile', { id: ID, job: JOB })
            .then(async (res) => {
                const name = res.data.firstName + res.data.lastName
                await axiosInstance.post('/Community/postWrite', {id: ID, name: name, title: title, content: content})
                    .then((res) => {
                        if (res.status === 200) {
                            Alert.alert('성공', res.data.message)
                            return navigation.goBack()
                        } else if (res.status === 202) {
                            return Alert.alert('에러', res.data.message)
                        } else if (res.status === 500) {
                            return Alert.alert('에러', '서버에 오류가 발생했습니다.')
                        }
                    }).catch((error) => {
                        console.log(error)
                        return Alert.alert('에러')
                    })
            }).catch((error) => {
                console.log('Profile API | ', error)
                return Alert.alert('에러', error)
            })
    }

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
        {/* 로고 */}
        <View>
            <Text style={styles.logo}></Text>
        </View>

        <TouchableOpacity style={Platform.OS === 'ios' ? {...styles.backButtonContainer, marginTop: 50} : {...styles.backButtonContainer}} onPress={() => navigation.goBack()}>
            <Icon_Ionicons name='arrow-back-outline' size={30} style={[{color: 'black'}, isDarkMode && {color: 'white'}]}></Icon_Ionicons>
        </TouchableOpacity>

        <TouchableOpacity style={Platform.OS === 'ios' ? {position: 'absolute', top: 20, right: 16, marginTop: 50} : {position: 'absolute', top: 20, right: 16}} onPress={handleWrite}>
            <Text style={{textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: 'blue'}}>글쓰기</Text>
        </TouchableOpacity>
        
        <ScrollView>
            <View style={[WritePostStyles.titleView, isDarkMode && WritePostStyles.titleViewDark]}>
                <TextInput
                    style={WritePostStyles.titleText}
                    placeholder="제목"
                    multiline
                    placeholderTextColor="#333"
                    onChangeText={(text) => setTitle(text)}
                />
            </View>
            <View style={[WritePostStyles.contentView, isDarkMode && WritePostStyles.contetnViewDark]}>
                <TextInput
                    style={WritePostStyles.contentText}
                    placeholder="내용을 입력하세요."
                    multiline
                    placeholderTextColor="#333"
                    onChangeText={(text) => setContent(text)}
                />
            </View>
        </ScrollView>
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
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
        textAlign: 'center',
    },
    backButtonContainer: {
        position: 'absolute',
        top: 16,
        left: 16,
    },
})

const WritePostStyles = StyleSheet.create({
    titleView: {
        width: '100%',
        backgroundColor: 'white',
        justifyContent: 'center',
        paddingLeft: 20,
        paddingRight: 20,
        borderTopWidth: 1,  // 아랫면 줄의 두께
        borderColor: 'black',  // 줄의 색상
    },
    titleViewDark: {
        width: '100%',
        backgroundColor: 'black',
        justifyContent: 'center',
        paddingLeft: 20,
        paddingRight: 20,
        borderBottomWidth: 1,  // 아랫면 줄의 두께
        borderColor: 'white',  // 줄의 색상
    },
    titleText: {
        height: 70,
        fontSize: 25,
        fontWeight: 'bold',
    },
    contentView: {
        width: '100%',
        backgroundColor: 'white',
        justifyContent: 'center',
        paddingLeft: 20,
        paddingRight: 20,
        borderTopWidth: 1,
        borderColor: 'black',  // 줄의 색상
    },
    contetnViewDark: {
        width: '100%',
        backgroundColor: 'black',
        justifyContent: 'center',
        paddingLeft: 20,
        paddingRight: 20,
    },
    contentText: {
        width: '100%',
        fontSize: 18,
    },
})
