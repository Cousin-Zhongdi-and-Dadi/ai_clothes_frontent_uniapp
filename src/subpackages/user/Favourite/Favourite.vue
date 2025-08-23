<template>
  <view class="favourite-container">
    <!-- 1. 加载状态 -->
    <view
      v-if="isLoading && page === 1"
      class="status-view"
    >
      <view class="loading-animation"></view>
      <text>正在加载收藏...</text>
    </view>

    <!-- 2. 收藏列表 -->
    <view
      v-else-if="images.length > 0"
      class="favourite-list"
    >
      <view
        class="favourite-row"
        v-for="(row, rowIndex) in rows"
        :key="rowIndex"
      >
        <!-- 4. 添加 @longpress 事件 -->
        <view
          class="favourite-item"
          v-for="item in row"
          :key="item.id"
          @longpress="handleLongPress(item)"
        >
          <image
            :src="item.img"
            mode="aspectFill"
            class="favourite-img"
          />
        </view>
      </view>
      <!-- 列表底部的加载状态 -->
      <!-- <uni-load-more :status="loadMoreStatus"></uni-load-more> -->
      <!-- 新增：自定义的加载状态提示 -->
      <view class="load-more-status">
        <text v-if="loadMoreStatus === 'loading'">正在加载...</text>
        <text v-if="loadMoreStatus === 'noMore'">没有更多了</text>
      </view>
    </view>

    <!-- 3. 空状态 -->
    <view
      v-else
      class="status-view"
    >
      <text>你还没有任何收藏哦</text>
    </view>
  </view>
</template>

<script>
import request from '@/utils/request.js';
import apiConfig from '@/utils/api.js';

export default {
  name: 'Favourite',
  data() {
    return {
      images: [],
      isLoading: false,
      page: 1,
      pageSize: 12,
      hasMore: true,
      isGuest: false
    };
  },
  computed: {
    rows() {
      const result = [];
      for (let i = 0; i < this.images.length; i += 3) {
        result.push(this.images.slice(i, i + 3));
      }
      return result;
    },
    loadMoreStatus() {
      if (this.isLoading && this.page > 1) {
        return 'loading';
      }
      if (!this.hasMore) {
        return 'noMore';
      }
      return 'more';
    }
  },
  onShow() {
    const token = uni.getStorageSync('token');
    this.isGuest = !token;
    this.getFavorites(true);
  },
  onPullDownRefresh() {
    this.getFavorites(true);
  },
  onReachBottom() {
    if (!this.isLoading && this.hasMore) {
      this.getFavorites();
    }
  },
  methods: {
    getMockFavorites() {
      return [
        { id: 1, img: '/static/example_pictures/sample1.png' },
        { id: 2, img: '/static/example_pictures/sample2.png' },
        { id: 3, img: '/static/example_pictures/sample3.png' }
      ];
    },
    async getFavorites(isRefresh = false) {
      if (this.isGuest) {
        this.isLoading = false;
        this.images = this.getMockFavorites();
        this.hasMore = false;
        return;
      }
      if (this.isLoading) return;
      this.isLoading = true;
      if (isRefresh) {
        this.page = 1;
        this.images = [];
        this.hasMore = true;
      }
      try {
        const data = await request({
          url: `${apiConfig.BASE_URL}/collection/getAll`,
          method: 'GET',
          data: {
            page: this.page,
            pageSize: this.pageSize
          }
        });
        this.images = isRefresh ? data : [...this.images, ...data];
        this.hasMore = data.length === this.pageSize;
        if (this.hasMore) {
          this.page++;
        }
      } catch (error) {
        console.error('getFavorites failed:', error);
        this.hasMore = false;
      } finally {
        this.isLoading = false;
        uni.stopPullDownRefresh();
      }
    },
    async deleteFavorite(imageId) {
      uni.showLoading({ title: '正在删除...' });
      try {
        await request({
          url: `${apiConfig.BASE_URL}/collection/delete/${imageId}`,
          method: 'DELETE'
        });
        uni.showToast({ title: '删除成功', icon: 'success' });
        this.images = this.images.filter(img => img.id !== imageId);
      } catch (error) {
        console.error('deleteFavorite failed:', error);
      } finally {
        uni.hideLoading();
      }
    },
    async handleLongPress(item) {
      try {
        const res = await uni.showModal({
          title: '删除确认',
          content: `确定要删除这张收藏吗？`
        });
        if (res.confirm) {
          this.deleteFavorite(item.id);
        }
      } catch (error) {}
    }
  }
};
</script>

<style scoped>
.favourite-container {
  background: #fafafa;
  min-height: 100vh;
  padding: 16rpx;
  box-sizing: border-box;
}
.favourite-list {
  margin-top: 16rpx;
}
.favourite-row {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 12rpx;
  margin-bottom: 12rpx;
}
.favourite-item {
  width: calc((100% - 24rpx) / 3);
  aspect-ratio: 1/1;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
}
.favourite-img {
  width: 100%;
  height: 100%;
  display: block;
}
.status-view {
  width: 100%;
  text-align: center;
  margin-top: 200rpx;
  color: #999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
.load-more-status {
  text-align: center;
  color: #999;
  padding: 20rpx 0;
  font-size: 24rpx;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>