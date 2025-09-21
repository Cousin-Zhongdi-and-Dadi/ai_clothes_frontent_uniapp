<template>
  <view class="container">
    <!-- 副选单（与 Closet.vue 的 sub-list 保持一致） -->
    <view
      class="subcategory-tabs"
      v-if="tabs && tabs.length"
    >
      <scroll-view
        scroll-x
        class="sub-scroll"
        show-scrollbar="false"
      >
        <view class="sub-list">
          <view
            v-for="tab in tabs"
            :key="tab.id"
            class="sub-item"
            :class="{ active: activeTabId === tab.id }"
            @click="changeTab(tab)"
          >
            <text class="sub-name">{{ tab.categoryName }}</text>
            <image
              class="sub-underline"
              src="/static/icon/我的衣橱/Rectangle_20.png"
              mode="widthFix"
              :style="{ opacity: activeTabId === tab.id ? 1 : 0 }"
            />
          </view>
        </view>
      </scroll-view>
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

    <!-- Confirmation Popup with details view -->
    <view
      class="popup-overlay"
      v-if="isPopupVisible"
    >
      <view class="popup-card">
        <!-- decorative header background image -->
        <image
          src="/static/icon/试衣搭配/详情编辑.png"
          class="popup-header"
          mode="widthFix"
        />
        <!-- header overlay: title and optional star -->
        <view class="header-overlay">
          <!-- use block-level view so CSS multi-line clamp works reliably in the runtime -->
          <view
            v-if="!isDetailVisible"
            class="header-title"
            :style="{ fontSize: titleFontSize }"
          >{{ titleDisplay }}</view>
          <view
            v-else
            class="header-title"
          >详 情</view>
        </view>

        <!-- Main content area -->
        <view
          class="popup-body"
          v-if="!isDetailVisible"
        >
          <view class="popup-image-wrap">
            <image
              v-if="selectedItem"
              :src="selectedItem.img"
              class="popup-img"
              mode="aspectFit"
            />
            <button
              class="small-rechoose"
              @click="handleRechoose"
            >重选</button>
          </view>
          <view class="popup-meta">
            <text
              class="meta-left"
              @click="openDetails"
            >详情&gt;</text>
            <text class="meta-right">已穿{{ selectedItem && selectedItem.wearCount ? selectedItem.wearCount : 0 }}次</text>
          </view>
          <button
            class="confirm-btn"
            @click="confirmSelection"
          >确认选择</button>
        </view>

        <!-- Detail view -->
        <view
          class="popup-body detail"
          v-else
        >
          <view class="detail-list">
            <view class="detail-row"><text class="label">类型</text><text class="value">{{ selectedItem && selectedItem.categoryName ? selectedItem.categoryName : 'T恤' }}</text></view>
            <view class="detail-row"><text class="label">价格</text><text class="value">¥ {{ selectedItem && selectedItem.price ? selectedItem.price : 0 }}</text></view>
            <view class="detail-row"><text class="label">穿衣次数</text><text class="value">已穿{{ selectedItem && selectedItem.wearCount ? selectedItem.wearCount : 0 }}次</text></view>
            <view class="detail-row desc"><text class="label">描述</text><text class="value">{{ selectedItem && selectedItem.description ? selectedItem.description : '简要衣物文字描述' }}</text></view>
          </view>
          <view class="detail-actions">
            <text
              class="edit-link"
              @click="editItem"
            >编辑</text>
            <button
              class="confirm-btn"
              @click="confirmSelection"
            >确认选择</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import request from '@/utils/request.js';
import apiConfig from '@/utils/api.js';

/**
 * ResourcesSelection page
 * Allows users to select clothing/material resources from categories and confirm selection.
 */
export default {
  data() {
    return {
      pageType: 'top',
      source: '',
  isDetailVisible: false,
      tabs: [],
      activeTabId: null,
      itemList: [],
      itemsCache: {},
      isLoading: false,
      isPopupVisible: false,
      selectedItem: null,
      parentId: null
    };
  },
  onLoad(options) {
    if (options.type === 'bottom') {
      this.pageType = 'bottom';
      this.parentId = 24;
    } else {
      this.pageType = 'top';
      this.parentId = 23;
    }
    if (options.source) {
      this.source = options.source;
    }
    this.fetchSubCategories();
  },
  methods: {
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
        const categories = Array.isArray(data) ? data.sort((a, b) => a.sortOrder - b.sortOrder) : [];
        this.tabs = categories;
        if (this.tabs.length > 0) {
          this.activeTabId = this.tabs[0].id;
          this.fetchItemsForCurrentTab();
        }
      } catch (error) {
        // Fetch sub-categories for tabs
        console.error('Failed to fetch sub categories:', error);
      } finally {
        this.isLoading = false;
      }
    },

    changeTab(tab) {
      if (this.activeTabId === tab.id) return;
      this.activeTabId = tab.id;
      this.fetchItemsForCurrentTab();
    },

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

    showPopup(item) {
      this.selectedItem = item;
      this.isPopupVisible = true;
      this.isDetailVisible = false;
    },
    closePopup() {
      this.isPopupVisible = false;
      this.selectedItem = null;
      this.isDetailVisible = false;
    },
    openDetails() {
      this.isDetailVisible = true;
    },
    editItem() {
      // return to the image popup view so user can rechoose or confirm
      this.isDetailVisible = false;
    },
    handleRechoose() {
      // ensure popup is closed and selection cleared so user can re-pick
      this.closePopup();
    },
    async confirmSelection() {
      if (!this.selectedItem) return;
      if (this.source === 'AiMatch') {
        // 为 AiMatch 获取更可靠的图片链接：先查详情再回写
        uni.showLoading({ title: '获取图片中...' });
        let finalImage = this.selectedItem.img || '';
        try {
          if (this.selectedItem && this.selectedItem.id) {
            const detail = await request({
              url: `${apiConfig.BASE_URL}/mall/getProductDetail/${this.selectedItem.id}`,
              method: 'GET'
            });
            if (detail) {
              // 优先从 imageUrl 数组取第一张；其次 imageUrl 字段；再退回 imageGif；最后用列表图
              if (Array.isArray(detail.imageUrl) && detail.imageUrl.length) {
                finalImage = detail.imageUrl[0] || finalImage;
              } else if (typeof detail.imageUrl === 'string' && detail.imageUrl) {
                finalImage = detail.imageUrl;
              } else if (detail.imageGif) {
                finalImage = detail.imageGif;
              }
            }
          }
        } catch (err) {
          console.warn('获取商品详情失败，使用列表图片作为回退', err);
        } finally {
          uni.hideLoading();
        }

        // 写入缓存并通知 AiMatch 页面
        if (finalImage) {
          uni.setStorageSync('ai-match-image', finalImage);
          uni.$emit && uni.$emit('ai-match-image-selected', finalImage);
        }
        uni.navigateBack();
        return;
      }
      // Confirm resource selection and handle navigation/storage
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
        // 保存所选衣物的分类，供后续页面（TryOnContainer / TwoDimComment）展示
        try {
          // 优先从当前的子分类 tab（subcategory-tabs）读取分类名称，因为后端返回的商品对象不包含分类字段
          let cat = '';
          try {
            const activeTab = Array.isArray(this.tabs) ? this.tabs.find(t => t.id === this.activeTabId) : null;
            if (activeTab && (activeTab.categoryName || activeTab.name)) {
              cat = activeTab.categoryName || activeTab.name;
            }
          } catch (innerErr) {
            // ignore and fallback
          }
          // 回退：如果没有从 tab 获取到分类，则尝试从 selectedItem 中提取常见字段
          if (!cat && this.selectedItem) {
            cat = this.selectedItem.categoryName || this.selectedItem.category || this.selectedItem.parentName || this.selectedItem.typeName || '';
          }
          if (this.pageType === 'top') uni.setStorageSync('topGarmentCategory', cat);
          else if (this.pageType === 'bottom') uni.setStorageSync('bottomGarmentCategory', cat);
        } catch (e) {
          console.warn('保存分类失败', e);
        }
        const url = `/subpackages/confirm/ConfirmCloth/ConfirmCloth?imageUrl=${encodeURIComponent(imageUrl)}&type=${this.pageType}`;
        uni.navigateTo({ url });
        this.closePopup();
      }
    }
  },
  computed: {
    // 计算标题显示的字号（受最大/最小字号限制），以及最终要显示的文字（可能会截断）
    titleFontSize() {
      const title = (this.selectedItem && this.selectedItem.title) ? String(this.selectedItem.title) : '商品名称';
      // 容器宽度应与 CSS 中的 max-width 对齐（以 rpx 估算）
      // popup-card 宽度为 86% 屏幕，header-overlay 左右内边距设置为 left:48 right:48，
      // 因此可用宽度近似为 86% * screenWidth - 96rpx. 使用 500rpx 作为典型可用宽度。
      const containerWidth = 500;
      const baseFontSize = 48;
      const minFontSize = 24;
      const maxFontSize = 48;
      const avgCharWidthRatio = 0.65; // 提高估算，避免过多换行
      const maxLines = 2;

      const charWidth = minFontSize * avgCharWidthRatio;
      const maxChars = Math.floor(containerWidth / charWidth) * maxLines;
      if (!title || title.length === 0) return maxFontSize + 'rpx';
      if (title.length <= maxChars) {
        // 可以尝试用更大字号
        const scale = maxChars / title.length;
        let newSize = Math.round(maxFontSize * scale);
        newSize = Math.max(minFontSize, Math.min(maxFontSize, newSize));
        return newSize + 'rpx';
      } else {
        // 优先缩小到最小字号
        return minFontSize + 'rpx';
      }
        },
    titleDisplay() {
      const title = (this.selectedItem && this.selectedItem.title) ? String(this.selectedItem.title) : '商品名称';
      const containerWidth = 500;
      const minFontSize = 48;
      const avgCharWidthRatio = 0.65;
      const maxLines = 2;
      const charWidth = minFontSize * avgCharWidthRatio;
      const maxChars = Math.floor(containerWidth / charWidth) * maxLines;
      if (!title || title.length === 0) return '商品名称';
      // 优先显示两行，不截断，让 CSS 处理溢出
        return title;
      }
    },
    onUnload() {
    if (this.source === 'AiMatch') {
      uni.$off && uni.$off('ai-match-image-selected');
    }
  }
};
</script>

<style scoped>
.loading-container,
.empty-state {
  width: 100%;
  padding: 100rpx 0;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

.subcategory-tabs {
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  padding: 10rpx 8rpx;
  box-sizing: border-box;
  margin-bottom: 6rpx;
}
.sub-scroll {
  width: 100%;
}
.sub-list {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 18rpx;
  padding: 8rpx 12rpx;
}
.sub-item {
  position: relative; /* required so .sub-underline positions relative to each item */
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 140rpx;
  height: 64rpx;
  padding: 0 22rpx;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 32rpx;
  color: #333;
  cursor: pointer;
  white-space: nowrap; /* prevent characters wrapping into vertical stack */
  box-sizing: border-box;
}
.sub-item .sub-name {
  display: inline-block;
  font-size: 26rpx;
  color: #666;
  line-height: 1;
  white-space: nowrap;
  text-align: center;
}
.sub-item.active {
  background: #fff;
  box-shadow: 0 6rpx 14rpx rgba(0, 0, 0, 0.06);
}
.sub-item.active .sub-name {
  color: #222;
  font-weight: 700;
}
.sub-underline {
  position: absolute;
  bottom: -10rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 64rpx;
  height: auto;
  transition: opacity 180ms ease, transform 180ms ease;
  opacity: 0;
  pointer-events: none;
}
.sub-item.active .sub-underline {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

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

  overflow-x: auto;
  white-space: nowrap;
}
.shop-tabs {
  display: flex;
  flex-direction: row;
  background: #fff;
  padding: 0 20rpx;
  border-bottom: 1rpx solid #eee;
  overflow-x: auto;
  white-space: nowrap;
  height: 70rpx;
  align-items: center;

  scrollbar-width: none; /* Firefox 隐藏滚动条 */
  -ms-overflow-style: none; /* IE/Edge 隐藏滚动条 */
}
.shop-tabs::-webkit-scrollbar {
  display: none; /* Chrome/Safari/微信小程序等隐藏滚动条 */
}
.tab {
  display: inline-block;
  font-size: 28rpx;
  color: #999;
  margin-right: 32rpx;
  padding: 0 8rpx;
  line-height: 48rpx;
  height: 48rpx;
  white-space: nowrap;
  border-bottom: 4rpx solid transparent;
}
.tab.active {
  color: #6753e7;
  font-weight: bold;
  border-bottom: 4rpx solid #6753e7;
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
/* removed older generic popup styles to avoid conflicts with the new design below */

/* Popup card styles (new design) */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.popup-card {
  width: 86%;
  max-width: 760rpx;
  background: transparent;
  border-radius: 28rpx;
  overflow: visible;
  position: relative;
}
.popup-header {
  width: 100%;
  height: 180rpx;
  display: block;
  object-fit: cover;
  border-top-left-radius: 28rpx;
  border-top-right-radius: 28rpx;
  position: absolute;
  top: -600rpx;
  left: -22rpx;
}
.header-overlay {
  position: absolute;
  top: -390rpx;
  left: 48rpx; /* 微调：减小左内边距 */
  right: 48rpx; /* 缩小右侧空白，避免文字越过背景图 */
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end; /* 保持右侧对齐，但整体位置左移 */
  pointer-events: none;
  z-index: 3;
}
.header-title {
  font-size: 48rpx;
  color: #000; /* title color */
  font-weight: 800;
  z-index: 4;
  /* 限制宽度并可靠地实现两行折行与省略 */
  max-width: 400rpx; /* 更大可用宽度，右侧空出更小空间 */
  overflow: hidden;
  display: -webkit-box; /* 多行截断 */
  -webkit-line-clamp: 2; /* 限制为两行 */
  line-clamp: 2; /* 标准属性（兼容提示） */
  -webkit-box-orient: vertical;
  white-space: normal; /* 允许换行 */
  line-height: 1.2; /* 调整行高以节省垂直空间 */
  max-height: calc(1.2 * 2em); /* 强制两行最大高度 */
  word-break: break-word; /* 防止超长不可断字符溢出 */
  text-align: right; /* 右对齐文本，靠近装饰图右侧 */
}
.header-star {
  position: absolute;
  left: 18rpx;
  top: 12rpx;
  font-size: 36rpx;
  color: #6c5ce7;
  z-index: 4;
}
.popup-body {
  background: #fff;
  padding: 22rpx 20rpx;
  width: calc(100% - 72rpx);
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
  position: absolute;
  top: -250rpx;
  left: 50%;
  transform: translateX(-50%);
}
.popup-image-wrap {
  position: relative;
  width: 100%;
  height: 420rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  background: #fff;
  margin-bottom: 18rpx;
}
.popup-img {
  max-width: 86%;
  max-height: 86%;
}
.small-rechoose {
  position: absolute;
  right: 18rpx;
  top: 18rpx; /* place at bottom-right as requested */
  min-width: 120rpx;
  height: 66rpx;
  border-radius: 44rpx;
  background: rgba(108, 92, 231, 0.08);
  color: #6c5ce7;
  border: none;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16rpx;
  line-height: 1;
}
.popup-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14rpx;
}
.meta-left {
  color: #6c5ce7;
  font-size: 28rpx;
}
.meta-right {
  color: #999;
  font-size: 24rpx;
}
.confirm-btn {
  width: 100%;
  background: #000;
  color: #fff;
  padding: 20rpx 0;
  border-radius: 12rpx;
  font-size: 30rpx;
  margin-top: 20rpx;
  border: none;
}

/* Detail view */
.popup-body.detail {
  max-height: 600rpx;
  overflow: auto;
}
.detail-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12rpx;
}
.detail-title {
  font-size: 36rpx;
  color: #222;
  font-weight: 700;
}
.detail-list {
  padding: 10rpx 6rpx;
}
.detail-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap; /* prevent label/value from stacking vertically */
  padding: 20rpx 0;
  border-bottom: 1rpx dashed #eee;
}
/* description row should allow wrapping for long text */
.detail-row.desc .value {
  white-space: normal;
  text-align: left;
}
.label {
  color: #666;
  font-size: 32rpx;
  flex: 0 0 auto;
  margin-right: 12rpx;
  white-space: nowrap;
}
.value {
  color: #222;
  font-size: 32rpx;
  flex: 1 1 auto;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: underline wavy;
}
.detail-actions {
  display: block;
  width: 100%;
  margin-top: 16rpx;
}
.edit-link {
  display: block;
  text-align: right;
  color: #6c5ce7;
  font-size: 26rpx;
  margin-bottom: 12rpx;
}
.popup-close {
  position: absolute;
  right: 18rpx;
  top: 18rpx; /* place inside header area */
  width: 56rpx;
  height: 56rpx;
  border-radius: 28rpx;
  background: #fff;
  border: none;
  box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.12);
  z-index: 5; /* ensure the close button sits above header overlay */
}

/* ensure popup-card is centered on small screens */
@media (max-width: 420px) {
  .popup-card {
    width: 92%;
    margin-top: -8rpx;
  }
}
</style>