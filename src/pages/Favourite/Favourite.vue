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
      <uni-load-more :status="loadMoreStatus"></uni-load-more>
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
import apiConfig from '@/utils/api.js';

export default {
  name: 'Favourite',
  data() {
    return {
      images: [],
      isLoading: false,
      page: 1,
      pageSize: 12,
      hasMore: true
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
  onLoad() {
    this.getFavorites(true);
  },
  onShow() {
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
    getFavorites(isRefresh = false) {
      if (this.isLoading) return;
      this.isLoading = true;
      if (isRefresh) {
        this.page = 1;
        this.images = [];
        this.hasMore = true;
      }
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        this.isLoading = false;
        uni.stopPullDownRefresh();
        return;
      }
      const requestUrl = `${apiConfig.BASE_URL}/collection/getAll?page=${this.page}&pageSize=${this.pageSize}`;
      uni.request({
        url: requestUrl,
        method: 'GET',
        header: { 'Authorization': `Bearer ${token}` },
        success: (res) => {
          if (res.data && res.data.code === 0 && res.data.data) {
            const newImages = res.data.data.map(item => ({
              id: item.imageId,
              img: item.imageUrl
            }));
            this.images = isRefresh ? newImages : [...this.images, ...newImages];
            if (newImages.length < this.pageSize) {
              this.hasMore = false;
            } else {
              this.page++;
            }
          } else {
            this.hasMore = false;
          }
        },
        fail: (err) => {
          uni.showToast({ title: '网络请求失败', icon: 'none' });
          this.hasMore = false;
        },
        complete: () => {
          this.isLoading = false;
          uni.stopPullDownRefresh();
        }
      });
    },
    // 5. 新增：处理长按事件，弹出确认框
    handleLongPress(item) {
      uni.showModal({
        title: '删除确认',
        content: `确定要删除这张收藏吗？`,
        success: (res) => {
          if (res.confirm) {
            this.deleteFavorite(item.id);
          }
        }
      });
    },
    // 6. 新增：调用删除API的方法
    deleteFavorite(imageId) {
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        return;
      }

      uni.showLoading({ title: '正在删除...' });

      // 根据API文档，使用DELETE方法，并将imageId作为Path参数
      const requestUrl = `${apiConfig.BASE_URL}/collection/delete/${imageId}`;

      uni.request({
        url: requestUrl,
        method: 'DELETE',
        header: { 'Authorization': `Bearer ${token}` },
        success: (res) => {
          if (res.data && res.data.code === 0) {
            uni.showToast({ title: '删除成功', icon: 'success' });
            // 从当前列表中移除已删除的图片，实现UI无刷新更新
            this.images = this.images.filter(img => img.id !== imageId);
          } else {
            uni.showToast({ title: (res.data && res.data.message) || '删除失败', icon: 'none' });
          }
        },
        fail: (err) => {
          uni.showToast({ title: '网络请求失败', icon: 'none' });
          console.error('Delete favorite failed:', err);
        },
        complete: () => {
          uni.hideLoading();
        }
      });
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
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>