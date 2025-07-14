<template>
  <view class="container">
    <!-- Tabs: Dynamically rendered from API -->
    <view class="tabs">
      <view
        v-for="tab in tabs"
        :key="tab.id"
        class="tab"
        :class="{ active: activeTabId === tab.id }"
        @click="changeTab(tab)"
      >
        {{ tab.categoryName }}
      </view>
    </view>

    <!-- Loading Indicator -->
    <view
      v-if="isLoading"
      class="loading-container"
    >
      <text>加载中...</text>
    </view>

    <!-- Grid List: Dynamically rendered -->
    <view
      v-else
      class="grid"
    >
      <view
        v-if="itemList.length === 0"
        class="empty-state"
      >
        <text>该分类下暂无素材</text>
      </view>
      <template v-else>
        <view
          class="grid-item"
          v-for="item in itemList"
          :key="item.id"
          @click="showPopup(item)"
        >
          <image
            :src="item.img"
            class="item-img"
            mode="aspectFill"
          />
          <view class="item-title">{{ item.title }}</view>
          <view class="item-desc">{{ item.desc }}</view>
        </view>
      </template>
    </view>

    <!-- Confirmation Popup (template is unchanged) -->
    <view
      class="popup-overlay"
      v-if="isPopupVisible"
    >
      <view class="popup-content">
        <image
          v-if="selectedItem"
          :src="selectedItem.img"
          class="popup-img"
          mode="aspectFit"
        />
        <view class="popup-buttons">
          <button
            class="popup-btn retry"
            @click="closePopup"
          >重新选择</button>
          <button
            class="popup-btn confirm"
            @click="confirmSelection"
          >确认选择</button>
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
      pageType: 'top', // 'top' or 'bottom', determines navigation on confirm
      // --- 开始修改 ---
      source: '', // 新增：记录页面来源，例如 'closet'
      // --- 结束修改 ---
      tabs: [], // To store categories from API
      activeTabId: null, // ID of the active category
      itemList: [], // Items for the currently active tab
      itemsCache: {}, // Cache for fetched items to prevent re-fetching
      
      isLoading: false,
      isPopupVisible: false,
      selectedItem: null,
    };
  },
  onLoad(options) {
    // Preserve the page's purpose (selecting a top or bottom)
    if (options.type === 'bottom') {
      this.pageType = 'bottom';
    } else {
      this.pageType = 'top';
    }
    // --- 开始修改 ---
    // 新增：记录来源
    if (options.source) {
      this.source = options.source;
    }
    // --- 结束修改 ---
    // Fetch categories to build the tabs
    this.fetchCategories();
  },
  methods: {
    // Fetch categories from the API to build the tabs
    async fetchCategories() {
      this.isLoading = true;
      try {
        const data = await request({
          url: `${apiConfig.BASE_URL}/mall/getCategory`, // 获取分类列表
          method: 'GET',
        });
        // Sort categories by sortOrder if available
        const categories = data.sort((a, b) => a.sortOrder - b.sortOrder);
        // 新增推荐tab，id为null
        this.tabs = [{ categoryName: '推荐', id: null }, ...categories];
        // 默认激活第一个tab
        if (this.tabs.length > 0) {
          this.activeTabId = this.tabs[0].id;
          this.fetchItemsForCurrentTab();
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    // Handle tab switching
    changeTab(tab) {
      if (this.activeTabId === tab.id) return;
      this.activeTabId = tab.id;
      this.fetchItemsForCurrentTab();
    },

    // Fetch items for the currently active tab
    async fetchItemsForCurrentTab() {
      // 推荐tab（id为null）
      if (this.activeTabId === null) {
        // Use cache if available
        if (this.itemsCache['recommend']) {
          this.itemList = this.itemsCache['recommend'];
          return;
        }
        this.isLoading = true;
        this.itemList = [];
        try {
          const res = await request({
            url: `${apiConfig.BASE_URL}/mall/getRecommended`,
            method: 'GET',
            data: {
              page: 1,
              pageSize: 20
            }
          });
          const goodsList = Array.isArray(res) ? res : [];
          const mappedData = goodsList.map(item => ({
            id: item.id,
            title: item.productName,
            desc: item.description,
            img: item.imageGif,
            ...item
          }));
          this.itemList = mappedData;
          this.$set(this.itemsCache, 'recommend', mappedData);
        } catch (error) {
          console.error('Failed to fetch recommended items:', error);
        } finally {
          this.isLoading = false;
        }
        return;
      }

      // 其他分类tab
      if (!this.activeTabId) return;
      if (this.itemsCache[this.activeTabId]) {
        this.itemList = this.itemsCache[this.activeTabId];
        return;
      }
      this.isLoading = true;
      this.itemList = [];
      try {
        const res = await request({
          url: `${apiConfig.BASE_URL}/mall/getProductByTypeId/${this.activeTabId}`,
          method: 'GET',
          data: {
            page: 1,
            pageSize: 20
          }
        });
        const goodsList = Array.isArray(res) ? res : [];
        const mappedData = goodsList.map(item => ({
          id: item.id,
          title: item.productName,
          desc: item.description,
          img: item.imageGif,
          ...item
        }));
        this.itemList = mappedData;
        this.$set(this.itemsCache, this.activeTabId, mappedData);
      } catch (error) {
        console.error(`Failed to fetch items for category ${this.activeTabId}:`, error);
      } finally {
        this.isLoading = false;
      }
    },
    
    // Show the confirmation popup
    showPopup(item) {
      this.selectedItem = item;
      this.isPopupVisible = true;
    },
    
    // Close the confirmation popup
    closePopup() {
      this.isPopupVisible = false;
      this.selectedItem = null;
    },
    
    async confirmSelection() {
      if (!this.selectedItem) return;

      // 检查来源，如果是从衣橱页来的，则调用/address/addFromMall
      if (this.source === 'closet') {
        uni.showLoading({ title: '正在添加...' });
        try {
          await request({
            url: `${apiConfig.BASE_URL}/address/addFromMall`,
            method: 'GET',
            data: {
              categoryId: this.activeTabId, // 当前选中分类id
              imageUrl: this.selectedItem.img // 当前选中商品图片url
            }
          });
          uni.showToast({ title: '添加成功！', icon: 'success' });

          // 刷新衣橱页并返回
          const pages = getCurrentPages();
          const closetPage = pages[pages.length - 2]; // 获取上一个页面（衣橱页）
          if (closetPage && typeof closetPage.initData === 'function') {
            closetPage.initData(); // 调用衣橱页的刷新方法
          }
          this.closePopup();
          uni.navigateBack(); // 返回衣橱页
        } catch (error) {
          console.error('添加到衣橱失败:', error);
          // 错误提示已由 request.js 统一处理
        } finally {
          uni.hideLoading();
        }
      } else {
        // 如果来源不是衣橱（例如来自2D试衣），则执行原有的跳转到ConfirmCloth页的逻辑
        const imageUrl = this.selectedItem.img;
        const url = `/pages/ConfirmCloth/ConfirmCloth?imageUrl=${encodeURIComponent(imageUrl)}&type=${this.pageType}`;
        uni.navigateTo({ url });
        this.closePopup();
      }
    }
  }
};
</script>

<style scoped>
/* Adding styles for loading and empty states */
.loading-container,
.empty-state {
  width: 100%;
  padding: 100rpx 0;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

/* Other styles are preserved from the original file */
.container {
  background: #fff;
  min-height: 100vh;
  padding: 0 16rpx 16rpx 16rpx;
  box-sizing: border-box;
}
.tabs {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 24rpx;
  margin-top: 16rpx;
  /* For scrollable tabs if there are many */
  overflow-x: auto;
  white-space: nowrap;
}
.tab {
  display: inline-block;
  text-align: center;
  padding: 20rpx 30rpx; /* Added horizontal padding */
  font-size: 30rpx;
  color: #888;
  position: relative;
  flex-shrink: 0; /* Prevent tabs from shrinking */
}
.tab.active {
  color: #333;
  font-weight: bold;
}
.tab.active::after {
  content: "";
  display: block;
  width: 60rpx;
  height: 4rpx;
  background: #333;
  border-radius: 2rpx;
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
}
.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx 0;
}
.grid-item {
  width: 48%;
  margin-right: 4%;
  margin-bottom: 24rpx;
  background: #fafafa;
  border-radius: 16rpx;
  overflow: hidden;
  box-sizing: border-box;
  padding-bottom: 16rpx;
}
.grid-item:nth-child(2n) {
  margin-right: 0;
}
.item-img {
  width: 100%;
  height: 240rpx;
  object-fit: cover;
  background: #eee;
  display: block;
}
.item-title {
  font-size: 26rpx;
  color: #222;
  margin: 16rpx 12rpx 4rpx 12rpx;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-desc {
  font-size: 22rpx;
  color: #888;
  margin: 0 12rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Popup styles are preserved */
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