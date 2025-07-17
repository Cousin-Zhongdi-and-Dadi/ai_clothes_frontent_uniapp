<template>
  <view class="closet-page">
    <!-- 加载动画 -->
    <view
      v-if="isInitialLoading"
      class="loading-overlay"
    >
      <uni-load-more status="loading"></uni-load-more>
    </view>

    <!-- 主内容 -->
    <view
      class="main-content"
      v-else
    >
      <!-- 左侧分类栏 -->
      <view class="sidebar">
        <view
          v-for="category in categories"
          :key="category.id"
          class="sidebar-item"
          :class="{ active: activeCategory === category.id }"
          @click="selectCategory(category.id)"
        >
          {{ category.name }}
        </view>
      </view>

      <!-- 右侧商品展示区 -->
      <view class="content-grid">
        <scroll-view
          scroll-y
          class="scroll-view-container"
          @scrolltolower="handleScrollToLower"
        >
          <view class="grid-container">
            <!-- 商品列表 -->
            <view
              v-for="item in closetItems"
              :key="item.id"
              class="goods-card"
              @click="handleSelect(item)"
            >
              <image
                :src="item.image"
                class="goods-image"
                mode="aspectFill"
              />
              <text class="goods-name">{{ item.name }}</text>
              <text class="goods-desc">{{ item.desc }}</text>
            </view>
          </view>

          <!-- 空状态提示 -->
          <view
            class="empty-state"
            v-if="!isLoading && closetItems.length === 0"
          >
            <text class="empty-text">这个分类下还没有衣服哦</text>
          </view>

          <!-- 列表底部的加载状态 -->
          <view
            class="load-more-status"
            v-if="closetItems.length > 0"
          >
            <text v-if="loadMoreStatus === 'loading'">正在加载...</text>
            <text v-if="loadMoreStatus === 'noMore'">没有更多了</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 选择确认弹窗，样式与ResourcesSelection.vue一致 -->
    <view
      v-if="showConfirmModal"
      class="popup-overlay"
      @click.self="closeModal"
    >
      <view class="popup-content">
        <image
          v-if="selectedItem"
          :src="selectedItem.image"
          class="popup-img"
          mode="aspectFit"
        />
        <view class="popup-buttons">
          <button
            class="popup-btn retry"
            @click="closeModal"
          >重新选择</button>
          <button
            class="popup-btn confirm"
            @click="confirmSelect"
          >确认选择</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import request from '@/utils/request.js';
import apiConfig from '@/utils/api.js';

export default {
  name: 'ClosetSelection',
  data() {
    return {
      categories: [],
      activeCategory: null,
      closetItems: [],
      page: 1,
      pageSize: 10,
      isLoading: false,
      hasMore: true,
      isInitialLoading: true,
      showConfirmModal: false,
      selectedItem: null,
      isGuest: false
    };
  },
  computed: {
    loadMoreStatus() {
      if (this.isLoading) return 'loading';
      if (!this.hasMore) return 'noMore';
      return 'more';
    }
  },
  onLoad() {
    const token = uni.getStorageSync('token');
    this.isGuest = !token;
    this.initData();
  },
  methods: {
    getMockCategories() {
      return [
        { id: 1, name: '上衣' },
        { id: 2, name: '裤子' }
      ];
    },
    getMockClosetItems(categoryId) {
      if (categoryId === 1) {
        return [
          { id: 101, image: '/static/example_pictures/sample1.jpg', name: '静态上衣1', desc: '游客模式样例' },
          { id: 102, image: '/static/example_pictures/sample2.jpg', name: '静态上衣2', desc: '游客模式样例' }
        ];
      } else if (categoryId === 2) {
        return [
          { id: 201, image: '/static/example_pictures/sample3.jpg', name: '静态裤子1', desc: '游客模式样例' }
        ];
      }
      return [];
    },
    async initData() {
      this.isInitialLoading = true;
      if (this.isGuest) {
        this.categories = this.getMockCategories();
        this.activeCategory = this.categories[0].id;
        this.closetItems = this.getMockClosetItems(this.activeCategory);
        this.isInitialLoading = false;
        return;
      }
      try {
        await this.getCategories();
        if (this.categories.length > 0 && this.activeCategory === null) {
          this.activeCategory = this.categories[0].id;
          await this.getClosetItems(true);
        }
      } catch (error) {
        console.error("Initialization failed:", error);
      } finally {
        this.isInitialLoading = false;
      }
    },
    async getCategories() {
      if (this.isGuest) {
        console.error("Initialization failed:", error);
      }
        this.isInitialLoading = false;
    },
    async getCategories() {
      if (this.isGuest) {
        this.categories = this.getMockCategories();
        return;
      }
      try {
        const data = await request({
          url: `${apiConfig.BASE_URL}/address/getCategory`,
          method: 'GET',
        });
        this.categories = data
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(item => ({ id: item.id, name: item.categoryName }));
      } catch (error) {
        console.error("getCategories failed:", error);
      }
    },
    async getClosetItems(isRefresh = false) {
      if (this.isGuest) {
        this.closetItems = this.getMockClosetItems(this.activeCategory);
        this.hasMore = false;
        this.isLoading = false;
        return;
      }
      if (this.activeCategory === null || this.isLoading) return;
      this.isLoading = true;

      if (isRefresh) {
        this.page = 1;
        this.closetItems = [];
        this.hasMore = true;
      }

      try {
        const data = await request({
          url: `${apiConfig.BASE_URL}/address/getClothes/${this.activeCategory}`,
          method: 'GET',
          data: {
            page: this.page,
            pageSize: this.pageSize
          }
        });
        const newItems = data.map(item => ({
          id: item.id,
          image: item.imageUrl,
          name: item.brand || `服装ID: ${item.id}`,
          desc: item.color || `分类ID: ${item.categoryId}`
        }));

        this.closetItems = isRefresh ? newItems : [...this.closetItems, ...newItems];
        this.hasMore = newItems.length >= this.pageSize;
        if (this.hasMore) {
          this.page++;
        }
      } catch (error) {
        console.error("getClosetItems failed:", error);
        this.hasMore = false;
      } finally {
        this.isLoading = false;
      }
    },
    selectCategory(id) {
      if (this.activeCategory === id) return;
      this.activeCategory = id;
      this.getClosetItems(true);
    },
    handleScrollToLower() {
      if (!this.isLoading && this.hasMore) {
        this.getClosetItems();
      }
    },
    handleSelect(item) {
      this.selectedItem = item;
      this.showConfirmModal = true;
    },
    closeModal() {
      this.showConfirmModal = false;
      this.selectedItem = null;
    },
    confirmSelect() {
      if (!this.selectedItem) return;
      // 只处理AiMatch.vue跳转的情况
      uni.$emit && uni.$emit('ai-match-image-selected', this.selectedItem.image);
      uni.navigateBack();
    }
  }
};
</script>

<style scoped>
/* 复用Closet.vue样式，去除上传相关部分 */
.closet-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.sidebar {
  flex: 1;
  width: 40%;
  background-color: #f8f8f8;
  padding-top: 20rpx;
  overflow-y: auto;
}
.sidebar-item {
  padding: 25rpx 20rpx;
  font-size: 28rpx;
  text-align: center;
  color: #666;
}
.sidebar-item.active {
  background-color: #fff;
  color: #6c5ce7;
  font-weight: bold;
}
.content-grid {
  flex: 1;
  height: 100%;
}
.scroll-view-container {
  height: 100%;
  padding: 20rpx;
  box-sizing: border-box;
}
.grid-container {
  width: 80%;
  display: grid;
  grid-template-columns: repeat(2, 280rpx);
  gap: 20rpx;
  box-sizing: border-box;
  padding-bottom: 20rpx;
}
.goods-card {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.goods-image {
  width: 100%;
  height: 240rpx;
  border-radius: 16rpx;
  background-color: #eee;
}
.goods-name {
  font-size: 26rpx;
  color: #333;
  margin-top: 10rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
.goods-desc {
  font-size: 22rpx;
  color: #999;
  margin-top: 5rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
.empty-state {
  text-align: center;
  color: #999;
  padding: 40rpx 0;
}
.empty-text {
  font-size: 28rpx;
}
.load-more-status {
  text-align: center;
  color: #999;
  padding: 20rpx 0;
  font-size: 24rpx;
  width: 100%;
}
/* 替换弹窗样式为与ResourcesSelection.vue一致 */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.popup-content {
  width: 80%;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.popup-img {
  width: 100%;
  height: 600rpx;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
}
.popup-buttons {
  display: flex;
  width: 100%;
  border-top: 1px solid #f0f0f0;
  padding-top: 20rpx;
}
.popup-btn {
  flex: 1;
  background: none;
  border: none;
  font-size: 30rpx;
  padding: 10rpx 0;
  margin: 0;
  line-height: 1.5;
}
.popup-btn::after {
  border: none;
}
.retry {
  color: #888;
  border-right: 1px solid #f0f0f0;
}
.confirm {
  color: #6c5ce7;
  font-weight: bold;
}
</style>