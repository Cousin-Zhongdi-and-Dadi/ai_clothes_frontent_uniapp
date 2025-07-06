<template>
  <view class="shop-page">
    <!-- 修改：分类标签栏改为动态生成 -->
    <view class="shop-tabs">
      <text
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab', { active: activeTabId === tab.id }]"
        @click="changeTab(tab)"
      >
        {{ tab.name }}
      </text>
    </view>
    <!-- 商品流式两列布局 -->
    <view class="goods-list">
      <view
        class="goods-item"
        v-for="item in goods"
        :key="item.id"
        @click="goToDetail(item.id)"
      >
        <image
          :src="item.image"
          class="goods-image"
          mode="aspectFill"
        />
        <view class="goods-info">
          <text class="goods-name">{{ item.name }}</text>
          <!-- 修改：使用动态商品描述 -->
          <text class="goods-desc">{{ item.desc }}</text>
        </view>
        <text class="goods-price">￥{{ item.price }}</text>
      </view>
    </view>

    <!-- [删除] 以下是使用了 uni-ui 的加载状态提示，将被移除 -->
    <!-- 
    <view class="loading-status">
      <uni-load-more
        v-if="isLoading"
        status="loading"
        content-text="正在加载..."
      ></uni-load-more>
      <uni-load-more
        v-if="!hasMore && goods.length > 0"
        status="noMore"
        content-text="没有更多商品了"
      ></uni-load-more>
    </view>
    -->
  </view>
</template>

<script>
// 1. 导入封装的 request 函数和 apiConfig
import request from '@/utils/request.js';
import apiConfig from '@/utils/api.js';

export default {
  name: 'ShopPage',
  data() {
    return {
      tabs: [],
      activeTabId: null,
      goods: [],
      page: 1,
      pageSize: 10,
      hasMore: true,
      isLoading: false,
    };
  },
  // 5. 修改：onLoad 中并行获取分类和商品，提升加载速度
  async onLoad() {
    await this.fetchCategories(); // 必须先获取分类
    this.refresh(); // 然后根据默认分类刷新商品
  },
  onReachBottom() {
    this.fetchGoods(true);
  },
  onPullDownRefresh() {
    this.refresh().then(() => {
      uni.stopPullDownRefresh();
    });
  },
  methods: {
    goToDetail(id) {
      uni.navigateTo({
        url: `/pages/GoodsDetail/GoodsDetail?id=${id}`,
      });
    },
    // 2. 改造 fetchCategories 方法
    async fetchCategories() {
      try {
        const data = await request({
          url: `${apiConfig.BASE_URL}/mall/getCategory`,
          method: 'GET',
        });
        
        const categories = data
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(cat => ({
            id: cat.id,
            name: cat.categoryName,
          }));
        
        this.tabs = [{ name: '推荐', id: null }, ...categories];
      } catch (error) {
        console.error("fetchCategories failed:", error);
        // 错误提示已由 request 函数处理，这里只做降级处理
        if (this.tabs.length === 0) {
          this.tabs = [{ name: '推荐', id: null }];
        }
      }
    },
    changeTab(tab) {
      if (this.activeTabId === tab.id) return;
      this.activeTabId = tab.id;
      this.refresh();
    },
    // 3. 改造 fetchGoods 方法
    async fetchGoods(loadMore = false) {
      if (this.isLoading || (!loadMore && !this.hasMore)) {
        return;
      }
      this.isLoading = true;

      let url = '';
      const params = { page: this.page, pageSize: this.pageSize };

      if (this.activeTabId === null) {
        url = `${apiConfig.BASE_URL}/mall/getRecommended`;
      } else {
        url = `${apiConfig.BASE_URL}/mall/getProductByTypeId/${this.activeTabId}`;
      }

      try {
        const data = await request({
          url: url,
          method: 'GET',
          data: params,
        });

        const newItems = data.map(item => ({
          id: item.id,
          name: item.productName,
          desc: item.description,
          image: item.imageGif,
          price: item.price,
        }));

        this.goods = loadMore ? [...this.goods, ...newItems] : newItems;
        this.hasMore = newItems.length === this.pageSize;
        if (this.hasMore) {
          this.page++;
        }
      } catch (error) {
        console.error("fetchGoods failed:", error);
        // 错误提示已由 request 函数处理
      } finally {
        this.isLoading = false;
      }
    },
    // 4. refresh 方法保持不变，但现在调用的是改造后的 fetchGoods
    async refresh() {
      this.page = 1;
      this.goods = [];
      this.hasMore = true;
      await this.fetchGoods();
    },
  },
};
</script>

<style scoped>
.shop-page {
  background: #fafafa;
  min-height: 100vh;
  padding-bottom: 120rpx;
}
.shop-header {
  padding: 30rpx 0 10rpx 0;
  text-align: center;
  background: #fff;
}
.shop-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #222;
}
.shop-tabs {
  display: flex;
  flex-direction: row;
  background: #fff;
  padding: 0 20rpx;
  border-bottom: 1rpx solid #eee;
  overflow-x: auto;
}
.tab {
  font-size: 28rpx;
  color: #999;
  margin-right: 32rpx;
  padding: 20rpx 0;
}
.tab.active {
  color: #6753e7;
  font-weight: bold;
  border-bottom: 4rpx solid #6753e7;
}
.goods-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 20rpx 20rpx 0 20rpx;
}
.goods-item {
  width: 47%;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 20rpx;
}
.goods-image {
  width: 100%;
  height: 240rpx;
  border-radius: 16rpx 16rpx 0 0;
  object-fit: cover;
}
.goods-info {
  width: 90%;
  margin: 16rpx 0 0 0;
}
.goods-name {
  font-size: 26rpx;
  color: #222;
  font-weight: 500;
  display: block;
}
.goods-desc {
  font-size: 22rpx;
  color: #888;
  margin-top: 4rpx;
  display: block;
}
.goods-price {
  color: #6753e7;
  font-size: 28rpx;
  font-weight: bold;
  margin-top: 12rpx;
}
/* [删除] 以下是加载状态的样式，将被移除 */
/* 
.loading-status {
  padding: 20rpx 0;
  width: 100%;
  text-align: center;
}
*/
</style>