

<template>
  <view>
    <view
      class="icon_panel"
      @click="goToCart"
    >
      <!-- 素材库图标 -->
      <image
        src="/static/icon/我的素材库-02.png"
        mode="aspectFit"
        class="cart-icon"
      ></image>
      <!-- 素材库文字 -->
      <view class="icon_panel_text">素材库</view>
    </view>
  </view>
</template>

<script>
/**
 * CartIcon component
 * Floating entry to material library, navigates to Shop page on click.
 */
export default {
  name: 'CartIcon',
  methods: {
    /**
     * Navigate to material library page
     */
    goToCart() {
      uni.switchTab({
        url: '/pages/Shop/Shop'
      });
    }
  }
}
</script>

<style scoped>
.icon_panel {
  position: fixed;
  right: 50rpx;
  bottom: 350rpx;
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

.cart-icon {
  width: 55rpx;
  height: 55rpx;

  margin-bottom: 5rpx;
}

.icon_panel_text {
  font-size: 16rpx;
  color: #6753e7;
  text-align: center;
}
</style>