<template>
  <view class="content">
    <view class="center_content">
      <button
        class="login_button"
        @click="login"
      >登录查看更多</button>
      <text class="slogan">让每个时常成为你的T台</text>
    </view>
  </view>
</template>

<script>
export default {
    methods: {
        login() {
            // 跳转到登录页面
            uni.navigateTo({
                url: '/pages/LoginSelection/LoginSelection'
            });
        }
    }
}
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  /* 预留底部导航栏空间 */
  padding-bottom: 100rpx;
}

.center_content {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: absolute;
  top: 500rpx;
  left: 0;
  right: 0;
  bottom: 100rpx; /* 预留navbar高度 */
}

.login_button {
  width: 400rpx;
  height: 100rpx;
  background-color: rgba(103, 83, 231, 1);
  color: white;
  border-radius: 50rpx;
  font-size: 45rpx;
  text-align: center;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.slogan {
  font-size: 28rpx;
  color: #666;
  text-align: center;
}
</style>
