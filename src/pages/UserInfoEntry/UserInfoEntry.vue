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
// --- 开始修改：确保同时导入 UserInfo 和 UserInfoNotLogin ---
import UserInfo from '../UserInfo/UserInfo.vue';
import UserInfoNotLogin from '../UserInfoNotLogin/UserInfoNotLogin.vue';
// --- 结束修改 ---
import request from '../../utils/request.js';
import apiConfig from '../../utils/api.js';

export default {
  components: {
    UserInfo,
    UserInfoNotLogin
  },
  data() {
    return {
      // 关键：isLoggedIn 的初始状态应为 false，等待验证
      isLoggedIn: false,
      // 防止 onShow 重复执行检查
      isChecking: false 
    };
  },
  // 使用 onShow 是因为 Tab 切换时会触发，比 onLoad 更适合
  onShow() {
    this.checkLoginStatus();
  },
  methods: {
    // --- 开始修改：新增事件处理方法 ---
    handleLogout() {
      // 当接收到子组件的登出事件时，直接更新登录状态
      this.isLoggedIn = false;
    },
    // --- 结束修改 ---
    async checkLoginStatus() {
      if (this.isChecking) return;
      this.isChecking = true;

      const token = uni.getStorageSync('token');

      // 1. 如果本地根本没有 token，直接判定为未登录
      if (!token) {
        this.isLoggedIn = false;
        this.isChecking = false;
        return;
      }

      // 2. 如果有 token，则向服务器发起验证
      try {
        // 假设有一个专门用于验证 token 或获取最基本用户信息的接口
        await request({
          url: `${apiConfig.BASE_URL}/user/getUserInfo`, // 或使用 /user/getUserInfo
          method: 'GET'
        });
        // 如果请求成功 (request.js 没抛出错误)，说明 token 有效
        this.isLoggedIn = true;
      } catch (error) {
        // 如果请求失败 (例如 token 过期，服务器返回 401)，说明 token 无效
        console.error('Token validation failed:', error);
        this.isLoggedIn = false;
        // **关键步骤**：清除本地的无效 token
        uni.removeStorageSync('token');
      } finally {
        this.isChecking = false;
      }
    }
  }
};
</script>