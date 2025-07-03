<template>
  <view class="container">
    <view class="image-container"></view>
    <button
      class="retry-btn"
      disabled
    >重新挑选</button>
    <view class="complete-btn-wrapper">
      <button class="complete-btn">选择完成</button>
      <view class="help-btn">
        <text class="help-icon">💬</text>
        <text class="help-text">智能客服</text>
      </view>
    </view>
  </view>
</template>

<script setup>
// 无需逻辑，静态页面
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 40rpx;
  box-sizing: border-box;
}
.image-container {
  width: 420rpx;
  height: 480rpx;
  background: #6c5ce7;
  border-radius: 12rpx;
  margin-bottom: 60rpx;
}
.retry-btn {
  width: 400rpx;
  height: 60rpx;
  background: #d8d8d8;
  color: #fff;
  border-radius: 12rpx;
  font-size: 28rpx;
  margin-bottom: 30rpx;
  border: none;
}
.complete-btn-wrapper {
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
.complete-btn {
  width: 400rpx;
  height: 60rpx;
  background: #6c5ce7;
  color: #fff;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
}
.help-btn {
  position: absolute;
  right: 40rpx;
  top: -30rpx;
  background: #fff;
  border: 2rpx solid #e0e0e0;
  border-radius: 50%;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(108, 92, 231, 0.08);
}
.help-icon {
  font-size: 28rpx;
  color: #6c5ce7;
}
.help-text {
  font-size: 16rpx;
  color: #6c5ce7;
  margin-top: 2rpx;
}
</style>