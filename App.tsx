import React, { useEffect, useState, } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal, Button } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';

import StartScreen from './screens/Start';
import LoginScreen from './screens/Login';

import Setting_HomeScreen from './screens/Setting/SettingHome'
import Setting_setNotificationScreen from './screens/Setting/notification/setNotification';

import S_SignUp_Welcome from './screens/SignUp/student/Welcome';
import S_SignUp_ToS from './screens/SignUp/student/ToS';
import S_SignUp_Email from './screens/SignUp/student/Email';
import S_SignUp_Account from './screens/SignUp/student/Account';
import S_SignUp_StudentID from './screens/SignUp/student/StudentID';
import S_SignUp_CheckStudentID from './screens/SignUp/student/CheckStudentID';
import S_SignUp_LastCheck from './screens/SignUp/student/LastCheck';
import S_SignUp_Success from './screens/SignUp/student/Success';

import S_HomeScreen from './screens/student/StudentHome';
import S_AllTab from './screens/student/AllTab';
import S_RoomRental from './screens/student/RoomRental';
import S_RoomCancel from './screens/student/RoomCancel';

import T_HomeScreen from './screens/teacher/TeacherHome';
import T_AllTab from './screens/teacher/AllTab';
import T_RoomSituation from './screens/teacher/RoomSituation';

import Profile_View from './screens/Profile/ViewProfile';
import Profile_Edit from './screens/Profile/EditProfile';
import Profile_Edit_Email from './screens/Profile/EditEmail';
import Profile_Edit_Password from './screens/Profile/EditPassword';
import Profile_DeleteAccount from './screens/Profile/DeleteAccount';

import Community_Home from './screens/Community/CommunityHome';
import Community_ViewPost from './screens/Community/ViewPost';
import Community_WritePost from './screens/Community/WritePost';
import Community_WriteComments from './screens/Community/WriteComments';
import Community_WriteReplies from './screens/Community/WriteReplies';

import Bus_Home from './screens/Bus/BusHome';
import Bus_AddBusStopID from './screens/Bus/AddBusStopID';
import Bus_Search from './screens/Bus/BusSearch';
import Bus_RouteView from './screens/Bus/RouteView';
import Bus_BusStopView from './screens/Bus/BusStopView';

import Announcement_Home from './screens/Announcement/AnnouncementHome';
import Announcement_WritePost from './screens/Announcement/WriteAnnouncement';
import Announcement_ViewPost from './screens/Announcement/AnnouncementViewPost';

import Timetable_Home from './screens/Timetable/TimetableHome';

import Notification_Home from './screens/Notification/home';

import Meal_Home from './screens/Meal/MealHome';

import Credits_Home from './screens/Credits/Credits'

import WebView_ysit from './screens/WebView/ysit'
import WebView_SejongJangYeongsilHighSchool from './screens/WebView/SejongJangYeongsilHighSchool'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function S_Tab() {
  const isDarkMode = useColorScheme() === 'dark'
  return (
    <Tab.Navigator screenOptions={{
      tabBarActiveTintColor: isDarkMode ? '#FFFFFF' : '#000',
      tabBarInactiveTintColor: isDarkMode ? '#BEBEBE' : '#8e8e8e',
      tabBarStyle: {
        backgroundColor: isDarkMode ? '#222' : '#fff',
      },
      tabBarLabelStyle: {
        fontSize: 9,
        fontWeight: 'bold',
      },
    }}>
      <Tab.Screen
        name="S_Tab_Home"
        component={S_HomeScreen}
        options={{
          title: '홈',
          headerShown: false,
          tabBarShowLabel: true,
          tabBarIcon: ({ color, size }) => (
            <Icon_Feather name='home' color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="S_Tab_Timetable"
        component={Timetable_Home}
        options={{
          title: '시간표',
          headerShown: false,
          tabBarShowLabel: true,
          tabBarIcon: ({ color, size }) => (
            <Icon_Feather name='calendar' color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name='Community_Tab_Home'
        component={Community_Home}
        options={{
          title: '커뮤니티',
          headerShown: false,
          tabBarShowLabel: true,
          tabBarIcon: ({ color, size }) => (
            <Icon_Feather name='message-circle' color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Notification_Tab_Home"
        component={Notification_Home}
        options={{
          title: '알림',
          headerShown: false,
          tabBarShowLabel: true,
          tabBarIcon: ({ color, size }) => (
            <Icon_Feather name='bell' color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name='S_Tab_AllTab'
        component={S_AllTab}
        options={{
          title: '전체',
          headerShown: false,
          tabBarShowLabel: true,
          tabBarIcon: ({ color, size }) => (
            <Icon_Feather name='menu' color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

function T_Tab() {
  const isDarkMode = useColorScheme() === 'dark'
  return (
    <Tab.Navigator screenOptions={{
      tabBarActiveTintColor: isDarkMode ? '#FFFFFF' : '#000',
      tabBarInactiveTintColor: isDarkMode ? '#BEBEBE' : '#8e8e8e',
      tabBarStyle: {
        backgroundColor: isDarkMode ? '#222' : '#fff',
      },
      tabBarLabelStyle: {
        fontSize: 9,
        fontWeight: 'bold',
      },
    }}>
      <Tab.Screen
        name="T_Tab_Home"
        component={T_HomeScreen}
        options={{
          title: '홈',
          headerShown: false,
          tabBarShowLabel: true,
          tabBarIcon: ({ color, size }) => (
            <Icon_Feather name='home' color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name='T_Tab_Announcement'
        component={Announcement_Home}
        options={{
          title: '공지',
          headerShown: false,
          tabBarShowLabel: true,
          tabBarIcon: ({ color, size }) => (
            <Icon_Feather name='radio' color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name='Community_Tab_Home'
        component={Community_Home}
        options={{
          title: '커뮤니티',
          headerShown: false,
          tabBarShowLabel: true,
          tabBarIcon: ({ color, size }) => (
            <Icon_Feather name='message-circle' color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Notification_Tab_Home"
        component={Notification_Home}
        options={{
          title: '알림',
          headerShown: false,
          tabBarShowLabel: true,
          tabBarIcon: ({ color, size }) => (
            <Icon_Feather name='bell' color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name='T_Tab_AllTab'
        component={T_AllTab}
        options={{
          title: '전체',
          headerShown: false,
          tabBarShowLabel: true,
          tabBarIcon: ({ color, size }) => (
            <Icon_Feather name='menu' color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

async function requestUserPermission() {
  try {
    // 알림 허용 데이터가 있는지 확인
    await AsyncStorage.getItem('Notification_Allowed_Status')
      .then(async (res) => {
        if (res === null) {
          // 알림을 허용상태로 설정
          await AsyncStorage.setItem('Notification_Allowed_Status', 'true')
        } else {
          console.log('Permission | 알림 허용 초기 데이터가 존재합니다', res)
        }
      }).catch((error) => {
        console.log(error)
      })

    if (Platform.OS === 'android') { // 플랫폼이 안드로이드
      check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS)
        .then(async (res) => {
          if (res === RESULTS.GRANTED) { // 이미 허용 상태
            console.log('Permission | Permission has already been granted.')
          } else { // 허용이 아님, 권한 요청
            console.log('Permission | Request permission.')
            await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS)
              .then(async (newRes) => {
                if (newRes === RESULTS.GRANTED) { // 권한을 허용
                  await AsyncStorage.setItem('Notification_Allowed_Status', 'true')
                  console.log('Permission | Permission granted.')
                } else if (newRes === RESULTS.UNAVAILABLE) {
                  console.log('Permission | Permission unavailable.')
                } else { // 권한을 허용하지 않음
                  await AsyncStorage.setItem('Notification_Allowed_Status', 'false')
                  console.log('Permission | Permission denied.')
                }
              }).catch((error) => {
                console.log('Permission | Permission check error.', error)
              })
          }
        })
    } else if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission()
      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL

      if (enabled) {
        AsyncStorage.setItem('Notification_Allowed_Status', 'true')
        console.log('Permission | Permission granted.')
      } else {
        AsyncStorage.setItem('Notification_Allowed_Status', 'false')
        console.log('Permission | Permission denied.')
      }
    } else {
      console.log('Permission | This OS is not supported.')
    }
  } catch (error) {
    console.log('Permission | Permission verification failed.')
    console.log(error)
  }
}

const SaveNotification = (remoteMessage: any) => {
  AsyncStorage.getItem('Notification_List')
    .then((data) => {
      if (data) {
        // 기존 데이터를 유지하며 저장
        const tempData = JSON.parse(data)
        tempData.push(remoteMessage)
        AsyncStorage.setItem('Notification_List', JSON.stringify(tempData))
      } else {
        // 데이터를 처음 저장
        const tempData = []
        tempData.push(remoteMessage)
        AsyncStorage.setItem('Notification_List', JSON.stringify(tempData))
      }
    }).catch((error) => {
      console.log('SaveNotification | ', error)
    })
}

const App = () => {
  const navigationRef: any = React.createRef()

  const isDarkMode = useColorScheme() === 'dark'

  const [isModalVisible, setModalVisible] = useState(false)
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationContent, setNotificationContent] = useState('')

  useEffect(() => {
    const onNotificationOpenedAppListener = messaging().onNotificationOpenedApp((notificationOpen) => {
      SaveNotification(notificationOpen) // 알림 데이터를 저장

      if (Platform.OS === 'android') {
        const data: any = notificationOpen.data
        if (data.screenType === 'community_Post') { // 알림 유형 : 게시글
          const ScreenData = (data.screenData).split(',')
          navigationRef.current.navigate('Community_ViewPost', { postID: ScreenData[0] })
        } else if (data.screenType === 'community_Comment') { // 알림 유형 : 댓글
          const ScreenData = (data.screenData).split(',')
          navigationRef.current.navigate('Community_WriteComments', { postID: ScreenData[0] })
        } else if (data.screenType === 'community_Replie') { // 알림 유형 : 답글
          const ScreenData = (data.screenData).split(',')
          navigationRef.current.navigate('Community_WriteReplies', { commentsID: ScreenData[0], postID: ScreenData[1] })
        } else if (data.screenType === 'Announcement_ViewPost') { // 알림 유형 : 공지
          const ScreenData = (data.screenData).split(',')
          navigationRef.current.navigate('Announcement_ViewPost', { postID: ScreenData[0] })
        } else { // 알림 유형 : 없음
          navigationRef.current.navigate('Notification_Tab_Home')
        }
      }
    }) // 알림 열기 이벤트 핸들링

    const onMessageListener = messaging().onMessage(async (remoteMessage: any) => {
      SaveNotification(remoteMessage)  // 알림 데이터를 저장

      setNotificationTitle(remoteMessage.notification.title ? remoteMessage.notification.title : '새로운 알림이 도착했습니다.')
      setNotificationContent(remoteMessage.notification.body ? remoteMessage.notification.body : '불러오지 못했어요.')

      setModalVisible(true)

      setTimeout(() => {
        setModalVisible(false)
      }, 10000)
    }) // 새로운 메시지 도착 시 핸들링

    const processInitialNotification = async () => {
      const initialNotification = await messaging().getInitialNotification()
      if (initialNotification) {
        AsyncStorage.setItem('initialNotification', JSON.stringify(initialNotification)) // 임시 알림 데이터를 저장
        SaveNotification(initialNotification) // 알림 데이터를 저장
      }
    } // 초기 알림 처리

    requestUserPermission() // 알림 권한 요청 호출
    processInitialNotification() // 초기 알림 처리 호출

    return () => {
      onMessageListener()
      onNotificationOpenedAppListener()
    }
  }, [])

  return (
    <>
      {isModalVisible === true &&
        <SafeAreaView style={{ flex: 1, position: 'absolute', zIndex: 999, top: 10, left: 10, right: 10 }}>
          <TouchableOpacity onPress={() => {
            navigationRef.current.navigate('Notification_Tab_Home')
            setModalVisible(false)
          }}>
            <View style={[{ flex: 1, height: 70, justifyContent: 'center', borderRadius: 20, backgroundColor: '#f2f4f6', }, isDarkMode && { flex: 1, height: 70, justifyContent: 'center', borderRadius: 20, backgroundColor: '#121212', }]}>
              <View style={{ width: 43, height: 43, marginLeft: 20, borderRadius: 10, position: 'absolute', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
                <FastImage style={{ width: 33, height: 33 }} source={require('./resource/logo_v1.png')} />
              </View>

              <Text style={[{ marginLeft: 75, fontWeight: 'bold', fontSize: 15, color: '#000000' }, isDarkMode && { marginLeft: 75, fontWeight: 'bold', fontSize: 15, color: '#ffffff' }]}>{notificationTitle}</Text>
              <Text style={[{ marginLeft: 75, fontWeight: '500', fontSize: 15, color: '#000000' }, isDarkMode && { marginLeft: 75, fontWeight: '500', fontSize: 15, color: '#ffffff' }]}>{notificationContent}</Text>
            </View>
          </TouchableOpacity>
        </SafeAreaView>
      }

      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator>
          <Stack.Screen name="Start" component={StartScreen} options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false, animation: 'fade' }} />

          <Stack.Screen name="Setting_Home" component={Setting_HomeScreen} options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="Setting_setNotification" component={Setting_setNotificationScreen} options={{ headerShown: false, animation: 'fade' }} />

          <Stack.Screen name="SignUp_Welcome" component={S_SignUp_Welcome} options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="SignUp_ToS" component={S_SignUp_ToS} options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="SignUp_Email" component={S_SignUp_Email} options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="SignUp_Account" component={S_SignUp_Account} options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="SignUp_StudentID" component={S_SignUp_StudentID} options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="SignUp_CheckStudentID" component={S_SignUp_CheckStudentID} options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="SignUp_LastCheck" component={S_SignUp_LastCheck} options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="SignUp_Success" component={S_SignUp_Success} options={{ headerShown: false, animation: 'fade' }} />

          <Stack.Screen name="S_Home" component={S_Tab} options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="S_RoomRental" component={S_RoomRental} options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="S_RoomCancel" component={S_RoomCancel} options={{ headerShown: false, animation: 'fade' }} />

          <Stack.Screen name="T_Home" component={T_Tab} options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="T_AllTab" component={T_AllTab} options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="T_RoomSituation" component={T_RoomSituation} options={{ headerShown: false, animation: 'fade' }} />

          <Stack.Screen name="Profile_View" component={Profile_View} options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="Profile_Edit" component={Profile_Edit} options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="Profile_Edit_Email" component={Profile_Edit_Email} options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="Profile_Edit_Password" component={Profile_Edit_Password} options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="Profile_Delete_Account" component={Profile_DeleteAccount} options={{ headerShown: false, animation: 'fade' }} />

          <Stack.Screen name="Community_Home" component={S_Tab} options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="Community_ViewPost" component={Community_ViewPost} options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="Community_WritePost" component={Community_WritePost} options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="Community_WriteComments" component={Community_WriteComments} options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="Community_WriteReplies" component={Community_WriteReplies} options={{ headerShown: false, animation: 'fade' }} />

          <Stack.Screen name="Announcement_Home" component={Announcement_Home} options={{ headerShown: true, title: '공지', animation: 'fade' }} />
          <Stack.Screen name="Announcement_WritePost" component={Announcement_WritePost} options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="Announcement_ViewPost" component={Announcement_ViewPost} options={{ headerShown: false, animation: 'fade' }} />

          <Stack.Screen name="Bus_Home" component={Bus_Home} options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="Bus_AddBusStopID" component={Bus_AddBusStopID} options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="Bus_Search" component={Bus_Search} options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="Bus_RouteView" component={Bus_RouteView} options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="Bus_BusStopView" component={Bus_BusStopView} options={{ headerShown: false, animation: 'fade' }} />

          <Stack.Screen name="Meal_Home" component={Meal_Home} options={{ headerShown: false, animation: 'fade' }} />

          <Stack.Screen name="Credits_Home" component={Credits_Home} options={{ headerShown: false, animation: 'fade' }} />

          <Stack.Screen name="WebView_ysit" component={WebView_ysit} options={{ headerShown: true, title: 'ysit', animation: 'fade' }} />
          <Stack.Screen name="WebView_SejongJangYeongsilHighSchool" component={WebView_SejongJangYeongsilHighSchool} options={{ headerShown: true, title: '세종장영실고등학교', animation: 'fade' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  )
}

export default App;