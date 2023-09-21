import AsyncStorage from '@react-native-async-storage/async-storage';

export function MoveScreen(navigation) {
  AsyncStorage.getItem('initialNotification')
    .then(async (res) => {
      if (res) {
        const data = JSON.parse(res).data

        if (data.screenType === 'community_Post') { // 알림 유형 : 게시글
          const ScreenData = (data.screenData).split(',')
          navigation.navigate('Community_ViewPost', { postID: ScreenData[0] })
        } else if (data.screenType === 'community_Comment') { // 알림 유형 : 댓글
          const ScreenData = (data.screenData).split(',')
          navigation.navigate('Community_WriteComments', { postID: ScreenData[0] })
        } else if (data.screenType === 'community_Replie') { // 알림 유형 : 답글
          const ScreenData = (data.screenData).split(',')
          navigation.navigate('Community_WriteReplies', { commentsID: ScreenData[0], postID: ScreenData[1] })
        } else if (data.screenType === 'Announcement_ViewPost') {  // 알림 유형 : 공지
          const ScreenData = (data.screenData).split(',')
          navigation.navigate('Announcement_ViewPost', { postID: ScreenData[0] })
        } else { // 알림 유형 : 없음
          navigation.navigate('Notification_Tab_Home')
        }
      }

      await AsyncStorage.removeItem('initialNotification') // 알림 데이터를 삭제
    })
}