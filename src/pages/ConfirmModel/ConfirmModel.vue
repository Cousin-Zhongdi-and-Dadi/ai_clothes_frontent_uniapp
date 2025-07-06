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
    
    // 改造：“下一步”按钮，执行上传逻辑
    async onConfirm() {
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

      try {
        // 使用 async/await 调用 uni.uploadFile
        const uploadRes = await uni.uploadFile({
          url: `${apiConfig.BASE_URL}/photo/upload`,
          filePath: this.imageUrl,
          name: 'file',
          header: {
            'Authorization': `Bearer ${token}`
          },
        });

        // uni.uploadFile 返回的 data 是字符串，需要解析
        const data = JSON.parse(uploadRes.data);
        
        // 统一的成功码判断
        const successCodes = [1, 200, 0];
        if (data && successCodes.includes(data.code)) {
          const personImageUrl = data.data;
          uni.setStorageSync('personImageUrl', personImageUrl);
          console.log('模特图URL已存储:', personImageUrl);

          uni.showToast({ title: '上传成功！', icon: 'success' });
          
          setTimeout(() => {
            uni.navigateTo({ url: '/pages/UploadCloth/UploadCloth' });
          }, 1500);
        } else {
          // 业务失败
          uni.showToast({ title: data.message || '上传失败', icon: 'none' });
        }
      } catch (error) {
        // 网络或其它执行错误
        uni.showToast({ title: '网络请求失败', icon: 'none' });
        console.error('Upload failed:', error);
      } finally {
        // 确保 loading 总是被关闭
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