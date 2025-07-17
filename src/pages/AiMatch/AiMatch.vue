<template>
  <view class="ai-match-page">
    <!-- 顶部提示语 -->
    <view class="tips">点击上传，仅支持单张图片（上装 | 下装）</view>

    <!-- 上传按钮 -->
    <view class="upload-section">
      <button
        class="upload-btn"
        @click="chooseImage"
      >上传图片</button>
      <image
        v-if="imageUrl"
        :src="imageUrl"
        class="preview-image"
        mode="aspectFill"
      />
    </view>

    <!-- 场景选择 -->
    <view class="section-label">场景</view>
    <view class="scene-checkbox-group">
      <label
        class="scene-checkbox"
        v-for="scene in scenes"
        :key="scene.value"
      >
        <checkbox
          :value="scene.value"
          v-model="selectedScenes"
        />
        <text>{{ scene.label }}</text>
      </label>
    </view>

    <!-- 产品特征描述 -->
    <view class="section-label">产品特征描述（可选）</view>
    <view class="desc-input-wrapper">
      <textarea
        v-model="desc"
        class="desc-input"
        placeholder="请输入您想要的单品特征"
        auto-height
      />
    </view>

    <!-- AI推荐按钮 -->
    <button
      class="ai-btn"
      @click="onAiRecommend"
    >AI推荐</button>
  </view>
</template>

<script>
export default {
  name: 'AiMatch',
  data() {
    return {
      imageUrl: '',
      scenes: [
        { label: '运动', value: 'sport' },
        { label: '日常', value: 'daily' }
      ],
      selectedScenes: [],
      desc: ''
    };
  },
  methods: {
    chooseImage() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          this.imageUrl = res.tempFilePaths[0];
        }
      });
    },
    onAiRecommend() {
      // 这里可添加AI推荐逻辑
      uni.showToast({ title: 'AI推荐功能待实现', icon: 'none' });
    }
  }
};
</script>

<style scoped>
.ai-match-page {
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
.upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32rpx;
}
.upload-btn {
  background: #6753e7;
  color: #fff;
  border-radius: 8rpx;
  font-size: 28rpx;
  padding: 16rpx 48rpx;
  margin-bottom: 16rpx;
}
.preview-image {
  width: 240rpx;
  height: 240rpx;
  border-radius: 16rpx;
  object-fit: cover;
  border: 1rpx solid #eee;
}
.section-label {
  font-size: 28rpx;
  color: #222;
  font-weight: 500;
  margin: 32rpx 0 16rpx 0;
}
.scene-checkbox-group {
  display: flex;
  gap: 40rpx;
  margin-bottom: 32rpx;
}
.scene-checkbox {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #333;
}
.desc-input-wrapper {
  margin-bottom: 32rpx;
}
.desc-input {
  width: 100%;
  min-height: 100rpx;
  font-size: 26rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 16rpx;
  background: #fafafa;
  box-sizing: border-box;
}
.ai-btn {
  width: 100%;
  background: #6753e7;
  color: #fff;
  border-radius: 12rpx;
  font-size: 30rpx;
  padding: 24rpx 0;
  margin-top: 32rpx;
}
</style>