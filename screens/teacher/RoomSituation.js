import React, { useEffect, useState } from "react";
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';

import axiosInstance from "../../api/API_Server";

export default function RoomSituation({ navigation }) {
    const isDarkMode = useColorScheme() === 'dark'

    const [roomStatusStateType, setRoomStatusStateType] = useState(null)
    const [roomStatusMessage, setRoomStatusMessage] = useState(null)
    const [roomStatusInfo, setRoomStatusInfo] = useState(null)

    const [RoomCondition_1, setRoomCondition_1] = useState(null)
    const [RoomName_1, setRoomName_1] = useState(null)
    const [UseStudentInfor_1, setUseStudentInfor_1] = useState(null)
    const [Time_1, setTime_1] = useState(null)

    const [RoomCondition_2, setRoomCondition_2] = useState(null)
    const [RoomName_2, setRoomName_2] = useState(null)
    const [UseStudentInfor_2, setUseStudentInfor_2] = useState(null)
    const [Time_2, setTime_2] = useState(null)

    const [RoomCondition_3, setRoomCondition_3] = useState(null)
    const [RoomName_3, setRoomName_3] = useState(null)
    const [UseStudentInfor_3, setUseStudentInfor_3] = useState(null)
    const [Time_3, setTime_3] = useState(null)

    const [RoomCondition_4, setRoomCondition_4] = useState(null)
    const [RoomName_4, setRoomName_4] = useState(null)
    const [UseStudentInfor_4, setUseStudentInfor_4] = useState(null)
    const [Time_4, setTime_4] = useState(null)

    const roomStatusData = async () => {
        setRoomStatusStateType(null)
        try {
            await axiosInstance.post('/RoomRental/RoomStatus')
                .then((res)=>{
                    if (res.status === 200) {
                        if (res.data.type === 1) {
                            setRoomStatusInfo(res.data.formdata)
                            setRoomStatusStateType(1)
                            // setTimeout(() => {
                            //     setRoomStatusStateType(1)
                            // }, 4000)
                        }
                    } else {
                        return Alert.alert('에러', '요청에 실패했습니다.', [
                            {
                                text: '다시시도',
                                onPress: () => {
                                    roomStatusData()
                                }
                            }
                        ])
                    }
                })
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        roomStatusData()
    }, [])

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
            {/* 로고 */}
            <Text style={styles.logo}>JYS</Text>

            <TouchableOpacity style={RoomSituationStyles.refreshBtn} onPress={roomStatusData}>
                <Icon_Ionicons name='reload-outline' size={20} style={[{color: 'black'}, isDarkMode && {color: 'white'}]}/>
            </TouchableOpacity>

            {roomStatusStateType === null ?
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator style={{top: -40, bottom: 0, left: 0, right: 0}} size="large" color="#0000ff"/>
                </View>
                :
                <ScrollView contentContainerStyle={[styles.scrollContainer, isDarkMode && styles.scrollContainerDark]}>
                    {roomStatusStateType === 1 ?
                        <>
                            {roomStatusInfo.map((data) => {
                                if (data.is_available === 0) {
                                    return (
                                        <View key={data.id} style={[RoomSituationStyles.Info, isDarkMode && RoomSituationStyles.InfoDark]}>
                                            <View style={RoomSituationStyles.Item}>
                                                <Text style={[RoomSituationStyles.Label, isDarkMode && RoomSituationStyles.LabelDark]}>{data.name}</Text>
                                            </View>
                                            <View style={RoomSituationStyles.Item}>
                                                <Text style={[RoomSituationStyles.Value, isDarkMode && RoomSituationStyles.ValueDark]}>부스가 비어있어요.</Text>
                                                <View style={RoomSituationStyles.greenCircle}/>
                                            </View> 
                                        </View>
                                    )
                                } else if (data.is_available === 1) {
                                    return (
                                        <View key={data.id} style={[RoomSituationStyles.Info, isDarkMode && RoomSituationStyles.InfoDark]}>
                                            <View style={RoomSituationStyles.Item}>
                                                <Text style={[RoomSituationStyles.Label, isDarkMode && RoomSituationStyles.LabelDark]}>{data.name}</Text>
                                            </View>

                                            <View style={RoomSituationStyles.Item}>
                                                <View style={RoomSituationStyles.redCircle} />
                                            </View>

                                            <View style={RoomSituationStyles.Item}>
                                                <Text style={[RoomSituationStyles.Value, isDarkMode && RoomSituationStyles.ValueDark]}>학번 : </Text>
                                                <Text style={[RoomSituationStyles.Value, isDarkMode && RoomSituationStyles.ValueDark]}>{data.studentID}</Text>
                                            </View>

                                            <View style={RoomSituationStyles.Item}>
                                                <Text style={[RoomSituationStyles.Value, isDarkMode && RoomSituationStyles.ValueDark]}>이름 : </Text>
                                                <Text style={[RoomSituationStyles.Value, isDarkMode && RoomSituationStyles.ValueDark]}>{data.first_name}{data.last_name}</Text>
                                            </View>

                                            <View style={RoomSituationStyles.Item}>
                                                <Text style={[RoomSituationStyles.Value, isDarkMode && RoomSituationStyles.ValueDark]}>수락자 : </Text>
                                                <Text style={[RoomSituationStyles.Value, isDarkMode && RoomSituationStyles.ValueDark]}>{data.acceptor}</Text>
                                            </View>

                                            <View style={RoomSituationStyles.Item}>
                                                <Text style={[RoomSituationStyles.Value, isDarkMode && RoomSituationStyles.ValueDark]}>시작 시간 : </Text>
                                                <Text style={[RoomSituationStyles.Value, isDarkMode && RoomSituationStyles.ValueDark]}>{data.start_time}</Text>
                                            </View>

                                            <View style={RoomSituationStyles.Item}>
                                                <Text style={[RoomSituationStyles.Value, isDarkMode && RoomSituationStyles.ValueDark]}>종료 시간 : </Text>
                                                <Text style={[RoomSituationStyles.Value, isDarkMode && RoomSituationStyles.ValueDark]}>{data.end_time}</Text>
                                            </View>
                                        </View>
                                    )
                                }
                            })}
                        </>
                        :
                        null
                    }
                </ScrollView>
            }
        </SafeAreaView>
    );
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
   
const RoomSituationStyles = StyleSheet.create({
    Info: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        marginBottom: 15,
        marginLeft: 10,
        marginRight: 10,
        width: '95%',
        maxWidth: 400,
    },
    InfoDark: {
        backgroundColor: '#121212', // 다크모드에서의 배경색상
        padding: 20,
        borderRadius: 10,
        marginBottom: 15,
        marginLeft: 10,
        marginRight: 10,
        width: '95%',
        maxWidth: 400,
        borderColor: '#FFFFFF', // 다크모드에서의 테두리 색상
        borderWidth: 1,
    },
    Item: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    Label: {
        fontSize: 18,
        fontWeight: 'bold',
        width: 100,
        marginRight: 1,
        color: '#000', // 다크모드에서의 글자색상
    },
    LabelDark: {
        fontSize: 18,
        fontWeight: 'bold',
        width: 100,
        marginRight: 1,
        color: '#fff', // 다크모드에서의 글자색상
    },
    Value: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000', // 다크모드에서의 글자색상
    },
    ValueDark: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff', // 다크모드에서의 글자색상
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
    redCircle: {
        width: 13,
        height: 13,
        borderRadius: 25,
        backgroundColor: 'red',
        position: 'absolute',
        top: -45,
        right: -5
    },
    greenCircle: {
        width: 13,
        height: 13,
        borderRadius: 25,
        backgroundColor: 'green',
        position: 'absolute',
        top: -45,
        right: -5
    },
})