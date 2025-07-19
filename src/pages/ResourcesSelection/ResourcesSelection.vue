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
      pageType: 'top', // 'top' or 'bottom'
      source: '',
      tabs: [],
      activeTabId: null,
      itemList: [],
      itemsCache: {},
      isLoading: false,
      isPopupVisible: false,
      selectedItem: null,
      parentId: null // 新增：用于记录父分类id
    };
  },
  onLoad(options) {
    // 判断是选择上装还是下装
    if (options.type === 'bottom') {
      this.pageType = 'bottom';
      this.parentId = 24; // 下装
    } else {
      this.pageType = 'top';
      this.parentId = 23; // 上装
    }
    // 识别来源
    if (options.source) {
      this.source = options.source;
    }
    // 只获取对应父分类的子类tab
    this.fetchSubCategories();
  },
  methods: {
    // 获取上下装子类tab
    async fetchSubCategories() {
      this.isLoading = true;
      try {
        const data = await request({
          url: `${apiConfig.BASE_URL}/mall/getSubCategory`,
          method: 'GET',
          data: {
            parentId: this.parentId
          }
        });
        // data为数组，按sortOrder排序
        const categories = Array.isArray(data) ? data.sort((a, b) => a.sortOrder - b.sortOrder) : [];
        this.tabs = categories;
        // 默认激活第一个tab
        if (this.tabs.length > 0) {
          this.activeTabId = this.tabs[0].id;
          this.fetchItemsForCurrentTab();
        }
      } catch (error) {
        console.error('Failed to fetch sub categories:', error);
      } finally {
        this.isLoading = false;
      }
    },

    // 切换tab
    changeTab(tab) {
      if (this.activeTabId === tab.id) return;
      this.activeTabId = tab.id;
      this.fetchItemsForCurrentTab();
    },

    // 获取当前tab下的商品
    async fetchItemsForCurrentTab() {
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

      // === 新增：从AiMatch跳转时，选择后返回图片url ===
      if (this.source === 'AiMatch') {
        // 通过事件通道返回图片url
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        if (prevPage) {
          // 兼容uni-app写法
          uni.$emit && uni.$emit('ai-match-image-selected', this.selectedItem.img);
        }
        uni.navigateBack();
        return;
      }
      // === 原有逻辑 ===
      if (this.source === 'closet') {
        uni.showLoading({ title: '正在添加...' });
        try {
          await request({
            url: `${apiConfig.BASE_URL}/address/addFromMall`,
            method: 'GET',
            data: {
              categoryId: this.activeTabId,
              imageUrl: this.selectedItem.img
            }
          });
          uni.showToast({ title: '添加成功！', icon: 'success' });
          const pages = getCurrentPages();
          const closetPage = pages[pages.length - 2];
          if (closetPage && typeof closetPage.initData === 'function') {
            closetPage.initData();
          }
          this.closePopup();
          uni.navigateBack();
        } catch (error) {
          console.error('添加到衣橱失败:', error);
        } finally {
          uni.hideLoading();
        }
      } else {
        const imageUrl = this.selectedItem.img;
        const url = `/pages/ConfirmCloth/ConfirmCloth?imageUrl=${encodeURIComponent(imageUrl)}&type=${this.pageType}`;
        uni.navigateTo({ url });
        this.closePopup();
      }
    }
  },
  // 新增：监听页面返回，AiMatch.vue 需监听图片选择事件
  onUnload() {
    if (this.source === 'AiMatch') {
      uni.$off && uni.$off('ai-match-image-selected');
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