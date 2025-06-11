<template>
  <view>
    <view
      class="icon_panel"
      @click="goToCart"
    >
      <!-- 图标 -->
      <image
        src="/static/icon/icon-13.png"
        mode="widthFix"
        class="cart-icon"
      ></image>
      <!-- 文本 -->
      <view class="icon_panel_text">购物车</view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CartIcon',
  components: {},
  data() {
    return {};
  },
  methods: {
    goToCart() {
      uni.navigateTo({
        url: '/pages/Cart/Cart'
      });
    }
  }
};
</script>

<style scoped>
.icon_panel {
  position: fixed;
  right: 50rpx;
  bottom: 350rpx;
  width: 100rpx; /* 调整宽度以适应文本 */
  height: 100rpx; /* 调整高度以适应文本 */
  background-color: #fff; /* 圆形白色底 */
  border-radius: 50%; /* 圆形 */
  display: flex; /* 使用 flex 布局 */
  flex-direction: column; /* 垂直排列图标和文本 */
  align-items: center; /* 水平方向居中 */
  justify-content: center; /* 垂直方向居中 */
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2); /* 添加阴影效果 */
  z-index: 1000; /* 确保在其他元素之上 */
  padding: 10rpx; /* 添加内边距以适应文本 */
}

.cart-icon {
  width: 80rpx; /* 图标大小 */
  height: 80rpx;
  margin-bottom: 5rpx; /* 图标和文本之间的间距 */
}

.icon_panel_text {
  font-size: 16rpx; /* 调整为更小的字体大小 */
  color: #6753e7; /* 深色文本，确保与背景对比明显 */
  text-align: center; /* 文本居中 */
}
</style>