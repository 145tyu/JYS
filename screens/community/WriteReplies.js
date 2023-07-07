import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useIsFocused } from '@react-navigation/native';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';
import Icon_Entypo from 'react-native-vector-icons/Entypo';

import axiosInstance from '../../api/API_Server';

export default function WriteReplies ({ navigation }) {
  const route = useRoute()
  const { commentID, postID } = route.params

  const isDarkMode = useColorScheme() === 'dark'
  const isFocused = useIsFocused()

  const [commentsData, setCommentsData] = useState(null)
  const [commentsType, setCommentsType] = useState(null)

  const [repliesData, setRepliesData] = useState(null)
  const [repliesType, setRepliesType] = useState(null)

  const [repliesForm, setRepliesForm] = useState('')

  const commentCheck = async() => {
    await axiosInstance.post('/Community/commentCheck', { postID: postID })
        .then((res) => {
            setCommentsData(res.data.data)
            setCommentsType(1)
        }).catch((error) => {
            console.log(error)
            setCommentsType(0)
        })
  }

  const repliesCheck = async() => {
    await axiosInstance.post('/Community/repliesCheck', { postID: postID })
        .then((res) => {
            setRepliesData(res.data.data)
            setRepliesType(1)
        }).catch((error) => {
            console.log(error)
            setRepliesType(0)
        })
  }

  const handleRepliesForm = async() => {
    AsyncStorage.getItem('id') // 'ID' 가져오기
        .then(async (ID) => {
            await axiosInstance.post('/Community/repliesForm', { accountID: ID, commentID, postID: postID, content: repliesForm })
                .then((res) => {
                    if (res.status === 200) {
                        commentCheck()
                        repliesCheck()
                        setRepliesForm('')
                    }
                }).catch((error) => {
                    console.log(error)
                })
        }).catch((error) => {
            console.log(postID)
        })
  }

  useEffect(() => {
    console.log(commentID, postID)
    commentCheck()
    repliesCheck()
  }, [isFocused])

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
        {commentsType === null && repliesType === null ?
            <View style={{...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center',}}>
                <ActivityIndicator size="large" color="green"/>
            </View>
            :
            <>
                {/* 로고 */}
                <View style={styles.logoView} >
                    <TouchableOpacity style={Platform.OS === 'ios' ? {...styles.backButtonView, marginTop: 50} : {...styles.backButtonView}} onPress={() => navigation.goBack()}>
                        <Icon_Ionicons name='arrow-back-outline' size={30} style={[styles.backButtonIcon, isDarkMode && styles.backButtonIconDark]}/>
                    </TouchableOpacity>
                    <Text style={[styles.logoText, isDarkMode && styles.logoTextDark]}>답글쓰기</Text>
                </View>

                <ScrollView style={[styles.scrollContainer, isDarkMode && styles.scrollContainerDark]}>
                    {/* 댓글 */}
                    {commentsType === 1 && commentsData != null &&
                        <>
                            {commentsData.map((data) => {
                                if (data.id === commentID) {
                                    return (
                                        <View key={data.id} style={{flex: 1, marginTop: 20,}}>
                                            {/* 아이콘 */}
                                            <View>
                                                <View style={{ width: 40, height: 40, left: 7, borderRadius: 25, backgroundColor: '#dcdcdc', position: 'absolute'}}></View>
                                                <Icon_Feather name='user' size={20} style={{ left: 17, top: 8, borderRadius: 25, color: 'black', position: 'absolute'}}/>
                                            </View>
                        
                                            {/* 사용자ID */}
                                            <Text style={{paddingLeft: 60, marginTop: 8, width: '100%', color: 'black', position: 'absolute'}}>{data.author}ㆍ{(data.date).substr(11, 5)}</Text>
                                            {/* 댓글 내용 */}
                                            <Text style={{paddingLeft: 60, paddingRight: 10, marginTop: 35, marginBottom: 20, fontWeight: '400', color: 'black'}}>{data.content}</Text>
                                            
                                            {/* 대댓글 */}
                                            {repliesType === 1 && repliesData != null &&
                                                <>
                                                    {repliesData.map((_data) => {
                                                        if (data.id === _data.comment_id) {
                                                            return (
                                                                <View key={_data.reply_id} style={{flex: 1}}>
                                                                    {/* 아이콘 */}
                                                                    <View>
                                                                        <View style={{ width: 30, height: 30, left: 53, borderRadius: 25, backgroundColor: '#dcdcdc', position: 'absolute'}}></View>
                                                                        <Icon_Feather name='user' size={15} style={{ left: 60, top: 7, borderRadius: 25, color: 'black', position: 'absolute'}}/>
                                                                    </View>
                                            
                                                                    {/* 사용자ID */}
                                                                    <Text style={{paddingLeft: 95, marginTop: 6, width: '100%', color: 'black', position: 'absolute'}}>{_data.author}ㆍ{(_data.date).substr(11, 5)}</Text>
                                                                    {/* 댓글 내용 */}
                                                                    <Text style={{paddingLeft: 95, paddingRight: 30, marginTop: 35, marginBottom: 20, fontWeight: '400', color: 'black'}}>{_data.content}</Text>
                                                                </View>
                                                            )
                                                        }
                                                    })}
                                                </>
                                            }
                                        </View>
                                    )
                                }
                            })}
                        </>
                    }

                    {/* 경계선 */}
                    <View style={{ width: '100%', height: 1, marginTop: 20, marginBottom: 10, backgroundColor: 'gray', justifyContent: 'center'}}></View>
                    
                    {/* 댓글달기 */}
                    <View style={{ width: '100%', height: 50, marginBottom: 10,}}>
                        {/* 아이콘 */}
                        <View>
                            <View style={{ width: 40, height: 40, left: 7, top: 5, borderRadius: 25, backgroundColor: '#dcdcdc', position: 'absolute'}}></View>
                            <Icon_Feather name='user' size={20} style={{ left: 17, top: 13, borderRadius: 25, color: 'black', position: 'absolute'}}/>
                        </View>
                        <TextInput
                            style={{marginLeft: 60, height: 50, color: 'black'}}
                            placeholder='답글을 입력하세요.'
                            placeholderTextColor='black'
                            value={repliesForm}
                            onChangeText={(text) => setRepliesForm(text)}
                        />
                        <TouchableOpacity style={{width: '15%', height: 35, top: 5, right: 10, borderRadius: 20, justifyContent: 'center', backgroundColor: 'blue', position: 'absolute'}} onPress={handleRepliesForm}>
                            <Text style={{textAlign: 'center', color: 'white'}}>전송</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </>
        }
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
        backgroundColor: 'white',
        paddingLeft: 10,
        paddingRight: 10,
    },
    scrollContainerDark: {
        backgroundColor: '#000000',
    },
    logoView: {
        height: '8%',  
        justifyContent: 'center',
        backgroundColor: 'gray'
    },
    logoText: {
        fontSize: 21,
        fontWeight: 'bold',
        marginLeft: 60,
        color: 'white',
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
        color: 'white',
    },
    backButtonIconDark: {
        color: 'white',
    }
})

const ViewPostStyle = StyleSheet.create({
    Info: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        marginBottom: 10,
        width: '100%',
        position: 'relative'
    },
    InfoDark: {
        backgroundColor: '#121212', // 다크모드에서의 배경색상
        padding: 20,
        borderRadius: 10,
        marginBottom: 10,
        width: '100%',
        position: 'relative',
    },
    Title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000', // 다크모드에서의 글자색상
    },
    TitleDark: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff', // 다크모드에서의 글자색상
    },
    TitleFooter: {
        marginTop: 9,
        fontSize: 14,
        fontWeight: 'bold',
        color: 'gray', // 다크모드에서의 글자색상
    },
    TitleFooterDark: {
        marginTop: 9,
        fontSize: 14,
        fontWeight: 'bold',
        color: 'gray', // 다크모드에서의 글자색상
    },
    ContentsText: {
        marginTop: 20,
        fontSize: 15,
        color: 'black',
        fontWeight: 'normal',
    },
    ContentsTextDark: {
        marginTop: 20,
        fontSize: 15,
        color: 'white',
        fontWeight: 'normal',
    },
})