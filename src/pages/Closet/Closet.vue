<template>
  <view class="closet-page">
    <view class="main-content">
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
      <!-- 新增一个包裹层，并把 .content-grid 类名移到这里 -->
      <view class="content-grid">
        <scroll-view
          scroll-y
          class="scroll-view-container"
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
        </scroll-view>
      </view>
    </view>

    <!-- 悬浮客服按钮 (移到 main-content 外部) -->
    <customer-service />

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
            素材库选择
          </button>
        </view>
      </view>
    </view>

  </view>
</template>

<script>
import CustomerService from '@/components/CustomerService/CustomerService.vue';
export default {
  components: { CustomerService },
  name: 'Closet',
  data() {
    return {
      // 左侧分类数据
      categories: [
        { id: 1, name: '上衣' },
        { id: 2, name: '下装' },
        { id: 3, name: '连体衣' },
        { id: 4, name: '鞋袜' },
        { id: 5, name: '包包' },
        { id: 6, name: '配饰' }
      ],
      // 当前选中的分类
      activeCategory: 1,
      // 控制弹窗显示
      showModal: false,
      // 衣橱商品数据
      closetItems: [
        { id: 101, image: '/static/example_pictures/sample2.png', name: 'New Balance NB 530单层', desc: '经典复古 网布织物' },
        { id: 102, image: '/static/example_pictures/sample3.png', name: 'New Balance NB 530单层', desc: '经典复古 网布织物' },
        { id: 103, image: '/static/example_pictures/sample2.png', name: 'New Balance NB 530单层', desc: '经典复古 网布织物' },
        { id: 104, image: '/static/example_pictures/sample3.png', name: 'New Balance NB 530单层', desc: '经典复古 网布织物' },
        { id: 105, image: '/static/example_pictures/sample2.png', name: 'New Balance NB 530单层', desc: '经典复古 网布织物' },
        { id: 106, image: '/static/example_pictures/sample3.png', name: 'New Balance NB 530单层', desc: '经典复古 网布织物' },
      ]
    };
  },
  methods: {
    // 切换分类
    selectCategory(id) {
      this.activeCategory = id;
      // 在这里可以根据分类ID重新从后端获取商品数据
    },
    // 点击上传按钮时触发
    handleAdd() {
      // 改为打开弹窗
      this.showModal = true;
    },
    // 关闭弹窗
    closeModal() {
      this.showModal = false;
    },
    // 从相册上传
    uploadFromAlbum() {
      console.log('从相册上传');
      this.closeModal();
    },
    // 拍照上传
    uploadFromCamera() {
      console.log('拍照上传');
      this.closeModal();
    },
    // 从素材库选择
    selectFromLibrary() {
      console.log('从素材库选择');
      // 在这里可以添加跳转到素材库页面的逻辑
      this.closeModal();
    }
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
</style>