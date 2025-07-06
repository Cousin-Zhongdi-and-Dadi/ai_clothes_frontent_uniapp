<template>
  <view class="container">
    <view class="chat-title">AI 搭配建议</view>

    <!-- 1. 根据加载状态显示不同内容 -->
    <view
      v-if="isLoading"
      class="image-placeholder loading-state"
    >
      <view class="loading-animation"></view>
      <text class="loading-text">AI搭配生成中，请稍候...</text>
    </view>
    <image
      v-else-if="outfitImageUrl"
      :src="outfitImageUrl"
      class="image-placeholder"
      mode="aspectFit"
    />
    <view
      v-else
      class="image-placeholder error-state"
    >
      <text>生成失败，请重试</text>
    </view>

    <!-- 2. 显示后端返回的描述信息 -->
    <view class="desc-box">
      <text>{{ description || '正在加载搭配建议...' }}</text>
    </view>

    <!-- 3. 按钮 -->
    <button
      class="btn btn-grey"
      @click="restartProcess"
    >重新搭配</button>
    <button
      class="btn btn-primary"
      @click="addToFavorites"
    >收藏穿搭</button>
  </view>
</template>

<script>
// 1. 导入封装的 request 函数和 apiConfig
import request from '../../utils/request.js';
import apiConfig from '../../utils/api.js';

export default {
  data() {
    return {
      taskId: null,
      outfitImageUrl: '',
      description: '',
      isLoading: true,
      pollingTimer: null,
      pollingCount: 0,
      maxPollingCount: 20
    };
  },
  onLoad(options) {
    if (options.taskId) {
      this.taskId = options.taskId;
      this.startPolling();
    } else {
      console.error('未接收到 taskId');
      this.isLoading = false;
      this.description = '页面加载错误，缺少任务ID。';
    }
  },
  onUnload() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  },
  methods: {
    // 2. 改造 startPolling 和 fetchResult
    startPolling() {
      this.fetchResult(); // 立即执行一次
      this.pollingTimer = setInterval(() => {
        if (this.pollingCount++ > this.maxPollingCount) {
          clearInterval(this.pollingTimer);
          this.isLoading = false;
          this.description = '任务处理超时，请稍后重试。';
          uni.showToast({ title: '任务超时', icon: 'none' });
          return;
        }
        this.fetchResult();
      }, 3000);
    },

    async fetchResult() {
      try {
        const data = await request({
          url: `${apiConfig.BASE_URL}/fitting_2d/getResult/${this.taskId}`,
          method: 'GET',
        });

        // 业务成功，但需要判断是否已生成结果
        if (data && data.imageUrl) {
          // 成功获取结果
          clearInterval(this.pollingTimer);
          this.isLoading = false;
          this.outfitImageUrl = data.imageUrl;
          this.description = data.description;
        } else {
          // 任务仍在处理中，继续轮询
          console.log(`轮询中... (${this.pollingCount})`);
        }
      } catch (error) {
        // request 内部已处理了大部分错误提示
        // 这里可以针对性地停止轮询
        console.error('Result request failed:', error);
        clearInterval(this.pollingTimer);
        this.isLoading = false;
        this.description = '网络错误或任务失败，无法获取搭配结果。';
      }
    },

    // 3. 改造 addToFavorites 方法
    async addToFavorites() {
      if (!this.outfitImageUrl) {
        uni.showToast({ title: '没有可收藏的图片', icon: 'none' });
        return;
      }
      
      uni.showLoading({ title: '正在收藏...' });
      try {
        // 根据之前的代码，这里应该是 /collection/add
        await request({
          url: `${apiConfig.BASE_URL}/collection/add?imageUrl=${encodeURIComponent(this.outfitImageUrl)}`,
          method: 'POST',
        });
        uni.showToast({ title: '收藏成功！', icon: 'success' });
      } catch (error) {
        console.error('Favorite request failed:', error);
        // 错误提示已由 request 函数统一处理
      } finally {
        uni.hideLoading();
      }
    },

    // 4. restartProcess 方法保持不变
    restartProcess() {
      uni.reLaunch({
        url: '/pages/UploadCloth/UploadCloth'
      });
    }
  }
};
</script>

<style scoped>
.container {
  background: #fafafa;
  min-height: 100vh;
  padding: 0 32rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.chat-title {
  font-size: 34rpx;
  font-weight: 500;
  text-align: center;
  margin-top: 32rpx;
  margin-bottom: 32rpx;
  color: #222;
}
.image-placeholder {
  width: 440rpx;
  height: 560rpx;
  background: #e0e0e0;
  border-radius: 24rpx;
  margin-bottom: 32rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.desc-box {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx 20rpx;
  font-size: 26rpx;
  color: #222;
  margin-bottom: 48rpx;
  line-height: 1.6;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.02);
  width: 100%;
  max-width: 520rpx;
  box-sizing: border-box;
  min-height: 100rpx; /* 最小高度，防止加载时跳动 */
}
.btn {
  width: 100%;
  max-width: 520rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  margin-bottom: 24rpx;
  border: none;
}
.btn::after {
  border: none;
}
.btn-grey {
  background: #e5e5e5;
  color: #333;
}
.btn-primary {
  background: #6c63ff;
  color: #fff;
  margin-bottom: 0;
}

/* 新增加载中样式 */
.loading-state {
  color: #888;
}
.loading-text {
  margin-top: 20rpx;
  font-size: 26rpx;
}
.loading-animation {
  width: 80rpx;
  height: 80rpx;
  border: 8rpx solid #f3f3f3;
  border-top: 8rpx solid #6c63ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.error-state {
  color: #ff4d4f;
  font-size: 28rpx;
}
</style>