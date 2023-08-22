import React, { useState } from 'react';
import { Alert, ActivityIndicator, useColorScheme, Platform, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl, ScrollView, View, Text, TextInput, Button, Modal, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';

import Icon_Ionicons from 'react-native-vector-icons/Ionicons';
import Icon_Feather from 'react-native-vector-icons/Feather';
import Icon_Entypo from 'react-native-vector-icons/Entypo';

const ImageViewer = ({ imageData, imageInfo, visible, onClose }) => {
  return (
    <Modal animationType='slide' transparent={true} visible={visible} onRequestClose={() => onClose()}>
      <SafeAreaView style={styles.container}>
        {/* 닫기 */}
        <TouchableOpacity style={Platform.OS === 'ios' ? { ...styles.backButtonView, marginTop: 50 } : { ...styles.backButtonView }} onPress={() => onClose()}>
          <Text style={styles.backButtonText}>{<Icon_Feather name='x' size={25} />}</Text>
        </TouchableOpacity>

        {/* 이미지 */}
        <View style={{ justifyContent: 'center', alignItems: 'center', }}>
          <FastImage resizeMode={FastImage.resizeMode.contain} source={{ uri: imageData, priority: FastImage.priority.normal, }} style={styles.image} />
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default ImageViewer

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  backButtonView: {
    top: 25,
    left: 20,
    zIndex: 999,
    position: 'absolute',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '400',
    color: '#ffffff',
  },
  image: {
    width: windowWidth - 40, // 화면 너비에서 좌우 여백을 제외한 크기로 설정
    height: windowHeight - 40, // 화면 높이에서 상하 여백을 제외한 크기로 설정
  },
})