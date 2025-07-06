<template>
  <view class="container">
    <!-- Tabs -->
    <view class="tabs">
      <!-- 1. 根据 pageType 显示上装相关的Tabs -->
      <template v-if="pageType === 'top'">
        <view
          class="tab"
          :class="{ active: activeTab === 0 }"
          @click="activeTab = 0"
        >上衣</view>
        <view
          class="tab"
          :class="{ active: activeTab === 1 }"
          @click="activeTab = 1"
        >连体衣</view>
      </template>

      <!-- 2. 根据 pageType 显示下装相关的Tabs -->
      <template v-if="pageType === 'bottom'">
        <view
          class="tab"
          :class="{ active: activeTab === 2 }"
          @click="activeTab = 2"
        >长裤</view>
        <view
          class="tab"
          :class="{ active: activeTab === 3 }"
          @click="activeTab = 3"
        >短裤</view>
        <view
          class="tab"
          :class="{ active: activeTab === 4 }"
          @click="activeTab = 4"
        >裙子</view>
      </template>
    </view>

    <!-- Grid List -->
    <view class="grid">
      <!-- 3. 根据 activeTab 显示不同的列表 -->
      <block v-if="activeTab === 0">
        <view
          class="grid-item"
          v-for="(item, idx) in topsList"
          :key="idx"
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
      </block>
      <block v-else-if="activeTab === 1">
        <view
          class="grid-item"
          v-for="(item, idx) in suitList"
          :key="idx"
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
      </block>
      <block v-else-if="activeTab === 2">
        <view
          class="grid-item"
          v-for="(item, idx) in trousersList"
          :key="idx"
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
      </block>
      <block v-else-if="activeTab === 3">
        <view
          class="grid-item"
          v-for="(item, idx) in shortsList"
          :key="idx"
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
      </block>
      <block v-else-if="activeTab === 4">
        <view
          class="grid-item"
          v-for="(item, idx) in skirtsList"
          :key="idx"
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
      </block>
    </view>

    <!-- 确认选择弹窗 (代码无变化) -->
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
export default {
  data() {
    return {
      activeTab: 0,
      pageType: 'top', // 4. 新增页面类型字段，默认为'top'
      isPopupVisible: false,
      selectedItem: null,
      topsList: [
        { img: '/static/example_pictures/sample1.png', title: '经典复古西装外套', desc: '轻盈百搭 时尚休闲' },
        { img: '/static/example_pictures/sample2.png', title: '简约纯色T恤', desc: '舒适透气 基础必备' },
        { img: '/static/example_pictures/sample3.png', title: '条纹长袖衬衫', desc: '经典条纹 设计感十足' }
      ],
      suitList: [
        { img: '/static/example_pictures/sample4.png', title: '优雅长款连衣裙', desc: '修身显瘦 气质之选' },
        { img: '/static/example_pictures/sample5.png', title: '工装风连体裤', desc: '帅气有型 潮流必备' }
      ],
      // 5. 新增下装数据
      trousersList: [
        { img: '/static/example_pictures/trousers1.png', title: '高腰直筒牛仔裤', desc: '显高显瘦 复古百搭' },
        { img: '/static/example_pictures/trousers2.png', title: '休闲运动卫裤', desc: '舒适柔软 日常必备' }
      ],
      shortsList: [
        { img: '/static/example_pictures/shorts1.png', title: 'A字牛仔短裤', desc: '清爽活力 夏日首选' }
      ],
      skirtsList: [
        { img: '/static/example_pictures/skirt1.png', title: '百褶半身裙', desc: '学院风格 甜美减龄' },
        { img: '/static/example_pictures/skirt2.png', title: '碎花雪纺长裙', desc: '温柔飘逸 度假风情' }
      ]
    };
  },
  // 6. 新增 onLoad 生命周期钩子
  onLoad(options) {
    // 检查URL参数中是否有type
    if (options.type === 'bottom') {
      this.pageType = 'bottom';
      // 如果是下装，默认选中第一个下装Tab（长裤）
      this.activeTab = 2;
    } else {
      // 默认为上装
      this.pageType = 'top';
      this.activeTab = 0;
    }
  },
  methods: {
    // 显示弹窗的方法
    showPopup(item) {
      this.selectedItem = item;
      this.isPopupVisible = true;
    },
    // 关闭弹窗的方法
    closePopup() {
      this.isPopupVisible = false;
      this.selectedItem = null;
    },
    // 确认选择的方法
    confirmSelection() {
      console.log('已确认选择:', this.selectedItem.title);
      const imageUrl = this.selectedItem.img;
      // 修改：使用 this.pageType 来访问 data 中的属性
      if (this.pageType === 'top') {
        // 如果是上装，跳转到确认上装页面
        uni.navigateTo({
          url: `/pages/ConfirmCloth/ConfirmCloth?imageUrl=${encodeURIComponent(imageUrl)}`
        });
      } else {
        // 如果是下装，跳转到确认下装页面
        uni.navigateTo({
          url: `/pages/ConfirmTrousers/ConfirmTrousers?imageUrl=${encodeURIComponent(imageUrl)}`
        });
      }
      this.closePopup();
    }
  }
};
</script>

<style scoped>
/* 样式部分无需修改 */
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
}
.tab {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 30rpx;
  color: #888;
  position: relative;
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

/* 弹窗样式 */
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