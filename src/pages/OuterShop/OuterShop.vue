<template>
  <view>
    <web-view
      src="https://fast.dewu.com/page/productDetail?sourceName=pc&spuId=1000112&skuId=602990624"
      class="web-view"
      @error="handleError"
    />
  </view>
</template>

<script>
export default {
  name: 'OuterShop',
  data() {
    return {
      // 数据
    }
  },
  methods: {
    handleError() {
      uni.showToast({
        title: '加载失败，请稍后再试',
        icon: 'none'
      });
    }
  }
}
</script>

<style scoped>
/* 页面样式 */
</style>