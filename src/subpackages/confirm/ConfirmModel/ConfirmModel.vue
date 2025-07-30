<template>
  <view class="container">
    <!-- 图片容器 -->
    <view class="image-container">
      <image
        v-if="imageUrl"
        :src="imageUrl"
        mode="aspectFit"
        class="photo"
        @click="showPreview = true"
      />
      <view
        v-else
        class="photo placeholder"
      ></view>
    </view>

    <!-- 大图预览遮罩 -->
    <view
      v-if="showPreview"
      class="preview-mask"
      @click="showPreview = false"
    >
      <image
        :src="imageUrl"
        mode="widthFix"
        class="preview-img"
      />
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

  </view>
</template>

<script>
import apiConfig from '@/utils/api.js';
import request from '@/utils/request.js';

export default {
  data() {
    return {
      imageUrl: '',            tempFilePath: '',        imageBase64: '',                     compressedFilePath: '' 
    }
  },
  onLoad(options) {
        if (options.tempFilePath) {
      const filePath = decodeURIComponent(options.tempFilePath);
      
            this.tempFilePath = filePath;
      this.compressedFilePath = filePath;       
            this.displayImage(filePath);
    }
  },
  methods: {
        displayImage(filePath) {
      this.imageUrl = filePath;
    },
    
        onRetry() {
      uni.navigateBack();
    },
    
        async onConfirm() {
      const filePath = this.compressedFilePath || this.tempFilePath;
      if (!filePath) {
        uni.showToast({ title: '没有可上传的图片', icon: 'none' });
        return;
      }
      uni.showLoading({ title: '正在上传...', mask: true });
      uni.uploadFile({
        url: `${apiConfig.BASE_URL}/fitting_2d/submit_images`,         filePath: filePath,
        name: 'file',         formData: {},         success: (res) => {
          uni.hideLoading();
          try {
            const result = JSON.parse(res.data);
            
            if (result.code === 200 && result.data) {
              uni.showToast({ title: '上传成功！', icon: 'success' });
                            uni.setStorageSync('personImageUrl', result.data);
              setTimeout(() => {
                uni.navigateTo({ url: `/subpackages/upload/UploadWhole/UploadWhole?imgUrl=${encodeURIComponent(result.data)}` });
              }, 1500);
            } else {
              uni.showToast({ title: result.message || '上传失败', icon: 'none' });
            }
          } catch (e) {
            uni.showToast({ title: '服务器响应解析失败', icon: 'none' });
          }
        },
        fail: (err) => {
          uni.hideLoading();
          uni.showToast({ title: '上传失败，请重试', icon: 'none' });
          console.error('上传失败:', err);
        }
      });
    },
    
        fileToBase64(filePath) {
      return new Promise((resolve, reject) => {
        uni.getFileSystemManager().readFile({
          filePath,
          encoding: 'base64',
          success: (res) => resolve(res.data),
          fail: (err) => reject(err)
        });
      });
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
.preview-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-img {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.18);
  background: #fff;
}
</style>