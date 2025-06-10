<template>
  <view>
    <user-info v-if="isLogin" />
    <user-info-not-login v-else />
  </view>
</template>

<script>
import UserInfo from '../../pages/UserInfo/UserInfo.vue'
import UserInfoNotLogin from '../../pages/UserInfoNotLogin/UserInfoNotLogin.vue'

export default {
  components: {
    UserInfo,
    UserInfoNotLogin,
  },
  data() {
    return {
      isLogin: false // 默认未登录，实际项目中应根据本地存储或全局状态判断
    }
  },
  onShow() {
    // 这里根据实际登录状态判断
    // 例如：this.isLogin = !!uni.getStorageSync('token')
    // 这里只做演示
    // this.isLogin = !!uni.getStorageSync('token')
  }
}
</script>