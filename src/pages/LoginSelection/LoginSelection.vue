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
import apiConfig from '../../utils/api.js'; // 1. 导入API配置文件

export default {
  name: 'LoginSelection',
    methods: {
        // 一键登录逻辑
        oneClickLogin() {
            uni.showLoading({
                title: '正在登录...'
            });

            // 1. 调用 uni.login 获取 code
            uni.login({
                provider: 'weixin',
                success: (loginRes) => {
                    // 2. 将 code 发送到后端服务器
                    uni.request({
                        url: `${apiConfig.BASE_URL}/user/login/${loginRes.code}`, // 假设的API路径，code作为Path参数
                        method: 'GET',
                        success: (res) => {
                            if (res.data && res.data.code === 0) {
                                // 3. 登录成功，保存token
                                uni.setStorageSync('token', res.data.data.token);

                                // 4. 给出成功提示
                                uni.showToast({
                                    title: '登录成功',
                                    icon: 'success'
                                });

                                // 5. 延迟后跳转到“我的”页面
                                setTimeout(() => {
                                    uni.switchTab({
                                        // 修改：跳转到作为 Tab 页的入口页面
                                        url: '/pages/UserInfoEntry/UserInfoEntry'
                                    });
                                }, 1500);

                            } else {
                                // 后端返回错误
                                uni.showToast({
                                    title: (res.data && res.data.message) || '登录失败',
                                    icon: 'none'
                                });
                            }
                        },
                        fail: (err) => {
                            // 网络请求失败
                            uni.showToast({
                                title: '网络请求失败，请重试',
                                icon: 'none'
                            });
                            console.error('Login request failed:', err);
                        },
                        complete: () => {
                            uni.hideLoading();
                        }
                    });
                },
                fail: (err) => {
                    // uni.login 调用失败
                    uni.hideLoading();
                    uni.showToast({
                        title: '获取登录凭证失败',
                        icon: 'none'
                    });
                    console.error('uni.login failed:', err);
                }
            });
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