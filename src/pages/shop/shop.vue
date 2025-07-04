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
import apiConfig from '@/utils/api.js';

export default {
  name: 'ShopPage',
  data() {
    return {
      // 1. 修改：tabs 初始化为空数组，将从API动态获取
      tabs: [],
      activeTabId: null, // 默认选中“推荐”
      // 分页相关数据
      goods: [],
      page: 1,
      pageSize: 10,
      hasMore: true,
      isLoading: false,
    };
  },
  methods: {
    goToDetail(id) {
      uni.navigateTo({
        url: `/pages/GoodsDetail/GoodsDetail?id=${id}`,
      });
    },
    // 2. 新增：从后端获取所有商品分类
    async fetchCategories() {
      try {
        const res = await uni.request({
          url: `${apiConfig.BASE_URL}/mall/getCategory`, // 获取分类的API端点
          method: 'GET',
        });

        if (res.statusCode === 200 && res.data && /*res.data.code === 0 &&*/ Array.isArray(res.data.data)) {
          // 映射API返回的数据到前端需要的格式
          const categories = res.data.data
            .sort((a, b) => a.sortOrder - b.sortOrder) // 根据 sortOrder 排序
            .map(cat => ({
              id: cat.id,
              name: cat.categoryName,
            }));
          
          // 将固定的“推荐”标签与从API获取的分类合并
          this.tabs = [
            { name: '推荐', id: null },
            ...categories
          ];
        } else {
          throw new Error(res.data.message || '加载分类失败');
        }
      } catch (e) {
        uni.showToast({ title: e.message || '网络请求异常', icon: 'none' });
        // 如果API请求失败，提供一个默认的“推荐”标签以保证页面可用性
        if (this.tabs.length === 0) {
            this.tabs = [{ name: '推荐', id: null }];
        }
      }
    },
    changeTab(tab) {
      // 如果点击的是当前已激活的标签，则不执行任何操作
      if (this.activeTabId === tab.id) {
        return;
      }
      this.activeTabId = tab.id;
      // 调用 refresh 方法重置列表并加载新数据
      this.refresh();
    },
    // 3. 修改：fetchGoods 方法以支持不同API
    async fetchGoods(loadMore = false) {
      if (this.isLoading || !this.hasMore) {
        return;
      }
      this.isLoading = true;

      // 根据 activeTabId 动态构建 URL 和参数
      let url = '';
      const params = { page: this.page, pageSize: this.pageSize };

      if (this.activeTabId === null) {
        // 调用推荐商品 API
        url = `${apiConfig.BASE_URL}/mall/getRecommended`;
      } else {
        // 调用分类商品 API
        url = `${apiConfig.BASE_URL}/mall/getProductByTypeId/${this.activeTabId}`;
      }

      try {
        const res = await uni.request({
          url: url,
          method: 'GET',
          data: params,
        });

        if (res.statusCode === 200 && res.data /*&& res.data.code === 0*/ && Array.isArray(res.data.data)) {
          // 映射API返回的数据到前端需要的格式
          const newItems = res.data.data.map(item => ({
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
        } else {
          throw new Error(res.data.message || '加载商品失败');
        }
      } catch (e) {
        uni.showToast({ title: e.message || '网络请求异常', icon: 'none' });
      } finally {
        this.isLoading = false;
      }
    },
    // 4. refresh 方法现在会为当前激活的 tab 加载数据
    async refresh() {
      this.page = 1;
      this.goods = [];
      this.hasMore = true;
      await this.fetchGoods();
    },
  },
  // 4. 修改：onLoad 中同时获取分类和商品
  onLoad() {
    this.fetchCategories(); // 获取分类
    this.fetchGoods();      // 获取默认的推荐商品
  },
  onReachBottom() {
    this.fetchGoods(true); // 触底时加载更多
  },
  onPullDownRefresh() {
    this.refresh().then(() => {
      uni.stopPullDownRefresh(); // 结束下拉刷新动画
    });
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