<template>
  <view class="container">
    <view class="title">选择服装</view>
    <view class="image-container">
      <!-- 图片容器，实际图片可用 <image> 标签替换 -->
      <view class="img-placeholder"></view>
    </view>
    <view class="button-row">
      <button
        class="btn btn-grey"
        :disabled="true"
      >重新挑选</button>
      <button class="btn btn-purple">选择下装</button>
    </view>
    <view class="complete-btn-row">
      <button class="btn btn-complete">选择完成</button>
      <view class="ai-btn">
        <view class="ai-circle">
          <text class="ai-text">AI</text>
          <text class="ai-desc">智能选衣</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
// 这里可以添加逻辑
</script>

<style scoped>
.container {
  padding: 32rpx 0 0 0;
  background: #fff;
  min-height: 100vh;
  box-sizing: border-box;
}
.title {
  text-align: center;
  font-size: 32rpx;
  font-weight: 500;
  margin-bottom: 32rpx;
}
.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 48rpx;
}
.img-placeholder {
  width: 420rpx;
  height: 520rpx;
  background: #635bff;
  border-radius: 8rpx;
  border: 2rpx solid #635bff;
}
.button-row {
  display: flex;
  justify-content: center;
  gap: 32rpx;
  margin-bottom: 40rpx;
}
.btn {
  font-size: 28rpx;
  border-radius: 12rpx;
  padding: 0 40rpx;
  height: 64rpx;
  line-height: 64rpx;
  border: none;
}
.btn-grey {
  background: #e5e5e5;
  color: #999;
}
.btn-purple {
  background: #635bff;
  color: #fff;
}
.complete-btn-row {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}
.btn-complete {
  width: 80%;
  background: #635bff;
  color: #fff;
  font-size: 30rpx;
  border-radius: 12rpx;
  height: 64rpx;
  line-height: 64rpx;
  border: none;
}
.ai-btn {
  position: absolute;
  right: 0;
  top: -32rpx;
}
.ai-circle {
  width: 72rpx;
  height: 72rpx;
  background: #fff;
  border: 2rpx solid #e5e5e5;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(99, 91, 255, 0.1);
}
.ai-text {
  color: #635bff;
  font-weight: bold;
  font-size: 24rpx;
}
.ai-desc {
  color: #aaa;
  font-size: 16rpx;
  margin-top: 2rpx;
}
</style>