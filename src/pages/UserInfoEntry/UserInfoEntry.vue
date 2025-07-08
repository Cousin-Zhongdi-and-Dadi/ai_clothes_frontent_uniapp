<template>
  <view>
    <user-info v-if="isLogin" />
    <user-info-not-login v-else />
  </view>
</template>

<script>
import UserInfo from '@/pages/UserInfo/UserInfo.vue'
import UserInfoNotLogin from '@/pages/UserInfoNotLogin/UserInfoNotLogin.vue'

export default {
  components: {
    UserInfo,
    UserInfoNotLogin,
  },
  data() {
    return {
      isLogin: false
    }
  },
  methods: {
    updateLoginStatus() {
      const token = uni.getStorageSync('token');
      console.log('token in updateLoginStatus:', token, typeof token);
      this.isLogin = !!token;
    }
  },
  onShow() {
    this.updateLoginStatus();
  }
}
</script>