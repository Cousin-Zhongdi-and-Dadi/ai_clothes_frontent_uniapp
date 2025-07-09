<template>
  <view class="container">
    <view class="image-container">
      <image
        v-if="imageUrl"
        :src="imageUrl"
        mode="aspectFit"
        class="photo"
      />
    </view>

    <view class="button-group">
      <button
        class="retry-btn"
        @click="onReselect"
      >重新挑选</button>
      <!-- 仅当为上装时，显示“选择下装”按钮 -->
      <button
        v-if="type === 'top'"
        class="secondary-btn"
        @click="onSelectBottom"
      >
        选择下装
      </button>
      <button
        class="confirm-btn"
        @click="startFitting"
      >开始搭配</button>
    </view>
  </view>
</template>

<script>
import request from '../../utils/request.js';
import apiConfig from '../../utils/api.js';

export default {
  data() {
    return {
      imageUrl: '',
      type: 'top',
    };
  },
  onLoad(options) {
    if (options.imageUrl && options.type) {
      this.imageUrl = decodeURIComponent(options.imageUrl);
      this.type = options.type;

      // 将选择的衣物URL存入缓存，供后续2D试衣使用
      const key = this.type === 'top' ? 'topGarmentUrl' : 'bottomGarmentUrl';
      uni.setStorageSync(key, this.imageUrl);
      console.log(`${this.type === 'top' ? '上装' : '下装'}URL已存储:`, this.imageUrl);
    } else {
      console.error('未接收到图片URL或类型');
      uni.showToast({ title: '页面参数错误', icon: 'none' });
    }
  },
  methods: {
    onReselect() {
      uni.navigateBack();
    },

    onSelectBottom() {
      uni.navigateTo({
        url: '/pages/UploadWhole/UploadWhole'
      });
    },

    async startFitting() {
      const personImageUrl = uni.getStorageSync('personImageUrl');
      const topGarmentUrl = uni.getStorageSync('topGarmentUrl');
      const bottomGarmentUrl = uni.getStorageSync('bottomGarmentUrl') || null;

      if (!personImageUrl || !topGarmentUrl) {
        uni.showToast({ title: '缺少人物或上装图片', icon: 'none' });
        return;
      }

      uni.showLoading({ title: '正在生成搭配...' });

      try {
        const data = await request({
          url: `${apiConfig.BASE_URL}/fitting_2d/generate`,
          method: 'POST',
          data: {
            personImageUrl,
            topGarmentUrl,
            bottomGarmentUrl
          }
        });

        uni.removeStorageSync('personImageUrl');
        uni.removeStorageSync('topGarmentUrl');
        uni.removeStorageSync('bottomGarmentUrl');

        uni.redirectTo({
          url: `/pages/TwoDimComment/TwoDimComment?taskId=${data.taskId}`
        });
      } catch (error) {
        console.error('生成搭配失败:', error);
      } finally {
        uni.hideLoading();
      }
    }
  }
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 80rpx;
}
.image-container {
  width: 440rpx;
  height: 560rpx;
  margin-bottom: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}
.photo {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}
.button-group {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 20rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
}
.retry-btn,
.confirm-btn,
.secondary-btn {
  flex: 1;
  max-width: 280rpx;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  border: none;
  font-weight: 500;
  margin: 0;
}
.retry-btn {
  background: #f0f0f0;
  color: #333;
}
.secondary-btn {
  background: #e0dffc;
  color: #6c5ce7;
}
.confirm-btn {
  background: #6c5ce7;
  color: #fff;
}
</style>