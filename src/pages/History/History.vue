<template>
  <view
    class="history-page"
    :class="{ 'is-managing': isManaging }"
  >
    <!-- 1. 加载状态 -->
    <view
      v-if="isLoading && page === 1"
      class="status-view"
    >
      <view class="loading-animation"></view>
      <text>正在加载浏览记录...</text>
    </view>

    <!-- 2. 历史记录列表 -->
    <view v-else-if="Object.keys(groupedHistory).length > 0">
      <view
        v-for="(group, date) in groupedHistory"
        :key="date"
        class="date-group"
      >
        <view class="date-title">{{ date }}</view>
        <view
          v-for="(row, rowIndex) in group.rows"
          :key="rowIndex"
          class="image-row"
        >
          <view
            v-for="item in row"
            :key="item.id"
            class="image-cell"
            @click="handleItemClick(item)"
            @longpress="enableSelectionMode(item)"
          >
            <image
              :src="item.imageGif"
              mode="aspectFill"
              class="history-image"
            />
            <!-- 管理模式下的勾选框 -->
            <view
              v-if="isManaging"
              class="selection-overlay"
            >
              <view
                class="checkbox"
                :class="{ checked: selectedIds.includes(item.id) }"
              ></view>
            </view>
          </view>
        </view>
      </view>
      <!-- 列表底部的加载状态 (已替换) -->
      <view class="load-more-status">
        <text v-if="loadMoreStatus === 'loading'">正在加载...</text>
        <text v-else-if="loadMoreStatus === 'noMore'">没有更多了</text>
      </view>
    </view>

    <!-- 3. 空状态 -->
    <view
      v-else
      class="status-view"
    >
      <text>你还没有任何浏览记录哦</text>
    </view>

    <!-- 2. 新增：底部的操作栏 -->
    <view
      v-if="isManaging"
      class="footer-actions"
    >
      <button
        class="cancel-button"
        @click="cancelSelectionMode"
      >
        取消
      </button>
      <button
        class="delete-button"
        :disabled="selectedIds.length === 0"
        @click="confirmDelete"
      >
        删除 ({{ selectedIds.length }})
      </button>
    </view>
  </view>
</template>

<script>
// 1. 导入封装的 request 函数和 apiConfig
import request from '@/utils/request.js';
import apiConfig from '@/utils/api.js';

export default {
  name: 'History',
  data() {
    return {
      historyItems: [],
      page: 1,
      pageSize: 15,
      isLoading: false,
      hasMore: true,
      isManaging: false, // 是否处于选择模式
      selectedIds: [],   // 选中的ID列表
      isGuest: false // 新增：是否为游客模式
    };
  },
  computed: {
    groupedHistory() {
      const groups = {};
      this.historyItems.forEach(item => {
        const date = new Date(item.createTime).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
        if (!groups[date]) {
          groups[date] = { items: [] };
        }
        groups[date].items.push(item);
      });
      for (const date in groups) {
        const items = groups[date].items;
        const rows = [];
        for (let i = 0; i < items.length; i += 3) {
          rows.push(items.slice(i, i + 3));
        }
        groups[date].rows = rows;
      }
      return groups;
    },
    loadMoreStatus() {
      if (this.isLoading && this.page > 1) { return 'loading'; }
      if (!this.hasMore) { return 'noMore'; }
      return 'more';
    },
  },
  onShow() {
    const token = uni.getStorageSync('token');
    this.isGuest = !token;
    this.getHistory(true);
  },
  onPullDownRefresh() {
    this.getHistory(true);
  },
  onReachBottom() {
    if (!this.isLoading && this.hasMore) {
      this.getHistory();
    }
  },
  methods: {
    // 游客模式静态历史数据
    getMockHistory() {
      return [
        {
          id: 1,
          imageGif: '/static/example_pictures/sample1.png',
          createTime: '2025-07-12T10:00:00Z'
        },
        {
          id: 2,
          imageGif: '/static/example_pictures/sample2.png',
          createTime: '2025-07-12T11:00:00Z'
        }
      ];
    },
    // 2. 改造 getHistory 方法
    async getHistory(isRefresh = false) {
      if (this.isGuest) {
        this.isLoading = false;
        this.historyItems = this.getMockHistory();
        this.hasMore = false;
        return;
      }
      if (this.isLoading) return;
      this.isLoading = true;
      if (isRefresh) {
        this.page = 1;
        this.historyItems = [];
        this.hasMore = true;
        this.cancelSelectionMode(); // 刷新时确保退出选择模式
      }

      try {
        const newItems = await request({
          url: `${apiConfig.BASE_URL}/BrowsingHistory/getHistory`,
          method: 'GET',
          data: {
            page: this.page,
            pageSize: this.pageSize
          }
        });
        
        this.historyItems = isRefresh ? newItems : [...this.historyItems, ...newItems];
        this.hasMore = newItems.length === this.pageSize;
        if (this.hasMore) {
          this.page++;
        }
      } catch (error) {
        console.error("getHistory failed:", error);
        this.hasMore = false;
      } finally {
        this.isLoading = false;
        uni.stopPullDownRefresh();
      }
    },

    // 3. 改造 deleteHistoryItems 方法
    async deleteHistoryItems() {
      if (this.isGuest) {
        uni.showToast({ title: '请登录后删除', icon: 'none' });
        return;
      }
      uni.showLoading({ title: '正在删除...' });
      try {
        await request({
          url: `${apiConfig.BASE_URL}/BrowsingHistory/delete`,
          method: 'DELETE',
          data: this.selectedIds,
        });
        uni.showToast({ title: '删除成功', icon: 'success' });
        // 从UI上直接移除，无需刷新
        this.historyItems = this.historyItems.filter(
          item => !this.selectedIds.includes(item.id)
        );
        this.cancelSelectionMode();
      } catch (error) {
        console.error("deleteHistoryItems failed:", error);
        // 错误提示已由 request 函数统一处理
      } finally {
        uni.hideLoading();
      }
    },

    // 4. 改造 confirmDelete 方法，使用 async/await
    async confirmDelete() {
      if (this.selectedIds.length === 0) return;
      try {
        const res = await uni.showModal({
          title: '删除确认',
          content: `确定要删除这 ${this.selectedIds.length} 条记录吗？`,
        });
        if (res.confirm) {
          this.deleteHistoryItems();
        }
      } catch (error) {
        // 用户点击取消等操作会进入这里，无需处理
      }
    },

    // 新增：长按启用选择模式
    enableSelectionMode(item) {
      this.isManaging = true;
      // 自动选中长按的项
      if (!this.selectedIds.includes(item.id)) {
        this.selectedIds.push(item.id);
      }
    },
    // 新增：取消选择模式
    cancelSelectionMode() {
      this.isManaging = false;
      this.selectedIds = [];
    },
    // 修改：处理点击事件
    handleItemClick(item) {
      // 只有在选择模式下，点击才有效
      if (!this.isManaging) return;
      
      const index = this.selectedIds.indexOf(item.id);
      if (index > -1) {
        this.selectedIds.splice(index, 1); // 如果已选中，则取消选中
      } else {
        this.selectedIds.push(item.id); // 如果未选中，则选中
      }
    },
  }
};
</script>

<style scoped>
.history-page {
  padding: 0 16rpx;
  background: #fafbfc;
  min-height: 100vh;

  padding-bottom: 120rpx;
}
.is-managing {
  background: #f0f4f8;
}
.date-group {
  margin-bottom: 32rpx;
}
.date-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin: 32rpx 0 16rpx 0;
}
.image-row {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 12rpx;
  margin-bottom: 16rpx;
}
.image-cell {
  width: calc((100% - 24rpx) / 3);
  aspect-ratio: 1 / 1;
  position: relative;
}
.history-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
  background: #eee;
  display: block;
}

.status-view {
  width: 100%;
  text-align: center;
  padding-top: 200rpx;
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

.selection-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(108, 99, 255, 0.1);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.checkbox {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid #6c63ff;
  border-radius: 4rpx;
  position: relative;
}
.checkbox.checked {
  background: #6c63ff;
}
.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 32rpx;
  border-top: 1rpx solid #e0e0e0;
  background: #fff;
  box-sizing: border-box;
  padding-bottom: calc(16rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
}
.delete-button {
  flex: 1;
  margin-left: 24rpx;
  background: #ff4d4f;
  color: #fff;
  border: none;
  border-radius: 40rpx;
  font-size: 28rpx;
  height: 80rpx;
  line-height: 80rpx;
}
.delete-button:disabled {
  background: #f5f5f5;
  color: #ccc;
}
.cancel-button {
  flex: 1;
  background: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 40rpx;
  font-size: 28rpx;
  height: 80rpx;
  line-height: 80rpx;
}

.load-more-status {
  width: 100%;
  text-align: center;
  padding: 20rpx 0;
  color: #999;
  font-size: 24rpx;
}
</style>