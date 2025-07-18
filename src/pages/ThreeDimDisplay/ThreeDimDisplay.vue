<template>
  <view class="container">
    <!-- 1. 加载时显示提示 -->
    <view
      v-if="isLoading"
      class="status-container"
    >
      <view class="loading-animation"></view>
      <text>正在加载3D模型...</text>
    </view>

    <!-- 2. 获取到URL后，再渲染 web-view -->
    <view>
      <text class="tips">当前链接需要您复制到浏览器手动打开</text>
      <button
        class="copy-btn"
        @click="copyUrl"
      >复制链接到剪贴板</button>
    </view>

    <!-- 3. 如果获取失败，显示错误提示 -->
    <view
      v-if="!isLoading && !url"
      class="status-container"
    >
      <text>无法加载模型，请稍后重试。</text>
    </view>
  </view>
</template>

<script>
// 1. 导入封装的 request 函数和 apiConfig
import request from '../../utils/request.js';
import apiConfig from '@/utils/api.js';

export default {
  name: 'ThreeDimDisplay',
  data() {
    return {
      // 4. url 初始为空
      url: '',
      // 5. 新增加载状态
      isLoading: true
    };
  },
  // 6. 页面加载时触发
  onLoad(options) {
    // 从页面跳转的参数中获取 styleId
    if (options.styleId) {
      this.fetchModelUrl(options.styleId);
    } else {
      console.error('No styleId provided to ThreeDimDisplay page.');
      uni.showToast({
        title: '缺少模型ID',
        icon: 'none'
      });
      this.isLoading = false;
    }
  },
  methods: {
    // 7. 新增：根据 styleId 获取模型URL的方法
    async fetchModelUrl(styleId) {
      this.isLoading = true;
      try {
        // 使用封装的 request 函数
        const modelUrl = await request({
          url: `${apiConfig.BASE_URL}/fitting_3d/getLink/${styleId}`,
          method: 'GET',
        });
        
        // 业务成功，request 函数直接返回了 URL
        this.url = modelUrl;        
      } catch (error) {
        // 错误提示已由 request 函数统一处理
        console.error('Fetch 3D URL failed:', error);
        // this.url 保持为空，模板会自动显示错误提示
      } finally {
        // 无论成功或失败，都隐藏加载提示
        this.isLoading = false;
      }
    },
    copyUrl() {
      uni.setClipboardData({
        data: this.url,
        success: () => {
          uni.showToast({
            title: '已复制链接',
            icon: 'none'
          });
        }
      });
    }
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  height: 100vh;
}
.status-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
  font-size: 28rpx;
}
.loading-animation {
  width: 60rpx;
  height: 60rpx;
  border: 6rpx solid #e0e0e0;
  border-top-color: #6c63ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
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