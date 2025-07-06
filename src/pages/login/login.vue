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

    <!-- 表单 -->
    <view class="login-form">
      <view class="login-form-row">
        <!-- <view class="login-form-label">
          <text>+86</text>
          <text class="login-form-divider">∨</text>
        </view> -->
        <input
          class="login-form-input"
          type="text"
          placeholder="手机号"
          v-model="phone"
        />
      </view>
      <view class="login-form-row">
        <input
          class="login-form-input"
          type="text"
          placeholder="验证码"
          v-model="code"
        />
        <view
          class="login-form-code-btn"
          @click="getCode"
        >获取验证码</view>
      </view>
      <view class="login-form-row">
        <button
          class="login-form-submit"
          @click="login"
        >登录/注册</button>
      </view>
    </view>
  </view>
</template>

<script>
// 1. 导入封装的 request 函数和 apiConfig
import request from '../../utils/request.js';
import apiConfig from '../../utils/api.js';

export default {
  data() {
    return {
      phone: '',
      code: '',
      isGettingCode: false, // 防止重复点击获取验证码
      countdown: 0,       // 倒计时秒数
    };
  },
  methods: {
    // 2. 改造 getCode 方法
    async getCode() {
      if (this.isGettingCode) return;

      if (!this.phone) {
        uni.showToast({ title: '请输入手机号', icon: 'none' });
        return;
      }
      if (!/^1[3-9]\d{9}$/.test(this.phone)) {
        uni.showToast({ title: '手机号格式不正确', icon: 'none' });
        return;
      }

      this.isGettingCode = true;
      uni.showLoading({ title: '正在发送...' });

      try {
        // 假设获取验证码的API
        await request({
          url: `${apiConfig.BASE_URL}/user/sendCode`,
          method: 'POST',
          data: { phone: this.phone }
        });

        uni.showToast({ title: '验证码已发送', icon: 'success' });
        
        // 开始倒计时
        this.countdown = 60;
        const timer = setInterval(() => {
          this.countdown--;
          if (this.countdown <= 0) {
            clearInterval(timer);
            this.isGettingCode = false;
          }
        }, 1000);

      } catch (error) {
        console.error("getCode failed:", error);
        this.isGettingCode = false; // 失败时允许用户重试
      } finally {
        uni.hideLoading();
      }
    },

    // 3. 改造 login 方法
    async login() {
      if (!this.phone) {
        uni.showToast({ title: '请输入手机号', icon: 'none' });
        return;
      }
      if (!this.code) {
        uni.showToast({ title: '请输入验证码', icon: 'none' });
        return;
      }
      
      uni.showLoading({ title: '正在登录...' });

      try {
        const loginData = await request({
          url: `${apiConfig.BASE_URL}/user/loginByPhone`,
          method: 'POST',
          data: {
            phone: this.phone,
            code: this.code
          },
        });

        // 业务成功，request 函数直接返回了包含 token 的对象
        uni.setStorageSync('token', loginData.token);
        
        uni.showToast({ title: '登录成功', icon: 'success' });

        // 跳转到个人中心入口
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/UserInfoEntry/UserInfoEntry'
          });
        }, 1500);

      } catch (error) {
        console.error("login failed:", error);
        // 错误提示已由 request 函数统一处理
      } finally {
        uni.hideLoading();
      }
    }
  }
};
</script>

<style scoped>
.login-page {
  background: #fff;
  min-height: 100vh;
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
}
.icon-eye {
  font-size: 28rpx;
  color: #888;
}
.login-logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60rpx;
  margin-bottom: 40rpx;
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
.login-form {
  margin: 0 40rpx;
}
.login-form-row {
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #eee;
  padding: 24rpx 0;
  position: relative;
}
.login-form-label {
  color: #222;
  font-size: 26rpx;
  margin-right: 16rpx;
  display: flex;
  align-items: center;
}
.login-form-divider {
  font-size: 22rpx;
  color: #888;
  margin-left: 4rpx;
}
.login-form-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 26rpx;
  color: #222;
  outline: none;
}
.login-form-code-btn {
  color: #bbb;
  font-size: 24rpx;
  margin-left: 16rpx;
}
.login-form-submit {
  width: 100%;
  height: 80rpx;
  background: #6753e7;
  color: #fff;
  font-size: 28rpx;
  text-align: center;
  line-height: 80rpx;
  border-radius: 40rpx;
  margin-top: 40rpx;
}
</style>