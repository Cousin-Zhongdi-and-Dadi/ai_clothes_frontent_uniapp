<template>
  <view>
    <view
      class="icon_panel"
      @click="$emit('show-recommendation')"
    >
      <image
        src="/static/icon/icon-12.png"
        mode="widthFix"
        class="customer-service-icon"
      ></image>
      <view class="icon_panel_text">每日推荐</view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'RecommendationIcon'
}
</script>

<style scoped>
.icon_panel {
  position: fixed;
  right: 50rpx;
  bottom: 200rpx;
  width: 100rpx;
  height: 100rpx;
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
  z-index: 1000;
  padding: 10rpx;
}

.customer-service-icon {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 5rpx;
}

.icon_panel_text {
  font-size: 16rpx;
  color: #6753e7;
  text-align: center;
}
</style>