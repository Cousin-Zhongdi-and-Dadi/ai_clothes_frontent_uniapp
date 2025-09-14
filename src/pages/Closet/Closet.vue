<template>
  <view class="closet-page">
    <!-- 顶部头图区域 -->
    <view class="closet-header">
      <image
        class="header-bg"
        src="/static/icon/我的衣橱/头图.png"
        mode="widthFix"
      />
      <text class="header-title">我的衣橱</text>
      <text class="header-sub">My wardrobe</text>
    </view>

    <!-- 分类图标导航栏 -->
    <view class="category-tabs">
      <view
        v-for="category in categories"
        :key="category.id"
        class="category-tab"
        :class="{ active: activeCategory === category.id }"
        @click="selectCategory(category.id)"
      >
        <image
          class="category-icon"
          :src="category.icon"
          mode="aspectFit"
        />
        <text class="category-name">{{ category.name }}</text>
      </view>
    </view>

    <!-- 副选单：根据主选单变化显示 -->
    <view
      class="subcategory-tabs"
      v-if="subCategories[activeCategory] && subCategories[activeCategory].length"
    >
      <scroll-view
        scroll-x
        class="sub-scroll"
        show-scrollbar="false"
      >
        <view class="sub-list">
          <view
            v-for="sub in subCategories[activeCategory]"
            :key="sub.id"
            class="sub-item"
            :class="{ active: activeSubCategory === sub.id }"
            @click="selectSubCategory(sub.id)"
          >
            <text class="sub-name">{{ sub.name }}</text>
            <image
              class="sub-underline"
              src="/static/icon/我的衣橱/Rectangle_20.png"
              mode="widthFix"
              :style="{ opacity: activeSubCategory === sub.id ? 1 : 0 }"
            />
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 新增：初始加载动画 -->
    <view
      v-if="isInitialLoading"
      class="loading-overlay"
    >
      <uni-load-more status="loading"></uni-load-more>
    </view>

    <!-- 主内容，初始加载完成前隐藏 -->
    <view
      class="main-content"
      v-else
    >
      <view class="content-grid">
        <scroll-view
          scroll-y
          class="scroll-view-container"
          @scrolltolower="handleScrollToLower"
        >
          <!-- 商品列表使用网格布局 -->
          <view class="grid-container">
            <!-- 上传按钮 -->
            <!-- 上传按钮 已移至页面右下角悬浮按钮 -->
            <!-- 商品列表 -->
            <view
              v-for="item in closetItems"
              :key="item.id"
              class="goods-card"
              @longpress="handleLongPress(item)"
            >
              <!-- 使用占位容器保证方形比率，image 绝对填充容器 -->
              <view class="image-wrapper">
                <image
                  :src="item.image"
                  class="goods-image"
                  mode="widthFix"
                />
              </view>
              <text class="goods-name">{{ item.name }}</text>
              <text class="goods-desc">{{ item.desc }}</text>
            </view>
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

    <!-- 上传选项弹窗 -->
    <view
      v-if="showModal"
      class="modal-overlay"
      @click.self="closeModal"
    >
      <view class="modal-content">
        <view
          class="modal-close-btn"
          @click="closeModal"
        >×</view>
        <view class="modal-body">
          <button
            class="modal-btn"
            @click="uploadFromAlbum"
          >
            <image
              class="modal-btn-icon"
              src="/static/icon/补充icon0116-05.png"
              mode="aspectFit"
            />
            相册上传
          </button>
          <button
            class="modal-btn"
            @click="uploadFromCamera"
          >
            <image
              class="modal-btn-icon"
              src="/static/icon/补充icon0116-06.png"
              mode="aspectFit"
            />
            拍照上传
          </button>
          <button
            class="modal-btn"
            @click="selectFromLibrary"
          >
            <image
              class="modal-btn-icon"
              src="/static/icon/补充icon0116-07.png"
              mode="aspectFit"
            />
            总素材库选择
          </button>
        </view>
      </view>
    </view>

    <!-- 右下角悬浮上传按钮 -->
    <view
      class="floating-add"
      @click="handleAdd"
    >
      <view class="plus">+</view>
    </view>

  </view>
</template>

<script>
import request from '@/utils/request.js';
import apiConfig from '@/utils/api.js';

export default {
  name: 'Closet',
  data() {
    return {
      categories: [],
      activeCategory: null,
  // 副选单数据，按主分类 id 存数组
  subCategories: {},
  activeSubCategory: null,
      showModal: false,
      closetItems: [],
      page: 1,
      pageSize: 10,
      isLoading: false,
      hasMore: true,
      isInitialLoading: true,
      isGuest: false
    };
  },
  computed: {
    loadMoreStatus() {
      if (this.isLoading) {
        return 'loading';
      }
      if (!this.hasMore) {
        return 'noMore';
      }
      return 'more';
    }
  },
  onLoad() {
    const token = uni.getStorageSync('token');
    this.isGuest = !token;
    this.initData();
    uni.$on('closet-refresh', () => {
      this.getClosetItems(true);
    });
  },
  onUnload() {
    uni.$off('closet-refresh');
  },
  methods: {
    // mock 的副分类映射，实际项目会由后端提供 API
    getMockSubCategories(mainCategoryId) {
      const map = {
        1: [
          { id: 's1', name: '衬衫' },
          { id: 's2', name: 'T恤/Polo' },
          { id: 's3', name: '风衣' },
          { id: 's4', name: '连衣裙' },
          { id: 's5', name: '针织毛衫' },
          { id: 's6', name: '外套' }
        ],
        2: [
          { id: 'b1', name: '牛仔裤' },
          { id: 'b2', name: '休闲裤' },
          { id: 'b3', name: '短裤' }
        ],
        3: [
          { id: 'sh1', name: '运动鞋' },
          { id: 'sh2', name: '皮鞋' }
        ],
        4: [
          { id: 'o1', name: '配饰' },
          { id: 'o2', name: '其他' }
        ]
      };
      return map[mainCategoryId] || [];
    },

    // 获取副选单（占位）。后续请用真实 API 替换内部实现。
    async getSubCategories(mainCategoryId) {
      if (this.isGuest) {
        this.$set(this.subCategories, mainCategoryId, this.getMockSubCategories(mainCategoryId));
        const subs = this.subCategories[mainCategoryId];
        this.activeSubCategory = subs && subs.length ? subs[0].id : null;
        return;
      }
      try {
        // 占位 API path，后续由后端提供真实接口
        const data = await request({
          url: `${apiConfig.BASE_URL}/address/getSubCategory/${mainCategoryId}`,
          method: 'GET'
        });
        // 假设返回数组 [{id, name}, ...]
        this.$set(this.subCategories, mainCategoryId, data);
        const subs = this.subCategories[mainCategoryId];
        this.activeSubCategory = subs && subs.length ? subs[0].id : null;
      } catch (error) {
        console.error('getSubCategories failed:', error);
        // 失败时保持为空数组
        this.$set(this.subCategories, mainCategoryId, []);
        this.activeSubCategory = null;
      }
    },
    getMockCategories() {
      return [
        { id: 1, name: '上衣', icon: '/static/icon/我的衣橱/上衣.png' },
        { id: 2, name: '下装', icon: '/static/icon/我的衣橱/下装.png' },
        { id: 3, name: '裙子', icon: '/static/icon/我的衣橱/收藏.png' },
        { id: 4, name: '其他', icon: '/static/icon/我的衣橱/其他.png' }
      ];
    },
    getMockClosetItems(categoryId) {
      if (categoryId === 1) {
        return [
          { id: 101, image: '/static/example_pictures/sample1.jpg', name: '鸿星尔克潮流上衣', desc: '游客模式样例' },
          { id: 102, image: '/static/example_pictures/sample2.jpg', name: 'FORHUG街头上衣', desc: '游客模式样例' }
        ];
      } else if (categoryId === 2) {
        return [
          { id: 201, image: '/static/example_pictures/sample1.jpg', name: '阿迪达斯街头裤子', desc: '游客模式样例' }
        ];
      }
      return [];
    },
    async initData() {
      this.isInitialLoading = true;
      if (this.isGuest) {
        this.categories = this.getMockCategories();
        this.activeCategory = this.categories[0].id;
        // 预加载副选单（mock）
        await this.getSubCategories(this.activeCategory);
        this.closetItems = this.getMockClosetItems(this.activeCategory);
        this.isInitialLoading = false;
        return;
      }
      try {
        await this.getCategories();
        if (this.categories.length > 0 && this.activeCategory === null) {
          this.activeCategory = this.categories[0].id;
          // 预加载对应的副选单
          await this.getSubCategories(this.activeCategory);
          await this.getClosetItems(true);
        }
      } catch (error) {
        console.error('Initialization failed:', error);
      } finally {
        this.isInitialLoading = false;
      }
    },
    async getCategories() {
      if (this.isGuest) {
        this.categories = this.getMockCategories();
        return;
      }
      try {
        const data = await request({
          url: `${apiConfig.BASE_URL}/address/getCategory`,
          method: 'GET'
        });
        this.categories = data
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(item => ({ id: item.id, name: item.categoryName }));
      } catch (error) {
        console.error('getCategories failed:', error);
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
            pageSize: this.pageSize,
            // 预留 subCategory 参数给后端筛选
            subCategory: this.activeSubCategory
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
        console.error('getClosetItems failed:', error);
        this.hasMore = false;
      } finally {
        this.isLoading = false;
      }
    },
    async deleteClosetItem(clothesId) {
      uni.showLoading({ title: '正在删除...' });
      try {
        await request({
          url: `${apiConfig.BASE_URL}/closet/delete/${clothesId}`,
          method: 'DELETE'
        });
        uni.showToast({ title: '删除成功', icon: 'success' });
        this.closetItems = this.closetItems.filter(item => item.id !== clothesId);
      } catch (error) {
        console.error('deleteClosetItem failed:', error);
      } finally {
        uni.hideLoading();
      }
    },
    async handleUpload(sourceType) {
      this.closeModal();
      try {
        const [err, chooseRes] = await uni.chooseImage({
          count: 1,
          sourceType: sourceType
        });
        if (err) {
          console.error('uni.chooseImage failed:', err);
          if (err.errMsg.includes('cancel')) {
            // 用户取消
          } else {
            uni.showToast({ title: '选择图片失败', icon: 'none' });
          }
          return;
        }
        if (chooseRes && chooseRes.tempFilePaths && chooseRes.tempFilePaths.length > 0) {
          const tempFilePath = chooseRes.tempFilePaths[0];
          uni.navigateTo({
            url: `/subpackages/confirm/ConfirmFromUserUpload/ConfirmFromUserUpload?tempFilePath=${tempFilePath}`
          });
        } else {
          // 未选择图片
        }
      } catch (error) {
        console.error('An unexpected error occurred in handleUpload:', error);
      }
    },
    handleLongPress(item) {
      uni.showModal({
        title: '删除确认',
        content: `确定要删除这件衣服吗？`,
        success: (res) => {
          if (res.confirm) {
            this.deleteClosetItem(item.id);
          }
        }
      });
    },
    selectCategory(id) {
      if (this.activeCategory === id) return;
      this.activeCategory = id;
      // 切换主分类时加载对应副选单并重置子分类选择
      this.getSubCategories(id).then(() => {
        // 在副选单加载后刷新衣橱列表（后端可以根据 subCategory 返回不同结果）
        this.getClosetItems(true);
      });
    },

    selectSubCategory(subId) {
      if (this.activeSubCategory === subId) return;
      this.activeSubCategory = subId;
      // 根据副选单筛选衣橱
      this.getClosetItems(true);
    },
    handleScrollToLower() {
      if (!this.isLoading && this.hasMore) {
        this.getClosetItems();
      }
    },
    handleAdd() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    uploadFromAlbum() {
      this.handleUpload(['album']);
    },
    uploadFromCamera() {
      this.handleUpload(['camera']);
    },
    selectFromLibrary() {
      uni.navigateTo({
        url: '/subpackages/resources/ResourcesSelection/ResourcesSelection?source=closet'
      });
      this.closeModal();
    }
  }
};
</script>

<style scoped>
.closet-page {
  /* 不使用 100vh，避免包含状态栏/导航高度 */
  display: flex;
  flex-direction: column;
  background-color: #fff;
  min-height: 100%;
  position: relative; /* 使 header-title/header-sub 能相对于页面定位 */
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
  width: 100%;
  display: grid;
  /* 响应式两列：每列占可用宽度的一半，保证每行两个商品 */
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx;
  box-sizing: border-box;
  padding: 0 10rpx 20rpx 10rpx;
}
.goods-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  padding: 10rpx;
}
.add-card {
  display: flex;
  flex-direction: column;
  height: 400rpx;
  width: 100%;
  border: 2rpx dashed #dcdcdc;
  border-radius: 16rpx;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
}
.add-icon-plus {
  font-size: 100rpx;
  color: #dcdcdc;
  font-weight: lighter;
  line-height: 1;
}
.image-wrapper {
  width: 100%;
  height: auto; /* 由图片高度决定，按宽度自适应 */
  position: relative;
  border-radius: 12rpx;
  overflow: hidden;
  background-color: #eee; /* 占位背景色 */
}
.goods-image {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain; /* 按宽度适配，保留完整图片 */
  border-radius: 12rpx;
}
.sub-item {
  background: transparent;
  padding: 8rpx 14rpx;
  border-radius: 20rpx;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56rpx;
  line-height: 1;
  margin: 0;
  padding: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}
.sub-item .sub-name {
  font-size: 22rpx;
  color: #666;
  white-space: nowrap; /* 强制单行 */
  overflow: hidden; /* 溢出隐藏 */
  text-overflow: ellipsis; /* 超出显示省略号 */
  display: block;
  max-width: 100%;
}
.sub-item.active .sub-name {
  color: #222;
  font-weight: 700;
}
.sub-underline {
  position: absolute;
  bottom: -6rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 56rpx;
  height: auto;
  transition: opacity 180ms ease, transform 180ms ease;
  opacity: 0;
}
.sub-item.active .sub-underline {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background-color: white;
  padding: 60rpx 50rpx;
  border-radius: 24rpx;
  width: 550rpx;
  position: relative;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}
.modal-close-btn {
  position: absolute;
  top: 0;
  right: 30rpx;
  font-size: 50rpx;
  color: #999;
  font-weight: 300;
}
.modal-body {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}
.modal-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 90rpx;
  background-color: #6c5ce7;
  color: white;
  border-radius: 45rpx;
  font-size: 30rpx;
  font-weight: bold;
  border: none;
  padding: 0;
  margin: 0;
}
.modal-btn::after {
  border: none;
}
.modal-btn-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
}

.load-more-status {
  text-align: center;
  color: #999;
  padding: 20rpx 0;
  font-size: 24rpx;
  width: 100%;
}

.closet-header {
  width: 100%;
  /* 将底部内边距留出空间供选单覆盖 */
  margin-bottom: 0rpx;
  padding: 0 0 40rpx 0;
  position: relative;
  z-index: 1;
}
.header-bg {
  width: 100%;
  height: auto;
  display: block; /* 去掉 inline baseline 空隙 */
}

.category-tabs {
  display: flex;
  flex-direction: row;
  align-items: center;
  /* 背景使用透明，单独的 tab 会有颜色块用于识别 */
  background: transparent;
  padding: 10rpx 20rpx;
  /* 上移，使其部分覆盖头图 */
  margin-top: -100rpx;
  margin-bottom: 10rpx;
  overflow-x: auto;
  position: relative;
  z-index: 20; /* 确保在头图之上 */
  box-sizing: border-box;
  /* 微妙阴影以增强可读性和分层感 */
  box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.08);
}

/* 副选单样式 */
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
  gap: 14rpx;
  padding: 6rpx 10rpx;
}
.sub-item {
  background: rgba(0, 0, 0, 0.03);
  padding: 10rpx 20rpx; /* 左右内边距各加10rpx，总宽度增加20rpx */
  border-radius: 20rpx;
  color: #333;
  cursor: pointer;
  max-width: 140rpx;
  min-width: 140rpx;
  height: 50rpx;
  box-sizing: border-box;
  text-align: center;
}
.sub-item .sub-name {
  font-size: 22rpx;
  color: #666;
  white-space: nowrap; /* 强制单行 */
  overflow: hidden; /* 溢出隐藏 */
  text-overflow: ellipsis; /* 超出显示省略号 */
  display: block;
  max-width: 100%;
}
.sub-item.active {
  background: #fff;
  box-shadow: 0 6rpx 14rpx rgba(0, 0, 0, 0.06);
}
.sub-item.active .sub-name {
  color: #222;
  font-weight: 700;
}
.category-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  /* 固定为正方形，宽高一致 */
  width: 120rpx;
  height: 120rpx;
  padding: 12rpx 12rpx;
  border-radius: 28rpx; /* 圆角背景 */
  background: #6c5ce7; /* 未选中时紫色背景 */
  border: 6rpx solid rgba(255, 255, 255, 0.95); /* 白色边框 */
  cursor: pointer;
  /* 移除 min-width，使用固定尺寸保证正方形 */
  box-sizing: border-box;
  overflow: hidden; /* 保持卡片为正方形，缩放时内容随卡片一起缩放 */
  /* 让整体卡片支持缩放（包括背景和边框） */
  transition: transform 180ms ease, box-shadow 180ms ease;
  transform-origin: center center;
  transform: scale(1);
}
.category-tab:last-child {
  margin-right: 0;
}
.category-tab.active {
  background: #000; /* 选中时黑色背景 */
  /* 激活态微妙阴影，增加层级感 */
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.12);
  border: 6rpx solid rgba(255, 255, 255, 0.95);
  transform: scale(1.06); /* 放大整个卡片，包括背景和文字 */
}

/* 未选中时整体略微缩小，突出激活项 */
.category-tab:not(.active) {
  transform: scale(0.94);
}
.category-icon {
  width: 56rpx;
  height: 56rpx;
  margin-bottom: 8rpx;
  /* 保持图标固定大小，整体缩放交给 .category-tab 实现 */
  transition: opacity 180ms ease;
}
.category-name {
  font-size: 20rpx;
  color: #fff; /* 文字在有色背景上为白色 */
}
.category-tab.active .category-name {
  font-weight: 700;
  color: #fff;
}

/* 若需要为未选中和选中增加阴影或边框，可在此处扩展 */
/* .category-tab { box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.06); } */
/* 悬浮上传按钮 */
.floating-add {
  position: fixed;
  right: 28rpx;
  bottom: 28rpx;
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: #b6acff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c5ce7;
  box-shadow: 0 12rpx 30rpx rgba(108, 92, 231, 0.28);
  z-index: 999;
}
.floating-add .plus {
  font-size: 100rpx;
  line-height: 1;
  font-weight: 1000;
  transform: translateY(-5rpx);
}

.header-title {
  position: absolute;
  top: 60rpx;
  left: 40rpx;
  font-size: 80rpx;
  z-index: 30;
  color: #fff;
  font-weight: 1000;
}
.header-sub {
  position: absolute;
  top: 160rpx;
  left: 40rpx;
  font-size: 40rpx;
  z-index: 30;
  color: #fff;
}
</style>