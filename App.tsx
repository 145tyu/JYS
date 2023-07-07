import React, { useEffect, useState } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, View, Text, TextInput, Modal } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';

import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import GOOGLE_SERVICES_JSON from './android/app/google-services.json'; // env 파일에서 GOOGLE_SERVICES_JSON 값을 가져옵니다.

import StartScreen from './screens/Start';
import LoginScreen from './screens/Login';
import SignUpScreen from './screens/SignUp';
import SettingsScreen from './screens/Settings'

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
import Community_WriteComment from './screens/community/WriteComment';
import Community_WriteReplies from './screens/community/WriteReplies';

import Bus_Home from './screens/Bus/Home';
// import S_RoomCancel from './screens/student/RoomCancel';

// const config = {
//   apiKey: GOOGLE_SERVICES_JSON.client[0].api_key[0].current_key,
//   //databaseURL: GOOGLE_SERVICES_JSON.databaseURL, // Firebase Console에서 확인한 데이터베이스 URL을 입력합니다.
//   projectId: GOOGLE_SERVICES_JSON.project_info.project_id,
//   storageBucket: GOOGLE_SERVICES_JSON.project_info.storage_bucket,
//   messagingSenderId: GOOGLE_SERVICES_JSON.project_info.project_number,
//   appId: GOOGLE_SERVICES_JSON.client[0].client_info.mobilesdk_app_id,
// }

// if (!firebase.apps.length) {
//   firebase.initializeApp(config)
// }

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

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Start" component={StartScreen} options={{ headerShown: false, animation: 'fade' }}/>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false, animation: 'fade' }}/>
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false, animation: 'fade' }}/>
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false, animation: 'fade' }}/>

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
        <Stack.Screen name="Community_WriteComment" component={Community_WriteComment} options={{ headerShown: false, animation: 'fade' }}/>
        <Stack.Screen name="Community_WriteReplies" component={Community_WriteReplies} options={{ headerShown: false, animation: 'fade' }}/>

        <Stack.Screen name="Bus_main" component={Bus_Home} options={{ headerShown: false, animation: 'fade' }}/>
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App;