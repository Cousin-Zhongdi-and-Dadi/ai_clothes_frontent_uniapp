<template>
  <view class="tryon-container">
    <view class="tryon-btn-container">
      <view
        class="tryon-btn tryon-btn-2d"
        @click="goTo2D"
      >
        <text class="tryon-btn-text">2D试衣</text>
      </view>
      <view
        class="tryon-btn ai-match"
        @click="goTo3D"
      >
        <text class="tryon-btn-text">衣搭AI</text>
      </view>
    </view>
    <!-- <customer-service /> -->
  </view>
</template>

<script>
import CustomerService from '@/components/CustomerService/CustomerService.vue';

export default {
  components: { CustomerService },
  name: 'TryOnContainer',
  methods: {
    goTo3D() {
      uni.navigateTo({ url: '/pages/ThreeDimDisplay/ThreeDimDisplay?styleId=1' });
    },
    goTo2D() {
      uni.navigateTo({ url: '/pages/TwoDimDisplay/TwoDimDisplay' });
    }
  }
}
</script>

<style scoped>
.tryon-container {
  min-height: 100vh;
  background: #fafbfc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;
}
.tryon-btn-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
}
.tryon-btn {
  width: 95%;
  height: 200rpx;
  border-radius: 16rpx;
  margin-bottom: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 38rpx;
  font-weight: bold;
  box-sizing: border-box;
  transition: box-shadow 0.2s;
}
.ai-match {
  background: #6c5ce7;
  color: #fff;
  box-shadow: 0 4rpx 16rpx rgba(108, 92, 231, 0.08);
}
.tryon-btn-2d {
  background: #fff;
  color: #6c5ce7;
  border: 4rpx solid #6c5ce7;
  box-shadow: 0 4rpx 16rpx rgba(108, 92, 231, 0.08);
}
.tryon-btn-text {
  font-size: 60rpx;
  font-weight: bold;
}
.fab-chat {
  position: fixed;
  right: 40rpx;
  bottom: 140rpx;
}
</style>