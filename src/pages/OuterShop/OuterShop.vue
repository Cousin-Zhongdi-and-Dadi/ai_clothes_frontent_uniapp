<template>
  <view>
    <!--<text class="tips">当前链接需要您复制到浏览器手动打开</text>
    <button
      class="copy-btn"
      @click="copyUrl"
    >复制链接到剪贴板</button>-->
    <web-view
      :src="pageUrl"
      @error="handleError"
    ></web-view>
  </view>
</template>

<script>
export default {
  name: 'OuterShop',
  data() {
    return {
      pageUrl: 'https://fast.dewu.com/page/productDetail?sourceName=pc&spuId=1000112&skuId=602990624'
    }
  },
  methods: {
    handleError() {
      uni.showToast({
        title: '加载失败，请稍后再试',
        icon: 'none'
      });
    },
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
.copy-btn {
  margin: 32rpx auto;
  display: block;
  width: 80%;
  background: #6753e7;
  color: #fff;
  border-radius: 8rpx;
}
</style>