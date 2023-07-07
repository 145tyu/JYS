import React, { useState } from 'react';
import { View, Text, Modal, Button } from 'react-native';

const ErrorAlert = ({ error, errorDescription, buttonMessage, visible, onClose }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, }}>
          <Text style={{ marginBottom: 20, fontSize: 17, fontWeight: 'bold', color: 'black'}}>{error}</Text>
          <Text style={{ marginBottom: 20, fontSize: 17, fontWeight: 'bold', color: 'black'}}>{errorDescription}</Text>
          <Button title={buttonMessage} onPress={onClose} />
          <Button title="닫기" onPress={() => {modalRef.current?.close()}}/>
        </View>
      </View>
    </Modal>
  )
}

export default ErrorAlert
