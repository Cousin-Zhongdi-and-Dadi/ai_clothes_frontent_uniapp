<template>
  <view class="page-root">
    <!-- result card -->
    <view class="result-card">
      <!-- 右上角评分图标占位（静态图片恢复，用于视觉占位） -->
      <image
        class="result-icon"
        src="/static/icon/ai评价/y.png"
        mode="widthFix"
      />
      <view class="left">
        <view
          class="image-wrap"
          :class="{ loading: isLoading }"
        >
          <image
            v-if="outfitImageUrl && !isLoading"
            :src="outfitImageUrl"
            class="avatar"
            mode="aspectFill"
          />
          <view
            v-else
            class="avatar placeholder"
          >
            <view
              class="loading-animation-small"
              v-if="isLoading"
            ></view>
            <text
              v-else
              class="placeholder-text"
            >无图片</text>
          </view>
          <button
            class="replace-btn"
            @click="restartProcess"
          >更换</button>
          <view
            class="fav-btn"
            @click="addToFavorites"
          >
            <image
              src="/static/icon/ai评价/收藏按钮.png"
              style="width:40rpx;height:40rpx;display:block;"
              mode="widthFix"
            />
          </view>
        </view>
      </view>
      <view class="right">
        <view class="tags two-line">
          <view class="tag-row">
            <view class="pill">上衣</view>
            <view
              v-if="topGarmentCategory"
              class="attr"
            >{{ topGarmentCategory }}</view>
          </view>
          <view class="tag-row">
            <view class="pill">下装</view>
            <view
              v-if="bottomGarmentCategory"
              class="attr"
            >{{ bottomGarmentCategory || "无下装" }}</view>
          </view>
        </view>
      </view>
    </view>
    <!-- rating placed at top-right of card -->
    <view class="rating-top-right">
      <view class="stars">
        <image
          v-for="n in 5"
          :key="n"
          :src="n < litCount ? '/static/icon/ai评价/评分星星有色.png' : '/static/icon/ai评价/评分星星无色.png'"
          class="star-icon"
          mode="widthFix"
        />
      </view>
      <text class="score">{{ rating.toFixed(1) }}</text>
    </view>

    <!-- recommendation box -->
    <view class="recommend-box">
      <view class="rec-title">AI搭配建议</view>
      <view class="rec-content">
        <towxml :nodes="$towxmlFun(description || '正在加载搭配建议...', 'markdown')" />
      </view>
    </view>

    <!-- other comments horizontal list
    <view class="other-section">
      <view class="other-title">其他搭配评价</view>
      <scroll-view
        class="other-list"
        scroll-x="true"
        show-scrollbar="false"
      >
        <view
          class="other-item"
          v-for="(img, idx) in [1,2,3]"
          :key="idx"
        >
          <image
            :src="`/static/example_pictures/sample${idx}.jpg`"
            class="other-img"
            mode="aspectFill"
          />
        </view>
      </scroll-view>
    </view> -->

    <!-- existing modal (keep unchanged) -->
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
import request from '@/utils/request.js';
import apiConfig from '@/utils/api.js';

export default {
  data() {
    return {
      taskId: null,
      outfitImageUrl: '',
      description: '',
  topGarmentCategory: '',
  bottomGarmentCategory: '',
      isLoading: true,
  rating: 4, // 改为数字 4，避免字符串解析问题
      litCount: 4, // 新增：手动计算的点亮星星数，默认 4
      pollingTimer: null,
      pollingCount: 0,
      maxPollingCount: 40,
      showRetryModal: false
    };
  },
  onLoad(options) {
    // 先尝试同步读取上/下装分类，避免因网络或其他异步导致标签为空
    try {
      this.topGarmentCategory = uni.getStorageSync('topGarmentCategory') || '';
      this.bottomGarmentCategory = uni.getStorageSync('bottomGarmentCategory') || '';
    } catch (e) {
      console.warn('初始化读取分类失败', e);
    }

    if (options && options.taskId) {
      this.taskId = options.taskId;
      this.startPolling();
    } else {
      console.error('未接收到 taskId');
      this.isLoading = false;
      this.description = '页面加载错误，缺少任务ID。';
    }
    // 新增：初始化 litCount
    this.litCount = Math.floor(Number(this.rating)) || 4;
  },
  onUnload() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  },
  methods: {
    /**
     * markdown渲染
     */
    renderMarkdown(md) {
      if (!md) return [];
      const html = (marked.default || marked).parse(md);
      return html;
    },
    /**
     * Start polling for AI outfit result
     */
    startPolling() {
      this.isLoading = true;
      this.pollingCount = 0;
      this.fetchResult();
      this.pollingTimer = setInterval(() => {
        this.pollingCount++;
        if (this.pollingCount > this.maxPollingCount) {
          clearInterval(this.pollingTimer);
          this.pollingTimer = null;
          this.isLoading = false;
          this.showRetryModal = true;
          this.description = '任务处理超时，请稍后重试。';
          return;
        }
        this.fetchResult();
      }, 3000);
    },
    /**
     * Fetch AI outfit result from backend
     */
    async fetchResult() {
      try {
        const res = await request({
          url: `${apiConfig.BASE_URL}/fitting_2d/getResult/${this.taskId}`,
          method: 'GET'
        });
        if (res && res.imageUrl) {
          if (this.pollingTimer) {
            clearInterval(this.pollingTimer);
            this.pollingTimer = null;
          }
          this.isLoading = false;
          this.outfitImageUrl = res.imageUrl;
          this.description = res.description;
          // 后端暂未实现 rating，测试期间强制设置为 4 分
          try {
            this.rating = 4; // 确保是数字
            this.litCount = Math.floor(Number(this.rating)) || 4; // 新增：手动更新 litCount
          } catch (e) {
            console.warn('设置测试 rating 失败', e);
          }
          this.showRetryModal = false;
          // 同步读取上/下装分类，以便展示
          try {
            this.topGarmentCategory = uni.getStorageSync('topGarmentCategory') || '';
            this.bottomGarmentCategory = uni.getStorageSync('bottomGarmentCategory') || '';
          } catch (e) {
            console.warn('读取分类失败', e);
          }
        }
      } catch (error) {
        console.error('Result request failed:', error);
        if (this.pollingTimer) {
          clearInterval(this.pollingTimer);
          this.pollingTimer = null;
        }
        this.isLoading = false;
        this.showRetryModal = true;
        this.description = '网络错误或任务失败，无法获取搭配结果。';
      }
    },
    /**
     * Retry polling for AI result
     */
    retryPolling() {
      this.showRetryModal = false;
      this.startPolling();
    },
    /**
     * Cancel retry and return to display page
     */
    cancelRetry() {
      this.showRetryModal = false;
      uni.reLaunch({
        url: '/subpackages/twodim/TwoDimDisplay/TwoDimDisplay'
      });
    },
    /**
     * Add current outfit to favorites
     */
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
    /**
     * Restart the AI outfit process
     */
    restartProcess() {
      uni.switchTab({
        url: '/pages/TryOnContainer/TryOnContainer'
      });
    }
  }
};
</script>

<style scoped>
:root {
  --purple: #6c63ff;
  --light-purple: #efeaff;
  --muted: #666;
}
.page-root {
  background: #faf8ff;
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
}
.header {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8rpx;
}
.back {
  font-size: 44rpx;
  color: var(--purple);
  width: 88rpx;
}
.title {
  font-size: 36rpx;
  color: #3b3b3b;
  font-weight: 600;
}
.header-spacer {
  width: 88rpx;
}

.result-card {
  background: var(--light-purple);
  border-radius: 24rpx;
  padding: 24rpx;
  display: flex;
  gap: 20rpx;
  align-items: flex-start;
  box-shadow: 0 8rpx 24rpx rgba(108, 99, 255, 0.08);
  margin-bottom: 28rpx;
  position: relative; /* 为右上角图标留出定位上下文 */
}
.left {
  width: 240rpx;
}
.image-wrap {
  position: relative;
  width: 240rpx;
  height: 320rpx;
  border-radius: 20rpx;
  overflow: hidden;
  border: 6rpx solid var(--light-purple);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}
.image-wrap.loading {
  opacity: 0.85;
}
.avatar {
  width: 100%;
  height: 100%;
  display: block;
}
.avatar.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}
.placeholder-text {
  color: #999;
  font-size: 26rpx;
}
.loading-animation-small {
  width: 40rpx;
  height: 40rpx;
  border: 6rpx solid #f3f3f3;
  border-top: 6rpx solid var(--purple);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.replace-btn {
  position: absolute;
  left: 12rpx;
  bottom: 12rpx;
  background: var(--purple);
  padding: 0 14rpx;
  border-radius: 32rpx;
  font-size: 24rpx;
  color: #fff;
  border: none;
}
.fav-btn {
  position: absolute;
  right: 0rpx;
  top: 12rpx;
  width: 56rpx;
  height: 56rpx;
}

/* 右上角评分图标 */
.result-icon {
  position: absolute;
  right: 20rpx;
  top: 18rpx;
  width: 400rpx;
  z-index: 10;
}

/* rating placed at top-right of result-card */
.rating-top-right {
  position: absolute;
  right: 30rpx;
  top: 30rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  z-index: 20;
  background: rgba(255, 255, 255, 0.9);
  padding: 6rpx 10rpx;
  border-radius: 20rpx;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.06);
}

.rating-top-right .score {
  font-size: 24rpx;
  color: var(--muted);
}

/* 给右侧内容留出空间，避免被右上角图标遮挡 */
.right {
  padding-top: 40rpx;
  padding-right: 80rpx;
}

.right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.rating {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.stars {
  display: flex;
  gap: 6rpx;
}
.star-icon {
  width: 28rpx;
  height: 28rpx;
  display: block;
}
.score {
  font-size: 28rpx;
  color: var(--muted);
}

.tags {
  display: block;
  gap: 12rpx;
  flex-wrap: wrap;
}
.pill {
  background: var(--purple);
  color: #fff;
  padding: 8rpx 14rpx;
  border-radius: 16rpx;
  font-size: 22rpx;
}
.attr {
  display: inline-block;
  background: #f3f4f8;
  color: #444;
  padding: 8rpx 12rpx;
  border-radius: 14rpx;
  font-size: 22rpx;
  margin-left: 12rpx;
}

/* 两行标签的行容器 */
.tags.two-line .tag-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.summary {
  color: #444;
  font-size: 26rpx;
  line-height: 1.6;
  margin-top: 6rpx;
}

.recommend-box {
  background: linear-gradient(180deg, #f6f3ff 0%, #f0ebff 100%);
  border-radius: 20rpx;
  padding: 22rpx;
  box-shadow: 0 6rpx 20rpx rgba(108, 99, 255, 0.06);
  margin-bottom: 28rpx;
}
.rec-title {
  font-size: 30rpx;
  color: var(--purple);
  font-weight: 600;
  margin-bottom: 12rpx;
}
.rec-content {
  background: #fff;
  border-radius: 14rpx;
  padding: 18rpx;
  color: #333;
  font-size: 26rpx;
  line-height: 1.8;
}

.other-section {
  margin-bottom: 60rpx;
}
.other-title {
  font-size: 30rpx;
  color: #444;
  margin-bottom: 14rpx;
}
.other-list {
  display: flex;
  height: 180rpx;
}
.other-item {
  width: 160rpx;
  height: 160rpx;
  margin-right: 16rpx;
  border-radius: 14rpx;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.04);
}
.other-img {
  width: 100%;
  height: 100%;
  display: block;
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
  text-align: center;
}
.modal-title {
  font-size: 32rpx;
  font-weight: 700;
  margin-bottom: 18rpx;
}
.modal-desc {
  color: #666;
  font-size: 26rpx;
  margin-bottom: 28rpx;
}
.modal-btns {
  display: flex;
  gap: 20rpx;
}
.modal-btn {
  flex: 1;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 12rpx;
  border: none;
}
.cancel {
  background: #eee;
  color: #333;
}
.retry {
  background: var(--purple);
  color: #fff;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>