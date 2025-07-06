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

    <customer-service />
  </view>
</template>

<script>
import CustomerService from '@/components/CustomerService/CustomerService.vue';
import apiConfig from '@/utils/api.js'; // 1. 导入API配置

export default {
  components: { CustomerService },
  data() {
    return {
      imageUrl: '' // 用于存储从上个页面传来的图片临时路径
    }
  },
  // 2. 在页面加载时，获取上个页面传递的图片URL
  onLoad(options) {
    if (options.imageUrl) {
      this.imageUrl = decodeURIComponent(options.imageUrl);
    }
  },
  methods: {
    // 3. “重新挑选”按钮，返回上一个页面
    onRetry() {
      uni.navigateBack();
    },
    // 4. “下一步”按钮，执行上传逻辑
    onConfirm() {
      if (!this.imageUrl) {
        uni.showToast({ title: '没有可上传的图片', icon: 'none' });
        return;
      }

      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        setTimeout(() => uni.reLaunch({ url: '/pages/LoginSelection/LoginSelection' }), 1500);
        return;
      }

      uni.showLoading({ title: '正在上传...' });

      uni.uploadFile({
        url: `${apiConfig.BASE_URL}/photo/upload`, // 你的图片上传API地址
        filePath: this.imageUrl,
        name: 'file', // 后端接收文件的字段名
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (uploadRes) => {
          const data = JSON.parse(uploadRes.data);
          if (/*data.code === 0 && data.data === true*/ true) {
            uni.showToast({ title: '上传成功！', icon: 'success' });
            // 在这里可以进行下一步操作，例如跳转到最终的展示页
            uni.navigateTo({ url: '/pages/UploadCloth/UploadCloth' });
          } else {
            uni.showToast({ title: data.message || '上传失败', icon: 'none' });
          }
        },
        fail: (err) => {
          uni.showToast({ title: '网络请求失败', icon: 'none' });
          console.error('Upload failed:', err);
        },
        complete: () => {
          uni.hideLoading();
        }
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