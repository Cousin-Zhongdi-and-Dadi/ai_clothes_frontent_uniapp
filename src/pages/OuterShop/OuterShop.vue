<template>
  <view class="container">
    <view
      class="copy-container"
      v-if="!isLoading"
    >
      <text class="tips">当前链接需要您复制到浏览器手动打开</text>
      <text class="copy-link">
        {{ pageUrl ? (pageUrl.length > 100 ? pageUrl.slice(0, 100) + '...' : pageUrl) : '获取链接失败' }}
      </text>
      <button
        class="copy-btn"
        @click="copyUrl"
        :disabled="!pageUrl"
      >复制链接到剪贴板</button>
    </view>
  </view>
</template>

<script>
/**
 * OuterShop page
 * Displays external shop link and allows user to copy it to clipboard.
 */
export default {
  name: 'OuterShop',
  data() {
    return {
      pageUrl: 'https://fast.dewu.com/page/productDetail?sourceName=pc&spuId=1000112&skuId=602990624',
      isLoading: false
    }
  },
  methods: {
    /**
     * Copy shop URL to clipboard
     */
    copyUrl() {
      uni.setClipboardData({
        data: this.pageUrl,
        success: () => {
          uni.showToast({
            title: '已复制链接',
            icon: 'none'
          });
        }
      });
    }
  }
}
</script>

<style scoped>
.container {
  width: 100%;
  height: 100vh;
}
.copy-container {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.tips {
  display: block;
  width: 90%;
  margin: 48rpx auto 24rpx auto;
  padding: 24rpx 0;
  background: #f5f6fa;
  color: #6753e7;
  font-size: 30rpx;
  text-align: center;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(103, 83, 231, 0.08);
  font-weight: 500;
}
.copy-link {
  width: 90%;
  margin: 0 auto 24rpx auto;
  padding: 18rpx 0;
  font-size: 26rpx;
  color: #333;
  background: #fafafa;
  border-radius: 8rpx;
  text-align: center;
  word-break: break-all;
}
.copy-btn {
  margin: 32rpx auto;
  display: block;
  width: 80%;
  background: #6753e7;
  color: #fff;
  border-radius: 8rpx;
}
</style>