<template>
  <view class="container">
    <!-- 图片容器 -->
    <view class="image-container">
      <image
        v-if="imageUrl"
        :src="imageUrl"
        mode="aspectFit"
        class="photo"
      />
      <view
        v-else
        class="photo placeholder"
      ></view>
    </view>

    <!-- 按钮区 -->
    <view class="button-group">
      <button
        class="retry-btn"
        @click="onRetry"
      >重新挑选</button>
      <button
        class="confirm-btn"
        @click="onConfirm"
      >下一步</button>
    </view>

    <!-- <customer-service /> -->
  </view>
</template>

<script>
import CustomerService from '@/components/CustomerService/CustomerService.vue';
import apiConfig from '@/utils/api.js';
import request from '@/utils/request.js';

export default {
  components: { CustomerService },
  data() {
    return {
      imageUrl: '',      // 用于图片显示
      imageBase64: ''    // 用于上传
    }
  },
  onLoad(options) {
    if (options.imageBase64) {
      this.imageBase64 = decodeURIComponent(options.imageBase64);
      // 显示图片时加前缀
      this.imageUrl = 'data:image/jpeg;base64,' + this.imageBase64;
    }
  },
  methods: {
    onRetry() {
      uni.navigateBack();
    },
    async onConfirm() {
      if (!this.imageBase64) {
        uni.showToast({ title: '没有可上传的图片', icon: 'none' });
        return;
      }
      uni.showLoading({ title: '正在上传...', mask: true });
      try {
        const result = await request({
          url: `${apiConfig.BASE_URL}/photo/upload`,
          method: 'POST',
          header: { 'Content-Type': 'application/json' },
          data: { file: this.imageBase64 } // 只传纯base64，不带前缀
        });
        if (result.code === 200) {
          uni.showToast({ title: '上传成功！', icon: 'success' });
          setTimeout(() => {
            uni.navigateTo({ url: '/pages/UploadWhole/UploadWhole' });
          }, 1500);
        } else {
          uni.showToast({ title: result.message || '上传失败，请重试', icon: 'none' });
        }
      } catch (error) {
        uni.showToast({ title: '上传失败，请重试', icon: 'none' });
      } finally {
        uni.hideLoading();
      }
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 40rpx;
}
.image-container {
  width: 440rpx;
  height: 560rpx;
  margin: 0 auto 60rpx auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
.photo {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
  background: #666;
}
.placeholder {
  display: flex;
}
.button-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.retry-btn {
  width: 400rpx;
  height: 64rpx;
  background: #d8d8d8;
  color: #fff;
  border-radius: 12rpx;
  font-size: 28rpx;
  margin-bottom: 32rpx;
  border: none;
}
.confirm-btn {
  width: 400rpx;
  height: 64rpx;
  background: #6c5ce7;
  color: #fff;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
}
.ai-tip {
  position: absolute;
  right: 32rpx;
  top: 120rpx;
  width: 72rpx;
  height: 72rpx;
  background: #fff;
  border-radius: 50%;
  border: 2rpx solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  color: #6c5ce7;
  box-shadow: 0 2rpx 8rpx rgba(108, 92, 231, 0.08);
}
</style>