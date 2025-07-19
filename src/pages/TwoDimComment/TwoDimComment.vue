<template>
  <view class="container">
    <view class="chat-title">AI 搭配建议</view>
    <!-- 加载/图片/失败提示 -->
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
    <!-- 描述信息 -->
    <view class="desc-box">
      <text>{{ description || '正在加载搭配建议...' }}</text>
    </view>
    <!-- 按钮 -->
    <button
      class="btn btn-grey"
      @click="restartProcess"
    >重新搭配</button>
    <button
      class="btn btn-primary"
      @click="addToFavorites"
    >收藏穿搭</button>
    <!-- 重试弹窗 -->
    <view
      v-if="showRetryModal"
      class="modal-mask"
    >
      <view class="modal-content">
        <view class="modal-title">任务超时</view>
        <view class="modal-desc">AI搭配生成超时，是否重试？</view>
        <view class="modal-btns">
          <button
            class="modal-btn cancel"
            @click="cancelRetry"
          >取消</button>
          <button
            class="modal-btn retry"
            @click="retryPolling"
          >重试</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
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
      maxPollingCount: 40,
      showRetryModal: false
    };
  },
  onLoad(options) {
    if (options.taskId) {
      this.taskId = options.taskId;
      // 重新搭配时，personUrl和garmentUrl已在缓存中，无需清理
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
    startPolling() {
      this.isLoading = true;
      this.pollingCount = 0;
      this.fetchResult();
      this.pollingTimer = setInterval(() => {
        if (this.pollingCount++ > this.maxPollingCount) {
          clearInterval(this.pollingTimer);
          this.isLoading = false;
          this.showRetryModal = true;
          this.description = '任务处理超时，请稍后重试。';
          return;
        }
        this.fetchResult();
      }, 3000);
    },
    async fetchResult() {
      console.log(`开始轮询第 ${this.pollingCount} 次...`);
      try {
        const res = await request({
          url: `${apiConfig.BASE_URL}/fitting_2d/getResult/${this.taskId}`,
          method: 'GET',
        });
        if (res && res.imageUrl) {
          clearInterval(this.pollingTimer);
          this.isLoading = false;
          this.outfitImageUrl = res.imageUrl;
          this.description = res.description;
          this.showRetryModal = false;
        }
      } catch (error) {
        console.error('Result request failed:', error);
        clearInterval(this.pollingTimer);
        this.isLoading = false;
        this.showRetryModal = true;
        this.description = '网络错误或任务失败，无法获取搭配结果。';
      }
    },
    retryPolling() {
      this.showRetryModal = false;
      this.startPolling();
    },
    cancelRetry() {
      this.showRetryModal = false;
      uni.reLaunch({
        url: '/pages/TwoDimDisplay/TwoDimDisplay'
      });
    },
    async addToFavorites() {
      if (!this.outfitImageUrl) {
        uni.showToast({ title: '没有可收藏的图片', icon: 'none' });
        return;
      }
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({ title: '未登录', icon: 'none' });
        return;
      }
      uni.showLoading({ title: '正在收藏...' });
      try {
        await request({
          url: `${apiConfig.BASE_URL}/collection/add?imageUrl=${encodeURIComponent(this.outfitImageUrl)}`,
          method: 'POST',
          header: { Authorization: token }
        });
        uni.showToast({ title: '收藏成功！', icon: 'success' });
      } catch (error) {
        console.error('Favorite request failed:', error);
      } finally {
        uni.hideLoading();
      }
    },
    restartProcess() {
      // 跳转回tabBar页面 TwoDimDisplay.vue
      uni.switchTab({
        url: '/pages/TwoDimDisplay/TwoDimDisplay'
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
.modal-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: #fff;
  border-radius: 20rpx;
  padding: 48rpx 32rpx;
  width: 80vw;
  max-width: 480rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  text-align: center;
}
.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 24rpx;
}
.modal-desc {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 40rpx;
}
.modal-btns {
  display: flex;
  justify-content: space-between;
  gap: 32rpx;
}
.modal-btn {
  flex: 1;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
}
.cancel {
  background: #eee;
  color: #333;
}
.retry {
  background: #6c5ce7;
  color: #fff;
}
</style>