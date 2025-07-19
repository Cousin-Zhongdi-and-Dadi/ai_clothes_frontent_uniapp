<template>
  <view class="closet-page">
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
          <!-- 商品列表使用网格布局 -->
          <view class="grid-container">
            <!-- 上传按钮 -->
            <view
              class="add-card"
              @click="handleAdd"
            >
              <view class="add-icon-plus">+</view>
              <text class="add-text">上传到我的衣橱</text>
            </view>

            <!-- 商品列表 -->
            <view
              v-for="item in closetItems"
              :key="item.id"
              class="goods-card"
              @longpress="handleLongPress(item)"
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

          <!-- 新增：空状态提示 -->
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
  </view>
</template>

<script>
// 1. 导入封装的 request 函数和 apiConfig
import request from '@/utils/request.js';
import apiConfig from '@/utils/api.js';

export default {
  name: 'Closet',
  data() {
    return {
      // 1. 修改：分类数据默认为空，将由API填充
      categories: [],
      // 2. 修改：当前选中的分类ID，初始为null
      activeCategory: null,
      showModal: false,
      closetItems: [],
      page: 1,
      pageSize: 10,
      isLoading: false,
      hasMore: true,
      isInitialLoading: true, // 新增：初始加载状态
      isGuest: false // 新增：是否为游客模式
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
  // 3. 修改：页面加载时，首先获取分类
  onLoad() {
    const token = uni.getStorageSync('token');
    this.isGuest = !token;
    this.initData();
    uni.$on('closet-refresh', () => {
      this.getClosetItems(true);
    });
  },
  // 新增：页面卸载时，移除事件监听
  onUnload() {
    uni.$off('closet-refresh');
  },
  methods: {
    // 游客模式静态分类和衣橱数据
    getMockCategories() {
      return [
        { id: 1, name: '上衣' },
        { id: 2, name: '裤子' }
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
    // 0. 改造 initData
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
        // 如果获取到分类，则默认加载第一个分类的商品
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

    // 1. 改造 getCategories (修正API端点)
    async getCategories() {
      if (this.isGuest) {
        this.categories = this.getMockCategories();
        return;
      }
      try {
        const data = await request({
          url: `${apiConfig.BASE_URL}/address/getCategory`, // 修正API端点
          method: 'GET',
        });
        this.categories = data
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(item => ({ id: item.id, name: item.categoryName }));
      } catch (error) {
        console.error("getCategories failed:", error);
      }
    },

    // 2. 改造 getClosetItems (修正API调用方式)
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
        // --- 开始修改：根据API文档，将 categoryId 作为 Path 参数传递 ---
        const data = await request({
          url: `${apiConfig.BASE_URL}/address/getClothes/${this.activeCategory}`, // categoryId in path
          method: 'GET',
          data: {
            // Query参数只保留 page 和 pageSize
            page: this.page,
            pageSize: this.pageSize
          }
        });
        // --- 结束修改 ---

        // 优化数据映射，显示更有意义的信息
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

    // 3. 改造 deleteClosetItem (修正API端点)
    async deleteClosetItem(clothesId) {
      uni.showLoading({ title: '正在删除...' });
      try {
        await request({
          url: `${apiConfig.BASE_URL}/closet/delete/${clothesId}`, // 修正API端点
          method: 'DELETE',
        });
        uni.showToast({ title: '删除成功', icon: 'success' });
        this.closetItems = this.closetItems.filter(item => item.id !== clothesId);
      } catch (error) {
        console.error("deleteClosetItem failed:", error);
      } finally {
        uni.hideLoading();
      }
    },

    // 4. 改造 handleUpload
    async handleUpload(sourceType) {
      this.closeModal();
      try {
        // --- 开始修改：使用解构赋值正确获取API返回值 ---
        const [err, chooseRes] = await uni.chooseImage({
          count: 1,
          sourceType: sourceType,
        });

        // 优先处理错误
        if (err) {
          // 捕获到错误，例如用户拒绝授权
          console.error("uni.chooseImage failed:", err);
          // 可以根据 err.errMsg 给用户更明确的提示
          if (err.errMsg.includes('cancel')) {
            console.log('User cancelled image selection.');
          } else {
            uni.showToast({ title: '选择图片失败', icon: 'none' });
          }
          return; // 终止后续操作
        }
        
        // 确保用户确实选择了图片
        if (chooseRes && chooseRes.tempFilePaths && chooseRes.tempFilePaths.length > 0) {
          const tempFilePath = chooseRes.tempFilePaths[0];
          uni.navigateTo({
            url: `/pages/ConfirmFromUserUpload/ConfirmFromUserUpload?tempFilePath=${tempFilePath}`
          });
        } else {
          // 虽然没有err，但也没有返回图片路径，也视为取消
          console.log('User cancelled image selection (no file path returned).');
        }
        // --- 结束修改 ---

      } catch (error) {
        // 一般的JS语法错误等会进入这里
        console.error("An unexpected error occurred in handleUpload:", error);
      }
    },

    // 5. 简化事件处理函数
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
      this.getClosetItems(true);
    },
    handleScrollToLower() {
      if (!this.isLoading && this.hasMore) {
        this.getClosetItems();
      }
    },

    // 无需修改的本地方法
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
      // --- 开始修改 ---
      // 跳转到素材库，并告知来源是衣橱
      uni.navigateTo({
        url: '/pages/ResourcesSelection/ResourcesSelection?source=closet'
      });
      // --- 结束修改 ---
      this.closeModal();
    },
  }
};
</script>

<style scoped>
.closet-page {
  /* 让页面容器高度等于屏幕高度，并使用 flex 布局 */
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden; /* 防止 main-content 自身滚动 */
}
.sidebar {
  /* width: 180rpx; 设置一个合适的固定宽度 */
  flex: 1;
  width: 40%;
  /* flex-shrink: 0; 关键：防止被右侧内容挤压 */
  background-color: #f8f8f8;
  padding-top: 20rpx;
  overflow-y: auto; /* 如果分类过多，允许侧边栏内部滚动 */
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
  /* 不要加 overflow: hidden; 否则会裁剪右侧内容 */
}
/* 这是内部 scroll-view 的样式 */
.scroll-view-container {
  height: 100%;
  padding: 20rpx;
  box-sizing: border-box;
}
/* 网格容器 */
.grid-container {
  width: 80%; /* 保持100%，让内容不超出 scroll-view */
  display: grid;
  grid-template-columns: repeat(2, 280rpx); /* 两列布局 */
  gap: 20rpx; /* 卡片间距 */
  box-sizing: border-box; /* 确保 padding 不影响宽度 */
  padding-bottom: 20rpx; /* 确保底部有足够的空间 */
}
.goods-card {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.add-card {
  display: flex;
  flex-direction: column;
  height: 320rpx;
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
.add-text {
  margin-top: 20rpx;
  font-size: 24rpx;
  color: #6c5ce7;
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
/* 弹窗样式 */
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
  border-radius: 45rpx; /* half of height for pill shape */
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
/* 新增：自定义加载状态样式 */
.load-more-status {
  text-align: center;
  color: #999;
  padding: 20rpx 0;
  font-size: 24rpx;
  width: 100%;
}
</style>