import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, FlatList, Text, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useIsFocused } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';

import axiosInstance from '../../api/API_Server';

export default function CommunityHome({ navigation }) {
    const isDarkMode = useColorScheme() === 'dark'
    const isFocused = useIsFocused()

    const [isLoading, setIsLoading] = useState(false)

    const [postType, setPostType] = useState(null)

    const [state, setState] = useState({
        postData: [],
        currentPage: 1,
        totalPages: 0,
        refreshing: false,
    })

    const communityInquiry = async (page) => {
        const params = {
            page: page? page : state.currentPage,
            limit: 10,
        }
        console.log(page, state.currentPage)
        await axiosInstance.get('/Community/postInquiry', { params })
            .then(async (res) => {
                if (res.status === 200) {
                    const data = res.data.data
                    setState((prevState) => ({
                        ...prevState,
                        postData: [...prevState.postData, ...data],
                        totalPages: res.data.totalPages,
                        currentPage: page? state.currentPage - (state.currentPage -2) : state.currentPage + 1,
                        refreshing: false
                    }))
                    setPostType(1)
                    console.log(page, state.currentPage)
                } else {
                    // 예외 발생
                    return Alert.alert('에러', '예외')
                }
            }).catch((error) => {
                console.log(error)
                const res = error.response
                if (res.status === 400) {
                    return Alert.alert('에러', '코드 400')
                } else if (res.status === 500) {
                    return Alert.alert('에러', '코드 500')
                } else {
                    // 예외발생
                    return Alert.alert('에러', '예외')
                }
            })
    }

    const renderItems = ({ item }) => {
        return (
            <TouchableOpacity key={item.id} style={[CommunityStyles.Info, isDarkMode && CommunityStyles.InfoDark]} onPress={() => navigation.navigate('Community_ViewPost', {postID: item.id})}>
                <View style={CommunityStyles.Item}>
                    <Text style={[CommunityStyles.Title, isDarkMode && CommunityStyles.TitleDark]}>{item.title}</Text>
                </View>
                <View style={CommunityStyles.Item}>
                    <Text style={[CommunityStyles.Value, isDarkMode && CommunityStyles.ValueDark]}>{item.author}   {(item.date).substr(11, 5)}   조회  {item.views}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    const loadNextPage = () => {
        communityInquiry()
    }

    const handleRefresh = () => {
        setState({
            postData: [],
            currentPage: 1,
            totalPages: 0,
            refreshing: true,
        })
        setTimeout(() => {
            communityInquiry(1)
        }, 1000)
    }

    useEffect(() => {
        communityInquiry()
    }, [])

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
            {/* 로고 */}
            <View style={{marginBottom: 50, marginTop: 10,}} >
                <Text style={[styles.logo, isDarkMode && styles.logoDark]}>커뮤니티</Text>
            </View>

            {isLoading === true ?
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator style={{top: -40, bottom: 0, left: 0, right: 0}} size="large" color="#0000ff"/>
                </View>
                :
                <>
                    {postType != null ?
                        <>
                            {/* 게시글 생성 버튼 */}
                            <TouchableOpacity style={{
                                position: 'absolute',
                                bottom: 10,
                                right: 10,
                                backgroundColor: 'blue',
                                borderRadius: 10,
                                padding: 5,
                                justifyContent: 'center',
                                alignItems: 'center',
                                zIndex: 999,
                            }} onPress={() => {navigation.navigate('Community_WritePost')}}>
                                <Icon_Ionicons name='add-circle-outline' size={40} style={{color: 'white'}}/>
                            </TouchableOpacity>

                            {/* 게시글 표시 */}
                            <FlatList 
                                data={state.postData}
                                renderItem={renderItems}
                                onEndReached={loadNextPage}
                                onEndReachedThreshold={1}
                                refreshing={state.refreshing}
                                onRefresh={handleRefresh}
                            />
                        </>
                        :
                        <>
                            <Text style={{textAlign: 'center', fontSize: 20, fontWeight: 'bold', position: 'absolute', width: '100%', marginTop: 100}}>불러올 데이터가 없습니다.</Text>
                        </>
                    }
                </>
            }
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
    logo: {
        color: 'black',
        fontSize: 30,
        fontWeight: 'bold',
        top: 20,
        left: 25,
    },
    logoDark: {
        color: 'white',
        fontSize: 30,
        fontWeight: 'bold',
        top: 20,
        left: 25,
    },
    refreshBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#ddd',
        borderRadius: 5,
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
})

const CommunityStyles = StyleSheet.create({
    logoText: {
        color: 'black',
        fontSize: 25,
        fontWeight: 'bold',
    },
    logoTextDark: {
        color: 'white',
        fontSize: 25,
        fontWeight: 'bold'
    },
    Info: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        marginBottom: 10,
        marginLeft: 10,
        width: '95%',
        maxWidth: 400,
        position: 'relative'
    },
    InfoDark: {
        backgroundColor: '#121212', // 다크모드에서의 배경색상
        padding: 20,
        borderRadius: 10,
        marginBottom: 10,
        width: '95%',
        position: 'relative',
    },
    Item: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    Value: {
        marginTop: 9,
        fontSize: 14,
        fontWeight: 'bold',
        color: 'gray', // 다크모드에서의 글자색상
    },
    ValueDark: {
        marginTop: 9,
        fontSize: 14,
        fontWeight: 'bold',
        color: 'gray', // 다크모드에서의 글자색상
    },
    Title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000', // 다크모드에서의 글자색상
    },
    TitleDark: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff', // 다크모드에서의 글자색상
    },
  })