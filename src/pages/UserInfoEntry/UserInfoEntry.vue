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
      // 修改：只通过是否存在 token 来判断登录状态
      this.isLogin = !!uni.getStorageSync('token');
    }
  },
  onShow() {
    this.updateLoginStatus();
  }
}
</script>