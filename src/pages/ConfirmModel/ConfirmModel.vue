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
// 1. 同时导入 request 和 uploadFile
import request, { uploadFile } from '@/utils/request.js';

export default {
  components: { CustomerService },
  data() {
    return {
      imageUrl: '' // 用于存储从上个页面传来的图片临时路径
    }
  },
  onLoad(options) {
    if (options.imageUrl) {
      this.imageUrl = decodeURIComponent(options.imageUrl);
    }
  },
  methods: {
    // “重新挑选”按钮，返回上一个页面
    onRetry() {
      uni.navigateBack();
    },
    
    // 2. 改造：“下一步”按钮，使用封装的 uploadFile 函数
    async onConfirm() {
      if (!this.imageUrl) {
        uni.showToast({ title: '没有可上传的图片', icon: 'none' });
        return;
      }

      // 登录检查
      if (!uni.getStorageSync('token')) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        setTimeout(() => uni.reLaunch({ url: '/pages/LoginSelection/LoginSelection' }), 1500);
        return;
      }

      // --- 开始修改：核心逻辑调整 ---
      // 1. 在任何网络请求之前，立刻将本地临时文件路径存入缓存
      // 这确保了后续页面能获取到用于最终搭配的原始图片路径
      uni.setStorageSync('personImageUrl', this.imageUrl);
      console.log('模特图本地临时路径已存储:', this.imageUrl);
      // --- 结束修改 ---

      uni.showLoading({ title: '正在上传...' });

      try {
        // 2. 继续执行上传操作，但我们不再使用它返回的URL来覆盖缓存
        await uploadFile({
          url: `${apiConfig.BASE_URL}/photo/upload`,
          filePath: this.imageUrl,
          name: 'file',
        });

        // 业务成功，uploadFile 直接返回了需要的数据
        // uni.setStorageSync('personImageUrl', personImageUrl); // <-- 删除这一行，不再用服务器URL覆盖本地路径
        
        uni.showToast({ title: '上传成功！', icon: 'success' });
        
        setTimeout(() => {
          uni.navigateTo({ url: '/pages/UploadWhole/UploadWhole' });
        }, 1500);

      } catch (error) {
        console.error('Upload failed:', error);
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