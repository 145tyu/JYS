import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl, ScrollView, View, Text, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Entypo from 'react-native-vector-icons/Entypo';

import axiosInstance from '../../api/API_Server';
import { MoveScreen } from '../../api/MoveScreen';

const daysOfWeek = ['월', '화', '수', '목', '금']
const times = ['1교시', '2교시', '3교시', '4교시', '5교시', '6교시', '7교시', '8교시']

export default function NotificationHomeScreen({ navigation }) {
  const isDarkMode = useColorScheme() === 'dark'

  const [refreshing, setRefreshing] = useState(false)

  const [notificationData, setNotificationData] = useState([])
  const [notificationType, setNotificationType] = useState(null)

  const handleGetNotificationData = () => {
    AsyncStorage.getItem('Notification_List')
      .then((data) => {
        if (data) {
          const parseData = JSON.parse(data)
          const reversedData = parseData.reverse()
          //AsyncStorage.removeItem('Notification_List')
          setNotificationData(reversedData)
          setNotificationType(1)
        } else {
          setNotificationType(0)
        }
      }).catch((error) => {
        setNotificationType(0)
        console.log(error)
      })
  }

  const handleRefresh = () => {
    setRefreshing(true)

    handleGetNotificationData()

    setRefreshing(false)
  }

  useEffect(() => {
    handleGetNotificationData()
  }, [])

  return (
    <SafeAreaView style={[{ ...styles.container, backgroundColor: '#FFFFFF', }, isDarkMode && { ...styles.container, backgroundColor: '#000000', }]}>
      {/* 로고 */}
      <View style={styles.logoView}>
        <Text style={[{ ...styles.logo, color: '#000000', }, isDarkMode && { ...styles.logo, color: '#ffffff', }]}>알림</Text>
      </View>

      {notificationType === null ?
        <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', }}>
          <ActivityIndicator size="large" color="green" />
        </View>
        :
        <>
          {notificationType === 0 &&
            <View style={{ ...StyleSheet.absoluteFillObject, ...styles.MessageContainer, }}>
              <Text style={[{ ...styles.Message, color: '#666666', }, isDarkMode && { ...styles.Message, color: '#999999', },]}>알림이 없거나 불러오지 못했어요.</Text>

              <View style={{ ...StyleSheet.absoluteFillObject, ...styles.refresBtnContainer, }}>
                <TouchableOpacity onPress={() => { handleRefresh() }} style={{ ...styles.refresBtn, }}>
                  <Text style={{ textAlign: 'center', color: '#ffffff', }}>다시시도</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          {notificationType === 1 &&
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />} contentContainerStyle={[{ ...styles.scrollContainer, backgroundColor: '#FFFFFF', }, isDarkMode && { ...styles.scrollContainer, backgroundColor: '#000000', }]}>
              {notificationData.map((data, index) => {
                return (
                  <View key={index} style={{ ...styles.InfoContainer, }}>
                    <TouchableOpacity key={index} style={[{ ...styles.Info, backgroundColor: '#f2f4f6', }, isDarkMode && { ...styles.Info, backgroundColor: '#121212', }]} onPress={() => {
                      const ScreenType = data.data.screenType
                      const ScreenData = (data.data.screenData).split(',')

                      if (ScreenType === 'community_Post') { // 알림 유형 : 게시글
                        navigation.navigate('Community_ViewPost', { postID: ScreenData[0] })
                      } else if (ScreenType === 'community_Comment') { // 알림 유형 : 댓글
                        navigation.navigate('Community_WriteComments', { postID: ScreenData[0] })
                      } else if (ScreenType === 'community_Replie') { // 알림 유형 : 답글
                        navigation.navigate('Community_WriteReplies', { commentsID: ScreenData[0], postID: ScreenData[1] })
                      } else if (data.screenType === 'Announcement_ViewPost') {  // 알림 유형 : 공지
                        navigation.navigate('Announcement_ViewPost', { postID: ScreenData[0] })
                      } else { // 알림 유형 : 없음
                        navigation.navigate('Notification_Tab_Home')
                      }
                    }}>
                      <View style={styles.Item}>
                        <Text style={[{ ...styles.Title, width: '85%', color: '#000000', }, isDarkMode && { ...styles.Title, width: '85%', color: '#ffffff', }]}>{data.notification ? data.notification.title : `알림${index}`}</Text>
                      </View>

                      <View style={styles.Item}>
                        <Text style={[{ ...styles.Value, color: '#000000', }, isDarkMode && { ...styles.Value, color: '#ffffff', }]}>{data.notification.body}</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )
              })}
            </ScrollView>
          }
        </>
      }
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoView: {
    marginBottom: 50,
    marginTop: 10
  },
  logo: {
    top: 20,
    left: 25,
    width: '20%',
    fontSize: 30,
    fontWeight: 'bold',
  },
  InfoContainer: {
    paddingLeft: 8,
    paddingRight: 8,
  },
  Info: {
    backgroundColor: '#f2f4f6',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 17,
    borderRadius: 10,
    marginBottom: 10,
    width: 'auto',
    position: 'relative',
  },
  Item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  Title: {
    fontSize: 18,
    fontWeight: 'bold',
    width: '85%',
  },
  Value: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: 'bold',
  },
  MessageContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  Message: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    position: 'absolute',
    width: '100%',
    marginTop: 100,
  },
  refresBtnContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 100,
  },
  refresBtn: {
    width: '30%',
    backgroundColor: '#EB4E45',
    borderRadius: 10,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
})