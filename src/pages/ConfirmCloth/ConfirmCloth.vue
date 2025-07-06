<template>
  <view class="container">
    <view class="title">选择服装</view>
    <view class="image-container">
      <!-- 修改：使用 image 标签显示图片 -->
      <image
        v-if="imageUrl"
        :src="imageUrl"
        class="img-placeholder"
        mode="aspectFit"
      />
      <!-- 如果没有图片URL，显示占位符 -->
      <view
        v-else
        class="img-placeholder"
      ></view>
    </view>
    <view class="button-row">
      <!-- 修改：绑定点击事件并启用按钮 -->
      <button
        class="btn btn-grey"
        @click="onReselect"
      >重新挑选</button>
      <button
        class="btn btn-purple"
        @click="onSelectBottoms"
      >选择下装</button>
    </view>
    <view class="complete-btn-row">
      <button
        class="btn btn-complete"
        @click="onComplete"
      >选择完成</button>
    </view>
    <customer-service />
  </view>
</template>

<script>
// 修改：使用 Options API
export default {
  data() {
    return {
      imageUrl: '' // 用于存储上个页面传来的图片路径
    };
  },
  // 1. 在页面加载时，获取上个页面传递的图片URL
  onLoad(options) {
    if (options.imageUrl) {
      this.imageUrl = decodeURIComponent(options.imageUrl);
      console.log('接收到的图片URL:', this.imageUrl);
    } else {
      console.error('未接收到图片URL');
    }
  },
  methods: {
    // 2. “重新挑选”按钮的逻辑
    onReselect() {
      console.log('点击了重新挑选');
      // 返回到 UploadCloth 页面 (通常是返回两级)
      uni.navigateBack({
        delta: 2
      });
    },
    // 3. “选择下装”按钮的逻辑
    onSelectBottoms() {
      console.log('点击了选择下装');
      // 跳转到 UploadTrousers 页面
      uni.navigateTo({
        url: '/pages/UploadTrousers/UploadTrousers'
      });
    },
    // 4. “选择完成”按钮的逻辑
    onComplete() {
      console.log('点击了选择完成');
      uni.showToast({
        title: '搭配已完成！',
        icon: 'success'
      });
      // 这里可以添加跳转到最终结果页的逻辑
    },
    // 5. “AI智能选衣”按钮的逻辑
    onAiSelect() {
      console.log('点击了AI智能选衣');
      uni.showToast({
        title: 'AI功能开发中',
        icon: 'none'
      });
    }
  }
};
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
  background: #f0f0f0; /* 修改背景色以区分 */
  border-radius: 8rpx;
  border: 2rpx solid #e0e0e0;
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
  color: #333; /* 修改颜色，因为按钮已启用 */
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
  right: 40rpx; /* 调整位置 */
  top: 50%;
  transform: translateY(-50%);
}
.ai-circle {
  width: 88rpx; /* 稍微增大 */
  height: 88rpx;
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
  font-size: 28rpx; /* 增大字体 */
}
.ai-desc {
  color: #aaa;
  font-size: 18rpx; /* 增大字体 */
  margin-top: 2rpx;
}
</style>