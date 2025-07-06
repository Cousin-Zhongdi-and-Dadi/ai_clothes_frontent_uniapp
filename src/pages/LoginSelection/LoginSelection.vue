<template>
  <view class="login-page">
    <!-- logo和slogan -->
    <view class="login-logo-section">
      <image
        class="login-logo"
        src="/static/icon/icon-04.png"
      />
      <view class="login-slogan">让每个时常成为你的T台</view>
    </view>

    <!-- 登录按钮 -->
    <view class="login-btns">
      <button
        class="btn-primary"
        @click="oneClickLogin"
      >一键登录</button>
      <button
        class="btn-secondary"
        @click="phoneLogin"
      >手机号登录/注册</button>
    </view>
  </view>
</template>

<script>
// 1. 导入封装的 request 函数和 apiConfig
import request from '../../utils/request.js';
import apiConfig from '../../utils/api.js';

export default {
  name: 'LoginSelection',
  methods: {
    // 2. 改造 oneClickLogin 方法
    async oneClickLogin() {
      uni.showLoading({
        title: '正在登录...'
      });

      try {
        // 步骤 1: 调用 uni.login 获取微信登录凭证 code
        const loginRes = await uni.login({
          provider: 'weixin',
        });

        // 步骤 2: 使用封装的 request 函数将 code 发送到后端
        const loginData = await request({
          url: `${apiConfig.BASE_URL}/user/login/${loginRes.code}`,
          method: 'GET',
        });

        // 业务成功，request 函数直接返回了包含 token 的对象
        uni.setStorageSync('token', loginData.token);

        uni.showToast({
          title: '登录成功',
          icon: 'success'
        });

        // 延迟后跳转到“我的”页面
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/UserInfoEntry/UserInfoEntry' // 统一跳转到个人中心入口
          });
        }, 1500);

      } catch (error) {
        // uni.login 失败或 request 函数业务失败/网络失败
        // 错误提示已由 request 函数或 uni.login 内部处理
        console.error('Login process failed:', error);
      } finally {
        // 无论成功或失败，都确保隐藏加载提示
        uni.hideLoading();
      }
    },

    // 手机号登录逻辑保持不变
    phoneLogin() {
      uni.navigateTo({
        url: '/pages/Login/Login'
      });
    }
  },
};
</script>

<style scoped>
.login-page {
  background: #fff;
  height: 100vh;
}
.login-header {
  height: 90rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  border-bottom: 1rpx solid #eee;
}
.icon-back {
  font-size: 36rpx;
  color: #222;
}
.login-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #222;
}
.login-header-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.icon-more,
.icon-setting {
  font-size: 28rpx;
  color: #888;
}
.login-logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 100rpx;
  margin-bottom: 100rpx;
}
.login-logo {
  width: 96rpx;
  height: 96rpx;
  margin-bottom: 24rpx;
}
.login-slogan {
  color: #6753e7;
  font-size: 28rpx;
  font-weight: bold;
  text-align: center;
}
.login-btns {
  margin: 0 40rpx;
  display: flex;
  flex-direction: column;
  gap: 50rpx;
}
.btn-primary {
  background: #6753e7;
  color: #fff;
  font-size: 28rpx;
  border-radius: 8rpx;
  height: 80rpx;
  line-height: 80rpx;
  border: none;
  margin-bottom: 0;
  margin-left: 0;
  margin-right: 0;
}
.btn-secondary {
  background: #c4c4c4;
  color: #fff;
  font-size: 28rpx;
  border-radius: 8rpx;
  height: 80rpx;
  line-height: 80rpx;
  border: none;
  margin-left: 0;
  margin-right: 0;
}
</style>