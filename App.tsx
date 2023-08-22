import React, { useEffect, useState } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';

import StartScreen from './screens/Start';
import LoginScreen from './screens/Login';
import SettingsScreen from './screens/Settings'

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

import T_HomeScreen from './screens/teacher/Home';
import T_Profile from './screens/teacher/Profile';
import T_RoomSituation from './screens/teacher/RoomSituation';

import Profile_View from './screens/profile/ViewProfile';
import Profile_Edit from './screens/profile/EditProfile';
import Profile_Edit_Email from './screens/profile/EditEmail';
import Profile_Edit_Password from './screens/profile/EditPassword';

import Community_Home from './screens/community/CommunityHome';
import Community_ViewPost from './screens/community/ViewPost';
import Community_WritePost from './screens/community/WritePost';
import Community_WriteComments from './screens/community/WriteComments';
import Community_WriteReplies from './screens/community/WriteReplies';

import Bus_Home from './screens/Bus/Home';
import Bus_AddBusStopID from './screens/Bus/AddBusStopID';

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function S_Tab() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <Tab.Navigator screenOptions={{
      tabBarActiveTintColor: isDarkMode? '#FFFFFF' : '#000',
      tabBarInactiveTintColor: isDarkMode? '#BEBEBE' : '#8e8e8e',
      tabBarStyle: {
        backgroundColor: isDarkMode ? '#222' : '#fff',
      },
      tabBarLabelStyle: {
        fontSize: 10,
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
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Tab.Navigator screenOptions={{
      tabBarActiveTintColor: isDarkMode? '#FFFFFF' : '#000',
      tabBarInactiveTintColor: isDarkMode? '#BEBEBE' : '#8e8e8e',
      tabBarStyle: {
        backgroundColor: isDarkMode ? '#222' : '#fff',
      },
      tabBarLabelStyle: {
        fontSize: 13,
        fontWeight: 'bold',
      },
    }}>
      <Tab.Screen
        name="T_Tab_Home"
        component={T_HomeScreen}
        options={{
          title: '홈',
          headerShown: false,
          tabBarShowLabel: false,
          tabBarIcon: ({ color, size }) => (
            <Icon_Feather name='home' color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name='T_Tab_RoomSituation'
        component={T_RoomSituation}
        options={{
          title: '방음부스',
          headerShown: false,
          tabBarShowLabel: false,
          tabBarIcon: ({ color, size }) => (
            <Icon_Ionicons name='fitness-outline' color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name='T_Tab_Profile'
        component={T_Profile}
        options={{
          title: '프로필',
          headerShown: false,
          tabBarShowLabel: false,
          tabBarIcon: ({ color, size }) => (
            <Icon_Feather name='sliders' color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}

const App = () => {
  requestUserPermission()
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage))
    })
    return unsubscribe
  }, [])

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Start" component={StartScreen} options={{ headerShown: false, animation: 'fade' }}/>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false, animation: 'fade' }}/>
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false, animation: 'fade' }}/>

        <Stack.Screen name="SignUp_Welcome" component={S_SignUp_Welcome} options={{ headerShown: false, animation: 'fade' }}/>
        <Stack.Screen name="SignUp_ToS" component={S_SignUp_ToS} options={{ headerShown: false, animation: 'fade' }}/>
        <Stack.Screen name="SignUp_Email" component={S_SignUp_Email} options={{ headerShown: false, animation: 'fade' }}/>
        <Stack.Screen name="SignUp_Account" component={S_SignUp_Account} options={{ headerShown: false, animation: 'fade' }}/>
        <Stack.Screen name="SignUp_StudentID" component={S_SignUp_StudentID} options={{ headerShown: false, animation: 'fade' }}/>
        <Stack.Screen name="SignUp_CheckStudentID" component={S_SignUp_CheckStudentID} options={{ headerShown: false, animation: 'fade' }}/>
        <Stack.Screen name="SignUp_LastCheck" component={S_SignUp_LastCheck} options={{ headerShown: false, animation: 'fade' }}/>
        <Stack.Screen name="SignUp_Success" component={S_SignUp_Success} options={{ headerShown: false, animation: 'fade' }}/>

        <Stack.Screen name="S_Home" component={S_Tab} options={{ headerShown: false, animation: 'fade' }}/>
        <Stack.Screen name="S_RoomRental" component={S_RoomRental} options={{ headerShown: false, animation: 'fade' }}/>
        <Stack.Screen name="S_RoomCancel" component={S_RoomCancel} options={{ headerShown: false, animation: 'fade' }}/>

        <Stack.Screen name="T_Home" component={T_Tab} options={{ headerShown: false, animation: 'fade' }}/>
        <Stack.Screen name="T_Profile" component={T_Profile} options={{ headerShown: false, animation: 'fade' }}/>
        <Stack.Screen name="T_Tab_RoomSituation" component={T_RoomSituation} options={{ headerShown: false, animation: 'fade' }}/>

        <Stack.Screen name="Profile_View" component={Profile_View} options={{ headerShown: false, animation: 'fade' }}/>
        <Stack.Screen name="Profile_Edit" component={Profile_Edit} options={{ headerShown: false, animation: 'fade' }}/>
        <Stack.Screen name="Profile_Edit_Email" component={Profile_Edit_Email} options={{ headerShown: false, animation: 'fade' }}/>
        <Stack.Screen name="Profile_Edit_Password" component={Profile_Edit_Password} options={{ headerShown: false, animation: 'fade' }}/>
      
        <Stack.Screen name="Community_Home" component={S_Tab} options={{ headerShown: false, animation: 'fade' }}/>
        <Stack.Screen name="Community_ViewPost" component={Community_ViewPost} options={{ headerShown: false, animation: 'fade' }}/>
        <Stack.Screen name="Community_WritePost" component={Community_WritePost} options={{ headerShown: false, animation: 'fade' }}/>
        <Stack.Screen name="Community_WriteComments" component={Community_WriteComments} options={{ headerShown: false, animation: 'fade' }}/>
        <Stack.Screen name="Community_WriteReplies" component={Community_WriteReplies} options={{ headerShown: false, animation: 'fade' }}/>

        <Stack.Screen name="Bus_main" component={Bus_Home} options={{ headerShown: false, animation: 'fade' }}/>
        <Stack.Screen name="Bus_AddBusStopID" component={Bus_AddBusStopID} options={{ headerShown: false, animation: 'fade' }}/>
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App;