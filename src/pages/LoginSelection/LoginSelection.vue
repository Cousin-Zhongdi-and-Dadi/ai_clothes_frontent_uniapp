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
import apiConfig from '../../utils/api.js';

// 1. 在这里添加一个模拟模式的开关
//    - 设置为 true:  将不发送真实网络请求，而是使用下面的假数据。
//    - 设置为 false: 将会发送真实的网络请求到后端。
const IS_MOCK_MODE = true;

export default {
  name: 'LoginSelection',
    methods: {
        // 一键登录逻辑
        oneClickLogin() {
            uni.showLoading({
                title: '正在登录...'
            });

            uni.login({
                provider: 'weixin',
                success: (loginRes) => {
                    // 2. 如果是模拟模式，就走模拟逻辑
                    if (IS_MOCK_MODE) {
                        console.warn("【模拟模式】已开启，正在模拟后端响应...");

                        // --- 在这里切换你想测试的场景 ---
                        // 场景A: 模拟登录成功
                        const mockResponse = {
                            data: {
                                code: 0,
                                message: "模拟登录成功",
                                data: {
                                    openid: "mock_openid_12345",
                                    token: "mock_token_string_for_testing"
                                }
                            }
                        };

                        // 场景B: 模拟登录失败 (可以取消下面的注释来测试失败情况)
                        /*
                        const mockResponse = {
                            data: {
                                code: 5001, // 一个非0的错误码
                                message: "模拟的错误：无效的code",
                                data: null
                            }
                        };
                        */

                        // 使用 setTimeout 模拟网络延迟，让体验更真实
                        setTimeout(() => {
                            this.handleLoginResponse(mockResponse);
                        }, 1000); // 模拟1秒的延迟

                    } else {
                        // 3. 如果不是模拟模式，才发送真实的网络请求
                        uni.request({
                            url: `${apiConfig.BASE_URL}/user/login/${loginRes.code}`,
                            method: 'GET',
                            success: (res) => {
                                this.handleLoginResponse(res);
                            },
                            fail: (err) => {
                                uni.hideLoading();
                                uni.showToast({
                                    title: '网络请求失败，请重试',
                                    icon: 'none'
                                });
                                console.error('Login request failed:', err);
                            }
                        });
                    }
                },
                fail: (err) => {
                    uni.hideLoading();
                    uni.showToast({
                        title: '获取登录凭证失败',
                        icon: 'none'
                    });
                    console.error('uni.login failed:', err);
                }
            });
        },

        // 4. 新增：将处理响应的逻辑抽离成一个独立方法
        handleLoginResponse(res) {
            uni.hideLoading();
            if (res.data /*&& res.data.code === 0*/) {
                // 登录成功，保存token
                uni.setStorageSync('token', res.data.data.token);

                // 给出成功提示
                uni.showToast({
                    title: '登录成功',
                    icon: 'success'
                });

                // 延迟后跳转到“我的”页面
                setTimeout(() => {
                    uni.switchTab({
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