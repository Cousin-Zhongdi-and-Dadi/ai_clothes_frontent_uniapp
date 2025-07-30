<template>
  <view>
    <!-- 根据登录状态动态显示不同组件 -->
    <!-- --- 开始修改：监听子组件发出的 logged-out 事件 --- -->
    <UserInfo
      v-if="isLoggedIn"
      @logged-out="handleLogout"
    />
    <!-- --- 结束修改 --- -->
    <UserInfoNotLogin v-else />
  </view>
</template>

<script>
import UserInfo from '@/components/UserInfo/UserInfo.vue';
import UserInfoNotLogin from '@/components/UserInfoNotLogin/UserInfoNotLogin.vue';
import request from '@/utils/request.js';
import apiConfig from '@/utils/api.js';

/**
 * UserInfoEntry page
 * Dynamically displays user info or login prompt based on authentication status.
 */
export default {
  components: {
    UserInfo,
    UserInfoNotLogin
  },
  data() {
    return {
      isLoggedIn: false,
      isChecking: false
    };
  },
  onShow() {
    this.checkLoginStatus();
  },
  methods: {
    /**
     * Handle logout event from child component
     */
    handleLogout() {
      this.isLoggedIn = false;
    },
    /**
     * Check login status by validating token and requesting user info
     */
    async checkLoginStatus() {
      if (this.isChecking) return;
      this.isChecking = true;

      const token = uni.getStorageSync('token');

      if (!token) {
        this.isLoggedIn = false;
        this.isChecking = false;
        return;
      }

      try {
                await request({
          url: `${apiConfig.BASE_URL}/user/getUserInfo`,           method: 'GET'
        });
                this.isLoggedIn = true;
      } catch (error) {
                console.error('Token validation failed:', error);
        this.isLoggedIn = false;
                uni.removeStorageSync('token');
      } finally {
        this.isChecking = false;
      }
    }
  }
};
</script>