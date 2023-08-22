import React, { useState } from 'react';
import { View, Text, Modal, Button, StyleSheet, TouchableOpacity } from 'react-native';

const ErrorAlert = ({ error, errorDescription, status, isDarkMode, visible, onComponent, onClose }) => {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      {status === 400 &&
        <View style={style.container}>
          <View style={[{ backgroundColor: '#ffffff', padding: 10, borderRadius: 20, width: '90%' }, isDarkMode && { backgroundColor: '#121212', padding: 10, borderRadius: 20, width: '90%' }]}>
            <Text style={[{ ...style.errorText, color: '#000000' }, isDarkMode && { ...style.errorText, color: '#ffffff' }]}>{error}</Text>
            {errorDescription != null && <Text style={[{ ...style.errorDescriptionText, color: '#000000' }, isDarkMode && { ...style.errorDescriptionText, color: '#ffffff' }]}>{errorDescription}</Text>}
            <View style={{ width: '100%', height: 1, backgroundColor: '#666666', marginTop: 20, marginBottom: 10 }}></View>
            <TouchableOpacity onPress={() => onClose()}><Text style={{ color: '#4682b4', fontSize: 15, textAlign: 'center' }}>확인</Text></TouchableOpacity>
          </View>
        </View>
      }
      {status === 500 &&
        <View style={style.container}>
          <View style={[{ backgroundColor: '#ffffff', padding: 10, borderRadius: 20, width: '90%' }, isDarkMode && { backgroundColor: '#121212', padding: 10, borderRadius: 20, width: '90%' }]}>
            <Text style={[{ ...style.errorText, color: '#000000' }, isDarkMode && { ...style.errorText, color: '#ffffff' }]}>{error}</Text>
            {errorDescription != null && <Text style={[{ ...style.errorDescriptionText, color: '#000000' }, isDarkMode && { ...style.errorDescriptionText, color: '#ffffff' }]}>{errorDescription}</Text>}
            <View style={{ width: '100%', height: 1, backgroundColor: '#666666', marginTop: 20, marginBottom: 10 }}></View>
            <TouchableOpacity onPress={() => onComponent()}><Text style={{ color: '#4682b4', fontSize: 15, textAlign: 'center' }}>다시시도</Text></TouchableOpacity>
            <View style={{ width: '100%', height: 1, backgroundColor: '#666666', marginTop: 10, marginBottom: 10 }}></View>
            <TouchableOpacity onPress={() => onClose()}><Text style={{ color: '#4682b4', fontSize: 15, textAlign: 'center' }}>확인</Text></TouchableOpacity>
          </View>
        </View>
      }
    </Modal>
  )
}

export default ErrorAlert

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  errorText: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  errorDescriptionText: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 15,
  }
})
