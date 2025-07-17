<template>
  <view class="ai-match-result-page">
    <!-- 顶部提示 -->
    <view class="tips">AI根据您的输入生成的搭配建议</view>

    <!-- 图片展示区 -->
    <view class="image-container">
      <image
        v-if="imageUrl"
        :src="imageUrl"
        class="result-image"
        mode="aspectFill"
      />
      <view
        v-else
        class="image-placeholder"
      >暂无图片</view>
    </view>

    <!-- 图片标题 -->
    <view class="result-title">{{ title }}</view>

    <!-- 图片标签 -->
    <view class="result-tags">{{ tags }}</view>
  </view>
</template>

<script>
export default {
  name: 'AiMatchResult',
  data() {
    return {
      imageUrl: '', // 图片链接
      title: '夏日运动休闲搭配', // 示例标题
      tags: '运动 / 日常 / 清爽', // 示例标签
    };
  },
  methods: {
    // 可扩展：如需动态获取数据
  }
};
</script>

<style scoped>
.ai-match-result-page {
  padding: 40rpx 32rpx 32rpx 32rpx;
}
.tips {
  color: #6753e7;
  font-size: 28rpx;
  background: #f5f6fa;
  padding: 20rpx 0;
  text-align: center;
  border-radius: 12rpx;
  margin-bottom: 32rpx;
}
.image-container {
  width: 100%;
  height: 360rpx;
  background: #fafafa;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
  overflow: hidden;
}
.result-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16rpx;
}
.image-placeholder {
  color: #bbb;
  font-size: 26rpx;
}
.result-title {
  font-size: 30rpx;
  color: #222;
  font-weight: 500;
  margin-bottom: 16rpx;
  text-align: center;
}
.result-tags {
  font-size: 24rpx;
  color: #888;
  text-align: center;
}
</style>