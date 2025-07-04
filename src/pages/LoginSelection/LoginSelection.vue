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
export default {
  name: 'LoginSelection',
    methods: {
        // 一键登录逻辑
        oneClickLogin() {
            // 1. 生成一个模拟的用户信息对象
            const mockUserInfo = {
                nickname: 'AI虚拟模特',
                avatarUrl: '/static/icon/icon-04.png', // 使用现有的logo作为模拟头像
                token: 'mock_token_' + new Date().getTime(), // 创建一个唯一的模拟token
                gender: 1, // 1=男, 2=女, 0=未知
                city: '赛博城'
            };

            // 2. 将用户信息和token保存到小程序的本地缓存中
            uni.setStorageSync('userInfo', mockUserInfo);
            uni.setStorageSync('token', mockUserInfo.token);

            // 3. 给出登录成功的提示
            uni.showToast({
                title: '登录成功',
                icon: 'success'
            });

            // 4. 延迟1.5秒后跳转到“我的”页面，让用户能看到提示
            setTimeout(() => {
                // “我的”页面通常是底部导航Tab页，需要使用 switchTab 跳转
                uni.switchTab({
                    url: '/pages/UserInfoEntry/UserInfoEntry'
                });
            }, 1500);
        },
        // 手机号登录逻辑
        phoneLogin() {
            // 跳转到手机号登录页面
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